import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { api } from '../api'
import type {
  HistoricalPlayer,
  HistoricalRecord,
  Player,
  Team,
} from '../types'
import { HistoricalPlayerCard, PlayerCard, RecordCard, TeamCard } from './Cards'
import { Hero } from './Hero'

function SectionHeader({
  badge,
  title,
  subtitle,
  to,
  linkLabel,
}: {
  badge: string
  title: string
  subtitle: string
  to: string
  linkLabel: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
          {badge}
        </span>
        <h2 className="text-2xl font-bold text-neutral-950 tracking-tight mt-0.5">{title}</h2>
        <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
      </div>
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 hover:text-orange-600 bg-neutral-100 hover:bg-orange-50 border border-neutral-200 hover:border-orange-200 px-4 py-2 rounded-xl transition"
      >
        {linkLabel} <span>→</span>
      </Link>
    </div>
  )
}

export function HomeView({ teams }: { teams: Team[] }) {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [legends, setLegends] = useState<HistoricalPlayer[]>([])
  const [records, setRecords] = useState<HistoricalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api
        .getPlayers({ page: 1, limit: 4, stat: 'pts', period: 'career', order: 'desc' })
        .then((r) => {
          setPlayers(r.data)
        }),
      api
        .getHistoricalPlayers({ page: 1, limit: 4, stat: 'pts', order: 'desc' })
        .then((r) => {
          setLegends(r.data)
        }),
      api.getHistoricalRecords().then((r) => setRecords(r.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const teamsByPowerRank = [...teams]
    .sort((a, b) => {
      const rankA =
        a.actual_season?.power_ranking?.rank ??
        a.last_season?.power_ranking?.rank ??
        a.last_season?.rank ??
        99
      const rankB =
        b.actual_season?.power_ranking?.rank ??
        b.last_season?.power_ranking?.rank ??
        b.last_season?.rank ??
        99
      return rankA - rankB
    })
    .slice(0, 4)

  return (
    <div className="space-y-12 pb-10">
      <Hero
        totalTeams={teams.length}
        totalRecords={records.length}
      />

      {loading ? (
        <div className="py-16 text-center text-neutral-500 font-medium">
          Carregando vitrine do NBA FANtastic...
        </div>
      ) : (
        <>
          {/* Linha 1: Jogadores em Atividade */}
          <section className="space-y-4">
            <SectionHeader
              badge="Líderes em Atividade"
              title="Jogadores Atuais da NBA"
              subtitle="Maiores pontuadores em atividade na liga, com médias visuais por jogo e indicadores de carreira."
              to="/players"
              linkLabel="Ver Todos os Jogadores"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {players.map((p) => (
                <PlayerCard
                  key={p._id}
                  player={p}
                  period="career"
                  onSelect={() => navigate(`/players/${p._id}`)}
                />
              ))}
            </div>
          </section>

          {/* Linha 2: Franquias Ordenadas por Power Rank */}
          <section className="space-y-4">
            <SectionHeader
              badge="Classificação e Desempenho das Franquias"
              title="Franquias Ordenadas por Power Rank"
              subtitle="Equipes ranqueadas pelo índice composto de força (Power Score), saldo de eficiência e nível competitivo."
              to="/teams"
              linkLabel="Ver Todas as 30 Franquias"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teamsByPowerRank.map((t) => (
                <TeamCard
                  key={t._id}
                  team={t}
                  onSelect={() => navigate('/teams')}
                />
              ))}
            </div>
          </section>

          {/* Linha 3: Jogadores Históricos */}
          <section className="space-y-4">
            <SectionHeader
              badge="Hall da Fama e Ídolos Eternos"
              title="Lendas Históricas da NBA"
              subtitle="Os maiores nomes de todos os tempos com anéis de campeão, prêmios de MVP e temporadas de auge."
              to="/historical-players"
              linkLabel="Explorar Lendas Históricas"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {legends.map((p) => (
                <HistoricalPlayerCard
                  key={p._id}
                  player={p}
                  onSelect={() =>
                    navigate(`/historical-players/${p._id}`, { state: { player: p } })
                  }
                />
              ))}
            </div>
          </section>

          {/* Linha 4: Recordes Históricos */}
          <section className="space-y-4">
            <SectionHeader
              badge="Marcas Históricas da Liga"
              title="Recordes Históricos, de Temporada e de Jogo Único"
              subtitle="As maiores marcas registradas na história da NBA em totais na carreira, médias por temporada e atuações em um único jogo."
              to="/records"
              linkLabel="Ver Todos os 23 Recordes"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {records.slice(0, 4).map((r) => (
                <RecordCard
                  key={r.record}
                  record={r}
                  onSelect={() => navigate('/records')}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
