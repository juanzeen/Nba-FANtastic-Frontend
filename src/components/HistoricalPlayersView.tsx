import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api'
import type {
  HistoricalPlayer,
  HistoricalStatKey,
  OrderKey,
  PaginationDetails,
  PositionFilterKey,
} from '../types'
import { HistoricalPlayerCard } from './Cards'
import { PaginationBar, STATS } from './PaginationBar'

export function HistoricalPlayersView() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<HistoricalPlayer[]>([])
  const [pagination, setPagination] = useState<PaginationDetails | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [stat, setStat] = useState<HistoricalStatKey | ''>('pts')
  const [position, setPosition] = useState<PositionFilterKey | ''>('')
  const [order, setOrder] = useState<OrderKey>('desc')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'slug' | 'id'>('slug')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .getHistoricalPlayers({ page, limit, stat, position, order })
      .then((r) => {
        setPlayers(r.data)
        setPagination(r.pagination)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, limit, stat, position, order])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setError('')
    setLoading(true)
    try {
      const res =
        mode === 'slug'
          ? await api.getHistoricalPlayerBySlug(q.toLowerCase())
          : await api.getHistoricalPlayerById(Number(q))
      navigate(`/historical-players/${res.data._id}`, { state: { player: res.data } })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Ordenar Por</label>
            <select
              value={stat}
              onChange={(e) => {
                setStat(e.target.value as HistoricalStatKey | '')
                setPage(1)
              }}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-900"
            >
              <option value="">Padrão</option>
              {STATS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
              <option value="championships">Títulos Conquistados</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Posição</label>
            <select
              value={position}
              onChange={(e) => {
                setPosition(e.target.value as PositionFilterKey | '')
                setPage(1)
              }}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-900"
            >
              <option value="">Todas</option>
              <option value="guard">Armador (Guard)</option>
              <option value="forward">Ala (Forward)</option>
              <option value="center">Pivô (Center)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Ordem</label>
            <select
              value={order}
              onChange={(e) => {
                setOrder(e.target.value as OrderKey)
                setPage(1)
              }}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-900"
            >
              <option value="desc">Maior → Menor</option>
              <option value="asc">Menor → Maior</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Por Página</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-900"
            >
              {[12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Buscar Lenda</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'slug' | 'id')}
              className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm text-neutral-900"
            >
              <option value="slug">Slug (ex: kareem-abdul-jabbar)</option>
              <option value="id">ID do Jogador (ex: 76003)</option>
            </select>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'slug' ? 'kareem-abdul-jabbar' : '76003'}
            className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-48 text-neutral-900"
          />
          <button
            type="submit"
            className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-sm cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-neutral-500 text-sm py-8 text-center">Carregando lendas...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <HistoricalPlayerCard
              key={p._id}
              player={p}
              onSelect={(pl) =>
                navigate(`/historical-players/${pl._id}`, { state: { player: pl } })
              }
            />
          ))}
        </div>
      )}

      {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
    </div>
  )
}
