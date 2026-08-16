import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Bell, Moon, Sun, LogOut, Package, User as UserIcon, PanelLeft } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { useTheme } from '../../hooks/useTheme'
import api from '../../services/api'

const POLL_INTERVAL = 30000

export default function AdminNavbar({ user, sidebarOpen, onToggleSidebar }) {
  const { isDark, toggleDark } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [pendingOrders, setPendingOrders] = useState([])
  const [showNotifs,    setShowNotifs]    = useState(false)
  const [showProfile,   setShowProfile]   = useState(false)

  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  const fetchPending = async function() {
    try {
      const { data } = await api.get('/orders')
      setPendingOrders(data.filter(function(o) { return o.orderStatus === 'not_processed' }))
    } catch (e) {
      console.error('fetch pending orders error', e)
    }
  }

  useEffect(function() {
    fetchPending()
    const interval = setInterval(fetchPending, POLL_INTERVAL)
    return function() { clearInterval(interval) }
  }, [])

  useEffect(function() {
    const handleClickOutside = function(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return function() { document.removeEventListener('mousedown', handleClickOutside) }
  }, [])

  const handleLogout = function() {
    dispatch(logout())
    navigate('/login')
  }

  const getAvatarUrl = function(avatar) {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads')) return 'http://localhost:5000' + avatar
    return avatar
  }

  const avatarUrl = getAvatarUrl(user?.avatar)

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 px-6 py-3 flex items-center justify-between gap-2 transition-colors">

      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Masquer le menu' : 'Afficher le menu'}
        className="p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition"
      >
        <PanelLeft size={18} />
      </button>

      <div className="flex items-center gap-2">

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
        className="p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={function() { setShowNotifs(!showNotifs); setShowProfile(false) }}
          title="Commandes en attente"
          className="relative p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition"
        >
          <Bell size={18} />
          {pendingOrders.length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {pendingOrders.length > 9 ? '9+' : pendingOrders.length}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
              <p className="text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 font-medium">
                Commandes en attente ({pendingOrders.length})
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {pendingOrders.length === 0 ? (
                <p className="text-center text-xs text-stone-400 dark:text-stone-500 py-8">Aucune commande en attente</p>
              ) : (
                pendingOrders.slice(0, 10).map(function(o) {
                  return (
                    <button
                      key={o._id}
                      onClick={function() { setShowNotifs(false); navigate('/admin/orders') }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800 transition border-b border-stone-50 dark:border-stone-800 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Package size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">{o.client.name}</p>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500">#{o._id.slice(-6).toUpperCase()} · {o.total} MAD</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative ml-1" ref={profileRef}>
        <button
          onClick={function() { setShowProfile(!showProfile); setShowNotifs(false) }}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center text-xs font-medium flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <span className="hidden sm:block text-xs font-medium text-stone-700 dark:text-stone-200">{user?.name}</span>
        </button>

        {showProfile && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={function() { setShowProfile(false); navigate('/admin/profile') }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
            >
              <UserIcon size={15} /> Voir mon profil
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition border-t border-stone-50 dark:border-stone-800"
            >
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        )}
      </div>

      </div>
    </header>
  )
}
