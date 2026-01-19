"""add soft delete to exam

Revision ID: 007
Revises: 006
Create Date: 2025-12-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade():
    # 添加软删除字段
    op.add_column('exams', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    op.add_column('exams', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    
    # 添加索引以提高查询性能
    op.create_index('ix_exams_is_deleted', 'exams', ['is_deleted'])


def downgrade():
    op.drop_index('ix_exams_is_deleted', table_name='exams')
    op.drop_column('exams', 'is_deleted')
    op.drop_column('exams', 'deleted_at')
