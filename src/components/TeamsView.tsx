import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api'
import type { PaginationDetails, Player, Team } from '../types'
import {
  PlayerAvatar,
  TeamCard,
  TeamLogo,
  TeamSeasonCard,
  translateConference,
  translateDivision,
  translatePosition,
} from './Cards'
import { fmt, PaginationBar } from './PaginationBar'

export function TeamsView({ initialTeams }: { initialTeams: Team[] }) {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [pagination, setPagination] = useState<PaginationDetails | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'abb' | 'id'>('abb')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [roster, setRoster] = useState<Player[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getTeams({ page, limit })
      .then((r) => {
        setTeams(r.data)
        setPagination(r.pagination)
      })
      .catch((e: Error) => setError(e.message))
  }, [page, limit])

  const selectTeam = (t: Team) => {
    setSelectedTeam(t)
    api
      .getTeamById(t._id)
      .then((r) => setSelectedTeam(r.data))
      .catch(() => {})
    api
      .getPlayersByTeam(t.abbreviation)
      .then((r) => setRoster(r.data))
      .catch(() => setRoster([]))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setError('')
    try {
      const res = mode === 'abb' ? await api.getTeamByAbbreviation(q) : await api.getTeamById(Number(q))
      setTeams([res.data])
      setPagination(null)
      selectTeam(res.data)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-end justify-between gap-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Buscar Franquia Por</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'abb' | 'id')}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-900"
            >
              <option value="abb">Sigla (ex: OKC, LAL)</option>
              <option value="id">ID da Franquia (ex: 1610612760)</option>
            </select>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'abb' ? 'OKC' : '1610612760'}
            className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-44 text-neutral-900"
          />
          <button
            type="submit"
            className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-sm cursor-pointer"
          >
            Buscar Franquia
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setPage(1)
                api.getTeams({ page: 1, limit }).then((r) => {
                  setTeams(r.data)
                  setPagination(r.pagination)
                })
              }}
              className="bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
            >
              Limpar
            </button>
          )}
        </form>

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
            {[10, 15, 30].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <TeamCard
              key={t._id}
              team={t}
              selected={selectedTeam?._id === t._id}
              onSelect={selectTeam}
            />
          ))}
        </div>
        {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
      </div>

      {selectedTeam && (
        <div
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4 gap-3">
              <div className="flex items-center gap-4">
                <TeamLogo
                  teamId={selectedTeam._id}
                  name={selectedTeam.name}
                  className="w-16 h-16"
                />
                <div>
                  <h2 className="text-2xl font-bold text-neutral-950">
                    {selectedTeam.name} ({selectedTeam.abbreviation})
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    ID: #{selectedTeam._id} • {selectedTeam.city} • Conferência{' '}
                    {translateConference(selectedTeam.conference)} (Divisão{' '}
                    {translateDivision(selectedTeam.division)}) • Títulos: {selectedTeam.championships}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-neutral-500 hover:text-neutral-900 text-sm px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 cursor-pointer shrink-0 transition"
              >
                Fechar ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TeamSeasonCard title="Temporada Atual" stats={selectedTeam.actual_season} />
              <TeamSeasonCard title="Última Temporada" stats={selectedTeam.last_season} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-2">
                Elenco da Franquia ({roster.length} Jogadores)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {roster.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/players/${p._id}`)}
                    className="group bg-neutral-50 border border-neutral-200 hover:border-orange-500 hover:bg-orange-50/40 rounded-xl p-2.5 flex items-center justify-between text-xs gap-2 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlayerAvatar id={p._id} name={p.full_name} className="w-9 h-9" />
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-950 truncate group-hover:text-orange-600 transition">
                          {p.full_name}
                        </div>
                        <div className="text-neutral-500">
                          {translatePosition(p.position)} • {p.age} anos
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <span className="text-orange-600 font-bold">{fmt(p.career.avg.points)}</span> PTS/J
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
