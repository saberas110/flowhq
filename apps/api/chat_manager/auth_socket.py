from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from asgiref.sync import async_to_sync, sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _get_token_from_scope(scope, cookie_name='access'):
    # First try to get from cookies
    headers = dict(scope.get("headers", []))
    cookie_header = headers.get(b"cookie", b"").decode()
    print('cookie_header', cookie_header)
    
    for pair in cookie_header.split("; "):
        if "=" in pair:
            k, v = pair.split("=", 1)
            if k == cookie_name:
                print(f'✅ Token from cookie: {v[:20]}...')
                return v
    
    # If no cookie, try query string (for cross-domain WebSocket)
    qs = scope.get("query_string", b"").decode()
    if qs:
        params = parse_qs(qs)
        token_list = params.get("token") or params.get(cookie_name)
        print('query_string params:', params.keys())
        if token_list:
            print(f'✅ Token from query string: {token_list[0][:20]}...')
            return token_list[0]
    
    print('❌ No token found in cookie or query string')
    return None


@sync_to_async
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
        self.token_backend = TokenBackend(
            algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'),
            signing_key=settings.SECRET_KEY
        )

    async def __call__(self, scope, receive, send):
        print('hello from jwt auth socket')
        access = _get_token_from_scope(scope, cookie_name=getattr(settings, "JWT_COOKIE_NAME", "access"))
        refresh = _get_token_from_scope(scope, cookie_name=getattr(settings, "JWT_COOKIE_NAME", "refresh"))
        new_access = None

        print('token in socket mid',access)
        print('token in socket mid',refresh)
        if access:
            try:
                validate_data = self.token_backend.decode(access, verify=True)
                user =await _get_user_from_payload(validate_data)
                print('user', user)
                scope["user"] = user
            except Exception as e:
                if refresh:

                    try:
                        refresh = RefreshToken(refresh)
                        new_access_token = str(refresh.access_token)

                        validated_token = self.token_backend.decode(new_access_token, verify=True)
                        user = await _get_user_from_payload(validated_token)
                        scope["user"] = user
                    except (TokenError, InvalidToken) as refresh_error:
                        print("Error While set user in scope", str(refresh_error))
                        scope["user"] = AnonymousUser()
        elif refresh:
            try:
                refresh = RefreshToken(refresh)
                new_access_token = str(refresh.access_token)

                validated_token = self.token_backend.decode(new_access_token, verify=True)
                user = await _get_user_from_payload(validated_token)
                scope["user"] = user
            except (TokenError, InvalidToken) as refresh_error:
                print("Error While set user in scope", str(refresh_error))
                scope["user"] = AnonymousUser()

        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

class TestAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope["user"] = AnonymousUser()  # یا یک user mock
        return await super().__call__(scope, receive, send)



