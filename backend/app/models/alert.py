import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    anomaly_id = Column(String(36), ForeignKey("anomalies.id"), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    sent_at = Column(DateTime, nullable=True)
