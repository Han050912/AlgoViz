"""API config CRUD service with AES-256-GCM encryption for API keys."""
from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.api_config import ApiConfig
from app.core.security import api_key_crypto


class ConfigService:
    """Handles CRUD operations for API configs with key encryption."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self, user_id: str, label: str, base_url: str, api_key: str, model_name: str
    ) -> ApiConfig:
        ciphertext, iv = api_key_crypto.encrypt(api_key)
        config = ApiConfig(
            user_id=user_id,
            label=label,
            base_url=base_url,
            encrypted_api_key=ciphertext,
            encryption_iv=iv,
            model_name=model_name,
        )
        self.db.add(config)
        await self.db.flush()

        # If this is the user's first config or requested as default, set is_default
        result = await self.db.execute(
            select(ApiConfig).where(
                ApiConfig.user_id == user_id,
                ApiConfig.is_default == True,
                ApiConfig.id != config.id,
            )
        )
        existing_default = result.scalar_one_or_none()
        if existing_default is None:
            config.is_default = True

        await self.db.commit()
        await self.db.refresh(config)
        return config

    async def get_user_configs(self, user_id: str) -> Sequence[ApiConfig]:
        result = await self.db.execute(
            select(ApiConfig)
            .where(ApiConfig.user_id == user_id)
            .order_by(ApiConfig.is_default.desc(), ApiConfig.created_at.desc())
        )
        return result.scalars().all()

    async def get_config(self, config_id: str, user_id: str) -> Optional[ApiConfig]:
        result = await self.db.execute(
            select(ApiConfig).where(
                ApiConfig.id == config_id,
                ApiConfig.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def update(
        self,
        config: ApiConfig,
        label: Optional[str] = None,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ) -> ApiConfig:
        if label is not None:
            config.label = label
        if base_url is not None:
            config.base_url = base_url
        if api_key is not None:
            ciphertext, iv = api_key_crypto.encrypt(api_key)
            config.encrypted_api_key = ciphertext
            config.encryption_iv = iv
        if model_name is not None:
            config.model_name = model_name

        await self.db.commit()
        await self.db.refresh(config)
        return config

    async def delete(self, config: ApiConfig) -> None:
        await self.db.delete(config)
        await self.db.commit()

    async def set_default(self, config: ApiConfig, user_id: str) -> ApiConfig:
        # Unset all other defaults for this user
        await self.db.execute(
            update(ApiConfig)
            .where(ApiConfig.user_id == user_id, ApiConfig.is_default == True)
            .values(is_default=False)
        )
        config.is_default = True
        await self.db.commit()
        await self.db.refresh(config)
        return config

    async def decrypt_api_key(self, config: ApiConfig) -> str:
        return api_key_crypto.decrypt(
            config.encrypted_api_key, config.encryption_iv
        )
