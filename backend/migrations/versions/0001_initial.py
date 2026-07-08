"""initial: users, newsletter_subscribers

Revision ID: 0001
Revises:
Create Date: 2026-07-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("locale", sa.String(length=5), nullable=False, server_default="en"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "newsletter_subscribers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("locale", sa.String(length=5), nullable=False, server_default="en"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_newsletter_subscribers_email", "newsletter_subscribers", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_newsletter_subscribers_email", table_name="newsletter_subscribers")
    op.drop_table("newsletter_subscribers")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
