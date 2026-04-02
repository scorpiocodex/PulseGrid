from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "PulseGrid"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/pulsegrid"
    )
    REDIS_URL: str = "redis://localhost:6379/0"

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    ANOMALY_THRESHOLD: float = 3.0
    ANOMALY_MIN_WINDOW: int = 10
    ALERT_COOLDOWN_SECONDS: int = 300

    METRICS_RETENTION_DAYS: int = 30

    COLLECTOR_ENABLED: bool = True
    COLLECTOR_INTERVAL: int = 2
    COLLECTOR_SERVICE_NAME: str = "system"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
