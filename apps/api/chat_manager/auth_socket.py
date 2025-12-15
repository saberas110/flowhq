from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from asgiref.sync import async_to_sync
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.backends import TokenBackend



User = get_user_model()


def _get_token_from_scope(scope, cookie_name='access'):
    headers = dict(scope.get("headers", []))
    cookie_header = headers.get(b"cookie", b"").decode()
    for pair in cookie_header.split("; "):
        if "=" in pair :
            k, v = pair.split("=", 1)
            if v==cookie_name:
                return v
        qs = scope.get("query_string", b"").decode()
        if qs:
            params = parse_qs(qs)
            token_list = params.get("token") or params.get("access")
            if token_list:
                return token_list[0]
        return None


@async_to_sync
def _get_user_from_payload(payload):

    try:
        user_id = payload.get("user") or payload.get("user_id") or payload.get("uid")
        user = User.objects.get(id=user_id)
        return user
    except Exception as e:
        print("Error while getting user in Auth_Socket:", e)
        return AnonymousUser()



class JWTAuthSocketMiddleWare(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        token = _get_token_from_scope(scope, cookie_name=getattr(settings, "JWT_COOKIE_NAME", "access"))
        if token:
            try:
                token_backend = TokenBackend(algorithm='HS256')
                token_backend.signing_key = settings.SECRET_KEY
                validate_data = token_backend.decode(token, verify=True)
                user = _get_user_from_payload(validate_data)
                scope["user"] = user
            except Exception as e:
                print("Error While set user in scope", e)
                user = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return super().__call__(scope, receive, send)










class TestAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope["user"] = AnonymousUser()  # یا یک user mock
        return await super().__call__(scope, receive, send)



