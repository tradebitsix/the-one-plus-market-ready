from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app import schemas
from app.services import tenancy, audit
from app.core.security import create_access_token, create_refresh_token
from app.api.deps import get_current_user

router = APIRouter()


# ---------------------------------------------------
# REGISTER
# ---------------------------------------------------

@router.post("/register", response_model=schemas.UserOut)
def register(
    payload: schemas.UserRegisterIn,
    request: Request,
    db: Session = Depends(get_db),
):
    try:
        user = tenancy.register_user(
            db,
            payload.email,
            payload.password,
            payload.display_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    audit.log(
        db,
        tenant_id=None,
        actor_user_id=user.id,
        action="auth.register",
        ip=request.client.host if request.client else None,
        ua=request.headers.get("user-agent"),
    )

    return user


# ---------------------------------------------------
# LOGIN
# ---------------------------------------------------

@router.post("/login", response_model=schemas.TokenPair)
def login(
    payload: schemas.UserLoginIn,
    request: Request,
    db: Session = Depends(get_db),
):
    user = tenancy.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        sub=user.id,
        tenant_id=None,
        role=None,
    )

    refresh_token = create_refresh_token(sub=user.id)

    audit.log(
        db,
        tenant_id=None,
        actor_user_id=user.id,
        action="auth.login",
        ip=request.client.host if request.client else None,
        ua=request.headers.get("user-agent"),
    )

    return schemas.TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
    )


# ---------------------------------------------------
# CURRENT USER (Header-based auth)
# ---------------------------------------------------

@router.get("/me", response_model=schemas.UserOut)
def me(
    user=Depends(get_current_user),
):
    return user