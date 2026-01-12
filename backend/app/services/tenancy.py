from sqlalchemy.orm import Session
from app.db import models
from .utils import utcnow_naive, make_token, normalize_slug
from app.core.security import hash_password, verify_password
from datetime import timedelta

def register_user(db: Session, email: str, password: str, display_name: str | None):
    existing = db.query(models.User).filter(models.User.email == email.lower()).first()
    if existing:
        raise ValueError("Email already registered")
    now = utcnow_naive()
    u = models.User(
        email=email.lower(),
        password_hash=hash_password(password),
        display_name=display_name,
        created_at=now,
        updated_at=now,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

def authenticate(db: Session, email: str, password: str):
    u = db.query(models.User).filter(models.User.email == email.lower()).first()
    if not u or not u.is_active:
        return None
    if not verify_password(password, u.password_hash):
        return None
    return u

def create_tenant(db: Session, *, owner_user_id: str, name: str, slug: str):
    slug = normalize_slug(slug)
    if db.query(models.Tenant).filter(models.Tenant.slug == slug).first():
        raise ValueError("Slug already in use")
    now = utcnow_naive()
    t = models.Tenant(name=name, slug=slug, plan="free", status="active", created_at=now, updated_at=now)
    db.add(t)
    db.commit()
    db.refresh(t)
    m = models.Membership(tenant_id=t.id, user_id=owner_user_id, role="owner", created_at=now)
    db.add(m)
    db.commit()
    return t, m

def list_user_tenants(db: Session, user_id: str):
    rows = db.query(models.Membership, models.Tenant).join(models.Tenant, models.Membership.tenant_id == models.Tenant.id)        .filter(models.Membership.user_id == user_id).all()
    return [{"tenant": t, "membership": m} for m, t in rows]

def require_membership(db: Session, user_id: str, tenant_id: str):
    m = db.query(models.Membership).filter(models.Membership.user_id == user_id, models.Membership.tenant_id == tenant_id).first()
    if not m:
        raise PermissionError("Not a member of this tenant")
    return m

def create_invite(db: Session, tenant_id: str, email: str, role: str):
    token = make_token(16)
    now = utcnow_naive()
    inv = models.Invite(
        tenant_id=tenant_id,
        email=email.lower(),
        role=role,
        token=token,
        expires_at=now + timedelta(days=7),
        accepted_at=None,
        created_at=now,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

def accept_invite(db: Session, token: str, user_id: str):
    inv = db.query(models.Invite).filter(models.Invite.token == token).first()
    if not inv:
        raise ValueError("Invalid invite token")
    if inv.accepted_at is not None:
        raise ValueError("Invite already used")
    now = utcnow_naive()
    if inv.expires_at < now:
        raise ValueError("Invite expired")
    inv.accepted_at = now
    db.add(inv)
    # upsert membership
    m = db.query(models.Membership).filter(models.Membership.tenant_id == inv.tenant_id, models.Membership.user_id == user_id).first()
    if not m:
        m = models.Membership(tenant_id=inv.tenant_id, user_id=user_id, role=inv.role, created_at=now)
        db.add(m)
    db.commit()
    db.refresh(inv)
    return inv, m
