"""create review_tasks table

Revision ID: 005
Revises: 004
Create Date: 2024-12-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 创建审核优先级枚举类型
    op.execute("""
        CREATE TYPE reviewpriority AS ENUM ('high', 'medium', 'low')
    """)
    
    # 创建审核状态枚举类型
    op.execute("""
        CREATE TYPE reviewstatus AS ENUM ('pending', 'in_progress', 'completed', 'cancelled')
    """)
    
    # 创建 review_tasks 表
    op.create_table(
        'review_tasks',
        sa.Column('review_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('exam_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('exams.exam_id'), nullable=False),
        sa.Column('question_id', sa.String(50), nullable=False),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.user_id'), nullable=True),
        sa.Column('priority', sa.Enum('high', 'medium', 'low', name='reviewpriority'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'cancelled', name='reviewstatus'), nullable=False),
        sa.Column('ai_judgment', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('teacher_judgment', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('teacher_comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True)
    )
    
    # 创建索引
    op.create_index('ix_review_tasks_review_id', 'review_tasks', ['review_id'])
    op.create_index('ix_review_tasks_exam_id', 'review_tasks', ['exam_id'])
    op.create_index('ix_review_tasks_question_id', 'review_tasks', ['question_id'])
    op.create_index('ix_review_tasks_assigned_to', 'review_tasks', ['assigned_to'])
    op.create_index('ix_review_tasks_priority', 'review_tasks', ['priority'])
    op.create_index('ix_review_tasks_status', 'review_tasks', ['status'])
    op.create_index('ix_review_tasks_created_at', 'review_tasks', ['created_at'])


def downgrade() -> None:
    # 删除索引
    op.drop_index('ix_review_tasks_created_at', 'review_tasks')
    op.drop_index('ix_review_tasks_status', 'review_tasks')
    op.drop_index('ix_review_tasks_priority', 'review_tasks')
    op.drop_index('ix_review_tasks_assigned_to', 'review_tasks')
    op.drop_index('ix_review_tasks_question_id', 'review_tasks')
    op.drop_index('ix_review_tasks_exam_id', 'review_tasks')
    op.drop_index('ix_review_tasks_review_id', 'review_tasks')
    
    # 删除表
    op.drop_table('review_tasks')
    
    # 删除枚举类型
    op.execute("DROP TYPE reviewstatus")
    op.execute("DROP TYPE reviewpriority")
