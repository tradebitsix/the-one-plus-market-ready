from fastapi import APIRouter
from .routes import auth, tenants, admin, memory, growth, safety, billing, ops

api = APIRouter()

# auth (no /api prefix)
api.include_router(auth.router, prefix="/auth", tags=["auth"])

# all other modules under /api
api.include_router(tenants.router, prefix="/api/tenants", tags=["tenants"])
api.include_router(admin.router, prefix="/api/admin", tags=["admin"])
api.include_router(memory.router, prefix="/api/memory", tags=["memory"])
api.include_router(growth.router, prefix="/api/growth", tags=["growth"])
api.include_router(safety.router, prefix="/api/safety", tags=["safety"])
api.include_router(billing.router, prefix="/api/billing", tags=["billing"])
api.include_router(ops.router, prefix="/api/ops", tags=["ops"])