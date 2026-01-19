"""add analysis_result field and update exam status

Revision ID: 004
Revises: 003
Create Date: 2024-12-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 添加 analysis_result 字段
    op.add_column('exams', sa.Column('analysis_result', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    
    # 更新 ExamStatus 枚举类型
    # 注意：PostgreSQL 不支持直接修改枚举类型，需要先创建新类型，然后替换
    op.execute("ALTER TYPE examstatus RENAME TO examstatus_old")
    op.execute("""
        CREATE TYPE examstatus AS ENUM (
            'uploaded', 'processing', 'ocr_completed', 'ocr_failed',
            'parsing', 'parsed', 'parsing_failed',
            'analyzing', 'analyzed', 'analyzing_failed',
            'reviewed', 'completed', 'failed'
        )
    """)
    op.execute("ALTER TABLE exams ALTER COLUMN status TYPE examstatus USING status::text::examstatus")
    op.execute("DROP TYPE examstatus_old")


def downgrade() -> None:
    # 删除 analysis_result 字段
    op.drop_column('exams', 'analysis_result')
    
    # 恢复旧的 ExamStatus 枚举类型
    op.execute("ALTER TYPE examstatus RENAME TO examstatus_new")
    op.execute("""
        CREATE TYPE examstatus AS ENUM (
            'uploaded', 'processing', 'ocr_completed', 'ocr_failed',
            'parsing', 'parsing_completed', 'parsing_failed',
            'analyzing', 'analyzing_completed', 'analyzing_failed',
            'completed', 'failed'
        )
    """)
    op.execute("ALTER TABLE exams ALTER COLUMN status TYPE examstatus USING status::text::examstatus")
    op.execute("DROP TYPE examstatus_new")
