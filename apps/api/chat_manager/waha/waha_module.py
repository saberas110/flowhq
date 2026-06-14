import os
import requests


class WAHAService:
    """
    WAHA WhatsApp API Service
    
    Note: WAHA Core (free version) only supports 'default' session.
    For multiple sessions, upgrade to WAHA Plus.
    """

    # Use 'default' for WAHA Core, or 'user_{phone}' for WAHA Plus
    SESSION_NAME = 'default'

    def __init__(self):
        self.base_url = os.getenv('WAHA_BASE_URL', 'http://localhost:3000')
        self.api_key = os.getenv('WAHA_API_KEY', 'mysecretkey')
        self.headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json"
        }

    def _get_session_name(self, phone_number: str = None):
        """Get session name. WAHA Core only supports 'default'."""
        return self.SESSION_NAME
    
    def create_session(self, webhook_url: str = None):
        """Start a WAHA session with optional webhook."""
        url = f'{self.base_url}/api/sessions/start'
        data = {
            'name': self.SESSION_NAME,
        }
        if webhook_url:
            data['config'] = {
                'webhooks': [
                    {
                        'url': webhook_url,
                        'events': ['message', 'message.ack', 'session.status']
                    }
                ]
        }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()

    def get_qr_code(self, save_path: str = None):
        """Get QR code for authentication. Optionally save to file."""
        url = f'{self.base_url}/api/{self.SESSION_NAME}/auth/qr'
        response = requests.get(url, headers=self.headers)
        
        if save_path and response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return {'saved': save_path, 'status': 'ok'}
        
        return response.content if response.status_code == 200 else response.json()

    def get_session_status(self):
        """Get current session status."""
        url = f'{self.base_url}/api/sessions/{self.SESSION_NAME}'
        response = requests.get(url, headers=self.headers)
        return response.json()

    def is_connected(self):
        """Check if WhatsApp is connected."""
        status = self.get_session_status()
        return status.get('status') == 'WORKING'

    def get_me(self):
        """Get connected WhatsApp account info."""
        status = self.get_session_status()
        return status.get('me')
    
    def stop_session(self):
        """Stop the WAHA session."""
        url = f'{self.base_url}/api/sessions/{self.SESSION_NAME}/stop'
        response = requests.post(url, headers=self.headers)
        return response.json()

    def logout(self):
        """
        Logout from WhatsApp - removes saved session data.
        After logout, user must scan QR code again.
        """
        # First stop the session
        self.stop_session()
        
        # Then logout to remove saved credentials
        url = f'{self.base_url}/api/{self.SESSION_NAME}/auth/logout'
        response = requests.post(url, headers=self.headers)
        return response.json() if response.status_code == 200 else {'status': 'logged_out'}

    def send_text(self, to_phone: str, message: str):
        """
        Send a text message.
        
        Args:
            to_phone: Phone number without + (e.g., '989186949623')
            message: Text message to send
        """
        url = f'{self.base_url}/api/sendText'
        data = {
            'session': self.SESSION_NAME,
            'chatId': f'{to_phone}@c.us',
            'text': message
        }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()

    def send_image(self, to_phone: str, image_url: str, caption: str = ''):
        """
        Send an image with optional caption.

        Args:
            to_phone: Phone number without + (e.g., '989186949623')
            image_url: URL of the image to send
            caption: Optional caption text
        """
        url = f'{self.base_url}/api/sendImage'
        data = {
            'session': self.SESSION_NAME,
            'chatId': f'{to_phone}@c.us',
            'file': {'url': image_url},
            'caption': caption,
        }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()

    def send_file(self, to_phone: str, file_url: str, filename: str = None):
        """
        Send a file/document.
        
        Args:
            to_phone: Phone number without + (e.g., '989186949623')
            file_url: URL of the file to send
            filename: Optional filename
        """
        url = f'{self.base_url}/api/sendFile'
        data = {
            'session': self.SESSION_NAME,
            'chatId': f'{to_phone}@c.us',
            'file': {'url': file_url},
        }
        if filename:
            data['file']['filename'] = filename
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()


# Singleton instance
waha_service = WAHAService()
