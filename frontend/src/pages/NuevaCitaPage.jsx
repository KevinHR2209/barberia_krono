import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'
import {
  getBarberos, getClientes, getServicios,
  createCita, createCliente, getHorariosBarbero
} from '../services/api'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

export default function NuevaCitaPage() {
  const navigate = useNavigate()
  const [barberos, setBarberos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [horarios, setHorarios] = useState([])
  const [nuevoCliente, setNuevoCliente] = useState(false)

  const [form, setForm] = useState({
    cliente_id: '', barbero_id: '', servicio_id: '',
    fecha: '', hora_inicio: '', notas: '',
  })
  const [clienteForm, setClienteForm] = useState({
    nombre: '', apellido: '', email: '', telefono: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getBarberos(), getClientes(), getServicios()])
      .then(([b, c, s]) => {
        setBarberos(b.data)
        setClientes(c.data)
        setServicios(s.data)
      })
  }, [])

  useEffect(() => {
    if (form.barbero_id) {
      getHorariosBarbero(form.barbero_id).then(r => setHorarios(r.data))
    }
  }, [form.barbero_id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let clienteId = form.cliente_id
      if (nuevoCliente) {
        const res = await createCliente(clienteForm)
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
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft /> Volver
      </button>
      <h1 className="text-3xl font-bold text-white mb-2">Nueva Cita</h1>
      <p className="text-gray-400 mb-8">Completa los datos para agendar una cita</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Barbero */}
        <div>
          <label className="label">Barbero</label>
          <select className="input-field" value={form.barbero_id} onChange={e => setForm({...form, barbero_id: e.target.value})} required>
            <option value="">Selecciona un barbero...</option>
            {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>)}
          </select>
          {horarios.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Atiende: {horarios.filter(h=>h.activo).map(h => `${DIAS[h.dia_semana]} ${h.hora_inicio.slice(0,5)}-${h.hora_fin.slice(0,5)}`).join(' | ')}
            </p>
          )}
        </div>

        {/* Servicio */}
        <div>
          <label className="label">Servicio</label>
          <select className="input-field" value={form.servicio_id} onChange={e => setForm({...form, servicio_id: e.target.value})} required>
            <option value="">Selecciona un servicio...</option>
            {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — {s.duracion_minutos} min — ${Number(s.precio).toLocaleString('es-CL')}</option>)}
          </select>
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha</label>
            <input type="date" className="input-field" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />
          </div>
          <div>
            <label className="label">Hora inicio</label>
            <input type="time" className="input-field" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})} required />
          </div>
        </div>

        {/* Cliente */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Cliente</label>
            <button type="button" onClick={() => setNuevoCliente(!nuevoCliente)} className="text-xs text-krono-400 hover:text-krono-300">
              {nuevoCliente ? '← Seleccionar existente' : '+ Nuevo cliente'}
            </button>
          </div>
          {nuevoCliente ? (
            <div className="space-y-3 bg-dark-700 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Nombre" className="input-field" value={clienteForm.nombre} onChange={e => setClienteForm({...clienteForm, nombre: e.target.value})} required />
                <input placeholder="Apellido" className="input-field" value={clienteForm.apellido} onChange={e => setClienteForm({...clienteForm, apellido: e.target.value})} required />
              </div>
              <input type="email" placeholder="Email" className="input-field" value={clienteForm.email} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} required />
              <input placeholder="Teléfono (opcional)" className="input-field" value={clienteForm.telefono} onChange={e => setClienteForm({...clienteForm, telefono: e.target.value})} />
            </div>
          ) : (
            <select className="input-field" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})} required>
              <option value="">Selecciona un cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido} — {c.email}</option>)}
            </select>
          )}
        </div>

        {/* Notas */}
        <div>
          <label className="label">Notas (opcional)</label>
          <textarea className="input-field resize-none" rows={3} placeholder="Instrucciones especiales..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} />
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3 text-base" disabled={loading}>
          {loading ? 'Agendando...' : '✂️ Agendar Cita'}
        </button>
      </form>
    </div>
  )
}
