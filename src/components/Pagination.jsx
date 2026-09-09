import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100 dark:border-stone-800">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={14} /> Précédent
      </button>

      <span className="text-xs text-stone-400 dark:text-stone-500">
        Page {page} / {totalPages}
      </span>

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Suivant <ChevronRight size={14} />
      </button>
    </div>
  )
}
