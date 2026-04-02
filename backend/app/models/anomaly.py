import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_id = Column(String(36), ForeignKey("metrics.id"), nullable=False)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    z_score = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False, default="medium")
    detected_at = Column(DateTime, default=datetime.utcnow)

    metric = relationship("Metric", back_populates="anomalies")
