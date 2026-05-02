import { Link } from 'react-router-dom'

const stats = [
  { number: '5K+',  label: 'Clients satisfaits' },
  { number: '200+', label: 'Produits exclusifs' },
  { number: '3+',   label: 'Ans d\'expérience' },
  { number: '4.9',  label: 'Note moyenne' },
]

const values = [
  {
    icon: '💎',
    title: 'Qualité Premium',
    desc: 'Chaque pièce est soigneusement sélectionnée pour sa qualité et son raffinement. Nous ne proposons que le meilleur.',
  },
  {
    icon: '🚚',
    title: 'Livraison Rapide',
    desc: 'Livraison partout au Maroc en 24-48h. Vos bijoux arrivent dans un emballage luxueux, prêts à être offerts.',
  },
  {
    icon: '✨',
    title: 'Style Intemporel',
    desc: 'Des pièces qui traversent les tendances. Nos collections mêlent élégance classique et touches contemporaines.',
  },
  {
    icon: '🤝',
    title: 'Service Personnalisé',
    desc: 'Notre équipe est disponible 24/7 pour vous conseiller et répondre à toutes vos questions.',
  },
]

const teamImages = [
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',

  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
]

export default function AboutPage() {
  return (
    <main className="bg-white">

      {/* ── Hero Banner ── */}
      <div className="bg-[#f5f3f0] py-16 text-center">
        <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Qui sommes-nous</p>
        <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-stone-900 mb-4">
          About Us
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition">Home</Link>
          <span>›</span>
          <span className="text-stone-600">About Us</span>
        </div>
      </div>

      {/* ── Story Section ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div>
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-3">Notre Histoire</p>
          <h2 className="text-3xl font-light text-stone-900 leading-snug mb-6">
            Exceptional Jewelry,<br />
            <span className="font-medium">Delivered To Your Door</span>
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-5">
            Bienvenue chez <strong className="text-stone-800">Brillante Elegance</strong> — votre boutique en ligne dédiée aux bijoux tendance et raffinés, livrés partout au Maroc depuis Casablanca.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-5">
            Nous croyons que chaque détail compte. C'est pourquoi nous sélectionnons soigneusement des pièces qui allient élégance, style moderne et accessibilité. Découvrez notre collection exclusive de colliers, bagues, bracelets et accessoires, conçus pour sublimer votre look au quotidien.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-8">
            🚀 Livraison rapide · 💬 Service client réactif · ✨ Bijoux soigneusement sélectionnés.<br />
            <strong className="text-stone-700">Brillante Elegance — Because elegance looks good on you.</strong>
          </p>
          <Link
            to="/shop"
            className="inline-block bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition duration-300"
          >
            Découvrir la boutique
          </Link>
        </div>

        {/* Image */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80"
            alt="About Brillante Elegance"
            className="w-full h-[480px] object-cover rounded-3xl"
          />
          <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center">
            <span className="text-3xl font-bold text-stone-900">4.9</span>
            <div className="flex gap-0.5 my-1">
              {Array(5).fill(null).map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <span className="text-xs text-stone-400">200+ avis</span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-stone-900 text-white py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-6">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-light tracking-wider mb-2">{s.number}</p>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Ce qui nous définit</p>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900">Nos Valeurs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v) => (
            <div key={v.title} className="text-center group p-6 rounded-2xl hover:bg-stone-50 transition duration-300">
              <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">
                {v.icon}
              </div>
              <h3 className="text-sm font-medium text-stone-900 mb-3 tracking-wide">{v.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="bg-[#f9f8f6] py-16 px-6">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Notre univers</p>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900">La Collection</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {teamImages.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-2xl group">
              <img
                src={img}
                alt={'gallery ' + (i + 1)}
                className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center bg-white">
        <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-3">Rejoignez-nous</p>
        <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900 mb-5">
          Prete a briller ?
        </h2>
        <p className="text-stone-400 text-sm mb-8 max-w-md mx-auto">
          Explorez notre collection et trouvez la pièce parfaite qui vous ressemble.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-12 py-4 rounded-full hover:bg-stone-700 transition duration-300"
        >
          Shop Now
        </Link>
      </section>

    </main>
  )
}