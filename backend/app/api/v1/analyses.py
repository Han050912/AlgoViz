"""Analysis SSE streaming endpoint."""
import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.api_config import ApiConfig
from app.services.analysis_service import AnalysisService
from app.services.ai_service import AIService
from app.services.config_service import ConfigService

router = APIRouter(prefix="/analyses", tags=["Analyses"])


async def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/stream")
async def analyze_code_stream(
    project_id: str = Query(...),
    api_config_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate project ownership
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")

    # Validate API config ownership
    result = await db.execute(
        select(ApiConfig).where(ApiConfig.id == api_config_id, ApiConfig.user_id == current_user.id)
    )
    api_config = result.scalar_one_or_none()
    if api_config is None:
        raise HTTPException(status_code=404, detail="AI配置不存在")

    svc = AnalysisService(db)

    async def event_stream():
        analysis = None
        try:
            analysis = await svc.create_analysis(
                user_id=current_user.id,
                project_id=project_id,
                api_config_id=api_config_id,
            )

            analysis = await svc.mark_running(analysis)
            yield await _sse_event("status", {"status": "running", "analysis_id": analysis.id})

            config_svc = ConfigService(db)
            api_key = await config_svc.decrypt_api_key(api_config)

            ai = AIService(
                base_url=api_config.base_url,
                api_key=api_key,
                model_name=api_config.model_name,
            )

            # Step 1: Generate execution trace
            yield await _sse_event("status", {"status": "ai_tracing"})
            try:
                trace_data = await asyncio.wait_for(
                    ai.generate_trace(code=project.source_code, language=project.language),
                    timeout=15.0,
                )
                await svc.save_trace(analysis=analysis, trace_data=trace_data, execution_mode="ai_simulated")
                for step in trace_data.get("steps", []):
                    yield await _sse_event("trace", step)
            except asyncio.TimeoutError:
                yield await _sse_event("error", {"message": "Trace generation timed out (15s)"})
                await svc.mark_failed(analysis, "Trace generation timed out")
                await db.commit()
                return
            except Exception as e:
                yield await _sse_event("error", {"message": f"Trace generation failed: {str(e)}"})
                await svc.mark_failed(analysis, f"Trace generation failed: {str(e)}")
                await db.commit()
                return

            # Step 2: Stream AI analysis
            yield await _sse_event("status", {"status": "ai_analyzing"})
            full_report = ""
            try:
                async for chunk in ai.analyze_code_stream(code=project.source_code, language=project.language):
                    full_report += chunk
                    yield await _sse_event("analysis", {"chunk": chunk})
            except Exception as e:
                yield await _sse_event("error", {"message": f"Analysis failed: {str(e)}"})
                await svc.mark_failed(analysis, f"Analysis failed: {str(e)}")
                await db.commit()
                return

            await svc.save_report(analysis=analysis, markdown_content=full_report)
            await svc.mark_completed(analysis)
            await db.commit()

            yield await _sse_event("complete", {
                "analysis_id": analysis.id,
                "total_steps": len(trace_data.get("steps", [])),
            })

        except Exception as e:
            if analysis:
                try:
                    await svc.mark_failed(analysis, str(e))
                except Exception:
                    pass
            try:
                yield await _sse_event("error", {"message": str(e)})
            except Exception:
                pass
            try:
                await db.commit()
            except Exception:
                pass

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
