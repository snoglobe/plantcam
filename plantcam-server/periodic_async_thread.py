import time
import asyncio
from async_thread import AsyncThread

class PeriodicAsyncThread(AsyncThread):
    def __init__(self, period, *args, **kwargs):
        self.period = period
        super().__init__(*args, **kwargs)
        self.async_run = self.periodic()(self.async_run)

    def periodic(self):
        def scheduler(fcn):
            async def wrapper(*args, **kwargs):
                def g_tick():
                    t = time.time()
                    count = 0
                    while True:
                        count += 1
                        yield max(t + count * self.period - time.time(), 0)
                g = g_tick()

                while True:
                    # print('periodic', time.time())
                    asyncio.create_task(fcn(*args, **kwargs))
                    await asyncio.sleep(next(g))
            return wrapper
        return scheduler