import logging
import sys
from app.core.config import get_settings

settings = get_settings()


def setup_logging() -> logging.Logger:
    logger = logging.getLogger("pulsegrid")

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    return logger


log = setup_logging()
