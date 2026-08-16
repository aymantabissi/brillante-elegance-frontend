import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { ChevronLeft, ShoppingBag, Heart, Share2, Zap } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { PLACEHOLDER_IMAGE, onImgError } from '../utils/imageFallback'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  const labels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent']
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(function(star) {
          const active = (hovered || value) >= star
          return (
            <button
              key={star}
              type="button"
              onClick={function() { if (onChange) onChange(star) }}
              onMouseEnter={function() { setHovered(star) }}
              onMouseLeave={function() { setHovered(0) }}
              className="text-3xl transition-transform hover:scale-110 active:scale-95"
            >
              <span className={active ? 'text-amber-400' : 'text-stone-200'}>★</span>
            </button>
          )
        })}
      </div>
      {(hovered || value) > 0 && (
        <p className="text-xs text-stone-500 mt-1">{labels[hovered || value]}</p>
      )}
    </div>
  )
}

function StarDisplay({ value, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1,2,3,4,5].map(function(s) {
          return <span key={s} className={'text-sm ' + (s <= Math.round(value) ? 'text-amber-400' : 'text-stone-200')}>★</span>
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-stone-400">({count} avis)</span>
      )}
    </div>
  )
}

function SkeletonProduct() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-stone-200 rounded-2xl" />
        <div className="flex flex-col gap-4 pt-2">
          <div className="h-3 bg-stone-200 rounded-full w-20" />
          <div className="h-7 bg-stone-200 rounded-full w-3/4" />
          <div className="h-4 bg-stone-200 rounded-full w-28" />
          <div className="h-8 bg-stone-200 rounded-full w-1/3" />
          <div className="h-16 bg-stone-200 rounded-xl" />
          <div className="h-12 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { id }    = useParams()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const [product,    setProduct]    = useState(null)
  const [reviews,    setReviews]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [qty,        setQty]        = useState(1)
  const [added,      setAdded]      = useState(false)
  const [wished,     setWished]     = useState(false)
  const [activeTab,  setActiveTab]  = useState('avis')

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null)

  const [form,       setForm]       = useState({ name: '', rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState('')

  const fetchAll = async function() {
    setLoading(true)
    try {
      const [pRes, rRes] = await Promise.all([
        api.get('/products/' + id),
        api.get('/reviews/' + id),
      ])
      setProduct(pRes.data)
      setReviews(rRes.data)

      if (pRes.data.hasVariants && pRes.data.variants?.length > 0) {
        setSelectedVariantIndex(0)
      } else {
        setSelectedVariantIndex(null)
      }
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(function() { fetchAll() }, [id])

  const activeVariant = (
    product?.hasVariants &&
    product.variants?.length > 0 &&
    selectedVariantIndex !== null
  ) ? product.variants[selectedVariantIndex] : null

  const displayPrice = activeVariant && Number(activeVariant.price) > 0
    ? activeVariant.price
    : product?.price

  const displayStock = activeVariant
    ? activeVariant.stock
    : product?.stock

  const displayImage = activeVariant && activeVariant.image
    ? activeVariant.image
    : product?.image

  const galleryImages = product
    ? [product.image, ...(product.images || [])].filter(Boolean).filter(function(img, i, arr) { return arr.indexOf(img) === i })
    : []

  const [selectedImage, setSelectedImage] = useState(null)
  const [zoomStyle,     setZoomStyle]     = useState({})

  useEffect(function() {
    setSelectedImage(displayImage)
  }, [displayImage])

  const handleImageMouseMove = function(e) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomStyle({ transformOrigin: x + '% ' + y + '%', transform: 'scale(2)' })
  }

  const handleImageMouseLeave = function() {
    setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' })
  }

  useEffect(function() {
    if (displayStock !== undefined && qty > displayStock) {
      setQty(Math.max(1, displayStock))
    }
  }, [selectedVariantIndex])

  // =====================================================
  // META PIXEL — helper pour envoyer AddToCart
  // =====================================================
  const trackAddToCart = function() {
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product._id],
        content_name: product.name + (activeVariant ? ' — ' + activeVariant.label : ''),
        content_type: 'product',
        value: displayPrice * qty,
        currency: 'MAD',
        contents: [{ id: product._id, quantity: qty }],
      })
    }
  }

  const handleAdd = function() {
    if (!product || displayStock === 0) return

    trackAddToCart()

    dispatch(addToCart({
      _id: product._id,
      name: product.name + (activeVariant ? ' — ' + activeVariant.label : ''),
      price: displayPrice,
      image: getImageUrl(displayImage),
      qty,
      variantLabel: activeVariant ? activeVariant.label : undefined,
    }))
    setAdded(true)
    setTimeout(function() { setAdded(false) }, 2000)
    toast.success(product.name + ' ajouté au panier !', { icon: '🛍️', style: toastStyle })
  }

  const handleBuyNow = function() {
    if (!product || displayStock === 0) return

    trackAddToCart()

    dispatch(addToCart({
      _id: product._id,
      name: product.name + (activeVariant ? ' — ' + activeVariant.label : ''),
      price: displayPrice,
      image: getImageUrl(displayImage),
      qty,
      variantLabel: activeVariant ? activeVariant.label : undefined,
    }))
    navigate('/checkout')
  }

  const handleSubmitReview = async function(e) {
    e.preventDefault()
    if (!form.name.trim())    return setFormError('Votre nom est requis')
    if (!form.rating)         return setFormError('Veuillez sélectionner une note')
    if (!form.comment.trim()) return setFormError('Veuillez écrire un commentaire')
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/reviews', { productId: id, ...form })
      toast.success('Votre avis a été publié !', { icon: '⭐', style: toastStyle })
      setForm({ name: '', rating: 0, comment: '' })
      fetchAll()
      setActiveTab('avis')
    } catch(e) {
      setFormError(e.response?.data?.message || 'Une erreur est survenue')
    }
    setSubmitting(false)
  }

  const getImageUrl = function(image) {
    if (!image) return PLACEHOLDER_IMAGE
    if (image.startsWith('http')) return image
    if (image.startsWith('/uploads')) return 'http://localhost:5000' + image
    return PLACEHOLDER_IMAGE
  }

  const avgRating  = product?.rating     || 0
  const numReviews = product?.numReviews || reviews.length

  if (loading) return <main className="min-h-screen bg-[#FAF9F7]"><SkeletonProduct /></main>

  if (!product) return (
    <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-stone-500 mb-4">Produit introuvable</p>
        <Link to="/shop" className="text-xs tracking-widest uppercase border border-stone-300 px-6 py-2.5 rounded-full text-stone-600 hover:bg-stone-50 transition">
          Retour à la boutique
        </Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ background: '#FAF9F7' }}>

      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/shop" className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition">
            <ChevronLeft size={16} />
            <span className="text-sm">Boutique</span>
          </Link>
          <p className="text-xs text-stone-400 capitalize">{product.category}</p>
          <button
            onClick={function() {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Lien copié !', { style: toastStyle })
            }}
            className="text-stone-400 hover:text-stone-700 transition"
            title="Partager"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          <div className="relative">
            <div
              className="rounded-2xl overflow-hidden bg-white shadow-sm aspect-square cursor-zoom-in"
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
            >
              <img
                src={getImageUrl(selectedImage || displayImage)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 ease-out"
                style={zoomStyle}
                onError={onImgError}
              />
            </div>
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.discount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">-{product.discount}%</span>
              )}
              {product.hot && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">POPULAIRE</span>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {galleryImages.map(function(img, i) {
                  const isActive = (selectedImage || displayImage) === img
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={function() { setSelectedImage(img) }}
                      className={'w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ' + (isActive ? 'border-stone-900' : 'border-stone-200 hover:border-stone-400')}
                    >
                      <img src={getImageUrl(img)} alt={product.name + ' ' + (i + 1)} className="w-full h-full object-cover" onError={onImgError} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col">

            <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 mb-2 capitalize">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-light text-stone-900 mb-3 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
              {product.name}
            </h1>

            <div className="mb-4">
              {numReviews > 0 ? (
                <StarDisplay value={avgRating} count={numReviews} />
              ) : (
                <p className="text-xs text-stone-400">Aucun avis pour le moment — soyez le premier !</p>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-semibold text-stone-900">{displayPrice} <span className="text-lg font-normal">MAD</span></span>
              {product.oldPrice > 0 && (
                <span className="text-lg text-stone-400 line-through">{product.oldPrice} MAD</span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-stone-500 leading-relaxed mb-5 border-l-2 border-stone-200 pl-4">
                {product.description}
              </p>
            )}

            {product.hasVariants && product.variants?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-stone-400 mb-2">
                  Choix :{' '}
                  <span className="text-stone-700 font-medium">
                    {activeVariant ? activeVariant.label : 'Sélectionnez une option'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(function(v, i) {
                    const isActive = selectedVariantIndex === i
                    const outOfStock = Number(v.stock) === 0
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={outOfStock}
                        onClick={function() { setSelectedVariantIndex(i); setQty(1) }}
                        title={outOfStock ? v.label + ' — rupture de stock' : v.label}
                        className={
                          'relative flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition ' +
                          (outOfStock
                            ? 'border-stone-100 text-stone-300 cursor-not-allowed line-through'
                            : isActive
                              ? 'border-stone-900 text-stone-900 bg-stone-50'
                              : 'border-stone-200 text-stone-600 hover:border-stone-400')
                        }
                      >
                        {v.image && (
                          <img
                            src={getImageUrl(v.image)}
                            alt={v.label}
                            className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                            onError={onImgError}
                          />
                        )}
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={'inline-flex items-center gap-1.5 text-xs font-medium mb-6 px-3 py-1.5 rounded-full w-fit ' + (displayStock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
              <span className={'w-1.5 h-1.5 rounded-full ' + (displayStock > 0 ? 'bg-green-500' : 'bg-red-500')} />
              {displayStock > 0 ? 'En stock (' + displayStock + ' disponibles)' : 'Rupture de stock'}
            </div>

            {displayStock > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                  <button onClick={function() { setQty(function(q) { return Math.max(1, q - 1) }) }} className="w-10 h-11 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition text-lg">−</button>
                  <span className="w-10 text-center text-sm font-semibold text-stone-800">{qty}</span>
                  <button onClick={function() { setQty(function(q) { return Math.min(displayStock, q + 1) }) }} className="w-10 h-11 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition text-lg">+</button>
                </div>
                <button
                  onClick={function() { setWished(!wished) }}
                  className={'w-11 h-11 rounded-xl border flex items-center justify-center transition ' + (wished ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300')}
                  title={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart size={16} className={wished ? 'fill-red-500' : ''} />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAdd}
                disabled={displayStock === 0}
                className={'w-full py-4 text-sm tracking-[0.2em] uppercase font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-stone-900 ' + (added ? 'bg-stone-900 text-white' : 'text-stone-900 hover:bg-stone-900 hover:text-white')}
              >
                <ShoppingBag size={16} />
                {displayStock === 0 ? 'Rupture de stock' : added ? '✓ Ajouté au panier !' : 'Ajouter au panier'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={displayStock === 0}
                className="w-full py-4 text-sm tracking-[0.2em] uppercase font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-stone-900 text-white hover:bg-stone-700"
              >
                <Zap size={16} />
                Commander maintenant
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-stone-100">
              {[
                { icon: '🚚', label: 'Livraison gratuite' },
                { icon: '🔄', label: 'Retour sous 7 jours' },
                { icon: '🔒', label: 'Paiement sécurisé' },
              ].map(function(b) {
                return (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1">
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-[10px] text-stone-400 leading-tight">{b.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">

          <div className="flex border-b border-stone-100">
            {[
              { key: 'avis',   label: 'Avis clients (' + numReviews + ')' },
              { key: 'ecrire', label: 'Laisser un avis' },
            ].map(function(tab) {
              return (
                <button
                  key={tab.key}
                  onClick={function() { setActiveTab(tab.key) }}
                  className={'flex-1 py-3.5 text-xs tracking-widest uppercase font-medium transition ' + (activeTab === tab.key ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600')}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'avis' && (
            <div className="p-5">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-stone-400 text-sm mb-4">Aucun avis pour le moment</p>
                  <button
                    onClick={function() { setActiveTab('ecrire') }}
                    className="text-xs tracking-widest uppercase border border-stone-300 px-6 py-2.5 rounded-full text-stone-600 hover:bg-stone-50 transition"
                  >
                    Soyez le premier à donner votre avis
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map(function(review) {
                    const date = new Date(review.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                    return (
                      <div key={review._id} className="flex gap-3 pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                        <div className="w-9 h-9 rounded-full bg-stone-800 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-stone-800">{review.name}</p>
                            <p className="text-[10px] text-stone-400 flex-shrink-0">{date}</p>
                          </div>
                          <div className="flex">
                            {[1,2,3,4,5].map(function(s) {
                              return <span key={s} className={'text-xs ' + (s <= review.rating ? 'text-amber-400' : 'text-stone-200')}>★</span>
                            })}
                          </div>
                          <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ecrire' && (
            <div className="p-5">
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-stone-400 block mb-1.5">Votre nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={function(e) { setForm({ ...form, name: e.target.value }) }}
                    placeholder="Ex : Salma B."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-2">Votre note *</label>
                  <StarPicker value={form.rating} onChange={function(r) { setForm({ ...form, rating: r }) }} />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1.5">Votre commentaire *</label>
                  <textarea
                    rows={4}
                    value={form.comment}
                    onChange={function(e) { setForm({ ...form, comment: e.target.value }) }}
                    placeholder="Décrivez votre expérience avec ce produit..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-stone-50 resize-none"
                  />
                </div>
                {formError && (
                  <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-stone-900 text-white text-xs tracking-[0.3em] uppercase py-4 rounded-2xl hover:bg-stone-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Publication en cours...' : 'Publier mon avis'}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}