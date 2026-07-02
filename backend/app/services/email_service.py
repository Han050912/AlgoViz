"""Send verification codes via SMTP (QQ/163/企业邮箱)."""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


def send_verification_code(to_email: str, code: str) -> None:
    """Send a 6-digit verification code email to the given address.

    Uses SMTP_SSL on port 465 by default (QQ/163 recommended).
    Raises on any SMTP error so the caller can handle it.
    """
    msg = MIMEMultipart()
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    msg["To"] = to_email
    msg["Subject"] = "AlgoViz 邮箱验证码"

    body = f"您的验证码是：{code}，有效期 10 分钟。如非本人操作请忽略。"
    msg.attach(MIMEText(body, "plain", "utf-8"))

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
