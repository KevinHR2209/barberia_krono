import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheck, FiX, FiLoader, FiScissors } from 'react-icons/fi'
import axios from 'axios'

export default function CancelarCitaPage() {
  const { token } = useParams()
  const [estado, setEstado] = useState('cargando') // cargando | ok | error | ya_cancelada
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    // Llamamos al backend directamente (devuelve HTML), pero también
    // podemos usar un endpoint JSON dedicado para manejar esto desde React
    axios.post(`/api/citas/cancelar/${token}`)
      .then(() => setEstado('ok'))
      .catch(err => {
        const detail = err.response?.data?.detail || ''
        if (err.response?.status === 400) {
          setEstado('error')
          setMensaje(detail || 'Esta cita ya fue completada y no puede cancelarse.')
        } else if (err.response?.status === 404) {
          setEstado('error')
          setMensaje('Enlace inválido o ya utilizado.')
        } else {
          setEstado('ok') // 200 = ya cancelada o éxito
        }
      })
  }, [token])

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-dark-600 p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FiScissors className="text-krono-600 text-2xl" />
          <span className="font-black text-xl text-krono-900">KRONO Barbería</span>
        </div>

        {estado === 'cargando' && (
          <>
            <FiLoader className="text-5xl text-krono-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Procesando cancelación...</p>
          </>
        )}

        {estado === 'ok' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-4xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Cita cancelada</h1>
            <p className="text-gray-500 mb-8">Tu reserva ha sido cancelada exitosamente. Si fue un error, puedes hacer una nueva reserva.</p>
            <Link to="/reservar" className="btn-primary mx-auto">Hacer nueva reserva</Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiX className="text-4xl text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">No se pudo cancelar</h1>
            <p className="text-gray-500 mb-8">{mensaje}</p>
            <Link to="/reservar" className="btn-primary mx-auto">Ir al inicio</Link>
          </>
        )}
      </div>
    </div>
  )
}
