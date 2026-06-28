const crypto = require("crypto");

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
const JOKER_ROUNDS = new Set(["r16", "sf"]);
const ROUND_MATCH_LIMITS = {
  r32: 16,
  r16: 8,
  r8: 4,
  qf: 4,
  sf: 2,
  final: 1
};

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const action = String(req.query.action || "state");
    if (action === "state" && req.method === "GET") return await sendState(req, res);
    if (action === "login" && req.method === "POST") return await login(req, res);
    if (action === "match" && req.method === "POST") return await saveMatch(req, res);
    if (action === "match-delete" && req.method === "POST") return await deleteMatch(req, res);
    if (action === "prediction" && req.method === "POST") return await savePrediction(req, res);
    if (action === "result" && req.method === "POST") return await saveResult(req, res);
    if (action === "profile" && req.method === "POST") return await updateProfile(req, res);
    if (action === "participant-status" && req.method === "POST") return await updateParticipantStatus(req, res);
    if (action === "participant-delete" && req.method === "POST") return await deleteParticipant(req, res);
    if (action === "participant-reapply" && req.method === "POST") return await reapplyParticipant(req, res);
    if (action === "password-reset-request" && req.method === "POST") return await requestPasswordReset(req, res);
    if (action === "password-reset-complete" && req.method === "POST") return await completePasswordReset(req, res);
    if (action === "champion-option" && req.method === "POST") return await saveChampionOption(req, res);
    if (action === "champion-pick" && req.method === "POST") return await saveChampionPick(req, res);

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method or action not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "World Cup API failed" });
  }
};

async function sendState(req, res) {
  const userId = clean(req.query.userId);
  const user = userId ? await fetchCurrentUser(userId) : undefined;
  const isOrganizer = user?.role === "organizer";
  const isApprovedParticipant = user?.role === "participant" && user?.participant_status === "approved";
  const tournament = await calculateTournament();

  const [matches, predictions, participants, championData] = await Promise.all([
    isOrganizer || isApprovedParticipant ? supabase("worldcup2026_matches?select=*&order=winner.asc.nullsfirst&order=starts_at.asc") : [],
    userId && (isOrganizer || isApprovedParticipant) ? fetchUserPredictions(userId) : [],
    isOrganizer ? fetchParticipants() : [],
    isOrganizer ? fetchChampionData() : { options: [], picks: [] }
  ]);

  return res.status(200).json({
    user,
    matches: isOrganizer ? enrichMatchesForOrganizer(matches, participants, tournament.predictions) : matches,
    predictions: Object.fromEntries(predictions.map(item => [item.match_id, { winner: item.winner, is_joker: !!item.is_joker }])),
    matchPoints: userId ? tournament.matchPoints[userId] || {} : {},
    allPredictions: isOrganizer ? tournament.predictions : [],
    allMatchPoints: isOrganizer ? tournament.matchPoints : {},
    allMatchStakes: isOrganizer ? tournament.matchStakes : {},
    standings: tournament.standings,
    participants,
    championOptions: championData.options,
    championPicks: championData.picks
  });
}

async function fetchCurrentUser(userId) {
  const id = encodeURIComponent(userId);
  try {
    const [user] = await supabase(`worldcup2026_users?id=eq.${id}&select=id,name,phone,role,participant_status,avatar_url,created_at,updated_at&limit=1`);
    return user;
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    const [user] = await supabase(`worldcup2026_users?id=eq.${id}&select=id,name,phone,role,participant_status,created_at,updated_at&limit=1`);
    return user;
  }
}

async function fetchParticipants() {
  try {
    return await supabase("worldcup2026_users?role=eq.participant&select=id,name,participant_status,avatar_url,password_reset_requested_at,created_at&order=created_at.desc");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    try {
      return await supabase("worldcup2026_users?role=eq.participant&select=id,name,participant_status,avatar_url,created_at&order=created_at.desc");
    } catch (fallbackError) {
      if (!isOptionalColumnError(fallbackError)) throw fallbackError;
      return await supabase("worldcup2026_users?role=eq.participant&select=id,name,participant_status,created_at&order=created_at.desc");
    }
  }
}

async function fetchChampionData() {
  try {
    const [options, picks] = await Promise.all([
      supabase("worldcup2026_champion_options?select=*&order=option_type.asc&order=name.asc"),
      supabase("worldcup2026_champion_picks?select=*&order=updated_at.desc")
    ]);
    return { options, picks };
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return { options: [], picks: [] };
  }
}

