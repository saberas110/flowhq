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
from .imap_handler import IMAPHandler
from .models import Conversation, EmailAccount, WhatsAppAccount
from .serializers import BaseMessageSerializer, ConnectEmailSerializer, PolymorphicMessageSerializer, ConversationSerializer, ConversationDetailSerializer, \
    EmailMessageSerializer, ServiceAccountSchema
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
        instance_name = f'org_{organization.id}'

        webhook_url = f'{getenv('BASE_URL'), 'http://127.0.0.1:8000/chat/webhook/whatsapp'}'

        service = get_evolution_service(instance_name)

        result = service.create_instance(webhook_url=webhook_url)

        instance_data = result.get('instance', {})
        instance_status = instance_data.get('status', '')


        account, created = WhatsAppAccount.objects.update_or_create(
            instance_name=instance_name,
            defaults={
                'organization': organization,
                'instance_id': instance_data.get('instanceId', '')
            }
        )




        if instance_status in ['connection', 'close']:
            qr_data = service.connect_instance()

            return Response({
                'status': 'pending',
                'message': 'Scan the QR code with Wha'
            })


class WhatsAppStatusView(APIView):
    """Check WhatsApp connection status"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_info = waha_service.get_session_status()

        return Response({
            'status': status_info.get('status'),
            'connected': status_info.get('status') == 'WORKING',
            'me': status_info.get('me')
        })



class WhatsAppQrView(APIView):
    """Get QR code image"""

    def get(self, request):

        response = request.get(
            f'w{waha_service.base_url}/api/default/auth/qr',
            headers=waha_service.headers
        )

        if response.status_code == 200:
            return HttpResponse(
                response.content,
                content_type='image/png'
            )
        else:
            return Response({'error': 'QR not available'}, status=status.HTTP_404_NOT_FOUND)

    
class WhatsAppSendMessageView(APIView):
    """Send a WhatsApp message"""

    def post(self, request):

        to_phone = request.data.get('to')
        message = request.data.get('messaeg')

        if not to_phone or not message:
            return Response({
                'error': 'to and message are required',
            },status=status.HTTP_400_BAD_REQUEST)






















@method_decorator(csrf_exempt, name='dispatch')
class GmailAuthStartView(View):
    def get(self, request):
        user = request.user
        
        # Check if user is authenticated
        if not user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated. Please login first.'}, status=401)
        
        auth_url, state = get_email_auth_url(user.id)
        request.session['email_auth_state'] = state

        return redirect(auth_url)


class GmailAuthCallbackView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')
        save_state = request.session.get('email_auth_state')
        if state != save_state:
            return JsonResponse({'error': 'Invalid state or code'}, status=400)

        if not code:
            return JsonResponse({'error': 'No code provided'}, status=400)

        token_data = exchange_code_for_token(code, state)
        credentials = Credentials(**token_data)
        service = google_build('gmail', 'v1', credentials=credentials)
        profile = service.users().getProfile(userId='me').execute()
        print('profile', profile)
        email_address = profile['emailAddress']
        user_id = int(state)

        user = request.user

        email_account, created = EmailAccount.objects.update_or_create(
            email=email_address,
            defaults={
                'organization': user.organizations.first(),
                'access_token': token_data['token'],
                'refresh_token': token_data['refresh_token'],
                'token_uri': token_data['token_uri'],
                'is_active': True,

            }
        )
        setup_gmail_watch(email_account)  ## will be complete

        return JsonResponse({
            'success': True,
            'email': email_address,
            'created': created
        })


@method_decorator(csrf_exempt, name='dispatch')
class GmailWebHook(View):
    def post(self, request):
        try:
            print("\n" + "=" * 60)
            print("📬 Gmail Webhook Received!")
            print("=" * 60)
            envelope = json.loads(request.body.decode('utf-8'))
            print(f"📦 Envelope: {envelope}")

            if 'message' not in envelope:
                print(f"📦 Envelope: {envelope}")
                return JsonResponse({'error': 'Message missing'}, status=400)
            data = base64.b64decode(envelope['message']['data']).decode('utf-8')
            notification = json.loads(data)
            print(f"📧 Notification: {notification}")

            email_address = notification.get('emailAddress')
            history_id = notification.get('historyId')

            if not email_address or not history_id:
                print("❌ Missing emailAddress or historyId")
                return JsonResponse({'error': 'Invalid notification'}, status=400)

            print(f"✅ Processing: {email_address}, History ID: {history_id}")

            process_gmail_notifications.delay(email_address, history_id)

            return JsonResponse({'success': True})


        except Exception as e:

            print(f"❌ Error: {str(e)}")

            import traceback

            traceback.print_exc()

            return JsonResponse({'error': str(e)}, status=500)

    def get(self, request):
        """Health check"""
        return JsonResponse({'status': 'ok'})

class ConnectEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConnectEmailSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )
        data = serializer.validated_data
        # user = request.
        user = User.objects.get(email='saberas367@gmail.com')

        imap_handler = IMAPHandler(data)
        imap_setting = imap_handler._get_imap_setting()
        test_result = imap_handler._test_imap_connection(
            imap_host=imap_setting['imap_host'],
            imap_port=imap_setting['imap_port']
        )

        if not test_result['success']:
            return Response(
                {'error':'connecting to Imap Failed', 'details': test_result['error']}
                ,status=status.HTTP_400_BAD_REQUEST
            )

        email_account = imap_handler._create_email_account(user)
        imap_handler._start_email_worker(email_account, user)

        return Response({
            'success': True,
            'message': 'the email connected',

        }, status=status.HTTP_201_CREATED)


    def get(self, request):
        return Response({'message': 'success'}, status=status.HTTP_200_OK)



class SchemaViewSet(viewsets.ViewSet): 
    @extend_schema(
        responses={200: ConversationSerializer(many=True)},
        description="لیست مکالمات"
    )
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """لیست مکالمات"""
        serializer = ConversationSerializer(many=True)
        return Response(serializer.data)

    @extend_schema(
         responses={200: ConversationDetailSerializer(many=True)}
    , description="مکالمه جزئی")
    @action(detail=True, methods=['get'])
    def conversatons_detail(self, request):
        
        """مکالمه جزئی"""
        serializer = ConversationDetailSerializer(many=True)
        return Response(serializer.data)


    @extend_schema(
    request=EmailMessageSerializer,  # ← این باعث میشه Request type بسازه
    responses={200: EmailMessageSerializer}
    ) 
    @action(detail=False, methods=['post'])
    def send_email(self, request):
        pass



    @extend_schema(
        request=BaseMessageSerializer,
        responses={200: BaseMessageSerializer}
    )
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        pass


    

    @extend_schema(responses={200: ServiceAccountSchema})
    @action(detail=False, methods=['get'])
    def service_accounts(self, request):
        pass


