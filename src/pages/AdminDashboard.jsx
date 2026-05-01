import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Package, ShoppingBag,
  LogOut, Plus, Trash2, Edit2, X, Check,
  ExternalLink
} from 'lucide-react'

const emptyProduct = {
  name: '', price: '', oldPrice: '', category: 'colliers',
  description: '', image: '', stock: '', hot: false, discount: '',
}

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [tab,      setTab]      = useState('Dashboard')
  const [stats,    setStats]    = useState(null)
  const [products, setProducts] = useState([])
  const [orders,   setOrders]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(emptyProduct)
  const [editId,   setEditId]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  if (!user || user.role !== 'admin') return <Navigate to="/" />

  useEffect(() => {
    fetchStats()
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/orders/stats')
      setStats(data)
    } catch {}
  }

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products')
      setProducts(data)
    } catch {}
  }

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders')
      setOrders(data)
    } catch {}
  }

  const handleSaveProduct = async () => {
    if (!form.name || !form.price) return toast.error('Nom et prix requis')
    setLoading(true)
    try {
      if (editId) {
        await api.put('/products/' + editId, form)
        toast.success('Produit modifie !')
      } else {
        await api.post('/products', form)
        toast.success('Produit ajoute !')
      }
      setShowForm(false)
      setForm(emptyProduct)
      setEditId(null)
      fetchProducts()
      fetchStats()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur')
    }
    setLoading(false)
  }

  const handleEdit = (p) => {
    setForm({ ...p })
    setEditId(p._id)
    setShowForm(true)
    setTab('Produits')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return
    try {
      await api.delete('/products/' + id)
      toast.success('Produit supprime')
      fetchProducts()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleOrderStatus = async (id, status) => {
    try {
      await api.put('/orders/' + id, { status })
      toast.success('Statut mis a jour')
      fetchOrders()
      fetchStats()
    } catch {
      toast.error('Erreur')
    }
  }

  const statusColors = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped:   'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-stone-900 text-white flex flex-col min-h-screen flex-shrink-0 sticky top-0 h-screen overflow-y-auto">

        {/* Logo */}
        <div className="px-6 py-8 border-b border-stone-700">
          <h1 className="text-lg font-light tracking-[0.2em] uppercase">Brillante</h1>
          <p className="text-[10px] tracking-widest text-stone-400 uppercase">Admin Panel</p>
        </div>

        {/* Admin Nav */}
        <nav className="py-6 flex flex-col gap-1 px-3">
          {[
            { name: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
            { name: 'Produits',   icon: <Package size={16} /> },
            { name: 'Commandes',  icon: <ShoppingBag size={16} /> },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setTab(item.name)}
              className={'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ' + (tab === item.name ? 'bg-white text-stone-900 font-medium' : 'text-stone-400 hover:bg-stone-800 hover:text-white')}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        {/* Site Links */}
        <div className="px-3 py-4 border-t border-stone-700">
          <p className="text-[10px] tracking-widest uppercase text-stone-500 px-4 mb-2">
            Voir le site
          </p>
          {[
            { label: 'Home',    to: '/' },
            { label: 'Shop',    to: '/shop' },
            { label: 'About',   to: '/about' },
            { label: 'Contact', to: '/contact' },
          ].map((link) => (
            <a
              key={link.to}
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-xs text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
            >
              <ExternalLink size={12} /> {link.label}
            </a>
          ))}
        </div>

        {/* User + Logout */}
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

      {/* ── Main Content ── */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ════ DASHBOARD TAB ════ */}
        {tab === 'Dashboard' && (
          <div>
            <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-8">Dashboard</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {[
                { label: 'Total Commandes', value: stats?.totalOrders ?? '...', icon: '📦', color: 'bg-blue-50 border-blue-100' },
                { label: 'Revenue Total',   value: stats ? stats.totalRevenue.toFixed(0) + ' MAD' : '...', icon: '💰', color: 'bg-green-50 border-green-100' },
                { label: 'En attente',      value: stats?.pending ?? '...',   icon: '⏳', color: 'bg-amber-50 border-amber-100' },
                { label: 'Livrees',         value: stats?.delivered ?? '...', icon: '✅', color: 'bg-stone-50 border-stone-100' },
              ].map((s) => (
                <div key={s.label} className={'rounded-2xl border p-6 ' + s.color}>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <p className="text-2xl font-light text-stone-900 mb-1">{s.value}</p>
                  <p className="text-xs tracking-widest uppercase text-stone-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700">Commandes recentes</h3>
                <button onClick={() => setTab('Commandes')} className="text-xs text-stone-400 hover:text-stone-700">Voir tout →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-xs tracking-widest uppercase text-stone-400">
                    <tr>
                      <th className="px-6 py-3 text-left">Client</th>
                      <th className="px-6 py-3 text-left">Total</th>
                      <th className="px-6 py-3 text-left">Statut</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="border-t border-stone-50 hover:bg-stone-50 transition">
                        <td className="px-6 py-4 font-medium text-stone-800">{order.client?.name}</td>
                        <td className="px-6 py-4 text-stone-600">{order.total} MAD</td>
                        <td className="px-6 py-4">
                          <span className={'text-[11px] font-medium px-2.5 py-1 rounded-full ' + statusColors[order.status]}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-stone-400 text-sm">Aucune commande</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════ PRODUITS TAB ════ */}
        {tab === 'Produits' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800">Produits</h2>
              <button
                onClick={() => { setForm(emptyProduct); setEditId(null); setShowForm(true) }}
                className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-3 rounded-full hover:bg-stone-700 transition"
              >
                <Plus size={15} /> Ajouter
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700">
                    {editId ? 'Modifier produit' : 'Nouveau produit'}
                  </h3>
                  <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyProduct) }}>
                    <X size={18} className="text-stone-400 hover:text-stone-700" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-stone-400 block mb-1">Nom *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                      placeholder="Nom du produit" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Prix (MAD) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                      placeholder="299" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Ancien prix (MAD)</label>
                    <input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                      placeholder="370" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Categorie</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]">
                      {['colliers','bracelets','bagues','lunettes','montres','autres'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Stock</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                      placeholder="10" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Discount (%)</label>
                    <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                      placeholder="19" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-stone-400 block mb-1">Image URL</label>
                    <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                      placeholder="https://..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-stone-400 block mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] resize-none"
                      placeholder="Description du produit..." />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hot" checked={form.hot} onChange={(e) => setForm({ ...form, hot: e.target.checked })}
                      className="accent-stone-900" />
                    <label htmlFor="hot" className="text-sm text-stone-600">Marquer comme HOT 🔥</label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => { setShowForm(false); setForm(emptyProduct); setEditId(null) }}
                    className="text-sm text-stone-400 hover:text-stone-700 transition px-5 py-2.5">
                    Annuler
                  </button>
                  <button onClick={handleSaveProduct} disabled={loading}
                    className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-stone-700 transition disabled:opacity-50">
                    <Check size={14} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-xs tracking-widest uppercase text-stone-400">
                    <tr>
                      <th className="px-6 py-3 text-left">Produit</th>
                      <th className="px-6 py-3 text-left">Categorie</th>
                      <th className="px-6 py-3 text-left">Prix</th>
                      <th className="px-6 py-3 text-left">Stock</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} className="border-t border-stone-50 hover:bg-stone-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                            <div>
                              <p className="font-medium text-stone-800 text-xs">{p.name}</p>
                              {p.hot && <span className="text-[10px] text-amber-500">HOT 🔥</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-500 capitalize">{p.category}</td>
                        <td className="px-6 py-4 font-medium text-stone-800">{p.price} MAD</td>
                        <td className="px-6 py-4">
                          <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                            {p.stock > 0 ? p.stock + ' en stock' : 'Rupture'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-stone-400">Aucun produit</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════ COMMANDES TAB ════ */}
        {tab === 'Commandes' && (
          <div>
            <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-8">Commandes</h2>
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-stone-100 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-medium text-stone-800">{order.client?.name}</p>
                      <p className="text-xs text-stone-400">{order.client?.phone} · {order.client?.city} · {order.client?.address}</p>
                      <p className="text-xs text-stone-300 mt-1">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-stone-800">{order.total} MAD</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatus(order._id, e.target.value)}
                        className={'text-xs font-medium px-3 py-1.5 rounded-full border-0 focus:outline-none cursor-pointer ' + statusColors[order.status]}
                      >
                        {['pending','confirmed','shipped','delivered','cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2">
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg" />
                        <div>
                          <p className="text-xs font-medium text-stone-700">{item.name}</p>
                          <p className="text-[10px] text-stone-400">x{item.qty} · {item.price} MAD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.note && (
                    <p className="mt-3 text-xs text-stone-400 italic">Note: {order.note}</p>
                  )}
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-20 text-stone-400">Aucune commande pour le moment</div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}