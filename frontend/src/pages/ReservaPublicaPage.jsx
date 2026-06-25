import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getBarberos, getServicios, createReservaPublica } from '../services/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEL_RE = /^\+\d{7,15}$/
const SLOT_MIN = 45

function generarBloques() {
  const bloques = []
  let h = 9 * 60
  while (h + SLOT_MIN <= 19 * 60) {
    const hh = String(Math.floor(h / 60)).padStart(2, '0')
    const mm = String(h % 60).padStart(2, '0')
    bloques.push(`${hh}:${mm}`)
    h += SLOT_MIN
  }
  return bloques
}

const BLOQUES = generarBloques()
const today = new Date().toISOString().split('T')[0]

export default function ReservaPublicaPage() {
  const [step, setStep] = useState(1)
  const [barberos, setBarberos] = useState([])
  const [servicios, setServicios] = useState([])
  const [selected, setSelected] = useState({ barbero_id:'', servicios_ids:[], fecha:'', hora_inicio:'' })
  const [datos, setDatos] = useState({ nombre:'', apellido:'', email:'', telefono:'', direccion:'', comuna:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    Promise.all([getBarberos(), getServicios()]).then(([b, s]) => {
      setBarberos(b.data)
      setServicios(s.data)
    })
  }, [])

  const bloquesDisponibles = () => {
    const ahora = new Date()
    return BLOQUES.filter(bloque => {
      if (selected.fecha === today) {
        const [hh, mm] = bloque.split(':').map(Number)
        const d = new Date(); d.setHours(hh, mm, 0, 0)
        return d > ahora
      }
      return true
    })
  }

  const validateDatos = () => {
    const e = {}
    if (!EMAIL_RE.test(datos.email)) e.email = 'Email inválido (ej: nombre@dominio.cl)'
    if (!TEL_RE.test(datos.telefono)) e.telefono = 'Teléfono inválido (ej: +56912345678)'
    if (!datos.direccion || datos.direccion.trim().length < 5) e.direccion = 'Dirección obligatoria (mínimo 5 caracteres)'
    if (!datos.comuna || datos.comuna.trim().length < 2) e.comuna = 'Comuna obligatoria'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validateDatos()) return
    setLoading(true)
    try {
      await createReservaPublica({ ...selected, ...datos })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al reservar')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva confirmada!</h2>
        <p className="text-gray-500">Te esperamos en Barbería Krono.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">✂️ Barbería Krono</h1>
          <p className="text-gray-500 mt-1">Reserva tu cita en línea</p>
        </div>

        {/* Paso 1: Barbero */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Paso 1: Elige tu barbero</h2>
            <div className="space-y-3">
              {barberos.map(b => (
                <button key={b.id} onClick={() => { setSelected({...selected, barbero_id: b.id}); setStep(2) }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selected.barbero_id === b.id ? 'border-krono-500 bg-krono-50' : 'border-gray-200 hover:border-krono-300'
                  }`}>
                  <p className="font-medium">{b.nombre} {b.apellido}</p>
                  {b.especialidad && <p className="text-sm text-gray-500">{b.especialidad}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Servicios */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Paso 2: Elige tu servicio</h2>
            <div className="space-y-3">
              {servicios.map(s => (
                <button key={s.id} onClick={() => setSelected({...selected, servicios_ids: [s.id]})}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selected.servicios_ids.includes(s.id) ? 'border-krono-500 bg-krono-50' : 'border-gray-200 hover:border-krono-300'
                  }`}>
                  <p className="font-medium">{s.nombre}</p>
                  <p className="text-sm text-gray-500">{s.duracion_minutos} min — ${Number(s.precio).toLocaleString('es-CL')}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">Anterior</button>
              <button onClick={() => { if (selected.servicios_ids.length > 0) setStep(3); else toast.error('Selecciona un servicio') }}
                className="flex-1 py-2 rounded-xl bg-krono-600 text-white font-medium hover:bg-krono-700">Siguiente</button>
            </div>
          </div>
        )}

        {/* Paso 3: Fecha y hora */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Paso 3: Fecha y hora</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Fecha</label>
                <input type="date" min={today} className="w-full border border-gray-300 rounded-xl px-3 py-2"
                  value={selected.fecha} onChange={e => setSelected({...selected, fecha: e.target.value, hora_inicio: ''})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Hora</label>
                <select className="w-full border border-gray-300 rounded-xl px-3 py-2"
                  value={selected.hora_inicio} onChange={e => setSelected({...selected, hora_inicio: e.target.value})} disabled={!selected.fecha}>
                  <option value="">Selecciona hora...</option>
                  {bloquesDisponibles().map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">Anterior</button>
              <button onClick={() => { if (selected.fecha && selected.hora_inicio) setStep(4); else toast.error('Completa fecha y hora') }}
                className="flex-1 py-2 rounded-xl bg-krono-600 text-white font-medium hover:bg-krono-700">Siguiente</button>
            </div>
          </div>
        )}

        {/* Paso 4: Datos personales */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Paso 4: Tus datos</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nombre</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2" value={datos.nombre} onChange={e=>setDatos({...datos,nombre:e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Apellido</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2" value={datos.apellido} onChange={e=>setDatos({...datos,apellido:e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <input type="email" className={`w-full border rounded-xl px-3 py-2 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  value={datos.email} onChange={e=>{ setDatos({...datos,email:e.target.value}); setErrors({...errors,email:''}) }} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono</label>
                <input placeholder="+56912345678" className={`w-full border rounded-xl px-3 py-2 ${errors.telefono ? 'border-red-400' : 'border-gray-300'}`}
                  value={datos.telefono} onChange={e=>{ setDatos({...datos,telefono:e.target.value}); setErrors({...errors,telefono:''}) }} />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Dirección</label>
                <input placeholder="Ej: Av. Brasil 123" className={`w-full border rounded-xl px-3 py-2 ${errors.direccion ? 'border-red-400' : 'border-gray-300'}`}
                  value={datos.direccion} onChange={e=>{ setDatos({...datos,direccion:e.target.value}); setErrors({...errors,direccion:''}) }} />
                {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Comuna</label>
                <input placeholder="Ej: Valparaíso" className={`w-full border rounded-xl px-3 py-2 ${errors.comuna ? 'border-red-400' : 'border-gray-300'}`}
                  value={datos.comuna} onChange={e=>{ setDatos({...datos,comuna:e.target.value}); setErrors({...errors,comuna:''}) }} />
                {errors.comuna && <p className="text-red-500 text-xs mt-1">{errors.comuna}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">Anterior</button>
              <button onClick={() => { if (datos.nombre && datos.apellido) setStep(5); else toast.error('Completa nombre y apellido') }}
                className="flex-1 py-2 rounded-xl bg-krono-600 text-white font-medium hover:bg-krono-700">Revisar</button>
            </div>
          </div>
        )}

        {/* Paso 5: Confirmar */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Paso 5: Confirmar reserva</h2>
            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 rounded-xl p-4">
              <p><span className="font-medium">Barbero:</span> {barberos.find(b=>b.id===selected.barbero_id)?.nombre}</p>
              <p><span className="font-medium">Servicio:</span> {servicios.find(s=>selected.servicios_ids.includes(s.id))?.nombre}</p>
              <p><span className="font-medium">Fecha:</span> {selected.fecha}</p>
              <p><span className="font-medium">Hora:</span> {selected.hora_inicio}</p>
              <p><span className="font-medium">Cliente:</span> {datos.nombre} {datos.apellido}</p>
              <p><span className="font-medium">Email:</span> {datos.email}</p>
              <p><span className="font-medium">Dirección:</span> {datos.direccion}{datos.comuna ? `, ${datos.comuna}` : ''}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(4)} className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">Anterior</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-2 rounded-xl bg-krono-600 text-white font-medium hover:bg-krono-700 disabled:opacity-60">
                {loading ? 'Reservando...' : '✅ Confirmar Reserva'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
