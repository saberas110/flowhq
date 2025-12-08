from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    print("context", context)

    response = exception_handler(exc, context)

    handler = {
        "ValidationError": handle_generic_error,
        "Http404": handle_generic_error,
        "PermissionDenied": handle_generic_error,
        "NotAuthenticated": handle_authenticated,
    }

    if response is not None:
        response.data['code '] = response.status_code

    exception_class = exc.__class__.__name__


    if exception_class in handler:
        if exception_class == "ValidationError":
            message = response.data["message"][0].split("=")[0]
            return handler[exception_class](exc, context, response, message)
        return handler[exception_class](exc, context, response, None)

    return response


def handle_generic_error(exc, context, response, message=None):

    response.data = {
        "message": message,
        "code": response.status_code
    }
    return response

def handle_authenticated(exc, context, response, message):
    response.data = {
        "message": "authentication failed",
        "code": 401
    }
    return response





