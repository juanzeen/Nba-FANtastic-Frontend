import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { api } from '../api'
import type { HistoricalPlayer } from '../types'
import { convertHeightToMeters, PlayerAvatar, translatePosition } from './Cards'
import { fmt } from './PaginationBar'

export function HistoricalPlayerDetailView() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const statePlayer = (location.state as { player?: HistoricalPlayer } | null)?.player
  const playerId = Number(id)

  const [player, setPlayer] = useState<HistoricalPlayer | null>(statePlayer ?? null)
  const [loading, setLoading] = useState(!statePlayer)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playerId || Number.isNaN(playerId)) {
      setError('ID de lenda inválido.')
      setLoading(false)
      return
    }

    if (statePlayer && statePlayer._id === playerId) {
      setPlayer(statePlayer)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const fetchLegend = async () => {
      try {
        if (playerId >= 10) {
          const res = await api.getHistoricalPlayerById(playerId)
          setPlayer(res.data)
        } else {
          const listRes = await api.getHistoricalPlayers({ page: 1, limit: 100 })
          const found = listRes.data.find((p) => p._id === playerId)
          if (found) {
            setPlayer(found)
          } else {
            throw new Error('Jogador histórico não encontrado.')
          }
        }
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchLegend()
  }, [playerId, statePlayer])

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500">
        Carregando perfil histórico da lenda...
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="space-y-4">
        <Link
          to="/historical-players"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-orange-600 transition"
        >
          ← Voltar para Lendas Históricas
        </Link>
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
          {error ?? 'Lenda histórica não encontrada.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/historical-players"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-orange-600 transition"
        >
          ← Voltar para Lendas Históricas
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          ID #{player._id} • slug: {player.slug}
        </span>
      </div>

      {/* Cabeçalho da Lenda */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <PlayerAvatar
              id={player._id}
              name={player.full_name}
              className="w-40 h-40 rounded-2xl bg-neutral-50 border border-neutral-200"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Era {player.career_span}
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  {translatePosition(player.position)}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-950">
                {player.full_name}
              </h2>
              <p className="text-sm text-neutral-500">
                {convertHeightToMeters(player.height)} m • {player.country} •{' '}
                {player.career_totals.games_played} jogos disputados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Títulos
              </div>
              <div className="text-2xl font-black text-amber-900 mt-0.5">
                🏆 {player.honors.championships}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                MVPs
              </div>
              <div className="text-2xl font-black text-neutral-950 mt-0.5">
                ⭐ {player.honors.mvps}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                MVP Finais
              </div>
              <div className="text-2xl font-black text-neutral-950 mt-0.5">
                🏅 {player.honors.finals_mvps}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                All-Star
              </div>
              <div className="text-2xl font-black text-neutral-950 mt-0.5">
                ✨ {player.honors.all_stars}x
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auges na Carreira e Totais Acumulados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="font-black text-base text-neutral-950">Auges na Carreira (Por Jogo)</h3>
            <p className="text-xs text-neutral-500">
              Maiores médias alcançadas em uma única temporada
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">PTS/J</div>
              <div className="text-lg font-black text-orange-600 mt-0.5">
                {fmt(player.career_peaks.max_ppg.value)}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {player.career_peaks.max_ppg.season}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">AST/J</div>
              <div className="text-lg font-black text-neutral-950 mt-0.5">
                {fmt(player.career_peaks.max_apg.value)}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {player.career_peaks.max_apg.season}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">REB/J</div>
              <div className="text-lg font-black text-neutral-950 mt-0.5">
                {fmt(player.career_peaks.max_rpg.value)}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {player.career_peaks.max_rpg.season}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">STL/J</div>
              <div className="text-lg font-black text-neutral-950 mt-0.5">
                {fmt(player.career_peaks.max_spg.value)}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {player.career_peaks.max_spg.season}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">BLK/J</div>
              <div className="text-lg font-black text-neutral-950 mt-0.5">
                {fmt(player.career_peaks.max_bpg.value)}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {player.career_peaks.max_bpg.season}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="font-black text-base text-neutral-950">Totais Acumulados na Carreira</h3>
            <p className="text-xs text-neutral-500">
              Soma histórica em todas as temporadas regulares ({player.career_totals.games_played} J)
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">PONTOS</div>
              <div className="text-base font-black text-orange-600 mt-1">
                {player.career_totals.pts.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">AST</div>
              <div className="text-base font-black text-neutral-950 mt-1">
                {player.career_totals.ast.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">REB</div>
              <div className="text-base font-black text-neutral-950 mt-1">
                {player.career_totals.reb.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">STL</div>
              <div className="text-base font-black text-neutral-950 mt-1">
                {player.career_totals.stl.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-neutral-400">BLK</div>
              <div className="text-base font-black text-neutral-950 mt-1">
                {player.career_totals.blk.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Temporadas da Carreira */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-black text-base text-neutral-950">
            Temporadas na Carreira ({player.seasons.length})
          </h3>
          <p className="text-xs text-neutral-500">
            Desempenho detalhado temporada por temporada
          </p>
        </div>

        <div className="overflow-x-auto border border-neutral-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-600 border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Temporada</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Jogos</th>
                <th className="py-2.5 px-3">PTS/J</th>
                <th className="py-2.5 px-3">AST/J</th>
                <th className="py-2.5 px-3">REB/J</th>
                <th className="py-2.5 px-3">STL/J</th>
                <th className="py-2.5 px-3">BLK/J</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {player.seasons.map((s) => (
                <tr
                  key={`${s.season_year}-${s.team}`}
                  className="text-neutral-700 hover:bg-neutral-50"
                >
                  <td className="py-2 px-3 font-semibold text-neutral-900">{s.season_year}</td>
                  <td className="py-2 px-3 font-bold text-orange-600">{s.team}</td>
                  <td className="py-2 px-3">{s.games_played}</td>
                  <td className="py-2 px-3 font-bold text-orange-600">{fmt(s.pts_avg)}</td>
                  <td className="py-2 px-3">{fmt(s.ast_avg)}</td>
                  <td className="py-2 px-3">{fmt(s.reb_avg)}</td>
                  <td className="py-2 px-3">{fmt(s.stl_avg)}</td>
                  <td className="py-2 px-3">{fmt(s.blk_avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
