from polymorphic.managers import PolymorphicManager
from polymorphic.query import PolymorphicQuerySet

from chat_manager.whatsapp_mock import Whatsapp


class MessageQuerySet(PolymorphicQuerySet):

    def emails(self):
        from chat_manager.models import EmailMessage, Message

        return self.instance_of(EmailMessage)

    def unread(self):
        return self.filter(status='unread')


class MessageManager(PolymorphicManager):
    def get_queryset(self):
        return MessageQuerySet(self.model, using=self._db)

    def create_from_data(self, data):
        from chat_manager.models import EmailMessage, Message
        service_type = data.get('type')
        services = {
            'email': EmailMessage,
            'whatsapp': Whatsapp,
        }
        service = services.get(service_type, Message)
        content = data.get('content')
        content.pop('attachments')
        print('content', content)
        return service.objects.create(**content)