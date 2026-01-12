from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_tenant_context
from app import schemas
from app.services import tenancy, audit

router = APIRouter()

@router.get("/", response_model=list[dict])
def my_tenants(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = tenancy.list_user_tenants(db, user.id)
    return [{"tenant": schemas.TenantOut.model_validate(r["tenant"]),
             "membership": schemas.MembershipOut.model_validate(r["membership"])} for r in rows]

@router.post("/", response_model=schemas.TenantOut)
def create(request: Request, payload: schemas.TenantCreateIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        t, m = tenancy.create_tenant(db, owner_user_id=user.id, name=payload.name, slug=payload.slug)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    audit.log(db, tenant_id=t.id, actor_user_id=user.id, action="tenant.create",
              target_type="tenant", target_id=t.id,
              ip=request.client.host if request.client else None,
              ua=request.headers.get("user-agent"),
              meta={"slug": t.slug})
    return t

@router.post("/{tenant_id}/invites", response_model=schemas.InviteOut)
def invite(tenant_id: str, payload: schemas.InviteCreateIn, request: Request, db: Session = Depends(get_db),
           user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    # only owner/admin can invite
    role = ctx["role"]
    if role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    inv = tenancy.create_invite(db, tenant_id=tenant_id, email=payload.email, role=payload.role)
    audit.log(db, tenant_id=tenant_id, actor_user_id=user.id, action="tenant.invite.create",
              target_type="invite", target_id=inv.id,
              meta={"email": inv.email, "role": inv.role})
    return inv

@router.post("/invites/{token}/accept", response_model=dict)
def accept_invite(token: str, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        inv, m = tenancy.accept_invite(db, token=token, user_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    audit.log(db, tenant_id=inv.tenant_id, actor_user_id=user.id, action="tenant.invite.accept",
              target_type="invite", target_id=inv.id)
    return {"invite": schemas.InviteOut.model_validate(inv), "membership": schemas.MembershipOut.model_validate(m)}
