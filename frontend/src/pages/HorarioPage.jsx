import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi'
import { getBarberos, getDisponibilidad } from '../services/api'
import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

const HORA_INICIO = 9
const HORA_FIN = 19
const BLOQUES = (HORA_FIN - HORA_INICIO) * 2

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

  useEffect(() => { getBarberos().then(r => setBarberos(r.data)) }, [])

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Horario del Día</h1>
        <p className="text-gray-500 mt-1">Vista de disponibilidad por barbero</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setFecha(f => subDays(f, 1))} className="p-2 bg-white border border-dark-500 hover:bg-dark-700 text-gray-600 rounded-xl transition-all shadow-sm">
          <FiChevronLeft className="text-xl" />
        </button>
        <div className="bg-white border border-dark-500 rounded-xl px-6 py-3 min-w-[220px] text-center shadow-sm">
          <p className="text-gray-800 font-semibold text-lg capitalize">
            {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <p className="text-gray-400 text-sm">{format(fecha, 'yyyy')}</p>
        </div>
        <button onClick={() => setFecha(f => addDays(f, 1))} className="p-2 bg-white border border-dark-500 hover:bg-dark-700 text-gray-600 rounded-xl transition-all shadow-sm">
          <FiChevronRight className="text-xl" />
        </button>
        <button onClick={() => setFecha(new Date())} className="btn-secondary text-sm">Hoy</button>
        <input type="date" className="input-field w-auto" value={format(fecha, 'yyyy-MM-dd')} onChange={e => setFecha(new Date(e.target.value + 'T12:00:00'))} />
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border border-green-300" /><span className="text-gray-500 text-sm">Disponible</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border border-red-300" /><span className="text-gray-500 text-sm">Ocupado</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-dark-600 border border-dark-500" /><span className="text-gray-500 text-sm">No atiende</span></div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando horarios...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-dark-600 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="w-20 text-left text-gray-400 text-xs font-medium p-3">
                  <FiClock />
                </th>
                {barberos.map(b => (
                  <th key={b.id} className="p-3 min-w-[140px] border-l border-dark-600">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-krono-100 rounded-xl flex items-center justify-center text-krono-700 font-bold text-sm">
                        {b.nombre[0]}{b.apellido[0]}
                      </div>
                      <span className="text-gray-800 text-sm font-semibold">{b.nombre}</span>
                      <span className="text-gray-400 text-xs">{b.apellido}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS.map((hora, idx) => (
                <tr key={hora} className={`border-b border-dark-600 ${ idx % 2 === 0 ? 'bg-white' : 'bg-dark-900/50'}`}>
                  <td className="text-gray-400 text-xs p-2 pl-3 font-mono">{hora}</td>
                  {barberos.map(b => {
                    const info = getBloqueInfo(b.id, hora)
                    const atiende = disponibilidad[b.id]?.atiende
                    if (!atiende) return (
                      <td key={b.id} className="p-1 border-l border-dark-600">
                        <div className="h-7 rounded bg-dark-600 opacity-40 mx-1" />
                      </td>
                    )
                    if (!info) return (
                      <td key={b.id} className="p-1 border-l border-dark-600">
                        <div className="h-7 rounded bg-green-50 border border-green-200 mx-1" />
                      </td>
                    )
                    return (
                      <td key={b.id} className="p-1 border-l border-dark-600">
                        <div
                          className={`h-7 rounded border flex items-center px-2 text-xs truncate mx-1 ${
                            info.ocupado
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-green-50 border-green-200'
                          }`}
                          title={info.ocupado && info.cita ? `${info.cita.cliente} · ${info.cita.servicio}` : ''}
                        >
                          {info.ocupado && info.cita ? <span className="truncate font-medium">{info.cita.cliente.split(' ')[0]}</span> : null}
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
