import { useEffect, useState } from 'react'
import { FiScissors, FiCalendar, FiUser, FiCheck, FiArrowLeft, FiArrowRight, FiClock } from 'react-icons/fi'
import toast, { Toaster } from 'react-hot-toast'
import { getBarberos, getServicios, getDisponibilidad, createCita, createCliente, getClientes } from '../services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const PASOS = ['Barbero', 'Servicio', 'Fecha y Hora', 'Tus datos', 'Confirmar']

export default function ReservaPublicaPage() {
  const [paso, setPaso] = useState(0)
  const [barberos, setBarberos] = useState([])
  const [servicios, setServicios] = useState([])
  const [bloques, setBloques] = useState([])
  const [loadingBloques, setLoadingBloques] = useState(false)
  const [confirmado, setConfirmado] = useState(false)

  const [sel, setSel] = useState({
    barbero: null, servicio: null, fecha: '', hora: '', horaFin: ''
  })
  const [clienteForm, setClienteForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', direccion: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getBarberos().then(r => setBarberos(r.data))
    getServicios().then(r => setServicios(r.data))
  }, [])

  useEffect(() => {
    if (sel.barbero && sel.fecha) {
      setLoadingBloques(true)
      getDisponibilidad(sel.barbero.id, sel.fecha)
        .then(r => setBloques(r.data.bloques || []))
        .finally(() => setLoadingBloques(false))
    }
  }, [sel.barbero, sel.fecha])

  const siguiente = () => setPaso(p => Math.min(p + 1, PASOS.length - 1))
  const anterior = () => setPaso(p => Math.max(p - 1, 0))

  const confirmar = async () => {
    setLoading(true)
    try {
      // Buscar o crear cliente
      let clienteId
      try {
        const existing = await getClientes()
        const found = existing.data.find(c => c.email === clienteForm.email)
        if (found) {
          clienteId = found.id
        } else {
          const nuevo = await createCliente(clienteForm)
          clienteId = nuevo.data.id
        }
      } catch {
        const nuevo = await createCliente(clienteForm)
        clienteId = nuevo.data.id
      }

      await createCita({
        cliente_id: clienteId,
        barbero_id: sel.barbero.id,
        servicio_id: sel.servicio.id,
        fecha: sel.fecha,
        hora_inicio: sel.hora,
      })
      setConfirmado(true)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al reservar')
    } finally {
      setLoading(false)
    }
  }

  if (confirmado) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-4xl text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">¡Reserva confirmada!</h1>
          <p className="text-gray-400 mb-2">Tu cita ha sido agendada exitosamente.</p>
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 mt-6 text-left space-y-3">
            <p className="text-gray-400 text-sm">Barbero: <span className="text-white font-medium">{sel.barbero?.nombre} {sel.barbero?.apellido}</span></p>
            <p className="text-gray-400 text-sm">Servicio: <span className="text-white font-medium">{sel.servicio?.nombre}</span></p>
            <p className="text-gray-400 text-sm">Fecha: <span className="text-white font-medium">{sel.fecha && format(new Date(sel.fecha + 'T12:00'), "EEEE d 'de' MMMM", { locale: es })}</span></p>
            <p className="text-gray-400 text-sm">Hora: <span className="text-krono-400 font-bold">{sel.hora}</span></p>
          </div>
          <button
            onClick={() => { setConfirmado(false); setPaso(0); setSel({ barbero:null,servicio:null,fecha:'',hora:'',horaFin:'' }); setClienteForm({ nombre:'',apellido:'',email:'',telefono:'',direccion:'' }) }}
            className="btn-primary mt-8 mx-auto"
          >
            Nueva reserva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #3a3a3a' }}} />
      
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-600 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-krono-500 to-krono-700 rounded-xl flex items-center justify-center">
            <FiScissors className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">KRONO Barbería</h1>
            <p className="text-gray-400 text-sm">Reserva tu cita online</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-8">
          {PASOS.map((p, i) => (
            <div key={p} className="flex items-center">
              <div className={`flex flex-col items-center gap-1`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < paso ? 'bg-krono-500 text-white' :
                  i === paso ? 'bg-krono-500 text-white ring-4 ring-krono-500/30' :
                  'bg-dark-700 text-gray-500'
                }`}>
                  {i < paso ? <FiCheck /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${ i === paso ? 'text-krono-400 font-medium' : 'text-gray-600'}`}>{p}</span>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-12 mx-1 sm:mx-2 ${ i < paso ? 'bg-krono-500' : 'bg-dark-600'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del paso */}
        <div className="card min-h-[300px]">

          {/* Paso 0: Elegir barbero */}
          {paso === 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Elige tu barbero</h2>
              <p className="text-gray-400 text-sm mb-5">Selecciona con quién quieres atenderte</p>
              <div className="grid grid-cols-1 gap-3">
                {barberos.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSel(s => ({...s, barbero: b})); siguiente() }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      sel.barbero?.id === b.id
                        ? 'border-krono-500 bg-krono-500/10'
                        : 'border-dark-600 hover:border-krono-500/50 bg-dark-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-krono-500/20 rounded-xl flex items-center justify-center text-krono-400 font-bold text-lg">
                      {b.nombre[0]}{b.apellido[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{b.nombre} {b.apellido}</p>
                      <p className="text-gray-400 text-sm">Barbero profesional</p>
                    </div>
                    {sel.barbero?.id === b.id && <FiCheck className="ml-auto text-krono-400 text-xl" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 1: Elegir servicio */}
          {paso === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Elige el servicio</h2>
              <p className="text-gray-400 text-sm mb-5">¿Qué te vamos a hacer hoy?</p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {servicios.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSel(sv => ({...sv, servicio: s})); siguiente() }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      sel.servicio?.id === s.id
                        ? 'border-krono-500 bg-krono-500/10'
                        : 'border-dark-600 hover:border-krono-500/50 bg-dark-700'
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{s.nombre}</p>
                      {s.descripcion && <p className="text-gray-500 text-xs mt-0.5">{s.descripcion}</p>}
                      <p className="text-gray-400 text-sm mt-1"><FiClock className="inline text-xs mr-1"/>{s.duracion_minutos} min</p>
                    </div>
                    <p className="text-krono-400 font-bold text-lg">${Number(s.precio).toLocaleString('es-CL')}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 2: Fecha y hora */}
          {paso === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Elige fecha y hora</h2>
              <p className="text-gray-400 text-sm mb-5">Selecciona un día y hora disponible</p>
              <div className="mb-4">
                <label className="label">Fecha</label>
                <input
                  type="date"
                  className="input-field"
                  value={sel.fecha}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => setSel(s => ({...s, fecha: e.target.value, hora: ''}))}
                />
              </div>
              {sel.fecha && (
                <div>
                  <label className="label">Hora disponible</label>
                  {loadingBloques ? (
                    <p className="text-gray-500 text-sm">Cargando disponibilidad...</p>
                  ) : bloques.length === 0 ? (
                    <p className="text-gray-500 text-sm">El barbero no atiende ese día</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {bloques.filter(b => !b.ocupado).map(b => (
                        <button
                          key={b.hora}
                          onClick={() => setSel(s => ({...s, hora: b.hora}))}
                          className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                            sel.hora === b.hora
                              ? 'border-krono-500 bg-krono-500/20 text-krono-400'
                              : 'border-dark-600 bg-dark-700 text-gray-300 hover:border-krono-500/50'
                          }`}
                        >
                          {b.hora}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Datos del cliente */}
          {paso === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Tus datos</h2>
              <p className="text-gray-400 text-sm mb-5">Para confirmar tu reserva necesitamos tu información</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Nombre</label><input className="input-field" value={clienteForm.nombre} onChange={e=>setClienteForm({...clienteForm,nombre:e.target.value})} required /></div>
                  <div><label className="label">Apellido</label><input className="input-field" value={clienteForm.apellido} onChange={e=>setClienteForm({...clienteForm,apellido:e.target.value})} required /></div>
                </div>
                <div><label className="label">Email</label><input type="email" className="input-field" value={clienteForm.email} onChange={e=>setClienteForm({...clienteForm,email:e.target.value})} required /></div>
                <div><label className="label">Teléfono</label><input className="input-field" value={clienteForm.telefono} onChange={e=>setClienteForm({...clienteForm,telefono:e.target.value})} /></div>
                <div><label className="label">Dirección</label><input className="input-field" placeholder="Ej: Av. Brasil 123, Valparaíso" value={clienteForm.direccion} onChange={e=>setClienteForm({...clienteForm,direccion:e.target.value})} /></div>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmar */}
          {paso === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Confirma tu reserva</h2>
              <p className="text-gray-400 text-sm mb-5">Revisa los detalles antes de confirmar</p>
              <div className="space-y-3">
                {[
                  { label: 'Barbero', value: `${sel.barbero?.nombre} ${sel.barbero?.apellido}` },
                  { label: 'Servicio', value: sel.servicio?.nombre },
                  { label: 'Duración', value: `${sel.servicio?.duracion_minutos} minutos` },
                  { label: 'Precio', value: `$${Number(sel.servicio?.precio || 0).toLocaleString('es-CL')}` },
                  { label: 'Fecha', value: sel.fecha ? format(new Date(sel.fecha + 'T12:00'), "EEEE d 'de' MMMM yyyy", { locale: es }) : '' },
                  { label: 'Hora', value: sel.hora },
                  { label: 'Cliente', value: `${clienteForm.nombre} ${clienteForm.apellido}` },
                  { label: 'Email', value: clienteForm.email },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-dark-600">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <span className="text-white font-medium text-sm">{value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={confirmar}
                disabled={loading}
                className="btn-primary w-full justify-center mt-6 py-4 text-base"
              >
                {loading ? 'Confirmando...' : '✂️ Confirmar Reserva'}
              </button>
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        {paso > 0 && paso < PASOS.length - 1 && (
          <div className="flex justify-between mt-4">
            <button onClick={anterior} className="btn-secondary">
              <FiArrowLeft /> Anterior
            </button>
            {paso === 2 && sel.hora && (
              <button onClick={siguiente} className="btn-primary">
                Siguiente <FiArrowRight />
              </button>
            )}
            {paso === 3 && clienteForm.nombre && clienteForm.email && (
              <button onClick={siguiente} className="btn-primary">
                Revisar <FiArrowRight />
              </button>
            )}
          </div>
        )}
        {paso === 1 && (
          <button onClick={anterior} className="btn-secondary mt-4">
            <FiArrowLeft /> Anterior
          </button>
        )}
      </div>
    </div>
  )
}
