const ORGANIZER_CODE = process.env.WORLDCUP2026_ORGANIZER_CODE || "WC2026";

const ROUND_RULES = {
  r32: { type: "fixed", total: 200, winnerStake: 150, safetyStake: 50 },
  r16: { type: "fixed", total: 300, winnerStake: 250, safetyStake: 50 },
  r8: { type: "bankroll", matchCount: 4, winnerPercent: 0.9, safetyPercent: 0.1 },
  qf: { type: "bankroll", matchCount: 4, winnerPercent: 0.9, safetyPercent: 0.1 },
  sf: { type: "bankroll", matchCount: 2, winnerPercent: 0.9, safetyPercent: 0.1 },
  final: { type: "final" }
};

const ROUND_ORDER = ["r32", "r16", "r8", "qf", "sf", "final"];

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const action = String(req.query.action || "state");
    if (action === "state" && req.method === "GET") return await sendState(req, res);
    if (action === "login" && req.method === "POST") return await login(req, res);
    if (action === "match" && req.method === "POST") return await addMatch(req, res);
    if (action === "prediction" && req.method === "POST") return await savePrediction(req, res);
    if (action === "result" && req.method === "POST") return await saveResult(req, res);
    if (action === "participant-status" && req.method === "POST") return await updateParticipantStatus(req, res);
    if (action === "clear-demo-data" && req.method === "POST") return await clearDemoData(req, res);

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method or action not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "World Cup API failed" });
  }
};

async function sendState(req, res) {
  const userId = clean(req.query.userId);
  const [user] = userId ? await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(userId)}&limit=1`) : [];
  const isOrganizer = user?.role === "organizer";
  const isApprovedParticipant = user?.role === "participant" && user?.participant_status === "approved";

  const [matches, predictions, standings, participants] = await Promise.all([
    isOrganizer || isApprovedParticipant ? supabase("worldcup2026_matches?select=*&order=starts_at.asc") : [],
    userId && (isOrganizer || isApprovedParticipant) ? supabase(`worldcup2026_predictions?select=match_id,winner&user_id=eq.${encodeURIComponent(userId)}`) : [],
    buildStandings(),
    isOrganizer ? supabase("worldcup2026_users?role=eq.participant&select=id,name,phone,participant_status,created_at&order=created_at.desc") : []
  ]);

  return res.status(200).json({
    user,
    matches,
    predictions: Object.fromEntries(predictions.map(item => [item.match_id, item.winner])),
    standings,
    participants
  });
}

async function login(req, res) {
  const body = await readBody(req);
  const name = clean(body.name);
  const phone = clean(body.phone);
  const role = body.role === "organizer" ? "organizer" : "participant";
  if (!name || !phone) throw httpError(400, "الاسم ورقم الهاتف مطلوبان");
  if (role === "organizer" && clean(body.organizerCode) !== ORGANIZER_CODE) {
    throw httpError(403, "كود المنظم غير صحيح");
  }

  const existing = await supabase(`worldcup2026_users?phone=eq.${encodeURIComponent(phone)}&limit=1`);
  const current = existing[0];
  const payload = {
    name,
    phone,
    role,
    participant_status: role === "organizer" ? "approved" : (current?.participant_status || "pending"),
    updated_at: new Date().toISOString()
  };
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
  await requireApprovedParticipant(userId);

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

async function updateParticipantStatus(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  const status = clean(body.status);
  if (!["approved", "rejected", "pending"].includes(status)) throw httpError(400, "حالة المشارك غير صحيحة");
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ participant_status: status, updated_at: new Date().toISOString() })
  });
  if (!user) throw httpError(404, "المشارك غير موجود");
  return res.status(200).json({ user });
}

async function clearDemoData(req, res) {
  const body = await readBody(req);
  if (clean(body.organizerCode) !== ORGANIZER_CODE) throw httpError(403, "كود المنظم غير صحيح");
  await supabase("worldcup2026_predictions?id=not.is.null", { method: "DELETE", prefer: "return=minimal" });
  await supabase("worldcup2026_matches?id=not.is.null", { method: "DELETE", prefer: "return=minimal" });
  return res.status(200).json({ ok: true });
}

async function requireOrganizer(userId) {
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(clean(userId))}&limit=1`);
  if (!user || user.role !== "organizer") throw httpError(403, "صلاحية المنظم مطلوبة");
}

