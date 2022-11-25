from threading import Thread
import asyncio
import abc

class AsyncThread(Thread):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

    @abc.abstractmethod
    async def async_run(self, *args, **kwargs):
        pass

    def run(self, *args, **kwargs):
        # loop = asyncio.new_event_loop()
        # asyncio.set_event_loop(loop)

        # loop.run_until_complete(self.async_run(*args, **kwargs))
        # loop.close()
        asyncio.run(self.async_run(*args, **kwargs))

