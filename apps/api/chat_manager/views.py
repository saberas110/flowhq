import json
import base64
from django.contrib.auth import get_user_model
from googleapiclient.discovery import build as google_build
from .email_service.gmail_service import setup_gmail_watch
from chat_manager.celery_tasks.gmail_tasks import process_gmail_notifications
from chat_manager.email_service.gmail_auth import get_email_auth_url
from chat_manager.email_service.gmail_auth import exchange_code_for_token
from django.shortcuts import redirect
from django.views import View
from rest_framework.views import APIView
from django.http import JsonResponse
from google.oauth2.credentials import Credentials

from chat_manager.models import GmailAccounts

User = get_user_model()


class GmailAuthStartView(View):
    def get(self, request):
        user = request.user
        auth_url, state = get_email_auth_url(user.id)

        request.session['email_auth_state'] = state

        return redirect(auth_url)


class GmailAuthCallbackView(APIView):
    def get(self, request):

        print('hello im from GmailAuthCallbackView')

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
        email_address = profile['emailAddress']
        user_id = int(state)
        user = User.objects.get(id=user_id)

        email_account, created = GmailAccounts.objects.update_or_create(
            email=email_address,
            defaults={
                'organization': user.organizations,
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

class GmailWebHook(View):
    def post(self, request):
        try:
            print("\n" + "=" * 60)
            print("📬 Gmail Webhook Received!")
            print("=" * 60)
            envelope = json.load(request.body.decode('utf-8'))
            print(f"📦 Envelope: {envelope}")

            if 'message' not in envelope:
                print(f"📦 Envelope: {envelope}")
                return JsonResponse({'error': 'Message missing'}, status=400)
            data = base64.b64decode(envelope['message']['data']).decode('utf-8')
            notification = json.loads(data)
            print(f"📧 Notification: {notification}")

            email_address = notification.get('email_address')
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
