import type { PaginationDetails, StatKey } from '../types'

export const STATS: { key: StatKey; label: string }[] = [
  { key: 'pts', label: 'PTS (Pontos)' },
  { key: 'ast', label: 'AST (Assistências)' },
  { key: 'reb', label: 'REB (Rebotes)' },
  { key: 'stl', label: 'STL (Roubos)' },
  { key: 'blk', label: 'BLK (Tocos)' },
]

export function fmt(val: number | null | undefined, digits = 1): string {
  if (val === null || val === undefined) return '—'
  return Number.isInteger(val) ? String(val) : val.toFixed(digits)
}

export function PaginationBar({
  pagination,
  onPageChange,
}: {
  pagination: PaginationDetails
  onPageChange: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-xs shadow-2xs">
      <span className="text-neutral-500">
        Página <b className="text-neutral-950">{pagination.page}</b> de{' '}
        <b className="text-neutral-950">{pagination.total_pages}</b> ({pagination.total_items} no total)
      </span>
      <div className="flex gap-2">
        <button
          disabled={!pagination.has_previous}
          onClick={() => onPageChange(pagination.page - 1)}
          className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 font-medium disabled:opacity-40 hover:bg-neutral-200 cursor-pointer disabled:cursor-not-allowed transition"
        >
          ← Anterior
        </button>
        <button
          disabled={!pagination.has_next}
          onClick={() => onPageChange(pagination.page + 1)}
          className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 font-medium disabled:opacity-40 hover:bg-neutral-200 cursor-pointer disabled:cursor-not-allowed transition"
        >
          Próxima →
        </button>
      </div>
    </div>
  )
}
