"""add diagnostic status

Revision ID: 006
Revises: 005
Create Date: 2025-12-25

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    """添加诊断相关状态"""
    # 添加新的枚举值到 examstatus
    op.execute("""
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'diagnosing';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'diagnosed';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'diagnosing_failed';
    """)


def downgrade():
    """回滚诊断相关状态"""
    # PostgreSQL 不支持删除枚举值，需要重建枚举类型
    pass
