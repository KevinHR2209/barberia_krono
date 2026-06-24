import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiScissors, FiUsers, FiList, FiArrowRight } from 'react-icons/fi'
import { getCitas, getBarberos, getClientes, getServicios } from '../services/api'
import EstadoBadge from '../components/EstadoBadge'

export default function Dashboard() {
  const [stats, setStats] = useState({ citas: 0, barberos: 0, clientes: 0, servicios: 0 })
  const [citasHoy, setCitasHoy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    Promise.all([getCitas(), getBarberos(), getClientes(), getServicios()])
      .then(([c, b, cl, s]) => {
        setStats({
          citas: c.data.length,
          barberos: b.data.length,
          clientes: cl.data.length,
          servicios: s.data.length,
        })
        setCitasHoy(c.data.filter(cita => cita.fecha === hoy).slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Citas totales', value: stats.citas, icon: FiCalendar, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/30' },
    { label: 'Barberos activos', value: stats.barberos, icon: FiScissors, color: 'text-krono-400', bg: 'bg-krono-900/20 border-krono-800/30' },
    { label: 'Clientes', value: stats.clientes, icon: FiUsers, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/30' },
    { label: 'Servicios', value: stats.servicios, icon: FiList, color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/30' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Bienvenido al sistema de gestión de Barbería Krono</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card border ${bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`text-2xl ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Citas de hoy */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Citas de Hoy</h2>
          <Link to="/citas" className="text-krono-400 hover:text-krono-300 text-sm flex items-center gap-1 transition-colors">
            Ver todas <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Cargando...</p>
        ) : citasHoy.length === 0 ? (
          <div className="text-center py-10">
            <FiCalendar className="text-4xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay citas programadas para hoy</p>
            <Link to="/citas/nueva" className="btn-primary mt-4 inline-flex">Agendar cita</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {citasHoy.map(cita => (
              <div key={cita.id} className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-krono-400 font-bold">{cita.hora_inicio.slice(0, 5)}</p>
                  </div>
                  <div>
                    <p className="text-white font-medium">{cita.cliente.nombre} {cita.cliente.apellido}</p>
                    <p className="text-gray-400 text-sm">{cita.barbero.nombre} · {cita.servicio.nombre}</p>
                  </div>
                </div>
                <EstadoBadge estado={cita.estado} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
