import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Check, X, Pencil, Lock, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { updateUserProfile } from '../../store/slices/authSlice'

const toastStyle = {
  background: '#1c1917', color: '#fff',
  fontSize: '13px', borderRadius: '12px', padding: '12px 16px',
}

const roleLabels = {
  user: 'User',
  employee: 'Employee',
  manager: 'Manager',
  admin: 'Admin',
  creator: 'Creator',
}

export default function AdminProfile() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [editingName,     setEditingName]     = useState(false)
  const [name,            setName]            = useState(user?.name || '')
  const [savingName,      setSavingName]      = useState(false)
  const [uploadingAvatar, setUploadingAvatar]  = useState(false)

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const getAvatarUrl = function(avatar) {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads')) return 'http://localhost:5000' + avatar
    return avatar
  }

  // =====================================================
  // AVATAR
  // =====================================================

  const handleAvatarUpload = async function(e) {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    setUploadingAvatar(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

      const response = await fetch(apiUrl + '/auth/me/avatar', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload échoué')
      }

      dispatch(updateUserProfile({ avatar: data.avatar }))
      toast.success('Photo de profil mise à jour !', { style: toastStyle })
    } catch (err) {
      toast.error(err.message || 'Erreur upload photo')
    }
    setUploadingAvatar(false)
    e.target.value = ''
  }

  // =====================================================
  // NAME — EDIT MODE
  // =====================================================

  const startEditName = function() {
    setName(user?.name || '')
    setEditingName(true)
  }

  const cancelEditName = function() {
    setName(user?.name || '')
    setEditingName(false)
  }

  const handleSaveName = async function() {
    if (!name.trim()) return toast.error('Le nom ne peut pas être vide')

    setSavingName(true)
    try {
      const { data } = await api.put('/auth/me', { name: name.trim() })
      dispatch(updateUserProfile({ name: data.name }))
      toast.success('Profil mis à jour !', { style: toastStyle })
      setEditingName(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
    setSavingName(false)
  }

  // =====================================================
  // PASSWORD
  // =====================================================

  const openPasswordModal = function() {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
    setShowPasswordModal(true)
  }

  const handleSavePassword = async function() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return setPasswordError('Tous les champs sont requis')
    }
    if (passwordForm.newPassword.length < 6) {
      return setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères')
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('Les mots de passe ne correspondent pas')
    }

    setPasswordError('')
    setSavingPassword(true)
    try {
      await api.put('/auth/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Mot de passe mis à jour !', { style: toastStyle })
      setShowPasswordModal(false)
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Erreur')
    }
    setSavingPassword(false)
  }

  const avatarUrl = getAvatarUrl(user?.avatar)

  return (
    <div>

      {/* Header + breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100">Mon profil</h2>
        <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
          <Link to="/admin" className="hover:text-stone-600 dark:hover:text-stone-300 transition">Dashboard</Link>
          <ChevronRight size={13} />
          <span className="text-stone-600 dark:text-stone-300">Mon profil</span>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-8 max-w-2xl mb-6">

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center text-2xl font-medium overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-700 dark:hover:bg-white transition shadow-sm">
                <Camera size={12} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>
            <div>
              <p className="text-base font-semibold text-stone-800 dark:text-stone-100">{user?.name}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 text-[10px] font-medium tracking-widest uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full">
                {roleLabels[user?.role] || user?.role}
              </span>
              {uploadingAvatar && <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">Upload en cours...</p>}
            </div>
          </div>

          {!editingName && (
            <button
              onClick={startEditName}
              className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-3 py-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition flex-shrink-0"
            >
              <Pencil size={12} /> Modifier
            </button>
          )}
        </div>

        {editingName && (
          <div className="border-t border-stone-100 dark:border-stone-800 pt-6">
            <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Nom complet</label>
            <input
              value={name}
              onChange={function(e) { setName(e.target.value) }}
              className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={cancelEditName}
                className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-4 py-2.5 transition"
              >
                <X size={13} /> Annuler
              </button>
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="flex items-center gap-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-stone-700 dark:hover:bg-white transition disabled:opacity-50"
              >
                <Check size={13} /> {savingName ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-8 max-w-2xl">
        <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700 dark:text-stone-300 mb-5">Sécurité</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Mot de passe</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Changez votre mot de passe régulièrement pour sécuriser votre compte.</p>
          </div>
          <button
            onClick={openPasswordModal}
            className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-4 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition flex-shrink-0 whitespace-nowrap"
          >
            <Lock size={12} /> Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={function() { if (!savingPassword) setShowPasswordModal(false) }} />

          <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-stone-700">
              <h3 className="text-sm font-medium text-stone-800 dark:text-stone-100">Changer le mot de passe</h3>
              <button onClick={function() { setShowPasswordModal(false) }} disabled={savingPassword}>
                <X size={18} className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={function(e) { setPasswordForm({ ...passwordForm, currentPassword: e.target.value }) }}
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={function(e) { setPasswordForm({ ...passwordForm, newPassword: e.target.value }) }}
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={function(e) { setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }) }}
                  onKeyDown={function(e) { if (e.key === 'Enter') handleSavePassword() }}
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              {passwordError && (
                <p className="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{passwordError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={function() { setShowPasswordModal(false) }}
                  disabled={savingPassword}
                  className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition px-4 py-2.5"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-stone-700 dark:hover:bg-white transition disabled:opacity-50"
                >
                  {savingPassword ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
