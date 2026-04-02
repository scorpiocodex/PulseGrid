from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.metric import Metric
from app.core.logging import log


MIN_WINDOW = 10
Z_SCORE_THRESHOLD = 3.0
ZERO_STD_ANOMALY_SCORE = 10.0


async def get_recent_metrics(
    session: AsyncSession, service_id: str, metric_type: str, limit: int = 30
) -> list[Metric]:
    result = await session.execute(
        select(Metric)
        .where(Metric.service_id == service_id)
        .where(Metric.metric_type == metric_type)
        .order_by(Metric.timestamp.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


def calculate_stats(values: list[float]) -> tuple[float, float]:
    if not values:
        return 0.0, 0.0

    n = len(values)
    mean = sum(values) / n

    variance = sum((x - mean) ** 2 for x in values) / n
    std_dev = variance**0.5

    return mean, std_dev


def calculate_z_score(value: float, mean: float, std_dev: float) -> float:
    if std_dev == 0:
        if value == mean:
            return 0.0
        return ZERO_STD_ANOMALY_SCORE
    return (value - mean) / std_dev


def detect_anomaly(value: float, values: list[float]) -> tuple[bool, float]:
    if len(values) < MIN_WINDOW:
        return False, 0.0

    mean, std_dev = calculate_stats(values)
    z_score = calculate_z_score(value, mean, std_dev)

    if std_dev == 0 and value != mean:
        log.warning(
            f"Constant values detected (std_dev=0). "
            f"Value={value}, mean={mean:.2f}. Treating as anomaly."
        )

    is_anomaly = abs(z_score) >= Z_SCORE_THRESHOLD

    return is_anomaly, z_score


def get_severity(z_score: float) -> str:
    abs_z = abs(z_score)
    if abs_z >= 5:
        return "high"
    elif abs_z >= 3:
        return "medium"
    return "low"
