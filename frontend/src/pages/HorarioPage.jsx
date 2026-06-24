import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiUser, FiClock } from 'react-icons/fi'
import { getBarberos, getDisponibilidad } from '../services/api'
import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

const HORA_INICIO = 9
const HORA_FIN = 19
const BLOQUES = (HORA_FIN - HORA_INICIO) * 2 // bloques de 30 min

function generarHoras() {
  const horas = []
  for (let i = 0; i < BLOQUES; i++) {
    const totalMin = HORA_INICIO * 60 + i * 30
    const h = Math.floor(totalMin / 60).toString().padStart(2, '0')
    const m = (totalMin % 60).toString().padStart(2, '0')
    horas.push(`${h}:${m}`)
  }
  return horas
}

const HORAS = generarHoras()

export default function HorarioPage() {
  const [barberos, setBarberos] = useState([])
  const [fecha, setFecha] = useState(new Date())
  const [disponibilidad, setDisponibilidad] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getBarberos().then(r => setBarberos(r.data))
  }, [])

  useEffect(() => {
    if (barberos.length === 0) return
    setLoading(true)
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    Promise.all(
      barberos.map(b => getDisponibilidad(b.id, fechaStr).then(r => ({ id: b.id, data: r.data })))
    ).then(results => {
      const map = {}
      results.forEach(({ id, data }) => { map[id] = data })
      setDisponibilidad(map)
    }).finally(() => setLoading(false))
  }, [barberos, fecha])

  const getBloqueInfo = (barberoId, hora) => {
    const disp = disponibilidad[barberoId]
    if (!disp || !disp.atiende) return null
    return disp.bloques?.find(b => b.hora === hora) || null
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Horario del Día</h1>
        <p className="text-gray-400 mt-1">Vista de disponibilidad por barbero</p>
      </div>

      {/* Selector de fecha */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setFecha(f => subDays(f, 1))}
          className="p-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-all"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <div className="bg-dark-800 border border-dark-600 rounded-xl px-6 py-3 min-w-[220px] text-center">
          <p className="text-white font-semibold text-lg capitalize">
            {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <p className="text-gray-500 text-sm">{format(fecha, 'yyyy')}</p>
        </div>
        <button
          onClick={() => setFecha(f => addDays(f, 1))}
          className="p-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-all"
        >
          <FiChevronRight className="text-xl" />
        </button>
        <button
          onClick={() => setFecha(new Date())}
          className="btn-secondary text-sm"
        >
          Hoy
        </button>
        <input
          type="date"
          className="input-field w-auto"
          value={format(fecha, 'yyyy-MM-dd')}
          onChange={e => setFecha(new Date(e.target.value + 'T12:00:00'))}
        />
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-900/40 border border-green-700/50" />
          <span className="text-gray-400 text-sm">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-900/40 border border-red-700/50" />
          <span className="text-gray-400 text-sm">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-dark-600 border border-dark-500" />
          <span className="text-gray-400 text-sm">No atiende</span>
        </div>
      </div>

      {/* Grid horario */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Cargando horarios...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-20 text-left text-gray-500 text-xs font-medium pb-3 pr-4">
                  <FiClock />
                </th>
                {barberos.map(b => (
                  <th key={b.id} className="pb-3 px-2 min-w-[140px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-krono-500/20 rounded-xl flex items-center justify-center text-krono-400 font-bold text-sm">
                        {b.nombre[0]}{b.apellido[0]}
                      </div>
                      <span className="text-white text-sm font-semibold">{b.nombre}</span>
                      <span className="text-gray-500 text-xs">{b.apellido}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS.map((hora, idx) => (
                <tr key={hora} className={idx % 2 === 0 ? '' : 'bg-dark-800/30'}>
                  <td className="text-gray-500 text-xs py-1 pr-4 font-mono">{hora}</td>
                  {barberos.map(b => {
                    const info = getBloqueInfo(b.id, hora)
                    const atiende = disponibilidad[b.id]?.atiende

                    if (!atiende) {
                      return (
                        <td key={b.id} className="px-2 py-1">
                          <div className="h-7 rounded bg-dark-700 border border-dark-600 opacity-30" />
                        </td>
                      )
                    }

                    if (!info) {
                      return (
                        <td key={b.id} className="px-2 py-1">
                          <div className="h-7 rounded bg-green-900/20 border border-green-800/30" />
                        </td>
                      )
                    }

                    return (
                      <td key={b.id} className="px-2 py-1">
                        <div
                          className={`h-7 rounded border flex items-center px-2 text-xs truncate ${
                            info.ocupado
                              ? 'bg-red-900/40 border-red-700/50 text-red-300'
                              : 'bg-green-900/20 border-green-800/30'
                          }`}
                          title={info.ocupado && info.cita ? `${info.cita.cliente} · ${info.cita.servicio}` : ''}
                        >
                          {info.ocupado && info.cita ? (
                            <span className="truncate">{info.cita.cliente.split(' ')[0]}</span>
                          ) : null}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