async function fetchStandingUsers() {
  try {
    return await supabase("worldcup2026_users?role=eq.participant&participant_status=eq.approved&select=id,name,avatar_url");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return await supabase("worldcup2026_users?role=eq.participant&participant_status=eq.approved&select=id,name");
  }
}

async function fetchUserPredictions(userId) {
  const id = encodeURIComponent(userId);
  try {
    return await supabase(`worldcup2026_predictions?select=match_id,winner,is_joker&user_id=eq.${id}`);
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return (await supabase(`worldcup2026_predictions?select=match_id,winner&user_id=eq.${id}`))
      .map(item => ({ ...item, is_joker: false }));
  }
}

function enrichMatchesForOrganizer(matches, participants, predictions) {
  const approved = participants.filter(user => user.participant_status === "approved");
  return matches.map(match => {
    const votedIds = new Set(predictions.filter(item => item.match_id === match.id).map(item => item.user_id));
    return {
      ...match,
      vote_count: votedIds.size,
      eligible_count: approved.length,
      voted_users: approved.filter(user => votedIds.has(user.id)).map(publicParticipant),
      missing_users: approved.filter(user => !votedIds.has(user.id)).map(publicParticipant)
    };
  });
}

function publicParticipant(user) {
  return {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url || ""
  };
}

async function login(req, res) {
  const body = await readBody(req);
  const mode = body.mode === "create" ? "create" : "login";
  const name = clean(body.name);
  const phone = clean(body.phone);
  const password = clean(body.password);
  const role = body.role === "organizer" ? "organizer" : "participant";
  if (!phone || !password) throw httpError(400, "رقم الهاتف وكلمة المرور مطلوبان");
  if (password.length < 4) throw httpError(400, "كلمة المرور يجب أن تكون 4 خانات على الأقل");

  const existing = await supabase(`worldcup2026_users?phone=eq.${encodeURIComponent(phone)}&limit=1`);
  const current = existing[0];

  if (mode === "login") {
    if (!current) throw httpError(404, "الحساب غير موجود. أنشئ الحساب أول مرة بالاسم ورقم الهاتف وكلمة المرور.");
    if (!current.password_hash) throw httpError(409, "هذا الحساب يحتاج تعيين كلمة مرور. اختر إنشاء حساب واستخدم نفس رقم الهاتف.");
    if (!verifyPassword(password, current.password_hash)) throw httpError(403, "كلمة المرور غير صحيحة");
    return res.status(200).json({ user: publicUser(current) });
  }

  if (!name) throw httpError(400, "الاسم مطلوب عند إنشاء الحساب");
  if (role === "organizer" && clean(body.organizerCode) !== ORGANIZER_CODE) {
    throw httpError(403, "كود المنظم غير صحيح");
  }

  if (current?.password_hash) throw httpError(409, "هذا الرقم مسجل مسبقاً. ادخل برقم الهاتف وكلمة المرور.");
  const payload = {
    name,
    phone,
    role,
    password_hash: hashPassword(password),
    participant_status: role === "organizer" ? "approved" : (current?.participant_status || "pending"),
    updated_at: new Date().toISOString()
  };
  const user = current
    ? (await supabase(`worldcup2026_users?id=eq.${current.id}`, { method: "PATCH", body: JSON.stringify(payload), prefer: "return=representation" }))[0]
    : (await supabase("worldcup2026_users", { method: "POST", body: JSON.stringify(payload), prefer: "return=representation" }))[0];

  return res.status(200).json({ user: publicUser(user) });
}

