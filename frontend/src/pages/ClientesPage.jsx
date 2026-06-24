import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiMail, FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getClientes, createCliente, deleteCliente } from '../services/api'
import Modal from '../components/Modal'

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre:'', apellido:'', email:'', telefono:'' })
  const [search, setSearch] = useState('')

  const cargar = () => getClientes().then(r => setClientes(r.data))
  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await createCliente(form)
      toast.success('Cliente registrado')
      setModalOpen(false)
      setForm({ nombre:'', apellido:'', email:'', telefono:'' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    await deleteCliente(id)
    toast.success('Cliente eliminado')
    cargar()
  }

  const filtrados = clientes.filter(c =>
    `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <FiPlus /> Nuevo Cliente
        </button>
      </div>

      <input
        className="input-field mb-6 max-w-sm"
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtrados.map(c => (
          <div key={c.id} className="card flex items-start justify-between">
            <div>
              <div className="w-10 h-10 bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-400 font-bold mb-3">
                {c.nombre[0]}{c.apellido[0]}
              </div>
              <h3 className="text-white font-semibold">{c.nombre} {c.apellido}</h3>
              <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><FiMail className="text-xs"/> {c.email}</p>
              {c.telefono && <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5"><FiPhone className="text-xs"/> {c.telefono}</p>}
            </div>
            <button onClick={() => eliminar(c.id)} className="p-2 bg-dark-600 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded-lg transition-all">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Cliente">
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Nombre</label><input className="input-field" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
            <div><label className="label">Apellido</label><input className="input-field" value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} required /></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
          <div><label className="label">Teléfono</label><input className="input-field" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} /></div>
          <button type="submit" className="btn-primary w-full justify-center">Registrar Cliente</button>
        </form>
      </Modal>
    </div>
  )
}
