import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice'
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Tag, LogOut, ExternalLink, MessageCircle, Image } from 'lucide-react'
import AdminNavbar from './AdminNavbar'
import api from '../../services/api'

const UNREAD_POLL_INTERVAL = 15000


export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(function() {
    const stored = localStorage.getItem('adminSidebarOpen')
    return stored === null ? true : stored === 'true'
  })

  useEffect(function() {
    localStorage.setItem('adminSidebarOpen', String(sidebarOpen))
  }, [sidebarOpen])

  const [unreadChat, setUnreadChat] = useState({ team: 0, creators: 0 })

  useEffect(function() {
    if (!user || !['admin', 'manager'].includes(user.role)) return

    const fetchUnread = function() {
      api.get('/messages/unread')
        .then(function(res) { setUnreadChat(function(prev) { return { ...prev, ...res.data } }) })
        .catch(function() {})
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, UNREAD_POLL_INTERVAL)
    return function() { clearInterval(interval) }
  }, [user, location.pathname])

  // Rôles autorisés à accéder au dashboard
  const allowedRoles = ['admin', 'manager']

  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/login" />

  const isAdmin = user.role === 'admin'

  // Le manager n'a pas accès au Dashboard — redirigé vers Produits
  if (!isAdmin && location.pathname === '/admin') {
    return <Navigate to="/admin/products" replace />
  }

  const allNavItems = [
    { name: 'Dashboard',    to: '/admin',           icon: <LayoutDashboard size={16} />, roles: ['admin'] },
    { name: 'Produits',     to: '/admin/products',  icon: <Package size={16} />,         roles: ['admin', 'manager'] },
    { name: 'Commandes',    to: '/admin/orders',    icon: <ShoppingBag size={16} />,     roles: ['admin', 'manager'] },
    { name: 'Users',        to: '/admin/users',     icon: <BarChart2 size={16} />,       roles: ['admin'] },
    { name: 'Statistiques', to: '/admin/stats',     icon: <BarChart2 size={16} />,       roles: ['admin'] },
    { name: 'Promos',       to: '/admin/promos',    icon: <Tag size={16} />,             roles: ['admin', 'manager'] },
    { name: 'Collections',  to: '/admin/collections', icon: <Image size={16} />,         roles: ['admin', 'manager'] },
    { name: 'Messages',     to: '/admin/chat',      icon: <MessageCircle size={16} />,   roles: ['admin', 'manager'] },
  ]

  const navItems = allNavItems.filter(function(item) {
    return item.roles.includes(user.role)
  })

  const siteLinks = [
    { label: 'Home',    href: '/' },
    { label: 'Shop',    href: '/shop' },
    { label: 'About',   href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-[#f9f8f6] dark:bg-stone-950 flex transition-colors">

      <aside className={'bg-stone-900 dark:bg-black text-white flex-shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-300 ' + (sidebarOpen ? 'w-56' : 'w-18')}>
       <div className="flex flex-col min-h-screen h-full overflow-y-auto overflow-x-hidden">

        <div className={'py-8 border-b border-stone-700 ' + (sidebarOpen ? 'px-6' : 'px-0 flex flex-col items-center')}>
          {sidebarOpen ? (
            <>
              <h1 className="text-lg font-light tracking-[0.2em] uppercase whitespace-nowrap">Brillante</h1>
              <p className="text-[10px] tracking-widest text-stone-400 uppercase whitespace-nowrap">
                {isAdmin ? 'Admin Panel' : 'Espace Gestionnaire'}
              </p>
            </>
          ) : (
            <span className="text-lg font-light tracking-widest uppercase w-9 h-9 flex items-center justify-center rounded-xl bg-stone-800">B</span>
          )}
        </div>

        <nav className={'py-6 flex flex-col gap-1 ' + (sidebarOpen ? 'px-3' : 'px-2')}>
          {navItems.map(function(item) {
            const isActive = location.pathname === item.to
            const unreadCount = item.to === '/admin/chat' ? unreadChat.team + unreadChat.creators : 0
            return (
              <Link
                key={item.name}
                to={item.to}
                title={sidebarOpen ? undefined : item.name}
                className={
                  'relative flex items-center rounded-xl text-sm transition whitespace-nowrap ' +
                  (sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center py-3') +
                  ' ' +
                  (isActive ? 'bg-white text-stone-900 font-medium' : 'text-stone-400 hover:bg-stone-800 hover:text-white')
                }
              >
                {item.icon} {sidebarOpen && item.name}
                {unreadCount > 0 && (
                  <span className={
                    'flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[1.1rem] h-[1.1rem] px-1 ' +
                    (sidebarOpen ? 'ml-auto' : 'absolute top-1 right-2')
                  }>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className={'py-4 border-t border-stone-700 ' + (sidebarOpen ? 'px-3' : 'px-2')}>
          {sidebarOpen && <p className="text-[10px] tracking-widest uppercase text-stone-500 px-4 mb-2 whitespace-nowrap">Voir le site</p>}
          {siteLinks.map(function(link) {
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={sidebarOpen ? undefined : link.label}
                className={
                  'flex items-center text-xs text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition whitespace-nowrap ' +
                  (sidebarOpen ? 'gap-2 px-4 py-2' : 'justify-center py-2.5')
                }
              >
                <ExternalLink size={12} /> {sidebarOpen && link.label}
              </a>
            )
          })}
        </div>

        <div className={'py-6 border-t border-stone-700 mt-auto ' + (sidebarOpen ? 'px-3' : 'px-2')}>
          {sidebarOpen && (
            <div className="px-4 py-2 mb-3">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => dispatch(logout())}
            title={sidebarOpen ? undefined : 'Deconnexion'}
            className={
              'flex items-center text-sm text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition w-full whitespace-nowrap ' +
              (sidebarOpen ? 'gap-2 px-4 py-2.5' : 'justify-center py-2.5')
            }
          >
            <LogOut size={15} /> {sidebarOpen && 'Deconnexion'}
          </button>
        </div>
       </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar user={user} sidebarOpen={sidebarOpen} onToggleSidebar={function() { setSidebarOpen(!sidebarOpen) }} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}