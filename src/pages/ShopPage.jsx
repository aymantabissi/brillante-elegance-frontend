import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { fetchProducts } from '../store/slices/productSlice'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const categories = [
  { value: 'all',       label: 'Tous' },
  { value: 'colliers',  label: 'Colliers' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'bagues',    label: 'Bagues' },
  { value: 'lunettes',  label: 'Lunettes' },
  { value: 'montres',   label: 'Montres' },
{ value: 'Sacs',   label: 'Sacs' },
]

const sortOptions = [
  { value: 'default',    label: 'Par defaut' },
  { value: 'price-asc',  label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
  { value: 'discount',   label: 'Meilleures promos' },
]

export default function ShopPage() {
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

  useEffect(function() {
    dispatch(fetchProducts())
  }, [dispatch])

  // Update category when URL param changes
  useEffect(function() {
    if (catParam) setCategory(catParam)
  }, [catParam])

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

  const handleAdd = function(product) {
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image.startsWith('/uploads')
        ? 'http://localhost:5000' + product.image
        : product.image,
      qty: 1,
    }))
    setAddedId(product._id)
    setTimeout(function() { setAddedId(null) }, 1500)
  }

  const getImageUrl = function(image) {
    if (!image) return 'https://via.placeholder.com/400x400?text=No+Image'
    if (image.startsWith('/uploads')) return 'http://localhost:5000' + image
    return image
  }

  return (
    <main className="bg-[#f9f8f6] min-h-screen">

      {/* Hero */}
      <div className="bg-[#f5f3f0] py-14 text-center">
        <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Notre boutique</p>
        <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-stone-900 mb-4">Shop</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition">Home</Link>
          <span>›</span>
          <span className="text-stone-600">Shop</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
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
          </div>

          <select
            value={sort}
            onChange={function(e) { setSort(e.target.value) }}
            className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400"
          >
            {sortOptions.map(function(o) {
              return <option key={o.value} value={o.value}>{o.label}</option>
            })}
          </select>

          <button
            onClick={function() { setShowFilters(!showFilters) }}
            className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 hover:border-stone-400 transition sm:hidden"
          >
            <SlidersHorizontal size={16} /> Filtres
          </button>
        </div>

        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className={'flex-shrink-0 w-56 ' + (showFilters ? 'block' : 'hidden sm:block')}>
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
          </aside>

          {/* Products Grid */}
          <div className="flex-1">

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-stone-400">
                <span className="font-medium text-stone-700">{filtered.length}</span> produits trouves
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(8).fill(null).map(function(_, i) {
                  return (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100">
                      <div className="w-full h-52 bg-stone-100 animate-pulse" />
                      <div className="p-4">
                        <div className="h-3 bg-stone-100 rounded animate-pulse mb-2" />
                        <div className="h-3 bg-stone-100 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty */}
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

            {/* Products */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(function(product) {
                  return (
                    <div key={product._id} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition duration-300 cursor-pointer">

                      <div className="relative overflow-hidden">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.discount > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              -{product.discount}%
                            </span>
                          )}
                          {product.hot && (
                            <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              HOT
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="bg-stone-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Rupture
                            </span>
                          )}
                        </div>

                        <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition">
                          <span className="text-stone-400 text-xs">♡</span>
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={function() { handleAdd(product) }}
                            disabled={product.stock === 0}
                            className={'w-full py-3 text-xs tracking-[0.2em] uppercase font-medium transition duration-300 disabled:opacity-50 ' + (addedId === product._id ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 hover:bg-stone-900 hover:text-white')}
                          >
                            {product.stock === 0 ? 'Rupture' : addedId === product._id ? 'Ajoute !' : 'Add to Cart'}
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
          </div>
        </div>
      </div>
    </main>
  )
}