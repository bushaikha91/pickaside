const API_BASE_URL = "https://v3.football.api-sports.io/fixtures";
const ESPN_WORLD_CUP_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const key = process.env.API_SPORTS_KEY;
  const league = String(req.query.league || "").trim();
  const season = String(req.query.season || new Date().getFullYear()).trim();
  const live = String(req.query.live || "").trim();
  const next = String(req.query.next || "").trim();
  const date = String(req.query.date || "").trim();
  const from = String(req.query.from || "").trim();
  const to = String(req.query.to || "").trim();

  if (!league) {
    res.status(400).json({ errors: { query: "league is required" }, response: [] });
    return;
  }

  try {
    if (shouldUseEspnFallback(league, season)) {
      const espnPayload = await fetchEspnWorldCupFixtures({ date, from, to, live });
      res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
      res.status(200).json(espnPayload);
      return;
    }

    if (!key) {
      res.status(500).json({ errors: { token: "Missing API_SPORTS_KEY" }, response: [] });
      return;
    }

    const url = new URL(API_BASE_URL);
    url.searchParams.set("league", league);
    if (live) {
      url.searchParams.set("live", live);
    } else if (next) {
      url.searchParams.set("next", next);
    } else if (date) {
      url.searchParams.set("season", season);
      url.searchParams.set("date", date);
    } else if (from || to) {
      url.searchParams.set("season", season);
      if (from) url.searchParams.set("from", from);
      if (to) url.searchParams.set("to", to);
    } else {
      url.searchParams.set("season", season);
    }

    const response = await fetch(url, {
      headers: {
        "x-apisports-key": key
      }
    });

    const payload = await response.json();
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(response.status).json(payload);
  } catch (error) {
    res.status(502).json({
      errors: { upstream: error.message || "Failed to fetch fixtures" },
      response: []
    });
  }
};

function shouldUseEspnFallback(league, season) {
  return String(league) === "1" && Number(season) >= 2026;
}

async function fetchEspnWorldCupFixtures({ date, from, to, live }) {
  const url = new URL(ESPN_WORLD_CUP_SCOREBOARD);
  if (!live) {
    const dates = espnDatesParam(date, from, to);
    if (dates) url.searchParams.set("dates", dates);
  }

  const upstream = await fetch(url);
  const payload = await upstream.json();
  const response = Array.isArray(payload.events)
    ? payload.events.map(normalizeEspnEvent).filter(Boolean)
    : [];

  return {
    get: "fixtures",
    parameters: { provider: "espn", league: "1", season: "2026" },
    errors: [],
    results: response.length,
    paging: { current: 1, total: 1 },
    response
  };
}

function espnDatesParam(date, from, to) {
  if (date) return compactDate(date);
  if (from || to) return `${compactDate(from || new Date())}-${compactDate(to || addDays(new Date(), 90))}`;
  return "";
}

function compactDate(value) {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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
