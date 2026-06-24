from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
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


@router.get("/cancelar/{token}", response_class=HTMLResponse)
def cancelar_por_token(token: str, db: Session = Depends(get_db)):
    """Endpoint que se llama al hacer clic en el botón del correo."""
    cita = db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.barbero),
        joinedload(Cita.servicio),
    ).filter(Cita.cancel_token == token).first()

    if not cita:
        return HTMLResponse(_html_error("Token inválido", "Este enlace de cancelación no es válido o ya fue usado."), status_code=404)

    if cita.estado == "cancelada":
        return HTMLResponse(_html_info("Ya cancelada", "Esta cita ya estaba cancelada anteriormente."), status_code=200)

    if cita.estado == "completada":
        return HTMLResponse(_html_error("No cancelable", "Esta cita ya fue completada y no se puede cancelar."), status_code=400)

    cita.estado = "cancelada"
    cita.cancel_token = None
    db.commit()

    nombre = cita.cliente.nombre if cita.cliente else "Cliente"
    servicio = cita.servicio.nombre if cita.servicio else ""
    fecha = str(cita.fecha)
    hora = str(cita.hora_inicio)[:5]
    return HTMLResponse(_html_ok(nombre, servicio, fecha, hora), status_code=200)


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


# ── HTML helpers ──────────────────────────────────────────────────────────────

def _base_html(titulo: str, icono: str, color: str, mensaje: str, detalle: str = "") -> str:
    return f"""
    <!DOCTYPE html><html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{titulo} — Barbería Krono</title>
    <style>
      *{{box-sizing:border-box;margin:0;padding:0}}
      body{{font-family:Inter,Arial,sans-serif;background:#f0f4ff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}}
      .card{{background:#fff;border-radius:20px;padding:48px 40px;max-width:440px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(30,58,138,0.12)}}
      .icon{{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 24px;background:{color}20}}
      h1{{font-size:24px;font-weight:900;color:#1e293b;margin-bottom:8px}}
      p{{color:#64748b;font-size:15px;line-height:1.6;margin-bottom:8px}}
      .detail{{background:#f8faff;border-radius:12px;padding:16px 20px;margin:20px 0;text-align:left}}
      .detail p{{font-size:14px;margin-bottom:4px}}
      .detail strong{{color:#1e293b}}
      .btn{{display:inline-block;margin-top:24px;background:#1d4ed8;color:#fff;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:15px}}
      .brand{{color:#94a3b8;font-size:13px;margin-top:24px}}
    </style></head>
    <body><div class="card">
      <div class="icon" style="background:{color}20"><span>{icono}</span></div>
      <h1>{titulo}</h1>
      <p>{mensaje}</p>
      {detalle}
      <p class="brand">✂ Barbería Krono</p>
    </div></body></html>
    """


def _html_ok(nombre: str, servicio: str, fecha: str, hora: str) -> str:
    detalle = f"""
    <div class="detail">
      <p>Cliente: <strong>{nombre}</strong></p>
      <p>Servicio: <strong>{servicio}</strong></p>
      <p>Fecha: <strong>{fecha}</strong></p>
      <p>Hora: <strong>{hora}</strong></p>
    </div>
    <a href="http://localhost:5173/reservar" class="btn">Hacer nueva reserva</a>
    """
    return _base_html(
        "Cita cancelada", "✅", "#22c55e",
        "Tu cita ha sido cancelada exitosamente.",
        detalle
    )


def _html_error(titulo: str, mensaje: str) -> str:
    return _base_html(titulo, "❌", "#ef4444", mensaje)


def _html_info(titulo: str, mensaje: str) -> str:
    return _base_html(titulo, "ℹ️", "#3b82f6", mensaje)
