from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_tenant_context
from app import schemas
from app.services import safety, audit
from app.db import models
from app.services.utils import json_dumps
from datetime import datetime, timezone

router = APIRouter()

@router.post("/check")
def check(action: str, content: str | None = None, request: Request = None, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):  # type: ignore
    ok, reason = safety.evaluate(db, tenant_id=ctx["tenant_id"], action=action, role=ctx["role"], content=content)
    return {"ok": ok, "reason": reason}

@router.get("/policies", response_model=list[schemas.PolicyOut])
def list_policies(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    if ctx["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    rows = db.query(models.Policy).filter((models.Policy.tenant_id == None) | (models.Policy.tenant_id == ctx["tenant_id"]))        .order_by(models.Policy.updated_at.desc()).all()
    return rows

@router.post("/policies", response_model=schemas.PolicyOut)
def upsert_policy(payload: schemas.PolicyIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    if ctx["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    rules_json = json_dumps(payload.rules)
    row = db.query(models.Policy).filter(models.Policy.tenant_id == ctx["tenant_id"], models.Policy.name == payload.name).first()
    if not row:
        row = models.Policy(tenant_id=ctx["tenant_id"], name=payload.name, rules_json=rules_json, is_active=True, created_at=now, updated_at=now)
        db.add(row)
    else:
        row.rules_json = rules_json
        row.updated_at = now
        db.add(row)
    db.commit()
    db.refresh(row)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="policy.upsert", target_type="policy", target_id=row.id, meta={"name": payload.name})
    return row
