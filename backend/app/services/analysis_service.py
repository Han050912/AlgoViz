"""
Analysis orchestration service: creates analysis records, manages status transitions,
and coordinates between sandbox execution and AI service.
"""
import uuid
from datetime import datetime
from typing import Optional, AsyncIterator
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis import Analysis, AnalysisStatus
from app.models.analysis_report import AnalysisReport
from app.models.execution_trace import ExecutionTrace


class AnalysisService:
    """Orchestrates code analysis from creation through completion."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_analysis(
        self, user_id: str, project_id: str, api_config_id: Optional[str] = None
    ) -> Analysis:
        analysis = Analysis(
            id=str(uuid.uuid4()),
            project_id=project_id,
            user_id=user_id,
            api_config_id=api_config_id,
            status=AnalysisStatus.pending,
        )
        self.db.add(analysis)
        await self.db.commit()
        await self.db.refresh(analysis)
        return analysis

    async def mark_running(self, analysis: Analysis) -> Analysis:
        analysis.status = AnalysisStatus.running
        analysis.started_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(analysis)
        return analysis

    async def save_trace(
        self,
        analysis: Analysis,
        trace_data: dict,
        execution_mode: str,
    ) -> ExecutionTrace:
        trace = ExecutionTrace(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            execution_mode=execution_mode,
            trace_data=trace_data,
            environment_info={"runtime": "ai_simulated", "version": "1.0"},
        )
        self.db.add(trace)
        await self.db.commit()
        await self.db.refresh(trace)
        return trace

    async def save_report(
        self,
        analysis: Analysis,
        markdown_content: str,
        time_complexity: str = "",
        space_complexity: str = "",
        algorithm_type: str = "",
    ) -> AnalysisReport:
        report = AnalysisReport(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            markdown_content=markdown_content,
            time_complexity=time_complexity,
            space_complexity=space_complexity,
            algorithm_type=algorithm_type,
        )
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def mark_completed(self, analysis: Analysis) -> Analysis:
        analysis.status = AnalysisStatus.completed
        analysis.completed_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(analysis)
        return analysis

    async def mark_failed(self, analysis: Analysis, error_message: str) -> Analysis:
        analysis.status = AnalysisStatus.failed
        analysis.error_message = error_message
        analysis.completed_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(analysis)
        return analysis
