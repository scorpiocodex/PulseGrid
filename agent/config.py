from pydantic_settings import BaseSettings


class AgentConfig(BaseSettings):
    BACKEND_URL: str = "http://localhost:8000/api/v1"
    COLLECTION_INTERVAL: int = 5
    SERVICE_NAME: str = "default"
    RETRY_ATTEMPTS: int = 3
    RETRY_DELAY: float = 1.0

    class Config:
        env_file = ".env"
        case_sensitive = True


config = AgentConfig()
