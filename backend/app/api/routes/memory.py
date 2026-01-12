from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_tenant_context
from app import schemas
from app.services import memory, audit
from app.db import models
import json

router = APIRouter()

@router.get("/notes", response_model=list[schemas.MemoryNoteOut])
def list_notes(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 50):
    rows = db.query(models.MemoryNote).filter(models.MemoryNote.tenant_id == ctx["tenant_id"])        .order_by(models.MemoryNote.updated_at.desc()).limit(min(limit, 200)).all()
    return rows

@router.post("/notes", response_model=schemas.MemoryNoteOut)
def create_note(payload: schemas.MemoryNoteCreateIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    note = memory.create_note(db, tenant_id=ctx["tenant_id"], user_id=user.id, title=payload.title, content=payload.content, tags=payload.tags)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="memory.note.create", target_type="memory_note", target_id=note.id)
    return note

@router.get("/sources", response_model=list[schemas.MemorySourceOut])
def list_sources(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context), limit: int = 50):
    rows = db.query(models.MemorySource).filter(models.MemorySource.tenant_id == ctx["tenant_id"])        .order_by(models.MemorySource.created_at.desc()).limit(min(limit, 200)).all()
    return rows

@router.post("/sources", response_model=schemas.MemorySourceOut)
def create_source(payload: schemas.MemorySourceCreateIn, request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    src = memory.create_source(db, tenant_id=ctx["tenant_id"], user_id=user.id, source_type=payload.source_type, title=payload.title, url=payload.url, content=payload.content, meta=payload.meta)
    audit.log(db, tenant_id=ctx["tenant_id"], actor_user_id=user.id, action="memory.source.create", target_type="memory_source", target_id=src.id)
    return src
