from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_tenant_context
from app import schemas
from app.db import models
from app.services import audit, safety
from app.services.utils import utcnow_naive, json_dumps
import json
import uuid

router = APIRouter()

def _check(db: Session, tenant_id: str, role: str, action: str, content: str | None = None):
    ok, reason = safety.evaluate(db, tenant_id=tenant_id, action=action, role=role, content=content)
    if not ok:
        raise HTTPException(status_code=403, detail=reason or "Blocked by policy")

@router.get("/client/requests", response_model=list[schemas.ClientRequestOut])
def list_client_requests(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 50):
    rows = db.query(models.ClientRequest).filter(models.ClientRequest.tenant_id == ctx["tenant_id"])        .order_by(models.ClientRequest.updated_at.desc()).limit(min(limit, 200)).all()
    return rows

@router.post("/client/requests", response_model=schemas.ClientRequestOut)
def create_client_request(payload: schemas.ClientRequestCreateIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    _check(db, ctx["tenant_id"], ctx["role"], "client_request.create", payload.title + " " + (payload.description or ""))
    now = utcnow_naive()
    row = models.ClientRequest(
        tenant_id=ctx["tenant_id"],
        created_by_user_id=user.id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        status="open",
        created_at=now,
        updated_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="client_request.create", target_type="client_request", target_id=row.id)
    return row

@router.get("/worker/jobs", response_model=list[schemas.WorkerJobOut])
def list_worker_jobs(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 50):
    rows = db.query(models.WorkerJob).filter(models.WorkerJob.tenant_id == ctx["tenant_id"])        .order_by(models.WorkerJob.updated_at.desc()).limit(min(limit, 200)).all()
    return rows

@router.post("/worker/jobs", response_model=schemas.WorkerJobOut)
def create_worker_job(payload: schemas.WorkerJobCreateIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    if ctx["role"] not in ("owner", "admin", "manager"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    _check(db, ctx["tenant_id"], ctx["role"], "worker_job.create", payload.title)
    now = utcnow_naive()
    row = models.WorkerJob(
        tenant_id=ctx["tenant_id"],
        assigned_to_user_id=None,
        title=payload.title,
        status="queued",
        scheduled_for=payload.scheduled_for,
        checklist_json=json_dumps(payload.checklist),
        created_at=now,
        updated_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="worker_job.create", target_type="worker_job", target_id=row.id)
    return row

@router.get("/messages/{thread_type}/{thread_id}", response_model=list[schemas.MessageOut])
def list_messages(thread_type: str, thread_id: str, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 100):
    rows = db.query(models.Message).filter(
        models.Message.tenant_id == ctx["tenant_id"],
        models.Message.thread_type == thread_type,
        models.Message.thread_id == thread_id,
    ).order_by(models.Message.created_at.asc()).limit(min(limit, 500)).all()
    return rows

@router.post("/messages", response_model=schemas.MessageOut)
def create_message(payload: schemas.MessageCreateIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    _check(db, ctx["tenant_id"], ctx["role"], "message.create", payload.body)
    row = models.Message(
        tenant_id=ctx["tenant_id"],
        thread_type=payload.thread_type,
        thread_id=payload.thread_id,
        sender_user_id=user.id,
        body=payload.body,
        created_at=utcnow_naive(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="message.create", target_type="message", target_id=row.id,
              meta={"thread_type": payload.thread_type, "thread_id": payload.thread_id})
    return row
