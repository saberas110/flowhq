import json
import logging
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from google.oauth2 import service_account
from chat_manager.evolution.evolution_service import get_evolution_service
from chat_manager.celery_tasks.gmail_tasks import send_email_task
from .exceptions import ContactValidationError, OrganizationValidationError



logger = logging.getLogger(__name__)





class PresenceConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.group_name = None
        self.user_group_name = None


    async def connect(self):
        print('hellow form presence')
        self.user = self.scope.get("user")
        print('self.user',self.user)
        if self.user is None or self.user.is_anonymous:
            await self.close()
            return

        self.group_name = 'presence'
        self.user_group_name = f'user_presence_{self.user.id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)

        await self.accept()

        srz_conversations = await self._get_srz_conversations(self.user.id)
        srz_channels = await self._get_srz_channels(self.user.id)

        print('srz_channels', srz_channels)
        

        await self.channel_layer.group_send(
            self.user_group_name,
            {
                'type': 'chat.list',
                'conversations': srz_conversations,
            }
        )

        await self.channel_layer.group_send(
            self.user_group_name,
            {
                'type': 'channels',
                'channels': srz_channels,
            }
        )





    async def disconnect(self, code):
        if self.user is None or self.user.is_anonymous:
            if self.group_name:  # بررسی وجود group_name
                await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await self.close()
            return



    async def channels(self, event):
        print('event', event)
        await self.send_json({
            'type': 'channels',
            'channels': event['channels']
        })



    async def chat_list(self, event):
        print('event', event)
        await self.send_json({
            'type': 'chat_list',
            'conversations': event['conversations']
        })



    @database_sync_to_async
    def _get_srz_conversations(self, user_id):
        from .models import Conversation
        from .models import Organization
        from django.db.models import Max
        from .serializers import ConversationSerializer
        print(60 * '/')

        try:
            organization = Organization.objects.get(owner=user_id)
            print('organization', organization)
        except Organization.DoesNotExist:
            raise OrganizationValidationError('for this user do not found any organization')

        conversations = (Conversation.objects.filter(organization=organization)
                         .optimized_for_list())


        srz_data = ConversationSerializer(conversations, many=True)
        print('srz_data', srz_data.data)
        print('/' * 60)
        return srz_data.data



    @database_sync_to_async
    def _get_srz_channels(self, user_id):
        from .models import Organization
        from .serializers import PolymorphicServiceAccountSerializer

        try:
            organization = Organization.objects.get(owner=user_id)
        except Organization.DoesNotExist:
            raise OrganizationValidationError('for this user do not found any organization')

        services = organization.services.all()
        
        if services is not None:
            return PolymorphicServiceAccountSerializer(services, many=True).data
        return []







