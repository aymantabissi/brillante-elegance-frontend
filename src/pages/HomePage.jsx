import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addToCart } from '../store/slices/cartSlice'
import { useSelector } from 'react-redux'
import { fetchProducts } from '../store/slices/productSlice'

const heroSlides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80', title: 'New Collection', subtitle: 'Summer 2025' },
  { id: 2, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80', title: 'Bijoux Exclusifs', subtitle: 'Elegance Intemporelle' },
  { id: 3, image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1600&q=80', title: 'Accessoires Premium', subtitle: 'Raffinement & Style' },
]

const stripImages = [
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&q=80',
  'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400&q=80',
  'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&q=80',
]

const categories = [
  { label: 'Colliers',  emoji: '📿', to: '/shop?cat=colliers' },
  { label: 'Bracelets', emoji: '💎', to: '/shop?cat=bracelets' },
  { label: 'Bagues',    emoji: '💍', to: '/shop?cat=bagues' },
  { label: 'Lunettes',  emoji: '🕶️', to: '/shop?cat=lunettes' },
  { label: 'Montres',   emoji: '⌚', to: '/shop?cat=montres' },
]



const testimonials = [
  { id: 1, name: 'Salma B.',   location: 'Casablanca', avatar: 'S', rating: 5, text: 'Qualite exceptionnelle ! Mon bracelet Vancleef est absolument magnifique. Livraison rapide et emballage soigne. Je recommande vivement !', product: 'Bracelet Vancleef' },
  { id: 2, name: 'Yasmine R.', location: 'Rabat',      avatar: 'Y', rating: 5, text: 'Je suis tombee amoureuse du collier Moonstone. La pierre est vraiment belle et la chaine tres solide. Service client au top !',           product: 'Collier Moonstone' },
  { id: 3, name: 'Nadia M.',   location: 'Marrakech',  avatar: 'N', rating: 5, text: "Commande recue en 2 jours, emballage luxueux. La bague est encore plus belle en vrai qu'en photo. Merci Brillante Elegance !",             product: 'Bague Elegante' },
  { id: 4, name: 'Amira K.',   location: 'Fes',        avatar: 'A', rating: 5, text: "Deuxieme commande chez Brillante et toujours aussi satisfaite. Les bijoux sont de tres bonne qualite pour le prix. J'adore !",              product: 'Pack Gold White' },
  { id: 5, name: 'Houda T.',   location: 'Agadir',     avatar: 'H', rating: 4, text: "Tres belle collection, j'ai commande les lunettes et le bracelet. Les deux sont parfaits. Livraison soignee et rapide.",                    product: 'Pack Lunettes + Bracelet' },
  { id: 6, name: 'Rim L.',     location: 'Tanger',     avatar: 'R', rating: 5, text: 'Service irreprochable ! Le collier perles est exactement comme sur les photos. Je fais souvent des cadeaux ici, tout le monde est ravi.',    product: 'Collier Perles' },
]

const instaImages = [
  'https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=400&q=80',
  'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
  'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80',
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&q=80',
]

const INSTAGRAM_URL = 'https://www.instagram.com/brillante_elegance?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='

function HeroSlider() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % heroSlides.length), 4500)
    return () => clearInterval(timer)
  }, [])
  const prev = () => setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length)
  const next = () => setCurrent((c) => (c + 1) % heroSlides.length)
  return (
    <div className="relative w-full h-[88vh] overflow-hidden">
      {heroSlides.map((slide, i) => (
        <div key={slide.id} className={'absolute inset-0 transition-opacity duration-1000 ' + (i === current ? 'opacity-100' : 'opacity-0')}>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <p className="text-xs tracking-[0.6em] uppercase mb-4 opacity-75">{slide.subtitle}</p>
            <h2 className="text-5xl md:text-7xl font-light tracking-[0.25em] uppercase mb-8">{slide.title}</h2>
            <Link to="/shop" className="border border-white text-white text-xs tracking-[0.35em] uppercase px-10 py-3.5 hover:bg-white hover:text-stone-900 transition duration-500">Decouvrir</Link>
          </div>
        </div>
      ))}
      <button onClick={prev} className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/35 backdrop-blur-sm text-white p-2.5 rounded-full transition"><ChevronLeft size={20} /></button>
      <button onClick={next} className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/35 backdrop-blur-sm text-white p-2.5 rounded-full transition"><ChevronRight size={20} /></button>
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={'h-1.5 rounded-full transition-all duration-500 ' + (i === current ? 'bg-white w-8' : 'bg-white/40 w-2')} />))}
      </div>
    </div>
  )
}

