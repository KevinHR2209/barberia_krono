import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getBarberos, createBarbero, deleteBarbero, getHorariosBarbero, createHorario, deleteHorario, getSillas } from '../services/api'
import Modal from '../components/Modal'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

export default function BarberosPage() {
  const [barberos, setBarberos] = useState([])
  const [sillas, setSillas] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [horariosModal, setHorariosModal] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [form, setForm] = useState({ nombre:'', apellido:'', email:'', telefono:'', silla_id:'' })
  const [horarioForm, setHorarioForm] = useState({ dia_semana:0, hora_inicio:'09:00', hora_fin:'18:00' })

  const cargar = () => {
    getBarberos().then(r => setBarberos(r.data))
    getSillas().then(r => setSillas(r.data))
  }
  useEffect(() => { cargar() }, [])

  const abrirHorarios = (barbero) => {
    setHorariosModal(barbero)
    getHorariosBarbero(barbero.id).then(r => setHorarios(r.data))
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await createBarbero({ ...form, silla_id: form.silla_id || null })
      toast.success('Barbero creado exitosamente')
      setModalOpen(false)
      setForm({ nombre:'', apellido:'', email:'', telefono:'', silla_id:'' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear barbero')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este barbero?')) return
    await deleteBarbero(id)
    toast.success('Barbero desactivado')
    cargar()
  }

  const agregarHorario = async (e) => {
    e.preventDefault()
    try {
      await createHorario({ ...horarioForm, barbero_id: horariosModal.id })
      toast.success('Horario agregado')
      getHorariosBarbero(horariosModal.id).then(r => setHorarios(r.data))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    }
  }

  const eliminarHorario = async (id) => {
    await deleteHorario(id)
    getHorariosBarbero(horariosModal.id).then(r => setHorarios(r.data))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Barberos</h1>
          <p className="text-gray-400 mt-1">{barberos.length} barberos activos</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <FiPlus /> Nuevo Barbero
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {barberos.map(b => (
          <div key={b.id} className="card">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-krono-500/20 rounded-xl flex items-center justify-center text-krono-400 text-xl font-bold">
                {b.nombre[0]}{b.apellido[0]}
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirHorarios(b)} className="p-2 bg-dark-600 hover:bg-dark-500 text-gray-400 hover:text-white rounded-lg transition-all" title="Gestionar horarios">
                  <FiClock />
                </button>
                <button onClick={() => eliminar(b.id)} className="p-2 bg-dark-600 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded-lg transition-all">
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <h3 className="text-white font-semibold mt-3">{b.nombre} {b.apellido}</h3>
            <p className="text-gray-400 text-sm">{b.email}</p>
            {b.telefono && <p className="text-gray-500 text-xs mt-1">{b.telefono}</p>}
          </div>
        ))}
      </div>

      {/* Modal nuevo barbero */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Barbero">
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Nombre</label><input className="input-field" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
            <div><label className="label">Apellido</label><input className="input-field" value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} required /></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
          <div><label className="label">Teléfono</label><input className="input-field" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} /></div>
          <div>
            <label className="label">Silla asignada</label>
            <select className="input-field" value={form.silla_id} onChange={e=>setForm({...form,silla_id:e.target.value})}>
              <option value="">Sin silla asignada</option>
              {sillas.map(s=><option key={s.id} value={s.id}>Silla #{s.numero}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full justify-center">Crear Barbero</button>
        </form>
      </Modal>

      {/* Modal horarios */}
      <Modal isOpen={!!horariosModal} onClose={() => setHorariosModal(null)} title={`Horarios — ${horariosModal?.nombre} ${horariosModal?.apellido}`}>
        <div className="space-y-4">
          <div className="space-y-2">
            {horarios.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-3">
                <span className="text-white font-medium">{DIAS[h.dia_semana]}</span>
                <span className="text-gray-400 text-sm">{h.hora_inicio.slice(0,5)} — {h.hora_fin.slice(0,5)}</span>
                <button onClick={() => eliminarHorario(h.id)} className="text-red-400 hover:text-red-300 p-1"><FiTrash2 /></button>
              </div>
            ))}
            {horarios.length === 0 && <p className="text-gray-500 text-center py-4">Sin horarios configurados</p>}
          </div>
          <form onSubmit={agregarHorario} className="border-t border-dark-600 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-300">Agregar día de atención</p>
            <select className="input-field" value={horarioForm.dia_semana} onChange={e=>setHorarioForm({...horarioForm,dia_semana:parseInt(e.target.value)})}>
              {DIAS.map((d,i)=><option key={i} value={i}>{d}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Desde</label><input type="time" className="input-field" value={horarioForm.hora_inicio} onChange={e=>setHorarioForm({...horarioForm,hora_inicio:e.target.value})} /></div>
              <div><label className="label">Hasta</label><input type="time" className="input-field" value={horarioForm.hora_fin} onChange={e=>setHorarioForm({...horarioForm,hora_fin:e.target.value})} /></div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">Agregar horario</button>
          </form>
        </div>
      </Modal>
    </div>
  )
}
