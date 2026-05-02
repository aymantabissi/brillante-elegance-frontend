import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WishlistPage from './pages/WishlistPage'
import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts  from './pages/admin/AdminProducts'
import AdminOrders    from './pages/admin/AdminOrders'
import AdminStats     from './pages/admin/AdminStats'
import AdminPromos from './pages/admin/AdminPromos'
import ProductPage from './pages/Productpage'


const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

function App() {
  const { user } = useSelector((state) => state.auth)
  const { items: products } = useSelector((state) => state.products)
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const [wishlist, setWishlist] = useState([])

  const toggleWishlist = function(productId) {
    setWishlist(function(prev) {
      if (prev.includes(productId)) {
        toast('Retire des favoris', { icon: '💔', style: toastStyle })
        return prev.filter(function(id) { return id !== productId })
      } else {
        toast.success('Ajoute aux favoris !', { icon: '❤️', style: toastStyle })
        return [...prev, productId]
      }
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <Navbar wishlistCount={wishlist.length} />}
      <main className="flex-1">
        <Routes>
<Route path="/" element={<HomePage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />          <Route path="/shop"     element={<ShopPage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} products={products} />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/contact"  element={<ContactPage />} />
          <Route path="/product/:id" element={<ProductPage />} />

          <Route path="/cart"     element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login"    element={!user ? <LoginPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />)} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index           element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders"   element={<AdminOrders />} />
            <Route path="stats"    element={<AdminStats />} />
            <Route path="promos" element={<AdminPromos />} />

          </Route>
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default App