async function saveMatch(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const matchId = clean(body.matchId);
  const teamA = clean(body.teamA);
  const teamB = clean(body.teamB);
  if (!teamA || !teamB || !body.startsAt || !body.voteEndsAt) throw httpError(400, "بيانات المباراة غير مكتملة");

  const payload = {
    round_id: clean(body.roundId) || "r32",
    team_a: teamA,
    team_b: teamB,
    starts_at: parseTournamentDate(body.startsAt).toISOString(),
    vote_ends_at: parseTournamentDate(body.voteEndsAt).toISOString(),
    updated_at: new Date().toISOString()
  };
  if ("teamAFlag" in body) payload.team_a_flag = cleanImageDataUrl(body.teamAFlag);
  if ("teamBFlag" in body) payload.team_b_flag = cleanImageDataUrl(body.teamBFlag);
  const [previousMatch] = matchId ? await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`) : [];
  await enforceRoundMatchLimit(payload.round_id, matchId);

  const match = matchId
    ? await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(payload)
      })
    : await supabase("worldcup2026_matches", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({ ...payload, created_at: new Date().toISOString() })
      });
  if (previousMatch) {
    await syncPredictionTeamName(matchId, previousMatch.team_a, teamA);
    await syncPredictionTeamName(matchId, previousMatch.team_b, teamB);
  }
  return res.status(200).json({ match: match[0] });
}

async function syncPredictionTeamName(matchId, oldName, newName) {
  if (!oldName || oldName === newName) return;
  await supabase(`worldcup2026_predictions?match_id=eq.${encodeURIComponent(matchId)}&winner=eq.${encodeURIComponent(oldName)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ winner: newName, updated_at: new Date().toISOString() })
  });
}

async function deleteMatch(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const matchId = clean(body.matchId);
  if (!matchId) throw httpError(400, "Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© ØºÙŠØ± Ù…ÙƒØªÙ…Ù„Ø©");
  await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });
  return res.status(200).json({ ok: true });
}

async function savePrediction(req, res) {
  const body = await readBody(req);
  const userId = clean(body.userId);
  const matchId = clean(body.matchId);
  const winner = clean(body.winner);
  const isJoker = body.isJoker === true;
  if (!userId || !matchId || !winner) throw httpError(400, "بيانات التوقع غير مكتملة");
  await requireApprovedParticipant(userId);

  const [match] = await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`);
  if (!match) throw httpError(404, "المباراة غير موجودة");
  if (match.winner) throw httpError(409, "تم إغلاق التصويت بعد اعتماد نتيجة المباراة");
  if (new Date(match.vote_ends_at) <= new Date()) throw httpError(409, "انتهى وقت التصويت لهذه المباراة");
  if (![match.team_a, match.team_b].includes(winner)) throw httpError(400, "الفائز المختار غير صحيح");
  if (isJoker) await validateJokerPick(userId, match);

  await supabase("worldcup2026_predictions?on_conflict=user_id,match_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify({ user_id: userId, match_id: matchId, winner, is_joker: isJoker, updated_at: new Date().toISOString() })
  });
  return res.status(200).json({ ok: true });
}

async function validateJokerPick(userId, match) {
  if (!JOKER_ROUNDS.has(match.round_id)) throw httpError(400, "الجوكر متاح في دور 16 ونصف النهائي فقط");
  const predictions = await fetchUserPredictions(userId);
  const jokerMatchIds = predictions
    .filter(item => item.is_joker && item.match_id !== match.id)
    .map(item => item.match_id);
  if (!jokerMatchIds.length) return;
  const roundMatches = await supabase(`worldcup2026_matches?round_id=eq.${encodeURIComponent(match.round_id)}&select=id`);
  const sameRoundIds = new Set(roundMatches.map(item => item.id));
  if (jokerMatchIds.some(id => sameRoundIds.has(id))) throw httpError(409, "استخدمت الجوكر مسبقاً في هذا الدور");
}

async function updateProfile(req, res) {
  const body = await readBody(req);
  const userId = clean(body.userId);
  const name = clean(body.name);
  if (!userId || !name) throw httpError(400, "الاسم مطلوب");
  const [existing] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(userId)}&limit=1`);
  if (!existing) throw httpError(404, "الحساب غير موجود");

  const payload = {
    name,
    avatar_url: cleanImageDataUrl(body.avatarUrl),
    updated_at: new Date().toISOString()
  };
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify(payload)
  });
  return res.status(200).json({ user: publicUser(user) });
}

async function saveResult(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const matchId = clean(body.matchId);
  const winner = clean(body.winner);
  const scoreA = body.scoreA === "" || body.scoreA === null || body.scoreA === undefined ? null : Number(body.scoreA);
  const scoreB = body.scoreB === "" || body.scoreB === null || body.scoreB === undefined ? null : Number(body.scoreB);
  const [match] = await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`);
  if (winner && (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0)) throw httpError(400, "أدخل أهداف الفريقين بشكل صحيح");
  if (!match) throw httpError(404, "المباراة غير موجودة");
  if (winner && ![match.team_a, match.team_b].includes(winner)) throw httpError(400, "الفائز المختار غير صحيح");

  await supabase(`worldcup2026_matches?id=eq.${encodeURIComponent(matchId)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({
      winner: winner || null,
      score_a: winner ? scoreA : null,
      score_b: winner ? scoreB : null,
      updated_at: new Date().toISOString()
    })
  });
  return res.status(200).json({ ok: true });
}

