import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getSillas, createSilla, updateSilla } from '../services/api'
import Modal from '../components/Modal'

export default function SillasPage() {
  const [sillas, setSillas] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ numero:'', descripcion:'' })

  const cargar = () => getSillas().then(r => setSillas(r.data))
  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    const num = parseInt(form.numero)
    if (num < 1 || num > 20) {
      toast.error('El número de silla debe estar entre 1 y 20')
      return
    }
    try {
      await createSilla({ ...form, numero: num })
      toast.success('Silla creada')
      setModalOpen(false)
      setForm({ numero:'', descripcion:'' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    }
  }

  const toggleActiva = async (silla) => {
    await updateSilla(silla.id, { activa: !silla.activa })
    toast.success(silla.activa ? 'Silla desactivada' : 'Silla activada')
    cargar()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sillas</h1>
          <p className="text-gray-500 mt-1">{sillas.length} sillas en la barbería</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <FiPlus /> Nueva Silla
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {sillas.map(s => (
          <div key={s.id} className={`card border-2 hover:shadow-md transition-shadow ${ s.activa ? 'border-krono-300' : 'border-dark-500 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${ s.activa ? 'bg-krono-100 text-krono-700' : 'bg-dark-600 text-gray-400'}`}>
                #{s.numero}
              </div>
            </div>
            {s.descripcion && <p className="text-gray-500 text-sm mt-3">{s.descripcion}</p>}
            <button onClick={() => toggleActiva(s)}
              className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-all border ${
                s.activa
                  ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                  : 'bg-dark-600 text-gray-500 border-dark-500 hover:bg-dark-700'
              }`}>
              {s.activa ? '● Activa' : '○ Inactiva'}
            </button>
          </div>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Silla">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="label">Número de silla (1-20)</label>
            <input type="number" min="1" max="20" className="input-field" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})} required />
          </div>
          <div><label className="label">Descripción</label><input className="input-field" placeholder="Ej: Silla junto a la ventana" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} /></div>
          <button type="submit" className="btn-primary w-full justify-center">Crear Silla</button>
        </form>
      </Modal>
    </div>
  )
}
