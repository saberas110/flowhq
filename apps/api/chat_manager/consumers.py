import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError




#
#
# class PresenceConsumer(AsyncWebsocketConsumer):
#     async def connect(self, scope):
#         self.user = scope.get("user")
#         if self.user is None or self.user.is_anonymous:
#             await self.close()
#             return
#
#         self.group_name = 'presence'
#         self.user_group_name = f'user_presence_{self.user.id}'
#
#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.channel_layer.group_add(self.user_group_name, self.channel_name)
#
#         self.accept()
#
#         srz_conversations = await self._get_srz_conversations(self.user.id)
#
#
#
#     async def disconnect(self, code):
#         if self.user is None or self.user.is_anonymous:
#             await self.channel_layer.group_discard(self.group_name, self.channel_name)
#             self.close()
#             return
#
#
#     @database_sync_to_async
#     def _get_srz_conversations(self, user_id):
#         from .models import Conversation
#         from .models import Organization
#         from django.db.models import Max
#         from .serializers import ConversationSerializer
#
#         organization = Organization.objects.get(owner=user_id)
#         query = (Conversation.objects.filter(service_account__organization_id=organization.id)
#                  .annotate(last_message_time=Max('messages__created_at'))
#                  .order_by('last_message_time')
#                  .distinct())
#         srz_data = ConversationSerializer(query, many=True)
#         return srz_data.data
#
#
#
#



class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):


        self.user = self.scope["user"]
        print('self.user', self.user)
        if self.user is None or self.user.is_anonymous:
            self.close()
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
                self.close()
                return

        self.char_room_name = f"chat_{self.conversation_id}"

        await self.channel_layer.group_add(self.char_room_name, self.channel_name)
        await self.accept()

        if self.conversation_id:
            old_messages = await self._get_old_messages(self.conversation_id)

        else:
            conversation_id = await self._get_or_create_conversation_id(self.contact_user_id)

        self

        # await self.send(text_data=json.dumps({
        #     'type': 'init_message',
        #     'message': old_messages
        # }))


    async def receive(self, text_data=None):
        data = json.loads(text_data)
        message_type = data.get('type', None)
        body_message = data.get('message', None)

        type_receive = {
            "chat_message": self.type_chat_message,
            "read_message": 'self.type_read_message',
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






    async def chat_message(self, event):
        is_me = (self.user.id == event.get('message', None))
        event['message']['is_me'] = is_me
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event.get('message', None)
        }))


    @database_sync_to_async
    def _get_old_messages(self, conversation_id):
        from .models import Message
        from .serializers import MessageSerializer

        query = Message.objects.filter(conversation_id=conversation_id)
        srz_data = MessageSerializer(query, many=True, context={"user": self.user})
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

        message = data["message"]
        msg = Message.objects.create(**message)
        srz_msg = MessageSerializer(msg, context={'user': '0910'})

        return srz_msg


    @database_sync_to_async
    def get_service_accounts(self, service_account_id):
        from chat_manager.models import ServiceAccount
        from chat_manager.exceptions import ServiceAccountValidationError

        try:
            return ServiceAccount.objects.get(id=service_account_id)
        except ServiceAccount.DoesNotExist:
            raise ServiceAccountValidationError(f"Service_account {service_account_id} Dose Not Exist")


