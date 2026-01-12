from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_tenant_context
from app.db import models
from app import schemas
from app.services import audit
import json

router = APIRouter()

@router.get("/users", response_model=list[schemas.UserOut])
def list_users(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    if ctx["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    members = db.query(models.Membership).filter(models.Membership.tenant_id == ctx["tenant_id"]).all()
    user_ids = [m.user_id for m in members]
    users = db.query(models.User).filter(models.User.id.in_(user_ids)).all()
    return users

@router.get("/audit", response_model=list[schemas.AuditLogOut])
def audit_logs(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 50):
    if ctx["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    rows = db.query(models.AuditLog).filter(models.AuditLog.tenant_id == ctx["tenant_id"])        .order_by(models.AuditLog.created_at.desc()).limit(min(limit, 200)).all()
    return rows

@router.get("/settings", response_model=list[schemas.SettingOut])
def list_settings(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    rows = db.query(models.Setting).filter(models.Setting.tenant_id == ctx["tenant_id"], models.Setting.user_id == None).all()
    return rows

@router.post("/settings", response_model=schemas.SettingOut)
def upsert_setting(payload: schemas.SettingUpsertIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    if ctx["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    key = payload.key.strip()
    value_json = json.dumps(payload.value, ensure_ascii=False)
    row = db.query(models.Setting).filter(models.Setting.tenant_id == ctx["tenant_id"], models.Setting.user_id == None, models.Setting.key == key).first()
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if not row:
        row = models.Setting(tenant_id=ctx["tenant_id"], user_id=None, key=key, value_json=value_json, created_at=now, updated_at=now)
        db.add(row)
    else:
        row.value_json = value_json
        row.updated_at = now
        db.add(row)
    db.commit()
    db.refresh(row)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="settings.upsert",
              target_type="setting", target_id=row.id, meta={"key": key})
    return row
