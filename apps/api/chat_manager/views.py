import email
import json
import base64
from os import getenv
from django.contrib.auth import get_user_model
from googleapiclient.discovery import build as google_build
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from chat_manager.evolution.evolution_webhook_service import get_evolution_webhook_service
from .imap_handler import IMAPHandler
from .models import (
    ChannelIdentity,
    Contact,
    Conversation,
    EmailAccount,
    Organization,
    WhatsAppAccount,
    WhatsAppMessage,
)
from .serializers import (
    BaseMessageSerializer,
    ConnectEmailSerializer,
    PolymorphicMessageSerializer,
    ConversationSerializer,
    ConversationDetailSerializer,
    EmailMessageSerializer,
    ServiceAccountSchema,
)
from .email_service.gmail_service import setup_gmail_watch
from chat_manager.celery_tasks.gmail_tasks import process_gmail_notifications
from chat_manager.email_service.gmail_auth import get_email_auth_url
from chat_manager.email_service.gmail_auth import exchange_code_for_token
from django.shortcuts import redirect
from django.views import View
from rest_framework.views import APIView
from django.http import HttpResponse, JsonResponse
from google.oauth2.credentials import Credentials
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from chat_manager.evolution.evolution_service import get_evolution_service

User = get_user_model()


def get_organization(request):
    organization = request.user.organizations.first()
    instance_name = f"org_{organization.id}"
    return instance_name, organization


