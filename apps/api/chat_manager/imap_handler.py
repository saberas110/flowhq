
import email
import logging

from celery import current_app
from imapclient import IMAPClient

from chat_manager.models import Organization


logger = logging.getLogger(__name__)



class IMAPHandler:
    def __init__(self, data) -> None:
        self.email = data['email']
        self.password = data['app_password']
        self.imap_host = data.get('imap_host', None)
        self.imap_port = data.get('imap_port', 993)
        self.smtp_host = data.get('smtp_host', None)
        self.smtp_port = data.get('smtp_port', 587)
        self.provider = data['provider']
        self.sync_folder = data.get('folder', 'INBOX')

    def _get_imap_setting(self):

        PROVIDER_SETTINGS = {
            'gmail': {
                'imap_host': 'imap.gmail.com',
                'imap_port': 993,
                'smtp_host': 'smtp.gmail.com',
                'smtp_port': 587,
            },
            'outlook': {
                'imap_host': 'outlook.office365.com',
                'imap_port': 993,
                'smtp_host': 'smtp.office365.com',
                'smtp_port': 587,
            },
            'yahoo': {
                'imap_host': 'imap.mail.yahoo.com',
                'imap_port': 993,
                'smtp_host': 'smtp.mail.yahoo.com',
                'smtp_port': 587,
            },
            'custom': {
                'imap_host': self.imap_host,
                'imap_port': self.imap_port,
                'smtp_host': self.smtp_host,
                'smtp_port': self.smtp_port,
            }
        }

        return PROVIDER_SETTINGS.get(self.provider, PROVIDER_SETTINGS['gmail'])

    def _test_imap_connection(self, imap_host, imap_port):

        try:
            logger.info(f'🔌 Testing IMAP: {imap_host}: {imap_port}')

            client = IMAPClient(
                host=imap_host,
                port=imap_port,
                ssl=True,
                timeout=10
            )
            
            client.login(self.email, self.password)
            client.select_folder('INBOX')
            client.logout()

            logger.info(f'✅ IMAP test successful for {self.email}')
            return {'success': True}

        except Exception as e:
            logger.error(f'❌ IMAP test failed: {e} ')
            return {'success': False, 'error': str(e)}


    def _create_email_account(self, user):
        from chat_manager.models import EmailAccount

        imap_settint = self._get_imap_setting()

        email_account = EmailAccount.objects.create(
            organization = user.organizations.first(),
            email = self.email,
            app_password = self.password,
            provider = self.provider,
            imap_host = imap_settint['imap_host'],
            imap_port = imap_settint['imap_port'],
            smtp_host = imap_settint['smtp_host'],
            smtp_port = imap_settint['smtp_port'],
            sync_folder = self.sync_folder,
            is_active = True
        )

        logger.info(f'✅ Created EmailAccount: {email_account.email} (id: {email_account.id})')
        return email_account

    def _start_email_worker(self, email_account, user):

        logger.info(f'☑️ Before start email worker for this email account {email_account}')

        try:
            logger.info(f'📥 Starting Email Worker for {email_account.email}')
            
            current_app.send_task(
                'email_worker.tasks.start_worker_task',
                kwargs={
                    'user_id': user.id,
                    'email_account_id': email_account.id,
                    'email_address': email_account.email,
                    'password': email_account.app_password,
                    'imap_host': email_account.imap_host,
                    'imap_port': email_account.imap_port,
                    'use_ssl': True,
                    'folder': email_account.sync_folder,
                },
                queue = 'email_worker_queue'
            )

            logger.info(f'✅ Email Worker task sent for {email_account.email}')

        except Exception as e:
            logger.error(f'❌ Failed to start Email Worker: {e}')

        




