import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CitasPage from './pages/CitasPage'
import BarberosPage from './pages/BarberosPage'
import ClientesPage from './pages/ClientesPage'
import ServiciosPage from './pages/ServiciosPage'
import SillasPage from './pages/SillasPage'
import NuevaCitaPage from './pages/NuevaCitaPage'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid #3a3a3a' }
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="citas" element={<CitasPage />} />
          <Route path="citas/nueva" element={<NuevaCitaPage />} />
          <Route path="barberos" element={<BarberosPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="sillas" element={<SillasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
