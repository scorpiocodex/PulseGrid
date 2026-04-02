from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.logging import log
from app.api.routes import health, metrics
from app.db.init_db import init_db

settings = get_settings()

collector_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global collector_task

    await init_db()
    log.info(f"{settings.APP_NAME} v{settings.APP_VERSION} starting up")

    token_present = bool(settings.TELEGRAM_BOT_TOKEN)
    chat_id_present = bool(settings.TELEGRAM_CHAT_ID)
    log.info(
        f"Telegram config loaded: token_present={token_present}, chat_id_present={chat_id_present}"
    )

    if settings.COLLECTOR_ENABLED:
        from app.services.collector import start_collector

        collector_task = await start_collector()
        if collector_task:
            log.info("Background metric collector is running")

    yield

    if collector_task and not collector_task.done():
        collector_task.cancel()
        try:
            await collector_task
        except Exception:
            pass
        log.info("Background metric collector stopped")

    log.info(f"{settings.APP_NAME} shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(metrics.router, prefix="/api/v1", tags=["metrics"])
