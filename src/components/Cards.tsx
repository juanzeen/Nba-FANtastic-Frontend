import type {
  ConfidenceIntervals,
  HistoricalPlayer,
  HistoricalRecord,
  PeriodKey,
  Player,
  ProjectedAvg,
  Team,
} from '../types'
import { fmt } from './PaginationBar'

const POSITION_PT: Record<string, string> = {
  Guard: 'Armador',
  Forward: 'Ala',
  Center: 'Pivô',
  'Guard-Forward': 'Ala-Armador',
  'Forward-Guard': 'Ala-Armador',
  'Forward-Center': 'Ala-Pivô',
  'Center-Forward': 'Ala-Pivô',
}

const CONFERENCE_PT: Record<string, string> = {
  East: 'Leste',
  West: 'Oeste',
}

const DIVISION_PT: Record<string, string> = {
  Atlantic: 'Atlântico',
  Central: 'Central',
  Southeast: 'Sudeste',
  Northwest: 'Noroeste',
  Pacific: 'Pacífico',
  Southwest: 'Sudoeste',
}

const TIER_PT: Record<string, string> = {
  'Championship Contender': 'Candidato ao Título',
  'Playoff Contender': 'Candidato aos Playoffs',
  'Play-In Contender': 'Disputa de Play-In',
  Rebuilding: 'Em Reconstrução',
}

const RECORD_PT: Record<string, string> = {
  ALL_TIME_PTS: 'MAIOR PONTUADOR DA HISTÓRIA',
  ALL_TIME_AST: 'MAIS ASSISTÊNCIAS NA HISTÓRIA',
  ALL_TIME_REB: 'MAIS REBOTES NA HISTÓRIA',
  ALL_TIME_BLK: 'MAIS TOCOS NA HISTÓRIA',
  ALL_TIME_STL: 'MAIS ROUBOS NA HISTÓRIA',
  ALL_TIME_FG3M: 'MAIS BOLAS DE 3 NA HISTÓRIA',
  ALL_TIME_FGM: 'MAIS CESTAS DE QUADRA NA HISTÓRIA',
  ALL_TIME_GP: 'MAIS JOGOS DISPUTADOS NA HISTÓRIA',
  SEASON_PPG: 'MAIOR MÉDIA DE PONTOS (TEMPORADA)',
  SEASON_APG: 'MAIOR MÉDIA DE ASSISTÊNCIAS (TEMPORADA)',
  SEASON_RPG: 'MAIOR MÉDIA DE REBOTES (TEMPORADA)',
  SEASON_BPG: 'MAIOR MÉDIA DE TOCOS (TEMPORADA)',
  SEASON_SPG: 'MAIOR MÉDIA DE ROUBOS (TEMPORADA)',
  SEASON_3PG: 'MAIOR MÉDIA DE BOLAS DE 3 (TEMPORADA)',
  SEASON_FGPG: 'MAIOR MÉDIA DE CESTAS (TEMPORADA)',
  GAME_PTS: 'MAIS PONTOS EM UM ÚNICO JOGO',
  GAME_AST: 'MAIS ASSISTÊNCIAS EM UM JOGO',
  GAME_REB: 'MAIS REBOTES EM UM JOGO',
  GAME_BLK: 'MAIS TOCOS EM UM JOGO',
  GAME_3PM: 'MAIS BOLAS DE 3 EM UM JOGO',
  GAME_FGM: 'MAIS CESTAS EM UM JOGO',
  GAME_STL_1: 'MAIS ROUBOS EM UM JOGO (#1)',
  GAME_STL_2: 'MAIS ROUBOS EM UM JOGO (#2)',
}

export const translatePosition = (pos: string) => POSITION_PT[pos] ?? pos
export const translateConference = (conf: string) => CONFERENCE_PT[conf] ?? conf
export const translateDivision = (div: string) => DIVISION_PT[div] ?? div
export const translateTier = (tier: string | null | undefined) =>
  tier ? (TIER_PT[tier] ?? tier) : 'Franquia da NBA'
export const translateRecord = (rec: string) => RECORD_PT[rec] ?? rec.replaceAll('_', ' ')

export const playerHeadshotUrl = (id: number) =>
  `https://cdn.nba.com/headshots/nba/latest/260x190/${id}.png`

export function PlayerAvatar({
  id,
  name,
  className = 'w-14 h-14',
}: {
  id: number
  name: string
  className?: string
}) {
  return (
    <img
      src={playerHeadshotUrl(id)}
      alt={name}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png'
      }}
      className={`${className} object-cover object-center  shrink-0`}
    />
  )
}

