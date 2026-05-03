import { Link } from 'react-router-dom'

const stats = [
  { number: '5K+',  label: 'Clientes satisfaites' },
  { number: '200+', label: 'Produits exclusifs' },
  { number: '3+',   label: "Années d'expérience" },
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

const galleryImages = [
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
]

export default function AboutPage() {
  return (
    <main className="bg-white">

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)' }} className="py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #d4a574 0%, transparent 50%)' }} />
        <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-3 relative">Notre histoire</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.3em] uppercase text-white mb-4 relative" style={{ fontFamily: 'Georgia, serif' }}>
          À Propos
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 relative">
          <Link to="/" className="hover:text-stone-300 transition">Accueil</Link>
          <span>✦</span>
          <span className="text-stone-400">À Propos</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-5 relative">
          <div className="h-px w-16 bg-stone-600" />
          <span className="text-stone-600 text-xs">✦</span>
          <div className="h-px w-16 bg-stone-600" />
        </div>
      </div>

      {/* Histoire */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Texte */}
        <div className="order-2 lg:order-1">
          <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-3">Notre Histoire</p>
          <h2 className="text-2xl md:text-3xl font-light text-stone-900 leading-snug mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Des bijoux d'exception,<br />
            <span className="font-medium">livrés à votre porte</span>
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-4">
            Bienvenue chez <strong className="text-stone-800">Brillante Élégance</strong> — votre boutique en ligne dédiée aux bijoux tendance et raffinés, livrés partout au Maroc depuis Casablanca.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-4">
            Nous croyons que chaque détail compte. C'est pourquoi nous sélectionnons soigneusement des pièces qui allient élégance, style moderne et accessibilité. Découvrez notre collection exclusive de colliers, bagues, bracelets et accessoires, conçus pour sublimer votre look au quotidien.
          </p>
          <div className="bg-stone-50 border-l-2 border-stone-300 pl-4 py-3 mb-8 rounded-r-xl">
            <p className="text-stone-600 text-sm leading-relaxed">
              🚀 Livraison rapide · 💬 Service client réactif · ✨ Bijoux soigneusement sélectionnés
            </p>
            <p className="text-stone-700 text-sm font-medium mt-1">
              Brillante Élégance — <em>Because elegance looks good on you.</em>
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-block bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition duration-300"
          >
            Découvrir la boutique
          </Link>
        </div>

        {/* Image */}
        <div className="order-1 lg:order-2 relative">
          <div className="rounded-3xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80"
              alt="Brillante Élégance"
              className="w-full h-[400px] md:h-[480px] object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center border border-stone-100">
            <span className="text-2xl md:text-3xl font-bold text-stone-900">4.9</span>
            <div className="flex gap-0.5 my-1">
              {Array(5).fill(null).map(function(_, i) {
                return <span key={i} className="text-amber-400 text-sm">★</span>
              })}
            </div>
            <span className="text-xs text-stone-400">200+ avis</span>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)' }} className="py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #d4a574 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative">
          {stats.map(function(s) {
            return (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-light tracking-wider text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  {s.number}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400">{s.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-2">Ce qui nous définit</p>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>
            Nos Valeurs
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(function(v) {
            return (
              <div key={v.title} className="text-center group p-6 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition duration-300 bg-white">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {v.icon}
                </div>
                <h3 className="text-sm font-medium text-stone-900 mb-3 tracking-wide">{v.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{v.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Galerie */}
      <section className="bg-[#f9f8f6] py-16 px-4">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-2">Notre univers</p>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>
            La Collection
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {galleryImages.map(function(img, i) {
            return (
              <div key={i} className="overflow-hidden rounded-2xl group">
                <img
                  src={img}
                  alt={'collection ' + (i + 1)}
                  className="w-full h-64 md:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Promesse */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-2">Notre engagement</p>
            <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>
              Notre Promesse
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🎁', title: 'Emballage Luxueux', desc: 'Chaque commande est emballée avec soin dans un écrin digne des plus grandes maisons.' },
              { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Vos transactions sont entièrement sécurisées. Paiement à la livraison disponible.' },
              { icon: '💬', title: 'Support 24/7', desc: 'Une question ? Notre équipe est là pour vous répondre à tout moment.' },
            ].map(function(item) {
              return (
                <div key={item.title} className="bg-[#faf9f7] rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-sm font-medium text-stone-800 mb-2">{item.title}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)' }} className="py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #d4a574 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-3">Rejoignez-nous</p>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Prête à briller ?
          </h2>
          <p className="text-stone-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Explorez notre collection et trouvez la pièce parfaite qui vous ressemble.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-block bg-white text-stone-900 text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-100 transition duration-300 font-medium"
            >
              Découvrir la boutique
            </Link>
            <Link
              to="/contact"
              className="inline-block border border-stone-600 text-stone-300 text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:border-stone-400 hover:text-white transition duration-300"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}