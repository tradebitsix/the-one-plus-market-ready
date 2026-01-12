"""SafetyManager / Ethics enforcement layer

Rules are stored as JSON in `policies`.
Each rule is a dict with:
- id (string)
- type: "block_action" | "block_content" | "require_role"
- match: object depending on type

Enforcement is deterministic. No LLM required.
"""

from sqlalchemy.orm import Session
from app.db import models
from .utils import json_loads
from typing import Any

DEFAULT_GLOBAL_POLICY = [
    {"id": "no-admin-delete-audit", "type": "block_action", "match": {"action": "audit.delete"}},
    {"id": "block-secrets", "type": "block_content", "match": {"contains_any": ["JWT_SECRET", "OPENAI_API_KEY", "STRIPE_SECRET_KEY"]}},
]

def _active_policies(db: Session, tenant_id: str | None):
    q = db.query(models.Policy).filter(models.Policy.is_active == True)
    # global + tenant policies
    rows = q.filter((models.Policy.tenant_id == None) | (models.Policy.tenant_id == tenant_id)).all()
    out = []
    for r in rows:
        try:
            out.extend(json_loads(r.rules_json) or [])
        except Exception:
            continue
    return out

def evaluate(db: Session, *, tenant_id: str | None, action: str, role: str | None, content: str | None = None) -> tuple[bool, str | None]:
    rules = DEFAULT_GLOBAL_POLICY + _active_policies(db, tenant_id)
    for rule in rules:
        rtype = rule.get("type")
        match = rule.get("match", {})
        if rtype == "block_action":
            if match.get("action") == action:
                return (False, f"Blocked by policy: {rule.get('id')}")
        if rtype == "require_role":
            if match.get("action") == action:
                required = match.get("role")
                if required and role != required:
                    return (False, f"Insufficient role for action (requires {required})")
        if rtype == "block_content" and content:
            needles = match.get("contains_any") or []
            for n in needles:
                if n and n in content:
                    return (False, f"Content blocked by policy: {rule.get('id')}")
    return (True, None)
