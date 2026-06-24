from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from uuid import UUID
from fastapi import HTTPException

from app.models.cita import Cita
from app.models.servicio import Servicio
from app.models.horario_barbero import HorarioBarbero
from app.schemas.cita import CitaCreate


def calcular_hora_fin(hora_inicio, duracion_minutos: int):
    dt = datetime.combine(datetime.today(), hora_inicio)
    return (dt + timedelta(minutes=duracion_minutos)).time()


def validar_disponibilidad(db: Session, barbero_id: UUID, fecha, hora_inicio, hora_fin, excluir_cita_id=None):
    """Verifica que el barbero no tenga otra cita en ese bloque horario."""
    dia_semana = fecha.weekday()  # 0=Lunes

    horario = db.query(HorarioBarbero).filter(
        HorarioBarbero.barbero_id == barbero_id,
        HorarioBarbero.dia_semana == dia_semana,
        HorarioBarbero.activo == True,
    ).first()

    if not horario:
        raise HTTPException(status_code=400, detail="El barbero no atiende ese día")

    if hora_inicio < horario.hora_inicio or hora_fin > horario.hora_fin:
        raise HTTPException(status_code=400, detail="La cita está fuera del horario del barbero")

    query = db.query(Cita).filter(
        Cita.barbero_id == barbero_id,
        Cita.fecha == fecha,
        Cita.estado != "cancelada",
        Cita.hora_inicio < hora_fin,
        Cita.hora_fin > hora_inicio,
    )
    if excluir_cita_id:
        query = query.filter(Cita.id != excluir_cita_id)

    conflicto = query.first()
    if conflicto:
        raise HTTPException(status_code=409, detail="El barbero ya tiene una cita en ese horario")


def crear_cita(db: Session, data: CitaCreate) -> Cita:
    servicio = db.query(Servicio).filter(Servicio.id == data.servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    hora_fin = calcular_hora_fin(data.hora_inicio, servicio.duracion_minutos)
    validar_disponibilidad(db, data.barbero_id, data.fecha, data.hora_inicio, hora_fin)

    cita = Cita(
        cliente_id=data.cliente_id,
        barbero_id=data.barbero_id,
        servicio_id=data.servicio_id,
        silla_id=data.silla_id,
        fecha=data.fecha,
        hora_inicio=data.hora_inicio,
        hora_fin=hora_fin,
        notas=data.notas,
        estado="asignada",
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return cita
