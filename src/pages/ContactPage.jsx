import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, Instagram } from 'lucide-react'

const WHATSAPP_NUMBER = '212638298630'
const INSTAGRAM_URL   = 'https://www.instagram.com/brillante_elegance'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]  = useState(false)

  const handleSubmit = function(e) {
    e.preventDefault()

    // Envoyer via WhatsApp
    const message = [
      '📩 *Nouveau message — Brillante Élégance*',
      '',
      '👤 *Nom :* ' + form.name,
      '📧 *Email :* ' + form.email,
      '📌 *Sujet :* ' + (form.subject || 'Aucun'),
      '',
      '💬 *Message :*',
      form.message,
    ].join('\n')

    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message)
    window.open(url, '_blank')

    setSent(true)
    setTimeout(function() { setSent(false) }, 4000)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  const infos = [
    {
      icon: <Phone size={18} />,
      title: 'Téléphone / WhatsApp',
      value: '+212 638 298 630',
      link: 'https://wa.me/' + WHATSAPP_NUMBER,
    },
    {
      icon: <MapPin size={18} />,
      title: 'Localisation',
      value: 'Casablanca, Maroc',
      link: null,
    },
    {
      icon: <Clock size={18} />,
      title: 'Disponibilité',
      value: 'Tous les jours — 9h à 22h',
      link: null,
    },
    {
      icon: <Instagram size={18} />,
      title: 'Instagram',
      value: '@brillante_elegance',
      link: INSTAGRAM_URL,
    },
  ]

  return (
    <main className="bg-[#faf9f7] min-h-screen">

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)' }} className="py-14 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #d4a574 0%, transparent 50%)' }} />
        <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-3 relative">Nous écrire</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.3em] uppercase text-white mb-4 relative" style={{ fontFamily: 'Georgia, serif' }}>
          Contact
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 relative">
          <Link to="/" className="hover:text-stone-300 transition">Accueil</Link>
          <span>✦</span>
          <span className="text-stone-400">Contact</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-5 relative">
          <div className="h-px w-16 bg-stone-600" />
          <span className="text-stone-600 text-xs">✦</span>
          <div className="h-px w-16 bg-stone-600" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Infos contact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {infos.map(function(info) {
            const inner = (
              <div className="bg-white rounded-2xl p-5 border border-stone-100 text-center hover:shadow-sm hover:border-stone-200 transition duration-300 h-full flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-600 flex-shrink-0">
                  {info.icon}
                </div>
                <p className="text-[10px] tracking-widest uppercase text-stone-400">{info.title}</p>
                <p className="text-xs font-medium text-stone-700 leading-snug text-center">{info.value}</p>
              </div>
            )
            return info.link ? (
              <a key={info.title} href={info.link} target="_blank" rel="noopener noreferrer" className="block">
                {inner}
              </a>
            ) : (
              <div key={info.title}>{inner}</div>
            )
          })}
        </div>

        {/* Form + image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Formulaire */}
          <div className="bg-white rounded-3xl border border-stone-100 p-6 md:p-8 shadow-sm">
            <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-2">Formulaire</p>
            <h2 className="text-2xl font-light text-stone-900 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              Envoyez-nous un message
            </h2>
            <p className="text-stone-400 text-xs mb-7">Nous vous répondrons dans les plus brefs délais via WhatsApp.</p>

            {sent && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                <span>✅</span> Message envoyé avec succès ! Nous vous contactons bientôt.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-400 block mb-1.5">Votre nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Salma B."
                    value={form.name}
                    onChange={function(e) { setForm({ ...form, name: e.target.value }) }}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-stone-50 transition placeholder:text-stone-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1.5">Votre email *</label>
                  <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={function(e) { setForm({ ...form, email: e.target.value }) }}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-stone-50 transition placeholder:text-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Sujet</label>
                <input
                  type="text"
                  placeholder="Ex : Question sur ma commande"
                  value={form.subject}
                  onChange={function(e) { setForm({ ...form, subject: e.target.value }) }}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-stone-50 transition placeholder:text-stone-300"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Votre message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Décrivez votre demande..."
                  value={form.message}
                  onChange={function(e) { setForm({ ...form, message: e.target.value }) }}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-stone-50 transition placeholder:text-stone-300 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-white text-xs tracking-[0.3em] uppercase py-4 rounded-2xl hover:bg-stone-700 transition duration-300 flex items-center justify-center gap-2"
              >
                <span>📲</span> Envoyer via WhatsApp
              </button>

              <p className="text-center text-[10px] text-stone-400">
                Votre message sera envoyé directement sur notre WhatsApp
              </p>
            </form>
          </div>

          {/* Image + FAQ */}
          <div className="flex flex-col gap-6">
            <div className="hidden lg:block rounded-3xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80"
                alt="Contact Brillante Élégance"
                className="w-full h-72 object-cover"
              />
            </div>

            {/* FAQ rapide */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
              <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700 mb-5">Questions fréquentes</h3>
              <div className="flex flex-col gap-4">
                {[
                  { q: 'Quel est le délai de livraison ?', r: '24 à 48h partout au Maroc.' },
                  { q: 'Comment passer une commande ?', r: 'Ajoutez au panier et validez votre commande. Nous vous contactons via WhatsApp.' },
                  { q: 'Puis-je retourner un article ?', r: 'Oui, sous 7 jours après réception si le produit est en parfait état.' },
                  { q: 'Acceptez-vous les paiements en ligne ?', r: 'Nous acceptons le paiement cash à la livraison (CRBT).' },
                ].map(function(item) {
                  return (
                    <div key={item.q} className="border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-stone-800 mb-1">❓ {item.q}</p>
                      <p className="text-xs text-stone-400 leading-relaxed">{item.r}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA WhatsApp */}
      <section className="bg-white py-12 px-4 text-center border-t border-stone-100">
        <p className="text-xs text-stone-400 mb-3">Préférez-vous nous contacter directement ?</p>
        <a
          href={'https://wa.me/' + WHATSAPP_NUMBER}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs tracking-[0.2em] uppercase px-10 py-4 rounded-full transition duration-300 shadow-md"
        >
          <span>📲</span> Discuter sur WhatsApp
        </a>
      </section>

    </main>
  )
}