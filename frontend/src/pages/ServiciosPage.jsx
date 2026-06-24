import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiClock, FiDollarSign } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getServicios, createServicio, deleteServicio } from '../services/api'
import Modal from '../components/Modal'

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre:'', descripcion:'', duracion_minutos:30, precio:'' })

  const cargar = () => getServicios().then(r => setServicios(r.data))
  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await createServicio(form)
      toast.success('Servicio creado')
      setModalOpen(false)
      setForm({ nombre:'', descripcion:'', duracion_minutos:30, precio:'' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este servicio?')) return
    await deleteServicio(id)
    toast.success('Servicio desactivado')
    cargar()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Servicios</h1>
          <p className="text-gray-400 mt-1">{servicios.length} servicios disponibles</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <FiPlus /> Nuevo Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {servicios.map(s => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between">
              <h3 className="text-white font-semibold">{s.nombre}</h3>
              <button onClick={() => eliminar(s.id)} className="p-2 bg-dark-600 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded-lg transition-all">
                <FiTrash2 />
              </button>
            </div>
            {s.descripcion && <p className="text-gray-400 text-sm mt-2">{s.descripcion}</p>}
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-gray-400 text-sm"><FiClock className="text-xs"/> {s.duracion_minutos} min</span>
              <span className="flex items-center gap-1 text-krono-400 font-semibold text-sm"><FiDollarSign className="text-xs"/> ${Number(s.precio).toLocaleString('es-CL')}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Servicio">
        <form onSubmit={guardar} className="space-y-4">
          <div><label className="label">Nombre</label><input className="input-field" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
          <div><label className="label">Descripción</label><textarea className="input-field resize-none" rows={3} value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Duración (min)</label><input type="number" min="5" className="input-field" value={form.duracion_minutos} onChange={e=>setForm({...form,duracion_minutos:parseInt(e.target.value)})} required /></div>
            <div><label className="label">Precio (CLP)</label><input type="number" min="0" className="input-field" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})} required /></div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center">Crear Servicio</button>
        </form>
      </Modal>
    </div>
  )
}
