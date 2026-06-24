import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiScissors, FiUsers, FiList, FiArrowRight, FiClock, FiExternalLink } from 'react-icons/fi'
import { getCitas, getBarberos, getClientes, getServicios } from '../services/api'
import EstadoBadge from '../components/EstadoBadge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Dashboard() {
  const [stats, setStats] = useState({ citas: 0, barberos: 0, clientes: 0, servicios: 0 })
  const [citasHoy, setCitasHoy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    Promise.all([getCitas(), getBarberos(), getClientes(), getServicios()])
      .then(([c, b, cl, s]) => {
        setStats({ citas: c.data.length, barberos: b.data.length, clientes: cl.data.length, servicios: s.data.length })
        setCitasHoy(c.data.filter(cita => cita.fecha === hoy).slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Citas totales', value: stats.citas, icon: FiCalendar, color: 'text-krono-600', bg: 'bg-krono-50 border-krono-200' },
    { label: 'Barberos activos', value: stats.barberos, icon: FiScissors, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Clientes', value: stats.clientes, icon: FiUsers, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    { label: 'Servicios', value: stats.servicios, icon: FiList, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  ]

  return (
    <div className="p-8">
      {/* Hero header */}
      <div className="mb-8 bg-gradient-to-r from-krono-600 to-krono-800 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-krono-600/20">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                <path d="M10 8 C10 8 14 6 20 8 C26 10 30 8 30 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 8 L8 28 C8 30 10 32 12 32 L28 32 C30 32 32 30 32 28 L30 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 20 L20 16 L24 20 L20 32" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-krono-100 text-sm font-medium tracking-widest uppercase">Sistema de Gestión</span>
          </div>
          <h1 className="text-3xl font-black text-white">Barbería Krono</h1>
          <p className="text-krono-200 mt-1 capitalize">{format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}</p>
        </div>
        <a href="/reservar" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-krono-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-krono-50 transition-all shadow-md">
          <FiExternalLink /> Portal de Reservas
        </a>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card border ${bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : value}</p>
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
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiClock className="text-krono-500" /> Citas de Hoy
          </h2>
          <div className="flex gap-3">
            <Link to="/horario" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1 transition-colors">
              Ver horario <FiClock className="text-xs" />
            </Link>
            <Link to="/citas" className="text-krono-600 hover:text-krono-700 text-sm flex items-center gap-1 transition-colors font-medium">
              Ver todas <FiArrowRight />
            </Link>
          </div>
        </div>
        {loading ? (
          <p className="text-gray-400 text-center py-8">Cargando...</p>
        ) : citasHoy.length === 0 ? (
          <div className="text-center py-10">
            <FiCalendar className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay citas programadas para hoy</p>
            <Link to="/citas/nueva" className="btn-primary mt-4 inline-flex">Agendar cita</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {citasHoy.map(cita => (
              <div key={cita.id} className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-krono-600 font-bold">{cita.hora_inicio.slice(0,5)}</p>
                    <p className="text-gray-400 text-xs">{cita.hora_fin.slice(0,5)}</p>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{cita.cliente.nombre} {cita.cliente.apellido}</p>
                    <p className="text-gray-500 text-sm">✂️ {cita.barbero.nombre} · {cita.servicio.nombre}</p>
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