async function updateParticipantStatus(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  const status = clean(body.status);
  if (!["approved", "rejected", "pending"].includes(status)) throw httpError(400, "حالة المشارك غير صحيحة");
  if (status === "rejected") await deleteParticipantPredictions(participantId);
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ participant_status: status, updated_at: new Date().toISOString() })
  });
  if (!user) throw httpError(404, "المشارك غير موجود");
  return res.status(200).json({ user });
}

async function deleteParticipant(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  if (!participantId) throw httpError(400, "بيانات المشارك غير مكتملة");
  await deleteParticipantPredictions(participantId);
  await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ participant_status: "rejected", updated_at: new Date().toISOString() })
  });
  return res.status(200).json({ ok: true });
}

async function reapplyParticipant(req, res) {
  const body = await readBody(req);
  const userId = clean(body.userId);
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(userId)}&role=eq.participant`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ participant_status: "pending", updated_at: new Date().toISOString() })
  });
  if (!user) throw httpError(404, "المشارك غير موجود");
  return res.status(200).json({ user: publicUser(user) });
}

async function requestPasswordReset(req, res) {
  const body = await readBody(req);
  const phone = clean(body.phone);
  if (!phone) throw httpError(400, "رقم الهاتف مطلوب");
  try {
    await supabase(`worldcup2026_users?phone=eq.${encodeURIComponent(phone)}&role=eq.participant`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        password_reset_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة البيانات تحتاج تحديث. شغل ملف worldcup2026-schema.sql مرة واحدة في Supabase.");
  }
  return res.status(200).json({ ok: true });
}

async function completePasswordReset(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  const password = clean(body.password);
  if (!participantId || !password) throw httpError(400, "بيانات إعادة كلمة المرور غير مكتملة");
  if (password.length < 4) throw httpError(400, "كلمة المرور يجب أن تكون 4 خانات على الأقل");
  const [user] = await supabase(`worldcup2026_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({
      password_hash: hashPassword(password),
      password_reset_requested_at: null,
      updated_at: new Date().toISOString()
    })
  });
  if (!user) throw httpError(404, "المشارك غير موجود");
  return res.status(200).json({ user: publicUser(user) });
}

async function saveChampionOption(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const optionType = clean(body.optionType);
  const name = clean(body.name);
  if (!["team", "scorer"].includes(optionType)) throw httpError(400, "نوع الترشيح غير صحيح");
  if (!name) throw httpError(400, "الاسم مطلوب");
  try {
    await supabase("worldcup2026_champion_options?on_conflict=option_type,name", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify([{ option_type: optionType, name }])
    });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة البيانات تحتاج تحديث. شغل ملف database/worldcup2026-schema.sql في Supabase مرة واحدة.");
  }
  return res.status(200).json({ ok: true });
}

async function saveChampionPick(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  const championTeam = clean(body.championTeam);
  const topScorer = clean(body.topScorer);
  if (!participantId) throw httpError(400, "المشارك مطلوب");
  try {
    await supabase("worldcup2026_champion_picks?on_conflict=participant_id", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify([{
        participant_id: participantId,
        champion_team: championTeam || null,
        top_scorer: topScorer || null,
        updated_at: new Date().toISOString()
      }])
    });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة البيانات تحتاج تحديث. شغل ملف database/worldcup2026-schema.sql في Supabase مرة واحدة.");
  }
  return res.status(200).json({ ok: true });
}

