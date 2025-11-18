import json

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from chat_manager.handle_whatsapp_hook import WhatsAppHook
from chat_manager.models import Conversation, Message, ServiceAccount
from chat_manager.serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class WhatsApp(APIView):
    def post(self, request):
        hook_handler = WhatsAppHook(request)
        msg = hook_handler.save_message()


class Conversations(APIView):
    def get(self, request):
        query = Conversation.objects.all()
        srz_data = ConversationSerializer(query, many=True)

        return Response({'data': srz_data.data})


class Messages(APIView):
    def get(self, request):
        messages = Message.objects.all()
        srz_data = MessageSerializer(messages, many=True, context={'user': request.user})
        return Response(srz_data.data, status.HTTP_200_OK)








