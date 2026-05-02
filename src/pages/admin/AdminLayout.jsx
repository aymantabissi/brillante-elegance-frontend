import { useSelector, useDispatch } from 'react-redux'
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice'
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Tag, LogOut, ExternalLink } from 'lucide-react'


export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()

  if (!user || user.role !== 'admin') return <Navigate to="/login" />

  const navItems = [
    { name: 'Dashboard',    to: '/admin',           icon: <LayoutDashboard size={16} /> },
    { name: 'Produits',     to: '/admin/products',  icon: <Package size={16} /> },
    { name: 'Commandes',    to: '/admin/orders',    icon: <ShoppingBag size={16} /> },
    { name: 'Statistiques', to: '/admin/stats',     icon: <BarChart2 size={16} /> },
    { name: 'Promos', to: '/admin/promos', icon: <Tag size={16} /> },

  ]

  const siteLinks = [
    { label: 'Home',    href: '/' },
    { label: 'Shop',    href: '/shop' },
    { label: 'About',   href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex">

      <aside className="w-56 bg-stone-900 text-white flex flex-col min-h-screen flex-shrink-0 sticky top-0 h-screen overflow-y-auto">

        <div className="px-6 py-8 border-b border-stone-700">
          <h1 className="text-lg font-light tracking-[0.2em] uppercase">Brillante</h1>
          <p className="text-[10px] tracking-widest text-stone-400 uppercase">Admin Panel</p>
        </div>

        <nav className="py-6 flex flex-col gap-1 px-3">
          {navItems.map(function(item) {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.name}
                to={item.to}
                className={'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ' + (isActive ? 'bg-white text-stone-900 font-medium' : 'text-stone-400 hover:bg-stone-800 hover:text-white')}
              >
                {item.icon} {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-stone-700">
          <p className="text-[10px] tracking-widest uppercase text-stone-500 px-4 mb-2">Voir le site</p>
          {siteLinks.map(function(link) {
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-xs text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
              >
                <ExternalLink size={12} /> {link.label}
              </a>
            )
          })}
        </div>

        <div className="px-3 py-6 border-t border-stone-700 mt-auto">
          <div className="px-4 py-2 mb-3">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition w-full"
          >
            <LogOut size={15} /> Deconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}