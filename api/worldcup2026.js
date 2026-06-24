const ROUND_POINTS = {
  r32: 2,
  r16: 3,
  r8: 4,
  qf: 5,
  sf: 7,
  final: 10
};

const SEED_MATCHES = [
  ["كندا", "اليابان"], ["المكسيك", "تشيلي"], ["أمريكا", "غانا"], ["الأرجنتين", "كوريا"],
  ["فرنسا", "المغرب"], ["البرازيل", "الدنمارك"], ["إنجلترا", "أستراليا"], ["إسبانيا", "مصر"],
  ["ألمانيا", "السنغال"], ["البرتغال", "سويسرا"], ["هولندا", "كولومبيا"], ["أوروغواي", "السويد"],
  ["إيطاليا", "تونس"], ["بلجيكا", "نيجيريا"], ["كرواتيا", "الإكوادور"], ["السعودية", "بولندا"]
];

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const action = String(req.query.action || "state");
    if (action === "state" && req.method === "GET") return sendState(req, res);
    if (action === "login" && req.method === "POST") return login(req, res);
    if (action === "match" && req.method === "POST") return addMatch(req, res);
    if (action === "prediction" && req.method === "POST") return savePrediction(req, res);
    if (action === "result" && req.method === "POST") return saveResult(req, res);

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method or action not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "World Cup API failed" });
  }
};

async function sendState(req, res) {
  await ensureSeedMatches();
  const userId = String(req.query.userId || "");
  const [matches, predictions, standings] = await Promise.all([
    supabase("worldcup2026_matches?select=*&order=starts_at.asc"),
    userId ? supabase(`worldcup2026_predictions?select=match_id,winner&user_id=eq.${encodeURIComponent(userId)}`) : [],
    buildStandings()
  ]);

  return res.status(200).json({
    matches,
    predictions: Object.fromEntries(predictions.map(item => [item.match_id, item.winner])),
    standings
  });
}

async function login(req, res) {
  const body = await readBody(req);
  const name = clean(body.name);
  const phone = clean(body.phone);
  const role = body.role === "organizer" ? "organizer" : "participant";
  if (!name || !phone) throw httpError(400, "الاسم ورقم الهاتف مطلوبان");

  const existing = await supabase(`worldcup2026_users?phone=eq.${encodeURIComponent(phone)}&limit=1`);
  const current = existing[0];
  const payload = { name, phone, role, updated_at: new Date().toISOString() };
  const user = current
    ? (await supabase(`worldcup2026_users?id=eq.${current.id}`, { method: "PATCH", body: JSON.stringify(payload), prefer: "return=representation" }))[0]
    : (await supabase("worldcup2026_users", { method: "POST", body: JSON.stringify(payload), prefer: "return=representation" }))[0];

  return res.status(200).json({ user });
}

async function addMatch(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const teamA = clean(body.teamA);
  const teamB = clean(body.teamB);
  if (!teamA || !teamB || !body.startsAt || !body.voteEndsAt) throw httpError(400, "بيانات المباراة غير مكتملة");

  const match = await supabase("worldcup2026_matches", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      round_id: clean(body.roundId) || "r32",
      team_a: teamA,
      team_b: teamB,
      starts_at: new Date(body.startsAt).toISOString(),
      vote_ends_at: new Date(body.voteEndsAt).toISOString()
    })
  });
  return res.status(200).json({ match: match[0] });
}

async function savePrediction(req, res) {
  const body = await readBody(req);
  const userId = clean(body.userId);
  const matchId = clean(body.matchId);
  const winner = clean(body.winner);
  if (!userId || !matchId || !winner) throw httpError(400, "بيانات التوقع غير مكتملة");

  const [match] = await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`);
  if (!match) throw httpError(404, "المباراة غير موجودة");
  if (new Date(match.vote_ends_at) <= new Date()) throw httpError(409, "انتهى وقت التصويت لهذه المباراة");
  if (![match.team_a, match.team_b].includes(winner)) throw httpError(400, "الفائز المختار غير صحيح");

  await supabase("worldcup2026_predictions?on_conflict=user_id,match_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify({ user_id: userId, match_id: matchId, winner, updated_at: new Date().toISOString() })
  });
  return res.status(200).json({ ok: true });
}

async function saveResult(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const matchId = clean(body.matchId);
  const winner = clean(body.winner);
  const [match] = await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`);
  if (!match) throw httpError(404, "المباراة غير موجودة");
  if (winner && ![match.team_a, match.team_b].includes(winner)) throw httpError(400, "الفائز المختار غير صحيح");

  await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ winner: winner || null, updated_at: new Date().toISOString() })
  });
  return res.status(200).json({ ok: true });
}

async function requireOrganizer(userId) {
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(clean(userId))}&limit=1`);
  if (!user || user.role !== "organizer") throw httpError(403, "صلاحية المنظم مطلوبة");
}

async function buildStandings() {
  const [users, matches, predictions] = await Promise.all([
    supabase("worldcup2026_users?role=eq.participant&select=id,name,phone"),
    supabase("worldcup2026_matches?select=id,round_id,winner"),
    supabase("worldcup2026_predictions?select=user_id,match_id,winner")
  ]);
  const matchMap = new Map(matches.map(match => [match.id, match]));

  return users.map(user => {
    let points = 0;
    let correct = 0;
    let wrong = 0;
    predictions.filter(item => item.user_id === user.id).forEach(prediction => {
      const match = matchMap.get(prediction.match_id);
      if (!match?.winner) return;
      if (prediction.winner === match.winner) {
        correct += 1;
        points += ROUND_POINTS[match.round_id] || 0;
      } else {
        wrong += 1;
      }
    });
    return { id: user.id, name: user.name, phone: user.phone, points, correct_predictions: correct, wrong_predictions: wrong };
  }).sort((a, b) => b.points - a.points || b.correct_predictions - a.correct_predictions || a.wrong_predictions - b.wrong_predictions);
}

async function ensureSeedMatches() {
  const existing = await supabase("worldcup2026_matches?select=id&limit=1");
  if (existing.length) return;
  const now = Date.now();
  const matches = SEED_MATCHES.map((teams, index) => {
    const startsAt = new Date(now + (index + 1) * 86400000);
    return {
      round_id: "r32",
      team_a: teams[0],
      team_b: teams[1],
      starts_at: startsAt.toISOString(),
      vote_ends_at: new Date(startsAt.getTime() - 2 * 60 * 60 * 1000).toISOString()
    };
  });
  await supabase("worldcup2026_matches", { method: "POST", body: JSON.stringify(matches) });
}

async function supabase(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw httpError(500, "Supabase غير مفعّل على السيرفر");

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation"
    },
    body: options.body
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : [];
  if (!response.ok) throw httpError(response.status, payload.message || payload.hint || "فشل اتصال قاعدة البيانات");
  return payload;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => { data += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch (error) { reject(error); }
    });
  });
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

function clean(value) {
  return String(value || "").trim();
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
