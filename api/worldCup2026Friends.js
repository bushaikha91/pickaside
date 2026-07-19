const crypto = require("crypto");

const ORGANIZER_CODE = process.env.WORLDCUP2026FRIENDS_ORGANIZER_CODE || "WC2026";
const JOKER_RULE_VERSION = "round-of-8";

const ROUND_RULES = {
  r32: { type: "fixed", total: 200, winnerStake: 150, safetyStake: 50 },
  r16: { type: "fixed", total: 300, winnerStake: 250, safetyStake: 50 },
  qf: { type: "fixed", total: 450, winnerStake: 350, safetyStake: 100 },
  sf: { type: "bankroll", matchCount: 2, winnerPercent: 0.9, safetyPercent: 0.1, customWinnerPercent: true, minWinnerPercent: 0.6, maxWinnerPercent: 0.9 },
  final: { type: "bankroll", matchCount: 1, winnerPercent: 0.9, safetyPercent: 0.1, customWinnerPercent: true, minWinnerPercent: 0.6, maxWinnerPercent: 1 }
};

const ROUND_ORDER = ["r32", "r16", "qf", "sf", "final"];
const JOKER_ROUNDS = new Set(["r16", "qf"]);
const JOKER_LIMITS = { r16: 2, qf: 1 };
const FINAL_TRIVIA_CLOSE_BEFORE_MS = 30 * 60 * 1000;
const ELIMINATED_PARTICIPANT_MESSAGE = "\u0648\u0635\u0644 \u0631\u0635\u064a\u062f\u0643 \u0625\u0644\u0649 0 \u0646\u0642\u0637\u0629\u060c \u0644\u0630\u0644\u0643 \u062a\u0645 \u0625\u0642\u0635\u0627\u0624\u0643 \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629 \u0648\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u0635\u0648\u064a\u062a \u0623\u0648 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0641\u064a \u0646\u0633\u062e\u0629 \u0627\u0644\u0631\u0628\u0639.";
const ROUND_MATCH_LIMITS = {
  r32: 16,
  r16: 8,
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
    if (action === "participant-avatar" && req.method === "POST") return await updateParticipantAvatar(req, res);
    if (action === "participant-status" && req.method === "POST") return await updateParticipantStatus(req, res);
    if (action === "participant-delete" && req.method === "POST") return await deleteParticipant(req, res);
    if (action === "participant-reapply" && req.method === "POST") return await reapplyParticipant(req, res);
    if (action === "password-reset-request" && req.method === "POST") return await requestPasswordReset(req, res);
    if (action === "password-reset-complete" && req.method === "POST") return await completePasswordReset(req, res);
    if (action === "champion-option" && req.method === "POST") return await saveChampionOption(req, res);
    if (action === "champion-pick" && req.method === "POST") return await saveChampionPick(req, res);
    if (action === "trivia-question" && req.method === "POST") return await saveTriviaQuestion(req, res);
    if (action === "trivia-questions" && req.method === "GET") return await sendTriviaQuestions(req, res);
    if (action === "trivia-settings" && req.method === "POST") return await saveTriviaSettings(req, res);
    if (action === "trivia-round" && req.method === "POST") return await saveTriviaRound(req, res);
    if (action === "trivia-round-delete" && req.method === "POST") return await deleteTriviaRound(req, res);
    if (action === "trivia-question-delete" && req.method === "POST") return await deleteTriviaQuestion(req, res);
    if (action === "trivia-start" && req.method === "POST") return await startTriviaQuestion(req, res);
    if (action === "trivia-answer" && req.method === "POST") return await answerTriviaQuestion(req, res);
    if (action === "trivia-expire" && req.method === "POST") return await expireTriviaQuestion(req, res);
    if (action === "admin-decision" && req.method === "POST") return await saveAdminDecision(req, res);
    if (action === "admin-decision-delete" && req.method === "POST") return await deleteAdminDecision(req, res);
    if (action === "disciplinary-action" && req.method === "POST") return await saveDisciplinaryAction(req, res);

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

  const [matches, predictions, participants, organizers, championData, triviaQuestionData, triviaSettingsRaw, allTriviaAssignments, adminDecisions, disciplinaryActions] = await Promise.all([
    isOrganizer || isApprovedParticipant ? supabase("worldcup2026friends_matches?select=*&order=winner.asc.nullsfirst&order=starts_at.asc") : [],
    userId && (isOrganizer || isApprovedParticipant) ? fetchUserPredictions(userId) : [],
    isOrganizer ? fetchParticipants() : [],
    isOrganizer ? fetchOrganizers() : [],
    isOrganizer ? fetchChampionData() : { options: [], picks: [] },
    isOrganizer ? fetchInitialTriviaQuestions() : { questions: [], pages: {} },
    isOrganizer || isApprovedParticipant ? fetchTriviaSettings() : [],
    isOrganizer ? fetchAllTriviaAssignments() : [],
    isOrganizer || isApprovedParticipant ? fetchAdminDecisions() : [],
    isOrganizer ? fetchDisciplinaryActions({ detailed: true }) : []
  ]);
  const triviaSettings = enrichTriviaSettingsWithEffectiveClosures(triviaSettingsRaw, matches);
  const triviaAssignments = isApprovedParticipant ? await ensureTriviaAssignments(userId) : [];

  return res.status(200).json({
    user,
    eliminated: isEliminatedStanding(tournament.standings.find(row => row.id === userId)),
    eliminationMessage: ELIMINATED_PARTICIPANT_MESSAGE,
    matches: isOrganizer ? enrichMatchesForOrganizer(matches, participants, tournament.predictions) : matches,
    predictions: Object.fromEntries(predictions.map(item => [item.match_id, { winner: item.winner, is_joker: !!item.is_joker, winner_percent: item.winner_percent ?? null }])),
    matchPoints: userId ? tournament.matchPoints[userId] || {} : {},
    allPredictions: isOrganizer || isApprovedParticipant ? tournament.predictions : [],
    allMatchPoints: isOrganizer || isApprovedParticipant ? tournament.matchPoints : {},
    allMatchStakes: isOrganizer || isApprovedParticipant ? tournament.matchStakes : {},
    standings: tournament.standings,
    participants,
    organizers,
    championOptions: championData.options,
    championPicks: championData.picks,
    triviaQuestions: triviaQuestionData.questions,
    triviaQuestionPages: triviaQuestionData.pages,
    triviaSettings,
    triviaAssignments,
    allTriviaAssignments,
    adminDecisions,
    disciplinaryActions,
    serverNow: new Date().toISOString()
  });
}

async function fetchCurrentUser(userId) {
  const id = encodeURIComponent(userId);
  try {
    const [user] = await supabase(`worldcup2026friends_users?id=eq.${id}&select=id,name,phone,role,participant_status,avatar_url,created_at,updated_at&limit=1`);
    return user;
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    const [user] = await supabase(`worldcup2026friends_users?id=eq.${id}&select=id,name,phone,role,participant_status,created_at,updated_at&limit=1`);
    return user;
  }
}

async function fetchParticipants() {
  try {
    return await supabase("worldcup2026friends_users?role=eq.participant&select=id,name,participant_status,avatar_url,password_reset_requested_at,created_at&order=created_at.desc");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    try {
      return await supabase("worldcup2026friends_users?role=eq.participant&select=id,name,participant_status,avatar_url,created_at&order=created_at.desc");
    } catch (fallbackError) {
      if (!isOptionalColumnError(fallbackError)) throw fallbackError;
      return await supabase("worldcup2026friends_users?role=eq.participant&select=id,name,participant_status,created_at&order=created_at.desc");
    }
  }
}

