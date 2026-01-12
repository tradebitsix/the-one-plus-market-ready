from sqlalchemy.orm import Session
from app.db import models
from .utils import utcnow_naive, json_dumps
import hashlib
from app.core.config import settings

def _cheap_embed(text: str) -> list[float]:
    # Deterministic fallback embedding: 32-dim from sha256.
    h = hashlib.sha256(text.encode("utf-8")).digest()
    vec = [b/255.0 for b in h[:32]]
    return vec

def maybe_embed(text: str) -> list[float] | None:
    # If OPENAI_API_KEY is set, you can wire real embeddings later.
    # For now keep this deterministic and offline-safe.
    if not text.strip():
        return None
    return _cheap_embed(text)

def create_note(db: Session, *, tenant_id: str, user_id: str, title: str, content: str, tags: list[str]):
    emb = maybe_embed(title + "\n" + content)
    row = models.MemoryNote(
        tenant_id=tenant_id,
        user_id=user_id,
        title=title,
        content=content,
        tags_json=json_dumps(tags),
        embedding_json=json_dumps(emb) if emb else None,
        created_at=utcnow_naive(),
        updated_at=utcnow_naive(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

def create_source(db: Session, *, tenant_id: str, user_id: str, source_type: str, title: str, url: str | None, content: str | None, meta: dict | None):
    row = models.MemorySource(
        tenant_id=tenant_id,
        user_id=user_id,
        source_type=source_type,
        title=title,
        url=url,
        content=content,
        meta_json=json_dumps(meta) if meta else None,
        created_at=utcnow_naive(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
