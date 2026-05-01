import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders')
      setOrders(data)
    } catch {}
  }

  const handleStatus = async (id, status) => {
    try {
      await api.put('/orders/' + id, { status })
      toast.success('Statut mis a jour')
      fetchOrders()
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
    <div>
      <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-8">Commandes</h2>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl border border-stone-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-medium text-stone-800">{order.client?.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {order.client?.phone} · {order.client?.city} · {order.client?.address}
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  {new Date(order.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-stone-800">{order.total} MAD</span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatus(order._id, e.target.value)}
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
  )
}