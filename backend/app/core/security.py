from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Any, Optional
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

def create_access_token(sub: str, tenant_id: str | None, role: str | None) -> str:
    exp = _utcnow() + timedelta(minutes=settings.JWT_ACCESS_MINUTES)
    payload: dict[str, Any] = {"sub": sub, "exp": exp, "typ": "access"}
    if tenant_id:
        payload["tenant_id"] = tenant_id
    if role:
        payload["role"] = role
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def create_refresh_token(sub: str) -> str:
    exp = _utcnow() + timedelta(days=settings.JWT_REFRESH_DAYS)
    payload = {"sub": sub, "exp": exp, "typ": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except JWTError as e:
        raise ValueError("Invalid token") from e
