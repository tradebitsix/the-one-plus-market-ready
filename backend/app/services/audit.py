from sqlalchemy.orm import Session
from app.db import models
from .utils import utcnow_naive, json_dumps

def log(db: Session, *, tenant_id: str | None, actor_user_id: str | None, action: str,
        target_type: str | None = None, target_id: str | None = None,
        ip: str | None = None, ua: str | None = None, meta: dict | None = None):
    row = models.AuditLog(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        ip=ip,
        ua=ua,
        meta_json=json_dumps(meta) if meta else None,
        created_at=utcnow_naive(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
