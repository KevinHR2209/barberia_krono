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
    getCitas()
      .then(res => setCitas(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarCitas() }, [])

  const cambiarEstado = async (id, estado) => {
    try {
      await updateEstadoCita(id, estado)
      toast.success(`Cita marcada como ${estado}`)
      cargarCitas()
    } catch {
      toast.error('Error al actualizar la cita')
    }
  }

  const citasFiltradas = filtroEstado === 'todos'
    ? citas
    : citas.filter(c => c.estado === filtroEstado)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Citas</h1>
          <p className="text-gray-400 mt-1">{citas.length} citas en total</p>
        </div>
        <Link to="/citas/nueva" className="btn-primary">
          <FiPlus /> Nueva Cita
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {['todos', 'asignada', 'completada', 'cancelada'].map(f => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filtroEstado === f
                ? 'bg-krono-500 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'todos' ? 'Todas' : f}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-gray-500 text-center py-20">Cargando citas...</p>
      ) : citasFiltradas.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500 text-lg">No hay citas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {citasFiltradas.map(cita => (
            <div key={cita.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-1">
                <div className="text-center min-w-[70px]">
                  <p className="text-gray-400 text-xs">{cita.fecha}</p>
                  <p className="text-krono-400 font-bold text-lg">{cita.hora_inicio.slice(0,5)}</p>
                  <p className="text-gray-500 text-xs">→ {cita.hora_fin.slice(0,5)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {cita.cliente.nombre} {cita.cliente.apellido}
                  </p>
                  <p className="text-gray-400 text-sm">
                    ✂️ {cita.barbero.nombre} {cita.barbero.apellido} · {cita.servicio.nombre}
                  </p>
                  {cita.notas && <p className="text-gray-500 text-xs mt-1">{cita.notas}</p>}
                </div>
                <EstadoBadge estado={cita.estado} />
              </div>

              {/* Acciones */}
              {cita.estado === 'asignada' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarEstado(cita.id, 'completada')}
                    className="p-2 bg-green-900/30 hover:bg-green-800/50 text-green-400 rounded-lg transition-all"
                    title="Marcar como completada"
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={() => cambiarEstado(cita.id, 'cancelada')}
                    className="p-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded-lg transition-all"
                    title="Cancelar cita"
                  >
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