async function fetchOrganizers() {
  try {
    return await supabase("worldcup2026friends_users?role=eq.organizer&select=id,name,avatar_url,created_at&order=created_at.asc");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return await supabase("worldcup2026friends_users?role=eq.organizer&select=id,name,created_at&order=created_at.asc");
  }
}

async function fetchChampionData() {
  try {
    const picks = await supabase("worldcup2026friends_champion_picks?select=*&order=updated_at.desc");
    return { options: [], picks };
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return { options: [], picks: [] };
  }
}

async function fetchAdminDecisions() {
  try {
    return await supabase("worldcup2026friends_admin_decisions?select=*&order=created_at.desc");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return [];
  }
}

async function fetchDisciplinaryActions(options = {}) {
  try {
    const select = options.detailed
      ? "id,participant_id,action_type,title,points_deducted,reason,created_at,updated_at,participant:worldcup2026friends_users(id,name,avatar_url)"
      : "participant_id,action_type,points_deducted";
    return await supabase(`worldcup2026friends_disciplinary_actions?select=${select}&order=created_at.desc`);
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return [];
  }
}

async function fetchStandingUsers() {
  try {
    return await supabase("worldcup2026friends_users?role=eq.participant&participant_status=eq.approved&select=id,name,avatar_url");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return await supabase("worldcup2026friends_users?role=eq.participant&participant_status=eq.approved&select=id,name");
  }
}

async function fetchUserPredictions(userId) {
  const id = encodeURIComponent(userId);
  try {
    return await supabase(`worldcup2026friends_predictions?select=match_id,winner,is_joker,winner_percent&user_id=eq.${id}`);
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return (await supabase(`worldcup2026friends_predictions?select=match_id,winner&user_id=eq.${id}`))
      .map(item => ({ ...item, is_joker: false, winner_percent: null }));
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

  const existing = await supabase(`worldcup2026friends_users?phone=eq.${encodeURIComponent(phone)}&limit=1`);
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
    ? (await supabase(`worldcup2026friends_users?id=eq.${current.id}`, { method: "PATCH", body: JSON.stringify(payload), prefer: "return=representation" }))[0]
    : (await supabase("worldcup2026friends_users", { method: "POST", body: JSON.stringify(payload), prefer: "return=representation" }))[0];

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
    round_id: normalizeRoundId(clean(body.roundId) || "r32"),
    team_a: teamA,
    team_b: teamB,
    starts_at: parseTournamentDate(body.startsAt).toISOString(),
    vote_ends_at: parseTournamentDate(body.voteEndsAt).toISOString(),
    updated_at: new Date().toISOString()
  };
  if ("teamAFlag" in body) payload.team_a_flag = cleanImageDataUrl(body.teamAFlag);
  if ("teamBFlag" in body) payload.team_b_flag = cleanImageDataUrl(body.teamBFlag);
  const [previousMatch] = matchId ? await supabase(`worldcup2026friends_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`) : [];
  await enforceRoundMatchLimit(payload.round_id, matchId);

  const match = matchId
    ? await supabase(`worldcup2026friends_matches?id=eq.${encodeURIComponent(matchId)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(payload)
      })
    : await supabase("worldcup2026friends_matches", {
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
  await supabase(`worldcup2026friends_predictions?match_id=eq.${encodeURIComponent(matchId)}&winner=eq.${encodeURIComponent(oldName)}`, {
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
  await supabase(`worldcup2026friends_matches?id=eq.${encodeURIComponent(matchId)}`, {
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
  await ensureParticipantCanCompete(userId);

  const [match] = await supabase(`worldcup2026friends_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`);
  if (!match) throw httpError(404, "المباراة غير موجودة");
  const serverNow = new Date();
  if (match.winner) throw httpError(409, "تم إغلاق التصويت بعد اعتماد نتيجة المباراة");
  if (!match.vote_ends_at || new Date(match.vote_ends_at) <= serverNow) throw httpError(409, "انتهى وقت التصويت لهذه المباراة");
  if (![match.team_a, match.team_b].includes(winner)) throw httpError(400, "الفائز المختار غير صحيح");
  if (isJoker) await validateJokerPick(userId, match);

  const roundId = normalizeRoundId(match.round_id);
  const rule = ROUND_RULES[roundId];
  const winnerPercent = rule?.customWinnerPercent
    ? parseWinnerPercent(body.winnerPercent ?? body.winner_percent, rule)
    : null;
  const payload = { user_id: userId, match_id: matchId, winner, is_joker: isJoker, updated_at: new Date().toISOString() };
  if (winnerPercent !== null) payload.winner_percent = winnerPercent;

  await supabase("worldcup2026friends_predictions?on_conflict=user_id,match_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify(payload)
  });
  return res.status(200).json({ ok: true });
}

function parseWinnerPercent(value, rule) {
  const raw = value === undefined || value === null || value === "" ? rule.winnerPercent : Number(value);
  const percent = raw > 1 ? raw / 100 : raw;
  if (!Number.isFinite(percent)) throw httpError(400, "نسبة ترشيح الفائز غير صحيحة");
  if (percent < rule.minWinnerPercent || percent > rule.maxWinnerPercent) {
    throw httpError(400, `نسبة ترشيح الفائز يجب أن تكون بين ${Math.round(rule.minWinnerPercent * 100)}% و${Math.round(rule.maxWinnerPercent * 100)}%`);
  }
  return Math.round(percent * 10000) / 10000;
}

async function validateJokerPick(userId, match) {
  const roundId = normalizeRoundId(match.round_id);
  if (!JOKER_ROUNDS.has(roundId)) throw httpError(400, "الجوكر متاح في دور 16 ودور الـ 8 فقط");
  const predictions = await fetchUserPredictions(userId);
  const jokerMatchIds = predictions
    .filter(item => item.is_joker && item.match_id !== match.id)
    .map(item => item.match_id);
  if (!jokerMatchIds.length) return;
  const roundQuery = roundId === "qf"
    ? "round_id=in.(r8,qf)"
    : `round_id=eq.${encodeURIComponent(roundId)}`;
  const roundMatches = await supabase(`worldcup2026friends_matches?${roundQuery}&select=id`);
  const sameRoundIds = new Set(roundMatches.map(item => item.id));
  const usedInRound = jokerMatchIds.filter(id => sameRoundIds.has(id)).length;
  const limit = JOKER_LIMITS[roundId] || 1;
  if (roundId === "qf" && usedInRound >= limit) {
    const jokerIdsInRound = jokerMatchIds.filter(id => sameRoundIds.has(id));
    await supabase(`worldcup2026friends_predictions?user_id=eq.${encodeURIComponent(userId)}&match_id=in.(${jokerIdsInRound.map(encodeURIComponent).join(",")})`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ is_joker: false, updated_at: new Date().toISOString() })
    });
    return;
  }
  if (usedInRound >= limit) throw httpError(409, `استخدمت الحد المسموح للجوكر في هذا الدور (${limit})`);
}

async function updateProfile(req, res) {
  const body = await readBody(req);
  const userId = clean(body.userId);
  const name = clean(body.name);
  if (!userId || !name) throw httpError(400, "الاسم مطلوب");
  const [existing] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(userId)}&limit=1`);
  if (!existing) throw httpError(404, "الحساب غير موجود");

  const payload = {
    name,
    avatar_url: cleanImageDataUrl(body.avatarUrl),
    updated_at: new Date().toISOString()
  };
  const [user] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify(payload)
  });
  return res.status(200).json({ user: publicUser(user) });
}

