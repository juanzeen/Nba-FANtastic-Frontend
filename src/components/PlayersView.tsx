import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api'
import type { OrderKey, PaginationDetails, PeriodKey, Player, StatKey } from '../types'
import { PlayerCard } from './Cards'
import { PaginationBar, STATS } from './PaginationBar'

export function PlayersView() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [pagination, setPagination] = useState<PaginationDetails | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [stat, setStat] = useState<StatKey | ''>('pts')
  const [period, setPeriod] = useState<PeriodKey>('career')
  const [order, setOrder] = useState<OrderKey>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'slug' | 'id'>('slug')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .getPlayers({ page, limit, stat, period, order })
      .then((res) => {
        setPlayers(res.data)
        setPagination(res.pagination)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, limit, stat, period, order])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setLoading(true)
    setError('')
    try {
      const res =
        searchMode === 'slug'
          ? await api.getPlayerBySlug(q.toLowerCase())
          : await api.getPlayerById(Number(q))
      navigate(`/players/${res.data._id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Ordenar por Estatística
            </label>
            <select
              value={stat}
              onChange={(e) => {
                setStat(e.target.value as StatKey | '')
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
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Período</label>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as PeriodKey)
                setPage(1)
              }}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-900"
            >
              <option value="career">Carreira</option>
              <option value="season">Temporada Atual</option>
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
            <label className="block text-xs font-medium text-neutral-500 mb-1">Buscar Por</label>
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as 'slug' | 'id')}
              className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm text-neutral-900"
            >
              <option value="slug">Slug (ex: lebron-james)</option>
              <option value="id">ID do Jogador (ex: 2544)</option>
            </select>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchMode === 'slug' ? 'lebron-james' : '2544'}
            className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-48 text-neutral-900"
          />
          <button
            type="submit"
            className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-sm cursor-pointer transition"
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
        <div className="text-neutral-500 text-sm py-8 text-center">Carregando jogadores...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <PlayerCard
              key={p._id}
              player={p}
              period={period}
              onSelect={(pl) => navigate(`/players/${pl._id}`)}
            />
          ))}
        </div>
      )}

      {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
    </div>
  )
}
