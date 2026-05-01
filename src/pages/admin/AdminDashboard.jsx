import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function AdminDashboard() {
  const [stats,  setStats]  = useState(null)
  const [orders, setOrders] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/orders/stats').then(({ data }) => setStats(data)).catch(() => {})
    api.get('/orders').then(({ data }) => setOrders(data)).catch(() => {})
  }, [])

  const statusColors = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped:   'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-8">Dashboard</h2>

      {/* Stats */}
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

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700">Commandes recentes</h3>
          <button onClick={() => navigate('/admin/orders')} className="text-xs text-stone-400 hover:text-stone-700">
            Voir tout →
          </button>
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
  )
}