from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.service import Service
from app.models.metric import Metric
from app.models.anomaly import Anomaly
from app.schemas.metric import MetricCreate, MetricResponse, MetricsListResponse
from app.core.logging import log
from app.utils.anomaly import (
    get_recent_metrics,
    detect_anomaly,
    get_severity,
    calculate_stats,
    MIN_WINDOW,
)
from app.utils.telegram import send_telegram_alert, format_anomaly_alert

router = APIRouter()


@router.post("/metrics", response_model=dict)
async def create_metric(metric_data: MetricCreate, db: AsyncSession = Depends(get_db)):
    try:
        service_result = await db.execute(
            select(Service).where(Service.name == metric_data.service_name)
        )
        service = service_result.scalar_one_or_none()

        if not service:
            service = Service(name=metric_data.service_name)
            db.add(service)
            await db.flush()
            log.info(f"Created new service: {metric_data.service_name}")

        service.last_seen = datetime.utcnow()

        metric = Metric(
            service_id=service.id,
            metric_type=metric_data.metric_type.value,
            value=metric_data.value,
            timestamp=metric_data.timestamp or datetime.utcnow(),
        )
        db.add(metric)
        await db.commit()
        await db.refresh(metric)

        log.info(
            f"Metric stored: service={metric_data.service_name}, "
            f"type={metric_data.metric_type.value}, value={metric_data.value}"
        )

        await check_and_store_anomaly(db, metric, service.id, metric_data.service_name)

        return {"status": "success", "metric_id": metric.id}
    except Exception as e:
        await db.rollback()
        log.error(f"Failed to store metric: {e}")
        raise HTTPException(status_code=500, detail="Failed to store metric")


async def check_and_store_anomaly(
    db: AsyncSession, metric: Metric, service_id: str, service_name: str
) -> None:
    recent = await get_recent_metrics(db, service_id, metric.metric_type, limit=30)
    values = [m.value for m in recent]

    if len(values) < MIN_WINDOW:
        log.debug(
            f"Anomaly check skipped: service={service_name}, "
            f"metric={metric.metric_type}, values={len(values)} < MIN_WINDOW({MIN_WINDOW})"
        )
        return

    mean, std_dev = calculate_stats(values)
    is_anomaly, z_score = detect_anomaly(metric.value, values)

    log.info(
        f"Anomaly check: service={service_name}, metric={metric.metric_type}, "
        f"values={len(values)}, mean={mean:.2f}, std={std_dev:.2f}, "
        f"current={metric.value}, z={z_score:.2f}, anomaly={is_anomaly}"
    )

    if is_anomaly:
        severity = get_severity(z_score)
        anomaly = Anomaly(
            metric_id=metric.id,
            service_id=service_id,
            z_score=z_score,
            severity=severity,
        )
        db.add(anomaly)
        await db.commit()
        log.info(
            f"Anomaly stored: service={service_name}, "
            f"metric={metric.metric_type}, z_score={z_score:.2f}, severity={severity}"
        )

        message = format_anomaly_alert(
            service_name, metric.metric_type, metric.value, z_score, severity
        )
        success = await send_telegram_alert(message)
        if success:
            log.info(
                f"Telegram alert sent: service={service_name}, metric={metric.metric_type}"
            )
        else:
            log.warning(
                f"Telegram alert failed: service={service_name}, metric={metric.metric_type}"
            )


@router.get("/metrics", response_model=MetricsListResponse)
async def get_metrics(
    service_name: Optional[str] = Query(None),
    metric_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    try:
        query = select(Metric, Service.name).join(
            Service, Metric.service_id == Service.id
        )

        if service_name:
            query = query.where(Service.name == service_name)
        if metric_type:
            query = query.where(Metric.metric_type == metric_type)

        query = query.order_by(Metric.timestamp.desc()).limit(limit)

        result = await db.execute(query)
        rows = result.all()

        metrics = [
            MetricResponse(
                id=metric.id,
                service_name=service_name_val,
                metric_type=metric.metric_type,
                value=metric.value,
                timestamp=metric.timestamp,
            )
            for metric, service_name_val in rows
        ]

        return MetricsListResponse(metrics=metrics, total=len(metrics))
    except Exception as e:
        log.error(f"Failed to fetch metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch metrics")
