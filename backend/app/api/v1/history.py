"""Analysis history endpoint with pagination and filtering."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from math import ceil

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.analysis import Analysis
from app.models.project import Project
from app.schemas.common import APIResponse

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=APIResponse)
async def list_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    language: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Analysis, Project.name, Project.language)
        .join(Project, Analysis.project_id == Project.id)
        .where(Analysis.user_id == current_user.id)
    )
    count_query = (
        select(func.count(Analysis.id))
        .join(Project, Analysis.project_id == Project.id)
        .where(Analysis.user_id == current_user.id)
    )

    if language:
        query = query.where(Project.language == language.lower())
        count_query = count_query.where(Project.language == language.lower())

    if status:
        query = query.where(Analysis.status == status)
        count_query = count_query.where(Analysis.status == status)

    # Total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginated results
    query = query.order_by(Analysis.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    rows = result.all()

    total_pages = ceil(total / page_size) if total > 0 else 0

    items = []
    for analysis, project_name, project_language in rows:
        items.append({
            "id": analysis.id,
            "project_id": analysis.project_id,
            "project_name": project_name,
            "language": project_language,
            "status": analysis.status.value if analysis.status else None,
            "error_message": analysis.error_message,
            "started_at": analysis.started_at.isoformat() if analysis.started_at else None,
            "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None,
            "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
        })

    return APIResponse(
        code=200,
        message="success",
        data={
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        },
    )
