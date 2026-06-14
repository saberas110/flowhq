# send_test_email.py
from os import getenv
import django
import os



os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from chat_manager.models import GmailAccounts
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64
import time

acc = GmailAccounts.objects.filter(is_active=True).first()

if acc:
    print(f"📧 Sending email from: {acc.email}")

    # ساخت credentials
    creds = Credentials(
        token=acc.access_token,
        refresh_token=acc.refresh_token,
        token_uri=acc.token_uri,
        client_id=getenv('GMAIL_CLIENT_ID'),
        client_secret=getenv('GMAIL_CLIENT_SECRET'),
        scopes=['https://www.googleapis.com/auth/gmail.modify']
    )

    service = build('gmail', 'v1', credentials=creds)

    profile_before = service.users().getProfile(userId='me').execute()
    history_id_before = profile_before['historyId']
    print(f"📊 History ID before: {history_id_before}")

    # ساخت پیام
    timestamp = int(time.time())
    message = MIMEText(f'hello im saber this is to {timestamp}\n\nThis is a webhook test.')
    message['to'] = 'saberas110@gmail.com'
    message['from'] = acc.email
    message['subject'] = f'Webhook Test {timestamp}'
    message['direction'] = 'out'

    # Encode
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

    # ارسال
    result = service.users().messages().send(
        userId='me',
        body={'raw': raw}
    ).execute()

    print(f"✅ Email sent! Message ID: {result['id']}")
    print(f"   Thread ID: {result.get('threadId')}")
    print(f"   Label IDs: {result.get('labelIds', [])}")

    # ✅ صبر کن تا Gmail sync کنه
    print(f"\n⏳ Waiting 5 seconds for Gmail to sync...")
    time.sleep(5)

    # ✅ دریافت History ID بعد از ارسال
    profile_after = service.users().getProfile(userId='me').execute()
    history_id_after = profile_after['historyId']
    print(f"📊 History ID after: {history_id_after}")

    if history_id_before != history_id_after:
        print(f"✅ History ID changed! ({history_id_before} → {history_id_after})")
    else:
        print(f"⚠️  History ID didn't change!")

    # ✅ بررسی ایمیل در Gmail
    print(f"\n🔍 Checking if email exists in Gmail...")
    try:
        fetched = service.users().messages().get(
            userId='me',
            id=result['id'],
            format='metadata',
            metadataHeaders=['Subject', 'From', 'To']
        ).execute()

        print(f"✅ Email found in Gmail:")
        print(f"   ID: {fetched['id']}")
        print(f"   Thread ID: {fetched['threadId']}")
        print(f"   Labels: {fetched.get('labelIds', [])}")

        headers = fetched.get('payload', {}).get('headers', [])
        for header in headers:
            if header['name'] in ['Subject', 'From', 'To']:
                print(f"   {header['name']}: {header['value']}")
    except Exception as e:
        print(f"❌ Could not fetch email: {e}")

    print(f"\n✅ Now check your webhook logs!")
else:
    print("❌ No Gmail account found!")