async function updateParticipantAvatar(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  if (!participantId) throw httpError(400, "المتسابق مطلوب");
  const [participant] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant&limit=1`);
  if (!participant) throw httpError(404, "المتسابق غير موجود");

  const [user] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({
      avatar_url: cleanImageDataUrl(body.avatarUrl),
      updated_at: new Date().toISOString()
    })
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
  const [match] = await supabase(`worldcup2026friends_matches?id=eq.${encodeURIComponent(matchId)}&limit=1`);
  if (winner && (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0)) throw httpError(400, "أدخل أهداف الفريقين بشكل صحيح");
  if (!match) throw httpError(404, "المباراة غير موجودة");
  if (winner && ![match.team_a, match.team_b].includes(winner)) throw httpError(400, "الفائز المختار غير صحيح");

  await supabase(`worldcup2026friends_matches?id=eq.${encodeURIComponent(matchId)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({
      winner: winner || null,
      score_a: winner ? scoreA : null,
      score_b: winner ? scoreB : null,
      updated_at: new Date().toISOString()
    })
  });
  if (winner) await closeTriviaRoundsForCompletedMatchRound(match.round_id);
  return res.status(200).json({ ok: true });
}

async function updateParticipantStatus(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  const status = clean(body.status);
  if (!["approved", "rejected", "pending"].includes(status)) throw httpError(400, "حالة المشارك غير صحيحة");
  if (status === "rejected") await deleteParticipantPredictions(participantId);
  const [user] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
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
  await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ participant_status: "rejected", updated_at: new Date().toISOString() })
  });
  return res.status(200).json({ ok: true });
}

async function reapplyParticipant(req, res) {
  const body = await readBody(req);
  const userId = clean(body.userId);
  const [user] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(userId)}&role=eq.participant`, {
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
    await supabase(`worldcup2026friends_users?phone=eq.${encodeURIComponent(phone)}&role=eq.participant`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        password_reset_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة البيانات تحتاج تحديث. شغل ملف worldCup2026Friends-schema.sql مرة واحدة في Supabase.");
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
  const [user] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant`, {
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
    await supabase("worldcup2026friends_champion_options?on_conflict=option_type,name", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify([{ option_type: optionType, name }])
    });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة البيانات تحتاج تحديث. شغل ملف database/worldCup2026Friends-schema.sql في Supabase مرة واحدة.");
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
    const payload = {
      participant_id: participantId,
      champion_team: championTeam || null,
      top_scorer: topScorer || null,
      updated_at: new Date().toISOString()
    };
    const [existing] = await supabase(`worldcup2026friends_champion_picks?participant_id=eq.${encodeURIComponent(participantId)}&select=id&limit=1`);
    if (existing) {
      await supabase(`worldcup2026friends_champion_picks?id=eq.${encodeURIComponent(existing.id)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(payload)
      });
    } else {
      try {
        await supabase("worldcup2026friends_champion_picks", {
          method: "POST",
          prefer: "return=representation",
          body: JSON.stringify(payload)
        });
      } catch (insertError) {
        if (insertError.status !== 409) throw insertError;
        await supabase(`worldcup2026friends_champion_picks?participant_id=eq.${encodeURIComponent(participantId)}`, {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify(payload)
        });
      }
    }
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة البيانات تحتاج تحديث. شغل ملف database/worldCup2026Friends-schema.sql في Supabase مرة واحدة.");
  }
  return res.status(200).json({ ok: true });
}

async function deleteParticipantPredictions(participantId) {
  if (!participantId) return;
  await supabase(`worldcup2026friends_predictions?user_id=eq.${encodeURIComponent(participantId)}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });
}

async function requireOrganizer(userId) {
  const [user] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(clean(userId))}&limit=1`);
  if (!user || user.role !== "organizer") throw httpError(403, "صلاحية المنظم مطلوبة");
}

async function requireApprovedParticipant(userId) {
  const [user] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(clean(userId))}&limit=1`);
  if (!user || user.role !== "participant" || user.participant_status !== "approved") {
    throw httpError(403, "لا يمكنك التوقع قبل موافقة المنظم");
  }
  return user;
}


async function fetchTriviaQuestions() {
  try {
    return (await supabase("worldcup2026friends_trivia_questions?select=*&order=difficulty.asc&order=created_at.desc")).map(normalizeTriviaQuestionRow);
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    try {
      return (await supabase("worldcup2026friends_trivia_questions?select=id,round_id,question_text,option_a,option_b,option_c,option_d,correct_option,points,is_active,created_at&order=created_at.desc")).map(normalizeTriviaQuestionRow);
    } catch (fallbackError) {
      if (!isOptionalColumnError(fallbackError)) throw fallbackError;
      return [];
    }
  }
}

async function fetchInitialTriviaQuestions() {
  const counts = await fetchTriviaQuestionCounts();
  const entries = await Promise.all(["easy", "medium", "hard"].map(async difficulty => {
    const page = await fetchTriviaQuestionPage({ difficulty, limit: 10, offset: 0 });
    return [difficulty, page];
  }));
  const questions = [];
  const pages = {};
  for (const [difficulty, page] of entries) {
    questions.push(...page.questions);
    pages[difficulty] = {
      loaded: page.questions.length,
      total: counts[difficulty] ?? page.total ?? page.questions.length,
      hasMore: page.hasMore
    };
  }
  return { questions, pages };
}

async function sendTriviaQuestions(req, res) {
  await requireOrganizer(req.query.userId);
  const difficulty = normalizeDifficulty(req.query.difficulty);
  const limit = Math.max(1, Math.min(30, Number(req.query.limit) || 10));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const page = await fetchTriviaQuestionPage({ difficulty, limit, offset });
  return res.status(200).json(page);
}

async function fetchTriviaQuestionPage({ difficulty, limit = 10, offset = 0 }) {
  const normalized = normalizeDifficulty(difficulty);
  const pageSize = Math.max(1, Math.min(30, Number(limit) || 10));
  const pageOffset = Math.max(0, Number(offset) || 0);
  const total = await fetchTriviaQuestionCount(normalized);
  const query = `difficulty=eq.${encodeURIComponent(normalized)}&select=*&order=created_at.desc&limit=${pageSize + 1}&offset=${pageOffset}`;
  try {
    const rows = (await supabase(`worldcup2026friends_trivia_questions?${query}`)).map(normalizeTriviaQuestionRow);
    return {
      difficulty: normalized,
      offset: pageOffset,
      limit: pageSize,
      total,
      questions: rows.slice(0, pageSize),
      hasMore: pageOffset + Math.min(rows.length, pageSize) < total
    };
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    const legacyQuery = `difficulty=eq.${encodeURIComponent(normalized)}&select=id,round_id,question_text,option_a,option_b,option_c,option_d,correct_option,points,is_active,created_at&order=created_at.desc&limit=${pageSize + 1}&offset=${pageOffset}`;
    try {
      const rows = (await supabase(`worldcup2026friends_trivia_questions?${legacyQuery}`)).map(normalizeTriviaQuestionRow);
      return {
        difficulty: normalized,
        offset: pageOffset,
        limit: pageSize,
        total,
        questions: rows.slice(0, pageSize),
        hasMore: pageOffset + Math.min(rows.length, pageSize) < total
      };
    } catch (fallbackError) {
      if (!isOptionalColumnError(fallbackError)) throw fallbackError;
      return { difficulty: normalized, offset: pageOffset, limit: pageSize, total: 0, questions: [], hasMore: false };
    }
  }
}

