from fastapi import Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.db import models
from app.services.tenancy import require_membership

def get_current_user(request: Request, authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> models.User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("typ") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_id = payload.get("sub")
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u or not u.is_active:
        raise HTTPException(status_code=401, detail="User not found/inactive")
    request.state.jwt = payload
    return u

def get_tenant_context(request: Request, x_tenant_id: str | None = Header(default=None), db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Missing X-Tenant-Id header")
    m = require_membership(db, user.id, x_tenant_id)
    request.state.tenant_id = x_tenant_id
    request.state.role = m.role
    return {"tenant_id": x_tenant_id, "role": m.role}
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.db import models

def get_current_user_from_token(token: str, db: Session, request=None) -> models.User:
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if payload.get("typ") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u or not u.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found/inactive")

    if request is not None:
        request.state.jwt = payload

    return u