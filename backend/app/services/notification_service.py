# app/services/notification_service.py
import requests
from app.core.config import settings

class NotificationService:
    def send_email(self, email_to: str, subject: str, body: str):
        if not settings.MAILGUN_API_KEY or not settings.MAILGUN_DOMAIN:
            print("⚠️ Mailgun configuration missing. Skipping email.")
            return

        api_url = f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages"
        auth = ("api", settings.MAILGUN_API_KEY)
        data = {
            "from": f"WashWise Notifier <mailgun@{settings.MAILGUN_DOMAIN}>",
            "to": email_to,
            "subject": subject,
            "html": body
        }
        
        try:
            response = requests.post(api_url, auth=auth, data=data)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to send email: {e}")

notification_service = NotificationService()