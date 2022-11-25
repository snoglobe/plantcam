from flask_socketio import SocketIO
import flask
import pygame
import pygame.camera
import base64
from io import StringIO, BytesIO

from periodic_async_thread import PeriodicAsyncThread

server = flask.Flask(
    __name__,
    static_url_path='',
    static_folder='../plantcam/dist'
)

@server.route('/')
def index():
    return server.send_static_file('index.html')

io = SocketIO(server)

pygame.camera.init(None)
cam = pygame.camera.Camera(pygame.camera.list_cameras()[0], (640, 480))
cam.start()

class CameraUpdater(PeriodicAsyncThread):
    async def async_run(self, *args, **kwargs):
        img = cam.get_image()
        data = BytesIO()
        pygame.image.save_extended(img, data, "foo.jpg")
        data.seek(0)
        io.emit('image', base64.b64encode(data.read()).decode('ascii'))

task = CameraUpdater(1 / 20)
task.start()