import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Send, Users, Sparkles, Paperclip, X, FileText, Trash2, Eraser, UsersRound } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getSocket, disconnectSocket } from '../../services/socket'
import ConfirmDialog from '../../components/ConfirmDialog'

const toastStyle = {
  background: '#1c1917', color: '#fff',
  fontSize: '13px', borderRadius: '12px', padding: '12px 16px',
}

const roleLabels = {
  admin: 'Admin',
  manager: 'Manager',
  creator: 'Creator',
}

const ROOMS = [
  { key: 'team',     label: 'Équipe',    icon: Users,     roles: ['admin', 'manager'] },
  { key: 'creators', label: 'Créateurs', icon: Sparkles,  roles: ['admin', 'creator'] },
]

export default function AdminChat() {
  const { user } = useSelector((state) => state.auth)

  const availableRooms = ROOMS.filter(function(r) { return r.roles.includes(user?.role) })

  const [room,      setRoom]      = useState(availableRooms[0]?.key || 'team')
  const [messages,  setMessages]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [text,      setText]      = useState('')
  const [connected, setConnected] = useState(false)

  const [members,      setMembers]      = useState([])
  const [onlineIds,    setOnlineIds]    = useState([])
  const [showMembers,  setShowMembers]  = useState(false)

  const [attachment,  setAttachment]  = useState(null) // { fileUrl, fileType, fileName }
  const [uploading,   setUploading]   = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null) // messageId
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const [unreadCounts, setUnreadCounts] = useState({ team: 0, creators: 0 })

  const bottomRef   = useRef(null)
  const membersRef  = useRef(null)
  const roomRef     = useRef(room)

  useEffect(function() { roomRef.current = room }, [room])

  const getAvatarUrl = function(avatar) {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads')) return 'http://localhost:5000' + avatar
    return avatar
  }

  // =====================================================
  // SOCKET — connexion + listeners (une seule fois)
  // =====================================================

  useEffect(function() {
    const socket = getSocket()
    socket.connect()

    const handleConnect      = function() { setConnected(true) }
    const handleDisconnect   = function() { setConnected(false) }
    const handleConnectError = function(err) {
      toast.error(err.message || 'Connexion chat impossible', { style: toastStyle })
    }
    const handleNewMessage = function(message) {
      if (message.room === roomRef.current) {
        setMessages(function(prev) { return [...prev, message] })
        if (message.sender?._id !== user?._id) {
          getSocket().emit('markRead', { room: message.room })
        }
      } else if (message.sender?._id !== user?._id) {
        setUnreadCounts(function(prev) { return { ...prev, [message.room]: (prev[message.room] || 0) + 1 } })
      }
    }
    const handleMessageDeleted = function(payload) {
      if (payload.room !== roomRef.current) return
      setMessages(function(prev) { return prev.filter(function(m) { return m._id !== payload.messageId }) })
    }
    const handleRoomCleared = function(payload) {
      if (payload.room !== roomRef.current) return
      setMessages([])
    }
    const handlePresence = function(payload) {
      if (payload.room !== roomRef.current) return
      setOnlineIds(payload.users.map(function(u) { return u._id }))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('newMessage', handleNewMessage)
    socket.on('messageDeleted', handleMessageDeleted)
    socket.on('roomCleared', handleRoomCleared)
    socket.on('presence', handlePresence)

    if (socket.connected) handleConnect()

    return function() {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('newMessage', handleNewMessage)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('roomCleared', handleRoomCleared)
      socket.off('presence', handlePresence)
      disconnectSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // =====================================================
  // ROOM — charger l'historique + les membres + rejoindre
  // =====================================================

  const fetchUnread = function() {
    api.get('/messages/unread')
      .then(function(res) { setUnreadCounts(function(prev) { return { ...prev, ...res.data } }) })
      .catch(function() {})
  }

  useEffect(function() {
    let isMounted = true
    setLoading(true)
    setMessages([])
    setOnlineIds([])

    api.get('/messages?room=' + room)
      .then(function(res) { if (isMounted) setMessages(res.data) })
      .catch(function() { toast.error('Erreur chargement du chat', { style: toastStyle }) })
      .finally(function() { if (isMounted) setLoading(false) })

    api.get('/messages/members?room=' + room)
      .then(function(res) { if (isMounted) setMembers(res.data) })
      .catch(function() {})

    // Marquer ce salon comme lu — reset le badge de non-lus
    getSocket().emit('markRead', { room })
    setUnreadCounts(function(prev) { return { ...prev, [room]: 0 } })

    return function() { isMounted = false }
  }, [room])

  useEffect(function() { fetchUnread() }, [])

  useEffect(function() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(function() {
    const handleClickOutside = function(e) {
      if (membersRef.current && !membersRef.current.contains(e.target)) setShowMembers(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return function() { document.removeEventListener('mousedown', handleClickOutside) }
  }, [])

  // =====================================================
  // ATTACHMENTS
  // =====================================================

  const handleFileSelect = async function(e) {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

      const response = await fetch(apiUrl + '/messages/upload', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Upload échoué')

      setAttachment(data)
    } catch (err) {
      toast.error(err.message || 'Erreur upload fichier', { style: toastStyle })
    }
    setUploading(false)
    e.target.value = ''
  }

  // =====================================================
  // SEND / DELETE / CLEAR
  // =====================================================

  const handleSend = function() {
    const trimmed = text.trim()
    if (!trimmed && !attachment) return

    getSocket().emit('sendMessage', {
      room,
      text: trimmed,
      fileUrl: attachment?.fileUrl || '',
      fileType: attachment?.fileType || '',
      fileName: attachment?.fileName || '',
    })
    setText('')
    setAttachment(null)
  }

  const confirmDeleteMessage = function() {
    getSocket().emit('deleteMessage', { messageId: deleteTarget })
    setDeleteTarget(null)
  }

  const confirmClearRoom = function() {
    getSocket().emit('clearRoom', { room })
    setShowClearConfirm(false)
  }

  const formatTime = function(date) {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDay = function(date) {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  let lastDay = null
  const onlineCount = onlineIds.length

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100">Messages</h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Discussion interne</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Members / presence */}
          <div className="relative" ref={membersRef}>
            <button
              onClick={function() { setShowMembers(!showMembers) }}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
            >
              <UsersRound size={12} />
              {onlineCount} en ligne
            </button>

            {showMembers && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-lg overflow-hidden z-10">
                <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                  <p className="text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 font-medium">Membres ({members.length})</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {members.map(function(m) {
                    const isOnline = onlineIds.includes(m._id)
                    const avatarUrl = getAvatarUrl(m.avatar)
                    return (
                      <div key={m._id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="relative flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center text-[10px] font-medium overflow-hidden">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className={'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-stone-900 ' + (isOnline ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-600')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">{m.name}</p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clear discussion — admin only */}
          {user?.role === 'admin' && (
            <button
              onClick={function() { setShowClearConfirm(true) }}
              title="Vider la discussion"
              className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <Eraser size={14} />
            </button>
          )}

          <span className={'flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full ' + (connected ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400')}>
            <span className={'w-1.5 h-1.5 rounded-full ' + (connected ? 'bg-green-500' : 'bg-stone-400')} />
            {connected ? 'Connecté' : 'Connexion...'}
          </span>
        </div>
      </div>

      {availableRooms.length > 1 && (
        <div className="flex gap-2 mb-4">
          {availableRooms.map(function(r) {
            const Icon = r.icon
            const isActive = room === r.key
            const unread = unreadCounts[r.key] || 0
            return (
              <button
                key={r.key}
                onClick={function() { if (!isActive) setRoom(r.key) }}
                className={
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition ' +
                  (isActive
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500')
                }
              >
                <Icon size={14} /> {r.label}
                {!isActive && unread > 0 && (
                  <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[1.1rem] h-[1.1rem] px-1">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-1">
          {loading && (
            <p className="text-center text-xs text-stone-400 dark:text-stone-500 py-10">Chargement...</p>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-stone-400 dark:text-stone-500">Aucun message pour le moment</p>
              <p className="text-xs text-stone-300 dark:text-stone-600 mt-1">Soyez le premier à écrire</p>
            </div>
          )}

          {!loading && messages.map(function(msg, index) {
            const isMine = msg.sender?._id === user?._id
            const avatarUrl = getAvatarUrl(msg.sender?.avatar)
            const day = formatDay(msg.createdAt)
            const showDaySeparator = day !== lastDay
            lastDay = day

            return (
              <div key={msg._id || index}>
                {showDaySeparator && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-stone-100 dark:bg-stone-800" />
                    <span className="text-[10px] tracking-widest uppercase text-stone-300 dark:text-stone-600">{day}</span>
                    <div className="flex-1 h-px bg-stone-100 dark:bg-stone-800" />
                  </div>
                )}

                <div className={'group flex items-end gap-2.5 mb-3 ' + (isMine ? 'flex-row-reverse' : '')}>
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0 overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={msg.sender?.name} className="w-full h-full object-cover" />
                      ) : (
                        msg.sender?.name?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                  )}

                  <div className={'max-w-[70%] flex flex-col ' + (isMine ? 'items-end' : 'items-start')}>
                    {!isMine && (
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-1 px-1">
                        {msg.sender?.name} · <span className="uppercase tracking-wide">{roleLabels[msg.sender?.role] || msg.sender?.role}</span>
                      </p>
                    )}

                    <div className={'flex items-center gap-1.5 ' + (isMine ? 'flex-row-reverse' : '')}>
                      <div
                        className={
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ' +
                          (isMine
                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-br-md'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-md')
                        }
                      >
                        {msg.fileType === 'image' && msg.fileUrl && (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                            <img src={msg.fileUrl} alt={msg.fileName || 'image'} className="rounded-xl max-w-56 max-h-56 object-cover mb-1.5" />
                          </a>
                        )}
                        {msg.fileType === 'pdf' && msg.fileUrl && (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={'flex items-center gap-2 rounded-xl px-3 py-2 mb-1.5 transition ' + (isMine ? 'bg-white/10 hover:bg-white/15' : 'bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600')}
                          >
                            <FileText size={16} className="flex-shrink-0" />
                            <span className="text-xs truncate underline">{msg.fileName || 'document.pdf'}</span>
                          </a>
                        )}
                        {msg.text}
                      </div>

                      {isMine && (
                        <button
                          onClick={function() { setDeleteTarget(msg._id) }}
                          title="Supprimer"
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-300 dark:text-stone-600 hover:text-red-500 dark:hover:text-red-400 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-300 dark:text-stone-600 mt-1 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-stone-100 dark:border-stone-800 p-4">
          {attachment && (
            <div className="flex items-center gap-2 mb-3 bg-stone-50 dark:bg-stone-800 rounded-xl px-3 py-2 w-fit">
              {attachment.fileType === 'image' ? (
                <img src={attachment.fileUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <FileText size={16} className="text-stone-500 dark:text-stone-400" />
              )}
              <span className="text-xs text-stone-600 dark:text-stone-300 max-w-40 truncate">{attachment.fileName}</span>
              <button onClick={function() { setAttachment(null) }} className="text-stone-400 hover:text-red-500 transition">
                <X size={13} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center justify-center w-11 h-11 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer flex-shrink-0" title="Joindre un fichier">
              <Paperclip size={16} />
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} disabled={uploading} />
            </label>

            <input
              value={text}
              onChange={function(e) { setText(e.target.value) }}
              onKeyDown={function(e) { if (e.key === 'Enter') handleSend() }}
              placeholder={uploading ? 'Upload en cours...' : 'Écrire un message...'}
              disabled={uploading}
              className="flex-1 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={(!text.trim() && !attachment) || uploading}
              className="flex items-center justify-center w-11 h-11 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl hover:bg-stone-700 dark:hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              title="Envoyer"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer ce message ?"
        message="Cette action est irreversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={confirmDeleteMessage}
        onCancel={function() { setDeleteTarget(null) }}
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="Vider cette discussion ?"
        message="Tous les messages de cette discussion seront supprimes definitivement, pour tout le monde."
        confirmLabel="Vider"
        danger
        onConfirm={confirmClearRoom}
        onCancel={function() { setShowClearConfirm(false) }}
      />
    </div>
  )
}
