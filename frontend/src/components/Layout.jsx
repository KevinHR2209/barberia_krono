import { Outlet, NavLink } from 'react-router-dom'
import { FiScissors, FiCalendar, FiUsers, FiUser, FiList, FiGrid, FiHome, FiClock, FiExternalLink } from 'react-icons/fi'

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/citas', label: 'Citas', icon: FiCalendar },
  { to: '/horario', label: 'Horario', icon: FiClock },
  { to: '/barberos', label: 'Barberos', icon: FiScissors },
  { to: '/clientes', label: 'Clientes', icon: FiUsers },
  { to: '/servicios', label: 'Servicios', icon: FiList },
  { to: '/sillas', label: 'Sillas', icon: FiGrid },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center gap-3">
            {/* Logo SVG de la barbería */}
            <div className="w-12 h-12 bg-gradient-to-br from-krono-500 to-krono-700 rounded-xl flex items-center justify-center shadow-lg shadow-krono-900/50">
              <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 8 C10 8 14 6 20 8 C26 10 30 8 30 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 14 L28 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 8 L8 28 C8 30 10 32 12 32 L28 32 C30 32 32 30 32 28 L30 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 20 L20 16 L24 20 L20 32" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="14" r="1.5" fill="#fbbf24"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none tracking-tight">KRONO</h1>
              <p className="text-krono-400 text-xs font-medium tracking-widest uppercase">Barbería</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-krono-500/20 text-krono-400 border border-krono-500/30'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                }`
              }
            >
              <Icon className="text-lg" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Link reserva pública */}
        <div className="p-4 border-t border-dark-600">
          <a
            href="/reservar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-krono-500/10 border border-krono-500/20 text-krono-400 hover:bg-krono-500/20 transition-all text-sm font-medium"
          >
            <FiExternalLink />
            Portal de Reservas
          </a>
          <p className="text-xs text-gray-600 text-center mt-3">© 2026 Barbería Krono</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-dark-900">
        <Outlet />
      </main>
    </div>
  )
}
