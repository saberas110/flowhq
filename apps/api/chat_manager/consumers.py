import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from .exceptions import OrganizationValidationError
from .serializers  import ConversationDetailSerializer


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

        await self.channel_layer.group_send(
            self.user_group_name,
            {
                'type': 'chat.list',
                'conversations': srz_conversations
            }
        )





    async def disconnect(self, code):
        if self.user is None or self.user.is_anonymous:
            if self.group_name:  # بررسی وجود group_name
                await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await self.close()
            return



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
        message_type = data.get('type', None)
        body_message = data.get('message', None)

        type_receive = {
            "chat_message": self.type_chat_message,
            "read_message": 'self.type_read_message',
            "email": self.type_send_email
        }
        if not self.conversation_id:
            self.conversation_id = await self._get_or_create_conversation_id(self.contact_user_id)


        handler = type_receive.get(message_type)
        if not handler:
            return
        await handler(data)




    async def type_chat_message(self, data):
        from chat_manager.whatsapp_mock import Whatsapp

        print('data is/////////////////////////', data)
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

        msg_id = await self.create_message(data)



        task_id = await send_email_via_gmail_task(message_id=msg_id)









    async def chat_message(self, event):
        is_me = (self.user.id == event.get('message', None))
        event['message']['is_me'] = is_me
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event.get('message', None)
        }))


    @database_sync_to_async
    def _get_old_messages(self, conversation_id):
        from .models import Conversation
        from .serializers import PolymorphicMessageSerializer

        conversation = Conversation.objects.filter(id=conversation_id).optimized_for_detail().first()._cached_messages
        print('conversation', conversation_id)
        srz_data = PolymorphicMessageSerializer(conversation, many=True)
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
        from .serializers import MessageSerializer
        data['content']['conversation_id'] = self.conversation_id
        print('data in create_message', data)
        msg = Message.objects.create_from_data(data)
        print('msg', msg)
        # srz_msg = MessageSerializer(msg, context={'user': '0910'})

        return msg.id


    @database_sync_to_async
    def get_service_accounts(self, service_account_id):
        from chat_manager.models import ServiceAccount
        from chat_manager.exceptions import ServiceAccountValidationError

        try:
            return ServiceAccount.objects.get(id=service_account_id)
        except ServiceAccount.DoesNotExist:
            raise ServiceAccountValidationError(f"Service_account {service_account_id} Dose Not Exist")


