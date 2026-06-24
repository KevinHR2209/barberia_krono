import secrets
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cita import Cita
from app.models.barbero import Barbero
from app.models.cliente import Cliente
from app.models.servicio import Servicio
from app.models.horario_barbero import HorarioBarbero
from app.schemas.cita import CitaCreate
from app.services.email_service import enviar_confirmacion


def crear_cita(db: Session, data: CitaCreate) -> Cita:
    barbero = db.query(Barbero).filter(Barbero.id == data.barbero_id, Barbero.activo == True).first()
    if not barbero:
        raise HTTPException(status_code=404, detail="Barbero no encontrado o inactivo")

    servicio = db.query(Servicio).filter(Servicio.id == data.servicio_id, Servicio.activo == True).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    cliente = db.query(Cliente).filter(Cliente.id == data.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    dia_semana = data.fecha.weekday()
    horario = db.query(HorarioBarbero).filter(
        HorarioBarbero.barbero_id == data.barbero_id,
        HorarioBarbero.dia_semana == dia_semana,
        HorarioBarbero.activo == True,
    ).first()
    if not horario:
        raise HTTPException(status_code=400, detail="El barbero no atiende ese día")

    hora_inicio = data.hora_inicio
    hora_fin = (datetime.combine(data.fecha, hora_inicio) + timedelta(minutes=servicio.duracion_minutos)).time()

    conflicto = db.query(Cita).filter(
        Cita.barbero_id == data.barbero_id,
        Cita.fecha == data.fecha,
        Cita.estado != "cancelada",
        Cita.hora_inicio < hora_fin,
        Cita.hora_fin > hora_inicio,
    ).first()
    if conflicto:
        raise HTTPException(status_code=409, detail="Ya existe una cita en ese horario")

    cancel_token = secrets.token_urlsafe(32)

    cita = Cita(
        cliente_id=data.cliente_id,
        barbero_id=data.barbero_id,
        servicio_id=data.servicio_id,
        silla_id=barbero.silla_id,
        fecha=data.fecha,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        notas=data.notas,
        cancel_token=cancel_token,
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)

    # Enviar correo en background (no bloquea la respuesta)
    try:
        from app.models.cliente import Cliente as ClienteModel
        c = db.query(ClienteModel).filter(ClienteModel.id == cita.cliente_id).first()
        if c and c.email:
            enviar_confirmacion(c.email, {
                "cliente_nombre": c.nombre,
                "barbero": f"{barbero.nombre} {barbero.apellido}",
                "servicio": servicio.nombre,
                "fecha": str(data.fecha),
                "hora": str(hora_inicio)[:5],
                "duracion": servicio.duracion_minutos,
                "cancel_token": cancel_token,
            })
    except Exception as e:
        print(f"[EMAIL] Error al preparar envío: {e}")

    return cita
