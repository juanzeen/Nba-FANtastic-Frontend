export type StatKey = 'pts' | 'ast' | 'reb' | 'stl' | 'blk'
export type HistoricalStatKey = 'pts' | 'ast' | 'reb' | 'stl' | 'blk' | 'championships'
export type TeamStatKey =
  | 'pts'
  | 'ast'
  | 'reb'
  | 'stl'
  | 'blk'
  | 'championships'
  | 'power-rank'
  | 'league-rank'
export type PositionFilterKey = 'guard' | 'forward' | 'center'
export type RecordLabelKey =
  | 'points'
  | 'rebounds'
  | 'assists'
  | 'blocks'
  | 'steals'
  | '3pm'
  | 'fg'
  | 'gp'
export type PeriodKey = 'season' | 'career'
export type OrderKey = 'asc' | 'desc'

export interface PaginationDetails {
  page: number
  limit: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface PaginatedResponse<T> {
  message: string
  data: T[]
  pagination: PaginationDetails
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface PlayerTotalsStats {
  games: number | null
  points: number | null
  assists: number | null
  rebounds: number | null
  blocks: number | null
  steals: number | null
}

export interface PlayerAvgStats {
  points: number | null
  assists: number | null
  rebounds: number | null
  blocks: number | null
  steals: number | null
}

export interface Player {
  _id: number
  full_name: string
  age: number
  slug: string
  height: number
  position: string
  country: string
  career_span: string
  career: { totals: PlayerTotalsStats; avg: PlayerAvgStats }
  season: { totals: PlayerTotalsStats; avg: PlayerAvgStats }
  team: { abbreviation: string; name: string }
}

export interface Peak {
  value: number
  game_id: number
  opponent: string
  date: string
}

export interface PerformanceVsTeam {
  team: string
  games_played: number
  avg_pts: number
  avg_ast: number
  avg_reb: number
  avg_blk: number
  avg_stl: number
}

export interface GameLog {
  game_id: number
  date: string
  opponent: string
  result: string
  is_home: boolean
  playoffs: boolean
  minutes: string
  pts: number
  ast: number
  reb: number
  stl: number
  blk: number
  fg_pct: number
  fg3_pct: number
  ft_pct: number
}

export interface PlayerSeason {
  _id: string
  player_id: number
  season_year: string
  team: { abbreviation: string; name: string }
  season_totals: { games_played: number; pts: number; ast: number; reb: number; blk: number; stl: number }
  season_averages: { pts: number; ast: number; reb: number; blk: number; stl: number }
  season_peaks: { max_pts: Peak; max_ast: Peak; max_reb: Peak; max_stl: Peak; max_blk: Peak }
  performance_vs_teams: PerformanceVsTeam[]
  games: GameLog[]
}

export interface ProjectedAvg {
  pts: number
  ast: number
  reb: number
  stl: number
  blk: number
}

export interface ConfidenceIntervals {
  pts_range: [number, number]
  ast_range: [number, number]
  reb_range: [number, number]
  stl_range: [number, number]
  blk_range: [number, number]
}

export interface SeasonPrediction {
  player_id: number
  full_name: string
  projected_averages: ProjectedAvg
  confidence_intervals: ConfidenceIntervals
  params: { age: number; age_adjustment_pct: string }
}

export interface MatchupPrediction {
  player_id: number
  full_name: string
  opponent_id: number
  opponent_name: string
  projected_averages: ProjectedAvg
  confidence_intervals: ConfidenceIntervals
  factors: {
    pace_factor: number
    defense_factors: ProjectedAvg
    is_home: boolean
  }
}

export interface TeamSeasonStats {
  rank: number | null
  record: { wins: number | null; losses: number | null; win_pct: number | null }
  power_ranking: { rank: number | null; tier: string | null; power_score: number | null; trend: string | null }
  metrics: {
    pace: number | null
    offensive_rating: number | null
    defensive_rating: number | null
    net_rating: number | null
    pts_per_game: number | null
    pts_allowed_per_game: number | null
    ast_per_game: number | null
    ast_allowed_per_game: number | null
    reb_per_game: number | null
    reb_allowed_per_game: number | null
    dreb_per_game: number | null
    dreb_allowed_per_game: number | null
    oreb_per_game: number | null
    oreb_allowed_per_game: number | null
    stl_per_game: number | null
    stl_allowed_per_game: number | null
    blk_per_game: number | null
    blk_allowed_per_game: number | null
  }
}

export interface Team {
  _id: number
  abbreviation: string
  name: string
  city: string
  conference: string
  division: string
  founded_in: number
  championships: number
  last_season: TeamSeasonStats
  actual_season: TeamSeasonStats
}

export interface SeasonAverageStat {
  season: string
  value: number
}

export interface HistoricalPlayer {
  _id: number
  full_name: string
  slug: string
  country: string
  position: string
  height: number
  career_span: string
  is_active: boolean
  career_peaks: {
    max_ppg: SeasonAverageStat
    max_apg: SeasonAverageStat
    max_rpg: SeasonAverageStat
    max_bpg: SeasonAverageStat
    max_spg: SeasonAverageStat
  }
  career_totals: {
    games_played: number
    pts: number
    ast: number
    reb: number
    stl: number
    blk: number
  }
  honors: {
    all_stars: number
    mvps: number
    finals_mvps: number
    championships: number
  }
  seasons: {
    season_year: string
    team: string
    games_played: number
    pts_avg: number
    ast_avg: number
    reb_avg: number
    blk_avg: number
    stl_avg: number
  }[]
}

export interface HistoricalRecord {
  _id?: number
  record: string
  title?: string
  label?: string
  value: number
  leader_full_name: string
  leader_id: number
  is_active: boolean
  details: {
    season: string | null
    team: string | null
  }
}

export interface HealthStatus {
  status: string
  services: Record<string, string>
}