async function fetchTriviaQuestionCounts() {
  try {
    const rows = await supabase("worldcup2026friends_trivia_questions?select=id,difficulty");
    return rows.reduce((counts, row) => {
      const difficulty = normalizeDifficulty(row.difficulty);
      counts[difficulty] = (counts[difficulty] || 0) + 1;
      return counts;
    }, { easy: 0, medium: 0, hard: 0 });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return { easy: 0, medium: 0, hard: 0 };
  }
}

async function fetchTriviaQuestionCount(difficulty) {
  const counts = await fetchTriviaQuestionCounts();
  return counts[normalizeDifficulty(difficulty)] || 0;
}

async function fetchTriviaSettings() {
  try {
    return await supabase("worldcup2026friends_trivia_rounds?is_active=eq.true&select=*&order=round_id.asc&order=sort_order.asc&order=created_at.asc");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return [];
  }
}

async function fetchLegacyTriviaSettings() {
  try {
    return await supabase("worldcup2026friends_trivia_settings?select=*&order=round_id.asc");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return [];
  }
}

function legacyTriviaSettingsToRounds(settings) {
  const rounds = [];
  for (const setting of settings) {
    const count = Math.max(1, Number(setting.round_count || 1));
    for (let index = 1; index <= count; index++) {
      rounds.push({
        id: `${normalizeRoundId(setting.round_id)}-${index}`,
        round_id: normalizeRoundId(setting.round_id),
        title: `جولة ${index}`,
        sort_order: index,
        easy_points: clampTriviaPoints(setting.easy_points, 10),
        medium_points: clampTriviaPoints(setting.medium_points, 20),
        hard_points: clampTriviaPoints(setting.hard_points, 30),
        is_active: true
      });
    }
  }
  return rounds;
}

async function ensureTriviaAssignments(userId) {
  await ensureAssignmentsForParticipant(userId);
  const assignments = await fetchTriviaAssignments(userId);
  const activeSlots = triviaActiveSlotSet(await fetchTriviaSettings());
  if (!activeSlots.size) return [];
  return assignments.filter(item => activeSlots.has(triviaSlotKey(item.round_id, item.question_round, item.difficulty)));
}

async function ensureAssignmentsForParticipant(userId) {
  const existing = await supabase(`worldcup2026friends_trivia_assignments?participant_id=eq.${encodeURIComponent(userId)}&select=question_id,round_id,question_round,difficulty`);
  const assignedQuestionIds = new Set(existing.map(item => item.question_id));
  const existingSlots = new Set(existing.map(item => triviaSlotKey(item.round_id, item.question_round, item.difficulty)));
  const settings = await fetchTriviaSettings();
  const settingsByRound = new Map();
  settings.forEach(item => {
    const roundId = normalizeRoundId(item.round_id);
    if (!settingsByRound.has(roundId)) settingsByRound.set(roundId, []);
    settingsByRound.get(roundId).push(item);
  });
  const questions = await supabase("worldcup2026friends_trivia_questions?is_active=eq.true&select=id,difficulty");
  for (const roundId of ["r16", "qf", "sf", "final"]) {
    const roundSettings = settingsByRound.get(roundId) || [];
    if (!roundSettings.length) continue;
    const inserts = [];
    for (const roundSetting of roundSettings) {
      const questionRound = Math.max(1, Number(roundSetting.sort_order || 1));
      for (const difficulty of ["easy", "medium", "hard"]) {
        const slotKey = triviaSlotKey(roundId, questionRound, difficulty);
        if (existingSlots.has(slotKey)) continue;
        const candidates = shuffle(questions.filter(item =>
          normalizeDifficulty(item.difficulty) === difficulty &&
          !assignedQuestionIds.has(item.id)
        ));
        if (!candidates.length) continue;
        const [chosen] = candidates;
        assignedQuestionIds.add(chosen.id);
        existingSlots.add(slotKey);
        inserts.push({
          participant_id: userId,
          question_id: chosen.id,
          round_id: roundId,
          question_round: questionRound,
          difficulty
        });
      }
    }
    if (inserts.length) {
      await supabase("worldcup2026friends_trivia_assignments", {
        method: "POST",
        body: JSON.stringify(inserts),
        prefer: "return=minimal"
      });
    }
  }
}

async function fetchTriviaAssignments(userId) {
  try {
    const assignments = await supabase(`worldcup2026friends_trivia_assignments?participant_id=eq.${encodeURIComponent(userId)}&select=id,round_id,question_round,difficulty,started_at,answered_at,selected_option,is_correct,points_awarded,question:worldcup2026friends_trivia_questions(id,question_text,option_a,option_b,option_c,option_d,correct_option,points,time_limit_seconds,difficulty)&order=question_round.asc&order=difficulty.asc&order=created_at.asc`);
    const repaired = await repairTriviaAssignmentScores(assignments);
    return repaired.map(maskTriviaAssignmentAnswer);
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return [];
  }
}

async function fetchAllTriviaAssignments() {
  try {
    const assignments = await supabase("worldcup2026friends_trivia_assignments?select=id,participant_id,round_id,question_round,difficulty,started_at,answered_at,selected_option,is_correct,points_awarded,user:worldcup2026friends_users(id,name,avatar_url,participant_status),question:worldcup2026friends_trivia_questions(id,question_text,option_a,option_b,option_c,option_d,correct_option,time_limit_seconds,difficulty)&order=round_id.asc&order=question_round.asc&order=difficulty.asc&order=created_at.asc");
    return await repairTriviaAssignmentScores(assignments);
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return [];
  }
}

async function saveTriviaQuestion(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const payload = triviaQuestionPayload(body);
  const questionId = clean(body.questionId);
  try {
    const rows = await writeTriviaQuestion(questionId, payload);
    return res.status(200).json({ question: normalizeTriviaQuestionRow(rows[0]) });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    const rows = await writeTriviaQuestion(questionId, legacyTriviaQuestionPayload(payload));
    return res.status(200).json({
      question: normalizeTriviaQuestionRow(rows[0]),
      warning: "تم حفظ السؤال. لتفعيل المستويات والثواني بشكل كامل شغل تحديث جدول المعلومات العامة في Supabase."
    });
  }
}

async function saveTriviaSettings(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const roundId = normalizeRoundId(clean(body.roundId));
  const roundCount = Math.max(1, Math.min(20, Number(body.roundCount) || 1));
  if (!["r16", "qf", "sf", "final"].includes(roundId)) throw httpError(400, "????? ??? ????");
  const [setting] = await supabase("worldcup2026friends_trivia_settings?on_conflict=round_id", {
    method: "POST",
    body: JSON.stringify({
      round_id: roundId,
      round_count: roundCount,
      easy_points: clampTriviaPoints(body.easyPoints, 10),
      medium_points: clampTriviaPoints(body.mediumPoints, 20),
      hard_points: clampTriviaPoints(body.hardPoints, 30),
      updated_at: new Date().toISOString()
    }),
    prefer: "resolution=merge-duplicates,return=representation"
  });
  return res.status(200).json({ setting });
}

