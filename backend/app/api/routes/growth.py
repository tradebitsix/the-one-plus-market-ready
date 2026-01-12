from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_tenant_context
from app import schemas
from app.services import growth, audit
from app.db import models
import json

router = APIRouter()

@router.post("/events", response_model=schemas.GrowthEventOut)
def track(payload: schemas.GrowthEventIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    ev = growth.track_event(db, tenant_id=ctx["tenant_id"], user_id=user.id, event=payload.event, properties=payload.properties)
    return ev

@router.get("/events", response_model=list[schemas.GrowthEventOut])
def list_events(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 100):
    rows = db.query(models.GrowthEvent).filter(models.GrowthEvent.tenant_id == ctx["tenant_id"])        .order_by(models.GrowthEvent.created_at.desc()).limit(min(limit, 500)).all()
    return rows

@router.post("/experiments", response_model=schemas.GrowthExperimentOut)
def create_experiment(payload: schemas.GrowthExperimentIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    if ctx["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient role")
    ex = growth.create_experiment(db, tenant_id=ctx["tenant_id"], name=payload.name, hypothesis=payload.hypothesis, variants=payload.variants)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="growth.experiment.create", target_type="experiment", target_id=ex.id)
    return ex

@router.get("/experiments", response_model=list[schemas.GrowthExperimentOut])
def list_experiments(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 50):
    rows = db.query(models.GrowthExperiment).filter(models.GrowthExperiment.tenant_id == ctx["tenant_id"])        .order_by(models.GrowthExperiment.updated_at.desc()).limit(min(limit, 200)).all()
    return rows
