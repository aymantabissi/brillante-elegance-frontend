import { useEffect, useState } from 'react'
import api from '../../services/api'
import { Crown, Users, Repeat, Package, Sun, Moon, Sunset, Sunrise } from 'lucide-react'

const CATEGORY_LABELS = {
  colliers: 'Colliers',
  bracelets: 'Bracelets',
  bagues: 'Bagues',
  lunettes: 'Lunettes',
  montres: 'Montres',
  Sacas: 'Sacs',
  autres: 'Autres',
}

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const SLOT_DEFS = [
  { key: 'morning',   label: 'Matin (6h-12h)',    icon: Sunrise, range: [6, 12] },
  { key: 'afternoon', label: 'Après-midi (12h-18h)', icon: Sun,   range: [12, 18] },
  { key: 'evening',   label: 'Soirée (18h-23h)',  icon: Sunset,  range: [18, 23] },
  { key: 'night',     label: 'Nuit (23h-6h)',     icon: Moon,    range: [23, 30] },
]

const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('212')) return digits
  if (digits.startsWith('0')) return '212' + digits.slice(1)
  return digits
}

function Bar({ label, value, max, suffix, color }) {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 6
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs text-stone-500 dark:text-stone-400 w-32 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-full h-6 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center px-2 transition-all"
          style={{ width: pct + '%', background: color || '#534AB7' }}
        >
          <span className="text-[10px] text-white font-medium whitespace-nowrap">{value}{suffix || ''}</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminAudience() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
      ])
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : [])
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
    } catch (error) {
      console.error('Erreur chargement audience:', error)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-sm text-stone-500 dark:text-stone-400">Analyse de l'audience...</p>
      </div>
    )
  }

  const validOrders = orders.filter((o) => o.paymentStatus !== 'cancelled')

  // -----------------------------------------------------
  // CLIENTS (regroupés par numéro de téléphone normalisé)
  // -----------------------------------------------------
  const clientsMap = {}
  validOrders.forEach((order) => {
    const phone = normalizePhone(order.client?.phone)
    if (!phone) return
    if (!clientsMap[phone]) {
      clientsMap[phone] = {
        phone,
        name: order.client?.name || 'Client',
        city: order.client?.city || '',
        orderCount: 0,
        totalSpent: 0,
        lastOrder: order.createdAt,
      }
    }
    const c = clientsMap[phone]
    c.orderCount += 1
    c.totalSpent += Number(order.total || 0)
    if (new Date(order.createdAt) > new Date(c.lastOrder)) c.lastOrder = order.createdAt
  })

  const clients = Object.values(clientsMap)
  const topClients = [...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 15)
  const returningClients = clients.filter((c) => c.orderCount > 1)
  const returningRate = clients.length > 0 ? Math.round((returningClients.length / clients.length) * 100) : 0
  const avgSpentPerClient = clients.length > 0
    ? clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length
    : 0

  // -----------------------------------------------------
  // CATEGORIES PREFEREES
  // -----------------------------------------------------
  const productCategoryById = {}
  products.forEach((p) => { productCategoryById[p._id] = p.category })

  const categoryMap = {}
  validOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const category = productCategoryById[item.productId] || 'autres'
      if (!categoryMap[category]) categoryMap[category] = { category, qty: 0, revenue: 0 }
      categoryMap[category].qty += Number(item.qty || 0)
      categoryMap[category].revenue += Number(item.price || 0) * Number(item.qty || 0)
    })
  })
  const categories = Object.values(categoryMap).sort((a, b) => b.qty - a.qty)
  const maxCategoryQty = categories.length > 0 ? Math.max(...categories.map((c) => c.qty)) : 1

  // -----------------------------------------------------
  // JOUR DE LA SEMAINE
  // -----------------------------------------------------
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]
  validOrders.forEach((order) => {
    if (!order.createdAt) return
    dayCounts[new Date(order.createdAt).getDay()] += 1
  })
  const maxDayCount = Math.max(...dayCounts, 1)

  // -----------------------------------------------------
  // MOMENT DE LA JOURNEE
  // -----------------------------------------------------
  const slotCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  validOrders.forEach((order) => {
    if (!order.createdAt) return
    const hour = new Date(order.createdAt).getHours()
    if (hour >= 6 && hour < 12) slotCounts.morning += 1
    else if (hour >= 12 && hour < 18) slotCounts.afternoon += 1
    else if (hour >= 18 && hour < 23) slotCounts.evening += 1
    else slotCounts.night += 1
  })
  const bestSlot = SLOT_DEFS.reduce((best, s) => (slotCounts[s.key] > slotCounts[best.key] ? s : best), SLOT_DEFS[0])
  const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts))

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100">Audience</h2>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Qui achète, quoi, et quand — basé sur vos commandes réelles
        </p>
      </div>

      {validOrders.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-24 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-light text-stone-700 dark:text-stone-300">Aucune donnée</h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">L'analyse apparaîtra dès que vous aurez des commandes.</p>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 mb-2">
                <Users size={14} /><p className="text-xs">Clients uniques</p>
              </div>
              <p className="text-2xl font-light text-stone-900 dark:text-stone-100">{clients.length}</p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 mb-2">
                <Repeat size={14} /><p className="text-xs">Clients récurrents</p>
              </div>
              <p className="text-2xl font-light text-stone-900 dark:text-stone-100">{returningRate}%</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{returningClients.length} ont commandé 2 fois ou +</p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 mb-2">
                <Crown size={14} /><p className="text-xs">Dépense moyenne / client</p>
              </div>
              <p className="text-2xl font-light text-stone-900 dark:text-stone-100">{Math.round(avgSpentPerClient).toLocaleString()} DH</p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 mb-2">
                <Package size={14} /><p className="text-xs">Catégorie la + vendue</p>
              </div>
              <p className="text-2xl font-light text-stone-900 dark:text-stone-100">{categories[0] ? (CATEGORY_LABELS[categories[0].category] || categories[0].category) : '—'}</p>
            </div>
          </div>

          {/* RECOMMANDATION */}
          <div className="bg-stone-900 dark:bg-black rounded-2xl p-6 mb-8 text-white">
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Ciblage recommandé</p>
            <p className="text-sm leading-relaxed text-stone-200">
              Vos clients achètent surtout des <strong>{categories[0] ? (CATEGORY_LABELS[categories[0].category] || categories[0].category).toLowerCase() : '—'}</strong>.
              {' '}Le meilleur moment pour publier vos publicités est <strong>{DAY_LABELS[bestDayIndex] === 'Dim' ? 'dimanche' : DAY_LABELS[bestDayIndex] === 'Lun' ? 'lundi' : DAY_LABELS[bestDayIndex] === 'Mar' ? 'mardi' : DAY_LABELS[bestDayIndex] === 'Mer' ? 'mercredi' : DAY_LABELS[bestDayIndex] === 'Jeu' ? 'jeudi' : DAY_LABELS[bestDayIndex] === 'Ven' ? 'vendredi' : 'samedi'}</strong>,
              {' '}en <strong>{bestSlot.label.split(' (')[0].toLowerCase()}</strong> — c'est quand vos clients commandent le plus.
              {returningRate < 20 && ' La majorité de vos clients n\'achètent qu\'une seule fois : une campagne de relance (SMS/WhatsApp) pourrait augmenter les commandes répétées.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* CATEGORIES */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-5">Catégories préférées (unités vendues)</p>
              {categories.map((c) => (
                <Bar key={c.category} label={CATEGORY_LABELS[c.category] || c.category} value={c.qty} max={maxCategoryQty} color="#1D9E75" />
              ))}
            </div>

            {/* JOUR */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-5">Commandes par jour de la semaine</p>
              {DAY_LABELS.map((label, i) => (
                <Bar key={label} label={label} value={dayCounts[i]} max={maxDayCount} color="#378ADD" />
              ))}
            </div>
          </div>

          {/* MOMENT DE LA JOURNEE */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 mb-6">
            <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-5">Moment de la journée</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SLOT_DEFS.map((slot) => {
                const Icon = slot.icon
                const isBest = slot.key === bestSlot.key
                return (
                  <div key={slot.key} className={'rounded-xl p-4 text-center ' + (isBest ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300')}>
                    <Icon size={18} className="mx-auto mb-2" />
                    <p className="text-lg font-light">{slotCounts[slot.key]}</p>
                    <p className={'text-[10px] mt-1 ' + (isBest ? 'text-stone-300 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500')}>{slot.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* TOP CLIENTS */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <Crown size={14} className="text-amber-500" />
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400">Meilleurs clients</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 dark:bg-stone-800/50 text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
                  <tr>
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-5 py-3 text-left">Client</th>
                    <th className="px-5 py-3 text-left">Ville</th>
                    <th className="px-5 py-3 text-left">Commandes</th>
                    <th className="px-5 py-3 text-left">Total dépensé</th>
                    <th className="px-5 py-3 text-left">Dernière commande</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((c, i) => (
                    <tr key={c.phone} className="border-t border-stone-50 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition">
                      <td className="px-5 py-3 text-stone-400 dark:text-stone-500">{i + 1}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-stone-800 dark:text-stone-200">{c.name}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">{c.phone}</p>
                      </td>
                      <td className="px-5 py-3 text-stone-600 dark:text-stone-400 capitalize">{c.city || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={'text-[11px] px-2.5 py-1 rounded-full font-medium ' + (c.orderCount > 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400')}>
                          {c.orderCount}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-stone-800 dark:text-stone-200">{Math.round(c.totalSpent).toLocaleString()} DH</td>
                      <td className="px-5 py-3 text-xs text-stone-400 dark:text-stone-500">
                        {new Date(c.lastOrder).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
