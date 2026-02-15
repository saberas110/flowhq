import json
import os
import requests


class EvolutionService:
    def __init__(self, instance_name: str = None):
        self.base_url = os.getenv("EVOLUTION_API_URL", "http://159.65.148.183:8085")
        self.api_key = os.getenv("EVOLUTION_API_KEY", "my-evolution-key")
        self.instance_name = instance_name
        self.headers = {"apikey": self.api_key, "Content-Type": "application/json"}

    def create_instance(self, webhook_url: str = None):
        """
        Create a new WhatsApp instance.
        Returns instance info + QR code if available.
        """

        url = f"{self.base_url}/instance/create"
        data = {
            "instanceName": self.instance_name,
            "integration": "WHATSAPP-BAILEYS",
            "qrcode": True,
        }

        if webhook_url:
            data["webhook"] = {
                "url": webhook_url,
                "webhook_by_events": True,
                "events": [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "CONNECTION_UPDATE",
                    "QRCODE_UPDATED",
                ],
            }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()

    def connect_instance(self):
        """
        Connect instance and get QR code.
        Returns: {pairingCode, code, base64, count}
        """
        url = f"{self.base_url}/instance/connect/{self.instance_name}"
        response = requests.get(url, headers=self.headers)

        return response.json()

    def get_qr_base64(self):
        data = self.connect_instance()
        return data.get("base64")

    def get_connection_state(self):
        """
        Get connection state.
        Returns: {'instance': {'instanceName': '...', 'state': 'open/close/connecting'}}
        """

        url = f"{self.base_url}/instance/connectionState/{self.instance_name}"
        response = requests.get(url, headers=self.headers)
        return response.json()

    def is_connected(self):
        try:
            data = self.get_connection_state()
            return data.get("instance", {}).get("state") == "open"
        except Exception:
            return False

    def get_instance_info(self):
        """
        Get full instance info (status, owner, profile name, etc.).
        Returns data from: fetchInstances?instanceName=xxx
        """

        url = f"{self.base_url}/instance/fetchInstances"
        params = {"instanceName": self.instance_name}
        response = requests.get(url, headers=self.headers, params=params)
        data = response.json()

        return data[0] if data else {}

    def fetch_all_instances(self):

        url = f"{self.base_url}/instance/fetchInstances"
        response = requests.get(url, headers=self.headers)
        return response.json()

    def restart_instance(self):

        url = f"{self.base_url}/instance/restart/{self.instance_name}"
        response = requests.put(url, headers=self.headers)
        return response.json()

    def logout_instance(self):
        """Logout from WhatsApp. User must scan QR again."""
        url = f"{self.base_url}/instance/logout/{self.instance_name}"
        response = requests.delete(url, headers=self.headers)
        return (
            response.json()
            if response.status_code == 200
            else {"status": "logged_out"}
        )

    def delete_instance(self):
        """Delete the instance completely."""
        url = f"{self.base_url}/instance/delete/{self.instance_name}"
        response = requests.delete(url, headers=self.headers)
        return response.json() if response.status_code == 200 else {"status": "deleted"}

    def send_text(self, to_phone: str, message: str):
        """
        Send a text message.

        Args:
            to_phone: Phone number (e.g., '989186949623')
            message: Text message to send
        """
        url = f"{self.base_url}/message/sendText/{self.instance_name}"
        data = {"number": to_phone, "text": message}
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()

    def send_image(self, to_phone: str, image_url: str, caption: str = ""):
        """Send an image with optional caption."""
        url = f"{self.base_url}/message/sendMedia/{self.instance_name}"
        data = {
            "number": to_phone,
            "mediatype": "image",
            "media": image_url,
            "caption": caption,
        }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()

    def send_document(self, to_phone: str, file_url: str, filename: str = ""):
        """Send a document/file."""
        url = f"{self.base_url}/message/sendMedia/{self.instance_name}"
        data = {
            "number": to_phone,
            "mediatype": "document",
            "media": file_url,
            "fileName": filename,
        }
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()




def get_evolution_service(instance_name: str):
    """
    Factory function to get EvolutionService for a specific instance.

    Usage:
        service = get_evolution_service('org_1')
        service.send_text('989186949623', 'Hello!')
    """
    return EvolutionService(instance_name=instance_name)
