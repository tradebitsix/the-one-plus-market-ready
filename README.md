THE_ONE+ (Market-Deployable SaaS Starter)

What this is
- A multi-tenant SaaS foundation: Auth, Tenants (invite/accept), Admin, Memory, Growth, Safety, Ops.
- Designed for: Vercel (frontend) + Railway/Fly/Render (backend) + Postgres/Redis.

Quick start in GitHub Codespaces

1) Start infra (Postgres + Redis)
   cd infra
   docker compose up -d

2) Backend
   cd backend
   cp .env.example .env
   # edit DATABASE_URL + JWT_SECRET
   python3 -m venv .venv
   . .venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

3) Frontend
   cd frontend
   cp .env.example .env
   # edit VITE_API_BASE_URL to your backend URL
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173

API
- Backend mounts routes under /api
- Health: GET /health
- Swagger: /docs

Deploy (Production)

A) Backend (Railway recommended)
- Root directory: backend
- Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Env vars:
  - DATABASE_URL=postgresql+psycopg://...
  - JWT_SECRET=... (required)
  - JWT_REFRESH_DAYS=30
  - CORS_ORIGINS=https://<your-vercel-domain>
- Run migrations once: alembic upgrade head

B) Frontend (Vercel)
- Root directory: frontend
- Build command: npm run build
- Output: dist
- Env vars:
  - VITE_API_BASE_URL=https://<your-backend-domain>

