import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts  from './pages/admin/AdminProducts'
import AdminOrders    from './pages/admin/AdminOrders'
import AdminStats from './pages/admin/AdminStats'


function App() {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/shop"     element={<ShopPage />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/contact"  element={<ContactPage />} />
          <Route path="/cart"     element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login"    element={!user ? <LoginPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />)} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index           element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders"   element={<AdminOrders />} />
            <Route path="stats" element={<AdminStats />} />

          </Route>

        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default App