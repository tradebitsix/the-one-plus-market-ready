"""ops modules (client/worker/messaging)

Revision ID: 0002_ops
Revises: 0001_init
Create Date: 2026-01-08
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_ops"
down_revision = "0001_init"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "client_requests",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("tenant_id", sa.String(36), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("created_by_user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False, server_default="open"),
        sa.Column("priority", sa.String(20), nullable=False, server_default="normal"),
        sa.Column("created_at", sa.DateTime(), nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "worker_jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("tenant_id", sa.String(36), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("assigned_to_user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("status", sa.String(40), nullable=False, server_default="queued"),
        sa.Column("scheduled_for", sa.DateTime(), nullable=True, index=True),
        sa.Column("checklist_json", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(), nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("tenant_id", sa.String(36), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("thread_type", sa.String(40), nullable=False),
        sa.Column("thread_id", sa.String(36), nullable=False, index=True),
        sa.Column("sender_user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, index=True),
    )

def downgrade():
    op.drop_table("messages")
    op.drop_table("worker_jobs")
    op.drop_table("client_requests")
