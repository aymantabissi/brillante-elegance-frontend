import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo + Contact */}
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold tracking-[0.15em] text-stone-900 uppercase">Brillante</h3>
            <p className="text-[9px] tracking-[0.4em] uppercase text-stone-400">Élégance</p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-stone-600">
            <div className="flex gap-2">
              <span className="font-semibold text-stone-900 min-w-[70px]">Email :</span>
              <span>brillanteelegance@gmail.com</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-stone-900 min-w-[70px]">Téléphone :</span>
              <span>06 38 29 86 30</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-stone-900 min-w-[70px]">Adresse :</span>
              <span>Maroc, Casablanca</span>
            </div>
          </div>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-900 mb-5">Informations</h4>
          <ul className="flex flex-col gap-3">
            {['Contactez-nous', 'À propos', 'Commandes & Retours', 'FAQ'].map((item) => (
              <li key={item}>
                <Link to="/" className="text-sm text-stone-500 hover:text-stone-900 transition">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Shop */}
        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-900 mb-5">Boutique rapide</h4>
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Colliers', to: '/shop?cat=colliers' },
              { label: 'Bracelets', to: '/shop?cat=bracelets' },
              { label: 'Lunettes', to: '/shop?cat=lunettes' },
              { label: 'Promotions', to: '/shop?promo=true' },
            ].map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="text-sm text-stone-500 hover:text-stone-900 transition">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Services */}
        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-900 mb-5">Service client</h4>
          <ul className="flex flex-col gap-3">
            {['FAQ Commandes', 'Livraison', 'Politique de confidentialité', 'Retour & Remboursement'].map((item) => (
              <li key={item}>
                <Link to="/" className="text-sm text-stone-500 hover:text-stone-900 transition">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">2026 Brillante Élégance. Tous droits réservés.</p>
          <div className="flex items-center gap-2">
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold text-blue-700">VISA</span>
            </div>
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center gap-0.5">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-90"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-90 -ml-1"></div>
            </div>
            <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">AMEX</span>
            </div>
            <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold text-blue-800">PP</span>
            </div>
            <div className="w-10 h-6 bg-orange-400 rounded flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">DISC</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}