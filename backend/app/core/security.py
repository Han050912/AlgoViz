"""
JWT token creation/verification, bcrypt password hashing, AES-256-GCM API key encryption.
"""
import os
import base64
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "type": "access", "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "type": "refresh", "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


class ApiKeyCrypto:
    """AES-256-GCM encryption for API keys."""

    def __init__(self):
        key_bytes = base64.b64decode(settings.ENCRYPTION_KEY)
        if len(key_bytes) != 32:
            raise ValueError("ENCRYPTION_KEY must decode to exactly 32 bytes")
        self.aesgcm = AESGCM(key_bytes)

    def encrypt(self, plaintext: str) -> "tuple[bytes, bytes]":
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        return ciphertext, nonce

    def decrypt(self, ciphertext: bytes, nonce: bytes) -> str:
        return self.aesgcm.decrypt(nonce, ciphertext, None).decode("utf-8")


api_key_crypto = ApiKeyCrypto()