class ChatConsumer(AsyncJsonWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.conversation_id = None
        self.contact_user_id = None
        self.user = None
        self.char_room_name = None


    async def connect(self):

        self.user = self.scope["user"]
        print('self.user', self.user)
        if self.user is None or self.user.is_anonymous:
            await self.close()
            return
        print('call consumer')
        print(self.scope["url_route"]["kwargs"].get("conversation_id", None))


        self.conversation_id = self.scope["url_route"]["kwargs"].get("conversation_id", None)
        self.contact_user_id = self.scope["url_route"]["kwargs"].get("contact_id", None)

        if not self.conversation_id:
            if not self.contact_user_id:
                await self.send(text_data=json.dumps({
                    "type": "Error",
                    "Message": "Missing contact_user_id"
                }))
                await self.close()
                return

        self.char_room_name = f"chat_{self.conversation_id}"

        await self.channel_layer.group_add(self.char_room_name, self.channel_name)
        await self.accept()

        old_messages = None

        if self.conversation_id:
            old_messages = await self._get_old_messages(self.conversation_id)
            print('old_messages', old_messages)

        else:
            conversation_id = await self._get_or_create_conversation_id(self.contact_user_id)



        await self.send(text_data=json.dumps({
            'type': 'init_messages',
            'messages': old_messages
        }))


    async def receive_json(self, data, **kwargs):

        print('start receive ', data)

        message_type = data.get('message_type', None)
        body_message = data.get('html_body', None)

        type_receive = {
            "chat_message": self.type_chat_message,
            "read_message": 'self.type_read_message',
            "email": self.type_send_email,
            'whatsapp': self.type_send_whatsapp_message,
        }

        if not self.conversation_id:
            self.conversation_id = await self._get_or_create_conversation_id(self.contact_user_id)


        handler = type_receive.get(message_type)
        print('handler', handler)
        if not handler:
            return
        await handler(data)


    async def type_send_whatsapp_message(self, data):
        service_account_id = data.get('service_account_id')
        message = data.get('text', '')
        conv =await self.get_conversation_query(self.conversation_id)
        
        if conv.contact:
            whatsapp_identity = next(
                (i for i in conv.contact._cached_identites
                if i.channel == 'whatsapp'),
                None
            )
            if not whatsapp_identity:
                await self.send_json({'type': 'error', 'message': 'No WhatsApp identity found'})
                return
            to_phone = whatsapp_identity.external_id
        else:
            to_phone = conv.contact_user_id

        if not to_phone:
            await self.send_json({'type': 'error', 'message': 'No phone number found'})
            return

        
        account = await self.get_service_accounts(service_account_id)
        instance_name = account.instance_name

        service = get_evolution_service(instance_name)

        if not service.is_connected():
            logger.error('WhatsApp not connected. Scan QR first')
            return
        
        result = service.send_text(to_phone=to_phone, message=message)

        await self.save_whatsapp_message(instance_name, to_phone, conv.organization, conv.id, result, message)
            






    @database_sync_to_async
    def save_whatsapp_message(self, instance_name, to_phone, organization, conversation_id, result, message):
        from .models import WhatsAppAccount,WhatsAppMessage
        from .models import Contact
        from .models import ChannelIdentity


        try:
            account = WhatsAppAccount.objects.get(instance_name=instance_name)
            remote_jid = f"{to_phone}@whatsapp.net"
            contact, _ = Contact.objects.get_or_create(
            name=to_phone, defaults={"avatar_url": None}
        )
            identity, _ = ChannelIdentity.objects.get_or_create(
                channel="whatsapp",
                service_account=account,
                external_id=remote_jid,
                defaults={
                    "contact": contact,
                    "organization": organization,
                },
            )

            WhatsAppMessage.objects.create(
            whatsapp_account=account,
            conversation_id=conversation_id,
            wa_message_id=result.get("key", {}).get("id"),
            from_number=account.phone_number,
            to_number=to_phone,
            is_from_me=True,
            text=message,
            message_type="text",
            direction="out",
            status="sent",
            sender=account.push_name or account.phone_number,
            wa_status="sent",
            raw_payload=result,
        )
        except Exception as e:
            print(f"⚠️ Error saving sent message: {e}")

        return ({"status": "sent", "result": result})




        

            






    async def type_chat_message(self, data):
        from chat_manager.whatsapp_mock import Whatsapp

        srz_msg = await self.create_message(data)
        await self.channel_layer.group_send(self.char_room_name,{
            'type': 'chat.message',
            'message': srz_msg.data
        })
        msg = data.get('message')
        service_account_id = msg.get('service_account_id')
        service_account = await self.get_service_accounts(service_account_id)

        services = {
            "whatapp": Whatsapp,
            "gmail" : "Gmail",
        }
        handler = services.get(service_account.service_type)
        if not handler:
            return

        handler()

    async def type_send_email(self, data):
        from chat_manager.celery_tasks.gmail_tasks import send_email_task
        

        conversation = await self.get_conversation_query(self.conversation_id)
        if conversation is None:
            return []


        if conversation.contact is not None:
            email_identity = next(
                (i for i in conversation.contact._cached_identites
                 if i.channel == 'email'),
                None
            )
            to_email = email_identity.external_id if email_identity is not None else None
        else:
            to_email = conversation.contact_user_id

        data['to_email'] = to_email

        data['text'] = data.get('html_body')
        data['direction'] = 'out'
        msg = await self.create_message(data)



        task_id =  send_email_task.delay(message_id=msg.id)



    async def chat_message(self, event):
        
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event.get('message', None)
        }))


    async def new_message(self, data):

        await self.send_json({
            'type': 'new_message',
            'message': data.get('message', None)
        })







    @database_sync_to_async
    def get_conversation_query(self, conversation_id):
        from .models import Conversation

        conversation = (Conversation.objects.filter(id=conversation_id)
        .optimized_for_detail().first())
        
        return conversation



    @database_sync_to_async
    def _get_old_messages(self, conversation_id):
        from .models import Conversation
        from .serializers import PolymorphicMessageSerializer

        conversation = (Conversation.objects.filter(id=conversation_id)
        .optimized_for_detail().first())
        if conversation is None:
            return []
        messages = conversation._cached_messages
        srz_data = PolymorphicMessageSerializer(messages, many=True)
        print('srz_data_old_message', srz_data.data)
        return srz_data.data

    @database_sync_to_async
    def _get_or_create_conversation_id(self, contact_user_id):
        from .models import Conversation
        from .models import Organization
        User = get_user_model()

        try:
            contact_user = User.objects.get(id=contact_user_id)
        except User.DoesNotExist:
            raise ValidationError("We get a contact_user_id. but its Not in Users. maybe its deleted")

        conversation = Conversation.objects.filter(organization__owner=self.user, contact_id=contact_user_id)
        if not conversation:
            try:
                organization = Organization.objects.get(owner=self.user)
                conversation = Conversation.objects.create(organization=organization, contact_id=contact_user_id)
            except Organization.DoesNotExist:
                raise ValidationError("this user not relation with any organization")
        return conversation.id


    @database_sync_to_async
    def create_message(self,data):
        from .models import Message
        data['conversation_id'] = self.conversation_id
        temp_id = data.pop('temp_id')
        msg = Message.objects.create_from_data(data)
        print('msg', msg)

        return msg


    


    @database_sync_to_async
    def get_service_accounts(self, service_account_id):
        from chat_manager.models import ServiceAccount
        from chat_manager.exceptions import ServiceAccountValidationError

        try:
            return ServiceAccount.objects.get(id=service_account_id)
        except ServiceAccount.DoesNotExist:
            raise ServiceAccountValidationError(f"Service_account {service_account_id} Dose Not Exist")



    @database_sync_to_async
    def get_service_account_by_email(self, organization_id, email):
        from chat_manager.models import ServiceAccount
        
        # Query parent model - returns correct subclass (GmailAccounts, WhatsAppAccount, etc.)
        return ServiceAccount.objects.filter(
            organization_id=organization_id,
            is_active=True
        ).first()
