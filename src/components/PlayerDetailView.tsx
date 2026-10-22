import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../api";
import type {
  MatchupPrediction,
  Player,
  PlayerSeason,
  SeasonPrediction,
  Team,
} from "../types";
import {
  convertHeightToMeters,
  PlayerAvatar,
  PredictionTable,
  TeamLogo,
  translatePosition,
} from "./Cards";
import { fmt } from "./PaginationBar";

export function PlayerDetailView({ teams = [] }: { teams?: Team[] }) {
  const { id } = useParams<{ id: string }>();
  const playerId = Number(id);

  const [player, setPlayer] = useState<Player | null>(null);
  const [teamsList, setTeamsList] = useState<Team[]>(teams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seasonPred, setSeasonPred] = useState<SeasonPrediction | null>(null);
  const [matchupPred, setMatchupPred] = useState<MatchupPrediction | null>(
    null,
  );
  const [opponentId, setOpponentId] = useState<number>(1610612738);
  const [isHome, setIsHome] = useState(true);

  const [seasons, setSeasons] = useState<PlayerSeason[]>([]);
  const [selectedSeasonYear, setSelectedSeasonYear] = useState("");
  const [seasonDetail, setSeasonDetail] = useState<PlayerSeason | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (teams.length > 0) setTeamsList(teams);
  }, [teams]);

  useEffect(() => {
    if (!playerId || Number.isNaN(playerId)) {
      setError("ID de jogador inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSeasonPred(null);
    setMatchupPred(null);
    setSeasons([]);
    setSeasonDetail(null);

    Promise.all([
      api.getPlayerById(playerId),
      teams.length === 0
        ? api
            .getTeams({ page: 1, limit: 30 })
            .catch(() => ({ data: [] as Team[] }))
        : Promise.resolve({ data: teams }),
      api.getPlayerSeasonPrediction(playerId).catch(() => null),
      api.getPlayerSeasons(playerId, { page: 1, limit: 30 }).catch(() => null),
    ])
      .then(([playerRes, teamsRes, predRes, seasonsRes]) => {
        setPlayer(playerRes.data);
        if (teamsRes.data.length > 0) {
          setTeamsList(teamsRes.data);
          setOpponentId(teamsRes.data[0]._id);
        }
        if (predRes?.data) setSeasonPred(predRes.data);
        if (seasonsRes?.data && seasonsRes.data.length > 0) {
          setSeasons(seasonsRes.data);
          const firstYear = seasonsRes.data[0].season_year;
          setSelectedSeasonYear(firstYear);
          api
            .getPlayerSeasonByYear(playerId, firstYear)
            .then((sr) => setSeasonDetail(sr.data))
            .catch(() => setSeasonDetail(seasonsRes.data[0]));
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [playerId]);

  useEffect(() => {
    if (!player || !opponentId) return;
    setDetailLoading(true);
    api
      .getPlayerMatchupPrediction(player._id, opponentId, isHome)
      .then((res) => setMatchupPred(res.data))
      .catch(() => setMatchupPred(null))
      .finally(() => setDetailLoading(false));
  }, [player, opponentId, isHome]);

  const handleSeasonChange = (yr: string) => {
    setSelectedSeasonYear(yr);
    if (!player) return;
    api
      .getPlayerSeasonByYear(player._id, yr)
      .then((r) => setSeasonDetail(r.data))
      .catch(() => {
        const fallback = seasons.find((s) => s.season_year === yr) ?? null;
        setSeasonDetail(fallback);
      });
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500">
        Carregando perfil completo do jogador...
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="space-y-4">
        <Link
          to="/players"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-orange-600 transition"
        >
          ← Voltar para Jogadores
        </Link>
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
          {error ?? "Jogador não encontrado."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/players"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-orange-600 transition"
        >
          ← Voltar para Jogadores
        </Link>
      </div>

      {/* Cabeçalho do Jogador */}
      <div className="relative bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex flex-col items-center sm:flex-row gap-8">
            <PlayerAvatar
              id={player._id}
              name={player.full_name}
              className="w-40 h-40 rounded-2xl bg-neutral-50 border border-neutral-200"
            />
            <div className="w-full space-y-1.5 flex flex-col justify-start items-start sm:justify-center gap-2">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-950">
                {player.full_name}
              </h2>
              <span className="hidden text-xs sm:block font-semibold text-neutral-500">
                {translatePosition(player.position)} • {player.team.name}
              </span>
              <span className="text-xs sm:hidden font-semibold text-neutral-500">
                {translatePosition(player.position)} • {player.team.abbreviation}
              </span>
              <p className="text-sm text-neutral-500">
                {convertHeightToMeters(player.height)} m • {player.age} anos •{" "}
                {player.country}
              </p>
              <p className="text-sm text-neutral-500">
                {player.career_span}
              </p>
            </div>
          </div>
          <TeamLogo abbr={player.team.abbreviation} className="absolute w-30 h-30 bottom-4 right-4 sm:static sm:w-40 sm:h-40" />
        </div>
      </div>

      {/* Estatísticas da Temporada Atual vs Carreira */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-black text-base text-neutral-950">
              Temporada Atual
            </h3>
            <span className=" px-2.5 py-1 text-xs rounded-full font-bold bg-orange-50 text-orange-700 border border-orange-200">
              2026-27
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                PTS
              </div>
              <div className="text-xl font-black text-orange-600 mt-0.5">
                {(player.season.totals.points ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.season.avg.points)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                AST
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.season.totals.assists ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.season.avg.assists)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                REB
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.season.totals.rebounds ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.season.avg.rebounds)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                STL
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.season.totals.steals ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.season.avg.steals)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                BLK
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.season.totals.blocks ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.season.avg.blocks)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                Jogos
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {player.season.totals.games ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-black text-base text-neutral-950">
              Totais e Médias na Carreira
            </h3>
            <span className="text-neutral-500 text-xs">Desde { player.career_span.slice(0,4)}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                PTS
              </div>
              <div className="text-xl font-black text-orange-600 mt-0.5">
                {(player.career.totals.points ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.career.avg.points)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                AST
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.career.totals.assists ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.career.avg.assists)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                REB
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.career.totals.rebounds ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.career.avg.rebounds)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                STL
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.career.totals.steals ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.career.avg.steals)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                BLK
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {(player.career.totals.blocks ?? 0).toLocaleString("pt-BR")}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Méd: {fmt(player.career.avg.blocks)}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-neutral-400">
                Jogos
              </div>
              <div className="text-xl font-black text-neutral-950 mt-0.5">
                {player.career.totals.games ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projeção de Temporada e Simulador de Confronto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col items-start gap-2">
            <div>
              <h3 className="font-black text-base text-neutral-950">
                Projeção da Próxima Temporada
              </h3>
              <p className="text-xs text-neutral-500">
                Médias projetadas e intervalos de confiança
              </p>
            </div>
          </div>
          {seasonPred ? (
            <PredictionTable
              avg={seasonPred.projected_averages}
              ci={seasonPred.confidence_intervals}
            />
          ) : (
            <div className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              Projeção de temporada indisponível para este jogador.
            </div>
          )}
          {seasonPred && (
            <span className="text-xs font-medium text-neutral-600  ">
              Fator idade ({seasonPred.params.age_adjustment_pct})
            </span>
          )}
          <div className="text-xs text-neutral-500">
            Projeção feita com o jogador atuando em 82 partidas na temporada.
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-base text-neutral-950">
                Projeção de Confronto (Matchup)
              </h3>
              <p className="text-xs text-neutral-500">
                Simule o desempenho contra qualquer adversário
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={opponentId}
                onChange={(e) => setOpponentId(Number(e.target.value))}
                className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900"
              >
                {teamsList.map((t) => (
                  <option key={t._id} value={t._id}>
                    vs {t.abbreviation} ({t.name})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsHome((v) => !v)}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white font-medium text-neutral-800 cursor-pointer"
              >
                {isHome ? "Casa" : "Fora"}
              </button>
            </div>
          </div>

          {detailLoading ? (
            <div className="text-xs text-neutral-400">
              Calculando simulação...
            </div>
          ) : matchupPred ? (
            <div className="space-y-2">
              <PredictionTable
                avg={matchupPred.projected_averages}
                ci={matchupPred.confidence_intervals}
              />
              <div className="text-[11px] text-neutral-500">
                Fator de Ritmo (Pace):{" "}
                <b className="text-neutral-900">
                  {fmt(matchupPred.factors.pace_factor, 2)}
                </b>{" "}
                • Def PTS:{" "}
                <b className="text-neutral-900">
                  {fmt(matchupPred.factors.defense_factors.pts, 2)}
                </b>
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-400">
              Selecione um adversário para simular.
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Temporadas e Game Logs */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="font-black text-base text-neutral-950">
              Histórico de Temporadas ({seasons.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Totais, médias, recordes da temporada e últimos jogos disputados
            </p>
          </div>
          {seasons.length > 0 && (
            <select
              value={selectedSeasonYear}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-900"
            >
              {seasons.map((s) => (
                <option key={s._id} value={s.season_year}>
                  {s.season_year} — {s.team.abbreviation} (
                  {s.season_totals.games_played} J)
                </option>
              ))}
            </select>
          )}
        </div>

        {seasonDetail ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                <div className="text-neutral-400">JOGOS</div>
                <div className="font-bold text-base text-neutral-950 mt-0.5">
                  {seasonDetail.season_totals.games_played}
                </div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                <div className="text-neutral-400">PTS</div>
                <div className="font-bold text-base text-orange-600 mt-0.5">
                  {seasonDetail.season_totals.pts.toLocaleString("pt-BR")}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Méd: {fmt(seasonDetail.season_averages.pts)}
                </div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                <div className="text-neutral-400">AST</div>
                <div className="font-bold text-base text-neutral-950 mt-0.5">
                  {seasonDetail.season_totals.ast.toLocaleString("pt-BR")}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Méd: {fmt(seasonDetail.season_averages.ast)}
                </div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                <div className="text-neutral-400">REB</div>
                <div className="font-bold text-base text-neutral-950 mt-0.5">
                  {seasonDetail.season_totals.reb.toLocaleString("pt-BR")}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Méd: {fmt(seasonDetail.season_averages.reb)}
                </div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                <div className="text-neutral-400">STL</div>
                <div className="font-bold text-base text-neutral-950 mt-0.5">
                  {seasonDetail.season_totals.stl.toLocaleString("pt-BR")}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Méd: {fmt(seasonDetail.season_averages.stl)}
                </div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                <div className="text-neutral-400">BLK</div>
                <div className="font-bold text-base text-neutral-950 mt-0.5">
                  {seasonDetail.season_totals.blk.toLocaleString("pt-BR")}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Méd: {fmt(seasonDetail.season_averages.blk)}
                </div>
              </div>
            </div>

            {seasonDetail.season_peaks && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-neutral-600">
                Recordes na Temporada: Máx PTS{" "}
                <b className="text-neutral-950">
                  {seasonDetail.season_peaks.max_pts?.value}
                </b>{" "}
                (vs {seasonDetail.season_peaks.max_pts?.opponent}) • Máx AST{" "}
                <b className="text-neutral-950">
                  {seasonDetail.season_peaks.max_ast?.value}
                </b>{" "}
                • Máx REB{" "}
                <b className="text-neutral-950">
                  {seasonDetail.season_peaks.max_reb?.value}
                </b>
              </div>
            )}

            {seasonDetail.games?.length > 0 && (
              <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 sticky top-0">
                    <tr>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Adversário</th>
                      <th className="p-2.5">Res.</th>
                      <th className="p-2.5">MIN</th>
                      <th className="p-2.5">PTS</th>
                      <th className="p-2.5">AST</th>
                      <th className="p-2.5">REB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {seasonDetail.games.slice(0, 30).map((g) => (
                      <tr key={g.game_id} className="hover:bg-neutral-50">
                        <td className="p-2.5 text-neutral-500">
                          {g.date.slice(0, 10)}
                        </td>
                        <td className="p-2.5 font-medium text-neutral-900">
                          {g.is_home ? "vs" : "@"} {g.opponent}
                        </td>
                        <td
                          className={`p-2.5 font-bold ${
                            g.result === "W"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {g.result === "W"
                            ? "V"
                            : g.result === "L"
                              ? "D"
                              : g.result}
                        </td>
                        <td className="p-2.5 text-neutral-500">{g.minutes}</td>
                        <td className="p-2.5 font-bold text-orange-600">
                          {g.pts}
                        </td>
                        <td className="p-2.5 text-neutral-800">{g.ast}</td>
                        <td className="p-2.5 text-neutral-800">{g.reb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-neutral-400">
            Nenhum histórico de temporada disponível para este jogador.
          </div>
        )}
      </div>
    </div>
  );
}
