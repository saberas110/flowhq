"""
Evolution API Full Flow Test Script
Run: python test_flow.py
"""
import os
import sys
import time
import base64
import requests

# Django setup
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings'

import django
django.setup()

# ============================================================
# Config
# ============================================================
DJANGO_URL = "http://localhost:8000"
LOGIN_EMAIL = "saberas367@gmail.com"
LOGIN_PASSWORD = "test1234"
TO_PHONE = "989186949623"
TEST_MESSAGE = "🎉 Hello from Evolution API test script!"

QR_SAVE_PATH = os.path.join(os.path.dirname(__file__), "qrcode.png")

session = requests.Session()


def login():
    """Login and get auth cookies"""
    print("🔑 Logging in...")
    resp = session.post(f"{DJANGO_URL}/api/accounts/login", json={
        "email": LOGIN_EMAIL,
        "password": LOGIN_PASSWORD,
    })
    if resp.status_code == 200:
        print(f"   ✅ Logged in as {LOGIN_EMAIL}")
        return True
    else:
        print(f"   ❌ Login failed: {resp.text[:100]}")
        return False


def connect_whatsapp():
    """POST /whatsapp/connect - Create instance"""
    print("\n🚀 Connecting WhatsApp...")
    resp = session.post(f"{DJANGO_URL}/api/chat/whatsapp/connect")
    data = resp.json()
    print(f"   Status: {data.get('status')}")

    # Check if QR is in response
    details = data.get('details', {})
    qr = details.get('qrcode', {})
    if qr and qr.get('base64'):
        save_qr(qr['base64'])

    return data


def get_status():
    """GET /whatsapp/status - Check connection"""
    resp = session.get(f"{DJANGO_URL}/api/chat/whatsapp/status")
    return resp.json()


def get_qr():
    """GET /whatsapp/qr - Get QR code image"""
    print("\n📱 Getting QR code...")
    resp = session.get(f"{DJANGO_URL}/api/chat/whatsapp/qr")

    if resp.status_code == 200 and resp.headers.get('Content-Type') == 'image/png':
        with open(QR_SAVE_PATH, 'wb') as f:
            f.write(resp.content)
        print(f"   ✅ QR saved to: {QR_SAVE_PATH} ({len(resp.content)} bytes)")
        return True
    else:
        print(f"   ❌ QR not available: {resp.text[:100]}")
        return False


def save_qr(b64_string):
    """Save base64 QR code to file"""
    if ',' in b64_string:
        b64_string = b64_string.split(',')[1]
    img = base64.b64decode(b64_string)
    with open(QR_SAVE_PATH, 'wb') as f:
        f.write(img)
    print(f"   ✅ QR saved to: {QR_SAVE_PATH} ({len(img)} bytes)")


def wait_for_scan(timeout=120):
    """Poll status until connected or timeout"""
    print("\n⏳ Waiting for QR scan...")
    print("   📱 Open WhatsApp → Settings → Linked Devices → Link a Device")
    print(f"   📁 QR file: {QR_SAVE_PATH}")
    print()

    start = time.time()
    while time.time() - start < timeout:
        status = get_status()
        state = status.get('state', '?')
        connected = status.get('connected', False)

        elapsed = int(time.time() - start)
        print(f"   [{elapsed}s] State: {state} | Connected: {connected}")

        if connected:
            print(f"\n   ✅ Connected!")
            if status.get('profile_name'):
                print(f"   👤 Name: {status['profile_name']}")
            if status.get('owner'):
                print(f"   📱 Owner: {status['owner']}")
            return True

        if state == 'close' and elapsed > 10:
            # QR might have expired, get new one
            print("   🔄 QR expired, getting new one...")
            get_qr()

        time.sleep(3)

    print(f"\n   ❌ Timeout after {timeout} seconds")
    return False


def send_message(to_phone, message):
    """POST /whatsapp/send - Send message"""
    print(f"\n💬 Sending message to {to_phone}...")
    resp = session.post(f"{DJANGO_URL}/api/chat/whatsapp/send", json={
        "to": to_phone,
        "message": message,
    })
    data = resp.json()

    if data.get('status') == 'sent':
        msg_id = data.get('result', {}).get('key', {}).get('id', '?')
        print(f"   ✅ Message sent! ID: {msg_id}")
    else:
        print(f"   ❌ Send failed: {data}")

    return data


def disconnect():
    """POST /whatsapp/disconnect - Logout"""
    print("\n🔌 Disconnecting...")
    resp = session.post(f"{DJANGO_URL}/api/chat/whatsapp/disconnect")
    data = resp.json()
    print(f"   Status: {data.get('status')}")
    return data


def check_database():
    """Check if data was saved to Django database"""
    from chat_manager.models import WhatsAppAccount, WhatsAppMessage

    print("\n📊 Database Check:")

    accounts = WhatsAppAccount.objects.all()
    print(f"   WhatsAppAccounts: {accounts.count()}")
    for acc in accounts:
        print(f"     - {acc.instance_name} | {acc.phone_number} | {acc.push_name} | Connected: {acc.is_connected}")

    messages = WhatsAppMessage.objects.all().order_by('-created_at')[:5]
    print(f"   WhatsAppMessages (last 5): {messages.count()}")
    for msg in messages:
        direction = '→' if msg.is_from_me else '←'
        print(f"     - {direction} {msg.from_number} → {msg.to_number}: {(msg.text or "")[:40]}")


# ============================================================
# Main Flow
# ============================================================
def main():
    print("=" * 60)
    print("🧪 Evolution API Full Flow Test")
    print("=" * 60)

    # Step 1: Login
    if not login():
        return

    # Step 2: Check current status
    print("\n📊 Current status:")
    status = get_status()
    print(f"   {status}")

    if status.get('connected'):
        print("\n✅ Already connected! Skipping QR scan.")
    else:
        # Step 3: Connect (create instance)
        connect_whatsapp()

        # Step 4: Get QR code
        get_qr()

        # Step 5: Wait for scan
        if not wait_for_scan():
            print("\n❌ Could not connect. Exiting.")
            return

    # Step 6: Send test message
    send_message(TO_PHONE, TEST_MESSAGE)

    # Step 7: Check database
    check_database()

    print("\n" + "=" * 60)
    print("✅ Test complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
