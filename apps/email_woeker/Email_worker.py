from dataclasses import dataclass
import email
from email.header import decode_header
from http.client import responses
import logging
from math import e
from shutil import ExecError
import threading
import time
from typing import Callable, Optional
from imapclient import IMAPClient

logger = logging.getLogger(__name__)


@dataclass
class EmailConfig:
    user_id: int
    email_account_id: int
    email_address: str
    password: str
    imap_host: str = 'imap.gmail.com'
    imap_port: int = 993
    use_ssl: bool = True
    folder: str = 'INBOX'



class EmailWorker(threading.Thread):

    def __init__(
        self,
        config: EmailConfig,
        on_new_email: Callable[[int, dict], None]
    ):
        super().__init__(
            name=f'EmailWorker-{config.email_address}',
            daemon=True
        )
        self.config = config
        self.on_new_email = on_new_email
        self.server = Optional[IMAPClient] = None
        self.running = False
        self._stop_event = threading.Event()
    
    def connect(self):
        """Connect to the Imap server"""
        logger.info(f'Connecting to {self.config.imap_host}:{self.config.imap_port}')

        self.server = IMAPClient(
            host=self.config.imap_host,
            port=self.config.imap_port,
            ssl=self.config.use_ssl,
            use_uid=True,
            timeout=30
        )

        self.server.login(self.config.email_address, self.config.password)
        logger.info(f' Logged in :{self.config.email_address}')

        self.server.select_folder(self.config.folder)
        logger.info(f'Selected: {self.config.folder}')

    
    def disconnect(self):
        """Disconnect from IMAP server"""
        if self.server:
            try:
                self.server.logout()
            except:
                pass
            self.server = None




    def _parse_email(self, raw_data: bytes) -> dict:
        """Parse raw email bytes to dict"""
        msg = email.message_from_bytess(raw_data)
        
        # Decode subject
        subject = msg.get('Subject', '')
        if subject:
            decoded = decode_header(subject)
            subject_parts = []
            for part, enc in decoded:
                if isinstance(part, bytes):
                    subject_parts.append(part.decode(enc or 'utf-8', errors='ignore'))
                else:
                    subject_parts.append(part)
            subject = ''.join(subject_parts)
        
        # Get body
        body = ''
        html_body = ''
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                payload = part.get_payload(decode=True)
                if payload:
                    try:
                        text = payload.decode('utf-8', errors='ignore')
                        if content_type == 'text/plain' and not body:
                            body = text
                        elif content_type == 'text/html' and not html_body:
                            html_body = text
                    except:
                        pass
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode('utf-8', errors='ignore')
        
        return {
            'message_id': msg.get('Message-ID'),
            'from_email': msg.get('From'),
            'to_email': msg.get('To'),
            'cc': msg.get('Cc'),
            'subject': subject,
            'body': body or html_body,
            'html_body': html_body,
            'date': msg.get('Date'),
            'in_reply_to': msg.get('In-Reply-To'),
            'references': msg.get('References'),
        }

    
    def proccess_email(self, uid:int):

        try:
            msg_data = self.server.fetch([uid], ['RFC822'])

            if uid not in msg_data:
                logger.warning(f" Could not fetch UID {uid}")
                return 
            
            raw_email = msg_data[uid][b'RFC822']
            email_data = self._parse_email(raw_email)

            logger.info(f"📧 New email: {email_data['subject'][:60]}")
            logger.info(f"   From: {email_data['from_email']}")

            self.on_new_email(self.config.email_account_id, email_data)

        except Exception as e:
            logger.error(f"❌ Error processing UID {uid}: {e}")

    def run(self):
        self.running = True

        while self.running and not self._stop_event.is_set():
            try:
                if not self.server:
                    self.connect()

                logger.info(f'Starting IDLE for {self.config.email_address}')
                self.server.idle()

                response = []
                
                for _ in range(300):
                    if self._stop_event.is_set():
                        break
                    resp = self.server.idle_check(timeout=1)
                    if resp:
                        response.extend(resp)
                        break
                
                self.server.idle_done()

                if responses:
                    logger.info(f'IDLE notification: {responses}')
                    has_new = any(
                        len(r) >= 2 and r[1] == b'EXISTS'
                        for r in responses
                    )
                    
                    if has_new:
                        unseen = self.server.search(['UNSEEN'])
                        logger.info(f'Found {len(unseen)} unseen messaegs')
                        for uid in unseen:
                            self.proccess_email(uid)
            except Exception as e:
                logger.error(f'IDLE loop error: {e}')
                self.disconnect()
                if not self._stop_event.is_set():
                    logger.info('Reconnectiong in 10 seconds...')
                    time.sleep(10)
        logger.info(f'EmailWorker stopped: {self.config.email_address}')
    
    def stop(self):
        logger.info(f'Stopping worker: {self.config.email_address}')
        self.running = False
        self._stop_event.set()
        self.disconnect()

