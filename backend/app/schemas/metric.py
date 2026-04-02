from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field


class MetricType(str, Enum):
    CPU = "cpu"
    MEMORY = "memory"
    DISK = "disk"


class MetricCreate(BaseModel):
    service_name: str = Field(..., min_length=1, max_length=255)
    metric_type: MetricType
    value: float = Field(..., ge=0)
    timestamp: Optional[datetime] = None


class MetricResponse(BaseModel):
    id: str
    service_name: str
    metric_type: str
    value: float
    timestamp: datetime

    class Config:
        from_attributes = True


class MetricsListResponse(BaseModel):
    metrics: list[MetricResponse]
    total: int
