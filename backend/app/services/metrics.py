from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.service import Service
from app.models.metric import Metric
from app.core.logging import log


async def get_or_create_service(db: AsyncSession, service_name: str) -> Service:
    """Get existing service or create new one."""
    result = await db.execute(select(Service).where(Service.name == service_name))
    service = result.scalar_one_or_none()

    if not service:
        service = Service(name=service_name)
        db.add(service)
        await db.flush()
        log.info(f"Collector created service: {service_name}")

    service.last_seen = datetime.utcnow()
    return service


async def create_metric(
    db: AsyncSession,
    service_name: str,
    metric_type: str,
    value: float,
    timestamp: datetime | None = None,
) -> Metric:
    """
    Create a new metric for the given service.

    Args:
        db: Database session
        service_name: Name of the service
        metric_type: Type of metric (cpu, memory, disk)
        value: Metric value
        timestamp: Optional timestamp (defaults to now)

    Returns:
        Created Metric instance
    """
    service = await get_or_create_service(db, service_name)

    metric = Metric(
        service_id=service.id,
        metric_type=metric_type,
        value=float(value),
        timestamp=timestamp or datetime.utcnow(),
    )
    db.add(metric)
    await db.flush()

    return metric
