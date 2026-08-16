export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-base font-medium text-stone-900 mb-2">{title}</h3>
        {message && <p className="text-sm text-stone-500 mb-6">{message}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-stone-500 hover:text-stone-800 px-4 py-2.5 transition"
          >
            {cancelLabel || 'Annuler'}
          </button>
          <button
            onClick={onConfirm}
            className={
              'text-xs tracking-widest uppercase px-5 py-2.5 rounded-full text-white transition ' +
              (danger ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-900 hover:bg-stone-700')
            }
          >
            {confirmLabel || 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
