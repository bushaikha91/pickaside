const API_BASE_URL = "https://v3.football.api-sports.io/fixtures";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const key = process.env.API_SPORTS_KEY;
  if (!key) {
    res.status(500).json({ errors: { token: "Missing API_SPORTS_KEY" }, response: [] });
    return;
  }

  const league = String(req.query.league || "").trim();
  const season = String(req.query.season || new Date().getFullYear()).trim();
  const live = String(req.query.live || "").trim();
  const next = String(req.query.next || "").trim();

  if (!league) {
    res.status(400).json({ errors: { query: "league is required" }, response: [] });
    return;
  }

  try {
    const url = new URL(API_BASE_URL);
    url.searchParams.set("league", league);
    if (live) {
      url.searchParams.set("live", live);
    } else if (next) {
      url.searchParams.set("next", next);
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
