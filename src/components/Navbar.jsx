import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { ShoppingBag, Search, X, Menu, Heart } from 'lucide-react'

export default function Navbar({ wishlistCount = 0 }) {
  const [showBanner, setShowBanner] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)
  const cartCount = items.reduce((acc, i) => acc + i.qty, 0)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      {/* Top Banner */}
      {showBanner && (
        <div className="bg-black text-white text-sm py-3 px-6 flex items-center justify-center relative">
          <p className="tracking-wide text-center">
            SUMMER SALE, Get 15% Off for all products. (Only 50 promos left){' '}
            <span className="text-stone-300">'foryou50'</span>
          </p>
          <button className="absolute right-4 bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1.5 rounded-full transition hidden sm:block">
            Get Promo
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 sm:right-36 text-white hover:text-stone-300 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-2xl font-bold tracking-[0.15em] text-stone-900 uppercase">
              Brillante
            </span>
            <span className="text-[9px] tracking-[0.4em] text-stone-400 uppercase">
              Elegance
            </span>
          </Link>

          {/* Nav Links desktop */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home',       to: '/' },
              { label: 'Shop',       to: '/shop' },
              { label: 'About Us',   to: '/about' },
              { label: 'Contact Us', to: '/contact' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm tracking-widest uppercase text-stone-700 hover:text-stone-900 transition relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-full h-px bg-stone-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="text-stone-700 hover:text-stone-900 transition">
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="text-stone-700 hover:text-stone-900 transition relative">
              <Heart size={20} className={wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="text-stone-700 hover:text-stone-900 transition relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-800 transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-xs tracking-widests uppercase text-stone-500 hover:text-stone-800 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block text-xs tracking-widest uppercase text-stone-500 hover:text-stone-800 transition"
              >
                Login
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden text-stone-700"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden mt-4 pb-2 flex flex-col gap-4 border-t border-stone-100 pt-4">
            {[
              { label: 'Home',       to: '/' },
              { label: 'Shop',       to: '/shop' },
              { label: 'About Us',   to: '/about' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'Wishlist',   to: '/wishlist' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setShowMenu(false)}
                className="text-sm tracking-widest uppercase text-stone-700"
              >
                {link.label}
                {link.to === '/wishlist' && wishlistCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm tracking-widest uppercase text-stone-500 text-left"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="text-sm tracking-widest uppercase text-stone-500">
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  )
}