async function requireApprovedParticipant(userId) {
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(clean(userId))}&limit=1`);
  if (!user || user.role !== "participant" || user.participant_status !== "approved") {
    throw httpError(403, "لا يمكنك التوقع قبل موافقة المنظم");
  }
}

async function buildStandings() {
  const [users, matches, predictions] = await Promise.all([
    supabase("worldcup2026_users?role=eq.participant&participant_status=eq.approved&select=id,name,phone"),
    supabase("worldcup2026_matches?select=id,round_id,winner,starts_at"),
    supabase("worldcup2026_predictions?select=user_id,match_id,winner")
  ]);

  const predictionByUserMatch = new Map(predictions.map(item => [`${item.user_id}:${item.match_id}`, item.winner]));
  const stats = new Map(users.map(user => [user.id, {
    id: user.id,
    name: user.name,
    phone: user.phone,
    points: 0,
    correct_predictions: 0,
    wrong_predictions: 0
  }]));

  for (const roundId of ROUND_ORDER) {
    const rule = ROUND_RULES[roundId];
    const roundMatches = matches
      .filter(match => match.round_id === roundId)
      .sort((a, b) => new Date(a.starts_at || 0) - new Date(b.starts_at || 0));
    if (!rule || !roundMatches.length) continue;

    if (rule.type === "fixed") {
      applyFixedRound(users, stats, predictionByUserMatch, roundMatches, rule);
    } else if (rule.type === "bankroll") {
      applyBankrollRound(users, stats, predictionByUserMatch, roundMatches, rule);
    } else if (rule.type === "final") {
      applyFinalRound(users, stats, predictionByUserMatch, roundMatches);
    }
  }

  return Array.from(stats.values())
    .map(row => ({ ...row, points: roundPoints(row.points) }))
    .sort((a, b) => b.points - a.points || b.correct_predictions - a.correct_predictions || a.wrong_predictions - b.wrong_predictions);
}

function applyFixedRound(users, stats, predictionByUserMatch, matches, rule) {
  for (const match of matches.filter(item => item.winner)) {
    const correctUsers = [];
    let lostPool = 0;
    const outcomes = new Map();

    for (const user of users) {
      const pick = predictionByUserMatch.get(`${user.id}:${match.id}`);
      if (!pick) continue;
      const correct = pick === match.winner;
      const baseReturn = correct ? rule.winnerStake : rule.safetyStake;
      const lostStake = correct ? rule.safetyStake : rule.winnerStake;
      outcomes.set(user.id, { correct, baseReturn });
      if (correct) correctUsers.push(user.id);
      else lostPool += lostStake;
    }

    const correctShare = correctUsers.length ? lostPool / correctUsers.length : 0;
    for (const [userId, outcome] of outcomes) {
      const row = stats.get(userId);
      row.points += outcome.baseReturn + (outcome.correct ? correctShare : 0);
      if (outcome.correct) row.correct_predictions += 1;
      else row.wrong_predictions += 1;
    }
  }
}

function applyBankrollRound(users, stats, predictionByUserMatch, matches, rule) {
  const settledMatches = matches.filter(item => item.winner);
  if (!settledMatches.length) return;

  const startingPoints = new Map(users.map(user => [user.id, stats.get(user.id).points]));
  const nextPoints = new Map(users.map(user => {
    const matchBudget = startingPoints.get(user.id) / rule.matchCount;
    const unresolvedCount = Math.max(rule.matchCount - settledMatches.length, 0);
    return [user.id, matchBudget * unresolvedCount];
  }));

  for (const match of settledMatches) {
    const correctUsers = [];
    let lostPool = 0;
    const outcomes = new Map();

    for (const user of users) {
      const pick = predictionByUserMatch.get(`${user.id}:${match.id}`);
      if (!pick) continue;
      const matchBudget = startingPoints.get(user.id) / rule.matchCount;
      const correct = pick === match.winner;
      const baseReturn = matchBudget * (correct ? rule.winnerPercent : rule.safetyPercent);
      const lostStake = matchBudget * (correct ? rule.safetyPercent : rule.winnerPercent);
      outcomes.set(user.id, { correct, baseReturn });
      if (correct) correctUsers.push(user.id);
      else lostPool += lostStake;
    }

    const correctShare = correctUsers.length ? lostPool / correctUsers.length : 0;
    for (const [userId, outcome] of outcomes) {
      nextPoints.set(userId, (nextPoints.get(userId) || 0) + outcome.baseReturn + (outcome.correct ? correctShare : 0));
      const row = stats.get(userId);
      if (outcome.correct) row.correct_predictions += 1;
      else row.wrong_predictions += 1;
    }
  }

  for (const user of users) {
    stats.get(user.id).points = nextPoints.get(user.id) || 0;
  }
}

function applyFinalRound(users, stats, predictionByUserMatch, matches) {
  const finalMatch = matches.find(item => item.winner);
  if (!finalMatch) return;

  const startingPoints = new Map(users.map(user => [user.id, stats.get(user.id).points]));
  const correctUsers = [];
  let lostPool = 0;
  const outcomes = new Map();

  for (const user of users) {
    const pick = predictionByUserMatch.get(`${user.id}:${finalMatch.id}`);
    if (!pick) continue;
    const correct = pick === finalMatch.winner;
    outcomes.set(user.id, correct);
    if (correct) correctUsers.push(user.id);
    else lostPool += startingPoints.get(user.id);
  }

  const correctShare = correctUsers.length ? lostPool / correctUsers.length : 0;
  for (const user of users) {
    const row = stats.get(user.id);
    if (!outcomes.has(user.id)) continue;
    const correct = outcomes.get(user.id);
    row.points = correct ? startingPoints.get(user.id) + correctShare : 0;
    if (correct) row.correct_predictions += 1;
    else row.wrong_predictions += 1;
  }
}

function roundPoints(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
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
  if (!response.ok) {
    const message = payload.message || payload.hint || "فشل اتصال قاعدة البيانات";
    if (/worldcup2026_|schema cache|could not find the table|participant_status/i.test(message)) {
      throw httpError(503, "قاعدة بيانات كأس العالم تحتاج تحديث الموافقات. شغّل ملف database/worldcup2026-schema.sql في Supabase مرة واحدة.");
    }
    throw httpError(response.status, message);
  }
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
