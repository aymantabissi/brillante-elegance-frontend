import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminUsers from './pages/admin/AdminUsers'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WishlistPage from './pages/WishlistPage'
import FAQPage from './pages/FAQPage'
import ProductPage from './pages/Productpage'
import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts  from './pages/admin/AdminProducts'
import AdminOrders    from './pages/admin/AdminOrders'
import AdminStats     from './pages/admin/AdminStats'
import AdminPromos    from './pages/admin/AdminPromos'
import AdminProfile   from './pages/admin/AdminProfile'
import AdminChat      from './pages/admin/AdminChat'
import CreatorLayout    from './pages/creator/CreatorLayout'
import CreatorDashboard from './pages/creator/CreatorDashboard'
import CreatorChat      from './pages/creator/CreatorChat'
import CreatorPayment   from './pages/creator/CreatorPayment'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

function App() {
  const { user }     = useSelector((state) => state.auth)
  const { items: products } = useSelector((state) => state.products)
  const location     = useLocation()
  const isAdmin      = location.pathname.startsWith('/admin')
  const isCreatorArea = location.pathname.startsWith('/creator')
  const hideChrome   = isAdmin || isCreatorArea

  const [wishlist, setWishlist] = useState([])

  // =====================================================
  // META PIXEL — PageView à chaque changement de route
  // (le PageView initial est déjà envoyé par index.html —
  // on saute le tout premier mount pour ne pas le doubler,
  // et on couvre seulement la navigation interne du SPA)
  // =====================================================
  const isFirstPageView = useRef(true)

  useEffect(function() {
    if (isFirstPageView.current) {
      isFirstPageView.current = false
      return
    }
    if (window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [location.pathname])

  // =====================================================
  // SCROLL TO TOP — a chaque changement de page
  // (React Router garde la position de scroll precedente
  // par defaut, ce qui fait atterrir sur le footer)
  // =====================================================
  useEffect(function() {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const toggleWishlist = function(productId) {
    setWishlist(function(prev) {
      if (prev.includes(productId)) {
        toast('Retiré des favoris', { icon: '💔', style: toastStyle })
        return prev.filter(function(id) { return id !== productId })
      } else {
        toast.success('Ajouté aux favoris !', { icon: '❤️', style: toastStyle })
        return [...prev, productId]
      }
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && <Navbar wishlistCount={wishlist.length} />}

      {/* Padding top pour compenser la navbar fixe */}
      <main className={'flex-1 ' + (!hideChrome ? 'pt-[72px]' : '')}>
        <Routes>
          <Route path="/"            element={<HomePage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/shop"        element={<ShopPage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/wishlist"    element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} products={products} />} />
          <Route path="/about"       element={<AboutPage />} />
          <Route path="/contact"     element={<ContactPage />} />
          <Route path="/faq"         element={<FAQPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart"        element={<CartPage />} />
          <Route path="/checkout"    element={<CheckoutPage />} />
          <Route path="/login"       element={!user ? <LoginPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : user.role === 'creator' ? <Navigate to="/creator" /> : <Navigate to="/" />)} />
          <Route path="/register"    element={!user ? <RegisterPage /> : <Navigate to="/" />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index           element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders"   element={<AdminOrders />} />
            <Route path="stats"    element={<AdminStats />} />
            <Route path="promos"   element={<AdminPromos />} />
            <Route path="profile"  element={<AdminProfile />} />
            <Route path="chat"     element={<AdminChat />} />
            <Route
  path="/admin/users"
  element={
    <AdminUsers />
  }
/>
          </Route>

          <Route path="/creator" element={<CreatorLayout />}>
            <Route index      element={<CreatorDashboard />} />
            <Route path="chat" element={<CreatorChat />} />
            <Route path="payment" element={<CreatorPayment />} />
          </Route>
        </Routes>
      </main>

      {!hideChrome && <Footer />}
    </div>
  )
}

export default App