async function saveTriviaRound(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const roundRecordId = clean(body.roundRecordId);
  const roundId = normalizeRoundId(clean(body.roundId));
  if (!["r16", "qf", "sf", "final"].includes(roundId)) throw httpError(400, "الدور غير صحيح");
  const title = clean(body.title);
  const opensAt = clean(body.opensAt);
  if (!opensAt) throw httpError(400, "وقت فتح الجولة مطلوب");
  const opensAtDate = new Date(opensAt);
  if (Number.isNaN(opensAtDate.getTime())) throw httpError(400, "وقت فتح الجولة غير صحيح");
  if (!title) throw httpError(400, "عنوان الجولة مطلوب");
  const existing = await fetchTriviaSettings();
  const existingRound = roundRecordId ? existing.find(item => item.id === roundRecordId) : null;
  const nextOrder = Math.max(0, ...existing.filter(item => normalizeRoundId(item.round_id) === roundId).map(item => Number(item.sort_order) || 0)) + 1;
  const payload = {
    round_id: roundId,
    title,
    sort_order: Math.max(1, Math.min(100, Number(body.sortOrder) || Number(existingRound?.sort_order) || nextOrder)),
    easy_points: clampTriviaPoints(body.easyPoints, 10),
    medium_points: clampTriviaPoints(body.mediumPoints, 20),
    hard_points: clampTriviaPoints(body.hardPoints, 30),
    opens_at: opensAtDate.toISOString(),
    is_active: true,
    updated_at: new Date().toISOString()
  };
  let round;
  try {
    if (roundRecordId) {
      [round] = await supabase(`worldcup2026friends_trivia_rounds?id=eq.${encodeURIComponent(roundRecordId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        prefer: "return=representation"
      });
    } else {
      [round] = await supabase("worldcup2026friends_trivia_rounds", {
        method: "POST",
        body: JSON.stringify(payload),
        prefer: "return=representation"
      });
    }
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة بيانات Friends تحتاج تحديث opens_at لجولات س/ج");
  }
  if (roundRecordId && !round) throw httpError(404, "الجولة غير موجودة");
  return res.status(200).json({ round });
}

async function deleteTriviaRound(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const roundId = clean(body.roundId);
  if (!roundId) throw httpError(400, "الجولة مطلوبة");
  await supabase(`worldcup2026friends_trivia_rounds?id=eq.${encodeURIComponent(roundId)}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: false, updated_at: new Date().toISOString() }),
    prefer: "return=minimal"
  });
  return res.status(200).json({ ok: true });
}

async function closeTriviaRoundsForCompletedMatchRound(roundId) {
  const normalizedRoundId = normalizeRoundId(roundId);
  if (!normalizedRoundId || normalizedRoundId === "r32") return;
  const roundQuery = normalizedRoundId === "qf"
    ? "round_id=in.(r8,qf)"
    : `round_id=eq.${encodeURIComponent(normalizedRoundId)}`;
  const matches = await supabase(`worldcup2026friends_matches?${roundQuery}&select=id,winner`);
  if (!matches.length || matches.some(match => !match.winner)) return;
  const closedAt = new Date().toISOString();
  try {
    await supabase(`worldcup2026friends_trivia_rounds?round_id=eq.${encodeURIComponent(normalizedRoundId)}&is_active=eq.true&closed_at=is.null`, {
      method: "PATCH",
      body: JSON.stringify({ closed_at: closedAt, updated_at: closedAt }),
      prefer: "return=minimal"
    });
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return;
  }
}

async function deleteTriviaQuestion(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const questionId = clean(body.questionId);
  if (!questionId) throw httpError(400, "?????? ?????");
  await supabase(`worldcup2026friends_trivia_questions?id=eq.${encodeURIComponent(questionId)}`, { method: "DELETE", prefer: "return=minimal" });
  return res.status(200).json({ ok: true });
}

async function saveAdminDecision(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const decisionId = clean(body.decisionId);
  const title = clean(body.title);
  const details = clean(body.details);
  if (!title || !details) throw httpError(400, "عنوان القرار والتفاصيل مطلوبة");

  const payload = {
    title,
    details,
    updated_at: new Date().toISOString()
  };

  try {
    const result = decisionId
      ? await supabase(`worldcup2026friends_admin_decisions?id=eq.${encodeURIComponent(decisionId)}`, {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify(payload)
        })
      : await supabase("worldcup2026friends_admin_decisions", {
          method: "POST",
          prefer: "return=representation",
          body: JSON.stringify({ ...payload, created_at: new Date().toISOString() })
        });
    if (decisionId && !result.length) throw httpError(404, "القرار غير موجود");
    return res.status(200).json({ decision: result[0] });
  } catch (error) {
    if (isRlsPolicyError(error)) {
      throw httpError(503, "قاعدة بيانات Friends تحتاج تحديث صلاحيات جدول القرارات الإدارية. شغل ملف database/worldCup2026Friends-admin-decisions-rls-fix.sql في Supabase مرة واحدة.");
    }
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة بيانات Friends تحتاج تحديث جدول القرارات الإدارية");
  }
}

