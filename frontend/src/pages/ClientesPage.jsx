import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getClientes, createCliente, deleteCliente } from '../services/api'
import Modal from '../components/Modal'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEL_RE = /^\+\d{7,15}$/

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre:'', apellido:'', email:'', telefono:'', direccion:'', comuna:'' })
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')

  const cargar = () => getClientes().then(r => setClientes(r.data))
  useEffect(() => { cargar() }, [])

  const validate = () => {
    const e = {}
    if (!EMAIL_RE.test(form.email)) e.email = 'Email inválido (ej: nombre@dominio.cl)'
    if (form.telefono && !TEL_RE.test(form.telefono)) e.telefono = 'Teléfono inválido (ej: +56912345678)'
    if (!form.direccion || form.direccion.trim().length < 5) e.direccion = 'Dirección obligatoria (mínimo 5 caracteres)'
    if (!form.comuna || form.comuna.trim().length < 2) e.comuna = 'Comuna obligatoria'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await createCliente(form)
      toast.success('Cliente registrado')
      setModalOpen(false)
      setForm({ nombre:'', apellido:'', email:'', telefono:'', direccion:'', comuna:'' })
      setErrors({})
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este cliente?')) return
    await deleteCliente(id)
    toast.success('Cliente desactivado')
    cargar()
  }

  const filtrados = clientes.filter(c =>
    `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <FiPlus /> Nuevo Cliente
        </button>
      </div>
      <input className="input-field mb-6 max-w-sm" placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtrados.map(c => (
          <div key={c.id} className="card flex items-start justify-between hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 font-bold mb-3">
                {c.nombre[0]}{c.apellido[0]}
              </div>
              <h3 className="text-gray-800 font-semibold">{c.nombre} {c.apellido}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><FiMail className="text-xs"/> {c.email}</p>
              {c.telefono && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><FiPhone className="text-xs"/> {c.telefono}</p>}
              {c.direccion && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><FiMapPin className="text-xs"/> {c.direccion}{c.comuna ? `, ${c.comuna}` : ''}</p>}
            </div>
            <button onClick={() => eliminar(c.id)} className="p-2 bg-dark-700 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all border border-dark-600" title="Desactivar cliente">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setErrors({}) }} title="Nuevo Cliente">
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Nombre</label><input className="input-field" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></div>
            <div><label className="label">Apellido</label><input className="input-field" value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} required /></div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              value={form.email}
              onChange={e=>{ setForm({...form,email:e.target.value}); setErrors({...errors,email:''}) }}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              placeholder="Ej: +56912345678"
              className={`input-field ${errors.telefono ? 'border-red-400' : ''}`}
              value={form.telefono}
              onChange={e=>{ setForm({...form,telefono:e.target.value}); setErrors({...errors,telefono:''}) }}
            />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
          </div>
          <div>
            <label className="label">Dirección</label>
            <input
              className={`input-field ${errors.direccion ? 'border-red-400' : ''}`}
              placeholder="Ej: Av. Brasil 123"
              value={form.direccion}
              onChange={e=>{ setForm({...form,direccion:e.target.value}); setErrors({...errors,direccion:''}) }}
              required
            />
            {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
          </div>
          <div>
            <label className="label">Comuna</label>
            <input
              className={`input-field ${errors.comuna ? 'border-red-400' : ''}`}
              placeholder="Ej: Valparaíso"
              value={form.comuna}
              onChange={e=>{ setForm({...form,comuna:e.target.value}); setErrors({...errors,comuna:''}) }}
              required
            />
            {errors.comuna && <p className="text-red-500 text-xs mt-1">{errors.comuna}</p>}
          </div>
          <button type="submit" className="btn-primary w-full justify-center">Registrar Cliente</button>
        </form>
      </Modal>
    </div>
  )
}
