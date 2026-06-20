const API_SPORTS_LIVE_ENDPOINT = "https://v3.football.api-sports.io/fixtures?live=all";

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: "API_SPORTS_KEY is not configured on Vercel"
    });
  }

  try {
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
