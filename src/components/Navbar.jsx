import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { ShoppingBag, X, Menu, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

export default function Navbar({ wishlistCount = 0 }) {
  const [showBanner, setShowBanner] = useState(true)
  const [showMenu,   setShowMenu]   = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  const { user }  = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)
  const cartCount = items.reduce((acc, i) => acc + i.qty, 0)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  // Rôles ayant accès au dashboard admin
  const canAccessDashboard = user && ['admin', 'manager', 'employee'].includes(user.role)

  // Detect scroll pour shadow
  useEffect(function() {
    const handleScroll = function() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return function() { window.removeEventListener('scroll', handleScroll) }
  }, [])

  const handleLogout = function() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">

      {/* Top Banner */}
      {showBanner && (
        <div className="bg-black text-white text-sm py-2.5 px-6 flex items-center justify-center relative">
          <p className="tracking-wide text-center text-xs">
            SOLDES D'ÉTÉ — -15% sur tous les produits.{' '}
            <span className="text-stone-300 font-mono">foryou50</span>
          </p>
          <button
            onClick={function() {
              navigator.clipboard.writeText('foryou50')
              toast.success('Code promo copié : foryou50', { icon: '🎉', style: toastStyle })
            }}
            className="absolute right-4 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition hidden sm:block"
          >
            Obtenir
          </button>
          <button
            onClick={function() { setShowBanner(false) }}
            className="absolute right-4 sm:right-28 text-white hover:text-stone-300 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className={'bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 px-6 py-4 transition-shadow duration-300 ' + (scrolled ? 'shadow-md' : '')}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-2xl font-bold tracking-[0.15em] text-stone-900 dark:text-white uppercase">
              Brillante
            </span>
            <span className="text-[9px] tracking-[0.4em] text-stone-400 dark:text-stone-500 uppercase">
              Élégance
            </span>
          </Link>

          {/* Nav Links desktop */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Accueil',   to: '/' },
              { label: 'Boutique',  to: '/shop' },
              { label: 'À propos',  to: '/about' },
              { label: 'Contact',   to: '/contact' },
            ].map(function(link) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm tracking-widest uppercase text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-full h-px bg-stone-900 dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              )
            })}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">

            {/* Wishlist */}
            <Link to="/wishlist" className="text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition relative">
              <Heart size={20} className={wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-stone-800 dark:bg-stone-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User desktop */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {canAccessDashboard && (
                  <Link to="/admin" className="text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition">
                    Admin
                  </Link>
                )}
                {user.role === 'creator' && (
                  <Link to="/creator" className="text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition">
                    Mon espace créateur
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition">
                Connexion
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden text-stone-700 dark:text-stone-300"
              onClick={function() { setShowMenu(!showMenu) }}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden mt-4 pb-2 flex flex-col gap-4 border-t border-stone-100 dark:border-stone-800 pt-4">
            {[
              { label: 'Accueil',   to: '/' },
              { label: 'Boutique',  to: '/shop' },
              { label: 'À propos',  to: '/about' },
              { label: 'Contact',   to: '/contact' },
              { label: 'Favoris',   to: '/wishlist' },
              { label: 'FAQ',       to: '/faq' },
            ].map(function(link) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={function() { setShowMenu(false) }}
                  className="text-sm tracking-widests uppercase text-stone-700 dark:text-stone-300 flex items-center gap-2"
                >
                  {link.label}
                  {link.to === '/wishlist' && wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )
            })}
            {user ? (
              <>
                {canAccessDashboard && (
                  <Link to="/admin" onClick={function() { setShowMenu(false) }} className="text-sm tracking-widest uppercase text-stone-500 dark:text-stone-400">
                    Admin
                  </Link>
                )}
                {user.role === 'creator' && (
                  <Link to="/creator" onClick={function() { setShowMenu(false) }} className="text-sm tracking-widest uppercase text-stone-500 dark:text-stone-400">
                    Mon espace créateur
                  </Link>
                )}
                <button onClick={handleLogout} className="text-sm tracking-widest uppercase text-stone-500 dark:text-stone-400 text-left">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm tracking-widest uppercase text-stone-500 dark:text-stone-400">
                Connexion
              </Link>
            )}
          </div>
        )}
      </nav>
    </div>
  )
}