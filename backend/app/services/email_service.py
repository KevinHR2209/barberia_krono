import os
import requests

MAILTRAP_TOKEN = os.getenv("MAILTRAP_TOKEN", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send"
SENDER_EMAIL = "hello@demomailtrap.co"
SENDER_NAME = "Barbería Krono"


def _html_confirmacion(datos: dict) -> str:
    cancel_url = f"{FRONTEND_URL}/cancelar/{datos['cancel_token']}"
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f0f4ff;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,138,0.1);">
            <tr>
              <td style="background:linear-gradient(135deg,#1d4ed8,#1e3a8a);padding:32px 40px;text-align:center;">
                <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 16px;margin-bottom:12px;">
                  <span style="color:#fff;font-size:28px;">✂</span>
                </div>
                <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;">KRONO Barbería</h1>
                <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Confirmación de reserva</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px;">
                <h2 style="color:#1e3a8a;font-size:20px;margin:0 0 8px;">¡Hola, {datos['cliente_nombre']}! 👋</h2>
                <p style="color:#64748b;margin:0 0 28px;font-size:15px;">Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;">
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Barbero</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['barbero']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Servicio</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['servicio']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Fecha</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['fecha']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Hora</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['hora']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Duración estimada</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['duracion']} minutos</strong>
                  </td></tr>
                </table>
                <p style="color:#64748b;font-size:14px;margin:28px 0 16px;">¿No puedes asistir? Cancela tu reserva aquí:</p>
                <div style="text-align:center;margin:0 0 28px;">
                  <a href="{cancel_url}" style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                    ❌ Cancelar mi reserva
                  </a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Si no hiciste esta reserva, ignora este correo.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8faff;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f5;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Barbería Krono</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """


def enviar_confirmacion(destinatario: str, datos: dict):
    if not MAILTRAP_TOKEN:
        print(f"[EMAIL] Sin MAILTRAP_TOKEN. Correo para {destinatario} NO enviado.")
        print(f"[EMAIL] Token cancelación: {datos.get('cancel_token')}")
        return

    payload = {
        "from": {"email": SENDER_EMAIL, "name": SENDER_NAME},
        "to": [{"email": destinatario}],
        "subject": "✂ Confirmación de cita — Barbería Krono",
        "html": _html_confirmacion(datos),
        "text": (
            f"Hola {datos['cliente_nombre']},\n\n"
            f"Tu cita ha sido confirmada.\n"
            f"Barbero: {datos['barbero']}\n"
            f"Servicio: {datos['servicio']}\n"
            f"Fecha: {datos['fecha']}\n"
            f"Hora: {datos['hora']}\n\n"
            f"Para cancelar: {FRONTEND_URL}/cancelar/{datos['cancel_token']}"
        ),
        "category": "Reserva Barberia",
    }

    headers = {
        "Authorization": f"Bearer {MAILTRAP_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(MAILTRAP_API_URL, json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            print(f"[EMAIL] Confirmación enviada a {destinatario}")
        else:
            print(f"[EMAIL] Error Mailtrap {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"[EMAIL] Excepción al enviar: {e}")
