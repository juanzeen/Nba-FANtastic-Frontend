import type {
  ApiResponse,
  HealthStatus,
  HistoricalPlayer,
  HistoricalRecord,
  HistoricalStatKey,
  MatchupPrediction,
  OrderKey,
  PaginatedResponse,
  PeriodKey,
  Player,
  PlayerSeason,
  SeasonPrediction,
  StatKey,
  Team,
} from "./types";

// ponytail: native fetch wrapper over Vite proxy to localhost:8000; add TanStack Query only if cross-page cache invalidation is needed.
async function get<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "")
        url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json?.detail?.message ||
      (Array.isArray(json?.detail)
        ? json.detail.map((d: { msg: string }) => d.msg).join(", ")
        : null) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

export const api = {
  // Health Check: GET /
  health: () => get<HealthStatus>("/health"),

  // Current NBA Players
  getPlayers: (params: {
    page?: number;
    limit?: number;
    stat?: StatKey | "";
    period?: PeriodKey;
    order?: OrderKey | "";
  }) => get<PaginatedResponse<Player>>("/api/v1/players/", params),
  getPlayerById: (id: number) =>
    get<ApiResponse<Player>>(`/api/v1/players/${id}`),
  getPlayerBySlug: (slug: string) =>
    get<ApiResponse<Player>>(
      `/api/v1/players/search/${encodeURIComponent(slug)}`,
    ),
  getPlayerSeasons: (
    playerId: number,
    params?: { page?: number; limit?: number },
  ) =>
    get<PaginatedResponse<PlayerSeason>>(
      `/api/v1/players/${playerId}/seasons`,
      params,
    ),
  getPlayerSeasonByYear: (playerId: number, seasonYear: string) =>
    get<ApiResponse<PlayerSeason>>(
      `/api/v1/players/${playerId}/seasons/${encodeURIComponent(seasonYear)}`,
    ),
  getPlayersByTeam: (teamAbb: string) =>
    get<ApiResponse<Player[]>>(
      `/api/v1/players/team/${encodeURIComponent(teamAbb.toUpperCase())}`,
    ),

  // Predictions
  getPlayerSeasonPrediction: (id: number) =>
    get<ApiResponse<SeasonPrediction>>(
      `/api/v1/players/${id}/predictions/season`,
    ),
  getPlayerMatchupPrediction: (
    id: number,
    opponentTeamId: number,
    isHome = true,
  ) =>
    get<ApiResponse<MatchupPrediction>>(
      `/api/v1/players/${id}/predictions/matchup/${opponentTeamId}`,
      {
        is_home: isHome,
      },
    ),

  // Teams
  getTeams: (params?: { page?: number; limit?: number }) =>
    get<PaginatedResponse<Team>>("/api/v1/teams/", params),
  getTeamById: (id: number) => get<ApiResponse<Team>>(`/api/v1/teams/${id}`),
  getTeamByAbbreviation: (abb: string) =>
    get<ApiResponse<Team>>(
      `/api/v1/teams/search/${encodeURIComponent(abb.toUpperCase())}/`,
    ),

  // Historical Players
  getHistoricalPlayers: (params: {
    page?: number;
    limit?: number;
    stat?: HistoricalStatKey | "";
    order?: OrderKey | "";
  }) =>
    get<PaginatedResponse<HistoricalPlayer>>(
      "/api/v1/historical-players/",
      params,
    ),
  getHistoricalPlayerById: (id: number) =>
    get<ApiResponse<HistoricalPlayer>>(`/api/v1/historical-players/${id}`),
  getHistoricalPlayerBySlug: (slug: string) =>
    get<ApiResponse<HistoricalPlayer>>(
      `/api/v1/historical-players/search/${encodeURIComponent(slug)}`,
    ),

  // Historical Records
  getHistoricalRecords: () =>
    get<ApiResponse<HistoricalRecord[]>>("/api/v1/historical-records/"),
  getHistoricalRecordByCategory: (category: string) =>
    get<ApiResponse<HistoricalRecord>>(
      `/api/v1/historical-records/${encodeURIComponent(category)}`,
    ),
};
