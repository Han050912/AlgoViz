"""Project CRUD endpoints + favorite toggle."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from math import ceil

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.project_service import ProjectService
from app.schemas.project import ProjectCreate, ProjectOut
from app.schemas.common import APIResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=APIResponse[ProjectOut], status_code=status.HTTP_201_CREATED)
async def create_project(
    req: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ProjectService(db)
    project = await svc.create(
        user_id=current_user.id,
        language=req.language,
        source_code=req.source_code,
        name=req.name,
    )
    return APIResponse(code=201, message="项目创建成功", data=ProjectOut.model_validate(project))


@router.get("", response_model=APIResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    language: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ProjectService(db)
    projects, total = await svc.list_projects(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        language=language,
    )
    total_pages = ceil(total / page_size) if total > 0 else 0
    return APIResponse(
        code=200,
        message="success",
        data={
            "items": [ProjectOut.model_validate(p) for p in projects],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        },
    )


@router.get("/{project_id}", response_model=APIResponse[ProjectOut])
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ProjectService(db)
    project = await svc.get_project(project_id, current_user.id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    return APIResponse(code=200, message="success", data=ProjectOut.model_validate(project))


@router.delete("/{project_id}", response_model=APIResponse)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ProjectService(db)
    project = await svc.get_project(project_id, current_user.id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    await svc.delete(project)
    return APIResponse(code=200, message="项目已删除", data=None)


@router.put("/{project_id}/favorite", response_model=APIResponse[ProjectOut])
async def toggle_favorite(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ProjectService(db)
    project = await svc.get_project(project_id, current_user.id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    project = await svc.toggle_favorite(project)
    return APIResponse(code=200, message="收藏状态已切换", data=ProjectOut.model_validate(project))
