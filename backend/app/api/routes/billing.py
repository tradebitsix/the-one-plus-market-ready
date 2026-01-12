from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_tenant_context
from app.core.config import settings

router = APIRouter()

@router.get("/status")
def status(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    # Stripe integration is intentionally stub-safe.
    enabled = bool(settings.STRIPE_SECRET_KEY)
    return {"stripe_enabled": enabled, "tenant_id": ctx["tenant_id"]}

@router.post("/checkout")
def checkout(request: Request, plan: str = "pro", db: Session = Depends(get_db), user=Depends(get_current_user), ctx=Depends(get_tenant_context)):
    # Safe stub: returns a fake URL unless Stripe keys are present.
    if not settings.STRIPE_SECRET_KEY:
        return {"mode": "stub", "checkout_url": "https://example.invalid/stripe-not-configured", "plan": plan}
    # Real Stripe wiring can be added here.
    return {"mode": "todo", "detail": "Stripe keys present; implement checkout session creation."}