async function deleteAdminDecision(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const decisionId = clean(body.decisionId);
  if (!decisionId) throw httpError(400, "القرار مطلوب");
  try {
    await supabase(`worldcup2026friends_admin_decisions?id=eq.${encodeURIComponent(decisionId)}`, {
      method: "DELETE",
      prefer: "return=minimal"
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (isRlsPolicyError(error)) {
      throw httpError(503, "قاعدة بيانات Friends تحتاج تحديث صلاحيات جدول القرارات الإدارية. شغل ملف database/worldCup2026Friends-admin-decisions-rls-fix.sql في Supabase مرة واحدة.");
    }
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة بيانات Friends تحتاج تحديث جدول القرارات الإدارية");
  }
}

async function saveDisciplinaryAction(req, res) {
  const body = await readBody(req);
  await requireOrganizer(body.userId);
  const participantId = clean(body.participantId);
  const title = clean(body.title);
  const pointsDeducted = Number(body.pointsDeducted);
  const requestedActionType = clean(body.actionType);
  const actionType = ["notice", "warning", "correction"].includes(requestedActionType) ? requestedActionType : "warning";
  if (!participantId) throw httpError(400, "اختر المتسابق");
  if (!title) throw httpError(400, "عنوان التنبيه أو الإنذار مطلوب");
  if (actionType === "warning" && (!Number.isFinite(pointsDeducted) || pointsDeducted < 0)) throw httpError(400, "قيمة الخصم غير صحيحة");
  if (actionType === "correction" && (!Number.isFinite(pointsDeducted) || pointsDeducted === 0)) throw httpError(400, "قيمة تصحيح النقاط غير صحيحة");
  const [participant] = await supabase(`worldcup2026friends_users?id=eq.${encodeURIComponent(participantId)}&role=eq.participant&limit=1`);
  if (!participant) throw httpError(404, "المتسابق غير موجود");
  try {
    const [action] = await supabase("worldcup2026friends_disciplinary_actions", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        participant_id: participantId,
        action_type: actionType,
        title,
        points_deducted: actionType === "notice" ? 0 : Math.round(pointsDeducted * 100) / 100,
        reason: title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
    return res.status(200).json({ action });
  } catch (error) {
    if (isRlsPolicyError(error)) {
      throw httpError(503, "قاعدة بيانات Friends تحتاج تحديث صلاحيات جدول الإنذارات. شغل ملف database/worldCup2026Friends-disciplinary-actions.sql في Supabase مرة واحدة.");
    }
    if (!isOptionalColumnError(error)) throw error;
    throw httpError(503, "قاعدة بيانات Friends تحتاج تحديث جدول الإنذارات. شغل ملف database/worldCup2026Friends-disciplinary-actions.sql في Supabase مرة واحدة.");
  }
}

async function startTriviaQuestion(req, res) {
  const body = await readBody(req);
  const user = await requireApprovedParticipant(body.userId);
  await ensureParticipantCanCompete(user.id);
  const assignmentId = clean(body.assignmentId);
  const [assignment] = await supabase(`worldcup2026friends_trivia_assignments?id=eq.${encodeURIComponent(assignmentId)}&participant_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (!assignment) throw httpError(404, "?????? ??? ?????");
  if (assignment.started_at || assignment.answered_at) return res.status(200).json({ assignment, serverNow: new Date().toISOString() });
  const setting = await fetchTriviaRoundForAssignment(assignment);
  await enforceTriviaRoundOpen(setting);
  const [updated] = await supabase(`worldcup2026friends_trivia_assignments?id=eq.${encodeURIComponent(assignmentId)}`, { method: "PATCH", body: JSON.stringify({ started_at: new Date().toISOString() }), prefer: "return=representation" });
  return res.status(200).json({ assignment: updated, serverNow: new Date().toISOString() });
}

async function answerTriviaQuestion(req, res) {
  const body = await readBody(req);
  const user = await requireApprovedParticipant(body.userId);
  await ensureParticipantCanCompete(user.id);
  const assignmentId = clean(body.assignmentId);
  const selected = clean(body.selectedOption).toLowerCase();
  if (!["a", "b", "c", "d"].includes(selected)) throw httpError(400, "???????? ??? ????");
  const [assignment] = await supabase(`worldcup2026friends_trivia_assignments?id=eq.${encodeURIComponent(assignmentId)}&participant_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (!assignment) throw httpError(404, "?????? ??? ?????");
  if (assignment.answered_at) throw httpError(409, "??? ??????? ??? ??????");
  if (!assignment.started_at) throw httpError(409, "???? ?????? ?????");
  const [question] = await supabase(`worldcup2026friends_trivia_questions?id=eq.${encodeURIComponent(assignment.question_id)}&limit=1`);
  if (!question) throw httpError(404, "?????? ??? ?????");
  const timeLimitMs = Math.max(1, Number(question.time_limit_seconds || 20)) * 1000;
  const expired = Date.now() - new Date(assignment.started_at).getTime() > timeLimitMs;
  const correctOption = normalizeTriviaOption(question.correct_option);
  const isCorrect = !expired && selected === correctOption;
  const setting = await fetchTriviaRoundForAssignment(assignment);
  await enforceTriviaRoundOpen(setting);
  const awardedPoints = isCorrect ? triviaPointsForDifficulty(setting, assignment.difficulty || question.difficulty) : 0;
  const [updated] = await supabase(`worldcup2026friends_trivia_assignments?id=eq.${encodeURIComponent(assignmentId)}`, {
    method: "PATCH",
    body: JSON.stringify({ answered_at: new Date().toISOString(), selected_option: selected, is_correct: isCorrect, points_awarded: awardedPoints }),
    prefer: "return=representation"
  });
  return res.status(200).json({
    assignment: { ...updated, question: revealTriviaQuestionAnswer(question) },
    expired,
    isCorrect
  });
}

async function expireTriviaQuestion(req, res) {
  const body = await readBody(req);
  const user = await requireApprovedParticipant(body.userId);
  const assignmentId = clean(body.assignmentId);
  const [assignment] = await supabase(`worldcup2026friends_trivia_assignments?id=eq.${encodeURIComponent(assignmentId)}&participant_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (!assignment) throw httpError(404, "السؤال غير موجود");
  if (assignment.answered_at) return res.status(200).json({ assignment, expired: true });
  if (!assignment.started_at) throw httpError(409, "السؤال لم يبدأ");
  const [question] = await supabase(`worldcup2026friends_trivia_questions?id=eq.${encodeURIComponent(assignment.question_id)}&limit=1`);
  if (!question) throw httpError(404, "السؤال غير موجود");
  const timeLimitMs = Math.max(1, Number(question.time_limit_seconds || 20)) * 1000;
  const expired = Date.now() - new Date(assignment.started_at).getTime() > timeLimitMs;
  if (!expired) return res.status(200).json({ assignment, expired: false, serverNow: new Date().toISOString() });
  const [updated] = await supabase(`worldcup2026friends_trivia_assignments?id=eq.${encodeURIComponent(assignmentId)}`, {
    method: "PATCH",
    body: JSON.stringify({ answered_at: new Date().toISOString(), selected_option: null, is_correct: false, points_awarded: 0 }),
    prefer: "return=representation"
  });
  return res.status(200).json({
    assignment: { ...updated, question: revealTriviaQuestionAnswer(question) },
    expired: true,
    serverNow: new Date().toISOString()
  });
}

function triviaQuestionPayload(body) {
  const correctOption = clean(body.correctOption).toLowerCase();
  const difficulty = normalizeDifficulty(body.difficulty);
  const payload = {
    round_id: "global",
    difficulty,
    question_text: clean(body.questionText),
    option_a: clean(body.optionA),
    option_b: clean(body.optionB),
    option_c: clean(body.optionC),
    option_d: clean(body.optionD),
    correct_option: correctOption,
    points: Math.max(1, Math.min(1000, Number(body.points) || 10)),
    time_limit_seconds: Math.max(5, Math.min(300, Number(body.timeLimitSeconds) || 20)),
    is_active: body.isActive !== false,
    updated_at: new Date().toISOString()
  };
  if (!payload.question_text || !payload.option_a || !payload.option_b || !payload.option_c || !payload.option_d) throw httpError(400, "???? ?????? ????????? ???????");
  if (!["a", "b", "c", "d"].includes(correctOption)) throw httpError(400, "??? ??????? ???????");
  return payload;
}

async function fetchTriviaRoundForAssignment(assignment) {
  const roundId = normalizeRoundId(assignment.round_id);
  const questionRound = Math.max(1, Number(assignment.question_round || 1));
  try {
    const [setting] = await supabase(`worldcup2026friends_trivia_rounds?round_id=eq.${encodeURIComponent(roundId)}&sort_order=eq.${questionRound}&is_active=eq.true&limit=1`);
    return setting;
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    const [setting] = await supabase(`worldcup2026friends_trivia_settings?round_id=eq.${encodeURIComponent(roundId)}&limit=1`);
    return setting;
  }
}

async function enforceTriviaRoundOpen(setting) {
  if (setting?.closed_at) throw httpError(403, "تم إغلاق جولة س/ج لهذا الدور بعد اعتماد آخر مباراة.");
  const completedRoundCloseAt = await completedMatchRoundCloseAt(setting);
  if (completedRoundCloseAt) {
    throw httpError(403, "تم إغلاق جولة س/ج لهذا الدور بعد اعتماد آخر مباراة.");
  }
  const finalCloseAt = await finalTriviaCloseAt(setting);
  if (finalCloseAt && finalCloseAt.getTime() <= Date.now()) {
    throw httpError(403, `تم إغلاق جولات س/ج للنهائي قبل بداية المباراة النهائية بـ30 دقيقة.`);
  }
  if (!setting?.opens_at) return;
  const opensAt = new Date(setting.opens_at);
  if (Number.isNaN(opensAt.getTime()) || opensAt.getTime() <= Date.now()) return;
  throw httpError(403, `الجولة تفتح في ${formatDubaiDateTime(opensAt)}`);
}

async function completedMatchRoundCloseAt(setting) {
  const normalizedRoundId = normalizeRoundId(setting?.round_id);
  if (!normalizedRoundId || normalizedRoundId === "r32") return null;
  const roundQuery = normalizedRoundId === "qf"
    ? "round_id=in.(r8,qf)"
    : `round_id=eq.${encodeURIComponent(normalizedRoundId)}`;
  const matches = await supabase(`worldcup2026friends_matches?${roundQuery}&select=winner,updated_at`);
  return completedMatchRoundCloseDate(matches);
}

async function finalTriviaCloseAt(setting) {
  if (normalizeRoundId(setting?.round_id) !== "final") return null;
  const [finalMatch] = await supabase("worldcup2026friends_matches?round_id=eq.final&starts_at=not.is.null&select=starts_at&order=starts_at.asc&limit=1");
  if (!finalMatch?.starts_at) return null;
  const startsAt = new Date(finalMatch.starts_at);
  if (Number.isNaN(startsAt.getTime())) return null;
  return new Date(startsAt.getTime() - FINAL_TRIVIA_CLOSE_BEFORE_MS);
}

function enrichTriviaSettingsWithEffectiveClosures(settings, matches) {
  return (settings || []).map(setting => {
    if (setting.closed_at) return setting;
    const normalizedRoundId = normalizeRoundId(setting.round_id);
    const completedCloseAt = normalizedRoundId === "r32" ? null : completedMatchRoundCloseDate(matchesForRound(matches, normalizedRoundId));
    if (completedCloseAt) {
      return {
        ...setting,
        effective_closed_at: completedCloseAt.toISOString(),
        effective_closed_reason: "round_completed"
      };
    }
    const finalCloseAt = finalTriviaCloseAtFromMatches(setting, matches);
    if (finalCloseAt && finalCloseAt.getTime() <= Date.now()) {
      return {
        ...setting,
        effective_closed_at: finalCloseAt.toISOString(),
        effective_closed_reason: "final_before_kickoff"
      };
    }
    return setting;
  });
}

function matchesForRound(matches, roundId) {
  const normalizedRoundId = normalizeRoundId(roundId);
  return (matches || []).filter(match => {
    const matchRoundId = normalizeRoundId(match.round_id);
    if (normalizedRoundId === "qf") return matchRoundId === "qf";
    return matchRoundId === normalizedRoundId;
  });
}

function completedMatchRoundCloseDate(matches) {
  if (!matches?.length || matches.some(match => !match.winner)) return null;
  const timestamps = matches
    .map(match => new Date(match.updated_at || 0).getTime())
    .filter(value => Number.isFinite(value) && value > 0);
  return new Date(timestamps.length ? Math.max(...timestamps) : Date.now());
}

function finalTriviaCloseAtFromMatches(setting, matches) {
  if (normalizeRoundId(setting?.round_id) !== "final") return null;
  const finalMatch = (matches || [])
    .filter(match => normalizeRoundId(match.round_id) === "final" && match.starts_at)
    .sort((a, b) => new Date(a.starts_at || 0) - new Date(b.starts_at || 0))[0];
  if (!finalMatch?.starts_at) return null;
  const startsAt = new Date(finalMatch.starts_at);
  if (Number.isNaN(startsAt.getTime())) return null;
  return new Date(startsAt.getTime() - FINAL_TRIVIA_CLOSE_BEFORE_MS);
}

function formatDubaiDateTime(value) {
  try {
    return new Intl.DateTimeFormat("ar-AE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Dubai"
    }).format(value);
  } catch {
    return value.toISOString();
  }
}

async function writeTriviaQuestion(questionId, payload) {
  if (questionId) {
    return await supabase(`worldcup2026friends_trivia_questions?id=eq.${encodeURIComponent(questionId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      prefer: "return=representation"
    });
  }
  return await supabase("worldcup2026friends_trivia_questions", {
    method: "POST",
    body: JSON.stringify(payload),
    prefer: "return=representation"
  });
}

function legacyTriviaQuestionPayload(payload) {
  return {
    round_id: payload.round_id || "global",
    question_text: payload.question_text,
    option_a: payload.option_a,
    option_b: payload.option_b,
    option_c: payload.option_c,
    option_d: payload.option_d,
    correct_option: payload.correct_option,
    points: payload.points || 10,
    is_active: payload.is_active !== false
  };
}

function normalizeTriviaQuestionRow(row) {
  if (!row) return row;
  return {
    ...row,
    difficulty: normalizeDifficulty(row.difficulty),
    time_limit_seconds: Math.max(5, Number(row.time_limit_seconds || 20))
  };
}

function maskTriviaAssignmentAnswer(assignment) {
  if (!assignment?.question || assignment.answered_at) return assignment;
  const { correct_option, ...question } = assignment.question;
  return { ...assignment, question };
}

function revealTriviaQuestionAnswer(question) {
  if (!question) return question;
  return normalizeTriviaQuestionRow(question);
}

function normalizeTriviaOption(value) {
  return clean(value).toLowerCase();
}

function triviaAssignmentSelectedCorrectAnswer(assignment) {
  const selected = normalizeTriviaOption(assignment?.selected_option);
  const correct = normalizeTriviaOption(assignment?.question?.correct_option);
  return !!selected && !!correct && selected === correct;
}

async function repairTriviaAssignmentScores(assignments, settings) {
  const rounds = settings || await fetchTriviaSettings();
  return (assignments || []).map(assignment => repairTriviaAssignmentScore(assignment, rounds));
}

function repairTriviaAssignmentScore(assignment, settings) {
  if (!assignment?.answered_at || !assignment?.question || !triviaAssignmentSelectedCorrectAnswer(assignment)) {
    return assignment;
  }
  const setting = triviaRoundSettingForAssignment(assignment, settings);
  const points = triviaPointsForDifficulty(setting, assignment.difficulty || assignment.question.difficulty);
  if (assignment.is_correct === true && Number(assignment.points_awarded || 0) === points) {
    return assignment;
  }
  return {
    ...assignment,
    selected_option: normalizeTriviaOption(assignment.selected_option),
    is_correct: true,
    points_awarded: points
  };
}

function triviaRoundSettingForAssignment(assignment, settings) {
  const roundId = normalizeRoundId(assignment?.round_id);
  const questionRound = Math.max(1, Number(assignment?.question_round) || 1);
  return (settings || []).find(item =>
    normalizeRoundId(item.round_id) === roundId &&
    Math.max(1, Number(item.sort_order) || 1) === questionRound
  );
}

function clampTriviaPoints(value, fallback) {
  return Math.max(1, Math.min(1000, Number(value) || fallback));
}

function triviaPointsForDifficulty(setting, difficulty) {
  const normalized = normalizeDifficulty(difficulty);
  if (normalized === "hard") return clampTriviaPoints(setting?.hard_points, 30);
  if (normalized === "medium") return clampTriviaPoints(setting?.medium_points, 20);
  return clampTriviaPoints(setting?.easy_points, 10);
}

function normalizeDifficulty(value) {
  const difficulty = clean(value).toLowerCase();
  return ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "easy";
}

function triviaSlotKey(roundId, questionRound, difficulty) {
  return `${normalizeRoundId(roundId)}:${Math.max(1, Number(questionRound) || 1)}:${normalizeDifficulty(difficulty)}`;
}

async function calculateTournament() {
  const [users, matches, predictions, triviaResults, disciplinaryActions] = await Promise.all([
    fetchStandingUsers(),
    supabase("worldcup2026friends_matches?select=id,round_id,winner,starts_at,team_a,team_b"),
    fetchAllPredictions(),
    fetchTriviaResults(),
    fetchDisciplinaryActions()
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
    wrong_predictions: 0,
    trivia_correct: 0,
    trivia_wrong: 0,
    trivia_points: 0,
    notices_count: 0,
    warnings_count: 0,
    penalty_points: 0,
    admin_correction_points: 0
  }]));
  const triviaResultsByRound = groupTriviaResultsByRound(triviaResults);

  for (const roundId of ROUND_ORDER) {
    const rule = ROUND_RULES[roundId];
    const roundMatches = matches
      .filter(match => normalizeRoundId(match.round_id) === roundId)
      .sort((a, b) => new Date(a.starts_at || 0) - new Date(b.starts_at || 0));

    if (rule && roundMatches.length) {
      if (rule.type === "fixed") {
        applyFixedRound(users, stats, predictionByUserMatch, roundMatches, rule, matchPoints, matchStakes);
      } else if (rule.type === "bankroll") {
        applyBankrollRound(users, stats, predictionByUserMatch, roundMatches, rule, matchPoints, matchStakes);
      } else if (rule.type === "final") {
        applyFinalRound(users, stats, predictionByUserMatch, roundMatches, matchPoints, matchStakes);
      }
    }
    applyTriviaResultsToStats(stats, triviaResultsByRound.get(roundId) || []);
  }
  applyTriviaResultsToStats(stats, triviaResultsByRound.get("unmatched") || []);
  applyDisciplinaryActionsToStats(stats, disciplinaryActions);

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
    return await supabase("worldcup2026friends_predictions?select=user_id,match_id,winner,is_joker,winner_percent");
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return (await supabase("worldcup2026friends_predictions?select=user_id,match_id,winner"))
      .map(item => ({ ...item, is_joker: false, winner_percent: null }));
  }
}

function applyDisciplinaryActionsToStats(stats, actions) {
  for (const action of actions || []) {
    const row = stats.get(action.participant_id);
    if (!row) continue;
    if (action.action_type === "notice") {
      row.notices_count += 1;
      continue;
    }
    if (action.action_type === "correction") {
      const correction = Number(action.points_deducted) || 0;
      row.admin_correction_points += correction;
      row.points += correction;
      continue;
    }
    if (action.action_type === "warning") row.warnings_count += 1;
    const deduction = Math.max(0, Number(action.points_deducted) || 0);
    row.penalty_points += deduction;
    row.points -= deduction;
  }
}

async function fetchTriviaResults() {
  try {
    const assignments = await supabase("worldcup2026friends_trivia_assignments?answered_at=not.is.null&select=id,participant_id,round_id,question_round,difficulty,answered_at,selected_option,is_correct,points_awarded,question:worldcup2026friends_trivia_questions(id,correct_option,difficulty)");
    const settings = await fetchTriviaSettings();
    const results = await repairTriviaAssignmentScores(assignments, settings);
    const activeSlots = triviaActiveSlotSet(settings);
    if (!activeSlots.size) return [];
    return results.filter(item => activeSlots.has(triviaSlotKey(item.round_id, item.question_round, item.difficulty)));
  } catch (error) {
    if (!isOptionalColumnError(error)) throw error;
    return [];
  }
}

function triviaActiveSlotSet(rounds) {
  const slots = new Set();
  for (const round of rounds || []) {
    for (const difficulty of ["easy", "medium", "hard"]) {
      slots.add(triviaSlotKey(round.round_id, round.sort_order, difficulty));
    }
  }
  return slots;
}

async function buildStandings() {
  return (await calculateTournament()).standings;
}

async function ensureParticipantCanCompete(userId) {
  const standings = await buildStandings();
  const standing = standings.find(row => row.id === userId);
  if (isEliminatedStanding(standing)) throw httpError(403, ELIMINATED_PARTICIPANT_MESSAGE);
}

function isEliminatedStanding(standing) {
  if (!standing) return false;
  const points = Number(standing.points);
  if (!Number.isFinite(points) || points > 0) return false;
  return standingActivityCount(standing) > 0;
}

function standingActivityCount(standing) {
  return ["correct_predictions", "wrong_predictions", "trivia_correct", "trivia_wrong"]
    .reduce((sum, key) => sum + (Number(standing?.[key]) || 0), 0);
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
      matchStakes[user.id][match.id] = stakeRow(match, prediction.winner, rule.winnerStake, rule.safetyStake);
      outcomes.set(user.id, { correct, baseReturn, isJoker: !!prediction.is_joker });
      if (correct) correctUsers.push(user.id);
      else lostPool += rule.winnerStake;
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
      const winnerPercent = predictionWinnerPercent(prediction, rule);
      const safetyPercent = 1 - winnerPercent;
      const baseReturn = matchBudget * (correct ? winnerPercent : safetyPercent);
      matchStakes[user.id][match.id] = stakeRow(match, prediction.winner, matchBudget * winnerPercent, matchBudget * safetyPercent);
      outcomes.set(user.id, { correct, baseReturn, isJoker: !!prediction.is_joker });
      if (correct) correctUsers.push(user.id);
      else lostPool += matchBudget * winnerPercent;
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

function predictionWinnerPercent(prediction, rule) {
  if (!rule.customWinnerPercent) return rule.winnerPercent;
  const stored = Number(prediction?.winner_percent);
  if (!Number.isFinite(stored)) return rule.winnerPercent;
  return Math.min(rule.maxWinnerPercent, Math.max(rule.minWinnerPercent, stored > 1 ? stored / 100 : stored));
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

function groupTriviaResultsByRound(triviaResults) {
  const grouped = new Map();
  for (const result of triviaResults || []) {
    const roundId = normalizeRoundId(result.round_id);
    const key = ROUND_ORDER.includes(roundId) ? roundId : "unmatched";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(result);
  }
  return grouped;
}

function applyTriviaResultsToStats(stats, results) {
  for (const result of results || []) {
    const row = stats.get(result.participant_id);
    if (!row) continue;
    if (result.is_correct) {
      const points = Number(result.points_awarded || 0);
      row.trivia_correct += 1;
      row.trivia_points += points;
      row.points += points;
    } else {
      row.trivia_wrong += 1;
    }
  }
}

async function enforceRoundMatchLimit(roundId, matchId = "") {
  const normalizedRoundId = normalizeRoundId(roundId);
  const limit = ROUND_MATCH_LIMITS[normalizedRoundId];
  if (!limit) return;
  const query = normalizedRoundId === "qf"
    ? "worldcup2026friends_matches?round_id=in.(r8,qf)&select=id"
    : `worldcup2026friends_matches?round_id=eq.${encodeURIComponent(normalizedRoundId)}&select=id`;
  const matches = await supabase(query);
  const count = matches.filter(match => match.id !== matchId).length;
  if (count >= limit) {
    throw httpError(409, `لا يمكن إضافة أكثر من ${limit} مباراة في ${roundName(normalizedRoundId)}`);
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

function shuffle(items) {
  return [...items].sort(() => crypto.randomInt(0, 3) - 1);
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
    if (isSchemaSetupMessage(message)) {
      throw httpError(503, "قاعدة بيانات كأس العالم تحتاج تحديث. شغل ملف database/worldCup2026Friends-schema.sql في Supabase مرة واحدة.");
    }
    throw httpError(response.status, message);
  }
  return payload;
}

function isSchemaSetupMessage(message) {
  return /schema cache|could not find the table|could not find.*column|column .* does not exist|relation .* does not exist/i.test(String(message || ""));
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
    qf: "ربع النهائي",
    sf: "نصف النهائي",
    final: "النهائي"
  })[normalizeRoundId(id)] || id;
}

function normalizeRoundId(id) {
  return id === "r8" ? "qf" : id;
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

function isRlsPolicyError(error) {
  return /row-level security|violates row-level security policy/i.test(String(error?.message || ""));
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
