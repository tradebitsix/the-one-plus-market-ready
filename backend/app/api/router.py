from fastapi import APIRouter
from .routes import auth, tenants, admin, memory, growth, safety, billing, ops

api = APIRouter()
api.include_router(auth.router, prefix="/auth", tags=["auth"])
api.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api.include_router(admin.router, prefix="/admin", tags=["admin"])
api.include_router(memory.router, prefix="/memory", tags=["memory"])
api.include_router(growth.router, prefix="/growth", tags=["growth"])
api.include_router(safety.router, prefix="/safety", tags=["safety"])
api.include_router(billing.router, prefix="/billing", tags=["billing"])
api.include_router(ops.router, prefix="/ops", tags=["ops"])