function CategoriesBar() {
  return (
    <section className="bg-white border-b border-stone-100 py-8">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 md:gap-12 flex-wrap px-4">
        {categories.map((cat) => (
          <Link key={cat.label} to={cat.to} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-2xl group-hover:bg-stone-800 transition duration-300">
              <span className="group-hover:scale-110 transition-transform duration-300 inline-block">{cat.emoji}</span>
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 group-hover:text-stone-800 transition">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function DealsBanner() {
  return (
    <div className="bg-black text-white py-5 text-center">
      <h2 className="text-2xl md:text-3xl font-bold tracking-wide">Hot Summer Deals</h2>
    </div>
  )
}

function ProductsStrip() {
  const images = [...stripImages, ...stripImages]
  return (
    <section className="bg-[#f9f8f6] py-12 overflow-hidden">
      <div className="flex gap-4 mb-4 w-max animate-scroll-left">
        {images.map((img, i) => (
          <div key={i} className="w-56 h-72 flex-shrink-0 overflow-hidden rounded-xl group cursor-pointer">
            <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 w-max animate-scroll-right">
        {[...images].reverse().map((img, i) => (
          <div key={i} className="w-56 h-52 flex-shrink-0 overflow-hidden rounded-xl group cursor-pointer">
            <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link to="/shop" className="inline-block border border-stone-800 text-stone-800 text-xs tracking-[0.3em] uppercase px-12 py-3.5 hover:bg-stone-800 hover:text-white transition">Voir tout</Link>
      </div>
    </section>
  )
}

function FeaturedCategories() {
  const cards = [
    { label: 'Necklaces',  title: 'Top Notch\nNecklaces',  image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&q=80', to: '/shop?cat=colliers' },
    { label: 'Bracelets',  title: 'Top\nBracelets',         image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', to: '/shop?cat=bracelets' },
    { label: 'Rings',      title: 'Elegant\nRings',         image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80', to: '/shop?cat=bagues' },
    { label: 'Sunglasses', title: 'Premium\nSunglasses',    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', to: '/shop?cat=lunettes' },
  ]
  return (
    <section className="bg-[#f9f8f6] py-16 px-4">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Explorez</p>
        <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-800">Nos Collections</h2>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="relative h-[480px] overflow-hidden rounded-2xl group block">
            <img src={card.image} alt={card.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/70 mb-2">{card.label}</p>
              <h3 className="text-2xl font-bold text-white leading-tight mb-5 whitespace-pre-line">{card.title}</h3>
              <span className="inline-block bg-white text-stone-900 text-[10px] tracking-[0.3em] uppercase px-6 py-2.5 rounded-full font-medium group-hover:bg-stone-900 group-hover:text-white transition duration-300">Shop Now</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function TrendingProducts() {
  const dispatch = useDispatch()
  const { items: products, loading } = useSelector((state) => state.products)
  const [addedId, setAddedId] = useState(null)

  useEffect(function() {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleAdd = (product) => {
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image && product.image.startsWith('http') ? product.image : 'https://via.placeholder.com/400',
      qty: 1,
    }))
    setAddedId(product._id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400'
    if (image.startsWith('http')) return image
    return 'https://via.placeholder.com/400'
  }

  // Show max 6 products
  const displayed = products.slice(0, 6)

  return (
    <section className="bg-white py-16 px-4">
      <div className="bg-black text-white text-center py-5 mb-10 rounded-xl mx-auto max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide">Trending Products</h2>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="w-full h-72 bg-stone-200 animate-pulse rounded-2xl" />
              <div className="mt-3 space-y-2">
                <div className="h-3 bg-stone-200 rounded-full animate-pulse w-2/3" />
                <div className="h-3 bg-stone-200 rounded-full animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {!loading && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((product) => (
            <div key={product._id} className="group relative cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 overflow-hidden">
                  <div className="flex gap-4 animate-scroll-left whitespace-nowrap w-max">
                    {Array(10).fill(null).map((_, i) => (
                      <span key={i} className="text-white text-[10px] tracking-wider flex items-center gap-1">
                        HOT SALE{product.discount}%OFF <span className="text-red-500">⚡</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">-{product.discount}%</span>
                  )}
                  {product.hot && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">HOT</span>
                  )}
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition">
                  <span className="text-stone-400 hover:text-red-400 transition text-sm">♡</span>
                </button>
                {/* Button yban dima f mobile — hover ghir f desktop */}
<div className="absolute bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300">
  <button
    onClick={() => handleAdd(product)}
    disabled={product.stock === 0}
    className={'w-full md:w-auto text-xs tracking-[0.2em] uppercase md:px-7 py-3 md:rounded-full font-medium shadow-lg transition duration-300 disabled:opacity-50 ' + (addedId === product._id ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 md:hover:bg-stone-900 md:hover:text-white')}
  >
    {product.stock === 0 ? 'Rupture' : addedId === product._id ? 'Ajoute !' : 'Add to Cart'}
  </button>
</div>
              </div>
              <div className="mt-3 px-1">
                <h3 className="text-sm font-medium text-stone-800 tracking-wide line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-stone-900 font-semibold text-sm">{product.price}.00 MAD</span>
                  {product.oldPrice > 0 && (
                    <span className="text-stone-400 text-xs line-through">{product.oldPrice}.00 MAD</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All */}
      {!loading && products.length > 6 && (
        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-block border border-stone-800 text-stone-800 text-xs tracking-[0.3em] uppercase px-10 py-3.5 hover:bg-stone-800 hover:text-white transition"
          >
            Voir tout — {products.length} produits
          </Link>
        </div>
      )}
    </section>
  )
}

function FeaturedProduct() {
  const dispatch = useDispatch()
  const [qty, setQty] = useState(1)
  const [wished, setWished] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    dispatch(addToCart({
      _id: 'featured-moonstone',
      name: 'Special Pack Silver Moonstone + Vancleef',
      price: 379,
      image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=80',
      qty,
    }))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <section className="bg-[#f5f3f0] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">A ne pas manquer</p>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-800">Coup de Coeur</h2>
        </div>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col lg:flex-row">
          <div className="lg:w-1/2 relative overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=80" alt="Featured Product" className="w-full h-[500px] lg:h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute top-5 left-5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">-16%</span>
          </div>
          <div className="lg:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4 mb-5">
              <h2 className="text-2xl md:text-3xl font-light text-stone-900 leading-snug">
                Special Pack Silver<br /><span className="font-medium">Moonstone + Vancleef</span>
              </h2>
              <button onClick={() => setWished(!wished)} className="text-2xl mt-1 transition-transform hover:scale-125">{wished ? '❤️' : '🤍'}</button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-semibold text-stone-900">379.00 MAD</span>
              <span className="text-stone-400 text-sm line-through">450.00 MAD</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">-16%</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              A delicate <strong className="text-stone-700">green moonstone</strong> pendant on a{' '}
              <strong className="text-stone-700">stainless steel chain</strong>, blending ethereal beauty with timeless elegance.
            </p>
            <p className="text-green-600 text-sm font-medium mb-6">In Stock</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm tracking-widest uppercase text-stone-500">Quantity</span>
              <div className="flex items-center border border-stone-200 rounded-full overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-lg">-</button>
                <span className="w-10 text-center text-sm font-medium text-stone-800">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition text-lg">+</button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleAddToCart} className={'w-full border-2 border-stone-900 text-xs tracking-[0.3em] uppercase py-4 rounded-2xl font-medium transition duration-300 ' + (added ? 'bg-stone-900 text-white' : 'text-stone-900 hover:bg-stone-900 hover:text-white')}>
                {added ? 'Ajoute au panier !' : 'Add to Cart'}
              </button>
              <button className="w-full bg-stone-900 text-white text-xs tracking-[0.3em] uppercase py-4 rounded-2xl font-medium hover:bg-stone-700 transition duration-300">Buy It Now</button>
            </div>
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs"><span>🚚</span> Livraison gratuite</div>
              <div className="flex items-center gap-1.5 text-stone-400 text-xs"><span>🔄</span> Retour 7 jours</div>
              <div className="flex items-center gap-1.5 text-stone-400 text-xs"><span>🔒</span> Paiement securise</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array(5).fill(null).map((_, i) => (
        <span key={i} className={'text-sm ' + (i < count ? 'text-amber-400' : 'text-stone-200')}>★</span>
      ))}
    </div>
  )
}

function Testimonials() {
  const [current, setCurrent] = useState(0)
  const total = testimonials.length
  const prev = () => setCurrent((c) => (c - 1 + total) % total)
  const next = () => setCurrent((c) => (c + 1) % total)
  useEffect(() => {
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [])
  const getVisible = () => {
    const items = []
    for (let i = 0; i < 3; i++) { items.push(testimonials[(current + i) % total]) }
    return items
  }
  return (
    <section className="bg-[#faf9f7] py-20 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Ils nous font confiance</p>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-800 mb-3">Nos Clients</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-0.5">{Array(5).fill(null).map((_, i) => <span key={i} className="text-amber-400 text-lg">★</span>)}</div>
            <span className="text-stone-500 text-sm">4.9 / 5 - base sur 200+ avis</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {getVisible().map((t, i) => (
            <div key={t.id} className={'bg-white rounded-2xl p-7 shadow-sm border border-stone-100 transition-all duration-500 ' + (i === 1 ? 'md:scale-105 shadow-md' : 'opacity-90')}>
              <div className="text-4xl text-stone-200 font-serif leading-none mb-3">"</div>
              <p className="text-stone-600 text-sm leading-relaxed mb-5">{t.text}</p>
              <span className="inline-block bg-stone-100 text-stone-500 text-[10px] tracking-widest uppercase px-3 py-1 rounded-full mb-5">{t.product}</span>
              <StarRating count={t.rating} />
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100">
                <div className="w-9 h-9 rounded-full bg-stone-800 text-white flex items-center justify-center text-sm font-medium">{t.avatar}</div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.location}</p>
                </div>
                <span className="ml-auto text-green-500 text-xs font-medium">Verifie</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition">&lsaquo;</button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={'h-1.5 rounded-full transition-all duration-300 ' + (i === current ? 'bg-stone-800 w-6' : 'bg-stone-300 w-2')} />))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition">&rsaquo;</button>
        </div>
      </div>
    </section>
  )
}

function WhyUs() {
  const items = [
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-12 h-12"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, title: '24/7 Customer Service', desc: "We're here to help you with any questions or concerns you have, 24/7." },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-12 h-12"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M9.5 12H7l2.5 3L12 9l2.5 6L17 12h-2.5"/></svg>, title: '14-Day Money Back', desc: "If you're not satisfied with your purchase, simply return it within 14 days for a refund." },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-12 h-12"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>, title: 'Our Guarantee', desc: 'We stand behind our products and services and guarantee your satisfaction.' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-12 h-12"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: 'Shipping Worldwide', desc: 'We ship our products worldwide, making them accessible to customers everywhere.' },
  ]
  return (
    <section className="bg-white">
      <div className="bg-black text-white text-center py-5">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide">Why Choose US</h2>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-stone-100">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center px-8 py-14 hover:bg-stone-50 transition duration-300 group">
            <div className="text-stone-800 mb-6 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
            <h3 className="text-sm font-medium text-stone-900 mb-3">{item.title}</h3>
            <p className="text-xs text-stone-400 leading-relaxed max-w-[180px]">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// Kopji had function o bdel InstagramSection f HomePage.jsx

function InstagramSection() {
  const { items: products } = useSelector(function(state) { return state.products })

  const realImages = products
    .filter(function(p) { return p.image && p.image.startsWith('http') })
    .slice(0, 5)

  const useReal = realImages.length >= 3

  const igSvg = (
    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition duration-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )

  const linkClass = function(i) {
    return 'relative overflow-hidden group flex-shrink-0 cursor-pointer ' + (i === 2 ? 'w-48 md:w-56 rounded-3xl' : 'w-44 md:w-48 rounded-2xl')
  }

  const overlay = (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-center justify-center">
      {igSvg}
    </div>
  )

  return (
    <section className="bg-white py-0">
      <div className="bg-black text-white text-center py-5">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide">Visit Our Instagram</h2>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex gap-4 justify-center flex-wrap md:flex-nowrap">
          {useReal
            ? realImages.map(function(product, i) {
                const id = product._id
                const src = product.image
                const name = product.name
                return (
                  <a key={id} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass(i)}>
                    <img src={src} alt={name} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
                    {overlay}
                  </a>
                )
              })
            : instaImages.map(function(img, i) {
                return (
                  <a key={i} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass(i)}>
                    <img src={img} alt={'instagram ' + (i + 1)} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
                    {overlay}
                  </a>
                )
              })
          }
        </div>
        <div className="text-center mt-8">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-10 py-3.5 rounded-full transition duration-300 shadow-md hover:shadow-lg"
          >
            Visit Our Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSent(true)
  }
  return (
    <section className="bg-stone-900 text-white py-20 px-4 text-center">
      <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-3">Restez informe</p>
      <h2 className="text-3xl font-light tracking-widest uppercase mb-2">Newsletter</h2>
      <p className="text-stone-400 text-sm mb-8">Recevez nos nouvelles collections et offres exclusives</p>
      {sent ? (
        <p className="text-stone-300 tracking-widest text-sm">Merci ! Vous etes inscrit.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="flex-1 bg-stone-800 border border-stone-700 text-white text-sm px-5 py-3 rounded-lg focus:outline-none focus:border-stone-400 placeholder:text-stone-500" />
          <button type="submit" className="bg-white text-stone-900 text-xs tracking-[0.2em] uppercase px-8 py-3 rounded-lg hover:bg-stone-200 transition">S'inscrire</button>
        </form>
      )}
    </section>
  )
}

export default function HomePage() {
  return (
    <main>
      <HeroSlider />
      <CategoriesBar />
      <DealsBanner />
      <ProductsStrip />
      <FeaturedCategories />
      <TrendingProducts />
      <FeaturedProduct />
      <Testimonials />
      <WhyUs />
      <InstagramSection />
      <Newsletter />
    </main>
  )
}