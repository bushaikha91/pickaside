const API_SPORTS_LIVE_ENDPOINT = "https://v3.football.api-sports.io/fixtures?live=all";
const ESPN_WORLD_CUP_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

module.exports = async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const provider = String(request.query.provider || "espn").toLowerCase();
    if (provider !== "api-football") {
      const payload = await fetchEspnWorldCupLiveResults();
      response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
      return response.status(200).json(payload);
    }

    const apiKey = process.env.API_SPORTS_KEY;
    if (!apiKey) {
      return response.status(500).json({
        error: "API_SPORTS_KEY is not configured on Vercel"
      });
    }

    const upstream = await fetch(API_SPORTS_LIVE_ENDPOINT, {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const payload = await upstream.json().catch(() => ({}));
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return response.status(upstream.status).json(payload);
  } catch (error) {
    return response.status(502).json({
      error: "Failed to fetch live results",
      message: error.message || "Unknown error"
    });
  }
};

async function fetchEspnWorldCupLiveResults() {
  const upstream = await fetch(ESPN_WORLD_CUP_SCOREBOARD);
  const payload = await upstream.json().catch(() => ({}));
  const response = Array.isArray(payload.events)
    ? payload.events.map(normalizeEspnEvent).filter(Boolean)
    : [];

  return {
    get: "fixtures",
    parameters: { provider: "espn", league: "fifa.world", live: "all" },
    errors: [],
    results: response.length,
    paging: { current: 1, total: 1 },
    response
  };
}

function normalizeEspnEvent(event) {
  const competition = event.competitions?.[0] || {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const home = competitors.find((item) => item.homeAway === "home") || competitors[0] || {};
  const away = competitors.find((item) => item.homeAway === "away") || competitors[1] || {};
  if (!home.team || !away.team || isPlaceholderTeam(home.team) || isPlaceholderTeam(away.team)) return null;

  const status = competition.status?.type || event.status?.type || {};
  const completed = Boolean(status.completed);
  return {
    fixture: {
      id: event.id,
      date: competition.date || event.date,
      status: {
        short: espnStatusShort(status),
        long: status.description || status.detail || "",
        elapsed: competition.status?.clock ? Math.floor(Number(competition.status.clock)) : null
      }
    },
    league: {
      id: 1,
      name: "FIFA World Cup",
      season: event.season?.year || 2026,
      round: espnRoundLabel(event, competition),
      logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/4.png"
    },
    teams: {
      home: {
        id: home.team.id,
        name: home.team.displayName || home.team.shortDisplayName || home.team.name,
        logo: home.team.logo || "",
        winner: completed ? Boolean(home.winner) : null
      },
      away: {
        id: away.team.id,
        name: away.team.displayName || away.team.shortDisplayName || away.team.name,
        logo: away.team.logo || "",
        winner: completed ? Boolean(away.winner) : null
      }
    },
    goals: {
      home: scoreValue(home.score),
      away: scoreValue(away.score)
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: completed ? scoreValue(home.score) : null, away: completed ? scoreValue(away.score) : null }
    }
  };
}

function isPlaceholderTeam(team) {
  const name = `${team.displayName || ""} ${team.shortDisplayName || ""} ${team.name || ""}`.toLowerCase();
  return !team.logo || /winner|loser|tbd|to be|round of|quarterfinal|semifinal|final\s+\d|qfw|sfw|sfl|rd16/.test(name);
}

function scoreValue(score) {
  const value = Number(score);
  return Number.isFinite(value) ? value : null;
}

function espnStatusShort(status) {
  const state = String(status.state || "").toLowerCase();
  const name = String(status.name || "").toUpperCase();
  if (status.completed || state === "post") return "FT";
  if (state === "in") return "1H";
  if (name.includes("HALFTIME")) return "HT";
  if (state === "pre") return "NS";
  return "NS";
}

function espnRoundLabel(event, competition) {
  const text = `${event.season?.slug || ""} ${competition.altGameNote || ""}`.toLowerCase();
  if (/group/.test(text)) return "Group Stage";
  if (/round[-\s]?of[-\s]?32|round of 32/.test(text)) return "Round of 32";
  if (/round[-\s]?of[-\s]?16|rd of 16|round of 16/.test(text)) return "Round of 16";
  if (/quarter/.test(text)) return "Quarter-finals";
  if (/semi/.test(text)) return "Semi-finals";
  if (/3rd|third/.test(text)) return "3rd-Place Match";
  if (/final/.test(text)) return "Final";
  return competition.altGameNote || event.season?.slug || "Group Stage";
}
