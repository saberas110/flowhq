import pytest
from channels.db import database_sync_to_async
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from api.asgi import application, all_websocket_urlpatterns
from chat_manager.models import Conversation, Organization
from chat_manager.routing import websocket_urlpatterns

User = get_user_model()

@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
class TestChatConsumer:

    @pytest.fixture(autouse=True)
    async def setup(self):


        self.application = ProtocolTypeRouter({
            "websocket": URLRouter(websocket_urlpatterns),
        })

        await self.create_organization()
        self.communicators = []

        yield

        for comm in self.communicators:
            try:
                await comm.disconnect()
            except:
                pass

    def create_communicator(self, conversation_id, user=None):
        communicator = WebsocketCommunicator(
            self.application,
            f"/ws/chat/{conversation_id}/"
        )

        if user:
            communicator.scope["user"] = user

        self.communicators.append(communicator)
        return communicator


    async def connect_user(self, conversation_id, user):
        comm = self.create_communicator(conversation_id, user)
        connected, _ = await comm.connect()
        return comm, connected


    async def send_message(self, communicator, message):

        await communicator.send_json_to({
            'type': 'chat_message',
            'message': message,
        })


    async def receive_message(self, communicator, timeout=2):
        return await communicator.receive_json_from(timeout=timeout)



    async def test_user_can_connect(self):
        comm, connected = await self.connect_user(
            self.conversation.id,
            self.user1_org
        )
        print('connected status', connected)
        assert connected is True
        assert comm.scope["user"] == self.user1_org


    async def test_send_message(self):
        comm, connected = await self.connect_user(
            self.conversation.id,
            self.user1_org
        )
        assert connected is True

        message = {
            "body": "Hello how are you",
            "conversation_id": self.conversation.id,
            "sender": self.user1_org.email,
            "service_account_id": self.service_accounts.id,
        }

        await self.send_message(comm, message)
        response = await self.receive_message(comm)
        print("its response in test send", response)
        assert response['message']['body'] == "Hello how are you"




    @database_sync_to_async
    def create_organization(self):
        from chat_manager.models import ServiceAccount


        self.user1_org = User.objects.create(
            email="user1@test.com",
            password="testpass123",
            first_name="User1",
            last_name="One",
        )

        self.user2 = User.objects.create(
            email="user2@test.com",
            password="testpass123",
            first_name="User",
            last_name="Two"
        )

        self.organization = Organization.objects.create(name="test_org")
        self.organization.owner.add(self.user1_org)

        self.service_accounts = ServiceAccount.objects.create(
            organization=self.organization,
            service_type='whatsapp'
        )

        print('created service_account', self.service_accounts.id)

        self.conversation = Conversation.objects.create(
            organization=self.organization,
            contact_id="09101234567"
        )