class WhatsAppConnectView(APIView):
    """Create Evolution instance and return QR code URL"""

    permission_classes = [IsAuthenticated]

    def post(self, request):

        instance_name, organization = get_organization(request)

        webhook_url = f"{getenv('WEBHOOK_BASE_URL', 'http://localhost:8000')}/api/chat/webhook/whatsapp"

        service = get_evolution_service(instance_name)

        result = service.create_instance(webhook_url=webhook_url)

        instance_data = result.get("instance", {})
        instance_status = instance_data.get("status", "")

        account, created = WhatsAppAccount.objects.update_or_create(
            instance_name=instance_name,
            defaults={
                "organization": organization,
                "instance_id": instance_data.get("instanceId", ""),
                "instance_token": result.get("hash", ""),
                "is_connected": False,
                "service_type": "whatsapp",
            },
        )

        if instance_status in ["connecting", "close"]:
            qr_data = service.connect_instance()

            return Response(
                {
                    "status": "pending",
                    "message": "Scan the QR code with WhatsApp",
                    "instance_name": instance_name,
                    "qr_base64": qr_data.get("base64"),
                }
            )

        elif service.is_connected():
            info = service.get_instance_info()
            return Response(
                {
                    "status": "connected",
                    "message": "WhatsApp already connected",
                    "owner": info.get("ownerJid"),
                    "name": info.get("profileName"),
                }
            )

        else:
            return Response(
                {
                    "status": "error",
                    "details": result,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class WhatsAppStatusView(APIView):
    """Check WhatsApp connection status"""

    permission_classes = [IsAuthenticated]

    def get(self, request):

        instance_name, _ = get_organization(request)

        service = get_evolution_service(instance_name)
        state = service.get_connection_state()

        connected = state.get("instance", {}).get("state") == "open"

        result = {
            "instance_name": instance_name,
            "state": state.get("instance", {}).get("state"),
            "connected": connected,
        }

        if connected:
            info = service.get_instance_info()
            result["owner"] = info.get("ownerJid")
            result["profile_name"] = info.get("profileName")
            result["profile_picture"] = info.get("profilePicUrl")

        return Response(result)


class WhatsAppQrView(APIView):
    """Get QR code image"""

    def get(self, request):

        instance_name, _ = get_organization(request)

        service = get_evolution_service(instance_name)
        qr_base64 = service.get_qr_base64()

        if qr_base64:
            if "," in qr_base64:
                qr_base64 = qr_base64.split(",")[1]
            image_data = base64.b64decode(qr_base64)
            return HttpResponse(image_data, content_type="image/png")

        return Response({"error": "QR not available"}, status=status.HTTP_404_NOT_FOUND)


class WhatsAppSendMessageView(APIView):
    """Send a WhatsApp message"""

    def post(self, request):

        to_phone = request.data.get("to")
        message_text = request.data.get("message")

        if not to_phone or not message_text:
            return Response(
                {
                    "error": "to and message are required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance_name, organization = get_organization(request)

        service = get_evolution_service(instance_name)

        if not service.is_connected():
            return Response(
                {"error": "WhatsApp not connected. Scan QR first"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = service.send_text(to_phone=to_phone, message=message_text)

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
            conversation, _ = Conversation.objects.get_or_create(
                contact=identity,
                organization=organization,
                defaults={"title": to_phone},
            )
            WhatsAppMessage.objects.create(
                whatsapp_account=account,
                conversation=conversation,
                wa_message_id=result.get("key", {}).get("id"),
                from_number=account.phone_number,
                to_number=to_phone,
                is_from_me=True,
                text=message_text,
                message_type="text",
                direction="out",
                status="sent",
                sender=account.push_name or account.phone_number,
                wa_status="sent",
                raw_payload=result,
            )
        except Exception as e:
            print(f"⚠️ Error saving sent message: {e}")

        return Response({"status": "sent", "result": result})


class WhatsAppDisconnectView(APIView):
    """Logout from WhatsApp"""
    permission_classes = [IsAuthenticated]

    def post(self, request):

        instance_name, _ = get_organization(request)

        service = get_evolution_service(instance_name)
        result = service.logout_instance()

        WhatsAppAccount.objects.filter(
            instance_name=instance_name,
        ).update(is_connected=False)

        return Response({'status': 'disconnected', 'result': result})


class EvolutionWebhookView(APIView):
    """Webhook - receives events from Evolution API"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data
            event = data.get('event')
            instance = data.get('instance')
            payload = data.get('data', {})

            print(f'📥 Evolution Webhook: {event} | Instance: {instance}')
            print(f'📥 Full webhook keys: {list(data.keys())}')

            webhook_service = get_evolution_webhook_service(instance, payload)

            event_handlers = {
                'connection.update': webhook_service.handle_connection,
                'messages.upsert': webhook_service.handle_message,
                'messages.update': webhook_service.handle_message_update,
                'qrcode.updated': webhook_service.handle_qrcode,
            }

            handler = event_handlers.get(event)
            if handler:
                return handler()

            return Response({'status': 'ok'})

        except Exception as e:
            print(f'❌ Webhook error: {e}')
            return Response({'error': str(e)}, status=500)









@method_decorator(csrf_exempt, name="dispatch")
class GmailAuthStartView(View):
    def get(self, request):
        user = request.user

        # Check if user is authenticated
        if not user.is_authenticated:
            return JsonResponse(
                {"error": "Not authenticated. Please login first."}, status=401
            )

        auth_url, state = get_email_auth_url(user.id)
        request.session["email_auth_state"] = state

        return redirect(auth_url)


class GmailAuthCallbackView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        code = request.GET.get("code")
        state = request.GET.get("state")
        save_state = request.session.get("email_auth_state")
        if state != save_state:
            return JsonResponse({"error": "Invalid state or code"}, status=400)

        if not code:
            return JsonResponse({"error": "No code provided"}, status=400)

        token_data = exchange_code_for_token(code, state)
        credentials = Credentials(**token_data)
        service = google_build("gmail", "v1", credentials=credentials)
        profile = service.users().getProfile(userId="me").execute()
        print("profile", profile)
        email_address = profile["emailAddress"]
        user_id = int(state)

        user = request.user

        email_account, created = EmailAccount.objects.update_or_create(
            email=email_address,
            defaults={
                "organization": user.organizations.first(),
                "access_token": token_data["token"],
                "refresh_token": token_data["refresh_token"],
                "token_uri": token_data["token_uri"],
                "is_active": True,
            },
        )
        setup_gmail_watch(email_account)  ## will be complete

        return JsonResponse(
            {"success": True, "email": email_address, "created": created}
        )


@method_decorator(csrf_exempt, name="dispatch")
class GmailWebHook(View):
    def post(self, request):
        try:
            print("\n" + "=" * 60)
            print("📬 Gmail Webhook Received!")
            print("=" * 60)
            envelope = json.loads(request.body.decode("utf-8"))
            print(f"📦 Envelope: {envelope}")

            if "message" not in envelope:
                print(f"📦 Envelope: {envelope}")
                return JsonResponse({"error": "Message missing"}, status=400)
            data = base64.b64decode(envelope["message"]["data"]).decode("utf-8")
            notification = json.loads(data)
            print(f"📧 Notification: {notification}")

            email_address = notification.get("emailAddress")
            history_id = notification.get("historyId")

            if not email_address or not history_id:
                print("❌ Missing emailAddress or historyId")
                return JsonResponse({"error": "Invalid notification"}, status=400)

            print(f"✅ Processing: {email_address}, History ID: {history_id}")

            process_gmail_notifications.delay(email_address, history_id)

            return JsonResponse({"success": True})

        except Exception as e:
            print(f"❌ Error: {str(e)}")

            import traceback

            traceback.print_exc()

            return JsonResponse({"error": str(e)}, status=500)

    def get(self, request):
        """Health check"""
        return JsonResponse({"status": "ok"})


class ConnectEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConnectEmailSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = serializer.validated_data
        # user = request.
        user = User.objects.get(email="saberas367@gmail.com")

        imap_handler = IMAPHandler(data)
        imap_setting = imap_handler._get_imap_setting()
        test_result = imap_handler._test_imap_connection(
            imap_host=imap_setting["imap_host"], imap_port=imap_setting["imap_port"]
        )

        if not test_result["success"]:
            return Response(
                {"error": "connecting to Imap Failed", "details": test_result["error"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email_account = imap_handler._create_email_account(user)
        imap_handler._start_email_worker(email_account, user)

        return Response(
            {
                "success": True,
                "message": "the email connected",
            },
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        return Response({"message": "success"}, status=status.HTTP_200_OK)


class SchemaViewSet(viewsets.ViewSet):
    @extend_schema(
        responses={200: ConversationSerializer(many=True)}, description="لیست مکالمات"
    )
    @action(detail=False, methods=["get"])
    def conversations(self, request):
        """لیست مکالمات"""
        serializer = ConversationSerializer(many=True)
        return Response(serializer.data)

    @extend_schema(
        responses={200: ConversationDetailSerializer(many=True)},
        description="مکالمه جزئی",
    )
    @action(detail=True, methods=["get"])
    def conversatons_detail(self, request):
        """مکالمه جزئی"""
        serializer = ConversationDetailSerializer(many=True)
        return Response(serializer.data)

    @extend_schema(
        request=EmailMessageSerializer,  # ← این باعث میشه Request type بسازه
        responses={200: EmailMessageSerializer},
    )
    @action(detail=False, methods=["post"])
    def send_email(self, request):
        pass

    @extend_schema(
        request=BaseMessageSerializer, responses={200: BaseMessageSerializer}
    )
    @action(detail=False, methods=["post"])
    def send_message(self, request):
        pass

    @extend_schema(responses={200: ServiceAccountSchema})
    @action(detail=False, methods=["get"])
    def service_accounts(self, request):
        pass
