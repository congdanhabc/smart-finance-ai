import smtplib
from email.message import EmailMessage
import secrets
from app.core.config import settings
from app.core.logger import logger

def generate_otp() -> str:
    """Tạo mã 6 số ngẫu nhiên"""
    return ''.join(secrets.choice('0123456789') for _ in range(6))

def send_email(to_email: str, subject: str, body: str):
    """Hàm gửi email qua SMTP của Gmail"""
    msg = EmailMessage()
    msg.set_content(body)
    msg['Subject'] = subject
    msg['From'] = settings.SMTP_USERNAME
    msg['To'] = to_email

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)    
        server.ehlo()
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

    except Exception as e:
        logger.error(f"Failed to send email to {to_email} - Error: {str(e)}")