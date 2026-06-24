export default function EstadoBadge({ estado }) {
  const clases = {
    asignada: 'badge-asignada',
    completada: 'badge-completada',
    cancelada: 'badge-cancelada',
  }
  const labels = {
    asignada: '● Asignada',
    completada: '✓ Completada',
    cancelada: '✕ Cancelada',
  }
  return (
    <span className={clases[estado] || 'badge-asignada'}>
      {labels[estado] || estado}
    </span>
  )
}