async function deleteParticipantPredictions(participantId) {
  if (!participantId) return;
  await supabase(`worldcup2026_predictions?user_id=eq.${encodeURIComponent(participantId)}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });
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

async function calculateTournament() {
  const [users, matches, predictions] = await Promise.all([
    fetchStandingUsers(),
    supabase("worldcup2026_matches?select=id,round_id,winner,starts_at,team_a,team_b"),
    fetchAllPredictions()
  ]);

  const predictionByUserMatch = new Map(predictions.map(item => [`${item.user_id}:${item.match_id}`, item]));
  const matchPoints = Object.fromEntries(users.map(user => [user.id, {}]));
  const matchStakes = Object.fromEntries(users.map(user => [user.id, {}]));
  const stats = new Map(users.map(user => [user.id, {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url || "",
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
      applyFixedRound(users, stats, predictionByUserMatch, roundMatches, rule, matchPoints, matchStakes);
    } else if (rule.type === "bankroll") {
      applyBankrollRound(users, stats, predictionByUserMatch, roundMatches, rule, matchPoints, matchStakes);
    } else if (rule.type === "final") {
      applyFinalRound(users, stats, predictionByUserMatch, roundMatches, matchPoints, matchStakes);
    }
  }

  return {
    predictions,
    matchPoints,
    matchStakes,
    standings: Array.from(stats.values())
      .map(row => ({ ...row, points: roundPoints(row.points) }))
      .sort((a, b) => b.points - a.points || b.correct_predictions - a.correct_predictions || a.wrong_predictions - b.wrong_predictions)
  };
}

async function fetchAllPredictions() {
  try {
    return await supabase("worldcup2026_predictions?select=user_id,match_id,winner,is_joker");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return (await supabase("worldcup2026_predictions?select=user_id,match_id,winner"))
      .map(item => ({ ...item, is_joker: false }));
  }
}

async function buildStandings() {
  return (await calculateTournament()).standings;
}

function applyFixedRound(users, stats, predictionByUserMatch, matches, rule, matchPoints, matchStakes) {
  for (const match of matches.filter(item => item.winner)) {
    const correctUsers = [];
    let lostPool = 0;
    const outcomes = new Map();

    for (const user of users) {
      const prediction = predictionByUserMatch.get(`${user.id}:${match.id}`);
      if (!prediction) {
        lostPool += rule.total;
        outcomes.set(user.id, { correct: false, baseReturn: 0, isJoker: false });
        continue;
      }
      const correct = prediction.winner === match.winner;
      const baseReturn = correct ? rule.winnerStake : rule.safetyStake;
      const lostStake = correct ? rule.safetyStake : rule.winnerStake;
      matchStakes[user.id][match.id] = stakeRow(match, prediction.winner, rule.winnerStake, rule.safetyStake);
      outcomes.set(user.id, { correct, baseReturn, isJoker: !!prediction.is_joker });
      if (correct) correctUsers.push(user.id);
      lostPool += lostStake;
    }

    const correctShare = correctUsers.length ? lostPool / correctUsers.length : 0;
    for (const [userId, outcome] of outcomes) {
      const row = stats.get(userId);
      const rawPoints = outcome.baseReturn + (outcome.correct ? correctShare : 0);
      const points = applyJoker(rawPoints, outcome.isJoker);
      row.points += points;
      matchPoints[userId][match.id] = matchPointRow(points, outcome.correct, outcome.isJoker);
      if (outcome.correct) row.correct_predictions += 1;
      else row.wrong_predictions += 1;
    }
  }
}

function applyBankrollRound(users, stats, predictionByUserMatch, matches, rule, matchPoints, matchStakes) {
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
      const prediction = predictionByUserMatch.get(`${user.id}:${match.id}`);
      const matchBudget = startingPoints.get(user.id) / rule.matchCount;
      if (!prediction) {
        lostPool += matchBudget;
        outcomes.set(user.id, { correct: false, baseReturn: 0, isJoker: false });
        continue;
      }
      const correct = prediction.winner === match.winner;
      const baseReturn = matchBudget * (correct ? rule.winnerPercent : rule.safetyPercent);
      const lostStake = matchBudget * (correct ? rule.safetyPercent : rule.winnerPercent);
      matchStakes[user.id][match.id] = stakeRow(match, prediction.winner, matchBudget * rule.winnerPercent, matchBudget * rule.safetyPercent);
      outcomes.set(user.id, { correct, baseReturn, isJoker: !!prediction.is_joker });
      if (correct) correctUsers.push(user.id);
      lostPool += lostStake;
    }

    const correctShare = correctUsers.length ? lostPool / correctUsers.length : 0;
    for (const [userId, outcome] of outcomes) {
      const rawPoints = outcome.baseReturn + (outcome.correct ? correctShare : 0);
      const points = applyJoker(rawPoints, outcome.isJoker);
      nextPoints.set(userId, (nextPoints.get(userId) || 0) + points);
      matchPoints[userId][match.id] = matchPointRow(points, outcome.correct, outcome.isJoker);
      const row = stats.get(userId);
      if (outcome.correct) row.correct_predictions += 1;
      else row.wrong_predictions += 1;
    }
  }

  for (const user of users) {
    stats.get(user.id).points = nextPoints.get(user.id) || 0;
  }
}

function applyFinalRound(users, stats, predictionByUserMatch, matches, matchPoints, matchStakes) {
  const finalMatch = matches.find(item => item.winner);
  if (!finalMatch) return;

  const startingPoints = new Map(users.map(user => [user.id, stats.get(user.id).points]));
  const correctUsers = [];
  let lostPool = 0;
  const outcomes = new Map();

  for (const user of users) {
    const prediction = predictionByUserMatch.get(`${user.id}:${finalMatch.id}`);
    if (!prediction) {
      outcomes.set(user.id, false);
      lostPool += startingPoints.get(user.id);
      continue;
    }
    const correct = prediction.winner === finalMatch.winner;
    matchStakes[user.id][finalMatch.id] = stakeRow(finalMatch, prediction.winner, startingPoints.get(user.id), 0);
    outcomes.set(user.id, correct);
    if (correct) correctUsers.push(user.id);
    else lostPool += startingPoints.get(user.id);
  }

  const correctShare = correctUsers.length ? lostPool / correctUsers.length : 0;
  for (const user of users) {
    const row = stats.get(user.id);
    if (!outcomes.has(user.id)) continue;
    const correct = outcomes.get(user.id);
    const points = correct ? startingPoints.get(user.id) + correctShare : 0;
    row.points = points;
    matchPoints[user.id][finalMatch.id] = matchPointRow(points, correct, false);
    if (correct) row.correct_predictions += 1;
    else row.wrong_predictions += 1;
  }
}

function applyJoker(points, isJoker) {
  return isJoker ? points * 2 : points;
}

function matchPointRow(points, correct, isJoker) {
  return {
    points: roundPoints(points),
    correct,
    is_joker: !!isJoker
  };
}

async function enforceRoundMatchLimit(roundId, matchId = "") {
  const limit = ROUND_MATCH_LIMITS[roundId];
  if (!limit) return;
  const matches = await supabase(`worldcup2026_matches?round_id=eq.${encodeURIComponent(roundId)}&select=id`);
  const count = matches.filter(match => match.id !== matchId).length;
  if (count >= limit) {
    throw httpError(409, `لا يمكن إضافة أكثر من ${limit} مباراة في ${roundName(roundId)}`);
  }
}

function stakeRow(match, pickedWinner, winnerStake, safetyStake) {
  return {
    team_a: roundPoints(pickedWinner === match.team_a ? winnerStake : safetyStake),
    team_b: roundPoints(pickedWinner === match.team_b ? winnerStake : safetyStake)
  };
}

function roundPoints(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
  if (candidate.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

function publicUser(user) {
  if (!user) return user;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

async function supabase(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw httpError(500, "Supabase غير مفعل على السيرفر");

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
    if (/worldcup2026_|schema cache|could not find the table|participant_status|password_hash|password_reset_requested_at|avatar_url|team_a_flag|team_b_flag|is_joker|score_a|score_b|champion_options|champion_picks/i.test(message)) {
      throw httpError(503, "قاعدة بيانات كأس العالم تحتاج تحديث. شغل ملف database/worldcup2026-schema.sql في Supabase مرة واحدة.");
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

function roundName(id) {
  return ({
    r32: "دور الـ 32",
    r16: "دور الـ 16",
    r8: "دور الـ 8",
    qf: "ربع النهائي",
    sf: "نصف النهائي",
    final: "النهائي"
  })[id] || id;
}

function parseTournamentDate(value) {
  const raw = clean(value);
  const localParts = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (localParts) {
    const [, year, month, day, hour, minute, second = "0"] = localParts;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)) - 4 * 60 * 60000);
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw httpError(400, "وقت المباراة غير صحيح");
  return date;
}

function cleanImageDataUrl(value) {
  const image = clean(value);
  if (!image) return "";
  if (!/^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(image)) {
    throw httpError(400, "صيغة الصورة غير صحيحة");
  }
  if (image.length > 450000) {
    throw httpError(400, "حجم الصورة كبير. اختر صورة أصغر.");
  }
  return image;
}

function isOptionalColumnError(error) {
  return error?.status === 503;
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
