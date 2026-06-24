import { Outlet, NavLink } from 'react-router-dom'
import {
  FiScissors, FiCalendar, FiUsers, FiUser,
  FiList, FiGrid, FiHome
} from 'react-icons/fi'

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/citas', label: 'Citas', icon: FiCalendar },
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
            <div className="w-10 h-10 bg-krono-500 rounded-xl flex items-center justify-center">
              <FiScissors className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Barbería</h1>
              <p className="text-krono-400 font-bold text-lg leading-none">Krono</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
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

        {/* Footer */}
        <div className="p-4 border-t border-dark-600">
          <p className="text-xs text-gray-600 text-center">© 2026 Barbería Krono</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-dark-900">
        <Outlet />
      </main>
    </div>
  )
}
