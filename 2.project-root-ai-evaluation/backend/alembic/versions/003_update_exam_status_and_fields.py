"""update exam status and fields

Revision ID: 003
Revises: 002
Create Date: 2025-12-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 添加新的状态值
    op.execute("""
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'ocr_completed';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'ocr_failed';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'parsing';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'parsing_completed';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'parsing_failed';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'analyzing';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'analyzing_completed';
        ALTER TYPE examstatus ADD VALUE IF NOT EXISTS 'analyzing_failed';
    """)
    
    # 重命名 parsed_exam 为 parsed_result
    op.alter_column('exams', 'parsed_exam',
                    new_column_name='parsed_result',
                    existing_type=postgresql.JSONB)
    
    # 添加 error_message 字段
    op.add_column('exams', sa.Column('error_message', sa.Text(), nullable=True))


def downgrade() -> None:
    # 移除 error_message 字段
    op.drop_column('exams', 'error_message')
    
    # 重命名回 parsed_exam
    op.alter_column('exams', 'parsed_result',
                    new_column_name='parsed_exam',
                    existing_type=postgresql.JSONB)
    
    # 注意：无法移除 enum 值，这是 PostgreSQL 的限制
