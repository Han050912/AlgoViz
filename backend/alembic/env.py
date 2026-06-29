"""
Alembic Environment Configuration.
Handles async→sync URL conversion and ensures all models are loaded for autogenerate.
"""
import os
import sys
from logging.config import fileConfig

from sqlalchemy import create_engine, pool

from alembic import context

# ── paths ──────────────────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

# ── models (must be imported BEFORE metadata is read) ─────────────
from app.models.base import Base                                    # noqa: E402
from app.models import user, api_config, project                   # noqa: E402,F401
from app.models import analysis, analysis_report, execution_trace  # noqa: E402,F401

# ── alembic.ini config ────────────────────────────────────────────
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _get_url() -> str:
    """Read DATABASE_URL from .env (sync pymysql dialect for Alembic)."""
    env_path = os.path.join(BACKEND_DIR, ".env")
    url = os.environ.get("DATABASE_URL")
    if url:
        return _ensure_sync(url)
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    raw = line.split("=", 1)[1].strip()
                    return _ensure_sync(raw)
    return config.get_main_option("sqlalchemy.url")


def _ensure_sync(url: str) -> str:
    """aiomysql → pymysql, bare mysql → pymysql+…"""
    if "aiomysql" in url:
        url = url.replace("aiomysql", "pymysql", 1)
    elif url.split("://")[0].startswith("mysql") and "pymysql" not in url:
        url = "pymysql" + url[len("mysql"):]
    return url


def run_migrations_offline():
    url = _get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    url = _get_url()
    engine = create_engine(url, poolclass=pool.NullPool)

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
