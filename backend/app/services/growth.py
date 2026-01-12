from sqlalchemy.orm import Session
from app.db import models
from .utils import utcnow_naive, json_dumps

def track_event(db: Session, *, tenant_id: str, user_id: str | None, event: str, properties: dict):
    row = models.GrowthEvent(
        tenant_id=tenant_id,
        user_id=user_id,
        event=event,
        properties_json=json_dumps(properties or {}),
        created_at=utcnow_naive(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

def create_experiment(db: Session, *, tenant_id: str, name: str, hypothesis: str | None, variants: list[dict]):
    row = models.GrowthExperiment(
        tenant_id=tenant_id,
        name=name,
        hypothesis=hypothesis,
        variants_json=json_dumps(variants or []),
        created_at=utcnow_naive(),
        updated_at=utcnow_naive(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
