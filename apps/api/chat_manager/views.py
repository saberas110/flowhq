import json
import base64
from os import getenv
import uuid
from django.core.files.storage import default_storage
from django.contrib.auth import get_user_model
from googleapiclient.discovery import build as google_build
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import PolymorphicProxySerializer, extend_schema

from chat_manager.evolution.evolution_webhook_service import (
    get_evolution_webhook_service,
)
from .imap_handler import IMAPHandler
from .models import (
    EmailAccount,
    WhatsAppAccount,
)
from .serializers import (
    BaseMessageSerializer,
    ConnectEmailSerializer,
    ConversationSerializer,
    ConversationDetailSerializer,
    EmailMessageSerializer,
    ServiceAccountSchema,
    WhatsAppMessageSerializer,
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


class WhatsAppConnectView(APIView):
    """Create Evolution instance and return QR code URL"""

    permission_classes = [IsAuthenticated]

    def post(self, request):

        organization = request.user.organizations.first()
        instance_name = f"org_{organization.id}_{uuid.uuid4().hex[:8]}"

        webhook_url = f"{getenv('WEBHOOK_BASE_URL', 'http://localhost:8000')}/api/chat/webhook/whatsapp"
        service = get_evolution_service(instance_name)

        result = service.create_instance(webhook_url=webhook_url)

        instance_data = result.get("instance", {})
        instance_status = instance_data.get("status", "")

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

        instance_name = request.query_params.get("instance_name")

        if not instance_name:
            organization = request.user.organizations.first()
            accounts = WhatsAppAccount.objects.filter(organization=organization)
            return Response(
                {
                    "accounts": [
                        {
                            "instance_name": acc.instance_name,
                            "phone_number": acc.phone_number,
                            "push_name": acc.push_name,
                            "is_connected": acc.is_connected,
                        }
                        for acc in accounts
                    ]
                }
            )

        service = get_evolution_service(instance_name)
        try:
            state = service.get_connection_state()
        except Exception:
            return Response(
                {"error": "Instance not found"}, status=status.HTTP_404_NOT_FOUND00
            )

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

    permission_classes = [IsAuthenticated]

    def get(self, request):

        instance_name = request.query_params.get("instance_name")

        if not instance_name:
            return Response(
                {"error": "instance_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = get_evolution_service(instance_name)
        qr_base64 = service.get_qr_base64()

        if qr_base64:
            if "," in qr_base64:
                qr_base64 = qr_base64.split(",")[1]
            image_data = base64.b64decode(qr_base64)
            return HttpResponse(image_data, content_type="image/png")

        return Response({"error": "QR not available"}, status=status.HTTP_404_NOT_FOUND)


class FileUploadView(APIView):
    """Upload file, return URL for WhatsApp media sending"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        path = default_storage.save(f'whatsapp/{file.name}', file)

        base_url = getenv('WEBHOOK_BASE_URL', 'http://localhost:8000')
        file_url = f'{base_url}/media/{path}'

        content_type = file.content_type or ''
        if content_type.startswith('image/'):
            media_type = 'image'
        elif content_type.startswith('video/'):
            media_type = 'video'
        elif content_type.startswith('audio/'):
            media_type = 'audio'
        else: 
            media_type = 'document'

        return Response({
            'url': file_url,
            'file_name': file.name,
            'size': file.size,
            'content_type': content_type,
            'media_type': media_type
        })





class WhatsAppDisconnectView(APIView):
    """Logout from WhatsApp"""

    permission_classes = [IsAuthenticated]

    def post(self, request):

        instance_name, _ = request.data.get("instance_name")

        if not instance_name:
            return Response(
                {"error": "instance_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        organization = request.user.organizations.first()

        service = get_evolution_service(instance_name)
        result = service.logout_instance()

        WhatsAppAccount.objects.filter(
            instance_name=instance_name,
            organization=organization,
        ).update(is_connected=False)

        return Response({"status": "disconnected", "result": result})


class WhatsAppCancelConnectView(APIView):
    """Cancel pending connection - delete instance from Evolution"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        instance_name = request.data.get("instance_name")

        if not instance_name:
            return Response(
                {"error": "instance_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only delete if NOT in DB (pending)
        if WhatsAppAccount.objects.filter(instance_name=instance_name).exists():
            return Response(
                {"error": "Cannot cancel. Account already connected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = get_evolution_service(instance_name)
        try:
            result = service.delete_instance()
        except Exception:
            result = {"status": "deleted"}

        return Response({"status": "cancelled", "result": result})


class EvolutionWebhookView(APIView):
    """Webhook - receives events from Evolution API"""

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data
            event = data.get("event")
            instance = data.get("instance")
            payload = data.get("data", {})

            print(f"📥 Evolution Webhook: {event} | Instance: {instance}")
            print(f"📥 Full webhook keys: {list(data.keys())}")

            webhook_service = get_evolution_webhook_service(instance, payload)

            event_handlers = {
                "connection.update": webhook_service.handle_connection,
                "messages.upsert": webhook_service.handle_message,
                "messages.update": webhook_service.handle_message_update,
                "qrcode.updated": webhook_service.handle_qrcode,
            }

            handler = event_handlers.get(event)
            if handler:
                return handler()

            return Response({"status": "ok"})

        except Exception as e:
            print(f"❌ Webhook error: {e}")
            return Response({"error": str(e)}, status=500)


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
        request=PolymorphicProxySerializer(
            component_name="SendMessage",
            serializers=[
                EmailMessageSerializer,
                WhatsAppMessageSerializer,
                BaseMessageSerializer,
            ],
            resource_type_field_name=None,
        ),
        responses={
            200,
            PolymorphicProxySerializer(
                component_name="Message",
                serializers=[
                    EmailMessageSerializer,
                    WhatsAppMessageSerializer,
                    BaseMessageSerializer,
                ],
                resource_type_field_name=None,
            ),
        },
    )
    @action(detail=False, methods=["post"])
    def send_message(self, request):
        pass

    @extend_schema(responses={200: ServiceAccountSchema})
    @action(detail=False, methods=["get"])
    def service_accounts(self, request):
        pass
