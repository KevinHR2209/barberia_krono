import os
import re
import requests
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
# Importamos SessionLocal para abrir una conexión propia en segundo plano
from app.database import get_db, SessionLocal
from app.models.cita import Cita
from app.models.cliente import Cliente

router = APIRouter()

KRONO_WEBHOOK_URL = os.getenv("KRONO_WEBHOOK_URL", "http://host.docker.internal:3000/api/v1/webhook/cancellation")
KRONO_API_KEY = os.getenv("KRONO_API_KEY", "super-secret-api-key")

# Coordenadas por defecto del local
BARBERIA_LAT = -33.0456
BARBERIA_LON = -71.6130
SISTEMA_ORIGEN = "BARBERIA-KRONO-01"

def notificar_krono_sync(cita_id: str):
    """
    Se ejecuta de forma completamente síncrona en segundo plano.
    """
    print(f"[KRONO] Iniciando tarea en segundo plano para cita {cita_id}...", flush=True)
    db = SessionLocal()
    try:
        # Volvemos a buscar la cita con todas sus relaciones en esta nueva sesión
        cita_cancelada = db.query(Cita).options(
            joinedload(Cita.cliente),
            joinedload(Cita.servicio),
            joinedload(Cita.barbero),
        ).filter(Cita.id == cita_id).first()

        if not cita_cancelada:
            print(f"[KRONO] Cita {cita_id} no encontrada para notificar.", flush=True)
            return

        clientes_activos = db.query(Cliente).filter(
            Cliente.activo == True,
            Cliente.id != cita_cancelada.cliente_id
        ).all()

        waitlist = []
        for c in clientes_activos:
            # Calcular historial de asistencia
            citas_cliente = db.query(Cita).filter(Cita.cliente_id == c.id).all()
            completadas = sum(1 for ct in citas_cliente if ct.estado == 'completada')

            ratio_asistencia = 0.8
            if citas_cliente:
                ratio_asistencia = completadas / len(citas_cliente)

            # Validar y forzar el formato del teléfono para que Zod no lo rechace
            tel = c.telefono if c.telefono else ""
            if not re.match(r'^\+569\d{8}$', tel):
                tel = "+56900000000"

            waitlist.append({
                "patient_id": str(c.id),
                "display_name": f"{c.nombre} {c.apellido}",
                "phone": tel,
                "email": c.email, # <-- AÑADIDO PARA MAILTRAP
                "attendance_history": ratio_asistencia,
                "latitud": c.latitud,
                "longitud": c.longitud
            })

        # Si no hay nadie en la lista de espera, no tiene sentido molestar a Krono
        if len(waitlist) == 0:
            print("[KRONO] No hay clientes en lista de espera. Se aborta la subasta.", flush=True)
            return

        payload = {
            "event_type": "appointment_cancelled",
            "source_system_id": SISTEMA_ORIGEN,
            "return_url": os.getenv("RETURN_URL", "http://host.docker.internal:8000/api/citas/krono-resultado"),
            "cancellation": {
                "appointment_id": str(cita_cancelada.id),
                "cancelled_at": datetime.utcnow().isoformat() + "Z",
                "slot": {
                    "date": str(cita_cancelada.fecha),
                    "start_time": str(cita_cancelada.hora_inicio)[:5],
                    "end_time": str(cita_cancelada.hora_fin)[:5],
                    "doctor_name": f"{cita_cancelada.barbero.nombre} {cita_cancelada.barbero.apellido}",
                    "specialty": cita_cancelada.servicio.nombre,
                    "location": "Local Principal",
                    "latitud": BARBERIA_LAT,
                    "longitud": BARBERIA_LON
                },
                "cancelled_patient": {
                    "patient_id": str(cita_cancelada.cliente_id),
                    "display_name": f"{cita_cancelada.cliente.nombre} {cita_cancelada.cliente.apellido}"
                }
            },
            "waitlist": waitlist
        }

        # Petición síncrona con la librería requests
        resp = requests.post(
            KRONO_WEBHOOK_URL,
            json=payload,
            headers={"x-api-key": KRONO_API_KEY},
            timeout=10.0
        )
        resp.raise_for_status()
        print(f"[KRONO] Webhook enviado exitosamente. Transacción: {resp.json().get('transaction_id')}", flush=True)

    except requests.exceptions.HTTPError as e:
        # AHORA SÍ VEREMOS EL ERROR EXACTO DE ZOD SI ALGO FALLA
        print(f"[KRONO] HTTP Error {e.response.status_code}: {e.response.text}", flush=True)
    except Exception as e:
        print(f"[KRONO] Error al procesar o enviar webhook a Krono: {e}", flush=True)
    finally:
        db.close()

@router.post("/cancelar/{token}")
def cancelar_por_token(token: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # ... (El mismo código que tienes aquí, solo asegúrate de actualizar la llamada abajo)
    cita = db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.servicio),
        joinedload(Cita.barbero),
    ).filter(Cita.cancel_token == token).first()

    if not cita:
        raise HTTPException(status_code=404, detail="Token inválido o ya utilizado")

    if cita.estado == "cancelada":
        return {"ok": True, "mensaje": "La cita ya estaba cancelada"}

    if cita.estado == "completada":
        raise HTTPException(status_code=400, detail="La cita ya fue completada y no puede cancelarse")

    cita.estado = "cancelada"
    cita.cancel_token = None
    db.commit()

    background_tasks.add_task(notificar_krono_sync, str(cita.id))

    return {"ok": True, "mensaje": "Cita cancelada exitosamente"}