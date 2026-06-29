"""API config CRUD endpoints + test connection + set default."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.config_service import ConfigService
from app.schemas.config import ConfigCreate, ConfigUpdate, ConfigOut, ConfigTestResult
from app.schemas.common import APIResponse

router = APIRouter(prefix="/configs", tags=["AI Configs"])


@router.post("", response_model=APIResponse[ConfigOut], status_code=status.HTTP_201_CREATED)
async def create_config(
    req: ConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ConfigService(db)
    config = await svc.create(
        user_id=current_user.id,
        label=req.label,
        base_url=req.base_url,
        api_key=req.api_key,
        model_name=req.model_name,
    )
    return APIResponse(code=201, message="配置创建成功", data=ConfigOut.model_validate(config))


@router.get("", response_model=APIResponse[list[ConfigOut]])
async def list_configs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ConfigService(db)
    configs = await svc.get_user_configs(current_user.id)
    return APIResponse(
        code=200,
        message="success",
        data=[ConfigOut.model_validate(c) for c in configs],
    )


@router.get("/{config_id}", response_model=APIResponse[ConfigOut])
async def get_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ConfigService(db)
    config = await svc.get_config(config_id, current_user.id)
    if config is None:
        raise HTTPException(status_code=404, detail="配置不存在")
    return APIResponse(code=200, message="success", data=ConfigOut.model_validate(config))


@router.put("/{config_id}", response_model=APIResponse[ConfigOut])
async def update_config(
    config_id: str,
    req: ConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ConfigService(db)
    config = await svc.get_config(config_id, current_user.id)
    if config is None:
        raise HTTPException(status_code=404, detail="配置不存在")
    config = await svc.update(
        config,
        label=req.label,
        base_url=req.base_url,
        api_key=req.api_key,
        model_name=req.model_name,
    )
    return APIResponse(code=200, message="配置更新成功", data=ConfigOut.model_validate(config))


@router.delete("/{config_id}", response_model=APIResponse)
async def delete_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ConfigService(db)
    config = await svc.get_config(config_id, current_user.id)
    if config is None:
        raise HTTPException(status_code=404, detail="配置不存在")
    await svc.delete(config)
    return APIResponse(code=200, message="配置已删除", data=None)


@router.post("/{config_id}/test", response_model=APIResponse[ConfigTestResult])
async def test_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ConfigService(db)
    config = await svc.get_config(config_id, current_user.id)
    if config is None:
        raise HTTPException(status_code=404, detail="配置不存在")

    # Test the connection with a lightweight models.list call
    try:
        from openai import AsyncOpenAI

        api_key = await svc.decrypt_api_key(config)
        client = AsyncOpenAI(base_url=config.base_url, api_key=api_key, timeout=10.0)
        await client.models.list()
        return APIResponse(
            code=200,
            message="连接测试成功",
            data=ConfigTestResult(ok=True, message="API 连接正常"),
        )
    except Exception as e:
        return APIResponse(
            code=200,
            message="连接测试失败",
            data=ConfigTestResult(ok=False, message=str(e)),
        )


@router.put("/{config_id}/default", response_model=APIResponse[ConfigOut])
async def set_default_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ConfigService(db)
    config = await svc.get_config(config_id, current_user.id)
    if config is None:
        raise HTTPException(status_code=404, detail="配置不存在")
    config = await svc.set_default(config, current_user.id)
    return APIResponse(code=200, message="已设为默认配置", data=ConfigOut.model_validate(config))
