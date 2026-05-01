import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart, updateQty, clearCart } from '../store/slices/cartSlice'
import { Trash2 } from 'lucide-react'

export default function CartPage() {
  const dispatch = useDispatch()
  const { items } = useSelector((state) => state.cart)

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0)
  const shipping = subtotal > 300 ? 0 : 30
  const total = subtotal + shipping

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

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-1">Votre sélection</p>
          <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900">
            Mon Panier
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Items List ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Clear cart */}
            <div className="flex justify-end">
              <button
                onClick={() => dispatch(clearCart())}
                className="text-xs text-stone-400 hover:text-red-500 tracking-widest uppercase transition"
              >
                Vider le panier
              </button>
            </div>

            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl p-5 flex gap-5 items-center shadow-sm">

                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-stone-800 mb-1 truncate">{item.name}</h3>
                  <p className="text-stone-400 text-xs mb-3">{item.price}.00 MAD / pièce</p>

                  {/* Qty */}
                  <div className="flex items-center border border-stone-200 rounded-full w-fit overflow-hidden">
                    <button
                      onClick={() => {
                        if (item.qty === 1) dispatch(removeFromCart(item._id))
                        else dispatch(updateQty({ id: item._id, qty: item.qty - 1 }))
                      }}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-stone-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => dispatch(updateQty({ id: item._id, qty: item.qty + 1 }))}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + Delete */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-stone-900">
                    {(item.price * item.qty).toFixed(2)} MAD
                  </span>
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-stone-300 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-7 shadow-sm sticky top-24">
              <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-900 mb-6">
                Résumé
              </h2>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} MAD</span>
                </div>
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

              {/* Promo code */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Code promo"
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                />
                <button className="bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl hover:bg-stone-700 transition">
                  OK
                </button>
              </div>

              {/* Checkout button */}
              <Link
                to="/checkout"
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

              {/* Trust */}
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