import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <main className="bg-white">

      {/* ── Hero Banner ── */}
      <div className="bg-[#f5f3f0] py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase text-stone-900 mb-4">
          Contact Us
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition">Home</Link>
          <span>›</span>
          <span className="text-stone-600">Contact Us</span>
        </div>
      </div>
<br /><br />
     

      {/* ── Form + Image ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Form */}
        <div>
          <p className="text-xs tracking-[0.5em] uppercase text-stone-400 mb-2">Ecrivez-nous</p>
          <h2 className="text-3xl font-light text-stone-900 mb-2">Drop Us A Line</h2>
          <p className="text-stone-400 text-sm mb-8">Don't hesitate to contact us anytime !</p>

          {sent && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-5 py-3 rounded-xl mb-6">
              Message envoye avec succes !
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Your Name*"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-[#faf9f7] transition placeholder:text-stone-400"
              />
              <input
                type="email"
                required
                placeholder="Your Email*"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-[#faf9f7] transition placeholder:text-stone-400"
              />
            </div>

            {/* Subject */}
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-[#faf9f7] transition placeholder:text-stone-400"
            />

            {/* Message */}
            <textarea
              required
              rows={6}
              placeholder="Your Message*"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 focus:outline-none focus:border-stone-400 bg-[#faf9f7] transition placeholder:text-stone-400 resize-none"
            />

            {/* Submit */}
            <button
              type="submit"
              className="self-start bg-stone-900 text-white text-xs tracking-[0.3em] uppercase px-10 py-4 rounded-full hover:bg-stone-700 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Image */}
        <div className="hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&q=80"
            alt="Contact"
            className="w-full h-[580px] object-cover rounded-3xl"
          />
        </div>
      </section>

    </main>
  )
}