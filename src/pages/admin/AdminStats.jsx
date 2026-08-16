import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

export default function AdminStats() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const monthRef = useRef(null)
  const statusRef = useRef(null)
  const revenueRef = useRef(null)
  const charts = useRef({})

  // =====================================================
  // FETCH REAL ORDERS
  // =====================================================

  useEffect(() => {
    fetchOrders()

    return () => {
      Object.values(charts.current).forEach((chart) => {
        try {
          chart.destroy()
        } catch {}
      })
    }
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/orders')

      setOrders(Array.isArray(data) ? data : [])

    } catch (error) {
      console.error('Erreur chargement statistiques:', error)
    } finally {
      setLoading(false)
    }
  }


  // =====================================================
  // LOAD CHART.JS
  // =====================================================

  useEffect(() => {
    if (!orders.length) return

    const build = () => {
      setTimeout(() => {
        buildCharts()
      }, 50)
    }

    if (window.Chart) {
      build()
      return
    }

    const script = document.createElement('script')

    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'

    script.onload = build

    document.head.appendChild(script)

    return () => {
      try {
        document.head.removeChild(script)
      } catch {}
    }
  }, [orders])


  // =====================================================
  // CALCULATE STATISTICS
  // =====================================================

  const getStats = () => {
    const total = orders.length

    const deliveredOrders = orders.filter(
      (order) => order.orderStatus === 'delivered'
    )

    const cancelledOrders = orders.filter(
      (order) =>
        order.paymentStatus === 'cancelled' ||
        order.orderStatus === 'cancelled'
    )

    const pendingPayment = orders.filter(
      (order) =>
        !order.paymentStatus ||
        order.paymentStatus === 'pending'
    )

    const paidOrders = orders.filter(
      (order) => order.paymentStatus === 'paid'
    )

    const processingOrders = orders.filter(
      (order) => order.orderStatus === 'processing'
    )

    const shippingOrders = orders.filter(
      (order) => order.orderStatus === 'shipping'
    )

    const notProcessedOrders = orders.filter(
      (order) =>
        !order.orderStatus ||
        order.orderStatus === 'not_processed'
    )


    // -----------------------------------------------------
    // REVENUE
    // -----------------------------------------------------

    const totalRevenue = orders
      .filter(
        (order) =>
          order.paymentStatus !== 'cancelled'
      )
      .reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      )


    const paidRevenue = orders
      .filter(
        (order) => order.paymentStatus === 'paid'
      )
      .reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      )


    // -----------------------------------------------------
    // DELIVERY FEES
    // -----------------------------------------------------

    const totalDeliveryFees = orders
      .filter(
        (order) =>
          order.paymentStatus !== 'cancelled'
      )
      .reduce((sum, order) => {

        if (order.deliveryMethod === 'safi_10dh') {
          return sum + 10
        }

        if (
          order.deliveryMethod ===
          'outside_safi_35dh'
        ) {
          return sum + 35
        }

        return sum
      }, 0)


    // -----------------------------------------------------
    // AVERAGE ORDER
    // -----------------------------------------------------

    const averageOrder =
      total > 0
        ? totalRevenue / total
        : 0


    // -----------------------------------------------------
    // DELIVERY RATE
    // -----------------------------------------------------

    const deliveryRate =
      total > 0
        ? Math.round(
            (deliveredOrders.length / total) * 100
          )
        : 0


    return {
      total,
      delivered: deliveredOrders.length,
      cancelled: cancelledOrders.length,
      pendingPayment: pendingPayment.length,
      paid: paidOrders.length,
      processing: processingOrders.length,
      shipping: shippingOrders.length,
      notProcessed: notProcessedOrders.length,

      totalRevenue,
      paidRevenue,
      totalDeliveryFees,
      averageOrder,
      deliveryRate,
    }
  }


  // =====================================================
  // MONTHLY STATISTICS
  // =====================================================

  const getMonthlyStats = () => {
    const months = {}

    orders.forEach((order) => {
      if (!order.createdAt) return

      const date = new Date(order.createdAt)

      const year = date.getFullYear()
      const month = date.getMonth()

      const key =
        year + '-' + String(month + 1).padStart(2, '0')

      const label = date.toLocaleDateString(
        'fr-FR',
        {
          month: 'short',
          year: 'numeric',
        }
      )

      if (!months[key]) {
        months[key] = {
          key,
          month: label,
          cmds: 0,
          delivered: 0,
          cancelled: 0,
          revenue: 0,
        }
      }

      months[key].cmds += 1

      if (order.orderStatus === 'delivered') {
        months[key].delivered += 1
      }

      if (
        order.paymentStatus === 'cancelled' ||
        order.orderStatus === 'cancelled'
      ) {
        months[key].cancelled += 1
      }

      if (order.paymentStatus !== 'cancelled') {
        months[key].revenue +=
          Number(order.total || 0)
      }
    })

    return Object.values(months).sort(
      (a, b) => a.key.localeCompare(b.key)
    )
  }


  // =====================================================
  // CITY STATISTICS
  // =====================================================

  const getCityStats = () => {
    const cities = {}

    orders.forEach((order) => {

      const city =
        order.client?.city?.trim() ||
        'Non définie'

      if (!cities[city]) {
        cities[city] = {
          name: city,
          cmds: 0,
          revenue: 0,
        }
      }

      cities[city].cmds += 1

      if (order.paymentStatus !== 'cancelled') {
        cities[city].revenue +=
          Number(order.total || 0)
      }
    })

    return Object.values(cities)
      .sort((a, b) => b.cmds - a.cmds)
      .slice(0, 10)
  }


  // =====================================================
  // BUILD CHARTS
  // =====================================================

  function buildCharts() {
    if (!window.Chart || !orders.length) return

    Object.values(charts.current).forEach((chart) => {
      try {
        chart.destroy()
      } catch {}
    })

    charts.current = {}

    const monthly = getMonthlyStats()
    const cities = getCityStats()


    // ===================================================
    // MONTHLY REVENUE
    // ===================================================

    if (monthRef.current) {

      charts.current.month =
        new window.Chart(
          monthRef.current,
          {
            type: 'bar',

            data: {
              labels: monthly.map(
                (item) => item.month
              ),

              datasets: [
                {
                  label: 'Chiffre d’affaires',

                  data: monthly.map(
                    (item) => item.revenue
                  ),

                  backgroundColor: '#1D9E75',

                  borderRadius: 6,
                },
              ],
            },

            options: {
              responsive: true,

              maintainAspectRatio: false,

              plugins: {
                legend: {
                  display: false,
                },
              },

              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },

                y: {
                  ticks: {
                    callback: (value) =>
                      Number(value).toLocaleString() +
                      ' DH',
                  },

                  grid: {
                    color:
                      'rgba(128,128,128,0.1)',
                  },
                },
              },
            },
          }
        )
    }


    // ===================================================
    // ORDER STATUS
    // ===================================================

    if (statusRef.current) {

      const stats = getStats()

      charts.current.status =
        new window.Chart(
          statusRef.current,
          {
            type: 'bar',

            data: {
              labels: [
                'Non traité',
                'En cours',
                'Livraison',
                'Livrées',
                'Annulées',
              ],

              datasets: [
                {
                  label: 'Commandes',

                  data: [
                    stats.notProcessed,
                    stats.processing,
                    stats.shipping,
                    stats.delivered,
                    stats.cancelled,
                  ],

                  backgroundColor: [
                    '#A8A29E',
                    '#378ADD',
                    '#7F77DD',
                    '#1D9E75',
                    '#E24B4A',
                  ],

                  borderRadius: 6,
                },
              ],
            },

            options: {
              responsive: true,

              maintainAspectRatio: false,

              plugins: {
                legend: {
                  display: false,
                },
              },

              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },

                y: {
                  beginAtZero: true,

                  ticks: {
                    precision: 0,
                  },

                  grid: {
                    color:
                      'rgba(128,128,128,0.1)',
                  },
                },
              },
            },
          }
        )
    }


    // ===================================================
    // REVENUE BY CITY
    // ===================================================

    if (revenueRef.current) {

      charts.current.revenue =
        new window.Chart(
          revenueRef.current,
          {
            type: 'bar',

            data: {
              labels: cities.map(
                (city) => city.name
              ),

              datasets: [
                {
                  label: 'Revenue',

                  data: cities.map(
                    (city) => city.revenue
                  ),

                  backgroundColor: '#7F77DD',

                  borderRadius: 6,
                },
              ],
            },

            options: {
              indexAxis: 'y',

              responsive: true,

              maintainAspectRatio: false,

              plugins: {
                legend: {
                  display: false,
                },
              },

              scales: {
                x: {
                  ticks: {
                    callback: (value) =>
                      Number(value) + ' DH',
                  },

                  grid: {
                    color:
                      'rgba(128,128,128,0.1)',
                  },
                },

                y: {
                  grid: {
                    display: false,
                  },
                },
              },
            },
          }
        )
    }
  }


  // =====================================================
  // DATA
  // =====================================================

  const stats = getStats()

  const monthly = getMonthlyStats()

  const cities = getCityStats()

  const maxCmds =
    cities.length > 0
      ? Math.max(
          ...cities.map(
            (city) => city.cmds
          )
        )
      : 1


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center">

        <div className="text-4xl mb-4">
          ⏳
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400">
          Chargement des statistiques...
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

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100">
            Statistiques
          </h2>

          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Statistiques basées sur vos commandes réelles
          </p>

        </div>


        <div className="flex items-center gap-3">

          <span className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full">
            {stats.deliveryRate}% taux livraison
          </span>

          <button
            onClick={fetchOrders}
            className="text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
          >
            ↻ Actualiser
          </button>

        </div>

      </div>


      {/* =================================================
          EMPTY
      ================================================= */}

      {orders.length === 0 ? (

        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-24 text-center">

          <div className="text-5xl mb-4">
            📊
          </div>

          <h3 className="text-lg font-light text-stone-700 dark:text-stone-300">
            Aucune donnée
          </h3>

          <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
            Les statistiques apparaîtront dès que vous aurez des commandes.
          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              METRIC CARDS
          ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                Total commandes
              </p>

              <p className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-1">
                {stats.total}
              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500">
                {stats.delivered} livrées · {stats.cancelled} annulées
              </p>

            </div>


            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                Chiffre d’affaires
              </p>

              <p className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-1">
                {Math.round(
                  stats.totalRevenue
                ).toLocaleString()} DH
              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500">
                Commandes non annulées
              </p>

            </div>


            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                Paiements reçus
              </p>

              <p className="text-2xl font-light text-green-700 dark:text-green-400 mb-1">
                {Math.round(
                  stats.paidRevenue
                ).toLocaleString()} DH
              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500">
                {stats.paid} commandes payées
              </p>

            </div>


            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                Panier moyen
              </p>

              <p className="text-2xl font-light text-stone-900 dark:text-stone-100 mb-1">
                {Math.round(
                  stats.averageOrder
                ).toLocaleString()} DH
              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500">
                Par commande
              </p>

            </div>

          </div>


          {/* =================================================
              SECOND METRICS
          ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                En attente paiement
              </p>

              <p className="text-2xl font-light text-amber-600 dark:text-amber-400">
                {stats.pendingPayment}
              </p>

            </div>


            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                Non traitées
              </p>

              <p className="text-2xl font-light text-stone-600 dark:text-stone-400">
                {stats.notProcessed}
              </p>

            </div>


            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                Livraison en cours
              </p>

              <p className="text-2xl font-light text-purple-600 dark:text-purple-400">
                {stats.shipping}
              </p>

            </div>


            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5">

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                Frais livraison
              </p>

              <p className="text-2xl font-light text-stone-900 dark:text-stone-100">
                {stats.totalDeliveryFees.toLocaleString()} DH
              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                10 DH Safi · 35 DH hors Safi
              </p>

            </div>

          </div>


          {/* =================================================
              CHARTS ROW 1
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Revenue */}

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">

              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-1">
                Chiffre d’affaires par mois
              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
                Basé sur les commandes réelles
              </p>

              <div
                style={{
                  position: 'relative',
                  height: '250px',
                }}
              >
                <canvas
                  ref={monthRef}
                  role="img"
                  aria-label="Chiffre d'affaires par mois"
                />
              </div>

            </div>


            {/* Status */}

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">

              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-1">
                Statut des commandes
              </p>

              <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
                Répartition actuelle
              </p>

              <div
                style={{
                  position: 'relative',
                  height: '250px',
                }}
              >
                <canvas
                  ref={statusRef}
                  role="img"
                  aria-label="Statut des commandes"
                />
              </div>

            </div>

          </div>


          {/* =================================================
              CHARTS ROW 2
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Top cities */}

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">

              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-5">
                Top villes — commandes
              </p>

              {cities.map((city) => (

                <div
                  key={city.name}
                  className="flex items-center gap-3 mb-3"
                >

                  <span className="text-xs text-stone-400 dark:text-stone-500 w-24 text-right flex-shrink-0 capitalize truncate">
                    {city.name}
                  </span>

                  <div className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-full h-6 overflow-hidden">

                    <div
                      className="h-full rounded-full flex items-center px-2"
                      style={{
                        width:
                          Math.max(
                            8,
                            Math.round(
                              (city.cmds /
                                maxCmds) *
                                100
                            )
                          ) + '%',

                        background:
                          '#534AB7',
                      }}
                    >

                      <span className="text-[10px] text-white font-medium">
                        {city.cmds}
                      </span>

                    </div>

                  </div>

                  <span className="text-xs text-stone-400 dark:text-stone-500 w-16 flex-shrink-0">
                    {city.cmds} cmds
                  </span>

                </div>

              ))}

            </div>


            {/* Revenue cities */}

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6">

              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-1">
                Revenue par ville
              </p>

              <div
                style={{
                  position: 'relative',
                  height:
                    Math.max(
                      280,
                      cities.length * 35 + 60
                    ) + 'px',
                }}
              >

                <canvas
                  ref={revenueRef}
                  role="img"
                  aria-label="Revenue par ville"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              MONTHLY TABLE
          ================================================= */}

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">

            <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">

              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400">
                Détail mensuel
              </p>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-stone-50 dark:bg-stone-800/50 text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">

                  <tr>

                    {[
                      'Mois',
                      'Commandes',
                      'Livrées',
                      'Annulées',
                      'Revenue',
                      'Taux livraison',
                    ].map((header) => (

                      <th
                        key={header}
                        className="px-5 py-3 text-left whitespace-nowrap"
                      >
                        {header}
                      </th>

                    ))}

                  </tr>

                </thead>


                <tbody>

                  {monthly.map((item) => {

                    const rate =
                      item.cmds > 0
                        ? Math.round(
                            (item.delivered /
                              item.cmds) *
                              100
                          )
                        : 0

                    return (

                      <tr
                        key={item.key}
                        className="border-t border-stone-50 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition"
                      >

                        <td className="px-5 py-3 font-medium text-stone-800 dark:text-stone-200">
                          {item.month}
                        </td>

                        <td className="px-5 py-3 text-stone-600 dark:text-stone-400">
                          {item.cmds}
                        </td>

                        <td className="px-5 py-3 text-green-600 dark:text-green-400 font-medium">
                          {item.delivered}
                        </td>

                        <td className="px-5 py-3 text-red-500 dark:text-red-400">
                          {item.cancelled}
                        </td>

                        <td className="px-5 py-3 font-medium text-stone-700 dark:text-stone-300">
                          {Math.round(
                            item.revenue
                          ).toLocaleString()} DH
                        </td>

                        <td className="px-5 py-3">

                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] px-2.5 py-1 rounded-full font-medium">
                            {rate}%
                          </span>

                        </td>

                      </tr>

                    )
                  })}

                </tbody>


                <tfoot>

                  <tr className="bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">

                    <td className="px-5 py-3 font-medium text-stone-800 dark:text-stone-200">
                      Total
                    </td>

                    <td className="px-5 py-3 font-medium text-stone-800 dark:text-stone-200">
                      {stats.total}
                    </td>

                    <td className="px-5 py-3 font-medium text-green-600 dark:text-green-400">
                      {stats.delivered}
                    </td>

                    <td className="px-5 py-3 font-medium text-red-500 dark:text-red-400">
                      {stats.cancelled}
                    </td>

                    <td className="px-5 py-3 font-medium text-green-700 dark:text-green-400">
                      {Math.round(
                        stats.totalRevenue
                      ).toLocaleString()} DH
                    </td>

                    <td className="px-5 py-3">

                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] px-2.5 py-1 rounded-full font-medium">
                        {stats.deliveryRate}%
                      </span>

                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>

          </div>

        </>

      )}

    </div>
  )
}

