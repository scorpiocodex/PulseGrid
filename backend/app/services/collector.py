"""
Background metric collector for PulseGrid.

Continuously collects system metrics (CPU, memory, disk) and stores them
directly to the database without using HTTP calls.
"""

import asyncio
import random
from app.core.config import get_settings
from app.core.logging import log
from app.db.session import AsyncSessionLocal
from app.services.metrics import create_metric

settings = get_settings()

MIN_INTERVAL = 1
DEFAULT_INTERVAL = 2


def get_system_metrics() -> dict[str, float]:
    """
    Collect current system metrics using psutil.

    Returns:
        Dictionary with cpu, memory, and disk metrics.
    """
    try:
        import psutil

        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage("/").percent

        return {
            "cpu": round(float(cpu), 2),
            "memory": round(float(memory), 2),
            "disk": round(float(disk), 2),
        }
    except ImportError:
        log.error("psutil not installed, collector cannot run")
        return {}
    except AttributeError as e:
        log.error(f"psutil API error: {e}. Check psutil version.")
        return {}
    except Exception as e:
        log.error(f"Failed to collect system metrics: {e}")
        return {}


async def store_metric(service_name: str, metric_type: str, value: float) -> bool:
    """
    Store a single metric to the database.

    Returns:
        True if successful, False otherwise.
    """
    try:
        async with AsyncSessionLocal() as session:
            await create_metric(
                db=session,
                service_name=service_name,
                metric_type=metric_type,
                value=value,
            )
            await session.commit()
            return True
    except Exception as e:
        log.error(f"Failed to store metric {metric_type}={value}: {e}")
        return False


async def collect_metrics_loop() -> None:
    """
    Background task that continuously collects system metrics.

    Runs indefinitely, collecting CPU, memory, and disk metrics
    at configured intervals and storing them to the database.
    """
    if not settings.COLLECTOR_ENABLED:
        log.info("Metric collector is disabled via COLLECTOR_ENABLED config")
        return

    service_name = settings.COLLECTOR_SERVICE_NAME
    interval = settings.COLLECTOR_INTERVAL

    if interval < MIN_INTERVAL:
        log.warning(
            f"COLLECTOR_INTERVAL ({interval}s) is below minimum ({MIN_INTERVAL}s), "
            f"using default ({DEFAULT_INTERVAL}s)"
        )
        interval = DEFAULT_INTERVAL

    log.info(f"Collector started: service={service_name}, interval={interval}s")

    cycle_count = 0
    error_streak = 0
    max_error_streak = 5
    error_sleep = 1.0

    while True:
        try:
            metrics = get_system_metrics()

            if metrics:
                success_count = 0
                for metric_type, value in metrics.items():
                    if await store_metric(service_name, metric_type, value):
                        success_count += 1

                cycle_count += 1
                error_streak = 0

                log.debug(
                    f"Collected: cpu={metrics.get('cpu')}, "
                    f"memory={metrics.get('memory')}, "
                    f"disk={metrics.get('disk')} "
                    f"({success_count}/{len(metrics)} stored)"
                )

                if cycle_count % 15 == 0:
                    log.info(
                        f"Collector heartbeat: cycle={cycle_count}, "
                        f"total_stored={success_count * cycle_count}"
                    )
            else:
                error_streak += 1
                log.warning(
                    f"Collector received empty metrics, error_streak={error_streak}"
                )

            jitter = random.uniform(-0.1, 0.1)
            sleep_time = max(0.5, interval + jitter)
            await asyncio.sleep(sleep_time)

        except asyncio.CancelledError:
            log.info("Metric collector cancelled")
            break
        except Exception as e:
            error_streak += 1
            log.error(f"Collector loop error: {e}, error_streak={error_streak}")

            if error_streak >= max_error_streak:
                log.error(
                    f"Collector exceeded max error streak ({max_error_streak}), "
                    f"entering extended cooldown"
                )
                await asyncio.sleep(5.0)
            else:
                await asyncio.sleep(error_sleep)


async def start_collector() -> asyncio.Task | None:
    """
    Start the background metric collector as a task.

    Returns:
        asyncio.Task if collector is enabled, None otherwise.
    """
    if not settings.COLLECTOR_ENABLED:
        log.info("Collector disabled, not starting background task")
        return None

    task = asyncio.create_task(collect_metrics_loop())
    log.info("Collector task created")
    return task
