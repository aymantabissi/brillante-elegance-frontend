import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { fetchProducts } from '../store/slices/productSlice'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import toast from 'react-hot-toast'

const categories = [
  { value: 'all',       label: 'Tous' },
  { value: 'colliers',  label: 'Colliers' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'bagues',    label: 'Bagues' },
  { value: 'lunettes',  label: 'Lunettes' },
  { value: 'montres',   label: 'Montres' },
  { value: 'Sacs',      label: 'Sacs' },
]

const sortOptions = [
  { value: 'default',    label: 'Par defaut' },
  { value: 'price-asc',  label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
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
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100">
      <div className="w-full h-52 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-stone-200 rounded-full animate-pulse w-full" />
        <div className="h-3 bg-stone-200 rounded-full animate-pulse w-3/4" />
        <div className="h-4 bg-stone-200 rounded-full animate-pulse w-1/3 mt-3" />
      </div>
    </div>
  )
}

function SkeletonSidebar() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
      <div className="h-3 bg-stone-200 rounded-full animate-pulse w-1/2 mb-5" />
      {Array(6).fill(null).map(function(_, i) {
        return <div key={i} className="h-9 bg-stone-100 rounded-xl animate-pulse mb-2" />
      })}
      <div className="mt-8 h-3 bg-stone-200 rounded-full animate-pulse w-1/2 mb-4" />
      <div className="h-2 bg-stone-200 rounded-full animate-pulse w-full" />
      <div className="flex justify-between mt-3">
        <div className="h-2 bg-stone-200 rounded-full animate-pulse w-12" />
        <div className="h-2 bg-stone-200 rounded-full animate-pulse w-12" />
      </div>
    </div>
  )
}

