import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice'
import {
  LogOut, ExternalLink, MessageCircle, Landmark,
  LayoutDashboard, ChevronDown, Menu, X,
} from 'lucide-react'
import api from '../../services/api'

const UNREAD_POLL_INTERVAL = 15000

const NAV_ITEMS = [
  { label: 'Tableau de bord', to: '/creator',         icon: LayoutDashboard, exact: true },
  { label: 'Messages',        to: '/creator/chat',    icon: MessageCircle },
  { label: 'Paiement',        to: '/creator/payment', icon: Landmark },
]

export default function CreatorLayout() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()

  const [unreadCount, setUnreadCount]     = useState(0)
  const [showProfile, setShowProfile]     = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const profileRef = useRef(null)

  useEffect(function() {
    if (!user || user.role !== 'creator') return

    const fetchUnread = function() {
      api.get('/messages/unread')
        .then(function(res) { setUnreadCount(res.data.creators || 0) })
        .catch(function() {})
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, UNREAD_POLL_INTERVAL)
    return function() { clearInterval(interval) }
  }, [user, location.pathname])

  useEffect(function() {
    const handleClickOutside = function(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return function() { document.removeEventListener('mousedown', handleClickOutside) }
  }, [])

  if (!user || user.role !== 'creator') return <Navigate to="/login" />

  const isActive = function(item) {
    return item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  }

  const getAvatarUrl = function(avatar) {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads')) return 'http://localhost:5000' + avatar
    return avatar
  }

  const avatarUrl = getAvatarUrl(user.avatar)

  const handleLogout = function() {
    dispatch(logout())
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">

      <header className="bg-stone-900 text-white sticky top-0 z-20 shadow-sm shadow-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/creator" className="flex flex-col leading-none flex-shrink-0">
            <span className="text-base font-light tracking-[0.22em] uppercase">Brillante</span>
            <span className="text-[9px] tracking-[0.35em] text-stone-400 uppercase">Espace Créateur</span>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
            {NAV_ITEMS.map(function(item) {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    'relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition ' +
                    (active ? 'bg-white text-stone-900' : 'text-stone-300 hover:text-white')
                  }
                >
                  <Icon size={13} /> {item.label}
                  {item.to === '/creator/chat' && unreadCount > 0 && (
                    <span className={
                      'flex items-center justify-center text-[10px] font-bold rounded-full min-w-[1.05rem] h-[1.05rem] px-1 ' +
                      (active ? 'bg-red-500 text-white' : 'bg-red-500 text-white')
                    }>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">

            <a
              href="/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition px-2"
            >
              <ExternalLink size={12} /> Voir la boutique
            </a>

            {/* Profile dropdown — desktop */}
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={function() { setShowProfile(!showProfile) }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center text-xs font-medium overflow-hidden flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <ChevronDown size={14} className={'text-stone-400 transition-transform ' + (showProfile ? 'rotate-180' : '')} />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-100 rounded-2xl shadow-lg overflow-hidden text-stone-800">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition"
                  >
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={function() { setShowMobileMenu(!showMobileMenu) }}
              className="md:hidden p-2 text-stone-300 hover:text-white transition"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Nav — mobile */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map(function(item) {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={function() { setShowMobileMenu(false) }}
                  className={
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ' +
                    (active ? 'bg-white text-stone-900 font-medium' : 'text-stone-300 hover:bg-white/10 hover:text-white')
                  }
                >
                  <Icon size={15} /> {item.label}
                  {item.to === '/creator/chat' && unreadCount > 0 && (
                    <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[1.1rem] h-[1.1rem] px-1 ml-auto">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}

            <a
              href="/shop"
              target="_blank"
              rel="noopener noreferrer"
              onClick={function() { setShowMobileMenu(false) }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-stone-300 hover:bg-white/10 hover:text-white transition"
            >
              <ExternalLink size={15} /> Voir la boutique
            </a>

            <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center text-xs font-medium overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-stone-300 hover:text-white transition"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <Outlet />
      </main>

    </div>
  )
}
