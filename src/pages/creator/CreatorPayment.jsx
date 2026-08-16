import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Pencil, X, Check, Landmark, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { updateUserProfile } from '../../store/slices/authSlice'

const toastStyle = {
  background: '#1c1917', color: '#fff',
  fontSize: '13px', borderRadius: '12px', padding: '12px 16px',
}

const SUPPORTED_BANK = 'CIH Bank'
const emptyForm = { accountHolder: '', bankName: SUPPORTED_BANK, rib: '' }

export default function CreatorPayment() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const hasBankInfo = !!(user?.bankInfo && user.bankInfo.rib)

  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState(user?.bankInfo || emptyForm)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const startEdit = function() {
    setForm({ ...(user?.bankInfo || emptyForm), bankName: SUPPORTED_BANK })
    setError('')
    setEditing(true)
  }

  const cancelEdit = function() {
    setForm(user?.bankInfo || emptyForm)
    setError('')
    setEditing(false)
  }

  const maskRib = function(rib) {
    if (!rib) return ''
    return rib.slice(0, 4) + ' •••• •••• •••• ' + rib.slice(-4)
  }

  const handleSave = async function() {
    const accountHolder = form.accountHolder.trim()
    const bankName      = SUPPORTED_BANK
    const rib           = form.rib.replace(/\s/g, '')

    if (!accountHolder || !rib) {
      return setError('Tous les champs sont requis')
    }
    if (!/^\d{24}$/.test(rib)) {
      return setError('Le RIB doit contenir exactement 24 chiffres')
    }

    setError('')
    setSaving(true)
    try {
      const { data } = await api.put('/auth/me', { bankInfo: { accountHolder, bankName, rib } })
      dispatch(updateUserProfile({ bankInfo: data.bankInfo }))
      toast.success('Informations bancaires enregistrées !', { style: toastStyle })
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-widest uppercase text-stone-800">Paiement</h1>
        <p className="text-sm text-stone-400 mt-1">Renseignez votre RIB pour recevoir vos commissions par virement</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 max-w-xl">

        {!editing && (
          <>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Landmark size={18} className="text-stone-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">Compte bancaire</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {hasBankInfo ? 'Utilisé pour le versement de vos commissions' : 'Aucune information renseignée'}
                  </p>
                </div>
              </div>
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-200 px-3 py-2 rounded-xl hover:bg-stone-50 transition flex-shrink-0"
              >
                <Pencil size={12} /> {hasBankInfo ? 'Modifier' : 'Ajouter'}
              </button>
            </div>

            {hasBankInfo && (
              <div className="border-t border-stone-100 mt-5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-400 mb-1">Titulaire du compte</p>
                  <p className="text-sm font-medium text-stone-800">{user.bankInfo.accountHolder}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1">Banque</p>
                  <p className="text-sm font-medium text-stone-800">{user.bankInfo.bankName}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-stone-400 mb-1">RIB</p>
                  <p className="text-sm font-mono font-medium text-stone-800 tracking-wide">{maskRib(user.bankInfo.rib)}</p>
                </div>
              </div>
            )}

            {!hasBankInfo && (
              <div className="border-t border-stone-100 mt-5 pt-5">
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  ⚠️ Sans RIB, l'équipe Brillante Élégance ne pourra pas vous verser vos commissions.
                  Nous traitons uniquement les virements <strong>CIH Bank</strong>.{' '}
                  <Link to="/creator/chat" className="underline hover:text-amber-800 inline-flex items-center gap-1">
                    Pas de compte CIH ? Contactez le support <MessageCircle size={12} />
                  </Link>
                </p>
              </div>
            )}
          </>
        )}

        {editing && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-stone-400 block mb-1">Titulaire du compte *</label>
              <input
                value={form.accountHolder}
                onChange={function(e) { setForm({ ...form, accountHolder: e.target.value }) }}
                placeholder="Nom complet"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
              />
            </div>
            <div>
              <label className="text-xs text-stone-400 block mb-1">Banque</label>
              <div className="w-full border border-stone-100 rounded-xl px-4 py-3 text-sm bg-stone-100 text-stone-500 flex items-center gap-2">
                <Landmark size={14} /> {SUPPORTED_BANK}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Nous ne traitons actuellement que les virements CIH Bank.{' '}
                <Link to="/creator/chat" className="underline hover:text-stone-600">
                  Pas de compte CIH ? Contactez le support
                </Link>
              </p>
            </div>
            <div>
              <label className="text-xs text-stone-400 block mb-1">RIB (24 chiffres) *</label>
              <input
                value={form.rib}
                onChange={function(e) { setForm({ ...form, rib: e.target.value.replace(/[^\d]/g, '') }) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSave() }}
                placeholder="230 780 0000000000000000 00"
                maxLength={24}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
              />
              <p className="text-[11px] text-stone-400 mt-1">{form.rib.length}/24 chiffres</p>
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 px-4 py-2.5 transition"
              >
                <X size={13} /> Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-stone-700 transition disabled:opacity-50"
              >
                <Check size={13} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
