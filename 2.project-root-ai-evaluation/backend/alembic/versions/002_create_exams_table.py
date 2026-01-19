"""create exams table

Revision ID: 002
Revises: 001
Create Date: 2025-12-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 创建试卷状态枚举类型
    op.execute("CREATE TYPE examstatus AS ENUM ('uploaded', 'processing', 'completed', 'failed')")
    
    # 创建 exams 表
    op.create_table(
        'exams',
        sa.Column('exam_id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('original_image_url', sa.String(500), nullable=False),
        sa.Column('processed_image_url', sa.String(500), nullable=True),
        sa.Column('status', sa.Enum('uploaded', 'processing', 'completed', 'failed', name='examstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('subject', sa.String(50), nullable=True),
        sa.Column('grade', sa.String(50), nullable=True),
        sa.Column('total_score', sa.Integer(), nullable=True),
        sa.Column('exam_type', sa.String(50), nullable=True),
        sa.Column('ocr_result', JSONB, nullable=True),
        sa.Column('parsed_exam', JSONB, nullable=True),
        sa.Column('question_analysis', JSONB, nullable=True),
        sa.Column('handwriting_metrics', JSONB, nullable=True),
        sa.Column('diagnostic_report', JSONB, nullable=True),
        sa.Column('report_id', UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    )
    
    # 创建索引
    op.create_index('ix_exams_exam_id', 'exams', ['exam_id'])
    op.create_index('ix_exams_user_id', 'exams', ['user_id'])
    op.create_index('ix_exams_status', 'exams', ['status'])


def downgrade() -> None:
    # 删除索引
    op.drop_index('ix_exams_status', table_name='exams')
    op.drop_index('ix_exams_user_id', table_name='exams')
    op.drop_index('ix_exams_exam_id', table_name='exams')
    
    # 删除表
    op.drop_table('exams')
    
    # 删除枚举类型
    op.execute("DROP TYPE examstatus")
