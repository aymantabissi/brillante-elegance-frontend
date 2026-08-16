import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Send, Paperclip, X, FileText, Trash2, UsersRound } from 'lucide-react'
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
  creator: 'Creator',
}

const ROOM = 'creators'

export default function CreatorChat() {
  const { user } = useSelector((state) => state.auth)

  const [messages,  setMessages]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [text,      setText]      = useState('')
  const [connected, setConnected] = useState(false)

  const [members,     setMembers]     = useState([])
  const [onlineIds,   setOnlineIds]   = useState([])
  const [showMembers, setShowMembers] = useState(false)

  const [attachment, setAttachment] = useState(null)
  const [uploading,  setUploading]  = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)

  const bottomRef  = useRef(null)
  const membersRef = useRef(null)

  const getAvatarUrl = function(avatar) {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads')) return 'http://localhost:5000' + avatar
    return avatar
  }

  useEffect(function() {
    let isMounted = true

    api.get('/messages?room=' + ROOM)
      .then(function(res) { if (isMounted) setMessages(res.data) })
      .catch(function() { toast.error('Erreur chargement du chat', { style: toastStyle }) })
      .finally(function() { if (isMounted) setLoading(false) })

    api.get('/messages/members?room=' + ROOM)
      .then(function(res) { if (isMounted) setMembers(res.data) })
      .catch(function() {})

    const socket = getSocket()
    socket.connect()

    const handleConnect      = function() { setConnected(true); socket.emit('markRead', { room: ROOM }) }
    const handleDisconnect   = function() { setConnected(false) }
    const handleConnectError = function(err) {
      toast.error(err.message || 'Connexion chat impossible', { style: toastStyle })
    }
    const handleNewMessage = function(message) {
      setMessages(function(prev) { return [...prev, message] })
      if (message.sender?._id !== user?._id) {
        socket.emit('markRead', { room: ROOM })
      }
    }
    const handleMessageDeleted = function(payload) {
      setMessages(function(prev) { return prev.filter(function(m) { return m._id !== payload.messageId }) })
    }
    const handleRoomCleared = function() {
      setMessages([])
    }
    const handlePresence = function(payload) {
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
      isMounted = false
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('newMessage', handleNewMessage)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('roomCleared', handleRoomCleared)
      socket.off('presence', handlePresence)
      disconnectSocket()
    }
  }, [])

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

  const handleSend = function() {
    const trimmed = text.trim()
    if (!trimmed && !attachment) return

    getSocket().emit('sendMessage', {
      room: ROOM,
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

  const formatTime = function(date) {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDay = function(date) {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  let lastDay = null
  const onlineCount = onlineIds.length

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-stone-800">Messages</h1>
          <p className="text-sm text-stone-400 mt-1">Discutez avec l'équipe Brillante Élégance</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={membersRef}>
            <button
              onClick={function() { setShowMembers(!showMembers) }}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
            >
              <UsersRound size={12} />
              {onlineCount} en ligne
            </button>

            {showMembers && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-100 rounded-2xl shadow-lg overflow-hidden z-10">
                <div className="px-4 py-3 border-b border-stone-100">
                  <p className="text-xs tracking-widest uppercase text-stone-500 font-medium">Membres ({members.length})</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {members.map(function(m) {
                    const isOnline = onlineIds.includes(m._id)
                    const avatarUrl = getAvatarUrl(m.avatar)
                    return (
                      <div key={m._id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="relative flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-medium overflow-hidden">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className={'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ' + (isOnline ? 'bg-green-500' : 'bg-stone-300')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-800 truncate">{m.name}</p>
                          <p className="text-[10px] text-stone-400">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <span className={'flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full ' + (connected ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500')}>
            <span className={'w-1.5 h-1.5 rounded-full ' + (connected ? 'bg-green-500' : 'bg-stone-400')} />
            {connected ? 'Connecté' : 'Connexion...'}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-stone-100 flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-1">
          {loading && (
            <p className="text-center text-xs text-stone-400 py-10">Chargement...</p>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-stone-400">Aucun message pour le moment</p>
              <p className="text-xs text-stone-300 mt-1">Écrivez à l'équipe si vous avez une question</p>
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
                    <div className="flex-1 h-px bg-stone-100" />
                    <span className="text-[10px] tracking-widest uppercase text-stone-300">{day}</span>
                    <div className="flex-1 h-px bg-stone-100" />
                  </div>
                )}

                <div className={'group flex items-end gap-2.5 mb-3 ' + (isMine ? 'flex-row-reverse' : '')}>
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0 overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={msg.sender?.name} className="w-full h-full object-cover" />
                      ) : (
                        msg.sender?.name?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                  )}

                  <div className={'max-w-[70%] flex flex-col ' + (isMine ? 'items-end' : 'items-start')}>
                    {!isMine && (
                      <p className="text-[11px] text-stone-400 mb-1 px-1">
                        {msg.sender?.name} · <span className="uppercase tracking-wide">{roleLabels[msg.sender?.role] || msg.sender?.role}</span>
                      </p>
                    )}

                    <div className={'flex items-center gap-1.5 ' + (isMine ? 'flex-row-reverse' : '')}>
                      <div
                        className={
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ' +
                          (isMine ? 'bg-stone-900 text-white rounded-br-md' : 'bg-stone-100 text-stone-800 rounded-bl-md')
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
                            className={'flex items-center gap-2 rounded-xl px-3 py-2 mb-1.5 transition ' + (isMine ? 'bg-white/10 hover:bg-white/15' : 'bg-white hover:bg-stone-50')}
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
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-300 hover:text-red-500 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-300 mt-1 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-stone-100 p-4">
          {attachment && (
            <div className="flex items-center gap-2 mb-3 bg-stone-50 rounded-xl px-3 py-2 w-fit">
              {attachment.fileType === 'image' ? (
                <img src={attachment.fileUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <FileText size={16} className="text-stone-500" />
              )}
              <span className="text-xs text-stone-600 max-w-40 truncate">{attachment.fileName}</span>
              <button onClick={function() { setAttachment(null) }} className="text-stone-400 hover:text-red-500 transition">
                <X size={13} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center justify-center w-11 h-11 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition cursor-pointer flex-shrink-0" title="Joindre un fichier">
              <Paperclip size={16} />
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} disabled={uploading} />
            </label>

            <input
              value={text}
              onChange={function(e) { setText(e.target.value) }}
              onKeyDown={function(e) { if (e.key === 'Enter') handleSend() }}
              placeholder={uploading ? 'Upload en cours...' : 'Écrire un message...'}
              disabled={uploading}
              className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={(!text.trim() && !attachment) || uploading}
              className="flex items-center justify-center w-11 h-11 bg-stone-900 text-white rounded-xl hover:bg-stone-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
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
    </div>
  )
}
