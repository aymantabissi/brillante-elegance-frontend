import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Landmark, Copy, X } from 'lucide-react'
import api from '../../services/api'

export default function AdminUsers() {
  // =====================================================
  // AUTH
  // =====================================================

  const { user } = useSelector((state) => state.auth)

  // =====================================================
  // STATES
  // =====================================================

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [ribUser, setRibUser] = useState(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true,
  })

  // =====================================================
  // GET USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/users')

      console.log('USERS:', data)

      setUsers(data)
    } catch (error) {
      console.error('Erreur users:', error)

      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
      } else if (error.response?.status === 403) {
        toast.error('Accès réservé à l’administrateur.')
      } else {
        toast.error(
          error.response?.data?.message ||
          'Erreur lors de la récupération des utilisateurs'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // LOAD USERS
  // =====================================================

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers()
    }
  }, [user])

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingUser(null)

    setForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true,
    })

    setShowModal(true)
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser)

    setForm({
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      password: '',
      role: selectedUser.role || 'user',
      isActive:
        selectedUser.isActive !== undefined
          ? selectedUser.isActive
          : true,
    })

    setShowModal(true)
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return

    setShowModal(false)
    setEditingUser(null)

    setForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true,
    })
  }

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // =====================================================
  // CREATE / UPDATE USER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }

    if (!form.email.trim()) {
      toast.error("L'email est obligatoire")
      return
    }

    // Password obligatoire seulement pour création
    if (!editingUser && !form.password) {
      toast.error('Le mot de passe est obligatoire')
      return
    }

    try {
      setSaving(true)

      // =================================================
      // CREATE
      // =================================================

      if (!editingUser) {
        const { data } = await api.post('/users', {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          isActive: form.isActive,
        })

        console.log('USER CREATED:', data)

        toast.success('Utilisateur créé avec succès')

        setUsers((prev) => [data, ...prev])

        closeModal()
        return
      }

      // =================================================
      // UPDATE
      // =================================================

      const updateData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        isActive: form.isActive,
      }

      // Password uniquement si admin l'a rempli
      if (form.password.trim()) {
        updateData.password = form.password
      }

      const { data } = await api.put(
        `/users/${editingUser._id}`,
        updateData
      )

      console.log('USER UPDATED:', data)

      toast.success('Utilisateur modifié avec succès')

      setUsers((prev) =>
        prev.map((item) =>
          item._id === editingUser._id
            ? data
            : item
        )
      )

      closeModal()
    } catch (error) {
      console.error('Erreur save user:', error)

      toast.error(
        error.response?.data?.message ||
        "Erreur lors de l'enregistrement"
      )
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // CHANGE ROLE
  // =====================================================

  const roleLabels = {
    user: 'User',
    employee: 'Employee',
    manager: 'Manager',
    admin: 'Admin',
    creator: 'Creator',
  }

  const handleRoleChange = async (selectedUser, newRole) => {
    if (selectedUser._id === user?._id) {
      toast.error(
        'Vous ne pouvez pas modifier votre propre rôle ici.'
      )
      return
    }

    try {
      const { data } = await api.patch(
        `/users/${selectedUser._id}/role`,
        {
          role: newRole,
        }
      )

      console.log('ROLE UPDATED:', data)

      toast.success(
        `Rôle changé en ${roleLabels[newRole] || newRole}`
      )

      setUsers((prev) =>
        prev.map((item) =>
          item._id === selectedUser._id
            ? data
            : item
        )
      )
    } catch (error) {
      console.error('Erreur role:', error)

      toast.error(
        error.response?.data?.message ||
        'Erreur lors du changement du rôle'
      )
    }
  }

  // =====================================================
  // CHANGE STATUS
  // =====================================================

  const handleStatusChange = async (
    selectedUser,
    newStatus
  ) => {
    if (selectedUser._id === user?._id) {
      toast.error(
        'Vous ne pouvez pas désactiver votre propre compte.'
      )
      return
    }

    try {
      const { data } = await api.patch(
        `/users/${selectedUser._id}/status`,
        {
          isActive: newStatus,
        }
      )

      console.log('STATUS UPDATED:', data)

      toast.success(
        newStatus
          ? 'Utilisateur activé'
          : 'Utilisateur désactivé'
      )

      setUsers((prev) =>
        prev.map((item) =>
          item._id === selectedUser._id
            ? data
            : item
        )
      )
    } catch (error) {
      console.error('Erreur status:', error)

      toast.error(
        error.response?.data?.message ||
        'Erreur lors du changement du statut'
      )
    }
  }

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDelete = async (selectedUser) => {
    if (selectedUser._id === user?._id) {
      toast.error(
        'Vous ne pouvez pas supprimer votre propre compte.'
      )
      return
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${selectedUser.name} ?`
    )

    if (!confirmed) return

    try {
      await api.delete(
        `/users/${selectedUser._id}`
      )

      toast.success('Utilisateur supprimé')

      setUsers((prev) =>
        prev.filter(
          (item) => item._id !== selectedUser._id
        )
      )
    } catch (error) {
      console.error('Erreur delete user:', error)

      toast.error(
        error.response?.data?.message ||
        'Erreur lors de la suppression'
      )
    }
  }

  // =====================================================
  // AVATAR URL
  // =====================================================

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads')) return 'http://localhost:5000' + avatar
    return avatar
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-10 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-stone-300 dark:border-stone-600 border-t-stone-800 dark:border-t-stone-200 rounded-full mx-auto mb-4" />

          <p className="text-sm text-stone-500 dark:text-stone-400">
            Chargement des utilisateurs...
          </p>
        </div>
      </div>
    )
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-light text-stone-800 dark:text-stone-100">
            Utilisateurs
          </h1>

          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
            Gestion des comptes et des accès au dashboard
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-stone-800 text-white px-5 py-3 rounded-xl text-sm hover:bg-stone-700 transition"
        >
          + Ajouter un utilisateur
        </button>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Total
          </p>

          <p className="text-3xl font-light text-stone-800 dark:text-stone-100 mt-2">
            {users.length}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Admins
          </p>

          <p className="text-3xl font-light text-stone-800 dark:text-stone-100 mt-2">
            {
              users.filter(
                (item) => item.role === 'admin'
              ).length
            }
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Actifs
          </p>

          <p className="text-3xl font-light text-stone-800 dark:text-stone-100 mt-2">
            {
              users.filter(
                (item) => item.isActive !== false
              ).length
            }
          </p>
        </div>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">

                <th className="text-left px-5 py-4 text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Utilisateur
                </th>

                <th className="text-left px-5 py-4 text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Email
                </th>

                <th className="text-left px-5 py-4 text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Rôle
                </th>

                <th className="text-left px-5 py-4 text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Statut
                </th>

                <th className="text-left px-5 py-4 text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Créé le
                </th>

                <th className="text-right px-5 py-4 text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {users.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-stone-400 dark:text-stone-500"
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>

              ) : (

                users.map((item) => {

                  const isCurrentUser =
                    item._id === user?._id

                  const active =
                    item.isActive !== false

                  return (

                    <tr
                      key={item._id}
                      className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition"
                    >

                      {/* USER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-200 font-medium overflow-hidden flex-shrink-0">
                            {getAvatarUrl(item.avatar) ? (
                              <img
                                src={getAvatarUrl(item.avatar)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              item.name
                                ?.charAt(0)
                                ?.toUpperCase()
                            )}
                          </div>

                          <div>

                            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                              {item.name}
                            </p>

                            {isCurrentUser && (
                              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                Votre compte
                              </span>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          {item.email}
                        </span>

                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">

                        <select
                          value={item.role}
                          disabled={isCurrentUser}
                          onChange={(e) =>
                            handleRoleChange(
                              item,
                              e.target.value
                            )
                          }
                          className={`text-xs rounded-lg border px-3 py-2 outline-none ${
                            item.role === 'admin'
                              ? 'bg-stone-800 dark:bg-stone-700 text-white border-stone-800 dark:border-stone-700'
                              : item.role === 'manager'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : item.role === 'creator'
                                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                          } ${
                            isCurrentUser
                              ? 'opacity-60 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >

                          <option value="user">
                            User
                          </option>

                          <option value="employee">
                            Employee
                          </option>

                          <option value="manager">
                            Manager
                          </option>

                          <option value="creator">
                            Creator
                          </option>

                          <option value="admin">
                            Admin
                          </option>

                        </select>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <button
                          disabled={isCurrentUser}
                          onClick={() =>
                            handleStatusChange(
                              item,
                              !active
                            )
                          }
                          title={!active && item.role === 'creator' ? 'Valider ce compte createur' : undefined}
                          className={`px-3 py-1.5 rounded-full text-xs ${
                            active
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : item.role === 'creator'
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          } ${
                            isCurrentUser
                              ? 'opacity-60 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          {active
                            ? 'Actif'
                            : item.role === 'creator'
                              ? 'En attente'
                              : 'Inactif'}
                        </button>

                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-stone-500 dark:text-stone-400">
                          {formatDate(item.createdAt)}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          {item.role === 'creator' && (
                            <button
                              onClick={() => setRibUser(item)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                              title="Voir les informations bancaires"
                            >
                              <Landmark size={12} /> RIB
                            </button>
                          )}

                          <button
                            onClick={() =>
                              openEditModal(item)
                            }
                            className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                          >
                            Modifier
                          </button>

                          <button
                            disabled={isCurrentUser}
                            onClick={() =>
                              handleDelete(item)
                            }
                            className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Supprimer
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />

          {/* MODAL */}

          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-stone-700">

              <div>

                <h2 className="text-lg font-medium text-stone-800 dark:text-stone-100">
                  {editingUser
                    ? 'Modifier utilisateur'
                    : 'Ajouter utilisateur'}
                </h2>

                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                  {editingUser
                    ? 'Modifier les informations du compte'
                    : 'Créer un nouveau compte'}
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xl"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
                  Nom
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nom complet"
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-500 dark:focus:border-stone-400 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  required
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-500 dark:focus:border-stone-400 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  required
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">

                  Mot de passe

                  {editingUser && (
                    <span className="normal-case tracking-normal text-stone-400 dark:text-stone-500 ml-2">
                      (laisser vide pour conserver)
                    </span>
                  )}

                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? 'Nouveau mot de passe'
                      : 'Mot de passe'
                  }
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-500 dark:focus:border-stone-400 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  minLength="6"
                  required={!editingUser}
                />

              </div>

              {/* ROLE */}

              <div>

                <label className="block text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
                  Rôle
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-500 dark:focus:border-stone-400 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >

                  <option value="user">
                    User
                  </option>

                  <option value="employee">
                    Employee
                  </option>

                  <option value="manager">
                    Manager (Gestionnaire — produits + commandes)
                  </option>

                  <option value="creator">
                    Creator (Affiliation — vend avec un code promo)
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                </select>

              </div>

              {/* STATUS */}

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4"
                />

                <span className="text-sm text-stone-600 dark:text-stone-400">
                  Compte actif
                </span>

              </label>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl py-3 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-stone-800 text-white rounded-xl py-3 text-sm hover:bg-stone-700 transition disabled:opacity-50"
                >
                  {saving
                    ? 'Enregistrement...'
                    : editingUser
                      ? 'Enregistrer'
                      : 'Créer'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          RIB MODAL
      ================================================= */}

      {ribUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => setRibUser(null)} />

          <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-stone-700">
              <div>
                <h2 className="text-sm font-medium text-stone-800 dark:text-stone-100">Informations bancaires</h2>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{ribUser.name}</p>
              </div>
              <button onClick={() => setRibUser(null)}>
                <X size={18} className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200" />
              </button>
            </div>

            <div className="p-6">
              {ribUser.bankInfo && ribUser.bankInfo.rib ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">Titulaire du compte</p>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{ribUser.bankInfo.accountHolder}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">Banque</p>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{ribUser.bankInfo.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">RIB</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-medium text-stone-800 dark:text-stone-200 tracking-wide break-all">{ribUser.bankInfo.rib}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ribUser.bankInfo.rib)
                          toast.success('RIB copié !')
                        }}
                        className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition flex-shrink-0"
                        title="Copier le RIB"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4">
                  Ce créateur n'a pas encore renseigné ses informations bancaires.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}