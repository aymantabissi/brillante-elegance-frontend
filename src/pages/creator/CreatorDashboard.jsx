import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Copy, Wallet, ShoppingBag, Clock, Shuffle, Tag } from 'lucide-react'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const orderStatusLabels = {
  not_processed: 'Non traitée',
  not_required:  'Non requise',
  shipping:      'En livraison',
  delivered:     'Livrée',
}

const paymentStatusLabels = {
  pending:   'En attente',
  paid:      'Payée',
  cancelled: 'Annulée',
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <div className="flex items-center gap-2 text-stone-400 mb-3">
        {icon}
        <p className="text-xs tracking-widest uppercase">{label}</p>
      </div>
      <p className="text-2xl font-light text-stone-900">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}

function OrdersTable({ orders, emptyLabel, showCommission }) {
  if (orders.length === 0) {
    return <p className="text-sm text-stone-400 text-center py-8">{emptyLabel}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-xs tracking-widest uppercase text-stone-400">
          <tr>
            <th className="px-4 py-3 text-left">Commande</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Livraison</th>
            <th className="px-4 py-3 text-left">Paiement</th>
            <th className="px-4 py-3 text-left">{showCommission ? 'Commission gagnée' : 'Commission potentielle'}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(function(order) {
            return (
              <tr key={order._id} className="border-t border-stone-50">
                <td className="px-4 py-3 font-mono text-xs text-stone-600">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3 text-stone-500 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-medium text-stone-800">{order.total.toFixed(2)} MAD</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                    {orderStatusLabels[order.orderStatus] || order.orderStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={'text-xs px-2 py-1 rounded-full ' + (order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : order.paymentStatus === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700')}>
                    {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-green-600">{order.commissionAmount.toFixed(2)} MAD</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function CreatorDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const [newCode, setNewCode]     = useState(generateCode())
  const [creating, setCreating]   = useState(false)

  const fetchStats = async function() {
    setLoading(true)
    try {
      const res = await api.get('/creator/stats')
      setStats(res.data)
    } catch (e) {
      toast.error('Erreur lors du chargement de vos statistiques', { style: toastStyle })
    }
    setLoading(false)
  }

  useEffect(function() { fetchStats() }, [])

  const copyCode = function() {
    navigator.clipboard.writeText(stats.promoCode.code)
    toast.success('Code copié !', { style: toastStyle })
  }

  const handleCreateCode = async function() {
    if (!newCode.trim()) return toast.error('Entrez un code')

    setCreating(true)
    try {
      await api.post('/promos/mine', { code: newCode.trim() })
      toast.success('Votre code promo a été créé !', { style: toastStyle })
      fetchStats()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur', { style: toastStyle })
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-stone-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(function(i) { return <div key={i} className="h-28 bg-stone-200 rounded-2xl" /> })}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-light tracking-widest uppercase text-stone-800">Tableau de bord</h1>
        <p className="text-sm text-stone-400 mt-1">Suivez vos ventes et vos gains d'affiliation</p>
      </div>

      {/* Promo code */}
      {stats.promoCode ? (
        <div className="bg-stone-900 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">Votre code promo</p>
            <p className="text-3xl font-mono font-bold text-white tracking-widest">{stats.promoCode.code}</p>
            <p className="text-xs text-stone-400 mt-2">
              -{stats.promoCode.discount}% pour vos clients · {stats.promoCode.usedCount} utilisation{stats.promoCode.usedCount > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 bg-white text-stone-900 text-xs tracking-widest uppercase px-5 py-3 rounded-xl hover:bg-stone-100 transition self-start sm:self-auto"
          >
            <Copy size={14} /> Copier
          </button>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <Tag size={16} className="text-stone-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">Créez votre code promo</p>
              <p className="text-xs text-stone-400 mt-0.5">Vous ne pouvez créer qu'un seul code, avec une remise fixe de 10%</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={newCode}
              onChange={function(e) { setNewCode(e.target.value.toUpperCase()) }}
              onKeyDown={function(e) { if (e.key === 'Enter') handleCreateCode() }}
              placeholder="VOTRECODE10"
              maxLength={20}
              className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono uppercase tracking-widest focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
            />
            <button
              onClick={function() { setNewCode(generateCode()) }}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 transition"
              title="Générer un code aléatoire"
            >
              <Shuffle size={15} />
            </button>
          </div>

          <button
            onClick={handleCreateCode}
            disabled={creating || !newCode.trim()}
            className="w-full mt-3 bg-stone-900 text-white text-xs tracking-widest uppercase py-3.5 rounded-xl hover:bg-stone-700 transition disabled:opacity-50"
          >
            {creating ? 'Création...' : 'Créer mon code — remise de 10%'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Wallet size={15} />}
          label="Solde gagné"
          value={stats.balance.toFixed(2) + ' MAD'}
          sub="Crédité une fois la commande livrée et payée"
        />
        <StatCard
          icon={<Clock size={15} />}
          label="En attente"
          value={stats.pendingCommission.toFixed(2) + ' MAD'}
          sub={stats.pendingOrders.length + ' commande' + (stats.pendingOrders.length > 1 ? 's' : '') + ' en cours'}
        />
        <StatCard
          icon={<ShoppingBag size={15} />}
          label="Total commandes"
          value={stats.totalOrders}
          sub="Vendues avec votre code"
        />
      </div>

      {/* Pending orders */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-medium tracking-widest uppercase text-stone-700">Commandes en attente</h2>
          <p className="text-xs text-stone-400 mt-0.5">Commission créditée une fois livrées et payées</p>
        </div>
        <OrdersTable orders={stats.pendingOrders} emptyLabel="Aucune commande en attente" showCommission={false} />
      </div>

      {/* Credited orders */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-medium tracking-widest uppercase text-stone-700">Commandes créditées</h2>
        </div>
        <OrdersTable orders={stats.creditedOrders} emptyLabel="Aucune commande créditée pour le moment" showCommission />
      </div>

    </div>
  )
}
