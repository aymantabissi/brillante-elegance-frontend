import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import api from '../services/api'
import toast from 'react-hot-toast'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

function StarRating({ value, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0)
  const s = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-xl'
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(function(star) {
        return (
          <button
            key={star}
            type="button"
            onClick={function() { if (onChange) onChange(star) }}
            onMouseEnter={function() { if (onChange) setHovered(star) }}
            onMouseLeave={function() { if (onChange) setHovered(0) }}
            className={s + ' transition ' + (onChange ? 'cursor-pointer' : 'cursor-default')}
          >
            <span className={(hovered || value) >= star ? 'text-amber-400' : 'text-stone-200'}>★</span>
          </button>
        )
      })}
    </div>
  )
}

function ReviewCard({ review }) {
  const date = new Date(review.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-800 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
            {review.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">{review.name}</p>
            <p className="text-xs text-stone-400">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>
      <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
    </div>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const dispatch = useDispatch()

  const [product,  setProduct]  = useState(null)
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [qty,      setQty]      = useState(1)
  const [added,    setAdded]    = useState(false)

  const [form, setForm] = useState({ name: '', rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState('')

  const fetchProduct = async function() {
    try {
      const res = await api.get('/products/' + id)
      setProduct(res.data)
    } catch(e) {
      console.error(e)
    }
  }

  const fetchReviews = async function() {
    try {
      const res = await api.get('/reviews/' + id)
      setReviews(res.data)
    } catch(e) {
      console.error(e)
    }
  }

  useEffect(function() {
    setLoading(true)
    Promise.all([fetchProduct(), fetchReviews()]).finally(function() {
      setLoading(false)
    })
  }, [id])

  const handleAdd = function() {
    if (!product) return
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty,
    }))
    setAdded(true)
    setTimeout(function() { setAdded(false) }, 2000)
    toast.success(product.name + ' ajoute au panier !', { icon: '🛍️', style: toastStyle })
  }

  const handleSubmitReview = async function(e) {
    e.preventDefault()
    if (!form.name.trim())    return setFormError('Votre nom est requis')
    if (!form.rating)         return setFormError('Selectionnez une note')
    if (!form.comment.trim()) return setFormError('Ecrivez un commentaire')

    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/reviews', {
        productId: id,
        name:      form.name,
        rating:    form.rating,
        comment:   form.comment,
      })
      toast.success('Avis publie !', { icon: '⭐', style: toastStyle })
      setForm({ name: '', rating: 0, comment: '' })
      fetchReviews()
      fetchProduct()
    } catch(e) {
      setFormError(e.response?.data?.message || 'Erreur')
    }
    setSubmitting(false)
  }

  const getImageUrl = function(image) {
    if (!image) return 'https://via.placeholder.com/600x600?text=No+Image'
    if (image.startsWith('http')) return image
    return 'https://via.placeholder.com/600x600?text=No+Image'
  }

  const avgRating = product?.rating || 0
  const numReviews = product?.numReviews || reviews.length

  if (loading) {
    return (
      <main className="bg-[#f9f8f6] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="w-full h-[500px] bg-stone-200 rounded-3xl animate-pulse" />
            <div className="flex flex-col gap-4">
              <div className="h-8 bg-stone-200 rounded-full animate-pulse w-3/4" />
              <div className="h-4 bg-stone-200 rounded-full animate-pulse w-1/2" />
              <div className="h-10 bg-stone-200 rounded-full animate-pulse w-1/3" />
              <div className="h-24 bg-stone-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="bg-[#f9f8f6] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-stone-500">Produit introuvable</p>
          <Link to="/shop" className="mt-4 inline-block text-xs text-stone-600 underline">Retour au shop</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#f9f8f6] min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-[#f5f3f0] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-stone-400">
            <Link to="/" className="hover:text-stone-700 transition">Home</Link>
            <span>›</span>
            <Link to="/shop" className="hover:text-stone-700 transition">Shop</Link>
            <span>›</span>
            <span className="text-stone-600 line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden bg-white">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
            </div>
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                -{product.discount}%
              </span>
            )}
            {product.hot && (
              <span className="absolute top-4 left-4 mt-8 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                HOT
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">

            <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-2 capitalize">{product.category}</p>
            <h1 className="text-3xl font-light text-stone-900 mb-4 leading-snug">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <StarRating value={Math.round(avgRating)} size="md" />
              <span className="text-sm text-stone-600 font-medium">{avgRating > 0 ? avgRating.toFixed(1) : '0'}</span>
              <span className="text-xs text-stone-400">({numReviews} avis)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-semibold text-stone-900">{product.price} MAD</span>
              {product.oldPrice > 0 && (
                <span className="text-lg text-stone-400 line-through">{product.oldPrice} MAD</span>
              )}
              {product.discount > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  -{product.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-stone-500 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Stock */}
            <p className={'text-sm font-medium mb-6 ' + (product.stock > 0 ? 'text-green-600' : 'text-red-500')}>
              {product.stock > 0 ? '✓ En stock (' + product.stock + ' disponibles)' : '✗ Rupture de stock'}
            </p>

            {/* Qty + Add */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-stone-200 rounded-full overflow-hidden">
                  <button
                    onClick={function() { setQty(function(q) { return Math.max(1, q - 1) }) }}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-lg"
                  >-</button>
                  <span className="w-10 text-center text-sm font-medium text-stone-800">{qty}</span>
                  <button
                    onClick={function() { setQty(function(q) { return Math.min(product.stock, q + 1) }) }}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-lg"
                  >+</button>
                </div>
                <button
                  onClick={handleAdd}
                  className={'flex-1 py-4 text-xs tracking-[0.3em] uppercase font-medium rounded-2xl transition duration-300 ' + (added ? 'bg-green-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-700')}
                >
                  {added ? '✓ Ajoute au panier !' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Trust */}
            <div className="flex items-center gap-6 pt-6 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs"><span>🚚</span> Livraison gratuite</div>
              <div className="flex items-center gap-1.5 text-stone-400 text-xs"><span>🔄</span> Retour 7 jours</div>
              <div className="flex items-center gap-1.5 text-stone-400 text-xs"><span>🔒</span> Paiement securise</div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-stone-200 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Reviews list */}
            <div>
              <h2 className="text-xl font-light tracking-widest uppercase text-stone-800 mb-2">
                Avis clients
              </h2>
              <p className="text-xs text-stone-400 mb-6">{numReviews} avis</p>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-stone-100">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-stone-400 text-sm">Soyez le premier a laisser un avis !</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map(function(review) {
                    return <ReviewCard key={review._id} review={review} />
                  })}
                </div>
              )}
            </div>

            {/* Review form */}
            <div>
              <h2 className="text-xl font-light tracking-widest uppercase text-stone-800 mb-2">
                Laisser un avis
              </h2>
              <p className="text-xs text-stone-400 mb-6">Partagez votre experience</p>

              <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-col gap-4">

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Votre nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={function(e) { setForm({ ...form, name: e.target.value }) }}
                    placeholder="Ex: Salma B."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-2">Note *</label>
                  <StarRating
                    value={form.rating}
                    onChange={function(r) { setForm({ ...form, rating: r }) }}
                    size="lg"
                  />
                  {form.rating > 0 && (
                    <p className="text-xs text-stone-400 mt-1">
                      {['', 'Tres mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][form.rating]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Commentaire *</label>
                  <textarea
                    rows={4}
                    value={form.comment}
                    onChange={function(e) { setForm({ ...form, comment: e.target.value }) }}
                    placeholder="Decrivez votre experience avec ce produit..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-red-500 text-xs">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-stone-900 text-white text-xs tracking-[0.3em] uppercase py-4 rounded-2xl hover:bg-stone-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Publication...' : 'Publier mon avis'}
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}