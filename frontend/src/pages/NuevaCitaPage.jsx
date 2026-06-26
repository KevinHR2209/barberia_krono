import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'
import { getBarberos, getClientes, getServicios, createCita, createCliente, getHorariosBarbero } from '../services/api'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEL_RE = /^\+\d{7,15}$/
const SLOT_MIN = 45

function generarBloques() {
  const bloques = []
  let h = 9 * 60
  while (h + SLOT_MIN <= 19 * 60) {
    const hh = String(Math.floor(h / 60)).padStart(2, '0')
    const mm = String(h % 60).padStart(2, '0')
    bloques.push(`${hh}:${mm}`)
    h += SLOT_MIN
  }
  return bloques
}

const BLOQUES = generarBloques()

export default function NuevaCitaPage() {
  const navigate = useNavigate()
  const [barberos, setBarberos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [horarios, setHorarios] = useState([])
  const [nuevoCliente, setNuevoCliente] = useState(false)

  const [form, setForm] = useState({ cliente_id:'', barbero_id:'', servicio_id:'', fecha:'', hora_inicio:'', notas:'' })
  const [clienteForm, setClienteForm] = useState({ nombre:'', apellido:'', email:'', telefono:'', direccion:'', latitud: null, longitud: null })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sugerencias, setSugerencias] = useState([])

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    Promise.all([getBarberos(), getClientes(), getServicios()])
        .then(([b,c,s]) => { setBarberos(b.data); setClientes(c.data); setServicios(s.data) })
  }, [])

  useEffect(() => {
    if (form.barbero_id) getHorariosBarbero(form.barbero_id).then(r => setHorarios(r.data))
  }, [form.barbero_id])

  const bloquesDisponibles = () => {
    const ahora = new Date()
    return BLOQUES.filter(bloque => {
      if (form.fecha === today) {
        const [hh, mm] = bloque.split(':').map(Number)
        const bloqueDate = new Date()
        bloqueDate.setHours(hh, mm, 0, 0)
        return bloqueDate > ahora
      }
      return true
    })
  }

  // Buscar dirección en OpenStreetMap (Nominatim)
  const buscarDireccionOSM = async (query) => {
    setClienteForm({ ...clienteForm, direccion: query })
    if (query.length < 4) {
      setSugerencias([])
      return
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`)
      const data = await res.json()
      setSugerencias(data)
    } catch (error) {
      console.error("Error buscando dirección:", error)
    }
  }

  const seleccionarSugerencia = (sug) => {
    setClienteForm({
      ...clienteForm,
      direccion: sug.display_name,
      latitud: parseFloat(sug.lat),
      longitud: parseFloat(sug.lon)
    })
    setSugerencias([])
  }

  const validate = () => {
    const e = {}
    if (nuevoCliente) {
      if (clienteForm.email && !EMAIL_RE.test(clienteForm.email)) e.email = 'Email inválido (ej: nombre@dominio.cl)'
      if (clienteForm.telefono && !TEL_RE.test(clienteForm.telefono)) e.telefono = 'Teléfono inválido (ej: +56912345678)'
    }
    if (!form.fecha) e.fecha = 'Selecciona una fecha'
    if (!form.hora_inicio) e.hora_inicio = 'Selecciona una hora'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      let clienteId = form.cliente_id
      if (nuevoCliente) {
        const res = await createCliente(clienteForm);
        clienteId = res.data.id
      }
      await createCita({ ...form, cliente_id: clienteId })
      toast.success('¡Cita agendada exitosamente!')
      navigate('/citas')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al agendar la cita')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="p-8 max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <FiArrowLeft /> Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nueva Cita</h1>
        <p className="text-gray-500 mb-8">Completa los datos para agendar una cita</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Barbero</label>
            <select className="input-field" value={form.barbero_id} onChange={e => setForm({...form, barbero_id:e.target.value, hora_inicio:''})} required>
              <option value="">Selecciona un barbero...</option>
              {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>)}
            </select>
            {horarios.length > 0 && <p className="text-xs text-gray-400 mt-1">Atiende: {horarios.filter(h=>h.activo).map(h=>`${DIAS[h.dia_semana]} ${h.hora_inicio.slice(0,5)}-${h.hora_fin.slice(0,5)}`).join(' | ')}</p>}
          </div>

          <div>
            <label className="label">Servicio</label>
            <select className="input-field" value={form.servicio_id} onChange={e => setForm({...form,servicio_id:e.target.value})} required>
              <option value="">Selecciona un servicio...</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — {s.duracion_minutos} min — ${Number(s.precio).toLocaleString('es-CL')}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha</label>
              <input
                  type="date"
                  className="input-field"
                  value={form.fecha}
                  min={today}
                  onChange={e => setForm({...form, fecha:e.target.value, hora_inicio:''})}
                  required
              />
              {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>
            <div>
              <label className="label">Hora inicio</label>
              <select
                  className="input-field"
                  value={form.hora_inicio}
                  onChange={e => setForm({...form, hora_inicio:e.target.value})}
                  required
                  disabled={!form.fecha}
              >
                <option value="">Selecciona hora...</option>
                {bloquesDisponibles().map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.hora_inicio && <p className="text-red-500 text-xs mt-1">{errors.hora_inicio}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Cliente</label>
              <button type="button" onClick={() => setNuevoCliente(!nuevoCliente)} className="text-xs text-krono-600 hover:text-krono-700 font-medium">
                {nuevoCliente ? '⬅ Seleccionar existente' : '+ Nuevo cliente'}
              </button>
            </div>

            {nuevoCliente ? (
                <div className="space-y-3 bg-krono-50 rounded-xl p-4 border border-krono-200">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Nombre" className="input-field" value={clienteForm.nombre} onChange={e=>setClienteForm({...clienteForm,nombre:e.target.value})} required />
                    <input placeholder="Apellido" className="input-field" value={clienteForm.apellido} onChange={e=>setClienteForm({...clienteForm,apellido:e.target.value})} required />
                  </div>

                  <div>
                    <input
                        type="email"
                        placeholder="Email"
                        className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                        value={clienteForm.email}
                        onChange={e=>{ setClienteForm({...clienteForm,email:e.target.value}); setErrors({...errors,email:''}) }}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <input
                        placeholder="Teléfono (ej: +56912345678)"
                        className={`input-field ${errors.telefono ? 'border-red-400' : ''}`}
                        value={clienteForm.telefono}
                        onChange={e=>{ setClienteForm({...clienteForm,telefono:e.target.value}); setErrors({...errors,telefono:''}) }}
                    />
                    {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                  </div>

                  {/* BLOQUE DIRECCIÓN CON AUTOCOMPLETADO */}
                  <div className="relative">
                    <input
                        placeholder="Dirección (Ej: Avenida Brasil, Valparaíso)"
                        className={`input-field ${errors.direccion ? 'border-red-400' : ''}`}
                        value={clienteForm.direccion}
                        onChange={(e) => {
                          buscarDireccionOSM(e.target.value)
                          setErrors({...errors, direccion: ''})
                        }}
                        autoComplete="off"
                    />

                    {sugerencias.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-dark-500 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto">
                          {sugerencias.map((sug) => (
                              <li
                                  key={sug.place_id}
                                  onClick={() => seleccionarSugerencia(sug)}
                                  className="p-3 text-sm text-gray-700 hover:bg-krono-50 cursor-pointer border-b border-dark-600 last:border-0 transition-colors"
                              >
                                {sug.display_name}
                              </li>
                          ))}
                        </ul>
                    )}
                    {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
                  </div>
                </div>
            ) : (
                <select className="input-field" value={form.cliente_id} onChange={e => setForm({...form,cliente_id:e.target.value})} required>
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido} — {c.email}</option>)}
                </select>
            )}
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Instrucciones especiales..." value={form.notas} onChange={e => setForm({...form,notas:e.target.value})} />
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3 text-base" disabled={loading}>
            {loading ? 'Agendando...' : '📅 Agendar Cita'}
          </button>
        </form>
      </div>
  )
}