from pydantic import BaseModel, EmailStr, Field
from typing import Any, Optional, List, Dict
from datetime import datetime

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    email: EmailStr
    display_name: str | None = None
    is_superadmin: bool
    class Config:
        from_attributes = True

class UserRegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(default=None, max_length=120)

class UserLoginIn(BaseModel):
    email: EmailStr
    password: str

class TenantCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")

class TenantOut(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    status: str
    class Config:
        from_attributes = True

class MembershipOut(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    role: str
    class Config:
        from_attributes = True

class InviteCreateIn(BaseModel):
    email: EmailStr
    role: str = Field(default="member", max_length=40)

class InviteOut(BaseModel):
    id: str
    tenant_id: str
    email: EmailStr
    role: str
    token: str
    expires_at: datetime
    accepted_at: datetime | None
    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: str
    tenant_id: str | None
    actor_user_id: str | None
    action: str
    target_type: str | None
    target_id: str | None
    ip: str | None
    ua: str | None
    meta_json: str | None
    created_at: datetime
    class Config:
        from_attributes = True

class SettingUpsertIn(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    value: Any

class SettingOut(BaseModel):
    id: str
    tenant_id: str | None
    user_id: str | None
    key: str
    value_json: str
    updated_at: datetime
    class Config:
        from_attributes = True

class MemoryNoteCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str
    tags: List[str] = Field(default_factory=list)

class MemoryNoteOut(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    title: str
    content: str
    tags_json: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class MemorySourceCreateIn(BaseModel):
    source_type: str = Field(min_length=1, max_length=40)
    title: str = Field(min_length=1, max_length=220)
    url: str | None = Field(default=None, max_length=800)
    content: str | None = None
    meta: Dict[str, Any] | None = None

class MemorySourceOut(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    source_type: str
    title: str
    url: str | None
    created_at: datetime
    class Config:
        from_attributes = True

class GrowthEventIn(BaseModel):
    event: str = Field(min_length=1, max_length=120)
    properties: Dict[str, Any] = Field(default_factory=dict)

class GrowthEventOut(BaseModel):
    id: str
    tenant_id: str
    user_id: str | None
    event: str
    properties_json: str
    created_at: datetime
    class Config:
        from_attributes = True

class GrowthExperimentIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    hypothesis: str | None = None
    variants: List[Dict[str, Any]] = Field(default_factory=list)

class GrowthExperimentOut(BaseModel):
    id: str
    tenant_id: str
    name: str
    status: str
    hypothesis: str | None
    variants_json: str
    class Config:
        from_attributes = True

class PolicyIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    rules: List[Dict[str, Any]]

class PolicyOut(BaseModel):
    id: str
    tenant_id: str | None
    name: str
    rules_json: str
    is_active: bool
    updated_at: datetime
    class Config:
        from_attributes = True

class ClientRequestCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: str = Field(default="normal", max_length=20)

class ClientRequestOut(BaseModel):
    id: str
    tenant_id: str
    created_by_user_id: str | None
    title: str
    description: str | None
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class WorkerJobCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    scheduled_for: datetime | None = None
    checklist: List[Dict[str, Any]] = Field(default_factory=list)

class WorkerJobOut(BaseModel):
    id: str
    tenant_id: str
    assigned_to_user_id: str | None
    title: str
    status: str
    scheduled_for: datetime | None
    checklist_json: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class MessageCreateIn(BaseModel):
    thread_type: str = Field(min_length=1, max_length=40)
    thread_id: str = Field(min_length=1, max_length=36)
    body: str = Field(min_length=1)

class MessageOut(BaseModel):
    id: str
    tenant_id: str
    thread_type: str
    thread_id: str
    sender_user_id: str | None
    body: str
    created_at: datetime
    class Config:
        from_attributes = True