export const TEAM_ID_BY_ABBR: Record<string, number> = {
  ATL: 1610612737,
  BOS: 1610612738,
  CLE: 1610612739,
  NOP: 1610612740,
  CHI: 1610612741,
  DAL: 1610612742,
  DEN: 1610612743,
  GSW: 1610612744,
  HOU: 1610612745,
  LAC: 1610612746,
  LAL: 1610612747,
  MIA: 1610612748,
  MIL: 1610612749,
  MIN: 1610612750,
  BKN: 1610612751,
  NYK: 1610612752,
  ORL: 1610612753,
  IND: 1610612754,
  PHI: 1610612755,
  PHX: 1610612756,
  POR: 1610612757,
  SAC: 1610612758,
  SAS: 1610612759,
  OKC: 1610612760,
  TOR: 1610612761,
  UTA: 1610612762,
  MEM: 1610612763,
  WAS: 1610612764,
  DET: 1610612765,
  CHA: 1610612766,
}

export function TeamLogo({
  abbr,
  teamId,
  name,
  className = 'w-10 h-10',
}: {
  abbr?: string
  teamId?: number
  name?: string
  className?: string
}) {
  const resolvedId = teamId ?? (abbr ? TEAM_ID_BY_ABBR[abbr.toUpperCase()] : undefined)

  return (
    <img
      src={`https://cdn.nba.com/logos/nba/${resolvedId}/global/L/logo.svg`}
      alt={name ?? abbr ?? ''}
      loading="lazy"
      className={`${className} object-contain shrink-0`}
    />
  )
}

export function convertHeightToMeters(cm: Number) {
  const cmString = cm.toString()
  return `${cmString[0]},${cmString[1]}${cmString[2]}`
}

