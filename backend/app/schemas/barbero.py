from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


class BarberoBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    foto_url: Optional[str] = None
    silla_id: Optional[UUID] = None
    activo: bool = True


class BarberoCreate(BarberoBase):
    pass


class BarberoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    foto_url: Optional[str] = None
    silla_id: Optional[UUID] = None
    activo: Optional[bool] = None


class BarberoOut(BarberoBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
