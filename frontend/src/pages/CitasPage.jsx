import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiX, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getCitas, updateEstadoCita } from '../services/api'
import EstadoBadge from '../components/EstadoBadge'

export default function CitasPage() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const cargarCitas = () => {
    getCitas().then(res => setCitas(res.data)).finally(() => setLoading(false))
  }
  useEffect(() => { cargarCitas() }, [])

  const cambiarEstado = async (cita, estado) => {
    if (estado === 'completada') {
      const ahora = new Date()
      const citaDateTime = new Date(`${cita.fecha}T${cita.hora_inicio}`)
      if (citaDateTime > ahora) {
        toast.error('No puedes marcar como realizada una cita que aún no ha ocurrido.')
        return
      }
    }
    try {
      await updateEstadoCita(cita.id, estado)
      toast.success(`Cita marcada como ${estado}`)
      cargarCitas()
    } catch {
      toast.error('Error al actualizar la cita')
    }
  }

  const citasFiltradas = filtroEstado === 'todos' ? citas : citas.filter(c => c.estado === filtroEstado)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Citas</h1>
          <p className="text-gray-500 mt-1">{citas.length} citas en total</p>
        </div>
        <Link to="/citas/nueva" className="btn-primary">
          <FiPlus /> Nueva Cita
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {['todos', 'asignada', 'completada', 'cancelada'].map(f => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize border ${
              filtroEstado === f
                ? 'bg-krono-600 text-white border-krono-600'
                : 'bg-white text-gray-600 border-dark-500 hover:border-krono-400 hover:text-krono-600'
            }`}
          >
            {f === 'todos' ? 'Todas' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-20">Cargando citas...</p>
      ) : citasFiltradas.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No hay citas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {citasFiltradas.map(cita => (
            <div key={cita.id} className="card flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-6 flex-1">
                <div className="text-center min-w-[70px]">
                  <p className="text-gray-400 text-xs">{cita.fecha}</p>
                  <p className="text-krono-600 font-bold text-lg">{cita.hora_inicio.slice(0,5)}</p>
                  <p className="text-gray-400 text-xs">→ {cita.hora_fin.slice(0,5)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">{cita.cliente.nombre} {cita.cliente.apellido}</p>
                  <p className="text-gray-500 text-sm">✂️ {cita.barbero.nombre} {cita.barbero.apellido} · {cita.servicio.nombre}</p>
                  {cita.notas && <p className="text-gray-400 text-xs mt-1">{cita.notas}</p>}
                </div>
                <EstadoBadge estado={cita.estado} />
              </div>
              {cita.estado === 'asignada' && (
                <div className="flex gap-2">
                  <button onClick={() => cambiarEstado(cita, 'completada')}
                    className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all border border-green-200" title="Completar">
                    <FiCheck />
                  </button>
                  <button onClick={() => cambiarEstado(cita, 'cancelada')}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all border border-red-200" title="Cancelar">
                    <FiX />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
