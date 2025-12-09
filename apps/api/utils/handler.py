import os

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
        "message111": message,
        "code": response.status_code
    }
    return response

def handle_authenticated(exc, context, response, message):
    response.data = {
        "message1111": "authentication failed",
        "code": 401
    }
    return response









class ErrorHandler:
    def __init__(self, exc, context):
        self.exc = exc
        self.context = context
        self.response = exception_handler(exc, context)


    def custom_exception_handler(self):

        print('run exception handler')

        handler = {
            "ValidationError": self.handle_generic_error,
            "Http404": self.handle_generic_error,
            "PermissionDenied": self.handle_generic_error,
            "NotAuthenticated": self.handle_authenticated,
        }

        if self.response is not None:
            self.response.data['code '] = self.response.status_code

        exception_class = self.exc.__class__.__name__

        if exception_class in handler:
            message = self.response.data.get("message", None)
            error_keys = list(self.response.data.keys())
            error_values = list(self.response.data.values())
            print('error', self.response.data)
            error_list = []
            for k, v in self.response.data.items():
                if type(v) == list:
                    error_list.append(f'{k}: {v[0]}')

            return handler[exception_class](error_list)

        return self.response


    def handle_generic_error(self, error_list):
        message = ",".join(error_list)

        self.response.data = {
            "message": message,
            "code": self.response.status_code
        }
        return self.response

    def handle_authenticated(self,message):
        self.response.data = {
            "message": "authentication failed",
            "code": 401
        }
        return self.response




def wrapper_error_handler(exc, context):
    handler = ErrorHandler(exc, context)
    return handler.custom_exception_handler()

