import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.base import Base


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    metric_type = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)

    service = relationship("Service", back_populates="metrics")
    anomalies = relationship(
        "Anomaly", back_populates="metric", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index(
            "ix_metrics_service_type_timestamp",
            "service_id",
            "metric_type",
            "timestamp",
        ),
    )
