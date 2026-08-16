import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../store/slices/cartSlice'
import api from '../services/api'
import toast from 'react-hot-toast'
import { onImgError } from '../utils/imageFallback'
import ConfirmDialog from '../components/ConfirmDialog'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

const WHATSAPP_NUMBER = '212638298630'

export default function CheckoutPage() {
  const { items } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)

  const dispatch = useDispatch()
  const location = useLocation()

  const promoFromCart = location.state?.promoApplied || null

  const [promoApplied, setPromoApplied] = useState(promoFromCart)
  const [promoLoading, setPromoLoading] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    fullAddress: '',
    deliveryMethod: 'safi_10dh',
    note: '',
    showNote: false,
    coupon: '',
    showCoupon: false,
  })

  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  // =====================================================
  // CALCULATE TOTALS
  // =====================================================

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  )

  const discountAmount = promoApplied
    ? Math.round(
        subtotal * promoApplied.discount / 100
      )
    : 0

  // =====================================================
  // DELIVERY
  // Choisi manuellement via boutons radio
  // Safi = 10 DH — Hors Safi = 35 DH
  // =====================================================

  const isSafi = form.deliveryMethod === 'safi_10dh'

  const deliveryFee = isSafi ? 10 : 35

  const total =
    subtotal -
    discountAmount +
    deliveryFee

  // =====================================================
  // META PIXEL — InitiateCheckout au chargement de la page
  // (une seule fois, si le panier n'est pas vide)
  // =====================================================
  useEffect(function() {
    if (items.length > 0 && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: items.map(function(item) { return item._id }),
        contents: items.map(function(item) {
          return { id: item._id, quantity: item.qty }
        }),
        content_type: 'product',
        num_items: items.reduce(function(sum, item) { return sum + item.qty }, 0),
        value: Number(subtotal.toFixed(2)),
        currency: 'MAD',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // =====================================================
  // COUPON
  // =====================================================

  const handleCoupon = async () => {
    if (!form.coupon.trim()) return

    setPromoLoading(true)

    try {
      const res = await api.post('/promos/validate', {
        code: form.coupon.trim(),
      })

      setPromoApplied({
        code: res.data.code,
        discount: res.data.discount,
      })

      setForm((prev) => ({
        ...prev,
        showCoupon: false,
      }))
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Code invalide',
        { style: toastStyle }
      )
    }

    setPromoLoading(false)
  }


  const removePromo = () => {
    setPromoApplied(null)

    setForm((prev) => ({
      ...prev,
      coupon: '',
    }))
  }


  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {
    const e = {}

    if (!form.fullName.trim()) {
      e.fullName = 'Nom complet requis'
    }

    if (!form.phone.trim()) {
      e.phone = 'Telephone requis'
    }

    if (!form.fullAddress.trim()) {
      e.fullAddress = 'Adresse requise'
    }

    setErrors(e)

    return Object.keys(e).length === 0
  }


  // =====================================================
  // META PIXEL — Purchase après commande confirmée
  // =====================================================
  const trackPurchase = function(createdOrder) {
    if (!window.fbq) return

    window.fbq('track', 'Purchase', {
      content_ids: items.map(function(item) { return item._id }),
      contents: items.map(function(item) {
        return { id: item._id, quantity: item.qty }
      }),
      content_type: 'product',
      num_items: items.reduce(function(sum, item) { return sum + item.qty }, 0),
      value: Number(total.toFixed(2)),
      currency: 'MAD',
      order_id: createdOrder._id,
    })
  }


  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrderClick = () => {
    if (!validate()) return

    if (items.length === 0) {
      return
    }

    setShowConfirm(true)
  }

  const submitOrder = async () => {
    setShowConfirm(false)
    setPlacingOrder(true)

    try {

      // =================================================
      // PREPARE ITEMS
      // =================================================

      const orderItems = items.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
      }))


      // =================================================
      // CREATE ORDER IN DATABASE
      // =================================================

      const orderData = {
        client: {
          name: form.fullName.trim(),
          phone: form.phone.trim(),
          city: isSafi ? 'Safi' : 'Hors Safi',
          address: form.fullAddress.trim(),
          email: user?.email || '',
        },

        items: orderItems,

        total: Number(total.toFixed(2)),

        paymentStatus: 'pending',

        orderStatus: 'not_processed',

        deliveryMethod: form.deliveryMethod,

        note: form.note.trim(),

        promoCode: promoApplied ? promoApplied.code : '',
      }


      const response = await api.post(
        '/orders',
        orderData
      )


      // =================================================
      // ORDER CREATED
      // =================================================

      const createdOrder = response.data.order || response.data

      // Meta Pixel — Purchase (avant le vidage du panier,
      // pour avoir accès aux items dans le tracking)
      trackPurchase(createdOrder)


      // =================================================
      // USE PROMO
      // =================================================

      if (promoApplied) {
        try {
          await api.post('/promos/use', {
            code: promoApplied.code,
          })
        } catch (e) {
          console.log(
            'promo use error',
            e
          )
        }
      }


      // =================================================
      // WHATSAPP MESSAGE
      // =================================================

      const orderLines = items
        .map((item) => {
          return (
            '• ' +
            item.name +
            ' x' +
            item.qty +
            ' — ' +
            (
              item.price * item.qty
            ).toFixed(2) +
            ' MAD'
          )
        })
        .join('\n')


      const deliveryText = isSafi
        ? 'Safi — 10 MAD'
        : 'Hors Safi — 35 MAD'


      const message = [
        '🛍️ *NOUVELLE COMMANDE — Brillante Elegance*',
        '',
        '🔖 *Commande:* #' +
          createdOrder._id.slice(-6).toUpperCase(),
        '',
        '👤 *Client:* ' +
          form.fullName,

        '📞 *Tel:* ' +
          form.phone,

        '🏠 *Adresse:* ' +
          form.fullAddress,

        form.note
          ? '📝 *Note:* ' +
            form.note
          : '',

        '',

        '*Produits:*',

        orderLines,

        '',

        '💰 *Sous-total:* ' +
          subtotal.toFixed(2) +
          ' MAD',

        discountAmount > 0
          ? '🎉 *Code promo ' +
            promoApplied.code +
            ':* -' +
            discountAmount.toFixed(2) +
            ' MAD (-' +
            promoApplied.discount +
            '%)'
          : '',

        '🚚 *Livraison:* ' +
          deliveryText,

        '💵 *TOTAL: ' +
          total.toFixed(2) +
          ' MAD*',

        '',

        '💳 *Paiement:* Cash a la livraison',

        '',

        'Merci ! 🙏',
      ]
        .filter(Boolean)
        .join('\n')
        .trim()


      // =================================================
      // OPEN WHATSAPP
      // =================================================

      const encoded =
        encodeURIComponent(message)

      const url =
        'https://wa.me/' +
        WHATSAPP_NUMBER +
        '?text=' +
        encoded


      // Clear cart only after successful order
      dispatch(clearCart())

      setSent(true)

      window.open(
        url,
        '_blank'
      )

    } catch (error) {

      console.error(
        'Create order error:',
        error
      )

      toast.error(
        error.response?.data?.message ||
        'Une erreur est survenue lors de la creation de la commande.',
        { style: toastStyle }
      )

    } finally {

      setPlacingOrder(false)

    }
  }


  // =====================================================
  // EMPTY CART
  // =====================================================

  if (
    items.length === 0 &&
    !sent
  ) {
    return (
      <main className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center text-center px-4">

        <div className="text-6xl mb-6">
          🛍️
        </div>

        <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-4">
          Panier vide
        </h2>

        <Link
          to="/shop"
          className="bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition"
        >
          Continuer mes achats
        </Link>

      </main>
    )
  }


  // =====================================================
  // SUCCESS
  // =====================================================

  if (sent) {
    return (
      <main className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center text-center px-4">

        <div className="text-7xl mb-6">
          ✅
        </div>

        <h2 className="text-3xl font-light tracking-widest uppercase text-stone-800 mb-3">
          Commande envoyee !
        </h2>

        <p className="text-stone-500 text-sm mb-2">
          Votre commande a ete envoyee sur WhatsApp.
        </p>

        <p className="text-stone-400 text-xs mb-8">
          Nous vous confirmerons dans les plus brefs delais.
        </p>

        <div className="flex gap-3">

          <Link
            to="/"
            className="border border-stone-300 text-stone-600 text-xs tracking-[0.3em] uppercase px-8 py-3.5 rounded-full hover:bg-stone-100 transition"
          >
            Accueil
          </Link>

          <Link
            to="/shop"
            className="bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-8 py-3.5 rounded-full hover:bg-stone-700 transition"
          >
            Continuer mes achats
          </Link>

        </div>

      </main>
    )
  }


  // =====================================================
  // MAIN CHECKOUT
  // =====================================================

  return (
    <main className="bg-[#f9f8f6] min-h-screen">

      {/* HEADER */}

      <div className="bg-[#f5f3f0] py-14 text-center">

        <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-stone-900 mb-4">
          Checkout
        </h1>

        <div className="flex items-center justify-center gap-2 text-sm text-stone-400">

          <Link
            to="/"
            className="hover:text-stone-700 transition"
          >
            Home
          </Link>

          <span>›</span>

          <Link
            to="/cart"
            className="hover:text-stone-700 transition"
          >
            Panier
          </Link>

          <span>›</span>

          <span className="text-stone-600">
            Checkout
          </span>

        </div>

      </div>


      {/* CONTENT */}

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">


        {/* =================================================
            FORM
        ================================================= */}

        <div className="lg:col-span-2 flex flex-col gap-8">


          {/* CONTACT */}

          <div>

            <h2 className="text-lg font-light text-stone-900 mb-5">
              Contact Information
            </h2>

            <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4">

              <label className="text-xs text-stone-400 block mb-1">
                Email address
              </label>

              <input
                type="email"
                defaultValue={user?.email || ''}
                className="w-full text-sm text-stone-700 focus:outline-none bg-transparent"
                placeholder="votre@email.com"
              />

            </div>

            <p className="text-xs text-stone-400 mt-2 ml-1">
              {user
                ? 'Connecte en tant que ' +
                  user.name
                : 'You are currently checking out as a guest.'}
            </p>

          </div>


          {/* BILLING */}

          <div>

            <h2 className="text-lg font-light text-stone-900 mb-5">
              Billing Address
            </h2>

            <div className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-col gap-4">


              {/* NOM COMPLET */}

              <div>

                <label className="text-xs text-stone-400 block mb-1">
                  Nom complet *
                </label>

                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fullName: e.target.value,
                    })
                  }
                  className={
                    'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' +
                    (
                      errors.fullName
                        ? 'border-red-400'
                        : 'border-stone-200 focus:border-stone-400'
                    )
                  }
                  placeholder="Ayman Raisse"
                />

                {errors.fullName && (
                  <p className="text-red-400 text-[11px] mt-1">
                    {errors.fullName}
                  </p>
                )}

              </div>


              {/* PHONE */}

              <div>

                <label className="text-xs text-stone-400 block mb-1">
                  Telephone *
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  className={
                    'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' +
                    (
                      errors.phone
                        ? 'border-red-400'
                        : 'border-stone-200 focus:border-stone-400'
                    )
                  }
                  placeholder="+212 6XX XXX XXX"
                />

                {errors.phone && (
                  <p className="text-red-400 text-[11px] mt-1">
                    {errors.phone}
                  </p>
                )}

              </div>


              {/* MODE DE LIVRAISON — RADIO */}

              <div>

                <label className="text-xs text-stone-400 block mb-2">
                  Mode de livraison *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <label
                    className={
                      'flex items-center justify-between border-2 rounded-xl px-4 py-3 cursor-pointer transition ' +
                      (form.deliveryMethod === 'safi_10dh'
                        ? 'border-stone-900 bg-[#faf9f7]'
                        : 'border-stone-200 hover:border-stone-300')
                    }
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="safi_10dh"
                        checked={form.deliveryMethod === 'safi_10dh'}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            deliveryMethod: e.target.value,
                          })
                        }
                        className="accent-stone-900 w-4 h-4"
                      />
                      <span className="text-sm text-stone-800">
                        Livraison à Safi
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-stone-800">
                      10 DH
                    </span>
                  </label>

                  <label
                    className={
                      'flex items-center justify-between border-2 rounded-xl px-4 py-3 cursor-pointer transition ' +
                      (form.deliveryMethod === 'outside_safi_35dh'
                        ? 'border-stone-900 bg-[#faf9f7]'
                        : 'border-stone-200 hover:border-stone-300')
                    }
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="outside_safi_35dh"
                        checked={form.deliveryMethod === 'outside_safi_35dh'}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            deliveryMethod: e.target.value,
                          })
                        }
                        className="accent-stone-900 w-4 h-4"
                      />
                      <span className="text-sm text-stone-800">
                        Hors Safi
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-stone-800">
                      35 DH
                    </span>
                  </label>

                </div>

              </div>


              {/* ADRESSE COMPLETE */}

              <div>

                <label className="text-xs text-stone-400 block mb-1">
                  Ville avec adresse *
                </label>

                <input
                  type="text"
                  value={form.fullAddress}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fullAddress: e.target.value,
                    })
                  }
                  className={
                    'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' +
                    (
                      errors.fullAddress
                        ? 'border-red-400'
                        : 'border-stone-200 focus:border-stone-400'
                    )
                  }
                  placeholder="Casa, quartier X, 01 rue exemple, code postal"
                />

                {errors.fullAddress && (
                  <p className="text-red-400 text-[11px] mt-1">
                    {errors.fullAddress}
                  </p>
                )}

              </div>

            </div>

          </div>


          {/* PAYMENT */}

          <div>

            <h2 className="text-lg font-light text-stone-900 mb-5">
              Payment Options
            </h2>

            <div className="bg-white rounded-2xl border-2 border-stone-900 px-6 py-5">

              <div className="flex items-center gap-3 mb-2">

                <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center">

                  <div className="w-2 h-2 rounded-full bg-white" />

                </div>

                <span className="text-sm font-medium text-stone-800">
                  Cash on delivery
                </span>

              </div>

              <p className="text-xs text-stone-400 ml-8">
                Pay with cash upon delivery. Commande envoyee via WhatsApp.
              </p>

            </div>

          </div>


          {/* NOTE */}

          <div>

            <button
              onClick={() =>
                setForm({
                  ...form,
                  showNote: !form.showNote,
                })
              }
              className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition"
            >

              <div
                className={
                  'w-5 h-5 border-2 rounded flex items-center justify-center transition ' +
                  (
                    form.showNote
                      ? 'border-stone-900 bg-stone-900'
                      : 'border-stone-300'
                  )
                }
              >

                {form.showNote && (
                  <span className="text-white text-[10px]">
                    ✓
                  </span>
                )}

              </div>

              Add a note to your order

            </button>


            {form.showNote && (
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value,
                  })
                }
                placeholder="Instructions speciales pour votre commande..."
                className="mt-3 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-white resize-none"
              />
            )}

          </div>


          {/* TERMS */}

          <p className="text-xs text-stone-400">

            By proceeding with your purchase you agree to our{' '}

            <span className="underline cursor-pointer hover:text-stone-700">
              Terms and Conditions
            </span>

            {' '}and{' '}

            <span className="underline cursor-pointer hover:text-stone-700">
              Privacy Policy
            </span>

          </p>


          {/* BUTTONS */}

          <div className="flex items-center justify-between pt-2">

            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition"
            >
              ← Return to Cart
            </Link>


            <button
              onClick={handlePlaceOrderClick}
              disabled={placingOrder}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs tracking-[0.2em] uppercase px-10 py-4 rounded-full transition flex items-center gap-2"
            >

              <span>
                {placingOrder
                  ? '⏳'
                  : '📲'}
              </span>

              {placingOrder
                ? 'Creation...'
                : 'Place Order via WhatsApp'}

            </button>

          </div>

        </div>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="lg:col-span-1">

          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">

            <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-900 mb-6">
              Order summary
            </h2>


            {/* ITEMS */}

            <div className="flex flex-col gap-4 mb-6">

              {items.map((item) => (

                <div
                  key={item._id}
                  className="flex gap-3 items-start"
                >

                  <div className="relative flex-shrink-0">

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl"
                      onError={onImgError}
                    />

                    <span className="absolute -top-1.5 -right-1.5 bg-stone-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.qty}
                    </span>

                  </div>


                  <div className="flex-1 min-w-0">

                    <p className="text-xs font-medium text-stone-800 truncate">
                      {item.name}
                    </p>

                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.price}.00 MAD / pce
                    </p>

                  </div>


                  <span className="text-xs font-semibold text-stone-800 flex-shrink-0">
                    {(item.price * item.qty).toFixed(2)} MAD
                  </span>

                </div>

              ))}

            </div>


            {/* COUPON */}

            <div className="border-t border-stone-100 pt-4 mb-4">

              {promoApplied ? (

                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">

                  <div className="flex items-center gap-2">

                    <span className="text-green-600">
                      🎉
                    </span>

                    <span className="text-green-700 text-xs font-medium font-mono">
                      {promoApplied.code}
                    </span>

                    <span className="text-green-600 text-xs">
                      -{promoApplied.discount}%
                    </span>

                  </div>

                  <button
                    onClick={removePromo}
                    className="text-stone-400 hover:text-red-500 transition text-xs"
                  >
                    ✕
                  </button>

                </div>

              ) : (

                <>

                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        showCoupon: !form.showCoupon,
                      })
                    }
                    className="flex items-center justify-between w-full text-sm text-stone-600 hover:text-stone-900 transition"
                  >

                    <span>
                      Add coupons
                    </span>

                    <span>
                      {form.showCoupon
                        ? '∧'
                        : '∨'}
                    </span>

                  </button>


                  {form.showCoupon && (

                    <div className="flex gap-2 mt-3">

                      <input
                        type="text"
                        value={form.coupon}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            coupon:
                              e.target.value.toUpperCase(),
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCoupon()
                          }
                        }}
                        placeholder="Code promo"
                        className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-[#faf9f7] font-mono uppercase tracking-widest"
                      />

                      <button
                        onClick={handleCoupon}
                        disabled={promoLoading}
                        className="bg-stone-900 text-white text-xs px-4 py-2 rounded-xl hover:bg-stone-700 transition disabled:opacity-50"
                      >

                        {promoLoading
                          ? '...'
                          : 'OK'}

                      </button>

                    </div>

                  )}

                </>

              )}

            </div>


            {/* TOTALS */}

            <div className="border-t border-stone-100 pt-4 flex flex-col gap-3">

              <div className="flex justify-between text-sm text-stone-500">

                <span>
                  Subtotal
                </span>

                <span>
                  {subtotal.toFixed(2)} MAD
                </span>

              </div>


              {promoApplied && (

                <div className="flex justify-between text-sm text-green-600">

                  <span>
                    Remise ({promoApplied.discount}%)
                  </span>

                  <span className="font-medium">
                    -{discountAmount.toFixed(2)} MAD
                  </span>

                </div>

              )}


              {/* DELIVERY */}

              <div className="flex justify-between text-sm text-stone-500">

                <span>
                  Livraison
                </span>

                <span className="font-medium text-stone-800">
                  {deliveryFee.toFixed(2)} MAD
                </span>

              </div>


              {/* DELIVERY LABEL */}

              <div className="flex justify-between text-[11px] text-stone-400">

                <span>
                  {isSafi
                    ? 'Safi'
                    : 'Hors Safi'}
                </span>

                <span>
                  {isSafi
                    ? '10 DH'
                    : '35 DH'}
                </span>

              </div>


              {/* TOTAL */}

              <div className="flex justify-between font-semibold text-stone-900 text-sm border-t border-stone-100 pt-3">

                <span>
                  Total
                </span>

                <span>
                  {total.toFixed(2)} MAD
                </span>

              </div>

            </div>


            {/* WHATSAPP INFO */}

            <div className="mt-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">

              <span className="text-green-600 text-lg">
                📲
              </span>

              <p className="text-xs text-green-700">
                La commande sera enregistree et envoyee directement sur WhatsApp
              </p>

            </div>

          </div>

        </div>

      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirmer la commande ?"
        message={'Total : ' + total.toFixed(2) + ' MAD — vous serez redirige vers WhatsApp pour finaliser.'}
        confirmLabel="Confirmer"
        onConfirm={submitOrder}
        onCancel={function() { setShowConfirm(false) }}
      />

    </main>
  )
}