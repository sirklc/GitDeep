"""repo_analyses.user_id nullable yapıldı (anonim analiz desteği)

Revision ID: 0001_user_id_nullable
Revises:
Create Date: 2026-07-03
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_user_id_nullable"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "repo_analyses",
        "user_id",
        existing_type=sa.Integer(),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "repo_analyses",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
