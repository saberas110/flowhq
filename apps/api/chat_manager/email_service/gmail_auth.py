import pickle
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from os import getenv
from django.conf import settings
import os

SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
]



def get_email_auth_url(user_id):
    flow = Flow.from_client_secrets_file(
        client_secrets_file=settings.GOOGLE_CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri=getenv('GMAIL_REDIRECT_URI')  ## BE CHECK
    )

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scope=True,
        prompt='consent',
        state=str(user_id)
    )

    return authorization_url, state


def exchange_code_for_token(code, state):
    flow = Flow.from_client_secrets_file(
        client_secrets_file=settings.GOOGLE_CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri=getenv('GMAIL_REDIRECT_URI'),
        state=state,
    )
    flow.fetch_token(code=code)
    credentials = flow.credentials

    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes,
    }


def get_email_account(email_account):
    """
       ساخت Gmail service با credentials ذخیره شده
    """
    credentials = Credentials(
        token = email_account.access_token,
        refresh_token=email_account.refresh_token,
        token_uri=email_account.token_uri,
        client_id=getenv('GMAIL_CLIENT_ID'),
        client_secret=getenv('GMAIL_CLIENT_SECRET'),
        scopes=SCOPES,
    )
    service = build('gmail', 'v1', credentials=credentials)
    return service
