from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app import schemas
from app.services import tenancy
from app.core.security import create_access_token, create_refresh_token
from app.services import audit
from app.api.deps import get_current_user_from_token

router = APIRouter()
bearer = HTTPBearer()

@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.UserRegisterIn, request: Request, db: Session = Depends(get_db)):
    try:
        u = tenancy.register_user(db, payload.email, payload.password, payload.display_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    audit.log(
        db,
        tenant_id=None,
        actor_user_id=u.id,
        action="auth.register",
        ip=request.client.host if request.client else None,
        ua=request.headers.get("user-agent"),
    )
    return u

@router.post("/login", response_model=schemas.TokenPair)
def login(payload: schemas.UserLoginIn, request: Request, db: Session = Depends(get_db)):
    u = tenancy.authenticate(db, payload.email, payload.password)
    if not u:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token(sub=u.id, tenant_id=None, role=None)
    refresh = create_refresh_token(sub=u.id)

    audit.log(
        db,
        tenant_id=None,
        actor_user_id=u.id,
        action="auth.login",
        ip=request.client.host if request.client else None,
        ua=request.headers.get("user-agent"),
    )
    return schemas.TokenPair(access_token=access, refresh_token=refresh)

@router.get("/me", response_model=schemas.UserOut)
def me(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)):
    token = creds.credentials
    return get_current_user_from_token(token, db)