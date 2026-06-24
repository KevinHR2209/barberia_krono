import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CitasPage from './pages/CitasPage'
import NuevaCitaPage from './pages/NuevaCitaPage'
import BarberosPage from './pages/BarberosPage'
import ClientesPage from './pages/ClientesPage'
import ServiciosPage from './pages/ServiciosPage'
import SillasPage from './pages/SillasPage'
import HorarioPage from './pages/HorarioPage'
import ReservaPublicaPage from './pages/ReservaPublicaPage'
import CancelarCitaPage from './pages/CancelarCitaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f5' }
      }} />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/reservar" element={<ReservaPublicaPage />} />
        <Route path="/cancelar/:token" element={<CancelarCitaPage />} />
        {/* Panel admin */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="citas" element={<CitasPage />} />
          <Route path="citas/nueva" element={<NuevaCitaPage />} />
          <Route path="horario" element={<HorarioPage />} />
          <Route path="barberos" element={<BarberosPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="sillas" element={<SillasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
