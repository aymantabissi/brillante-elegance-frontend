import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart, updateQty, clearCart } from '../store/slices/cartSlice'
import { Trash2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

export default function CartPage() {
  const dispatch = useDispatch()
  const { items } = useSelector((state) => state.cart)

  const [promoCode,    setPromoCode]    = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const subtotal       = items.reduce((acc, i) => acc + i.price * i.qty, 0)
  const discountAmount = promoApplied ? Math.round(subtotal * promoApplied.discount / 100) : 0
  const afterDiscount  = subtotal - discountAmount
  const shipping       = afterDiscount > 300 ? 0 : 30
  const total          = afterDiscount + shipping

  const handlePromo = async function() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    try {
      const res = await api.post('/promos/validate', { code: promoCode.trim() })
      setPromoApplied({ code: res.data.code, discount: res.data.discount })
      toast.success(res.data.code + ' — -' + res.data.discount + '% de remise !', { icon: '🎉', style: toastStyle })
    } catch(e) {
      toast.error(e.response?.data?.message || 'Code invalide', { style: toastStyle })
      setPromoApplied(null)
    }
    setPromoLoading(false)
  }

  const removePromo = function() {
    setPromoApplied(null)
    setPromoCode('')
    toast('Code promo retire', { icon: '❌', style: toastStyle })
  }

  if (items.length === 0) {
    return (
      <main className="bg-[#f9f8f6] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">🛍️</div>
        <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-3">
          Panier vide
        </h2>
        <p className="text-stone-400 text-sm mb-8">
          Vous n'avez pas encore ajoute de produits.
        </p>
        <Link
          to="/shop"
          className="bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition"
        >
          Continuer mes achats
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-[#f9f8f6] min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-1">Votre selection</p>
          <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900">Mon Panier</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                onClick={function() { dispatch(clearCart()) }}
                className="text-xs text-stone-400 hover:text-red-500 tracking-widest uppercase transition"
              >
                Vider le panier
              </button>
            </div>

            {items.map(function(item) {
              return (
                <div key={item._id} className="bg-white rounded-2xl p-5 flex gap-5 items-center shadow-sm">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-stone-800 mb-1 truncate">{item.name}</h3>
                    <p className="text-stone-400 text-xs mb-3">{item.price}.00 MAD / piece</p>
                    <div className="flex items-center border border-stone-200 rounded-full w-fit overflow-hidden">
                      <button
                        onClick={function() {
                          if (item.qty === 1) dispatch(removeFromCart(item._id))
                          else dispatch(updateQty({ id: item._id, qty: item.qty - 1 }))
                        }}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-stone-800">{item.qty}</span>
                      <button
                        onClick={function() { dispatch(updateQty({ id: item._id, qty: item.qty + 1 })) }}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-stone-900">{(item.price * item.qty).toFixed(2)} MAD</span>
                    <button
                      onClick={function() { dispatch(removeFromCart(item._id)) }}
                      className="text-stone-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-7 shadow-sm sticky top-24">
              <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-900 mb-6">Resume</h2>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} MAD</span>
                </div>

                {/* Promo discount */}
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      Code <span className="font-mono font-bold">{promoApplied.code}</span>
                      <button onClick={removePromo} className="text-stone-300 hover:text-red-400 transition ml-1 text-xs">✕</button>
                    </span>
                    <span className="font-medium">-{discountAmount.toFixed(2)} MAD</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-stone-500">
                  <span>Livraison</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Gratuite' : shipping + ' MAD'}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-stone-400 bg-stone-50 rounded-lg px-3 py-2">
                    Livraison gratuite a partir de 300 MAD
                  </p>
                )}
                <div className="border-t border-stone-100 pt-3 flex justify-between font-medium text-stone-900">
                  <span>Total</span>
                  <span>{total.toFixed(2)} MAD</span>
                </div>
              </div>

              {/* Promo input */}
              {!promoApplied ? (
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={function(e) { setPromoCode(e.target.value.toUpperCase()) }}
                    onKeyDown={function(e) { if (e.key === 'Enter') handlePromo() }}
                    placeholder="Code promo"
                    className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-400 bg-[#faf9f7] font-mono uppercase tracking-widest"
                  />
                  <button
                    onClick={handlePromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl hover:bg-stone-700 transition disabled:opacity-50"
                  >
                    {promoLoading ? '...' : 'OK'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <span className="text-green-600 text-sm">🎉</span>
                  <span className="text-green-700 text-xs font-medium flex-1">
                    Code <span className="font-mono font-bold">{promoApplied.code}</span> applique — -{promoApplied.discount}%
                  </span>
                  <button onClick={removePromo} className="text-stone-400 hover:text-red-500 transition text-xs">✕</button>
                </div>
              )}

              <Link
                to="/checkout"
                state={{ promoApplied }}
                className="block w-full bg-stone-900 text-white text-xs tracking-[0.3em] uppercase text-center py-4 rounded-2xl hover:bg-stone-700 transition duration-300 mb-3"
              >
                Passer la commande
              </Link>
              <Link
                to="/shop"
                className="block w-full border border-stone-200 text-stone-600 text-xs tracking-[0.3em] uppercase text-center py-4 rounded-2xl hover:bg-stone-50 transition"
              >
                Continuer mes achats
              </Link>

              <div className="flex justify-center gap-4 mt-6 pt-5 border-t border-stone-100">
                <div className="flex items-center gap-1 text-stone-400 text-[11px]">
                  <span>🔒</span> Paiement securise
                </div>
                <div className="flex items-center gap-1 text-stone-400 text-[11px]">
                  <span>🚚</span> Livraison rapide
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}