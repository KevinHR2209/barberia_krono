from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import time

DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]


class HorarioBase(BaseModel):
    barbero_id: UUID
    dia_semana: int  # 0=Lunes ... 6=Domingo
    hora_inicio: time
    hora_fin: time
    activo: bool = True


class HorarioCreate(HorarioBase):
    pass


class HorarioUpdate(BaseModel):
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    activo: Optional[bool] = None


class HorarioOut(HorarioBase):
    id: UUID

    class Config:
        from_attributes = True
