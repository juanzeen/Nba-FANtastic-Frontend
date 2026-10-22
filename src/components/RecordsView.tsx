import { useEffect, useState } from 'react'
import { api } from '../api'
import type { HistoricalRecord } from '../types'
import { PlayerAvatar, RecordCard, translateRecord } from './Cards'

export function RecordsView() {
  const [records, setRecords] = useState<HistoricalRecord[]>([])
  const [categoryQuery, setCategoryQuery] = useState('')
  const [highlighted, setHighlighted] = useState<HistoricalRecord | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getHistoricalRecords()
      .then((r) => setRecords(r.data))
      .catch((e: Error) => setError(e.message))
  }, [])

  const inspectCategory = async (category: string) => {
    setError('')
    try {
      const res = await api.getHistoricalRecordByCategory(category)
      setHighlighted(res.data)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-bold text-base text-neutral-950">
            Recordes Históricos, de Temporada e de Jogo Único da NBA
          </h2>
          <p className="text-xs text-neutral-500">
            Clique em qualquer card de recorde ou busque por código de categoria (ex: ALL_TIME_PTS, SEASON_PPG, GAME_PTS)
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (categoryQuery.trim()) inspectCategory(categoryQuery.trim().toUpperCase())
          }}
          className="flex items-center gap-2"
        >
          <input
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            placeholder="ALL_TIME_PTS"
            className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-44 text-neutral-900"
          />
          <button
            type="submit"
            className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-sm cursor-pointer"
          >
            Buscar Categoria
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {highlighted && (
        <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <PlayerAvatar id={highlighted.leader_id} name={highlighted.leader_full_name} className="w-16 h-16" />
            <div>
              <span className="text-xs font-mono font-bold uppercase text-orange-600">
                {translateRecord(highlighted.record)} ({highlighted.record})
              </span>
              <h3 className="text-xl font-black text-neutral-950">
                {highlighted.leader_full_name} — {highlighted.value.toLocaleString('pt-BR')}
              </h3>
              <p className="text-xs text-neutral-500">
                ID do Líder #{highlighted.leader_id} •{' '}
                {highlighted.is_active ? 'Jogador em Atividade' : 'Lenda Histórica'}
                {highlighted.details.season ? ` • ${highlighted.details.season}` : ''}
                {highlighted.details.team ? ` (${highlighted.details.team})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setHighlighted(null)}
            className="text-xs bg-white px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((r) => (
          <RecordCard key={r.record} record={r} onSelect={inspectCategory} />
        ))}
      </div>
    </div>
  )
}
