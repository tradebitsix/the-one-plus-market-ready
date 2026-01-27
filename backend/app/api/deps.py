from fastapi import Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_token
from app.db import models
from app.services.tenancy import require_membership


# ---------------------------------------------------
# CORE TOKEN DECODER (single source of truth)
# ---------------------------------------------------

def get_current_user_from_token(
    token: str,
    db: Session,
    request: Request | None = None,
) -> models.User:
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    if payload.get("typ") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found/inactive",
        )

    if request is not None:
        request.state.jwt = payload

    return user


# ---------------------------------------------------
# STANDARD AUTH DEPENDENCY (Header-based)
# ---------------------------------------------------

def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> models.User:

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    token = authorization.split(" ", 1)[1].strip()
    return get_current_user_from_token(token, db, request=request)


# ---------------------------------------------------
# TENANT CONTEXT DEPENDENCY
# ---------------------------------------------------

def get_tenant_context(
    request: Request,
    x_tenant_id: str | None = Header(default=None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):

    if not x_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Tenant-Id header",
        )

    membership = require_membership(db, user.id, x_tenant_id)

    request.state.tenant_id = x_tenant_id
    request.state.role = membership.role

    return {
        "tenant_id": x_tenant_id,
        "role": membership.role,
    }