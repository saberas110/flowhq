import os

from rest_framework.views import exception_handler

class ErrorHandler:
    def __init__(self, exc, context):
        self.exc = exc
        self.context = context
        self.response = exception_handler(exc, context)


    def custom_exception_handler(self):
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

