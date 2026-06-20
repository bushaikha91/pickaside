const API_SPORTS_LEAGUES_ENDPOINT = "https://v3.football.api-sports.io/leagues";

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

  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: "API_SPORTS_KEY is not configured on Vercel"
    });
  }

  const search = String(request.query?.search || "").trim();
  const url = new URL(API_SPORTS_LEAGUES_ENDPOINT);
  if (search) url.searchParams.set("search", search);

  try {
    const upstream = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const payload = await upstream.json().catch(() => ({}));
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return response.status(upstream.status).json(payload);
  } catch (error) {
    return response.status(502).json({
      error: "Failed to fetch official competitions",
      message: error.message || "Unknown error"
    });
  }
};
