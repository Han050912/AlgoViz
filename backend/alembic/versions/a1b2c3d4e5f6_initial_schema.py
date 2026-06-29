"""initial schema

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-06-29
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # --- users ---
    op.create_table(
        'users',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('nickname', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Index('ix_users_email', 'email'),
    )

    # --- api_configs ---
    op.create_table(
        'api_configs',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('user_id', sa.CHAR(36),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('label', sa.String(100), nullable=False),
        sa.Column('base_url', sa.String(512), nullable=False),
        sa.Column('encrypted_api_key', mysql.VARBINARY(512), nullable=False),
        sa.Column('encryption_iv', mysql.VARBINARY(32), nullable=False),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('is_default', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # --- projects ---
    op.create_table(
        'projects',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('user_id', sa.CHAR(36),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('language', sa.String(20), nullable=False),
        sa.Column('source_code', mysql.MEDIUMTEXT, nullable=False),
        sa.Column('source_hash', sa.String(64), nullable=False),
        sa.Column('is_favorite', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # --- analyses ---
    op.create_table(
        'analyses',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('project_id', sa.CHAR(36),
                  sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.CHAR(36),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('api_config_id', sa.CHAR(36),
                  sa.ForeignKey('api_configs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('status', sa.Enum('pending', 'running', 'completed', 'failed',
                                     name='analysisstatus'), nullable=False),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # --- analysis_reports (1:1 with analyses) ---
    op.create_table(
        'analysis_reports',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('analysis_id', sa.CHAR(36),
                  sa.ForeignKey('analyses.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('algorithm_type', sa.String(100), nullable=True),
        sa.Column('time_complexity', sa.String(50), nullable=True),
        sa.Column('space_complexity', sa.String(50), nullable=True),
        sa.Column('markdown_content', mysql.MEDIUMTEXT, nullable=True),
        sa.Column('metadata_json', sa.JSON, nullable=True),
    )

    # --- execution_traces (1:1 with analyses) ---
    op.create_table(
        'execution_traces',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('analysis_id', sa.CHAR(36),
                  sa.ForeignKey('analyses.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('execution_mode', sa.String(20), nullable=True),
        sa.Column('trace_data', sa.JSON, nullable=True),
        sa.Column('environment_info', sa.JSON, nullable=True),
    )


def downgrade():
    op.drop_table('execution_traces')
    op.drop_table('analysis_reports')
    op.drop_table('analyses')
    op.drop_table('projects')
    op.drop_table('api_configs')
    op.drop_table('users')
