import os
from django.core.asgi import get_asgi_application

from chat_manager.auth_socket import JWTAuthSocketMiddleWare
from chat_manager.routing import websocket_urlpatterns as ws_ur1
from channels.routing import ProtocolTypeRouter, URLRouter


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

django_asgi_app = get_asgi_application()

all_websocket_urlpatterns = ws_ur1

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTAuthSocketMiddleWare(
            URLRouter(
                all_websocket_urlpatterns
            ),

        )
    }
)
