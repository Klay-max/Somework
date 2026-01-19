"""create users table

Revision ID: 001
Revises: 
Create Date: 2025-12-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 创建 users 表（SQLAlchemy 会自动创建 userrole 枚举类型）
    op.create_table(
        'users',
        sa.Column('user_id', UUID(as_uuid=True), primary_key=True),
        sa.Column('phone', sa.String(11), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('student', 'parent', 'teacher', 'admin', name='userrole', create_type=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
    )
    
    # 创建索引
    op.create_index('ix_users_user_id', 'users', ['user_id'])
    op.create_index('ix_users_phone', 'users', ['phone'])


def downgrade() -> None:
    # 删除索引
    op.drop_index('ix_users_phone', table_name='users')
    op.drop_index('ix_users_user_id', table_name='users')
    
    # 删除表
    op.drop_table('users')
    
    # 删除枚举类型
    op.execute("DROP TYPE userrole")
