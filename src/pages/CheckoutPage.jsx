import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../store/slices/cartSlice'

const WHATSAPP_NUMBER = '212638298630' // nmrtek bla + o bla 0

export default function CheckoutPage() {
  const { items } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    note: '',
    showNote: false,
    coupon: '',
    showCoupon: false,
  })

  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0)
  const total = subtotal

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Prenom requis'
    if (!form.lastName.trim())  e.lastName  = 'Nom requis'
    if (!form.phone.trim())     e.phone     = 'Telephone requis'
    if (!form.city.trim())      e.city      = 'Ville requise'
    if (!form.address.trim())   e.address   = 'Adresse requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePlaceOrder = () => {
    if (!validate()) return

    // Build WhatsApp message
    const orderLines = items.map((item) =>
      `• ${item.name} x${item.qty} — ${(item.price * item.qty).toFixed(2)} MAD`
    ).join('\n')

    const message = `
🛍️ *NOUVELLE COMMANDE — Brillante Elegance*

👤 *Client:* ${form.firstName} ${form.lastName}
📞 *Tel:* ${form.phone}
📍 *Ville:* ${form.city}
🏠 *Adresse:* ${form.address}
${form.note ? '📝 *Note:* ' + form.note : ''}

*Produits:*
${orderLines}

💰 *Total: ${total.toFixed(2)} MAD*
💵 *Paiement:* Cash a la livraison

Merci ! 🙏
    `.trim()

    const encoded = encodeURIComponent(message)
    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encoded

    // Clear cart o open WhatsApp
    dispatch(clearCart())
    setSent(true)
    window.open(url, '_blank')
  }

  if (items.length === 0 && !sent) {
    return (
      <main className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">🛍️</div>
        <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-4">Panier vide</h2>
        <Link to="/shop" className="bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition">
          Continuer mes achats
        </Link>
      </main>
    )
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center text-center px-4">
        <div className="text-7xl mb-6">✅</div>
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

  return (
    <main className="bg-[#f9f8f6] min-h-screen">

      {/* Hero */}
      <div className="bg-[#f5f3f0] py-14 text-center">
        <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-stone-900 mb-4">Checkout</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition">Home</Link>
          <span>›</span>
          <Link to="/cart" className="hover:text-stone-700 transition">Panier</Link>
          <span>›</span>
          <span className="text-stone-600">Checkout</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Left Form ── */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Contact */}
          <div>
            <h2 className="text-lg font-light text-stone-900 mb-5">Contact Information</h2>
            <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4">
              <label className="text-xs text-stone-400 block mb-1">Email address</label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                className="w-full text-sm text-stone-700 focus:outline-none bg-transparent"
                placeholder="votre@email.com"
              />
            </div>
            <p className="text-xs text-stone-400 mt-2 ml-1">
              {user ? 'Connecte en tant que ' + user.name : 'You are currently checking out as a guest.'}
            </p>
          </div>

          {/* Billing Address */}
          <div>
            <h2 className="text-lg font-light text-stone-900 mb-5">Billing Address</h2>
            <div className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-col gap-4">

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Prenom *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' + (errors.firstName ? 'border-red-400' : 'border-stone-200 focus:border-stone-400')}
                    placeholder="Ayman"
                  />
                  {errors.firstName && <p className="text-red-400 text-[11px] mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' + (errors.lastName ? 'border-red-400' : 'border-stone-200 focus:border-stone-400')}
                    placeholder="Raisse"
                  />
                  {errors.lastName && <p className="text-red-400 text-[11px] mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs text-stone-400 block mb-1">Telephone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' + (errors.phone ? 'border-red-400' : 'border-stone-200 focus:border-stone-400')}
                  placeholder="+212 6XX XXX XXX"
                />
                {errors.phone && <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>}
              </div>

              {/* City */}
              <div>
                <label className="text-xs text-stone-400 block mb-1">Ville *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' + (errors.city ? 'border-red-400' : 'border-stone-200 focus:border-stone-400')}
                  placeholder="Casablanca"
                />
                {errors.city && <p className="text-red-400 text-[11px] mt-1">{errors.city}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-stone-400 block mb-1">Adresse complete *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={'w-full border rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none bg-[#faf9f7] transition ' + (errors.address ? 'border-red-400' : 'border-stone-200 focus:border-stone-400')}
                  placeholder="01 rue exemple, quartier, code postal"
                />
                {errors.address && <p className="text-red-400 text-[11px] mt-1">{errors.address}</p>}
              </div>

            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-lg font-light text-stone-900 mb-5">Payment Options</h2>
            <div className="bg-white rounded-2xl border-2 border-stone-900 px-6 py-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span className="text-sm font-medium text-stone-800">Cash on delivery</span>
              </div>
              <p className="text-xs text-stone-400 ml-8">
                Pay with cash upon delivery. Commande envoyee via WhatsApp.
              </p>
            </div>
          </div>

          {/* Note */}
          <div>
            <button
              onClick={() => setForm({ ...form, showNote: !form.showNote })}
              className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition"
            >
              <div className={'w-5 h-5 border-2 rounded flex items-center justify-center transition ' + (form.showNote ? 'border-stone-900 bg-stone-900' : 'border-stone-300')}>
                {form.showNote && <span className="text-white text-[10px]">✓</span>}
              </div>
              Add a note to your order
            </button>
            {form.showNote && (
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Instructions speciales pour votre commande..."
                className="mt-3 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-white resize-none"
              />
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-stone-400">
            By proceeding with your purchase you agree to our{' '}
            <span className="underline cursor-pointer hover:text-stone-700">Terms and Conditions</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-stone-700">Privacy Policy</span>
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link to="/cart" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition">
              ← Return to Cart
            </Link>
            <button
              onClick={handlePlaceOrder}
              className="bg-green-600 hover:bg-green-700 text-white text-xs tracking-[0.2em] uppercase px-10 py-4 rounded-full transition flex items-center gap-2"
            >
              <span>📲</span> Place Order via WhatsApp
            </button>
          </div>

        </div>

        {/* ── Right: Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
            <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-900 mb-6">Order summary</h2>

            <div className="flex flex-col gap-4 mb-6">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3 items-start">
                  <div className="relative flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                    <span className="absolute -top-1.5 -right-1.5 bg-stone-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{item.price}.00 MAD / pce</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-800 flex-shrink-0">
                    {(item.price * item.qty).toFixed(2)} MAD
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t border-stone-100 pt-4 mb-4">
              <button
                onClick={() => setForm({ ...form, showCoupon: !form.showCoupon })}
                className="flex items-center justify-between w-full text-sm text-stone-600 hover:text-stone-900 transition"
              >
                <span>Add coupons</span>
                <span>{form.showCoupon ? '∧' : '∨'}</span>
              </button>
              {form.showCoupon && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={form.coupon}
                    onChange={(e) => setForm({ ...form, coupon: e.target.value })}
                    placeholder="Code promo"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-[#faf9f7]"
                  />
                  <button className="bg-stone-900 text-white text-xs px-4 py-2 rounded-xl hover:bg-stone-700 transition">OK</button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-stone-100 pt-4 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between font-semibold text-stone-900 text-sm">
                <span>Total</span>
                <span>{total.toFixed(2)} MAD</span>
              </div>
            </div>

            {/* WhatsApp badge */}
            <div className="mt-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-green-600 text-lg">📲</span>
              <p className="text-xs text-green-700">
                La commande sera envoyee directement sur WhatsApp
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}