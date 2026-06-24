from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SillaBase(BaseModel):
    numero: int
    descripcion: Optional[str] = None
    activa: bool = True


class SillaCreate(SillaBase):
    pass


class SillaUpdate(BaseModel):
    descripcion: Optional[str] = None
    activa: Optional[bool] = None


class SillaOut(SillaBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
