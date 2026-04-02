import time
import asyncio
from agent.config import config


class MetricCollector:
    def __init__(self):
        self.backend_url = config.BACKEND_URL
        self.interval = config.COLLECTION_INTERVAL
        self.service_name = config.SERVICE_NAME
        self.retry_queue = []

    def collect(self):
        raise NotImplementedError

    async def send(self, metric_data):
        raise NotImplementedError

    async def run(self):
        while True:
            metrics = self.collect()
            for metric in metrics:
                await self.send(metric)
            await asyncio.sleep(self.interval)


if __name__ == "__main__":
    collector = MetricCollector()
    asyncio.run(collector.run())
