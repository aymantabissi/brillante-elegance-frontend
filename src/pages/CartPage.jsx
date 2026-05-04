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
  const total          = subtotal - discountAmount

  const handlePromo = async function() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    try {
      // Pass product IDs bach backend ychek ila code valable lihom
      const productIds = items.map(function(i) { return i._id })
      const res = await api.post('/promos/validate', {
        code: promoCode.trim(),
        productIds,
      })
      setPromoApplied({ code: res.data.code, discount: res.data.discount, products: res.data.products })

      // Message selon scope
      const hasSpecific = res.data.products && res.data.products.length > 0
      if (hasSpecific) {
        toast.success(res.data.code + ' — -' + res.data.discount + '% sur les produits éligibles !', { icon: '🎉', style: toastStyle })
      } else {
        toast.success(res.data.code + ' — -' + res.data.discount + '% sur tout le panier !', { icon: '🎉', style: toastStyle })
      }
    } catch(e) {
      toast.error(e.response?.data?.message || 'Code invalide', { style: toastStyle })
      setPromoApplied(null)
    }
    setPromoLoading(false)
  }

  const removePromo = function() {
    setPromoApplied(null)
    setPromoCode('')
    toast('Code promo retiré', { icon: '❌', style: toastStyle })
  }

  // Calcul discount — si produits spécifiques, appliquer seulement sur eux
  const getDiscountAmount = function() {
    if (!promoApplied) return 0
    const hasSpecific = promoApplied.products && promoApplied.products.length > 0
    if (hasSpecific) {
      // Discount seulement sur les produits éligibles
      const eligibleIds = promoApplied.products.map(function(p) { return p.toString() })
      const eligibleSubtotal = items
        .filter(function(i) { return eligibleIds.includes(i._id.toString()) })
        .reduce(function(acc, i) { return acc + i.price * i.qty }, 0)
      return Math.round(eligibleSubtotal * promoApplied.discount / 100)
    }
    return Math.round(subtotal * promoApplied.discount / 100)
  }

  const finalDiscount = getDiscountAmount()
  const finalTotal    = subtotal - finalDiscount

  if (items.length === 0) {
    return (
      <main className="bg-[#f9f8f6] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">🛍️</div>
        <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 mb-3">Panier vide</h2>
        <p className="text-stone-400 text-sm mb-8">Vous n'avez pas encore ajouté de produits.</p>
        <Link to="/shop" className="bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition">
          Continuer mes achats
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-[#f9f8f6] min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-1">Votre sélection</p>
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
              // Marquer produits éligibles au promo
              const isEligible = promoApplied && promoApplied.products && promoApplied.products.length > 0
                ? promoApplied.products.map(function(p) { return p.toString() }).includes(item._id.toString())
                : !!promoApplied

              return (
                <div key={item._id} className={'bg-white rounded-2xl p-5 flex gap-5 items-center shadow-sm transition ' + (promoApplied && isEligible ? 'ring-1 ring-green-200' : '')}>
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {promoApplied && isEligible && (
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        -{promoApplied.discount}%
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-stone-800 mb-1 truncate">{item.name}</h3>
                    <p className="text-stone-400 text-xs mb-3">{item.price}.00 MAD / pièce</p>
                    <div className="flex items-center border border-stone-200 rounded-full w-fit overflow-hidden">
                      <button
                        onClick={function() {
                          if (item.qty === 1) dispatch(removeFromCart(item._id))
                          else dispatch(updateQty({ id: item._id, qty: item.qty - 1 }))
                        }}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-sm"
                      >−</button>
                      <span className="w-8 text-center text-sm font-medium text-stone-800">{item.qty}</span>
                      <button
                        onClick={function() { dispatch(updateQty({ id: item._id, qty: item.qty + 1 })) }}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-sm"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-stone-900">{(item.price * item.qty).toFixed(2)} MAD</span>
                    <button onClick={function() { dispatch(removeFromCart(item._id)) }} className="text-stone-300 hover:text-red-500 transition">
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
              <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-900 mb-6">Résumé</h2>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} MAD</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1 flex-wrap">
                      <span className="font-mono font-bold">{promoApplied.code}</span>
                      {promoApplied.products && promoApplied.products.length > 0 && (
                        <span className="text-[10px] text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full">
                          {promoApplied.products.length} produit{promoApplied.products.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <button onClick={removePromo} className="text-stone-300 hover:text-red-400 transition ml-1 text-xs">✕</button>
                    </span>
                    <span className="font-medium">-{finalDiscount.toFixed(2)} MAD</span>
                  </div>
                )}

                <div className="border-t border-stone-100 pt-3 flex justify-between font-medium text-stone-900">
                  <span>Total</span>
                  <span>{finalTotal.toFixed(2)} MAD</span>
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
                  <div className="flex-1 min-w-0">
                    <p className="text-green-700 text-xs font-medium">
                      Code <span className="font-mono font-bold">{promoApplied.code}</span> — -{promoApplied.discount}%
                    </p>
                    {promoApplied.products && promoApplied.products.length > 0 && (
                      <p className="text-green-500 text-[10px] mt-0.5">
                        Valable sur {promoApplied.products.length} produit{promoApplied.products.length > 1 ? 's' : ''} spécifique{promoApplied.products.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <button onClick={removePromo} className="text-stone-400 hover:text-red-500 transition text-xs flex-shrink-0">✕</button>
                </div>
              )}

              <Link
                to="/checkout"
                state={{ promoApplied: promoApplied ? { ...promoApplied, discountAmount: finalDiscount } : null }}
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
                  <span>🔒</span> Paiement sécurisé
                </div>
                <div className="flex items-center gap-1 text-stone-400 text-[11px]">
                  <span>🚚</span> Livraison gratuite
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}