// ← Bdelt: props wishlist o toggleWishlist mn App.jsx
export default function ShopPage({ wishlist = [], toggleWishlist = function() {} }) {
  const dispatch = useDispatch()
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
    setAddedId(product._id)
    setTimeout(function() { setAddedId(null) }, 1500)
    toast.success(product.name + ' ajoute au panier !', {
      icon: '🛍️',
      style: toastStyle,
    })
  }

  const getImageUrl = function(image) {
    if (!image) return 'https://via.placeholder.com/400x400?text=No+Image'
    if (image.startsWith('http')) return image
    return 'https://via.placeholder.com/400x400?text=No+Image'
  }

  return (
    <main className="bg-[#f9f8f6] min-h-screen">

      {loading ? (
        <div className="bg-[#f5f3f0] py-14 text-center">
          <div className="h-3 bg-stone-200 rounded-full animate-pulse w-24 mx-auto mb-4" />
          <div className="h-10 bg-stone-200 rounded-full animate-pulse w-32 mx-auto mb-4" />
          <div className="h-3 bg-stone-200 rounded-full animate-pulse w-40 mx-auto" />
        </div>
      ) : (
        <div className="bg-[#f5f3f0] py-14 text-center">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Notre boutique</p>
          <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-stone-900 mb-4">Shop</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
            <Link to="/" className="hover:text-stone-700 transition">Home</Link>
            <span>›</span>
            <span className="text-stone-600">Shop</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            {loading ? (
              <div className="w-full h-12 bg-white border border-stone-200 rounded-xl animate-pulse" />
            ) : (
              <>
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={function(e) { setSearch(e.target.value) }}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition"
                />
                {search && (
                  <button onClick={function() { setSearch('') }} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                    <X size={14} />
                  </button>
                )}
              </>
            )}
          </div>

          {loading ? (
            <div className="w-44 h-12 bg-white border border-stone-200 rounded-xl animate-pulse" />
          ) : (
            <select
              value={sort}
              onChange={function(e) { setSort(e.target.value) }}
              className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400"
            >
              {sortOptions.map(function(o) {
                return <option key={o.value} value={o.value}>{o.label}</option>
              })}
            </select>
          )}

          <button
            onClick={function() { setShowFilters(!showFilters) }}
            className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 hover:border-stone-400 transition sm:hidden"
          >
            <SlidersHorizontal size={16} /> Filtres
          </button>
        </div>

        <div className="flex gap-8">

          <aside className={'flex-shrink-0 w-56 ' + (showFilters ? 'block' : 'hidden sm:block')}>
            {loading ? (
              <SkeletonSidebar />
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
                <div className="mb-7">
                  <h3 className="text-xs tracking-[0.3em] uppercase font-medium text-stone-900 mb-4">Categories</h3>
                  <div className="flex flex-col gap-2">
                    {categories.map(function(cat) {
                      return (
                        <button
                          key={cat.value}
                          onClick={function() { setCategory(cat.value) }}
                          className={'text-left text-sm px-3 py-2 rounded-xl transition ' + (category === cat.value ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800')}
                        >
                          {cat.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-7">
                  <h3 className="text-xs tracking-[0.3em] uppercase font-medium text-stone-900 mb-4">Prix max</h3>
                  <input
                    type="range" min={100} max={1000} step={10}
                    value={maxPrice}
                    onChange={function(e) { setMaxPrice(Number(e.target.value)) }}
                    className="w-full accent-stone-900"
                  />
                  <div className="flex justify-between text-xs text-stone-400 mt-2">
                    <span>100 MAD</span>
                    <span className="font-medium text-stone-700">{maxPrice} MAD</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs tracking-[0.3em] uppercase font-medium text-stone-900 mb-4">Promotions</h3>
                  <button
                    onClick={function() { setSort(sort === 'discount' ? 'default' : 'discount') }}
                    className={'w-full text-sm px-3 py-2 rounded-xl transition text-left ' + (sort === 'discount' ? 'bg-amber-500 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100')}
                  >
                    Meilleures promos
                  </button>
                </div>

                <button
                  onClick={function() { setCategory('all'); setSort('default'); setMaxPrice(1000); setSearch('') }}
                  className="w-full mt-6 text-xs tracking-widest uppercase text-stone-400 hover:text-stone-700 transition"
                >
                  Reinitialiser
                </button>
              </div>
            )}
          </aside>

          <div className="flex-1">

            {loading ? (
              <div className="h-4 bg-stone-200 rounded-full animate-pulse w-32 mb-5" />
            ) : (
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-stone-400">
                  <span className="font-medium text-stone-700">{filtered.length}</span> produits trouves
                </p>
                {wishlist.length > 0 && (
                  <Link to="/wishlist" className="text-xs text-red-400 hover:text-red-600 transition">
                    ❤️ {wishlist.length} favori{wishlist.length > 1 ? 's' : ''}
                  </Link>
                )}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(8).fill(null).map(function(_, i) {
                  return <SkeletonCard key={i} />
                })}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-stone-400 text-sm">Aucun produit trouve</p>
                <button
                  onClick={function() { setSearch(''); setCategory('all'); setMaxPrice(1000) }}
                  className="mt-4 text-xs text-stone-600 underline"
                >
                  Reinitialiser les filtres
                </button>
              </div>
            )}

            {!loading && paginated.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map(function(product) {
                  const pid = product._id
                  const isWished = wishlist.includes(pid)
                  return (
                    <div key={pid} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition duration-300 cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
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

                        <button
                          onClick={function(e) {
                            e.stopPropagation()
                            toggleWishlist(pid)
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition"
                        >
                          <span className={'text-xs transition ' + (isWished ? 'text-red-500' : 'text-stone-300')}>
                            {isWished ? '❤️' : '♡'}
                          </span>
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={function() { handleAdd(product) }}
                            disabled={product.stock === 0}
                            className={'w-full py-3 text-xs tracking-[0.2em] uppercase font-medium transition duration-300 disabled:opacity-50 ' + (addedId === pid ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 hover:bg-stone-900 hover:text-white')}
                          >
                            {product.stock === 0 ? 'Rupture' : addedId === pid ? 'Ajoute !' : 'Add to Cart'}
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
            )}

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
                      className={'w-9 h-9 rounded-xl text-sm transition ' + (currentPage === page ? 'bg-stone-900 text-white border border-stone-900' : 'border border-stone-200 text-stone-500 hover:bg-stone-100')}
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
                {(currentPage - 1) * productsPerPage + 1} — {Math.min(currentPage * productsPerPage, filtered.length)} sur {filtered.length} produits
              </p>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}