function StatBar({
  label,
  value,
  max,
  highlight = false,
}: {
  label: string
  value: number | null | undefined
  max: number
  highlight?: boolean
}) {
  const num = value ?? 0
  const pct = Math.min(100, Math.max(6, Math.round((num / max) * 100)))
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-neutral-500">{label}</span>
        <span className={`font-bold ${highlight ? 'text-orange-600' : 'text-neutral-950'}`}>
          {fmt(value)}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${highlight ? 'bg-orange-500' : 'bg-neutral-800'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PlayerCard({
  player,
  period = 'career',
  selected = false,
  onSelect,
}: {
  player: Player
  period?: PeriodKey
  selected?: boolean
  onSelect?: (p: Player) => void
}) {
  const stats = period === 'season' ? player.season.avg : player.career.avg
  const games = period === 'season' ? player.season.totals.games : player.career.totals.games
  return (
    <div
      onClick={() => onSelect?.(player)}
      className={`group rounded-2xl border bg-white p-5 transition shadow-xs hover:shadow-md ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-orange-500 ring-2 ring-orange-500/20'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative">
            <PlayerAvatar id={player._id} name={player.full_name} className="w-16 h-16" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                {player.team.abbreviation}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-medium text-neutral-500">
                {translatePosition(player.position)}
              </span>
            </div>
            <h3 className="font-bold text-base text-neutral-950 truncate group-hover:text-orange-600 transition">
              {player.full_name}
            </h3>
            <p className="text-xs text-neutral-500">
              {convertHeightToMeters(player.height)} m • {player.age} anos • {player.country}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-neutral-100 grid grid-cols-3 gap-3">
        <StatBar label="PTS" value={stats.points} max={35} highlight />
        <StatBar label="AST" value={stats.assists} max={12} />
        <StatBar label="REB" value={stats.rebounds} max={15} />
      </div>

      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span>{player.career_span}</span>
        <span>
          STL <b className="text-neutral-800">{fmt(stats.steals)}</b> • BLK{' '}
          <b className="text-neutral-800">{fmt(stats.blocks)}</b>
        </span>
      </div>
    </div>
  )
}

export function PredictionTable({ avg, ci }: { avg: ProjectedAvg; ci: ConfidenceIntervals }) {
  const rows = [
    { label: 'PTS', val: avg.pts, range: ci.pts_range },
    { label: 'AST', val: avg.ast, range: ci.ast_range },
    { label: 'REB', val: avg.reb, range: ci.reb_range },
    { label: 'STL', val: avg.stl, range: ci.stl_range },
    { label: 'BLK', val: avg.blk, range: ci.blk_range },
  ]
  return (
    <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
      {rows.map((r) => (
        <div key={r.label} className="bg-white px-2 py-4 rounded-lg border border-neutral-200">
          <div className="text-neutral-500 text-[10px] font-medium">{r.label}</div>
          <div className="font-bold text-sm text-neutral-950">{fmt(r.val)}</div>
          <div className="text-[10px] text-neutral-400">
            {fmt(r.range?.[0])}–{fmt(r.range?.[1])}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TeamCard({
  team,
  selected = false,
  onSelect,
}: {
  team: Team
  selected?: boolean
  onSelect?: (t: Team) => void
}) {
  const s = team.actual_season?.record?.wins != null ? team.actual_season : team.last_season
  const rank = s.power_ranking.rank ?? s.rank
  const score = s.power_ranking.power_score ?? 0
  const winPct = s.record.win_pct != null ? Math.round(s.record.win_pct * 100) : 0

  return (
    <div
      onClick={() => onSelect?.(team)}
      className={`group rounded-2xl border bg-white p-5 transition shadow-xs hover:shadow-md ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-orange-500 ring-2 ring-orange-500/20'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center p-2 shrink-0">
            <TeamLogo teamId={team._id} name={team.name} className="w-10 h-10" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-orange-600">{team.abbreviation}</span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs text-neutral-500">
                {translateConference(team.conference)} • {translateDivision(team.division)}
              </span>
            </div>
            <h3 className="font-bold text-base text-neutral-950 truncate group-hover:text-orange-600 transition">
              {team.name}
            </h3>
            <p className="text-xs text-neutral-500">
              Fund. {team.founded_in} • 🏆 {team.championships}{' '}
              {team.championships === 1 ? 'Título' : 'Títulos'}
            </p>
          </div>
        </div>

        {rank != null && (
          <div className="flex flex-col items-end shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-neutral-950 text-white">
              #{rank}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-neutral-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-neutral-600">
            {translateTier(s.power_ranking.tier)}
          </span>
          <span className="font-bold text-neutral-950">
            {s.record.wins ?? 0}V – {s.record.losses ?? 0}D ({winPct}%)
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>Power Score</span>
            <span className="font-bold text-orange-600">{fmt(score)} / 100</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${Math.min(100, Math.max(8, score))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="bg-neutral-50 border border-neutral-100 rounded-lg py-1.5">
            <span className="block text-[10px] text-neutral-400">ORTG</span>
            <b className="text-neutral-900">{fmt(s.metrics.offensive_rating)}</b>
          </div>
          <div className="bg-neutral-50 border border-neutral-100 rounded-lg py-1.5">
            <span className="block text-[10px] text-neutral-400">DRTG</span>
            <b className="text-neutral-900">{fmt(s.metrics.defensive_rating)}</b>
          </div>
          <div className="bg-neutral-50 border border-neutral-100 rounded-lg py-1.5">
            <span className="block text-[10px] text-neutral-400">SALDO</span>
            <b
              className={
                (s.metrics.net_rating ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }
            >
              {(s.metrics.net_rating ?? 0) > 0 ? '+' : ''}
              {fmt(s.metrics.net_rating)}
            </b>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamSeasonCard({ title, stats }: { title: string; stats: Team['last_season'] }) {
  const m = stats.metrics
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <span className="font-bold text-sm text-orange-600">{title}</span>
        <span className="text-neutral-700">
          Campanha: <b className="text-neutral-950">{stats.record.wins ?? '—'}V</b>-
          <b className="text-neutral-950">{stats.record.losses ?? '—'}D</b> (Pos. #
          {stats.rank ?? '—'})
        </span>
      </div>
      <div className="flex justify-between text-neutral-600">
        <span>Nível: <b className="text-neutral-900">{translateTier(stats.power_ranking.tier)}</b></span>
        <span>Power Score: <b className="text-neutral-900">{fmt(stats.power_ranking.power_score)}</b></span>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 text-center">
        <div className="bg-white border border-neutral-200 p-2 rounded-lg">
          <div className="text-neutral-400">ORTG</div>
          <div className="font-bold text-neutral-950">{fmt(m.offensive_rating)}</div>
        </div>
        <div className="bg-white border border-neutral-200 p-2 rounded-lg">
          <div className="text-neutral-400">DRTG</div>
          <div className="font-bold text-neutral-950">{fmt(m.defensive_rating)}</div>
        </div>
        <div className="bg-white border border-neutral-200 p-2 rounded-lg">
          <div className="text-neutral-400">SALDO</div>
          <div className="font-bold text-neutral-950">{fmt(m.net_rating)}</div>
        </div>
        <div className="bg-white border border-neutral-200 p-2 rounded-lg">
          <div className="text-neutral-400">PTS / SOFR</div>
          <div className="font-bold text-neutral-950">
            {fmt(m.pts_per_game)} / {fmt(m.pts_allowed_per_game)}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 p-2 rounded-lg">
          <div className="text-neutral-400">REB / SOFR</div>
          <div className="font-bold text-neutral-950">
            {fmt(m.reb_per_game)} / {fmt(m.reb_allowed_per_game)}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 p-2 rounded-lg">
          <div className="text-neutral-400">RITMO (PACE)</div>
          <div className="font-bold text-neutral-950">{fmt(m.pace)}</div>
        </div>
      </div>
    </div>
  )
}

export function HistoricalPlayerCard({
  player,
  selected = false,
  onSelect,
}: {
  player: HistoricalPlayer
  selected?: boolean
  onSelect?: (p: HistoricalPlayer) => void
}) {
  return (
    <div
      onClick={() => onSelect?.(player)}
      className={`group rounded-2xl border bg-white p-5 transition shadow-xs hover:shadow-md ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-orange-500 ring-2 ring-orange-500/20'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <PlayerAvatar id={player._id} name={player.full_name} className="w-14 h-14" />
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              {player.career_span}
            </span>
            <h3 className="font-bold text-base text-neutral-950 truncate group-hover:text-orange-600 transition">
              {player.full_name}
            </h3>
            <p className="text-xs text-neutral-500">
              {translatePosition(player.position)} • {convertHeightToMeters(player.height)} m • {player.country}
            </p>
          </div>
        </div>
      </div>

      {/* Pílulas de Honrarias */}
      <div className="flex flex-wrap gap-1.5 mt-3.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
           💍 {player.honors.championships} {player.honors.championships === 1 ? 'Título' : 'Títulos'}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
          {player.honors.mvps} MVP
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
          {player.honors.all_stars}x All-Star
        </span>
      </div>

      {/* Auge e Totais de Carreira */}
      <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
          <span className="block text-[10px] text-neutral-400">PTS CARREIRA</span>
          <b className="text-orange-600 text-sm">{player.career_totals.pts.toLocaleString('pt-BR')}</b>
        </div>
        <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
          <span className="block text-[10px] text-neutral-400">AST CARREIRA</span>
          <b className="text-neutral-900 text-sm">{player.career_totals.ast.toLocaleString('pt-BR')}</b>
        </div>
        <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
          <span className="block text-[10px] text-neutral-400">REB CARREIRA</span>
          <b className="text-neutral-900 text-sm">{player.career_totals.reb.toLocaleString('pt-BR')}</b>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-500">
        <span>
          Auge PTS/J: <b className="text-neutral-900">{fmt(player.career_peaks.max_ppg.value)}</b> (
          {player.career_peaks.max_ppg.season})
        </span>
        <span>{player.career_totals.games_played} J</span>
      </div>
    </div>
  )
}

export function RecordCard({
  record,
  onSelect,
}: {
  record: HistoricalRecord
  onSelect?: (category: string) => void
}) {
  return (
    <div
      onClick={() => onSelect?.(record.record)}
      className={`bg-white border border-neutral-200 hover:border-orange-500 rounded-2xl p-5 transition shadow-xs hover:shadow-md flex flex-col justify-between ${
        onSelect ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 text-orange-700 truncate">
          {translateRecord(record.record)}
        </span>
        <span
          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
            record.is_active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {record.is_active ? 'Em Atividade' : 'Lenda'}
        </span>
      </div>
      <div className="my-4 flex items-center gap-3.5">
        <PlayerAvatar id={record.leader_id} name={record.leader_full_name} className="w-14 h-14" />
        <div>
          <div className="text-2xl font-black text-neutral-950 tracking-tight">
            {record.value.toLocaleString('pt-BR')}
          </div>
          <div className="font-semibold text-neutral-700">{record.leader_full_name}</div>
        </div>
      </div>
      <div className="text-xs text-neutral-500 border-t border-neutral-100 pt-2.5 flex justify-between">
        <span>{record.details.team ?? 'Recorde Histórico na Carreira'}</span>
        <span className="font-medium text-neutral-700">{record.details.season ?? ''}</span>
      </div>
    </div>
  )
}
