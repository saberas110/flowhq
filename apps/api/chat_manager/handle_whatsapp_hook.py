import json

from django.db.models import Q

from chat_manager.exceptions import ServiceAccountValidationError
from chat_manager.models import Conversation, ServiceAccount, Message, Contact


class WhatsAppHook:
    def __init__(self, request):
        data = json.load(request.body)
        metadata = data["entry"][0]["changes"][0]["value"]["metadata"]
        message = data["entry"][0]["changes"][0]["value"]["messages"][0]
        self.sender_phone = data['phone_number']
        self.text = message['text']
        self.message_id = message['id']
        self.message_type = message['type']
        self.phone_number_id = metadata["phone_number_id"]

    def save_message(self):
        service_account = self.get_service_account_by_id( self.phone_number_id)
        if  service_account is not None:
            raise ServiceAccountValidationError('ServiceAccount Not Found')

        conversation = Conversation.objects.get_or_create(contact_id=self.sender_phone, service_account=service_account)
        kwargs = {
            'service_account': service_account,
            'conversation': conversation,
            'text': self.text,
            'message_type': self.message_type,
            'sender': self.sender_phone
        }
        msg = self.create_message(**kwargs)
        return msg




    def create_message(self, **kwargs):
        message = Message.objects.create(**kwargs)
        return message


    def get_service_account_by_phone(self, phone_number):
        service_account = ServiceAccount.objects.filter(phone_number=phone_number)
        if service_account.exists():
            return service_account
        return None


    def get_service_account_by_id(self, id):
        service_account = ServiceAccount.objects.filter(phone_number_id=id)
        if service_account.exists():
            return service_account
        return None
