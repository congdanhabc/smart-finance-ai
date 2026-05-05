import requests
import secrets
from app.core.config import settings
from app.core.logger import logger

def generate_otp() -> str:
    """Tạo mã 6 số ngẫu nhiên"""
    return ''.join(secrets.choice('0123456789') for _ in range(6))

def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Gửi email qua API của Resend (Không dùng SMTP)
    """
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": "SmartFinance <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "html": f"<p>{body}</p>"
            }
        )

        if response.status_code == 200:
            logger.info(f"Email sent successfully to {to_email} via Resend API")
            return True
        else:
            logger.error(f"Resend API Error: {response.text}")
            return False

    except Exception as e:
        logger.error(f"Failed to send email to {to_email} - Exception: {str(e)}")
        return False