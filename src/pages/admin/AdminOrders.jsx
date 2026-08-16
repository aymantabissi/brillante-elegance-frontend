
import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { onImgError } from '../../utils/imageFallback'
import {
  Package,
  RefreshCw,
  Send,
  Truck,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState(null)
  const [trackingId, setTrackingId] = useState(null)

  // =====================================================
  // GET ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/orders')

      setOrders(data || [])
    } catch (error) {
      console.error('Fetch orders error:', error)

      toast.error(
        error.response?.data?.message ||
        'Erreur lors du chargement des commandes'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // =====================================================
  // SEND ORDER TO COLISSPEED
  // =====================================================

  const sendToColisSpeed = async (id) => {
    try {
      setSendingId(id)

      const { data } = await api.post(
        `/orders/${id}/colisspeed`
      )

      toast.success(
        data.tracking
          ? `Commande envoyée ! Tracking: ${data.tracking}`
          : 'Commande envoyée à ColisSpeed'
      )

      await fetchOrders()
    } catch (error) {
      console.error(
        'ColisSpeed error:',
        error.response?.data || error
      )

      toast.error(
        error.response?.data?.message ||
        'Erreur lors de l’envoi à ColisSpeed'
      )
    } finally {
      setSendingId(null)
    }
  }

  // =====================================================
  // TRACK COLISSPEED
  // =====================================================

  const trackColisSpeed = async (id) => {
    try {
      setTrackingId(id)

      const { data } = await api.get(
        `/orders/${id}/colisspeed/track`
      )

      toast.success('Suivi ColisSpeed actualisé')

      await fetchOrders()

      console.log('ColisSpeed tracking:', data)
    } catch (error) {
      console.error(
        'Tracking error:',
        error.response?.data || error
      )

      toast.error(
        error.response?.data?.message ||
        'Impossible de récupérer le suivi'
      )
    } finally {
      setTrackingId(null)
    }
  }

  // =====================================================
  // UPDATE PAYMENT
  // =====================================================

  const updatePayment = async (id, paymentStatus) => {
    try {
      await api.patch(
        `/orders/${id}/payment`,
        { paymentStatus }
      )

      toast.success('Statut paiement mis à jour')

      await fetchOrders()
    } catch (error) {
      console.error('Payment error:', error)

      toast.error(
        error.response?.data?.message ||
        'Erreur lors de la modification du paiement'
      )
    }
  }

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const updateOrderStatus = async (id, orderStatus) => {
    try {
      await api.patch(
        `/orders/${id}/status`,
        { orderStatus }
      )

      toast.success('Statut commande mis à jour')

      await fetchOrders()
    } catch (error) {
      console.error('Order status error:', error)

      toast.error(
        error.response?.data?.message ||
        'Erreur lors de la modification du statut'
      )
    }
  }

  // =====================================================
  // UPDATE DELIVERY METHOD
  // =====================================================

  const updateDeliveryMethod = async (
    id,
    deliveryMethod
  ) => {
    try {
      await api.patch(
        `/orders/${id}/delivery`,
        { deliveryMethod }
      )

      toast.success('Mode de livraison mis à jour')

      await fetchOrders()
    } catch (error) {
      console.error('Delivery method error:', error)

      toast.error(
        error.response?.data?.message ||
        'Erreur lors de la modification de la livraison'
      )
    }
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // =====================================================
  // LABELS
  // =====================================================

  const paymentLabels = {
    pending: 'Paiement en attente',
    paid: 'Payé',
    cancelled: 'Annulé',
  }

  const orderStatusLabels = {
    not_processed: 'Non traité',
    not_required: 'Non requis',
    shipping: 'Livraison en cours',
    delivered: 'Livrée',
  }

  const deliveryLabels = {
    safi_10dh: 'Safi - 10 DH',
    outside_safi_35dh: 'Hors Safi - 35 DH',
  }

  // =====================================================
  // COLORS
  // =====================================================

  const paymentColors = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }

  const orderStatusColors = {
    not_processed: 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300',
    not_required: 'bg-gray-100 dark:bg-stone-700 text-gray-600 dark:text-stone-300',
    shipping: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="text-4xl mb-4">⏳</div>

        <p className="text-sm text-stone-400 dark:text-stone-500">
          Chargement des commandes...
        </p>
      </div>
    )
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

        <div>
          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100">
            Commandes
          </h2>

          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Gestion des commandes et suivi ColisSpeed
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center justify-center gap-2 bg-stone-900 text-white text-xs px-5 py-3 rounded-xl hover:bg-stone-700 transition"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>

      </div>

      {/* =================================================
          EMPTY
      ================================================= */}

      {orders.length === 0 ? (

        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-20 text-center">

          <Package
            size={40}
            className="mx-auto text-stone-300 dark:text-stone-600 mb-4"
          />

          <p className="text-sm text-stone-400 dark:text-stone-500">
            Aucune commande pour le moment
          </p>

        </div>

      ) : (

        /* =================================================
           TABLE
        ================================================= */

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-stone-50 dark:bg-stone-800/50">

                <tr className="text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">

                  <th className="px-5 py-4 text-left">
                    Commande
                  </th>

                  <th className="px-5 py-4 text-left">
                    Client
                  </th>

                  <th className="px-5 py-4 text-left">
                    Articles
                  </th>

                  <th className="px-5 py-4 text-left">
                    Total
                  </th>

                  <th className="px-5 py-4 text-left">
                    Paiement
                  </th>

                  <th className="px-5 py-4 text-left">
                    Traitement
                  </th>

                  <th className="px-5 py-4 text-left">
                    Livraison
                  </th>

                  <th className="px-5 py-4 text-left">
                    ColisSpeed
                  </th>

                </tr>

              </thead>

              <tbody>

                {orders.map((order) => (

                  <tr
                    key={order._id}
                    className="border-t border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition align-top"
                  >

                    {/* =====================================
                        ORDER
                    ===================================== */}

                    <td className="px-5 py-5">

                      <div className="flex items-center gap-2">

                        <Package
                          size={15}
                          className="text-stone-400 dark:text-stone-500"
                        />

                        <div>

                          <p className="font-medium text-stone-800 dark:text-stone-200">
                            #{order._id.slice(-6).toUpperCase()}
                          </p>

                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
                            <Calendar size={10} />
                            {formatDate(order.createdAt)}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* =====================================
                        CLIENT
                    ===================================== */}

                    <td className="px-5 py-5 min-w-[220px]">

                      <div className="space-y-1">

                        <p className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-2">
                          <User size={13} />
                          {order.client?.name}
                        </p>

                        <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                          <Phone size={12} />
                          {order.client?.phone}
                        </p>

                        <p className="text-xs text-stone-400 dark:text-stone-500 flex items-start gap-2">
                          <MapPin
                            size={12}
                            className="mt-0.5 flex-shrink-0"
                          />

                          <span>
                            {order.client?.city}
                            {' — '}
                            {order.client?.address}
                          </span>
                        </p>

                        {order.client?.email && (
                          <p className="text-[10px] text-stone-400 dark:text-stone-500">
                            {order.client.email}
                          </p>
                        )}

                      </div>

                    </td>

                    {/* =====================================
                        ITEMS
                    ===================================== */}

                    <td className="px-5 py-5 min-w-[220px]">

                      <div className="space-y-2">

                        {order.items?.map((item, index) => (

                          <div
                            key={index}
                            className="flex items-center gap-2"
                          >

                            {item.image ? (

                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-9 h-9 rounded-lg object-cover"
                                onError={onImgError}
                              />

                            ) : (

                              <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                                <Package
                                  size={14}
                                  className="text-stone-400 dark:text-stone-500"
                                />
                              </div>

                            )}

                            <div>

                              <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                                {item.name}
                              </p>

                              <p className="text-[10px] text-stone-400 dark:text-stone-500">
                                x{item.qty} · {item.price} DH
                              </p>

                            </div>

                          </div>

                        ))}

                      </div>

                    </td>

                    {/* =====================================
                        TOTAL
                    ===================================== */}

                    <td className="px-5 py-5">

                      <p className="font-semibold text-stone-800 dark:text-stone-200 whitespace-nowrap">
                        {Number(order.total || 0).toFixed(2)} DH
                      </p>

                    </td>

                    {/* =====================================
                        PAYMENT
                    ===================================== */}

                    <td className="px-5 py-5">

                      <select
                        value={order.paymentStatus || 'pending'}
                        onChange={(e) =>
                          updatePayment(
                            order._id,
                            e.target.value
                          )
                        }
                        className={`text-[11px] font-medium px-3 py-2 rounded-full border-0 outline-none cursor-pointer ${
                          paymentColors[
                            order.paymentStatus
                          ] || paymentColors.pending
                        }`}
                      >

                        <option value="pending">
                          {paymentLabels.pending}
                        </option>

                        <option value="paid">
                          {paymentLabels.paid}
                        </option>

                        <option value="cancelled">
                          {paymentLabels.cancelled}
                        </option>

                      </select>

                    </td>

                    {/* =====================================
                        ORDER STATUS
                    ===================================== */}

                    <td className="px-5 py-5">

                      <select
                        value={
                          order.orderStatus ||
                          'not_processed'
                        }
                        onChange={(e) =>
                          updateOrderStatus(
                            order._id,
                            e.target.value
                          )
                        }
                        className={`text-[11px] font-medium px-3 py-2 rounded-full border-0 outline-none cursor-pointer ${
                          orderStatusColors[
                            order.orderStatus
                          ] ||
                          orderStatusColors.not_processed
                        }`}
                      >

                        <option value="not_processed">
                          {orderStatusLabels.not_processed}
                        </option>

                        <option value="not_required">
                          {orderStatusLabels.not_required}
                        </option>

                        <option value="shipping">
                          {orderStatusLabels.shipping}
                        </option>

                        <option value="delivered">
                          {orderStatusLabels.delivered}
                        </option>

                      </select>

                    </td>

                    {/* =====================================
                        DELIVERY
                    ===================================== */}

                    <td className="px-5 py-5">

                      <select
                        value={
                          order.deliveryMethod ||
                          'safi_10dh'
                        }
                        onChange={(e) =>
                          updateDeliveryMethod(
                            order._id,
                            e.target.value
                          )
                        }
                        className="text-[11px] bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-2 rounded-full border-0 outline-none cursor-pointer"
                      >

                        <option value="safi_10dh">
                          Safi - 10 DH
                        </option>

                        <option value="outside_safi_35dh">
                          Hors Safi - 35 DH
                        </option>

                      </select>

                    </td>

                    {/* =====================================
                        COLISSPEED
                    ===================================== */}

                    <td className="px-5 py-5 min-w-[220px]">

                      {order.colisSpeed?.tracking ? (

                        <div className="space-y-2">

                          {/* Tracking */}

                          <div className="flex items-center gap-2">

                            <Truck
                              size={15}
                              className="text-green-600 dark:text-green-400"
                            />

                            <div>

                              <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                                {order.colisSpeed.tracking}
                              </p>

                              <p className="text-[10px] text-stone-400 dark:text-stone-500">
                                {order.colisSpeed.status ||
                                  'Commande envoyée'}
                              </p>

                            </div>

                          </div>

                          {/* Delivery Person */}

                          {order.colisSpeed.deliveryPerson?.name && (

                            <div className="text-[10px] text-stone-400 dark:text-stone-500">

                              <p>
                                👤{' '}
                                {
                                  order.colisSpeed
                                    .deliveryPerson.name
                                }
                              </p>

                              {order.colisSpeed.deliveryPerson.phone && (
                                <p>
                                  📞{' '}
                                  {
                                    order.colisSpeed
                                      .deliveryPerson.phone
                                  }
                                </p>
                              )}

                            </div>

                          )}

                          {/* Refresh tracking */}

                          <button
                            onClick={() =>
                              trackColisSpeed(order._id)
                            }
                            disabled={
                              trackingId === order._id
                            }
                            className="flex items-center gap-1.5 text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-600 transition disabled:opacity-50"
                          >

                            <RefreshCw
                              size={11}
                              className={
                                trackingId === order._id
                                  ? 'animate-spin'
                                  : ''
                              }
                            />

                            {trackingId === order._id
                              ? 'Actualisation...'
                              : 'Actualiser suivi'}

                          </button>

                        </div>

                      ) : (

                        <button
                          onClick={() =>
                            sendToColisSpeed(order._id)
                          }
                          disabled={
                            sendingId === order._id
                          }
                          className="flex items-center gap-2 bg-stone-900 text-white text-[11px] px-4 py-2.5 rounded-xl hover:bg-stone-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                          {sendingId === order._id ? (

                            <>
                              <RefreshCw
                                size={13}
                                className="animate-spin"
                              />

                              Envoi...

                            </>

                          ) : (

                            <>
                              <Send size={13} />

                              Envoyer à ColisSpeed
                            </>

                          )}

                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">

            <div className="flex items-center justify-between">

              <p className="text-xs text-stone-400 dark:text-stone-500">

                {orders.length}{' '}
                {orders.length > 1
                  ? 'commandes'
                  : 'commande'}

              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-2">

                <CreditCard size={13} />

                Total affiché :{' '}

                <span className="font-medium text-stone-700 dark:text-stone-300">

                  {orders
                    .reduce(
                      (sum, order) =>
                        sum +
                        Number(order.total || 0),
                      0
                    )
                    .toFixed(2)}{' '}
                  DH

                </span>

              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

