import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import toast from 'react-hot-toast'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

export default function WishlistPage({ wishlist, toggleWishlist, products }) {

  const dispatch = useDispatch()

  const wishlistProducts = products.filter(function(p) {
    return wishlist.includes(p._id)
  })

  const handleAdd = function(product) {
    if (product.stock === 0) {
      toast.error('Produit en rupture de stock', { style: toastStyle })
      return
    }
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image && product.image.startsWith('http') ? product.image : 'https://via.placeholder.com/400',
      qty: 1,
    }))
    toast.success(product.name + ' ajoute au panier !', { icon: '🛍️', style: toastStyle })
  }

  const getImageUrl = function(image) {
    if (!image) return 'https://via.placeholder.com/400x400?text=No+Image'
    if (image.startsWith('http')) return image
    return 'https://via.placeholder.com/400x400?text=No+Image'
  }

  return (
    <main className="bg-[#f9f8f6] min-h-screen">

      {/* Hero */}
      <div className="bg-[#f5f3f0] py-14 text-center">
        <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Mes favoris</p>
        <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-stone-900 mb-4">Wishlist</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition">Home</Link>
          <span>›</span>
          <span className="text-stone-600">Wishlist</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Empty */}
        {wishlistProducts.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🤍</div>
            <h2 className="text-xl font-light text-stone-700 mb-2">Votre wishlist est vide</h2>
            <p className="text-stone-400 text-sm mb-8">Ajoutez des produits en cliquant sur le coeur</p>
            <Link
              to="/shop"
              className="inline-block bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition"
            >
              Decouvrir la boutique
            </Link>
          </div>
        )}

        {/* Products */}
        {wishlistProducts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-stone-400">
                <span className="font-medium text-stone-700">{wishlistProducts.length}</span> produit{wishlistProducts.length > 1 ? 's' : ''} dans vos favoris
              </p>
              <Link to="/shop" className="text-xs text-stone-500 hover:text-stone-800 transition underline">
                Continuer les achats
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistProducts.map(function(product) {
                const pid = product._id
                return (
                  <div key={pid} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.discount > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>
                        )}
                        {product.hot && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">HOT</span>
                        )}
                        {product.stock === 0 && (
                          <span className="bg-stone-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Rupture</span>
                        )}
                      </div>

                      {/* Remove from wishlist */}
                      <button
                        onClick={function() { toggleWishlist(pid) }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition"
                        title="Retirer des favoris"
                      >
                        <span className="text-xs text-red-500">❤️</span>
                      </button>

                      {/* Add to cart */}
                      <div className="absolute bottom-0 left-0 right-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
                        <button
                          onClick={function() { handleAdd(product) }}
                          disabled={product.stock === 0}
                          className="w-full py-3 text-xs tracking-[0.2em] uppercase font-medium transition duration-300 disabled:opacity-50 bg-white text-stone-900 hover:bg-stone-900 hover:text-white"
                        >
                          {product.stock === 0 ? 'Rupture' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-xs font-medium text-stone-800 mb-2 leading-snug line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900">{product.price} MAD</span>
                        {product.oldPrice > 0 && (
                          <span className="text-xs text-stone-400 line-through">{product.oldPrice} MAD</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add all to cart */}
            <div className="text-center mt-10">
              <button
                onClick={function() {
                  wishlistProducts
                    .filter(function(p) { return p.stock > 0 })
                    .forEach(function(p) { handleAdd(p) })
                }}
                className="inline-block bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition"
              >
                Tout ajouter au panier
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}