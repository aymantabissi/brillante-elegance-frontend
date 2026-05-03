import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { fetchProducts } from '../store/slices/productSlice'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Heart, ShoppingBag, ChevronDown, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

const categories = [
  { value: 'all',       label: 'Tous',      emoji: '✦' },
  { value: 'colliers',  label: 'Colliers',  emoji: '📿' },
  { value: 'bracelets', label: 'Bracelets', emoji: '💎' },
  { value: 'bagues',    label: 'Bagues',    emoji: '💍' },
  { value: 'lunettes',  label: 'Lunettes',  emoji: '🕶️' },
  { value: 'montres',   label: 'Montres',   emoji: '⌚' },
  { value: 'Sacs',      label: 'Sacs',      emoji: '👜' },
]

const sortOptions = [
  { value: 'default',    label: 'Par défaut' },
  { value: 'price-asc',  label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'discount',   label: 'Meilleures promos' },
]

const productsPerPage = 8

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="w-full aspect-square bg-stone-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-100 rounded-full animate-pulse w-full" />
        <div className="h-3 bg-stone-100 rounded-full animate-pulse w-2/3" />
        <div className="h-4 bg-stone-100 rounded-full animate-pulse w-1/3 mt-2" />
      </div>
    </div>
  )
}

export default function ShopPage({ wishlist = [], toggleWishlist = function() {} }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: products, loading } = useSelector((state) => state.products)
  const [searchParams] = useSearchParams()
  const catParam = searchParams.get('cat') || 'all'

  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState(catParam)
  const [sort,        setSort]        = useState('default')
  const [maxPrice,    setMaxPrice]    = useState(1000)
  const [showFilters, setShowFilters] = useState(false)
  const [addedId,     setAddedId]     = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sharedId,    setSharedId]    = useState(null)

  useEffect(function() { dispatch(fetchProducts()) }, [dispatch])
  useEffect(function() { if (catParam) setCategory(catParam) }, [catParam])
  useEffect(function() { setCurrentPage(1) }, [category, search, sort, maxPrice])

  const filtered = useMemo(function() {
    let list = [...products]
    if (category !== 'all') list = list.filter(function(p) { return p.category === category })
    if (search.trim())      list = list.filter(function(p) { return p.name.toLowerCase().includes(search.toLowerCase()) })
    list = list.filter(function(p) { return p.price <= maxPrice })
    if (sort === 'price-asc')  list.sort(function(a, b) { return a.price - b.price })
    if (sort === 'price-desc') list.sort(function(a, b) { return b.price - a.price })
    if (sort === 'discount')   list.sort(function(a, b) { return (b.discount || 0) - (a.discount || 0) })
    return list
  }, [products, category, search, sort, maxPrice])

  const totalPages = Math.ceil(filtered.length / productsPerPage)

  const paginated = useMemo(function() {
    const start = (currentPage - 1) * productsPerPage
    return filtered.slice(start, start + productsPerPage)
  }, [filtered, currentPage])

  const handleAdd = function(e, product) {
    e.stopPropagation()
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
    setAddedId(product._id)
    setTimeout(function() { setAddedId(null) }, 1500)
    toast.success(product.name + ' ajouté au panier !', { icon: '🛍️', style: toastStyle })
  }

  const handleShare = function(e, product) {
    e.stopPropagation()
    const url = window.location.origin + '/product/' + product._id
    navigator.clipboard.writeText(url).then(function() {
      setSharedId(product._id)
      setTimeout(function() { setSharedId(null) }, 2000)
      toast.success('Lien copié !', { icon: '🔗', style: toastStyle })
    }).catch(function() {
      // fallback
      toast.success('Lien copié !', { icon: '🔗', style: toastStyle })
    })
  }

  const getImageUrl = function(image) {
    if (!image) return 'https://via.placeholder.com/400x400?text=Aucune+image'
    if (image.startsWith('http')) return image
    return 'https://via.placeholder.com/400x400?text=Aucune+image'
  }

  return (
    <main className="min-h-screen" style={{ background: '#FAF9F7' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)' }} className="py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #d4a574 0%, transparent 50%), radial-gradient(circle at 80% 50%, #d4a574 0%, transparent 50%)' }} />
        <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-3 relative">Notre boutique</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.3em] uppercase text-white mb-4 relative" style={{ fontFamily: 'Georgia, serif' }}>
          Boutique
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 relative">
          <Link to="/" className="hover:text-stone-300 transition">Accueil</Link>
          <span>✦</span>
          <span className="text-stone-400">Boutique</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-5 relative">
          <div className="h-px w-16 bg-stone-600" />
          <span className="text-stone-600 text-xs">✦</span>
          <div className="h-px w-16 bg-stone-600" />
        </div>
      </div>

      {/* Catégories scroll */}
      <div className="bg-white border-b border-stone-100 overflow-x-auto">
        <div className="flex gap-1 px-4 py-3 w-max">
          {categories.map(function(cat) {
            const active = category === cat.value
            return (
              <button
                key={cat.value}
                onClick={function() { setCategory(cat.value) }}
                className={'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ' + (active ? 'bg-stone-900 text-white shadow-sm' : 'bg-stone-50 text-stone-600 hover:bg-stone-100')}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Barre de recherche et tri */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={function(e) { setSearch(e.target.value) }}
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition"
            />
            {search && (
              <button onClick={function() { setSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={function(e) { setSort(e.target.value) }}
              className="appearance-none bg-white border border-stone-200 rounded-xl pl-4 pr-8 py-2.5 text-sm text-stone-700 focus:outline-none focus:border-stone-400 cursor-pointer"
            >
              {sortOptions.map(function(o) {
                return <option key={o.value} value={o.value}>{o.label}</option>
              })}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <button
            onClick={function() { setShowFilters(!showFilters) }}
            className={'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm border transition ' + (showFilters ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400')}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs tracking-[0.3em] uppercase font-medium text-stone-500 mb-3">Prix maximum</h3>
              <input
                type="range" min={100} max={1000} step={10}
                value={maxPrice}
                onChange={function(e) { setMaxPrice(Number(e.target.value)) }}
                className="w-full accent-stone-900 mb-2"
              />
              <div className="flex justify-between text-xs text-stone-400">
                <span>100 MAD</span>
                <span className="font-semibold text-stone-700">{maxPrice} MAD</span>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={function() { setCategory('all'); setSort('default'); setMaxPrice(1000); setSearch(''); setShowFilters(false) }}
                className="w-full py-2.5 text-xs tracking-widest uppercase text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50 transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}

        {/* Barre de résultats */}
        <div className="flex items-center justify-between mb-5">
          {loading ? (
            <div className="h-3 bg-stone-200 rounded-full animate-pulse w-28" />
          ) : (
            <p className="text-xs text-stone-400">
              <span className="font-semibold text-stone-700">{filtered.length}</span> produit{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </p>
          )}
          {wishlist.length > 0 && (
            <Link to="/wishlist" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition">
              <Heart size={12} className="fill-red-400" />
              {wishlist.length} favori{wishlist.length > 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* Squelettes */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array(8).fill(null).map(function(_, i) {
              return <SkeletonCard key={i} />
            })}
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-stone-400 text-sm mb-4">Aucun produit trouvé</p>
            <button
              onClick={function() { setSearch(''); setCategory('all'); setMaxPrice(1000) }}
              className="text-xs tracking-widest uppercase text-stone-600 border border-stone-300 px-6 py-2.5 rounded-full hover:bg-stone-50 transition"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Grille des produits */}
        {!loading && paginated.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {paginated.map(function(product) {
              const pid     = product._id
              const isWished = wishlist.includes(pid)
              const isAdded  = addedId === pid
              const isShared = sharedId === pid
              return (
                <div
                  key={pid}
                  onClick={function() { navigate('/product/' + pid) }}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-square bg-stone-50">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.discount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>
                      )}
                      {product.hot && (
                        <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAIRE</span>
                      )}
                      {product.stock === 0 && (
                        <span className="bg-stone-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Épuisé</span>
                      )}
                    </div>

                    {/* Boutons top-right — favoris + share */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                      {/* Favoris */}
                      <button
                        onClick={function(e) { e.stopPropagation(); toggleWishlist(pid) }}
                        className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        title="Ajouter aux favoris"
                      >
                        <Heart
                          size={13}
                          className={'transition ' + (isWished ? 'fill-red-500 text-red-500' : 'text-stone-400')}
                        />
                      </button>

                      {/* Share */}
                      <button
                        onClick={function(e) { handleShare(e, product) }}
                        className={'w-7 h-7 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all ' + (isShared ? 'bg-green-500' : 'bg-white/90')}
                        title="Copier le lien"
                      >
                        <Share2
                          size={12}
                          className={isShared ? 'text-white' : 'text-stone-400'}
                        />
                      </button>
                    </div>

                    {/* Bouton panier — hover desktop */}
                    <div className="hidden md:block absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={function(e) { handleAdd(e, product) }}
                        disabled={product.stock === 0}
                        className={'w-full py-3 text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 ' + (isAdded ? 'bg-green-600 text-white' : 'bg-stone-900/95 text-white hover:bg-stone-800')}
                      >
                        {isAdded ? <>✓ Ajouté</> : <><ShoppingBag size={12} /> Ajouter au panier</>}
                      </button>
                    </div>

                    {/* Bouton panier — toujours visible mobile */}
                    <div className="md:hidden absolute bottom-0 left-0 right-0">
                      <button
                        onClick={function(e) { handleAdd(e, product) }}
                        disabled={product.stock === 0}
                        className={'w-full py-2.5 text-[10px] tracking-[0.15em] uppercase font-medium transition-colors disabled:opacity-50 ' + (isAdded ? 'bg-green-600 text-white' : 'bg-stone-900/90 text-white')}
                      >
                        {isAdded ? '✓ Ajouté' : 'Ajouter au panier'}
                      </button>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="p-3">
                    <h3 className="text-xs font-medium text-stone-800 mb-1 leading-snug line-clamp-2">{product.name}</h3>

                    {/* Étoiles */}
                    {product.numReviews > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <div className="flex">
                          {[1,2,3,4,5].map(function(s) {
                            return (
                              <span key={s} className={'text-[9px] ' + (s <= Math.round(product.rating || 0) ? 'text-amber-400' : 'text-stone-200')}>★</span>
                            )
                          })}
                        </div>
                        <span className="text-[9px] text-stone-400">({product.numReviews} avis)</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">{product.price} MAD</span>
                      {product.oldPrice > 0 && (
                        <span className="text-[11px] text-stone-400 line-through">{product.oldPrice} MAD</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={function() { setCurrentPage(function(p) { return Math.max(1, p - 1) }) }}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              &#8249;
            </button>
            {Array.from({ length: totalPages }, function(_, i) { return i + 1 }).map(function(page) {
              return (
                <button
                  key={page}
                  onClick={function() { setCurrentPage(page) }}
                  className={'w-9 h-9 rounded-xl text-sm transition ' + (currentPage === page ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-500 hover:bg-stone-100')}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={function() { setCurrentPage(function(p) { return Math.min(totalPages, p + 1) }) }}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              &#8250;
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-stone-400 mt-4">
            Affichage {(currentPage - 1) * productsPerPage + 1}–{Math.min(currentPage * productsPerPage, filtered.length)} sur {filtered.length} produit{filtered.length > 1 ? 's' : ''}
          </p>
        )}

      </div>
    </main>
  )
}