"""Project CRUD service with SHA-256 hashing and pagination."""
import hashlib
from typing import Optional, Sequence, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.models.project import Project


class ProjectService:
    """Handles CRUD for code projects."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, language: str, source_code: str, name: Optional[str] = None) -> Project:
        source_hash = hashlib.sha256(source_code.encode("utf-8")).hexdigest()
        project = Project(
            user_id=user_id,
            name=name,
            title=name,
            language=language.lower(),
            source_code=source_code,
            source_hash=source_hash,
        )
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def list_projects(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        language: Optional[str] = None,
    ) -> Tuple[Sequence[Project], int]:
        query = select(Project).where(Project.user_id == user_id)
        count_query = select(func.count(Project.id)).where(Project.user_id == user_id)

        if language:
            query = query.where(Project.language == language.lower())
            count_query = count_query.where(Project.language == language.lower())

        # Total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginated results
        query = query.order_by(Project.updated_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        projects = result.scalars().all()

        return projects, total

    async def get_project(self, project_id: str, user_id: str) -> Optional[Project]:
        result = await self.db.execute(
            select(Project).where(
                Project.id == project_id,
                Project.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def delete(self, project: Project) -> None:
        await self.db.delete(project)
        await self.db.commit()

    async def toggle_favorite(self, project: Project) -> Project:
        project.is_favorite = not project.is_favorite
        await self.db.commit()
        await self.db.refresh(project)
        return project
