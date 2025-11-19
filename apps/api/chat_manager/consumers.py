import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from txaio.tx import reject


class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self, scope):
        self.user = scope.get("user")
        if self.user is None or self.user.is_anonymous:
            await self.close()
            return

        self.group_name = 'presence'
        self.user_group_name = f'user_presence_{self.user.id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)

        self.accept()

        srz_conversations = await self._get_srz_conversations(self.user.id)



    async def disconnect(self, code):
        if self.user is None or self.user.is_anonymous:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            self.close()
            return


    @database_sync_to_async
    def _get_srz_conversations(self, user_id):
        from .models import Conversation
        from .models import Organization
        from django.db.models import Max
        from .serializers import ConversationSerializer

        organization = Organization.objects.get(owner=user_id)
        query = (Conversation.objects.filter(service_account__organization_id=organization.id)
                 .annotate(last_message_time=Max('messages__created_at'))
                 .order_by('last_message_time')
                 .distinct())
        srz_data = ConversationSerializer(query, many=True)
        return srz_data.data




class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self, scope):
        self.user = scope["user"]
        if self.user is None or self.user.is_anonymous:
            self.close()
            return

        self.conversation_id = self.scope["url_route"]["kwargs"].get("conversation_id", None)
        self.contact_user_id = self.scope["url_route"]["kwargs"].get("contact_id", None)

        if not self.conversation_id:
            if not self.contact_user_id:
                await self.send(text_data=json.dumps({
                    "type": "Error",
                    "Message": "Missing contact_user_id"
                }))

        self.char_room_name = f"chat_{self.conversation_id}"

        await self.channel_layer.group_add(self.char_room_name, self.channel_name)
        await self.accept()

        if self.conversation_id:
            old_messages = await self._get_old_messages()

        else:
            conversation_id = await self._get_or_create_conversation_id(self.contact_user_id)


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
        from .models import ServiceAccount
        User = get_user_model()

        try:
            contact_user = User.objects.get(id=contact_user_id)
        except User.DoesNotExist:
            raise ValidationError("We get a contact_user_id. but its Not in Users. maybe its deleted")

        conversation = Conversation.objects.filter(service_account__organization__owner=self.user, contact_id=contact_user_id)
        if not conversation:
            try:
                service_account = ServiceAccount.objects.get()
            conversation = Conversation.objects.create()

