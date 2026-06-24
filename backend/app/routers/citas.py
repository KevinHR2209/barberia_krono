from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from datetime import date

from app.database import get_db
from app.models.cita import Cita
from app.models.horario_barbero import HorarioBarbero
from app.models.servicio import Servicio
from app.schemas.cita import CitaCreate, CitaUpdateEstado, CitaOut
from app.services.cita_service import crear_cita

router = APIRouter()


@router.get("/", response_model=List[CitaOut])
def listar_citas(db: Session = Depends(get_db)):
    return db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.barbero),
        joinedload(Cita.servicio),
    ).order_by(Cita.fecha, Cita.hora_inicio).all()


@router.get("/barbero/{barbero_id}", response_model=List[CitaOut])
def citas_por_barbero(barbero_id: UUID, db: Session = Depends(get_db)):
    return db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.barbero),
        joinedload(Cita.servicio),
    ).filter(
        Cita.barbero_id == barbero_id,
        Cita.estado != "cancelada",
    ).order_by(Cita.fecha, Cita.hora_inicio).all()


@router.get("/disponibilidad/{barbero_id}/{fecha}")
def disponibilidad_barbero(barbero_id: UUID, fecha: date, db: Session = Depends(get_db)):
    """Devuelve bloques de 30 min entre 09:00-19:00 con su estado (disponible/ocupado)"""
    dia_semana = fecha.weekday()
    horario = db.query(HorarioBarbero).filter(
        HorarioBarbero.barbero_id == barbero_id,
        HorarioBarbero.dia_semana == dia_semana,
        HorarioBarbero.activo == True,
    ).first()

    if not horario:
        return {"atiende": False, "bloques": []}

    citas_del_dia = db.query(Cita).filter(
        Cita.barbero_id == barbero_id,
        Cita.fecha == fecha,
        Cita.estado != "cancelada",
    ).all()

    from datetime import datetime, timedelta
    bloques = []
    cursor = datetime.combine(fecha, horario.hora_inicio)
    fin_jornada = datetime.combine(fecha, horario.hora_fin)

    while cursor + timedelta(minutes=30) <= fin_jornada:
        hora_bloque = cursor.time()
        fin_bloque = (cursor + timedelta(minutes=30)).time()
        ocupado = any(
            c.hora_inicio <= hora_bloque < c.hora_fin or
            c.hora_inicio < fin_bloque <= c.hora_fin
            for c in citas_del_dia
        )
        cita_info = None
        if ocupado:
            cita = next((
                c for c in citas_del_dia
                if c.hora_inicio <= hora_bloque < c.hora_fin
            ), None)
            if cita:
                cita_info = {
                    "cliente": f"{cita.cliente.nombre} {cita.cliente.apellido}" if cita.cliente else "",
                    "servicio": cita.servicio.nombre if cita.servicio else "",
                    "hora_inicio": str(cita.hora_inicio)[:5],
                    "hora_fin": str(cita.hora_fin)[:5],
                }
        bloques.append({
            "hora": str(hora_bloque)[:5],
            "ocupado": ocupado,
            "cita": cita_info,
        })
        cursor += timedelta(minutes=30)

    return {"atiende": True, "bloques": bloques}


@router.post("/", response_model=CitaOut, status_code=201)
def nueva_cita(data: CitaCreate, db: Session = Depends(get_db)):
    return crear_cita(db, data)


@router.patch("/{cita_id}/estado", response_model=CitaOut)
def cambiar_estado_cita(cita_id: UUID, data: CitaUpdateEstado, db: Session = Depends(get_db)):
    cita = db.query(Cita).filter(Cita.id == cita_id).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    estados_validos = ["asignada", "completada", "cancelada"]
    if data.estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Debe ser uno de: {estados_validos}")
    cita.estado = data.estado
    db.commit()
    db.refresh(cita)
    return cita


@router.get("/{cita_id}", response_model=CitaOut)
def obtener_cita(cita_id: UUID, db: Session = Depends(get_db)):
    cita = db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.barbero),
        joinedload(Cita.servicio),
    ).filter(Cita.id == cita_id).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita
