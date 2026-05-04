import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    category: '🛍️ Commandes',
    items: [
      {
        q: 'Comment passer une commande ?',
        a: 'Ajoutez les produits de votre choix au panier, puis cliquez sur "Passer la commande". Remplissez vos informations de livraison et confirmez via WhatsApp. Notre équipe vous contactera pour valider votre commande.',
      },
      {
        q: 'Comment suivre ma commande ?',
        a: 'Après confirmation de votre commande, notre équipe vous enverra un message WhatsApp avec les informations de suivi. Vous pouvez également nous contacter directement au 06 38 29 86 30.',
      },
      {
        q: 'Puis-je modifier ou annuler ma commande ?',
        a: 'Oui, vous pouvez modifier ou annuler votre commande dans les 24h suivant la confirmation. Contactez-nous immédiatement via WhatsApp ou par téléphone.',
      },
      {
        q: 'Puis-je commander plusieurs articles en même temps ?',
        a: 'Absolument ! Ajoutez tous les articles souhaités dans votre panier et passez une seule commande. Des frais de livraison uniques s\'appliquent quelle que soit la quantité.',
      },
    ],
  },
  {
    category: '🚚 Livraison',
    items: [
      {
        q: 'Quel est le délai de livraison ?',
        a: 'Nous livrons partout au Maroc en 24 à 48 heures ouvrables après confirmation de votre commande. Les livraisons sont effectuées par des transporteurs fiables.',
      },
      {
        q: 'La livraison est-elle gratuite ?',
        a: 'Oui ! Nous offrons la livraison gratuite sur toutes vos commandes partout au Maroc. Aucun minimum d\'achat requis.',
      },
      {
        q: 'Livrez-vous dans toutes les villes du Maroc ?',
        a: 'Oui, nous livrons dans toutes les villes et régions du Maroc, y compris les zones rurales. Contactez-nous si vous avez un doute concernant votre localité.',
      },
      {
        q: 'Comment sont emballés les colis ?',
        a: 'Chaque commande est soigneusement emballée dans un écrin luxueux avec du papier de soie. Vos bijoux sont protégés et prêts à être offerts en cadeau.',
      },
    ],
  },
  {
    category: '💳 Paiement',
    items: [
      {
        q: 'Quels modes de paiement acceptez-vous ?',
  a: 'Nous proposons deux modes de paiement : le paiement en espèces à la livraison (Cash on Delivery) et le virement bancaire via notre RIB. Pour le virement, contactez-nous sur WhatsApp afin de recevoir notre RIB et confirmer votre paiement avant expédition.',
},
     {
  q: 'Le paiement est-il sécurisé ?',
  a: 'Oui, les deux modes de paiement sont sécurisés. Le paiement à la livraison vous permet de vérifier votre commande avant de payer. Le virement bancaire est traité via un RIB officiel. Aucune information sensible n\'est partagée en ligne.',
},
      {
        q: 'Puis-je utiliser un code promo ?',
        a: 'Oui ! Entrez votre code promo dans le champ prévu à cet effet sur la page panier ou checkout. La remise sera automatiquement appliquée sur le montant total.',
      },
      {
        q: 'Y a-t-il des frais cachés ?',
        a: 'Non, aucun frais caché. Le prix affiché sur notre site est le prix final que vous payez. La livraison est gratuite et aucune taxe supplémentaire n\'est appliquée.',
      },
    ],
  },
  {
    category: '🔄 Retours & Remboursements',
    items: [
      {
        q: 'Puis-je retourner un article ?',
        a: 'Oui, nous acceptons les retours dans 24h suivant la réception de votre commande, à condition que le produit soit en parfait état, non porté et dans son emballage d\'origine.',
      },
      {
        q: 'Comment effectuer un retour ?',
        a: 'Contactez notre service client via WhatsApp au 06 38 29 86 30 en indiquant votre numéro de commande et la raison du retour. Nous vous guiderons pour la procédure.',
      },
      {
        q: 'Sous quel délai suis-je remboursé ?',
        a: 'Après réception et vérification du produit retourné, nous procédons au remboursement sous 3 à 5 jours ouvrables. Le remboursement s\'effectue via le même mode de paiement.',
      },
      {
        q: 'Les articles en promotion sont-ils retournables ?',
        a: 'Oui, les articles en promotion peuvent être retournés dans les mêmes conditions que les articles à prix plein, sous 7 jours après réception.',
      },
    ],
  },
  {
    category: '💎 Produits & Qualité',
    items: [
      {
        q: 'Quelle est la qualité des matériaux ?',
        a: 'Nous utilisons des matériaux soigneusement sélectionnés : acier inoxydable, plaqué or, argent, pierres naturelles et synthétiques. Chaque produit est contrôlé avant expédition.',
      },
      {
        q: 'Les bijoux sont-ils garantis ?',
        a: 'Oui, tous nos bijoux sont garantis 30 jours contre les défauts de fabrication. En cas de problème, nous procédons à un échange ou remboursement sans frais.',
      },
      {
        q: 'Les photos correspondent-elles aux vrais produits ?',
        a: 'Oui, toutes nos photos sont authentiques et représentent fidèlement les produits. De légères variations de couleur peuvent exister selon les paramètres de votre écran.',
      },
      {
        q: 'Comment entretenir mes bijoux ?',
        a: 'Évitez le contact avec l\'eau, les parfums et les produits chimiques. Rangez vos bijoux dans leur écrin. Nettoyez-les délicatement avec un chiffon doux pour conserver leur éclat.',
      },
    ],
  },
]

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'border-b border-stone-100 last:border-0 transition-all duration-200 ' + (open ? 'bg-stone-50/50' : '')}>
      <button
        onClick={function() { setOpen(!open) }}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className={'text-sm font-medium transition ' + (open ? 'text-stone-900' : 'text-stone-700')}>
          {question}
        </span>
        <ChevronDown
          size={16}
          className={'flex-shrink-0 text-stone-400 transition-transform duration-300 ' + (open ? 'rotate-180 text-stone-700' : '')}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-stone-500 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(null)

  return (
    <main className="min-h-screen" style={{ background: '#FAF9F7' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)' }} className="py-14 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #d4a574 0%, transparent 60%)' }} />
        <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-3 relative">Aide & Support</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.3em] uppercase text-white mb-4 relative" style={{ fontFamily: 'Georgia, serif' }}>
          FAQ
        </h1>
        <p className="text-stone-400 text-sm mb-4 relative">Questions fréquemment posées</p>
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 relative">
          <Link to="/" className="hover:text-stone-300 transition">Accueil</Link>
          <span>✦</span>
          <span className="text-stone-400">FAQ</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-5 relative">
          <div className="h-px w-16 bg-stone-600" />
          <span className="text-stone-600 text-xs">✦</span>
          <div className="h-px w-16 bg-stone-600" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Catégories rapides */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {faqs.map(function(section) {
            const active = activeCategory === section.category
            return (
              <button
                key={section.category}
                onClick={function() { setActiveCategory(active ? null : section.category) }}
                className={'px-4 py-2 rounded-full text-xs font-medium transition-all border ' + (active ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}
              >
                {section.category}
              </button>
            )
          })}
        </div>

        {/* Sections FAQ */}
        <div className="flex flex-col gap-6">
          {faqs
            .filter(function(s) { return !activeCategory || s.category === activeCategory })
            .map(function(section) {
              return (
                <div key={section.category}>
                  <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-500 mb-3 px-1">
                    {section.category}
                  </h2>
                  <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                    {section.items.map(function(item) {
                      return (
                        <AccordionItem
                          key={item.q}
                          question={item.q}
                          answer={item.a}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>

        {/* CTA contact */}
        <div className="mt-12 bg-white rounded-2xl border border-stone-100 p-8 text-center shadow-sm">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-light text-stone-800 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-stone-400 text-sm mb-6">Notre équipe est disponible 7j/7 pour vous aider.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/212638298630"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded-full transition"
            >
              <span>📲</span> WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded-full transition"
            >
              Formulaire contact
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}