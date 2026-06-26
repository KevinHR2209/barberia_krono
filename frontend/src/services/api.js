import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ---- Sillas ----
export const getSillas = () => api.get('/sillas/')
export const createSilla = (data) => api.post('/sillas/', data)
export const updateSilla = (id, data) => api.patch(`/sillas/${id}`, data)
export const deleteSilla = (id) => api.delete(`/sillas/${id}`)

// ---- Barberos ----
export const getBarberos = () => api.get('/barberos/')
export const createBarbero = (data) => api.post('/barberos/', data)
export const updateBarbero = (id, data) => api.patch(`/barberos/${id}`, data)
export const deleteBarbero = (id) => api.delete(`/barberos/${id}`)
export const getHorariosBarbero = (id) => api.get(`/horarios/barbero/${id}`)
export const createHorario = (data) => api.post('/horarios/', data)
export const updateHorario = (id, data) => api.patch(`/horarios/${id}`, data)
export const deleteHorario = (id) => api.delete(`/horarios/${id}`)

// ---- Servicios ----
export const getServicios = () => api.get('/servicios/')
export const createServicio = (data) => api.post('/servicios/', data)
export const updateServicio = (id, data) => api.patch(`/servicios/${id}`, data)
export const deleteServicio = (id) => api.delete(`/servicios/${id}`)

// ---- Clientes ----
export const getClientes = () => api.get('/clientes/')
export const createCliente = (data) => api.post('/clientes/', data)
export const updateCliente = (id, data) => api.patch(`/clientes/${id}`, data)
export const deleteCliente = (id) => api.delete(`/clientes/${id}`)

// ---- Citas ----
export const getCitas = () => api.get('/citas/')
export const getCitasBarbero = (id) => api.get(`/citas/barbero/${id}`)
export const createCita = (data) => api.post('/citas/', data)
export const updateEstadoCita = (id, estado) => api.patch(`/citas/${id}/estado`, { estado })
export const getDisponibilidad = (barberoId, fecha) => api.get(`/citas/disponibilidad/${barberoId}/${fecha}`)

// ---- Reserva Pública ----
export const createReservaPublica = (data) => api.post('/citas/reserva-publica', data)
