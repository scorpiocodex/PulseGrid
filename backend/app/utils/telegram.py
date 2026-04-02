from datetime import datetime
import httpx
from app.core.config import get_settings
from app.core.logging import log


async def send_telegram_alert(message: str) -> bool:
    settings = get_settings()

    token_present = bool(settings.TELEGRAM_BOT_TOKEN)
    chat_id_present = bool(settings.TELEGRAM_CHAT_ID)

    if not token_present or not chat_id_present:
        log.warning(
            f"Telegram not configured: token_present={token_present}, chat_id_present={chat_id_present}"
        )
        return False

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"

    log.info(f"Sending Telegram alert to chat_id={settings.TELEGRAM_CHAT_ID}")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "chat_id": settings.TELEGRAM_CHAT_ID,
                    "text": message,
                    "parse_mode": "Markdown",
                },
                timeout=10.0,
            )

        log.info(
            f"Telegram response: status={response.status_code}, body={response.text}"
        )

        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("ok") is True:
                    log.info("Telegram alert sent successfully")
                    return True
                else:
                    log.error(f"Telegram API error: {data}")
                    return False
            except Exception:
                log.error(f"Failed to parse Telegram response: {response.text}")
                return False
        else:
            log.error(f"Telegram alert failed: HTTP {response.status_code}")
            return False

    except httpx.TimeoutException:
        log.error("Telegram alert failed: timeout")
        return False
    except httpx.RequestError as e:
        log.error(f"Telegram alert failed: request error - {e}")
        return False
    except Exception as e:
        log.error(f"Telegram alert failed: {type(e).__name__} - {e}")
        return False


def format_anomaly_alert(
    service: str, metric_type: str, value: float, z_score: float, severity: str
) -> str:
    emoji = "🔴" if severity == "high" else "🟡"
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    return (
        f"{emoji} *PulseGrid Alert*\n\n"
        f"*Service:* `{service}`\n"
        f"*Metric:* `{metric_type}`\n"
        f"*Value:* `{value}`\n"
        f"*Z-Score:* `{z_score:.2f}`\n"
        f"*Severity:* `{severity.upper()}`\n"
        f"\n"
        f"🕒 *Time:* `{timestamp}`"
    )
