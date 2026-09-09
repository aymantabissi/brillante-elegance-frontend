import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { X, Wallet, Clock, ShoppingBag, TrendingUp, Tag } from 'lucide-react'

const toastStyle = {
  background: '#1c1917', color: '#fff',
  fontSize: '13px', borderRadius: '12px', padding: '12px 16px',
}

const orderStatusLabels = {
  not_processed: 'Non traitée',
  not_required:  'Non requise',
  no_response:   'Pas de réponse',
  shipping:      'En livraison',
  delivered:     'Livrée',
}

const paymentStatusLabels = {
  pending:   'En attente',
  paid:      'Payée',
  cancelled: 'Annulée',
  return_in_progress: 'Retour en cours',
  returned:  'Produit retourné',
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5">
      <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 mb-3">
        {icon}
        <p className="text-xs tracking-widest uppercase">{label}</p>
      </div>
      <p className="text-2xl font-light text-stone-900 dark:text-stone-100">{value}</p>
      {sub && <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{sub}</p>}
    </div>
  )
}

function OrdersTable({ orders, emptyLabel, showCommission }) {
  if (orders.length === 0) {
    return <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-8">{emptyLabel}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 dark:bg-stone-800 text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
          <tr>
            <th className="px-4 py-3 text-left">Commande</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Traitement</th>
            <th className="px-4 py-3 text-left">Paiement</th>
            <th className="px-4 py-3 text-left">{showCommission ? 'Commission gagnée' : 'Commission potentielle'}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(function(order) {
            return (
              <tr key={order._id} className="border-t border-stone-50 dark:border-stone-800">
                <td className="px-4 py-3 font-mono text-xs text-stone-600 dark:text-stone-400">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-400 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">{order.total.toFixed(2)} MAD</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                    {orderStatusLabels[order.orderStatus] || order.orderStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={'text-xs px-2 py-1 rounded-full ' + (order.paymentStatus === 'paid' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : order.paymentStatus === 'cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400')}>
                    {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-green-600 dark:text-green-400">{order.commissionAmount.toFixed(2)} MAD</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CreatorDetailModal({ creatorId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    api.get('/creator/admin/' + creatorId)
      .then(function(res) { setDetail(res.data) })
      .catch(function() { toast.error('Erreur de chargement', { style: toastStyle }) })
      .finally(function() { setLoading(false) })
  }, [creatorId])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#f9f8f6] dark:bg-stone-950 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={function(e) { e.stopPropagation() }}
      >
        <div className="sticky top-0 bg-[#f9f8f6] dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100">
              {detail ? detail.creator.name : 'Chargement...'}
            </h2>
            {detail && <p className="text-xs text-stone-400 dark:text-stone-500">{detail.creator.email}</p>}
          </div>
          <button onClick={onClose} className="text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {loading || !detail ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(function(i) { return <div key={i} className="h-24 bg-stone-200 dark:bg-stone-800 rounded-2xl" /> })}
              </div>
            </div>
          ) : (
            <>
              {detail.promoCode && (
                <div className="bg-stone-900 dark:bg-black rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Code promo</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-widest">{detail.promoCode.code}</p>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300 text-xs">
                    <Tag size={13} /> -{detail.promoCode.discount}% · {detail.promoCode.usedCount} utilisation{detail.promoCode.usedCount > 1 ? 's' : ''}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<Wallet size={15} />} label="Solde crédité" value={detail.balance.toFixed(2) + ' MAD'} />
                <StatCard icon={<Clock size={15} />} label="En attente" value={detail.pendingCommission.toFixed(2) + ' MAD'} sub={detail.pendingOrders.length + ' commande' + (detail.pendingOrders.length > 1 ? 's' : '')} />
                <StatCard icon={<ShoppingBag size={15} />} label="Total commandes" value={detail.totalOrders} />
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700 dark:text-stone-300">Commandes en attente</h3>
                </div>
                <OrdersTable orders={detail.pendingOrders} emptyLabel="Aucune commande en attente" showCommission={false} />
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700 dark:text-stone-300">Commandes créditées</h3>
                </div>
                <OrdersTable orders={detail.creditedOrders} emptyLabel="Aucune commande créditée" showCommission />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminCreatorTracking() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const fetchOverview = function() {
    setLoading(true)
    api.get('/creator/admin/overview')
      .then(function(res) { setCreators(res.data) })
      .catch(function() { toast.error('Erreur de chargement', { style: toastStyle }) })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { fetchOverview() }, [])

  const totals = creators.reduce(function(acc, c) {
    acc.totalSales += c.totalSales
    acc.pendingCommission += c.pendingCommission
    acc.balance += c.balance
    return acc
  }, { totalSales: 0, pendingCommission: 0, balance: 0 })

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(function(i) { return <div key={i} className="h-24 bg-stone-100 dark:bg-stone-800 rounded-2xl" /> })}
        </div>
        <div className="h-64 bg-stone-100 dark:bg-stone-800 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100">Suivi Créateurs</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">Ventes et commissions par créateur affilié</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<TrendingUp size={15} />} label="Total vendu" value={totals.totalSales.toFixed(2) + ' MAD'} sub="Toutes commandes créateurs" />
        <StatCard icon={<Clock size={15} />} label="Commission en attente" value={totals.pendingCommission.toFixed(2) + ' MAD'} />
        <StatCard icon={<Wallet size={15} />} label="Commission créditée" value={totals.balance.toFixed(2) + ' MAD'} />
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
        {creators.length === 0 ? (
          <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-16">Aucun créateur pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 dark:bg-stone-800 text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
                <tr>
                  <th className="px-5 py-3.5 text-left">Créateur</th>
                  <th className="px-5 py-3.5 text-left">Statut</th>
                  <th className="px-5 py-3.5 text-left">Code promo</th>
                  <th className="px-5 py-3.5 text-left">Commandes</th>
                  <th className="px-5 py-3.5 text-left">Total vendu</th>
                  <th className="px-5 py-3.5 text-left">En attente</th>
                  <th className="px-5 py-3.5 text-left">Crédité</th>
                  <th className="px-5 py-3.5 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {creators.map(function(c) {
                  return (
                    <tr key={c._id} className="border-t border-stone-50 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-stone-800 dark:text-stone-200">{c.name}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">{c.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={'text-[11px] px-2.5 py-1 rounded-full font-medium ' + (c.isActive === false ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400')}>
                          {c.isActive === false ? 'En attente' : 'Actif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-stone-600 dark:text-stone-400">
                        {c.promoCode ? c.promoCode.code + ' (' + c.promoCode.usedCount + 'x)' : '—'}
                      </td>
                      <td className="px-5 py-4 text-stone-600 dark:text-stone-400">{c.totalOrders}</td>
                      <td className="px-5 py-4 font-medium text-stone-800 dark:text-stone-200">{c.totalSales.toFixed(2)} MAD</td>
                      <td className="px-5 py-4 text-amber-600 dark:text-amber-400">{c.pendingCommission.toFixed(2)} MAD</td>
                      <td className="px-5 py-4 text-green-600 dark:text-green-400">{c.balance.toFixed(2)} MAD</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={function() { setSelectedId(c._id) }}
                          className="text-xs text-stone-500 dark:text-stone-400 underline hover:text-stone-800 dark:hover:text-stone-200 transition"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId && <CreatorDetailModal creatorId={selectedId} onClose={function() { setSelectedId(null) }} />}
    </div>
  )
}
