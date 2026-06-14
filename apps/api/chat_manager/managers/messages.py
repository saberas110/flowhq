from polymorphic.managers import PolymorphicManager
from polymorphic.query import PolymorphicQuerySet

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
        from chat_manager.models import EmailMessage, Message, WhatsAppMessage

        service_type = data.get('message_type')
        services = {
            'email': EmailMessage,
            'whatsapp': WhatsAppMessage,
        }
        service = services.get(service_type, Message)
        data.pop('message_type')

        return service.objects.create(**data)