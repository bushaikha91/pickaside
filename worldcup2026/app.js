const SESSION_KEY = "wc2026-live-session-v1";

const rounds = [
  { id: "r32", name: "Ø¯ÙˆØ± Ø§Ù„Ù€ 32", points: 2 },
  { id: "r16", name: "Ø¯ÙˆØ± Ø§Ù„Ù€ 16", points: 3 },
  { id: "r8", name: "Ø¯ÙˆØ± Ø§Ù„Ù€ 8", points: 4 },
  { id: "qf", name: "Ø±Ø¨Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ", points: 5 },
  { id: "sf", name: "Ù†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ", points: 7 },
  { id: "final", name: "Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ", points: 10 }
];

const laws = {
  r32: "ÙŠØ®ØªØ§Ø± Ø§Ù„Ù…Ø´Ø§Ø±Ùƒ ÙØ§Ø¦Ø² ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© Ù‚Ø¨Ù„ Ù†Ù‡Ø§ÙŠØ© ÙˆÙ‚Øª Ø§Ù„ØªØµÙˆÙŠØª. ÙƒÙ„ ØªÙˆÙ‚Ø¹ ØµØ­ÙŠØ­ ÙŠÙ…Ù†Ø­ Ù†Ù‚Ø·ØªÙŠÙ†.",
  r16: "ØªØºÙ„Ù‚ Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø­Ø³Ø¨ ÙˆÙ‚Øª ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø©. Ù„Ø§ ÙŠÙ…ÙƒÙ† ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø§Ø®ØªÙŠØ§Ø± Ø¨Ø¹Ø¯ Ø§Ù„Ø¥ØºÙ„Ø§Ù‚.",
  r8: "ØªØ²ÙŠØ¯ Ù‚ÙŠÙ…Ø© Ø§Ù„Ù†Ù‚Ø§Ø· Ù…Ø¹ ØªÙ‚Ø¯Ù… Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©ØŒ ÙˆÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªØ±ØªÙŠØ¨ Ø¨Ø¹Ø¯ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ù†ØªÙŠØ¬Ø©.",
  qf: "ÙÙŠ Ø±Ø¨Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ØªØ­ØªØ³Ø¨ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø­Ø³Ø¨ Ø§Ù„ÙØ§Ø¦Ø² Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ù„Ù„Ù…Ø¨Ø§Ø±Ø§Ø© ÙˆÙ„ÙŠØ³ Ù†ØªÙŠØ¬Ø© Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ø£ØµÙ„ÙŠ ÙÙ‚Ø·.",
  sf: "ØªÙˆÙ‚Ø¹Ø§Øª Ù†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ø£Ø¹Ù„Ù‰ Ù‚ÙŠÙ…Ø©ØŒ ÙˆØ£ÙŠ Ù…Ø¨Ø§Ø±Ø§Ø© Ø¨Ù„Ø§ Ù†ØªÙŠØ¬Ø© Ù„Ø§ ØªØ¯Ø®Ù„ ÙÙŠ Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ù‚Ø§Ø·.",
  final: "ØªÙˆÙ‚Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠÙ…Ù†Ø­ Ø£Ø¹Ù„Ù‰ Ù†Ù‚Ø§Ø· ÙÙŠ Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©ØŒ ÙˆØ§Ù„ØªØ±ØªÙŠØ¨ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ù…Ø¬Ù…ÙˆØ¹ ÙƒÙ„ Ø§Ù„Ø¬ÙˆÙ„Ø§Øª."
};

const state = {
  currentUser: readSession(),
  matches: [],
  standings: [],
  predictions: {},
  loading: true,
  error: "",
  notice: ""
};

let activeTab = state.currentUser?.role === "organizer" ? "manage" : "matches";
let activeRound = "r32";

function apiUrl(action) {
  const base = window.location.protocol === "file:" ? "https://www.pickaside.mobile/api/worldcup" : "/api/worldcup";
  return action ? `${base}?action=${action}` : base;
}

async function api(action, options = {}) {
  const response = await fetch(apiUrl(action), {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø³ÙŠØ±ÙØ±");
  return payload;
}

async function loadData() {
  if (!state.currentUser) {
    state.loading = false;
    render();
    return;
  }

  state.loading = true;
  state.error = "";
  render();

  try {
    const query = state.currentUser.id ? `state&userId=${encodeURIComponent(state.currentUser.id)}` : "state";
    const payload = await api(query);
    state.matches = payload.matches || [];
    state.standings = payload.standings || [];
    state.predictions = payload.predictions || {};
  } catch (error) {
    state.error = error.message || "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©";
  } finally {
    state.loading = false;
    render();
  }
}

function render() {
  const app = document.querySelector("#app");
  if (!state.currentUser) {
    app.innerHTML = loginTemplate();
    bindLogin();
    return;
  }

  app.innerHTML = appTemplate();
  bindApp();
}

function loginTemplate() {
  return `
    <section class="hero">
      <div class="brand-row">
        <div class="mark">26</div>
        <span class="pill">Ø¨Ø·ÙˆÙ„Ø© Ù…Ø¨Ø§Ø´Ø±Ø©</span>
      </div>
      <h1>ÙƒØ£Ø³ Ø§Ù„Ø¹Ø§Ù„Ù… 2026</h1>
      <p>ØªÙˆÙ‚Ø¹Ø§Øª ÙˆÙ†ØªØ§Ø¦Ø¬ ÙˆØªØ±ØªÙŠØ¨ Ù…Ø¨Ø§Ø´Ø± Ù…Ø­ÙÙˆØ¸ Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ±ÙØ± Ù„ÙƒÙ„ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†.</p>
    </section>
    <section class="content">
      <form class="panel" id="loginForm">
        <h2>Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©</h2>
        <p class="small">Ø§Ø¯Ø®Ù„ Ø§Ù„Ø§Ø³Ù… ÙˆØ±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ ÙÙ‚Ø·ØŒ Ø«Ù… Ø§Ø®ØªØ± Ù†ÙˆØ¹ Ø§Ù„Ø­Ø³Ø§Ø¨.</p>
        <div id="loginError" class="notice danger-notice hidden"></div>
        <label class="field">
          <span>Ø§Ù„Ø§Ø³Ù…</span>
          <input id="name" required autocomplete="name" placeholder="Ù…Ø«Ø§Ù„: Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡" />
        </label>
        <label class="field">
          <span>Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…ØªØ­Ø±Ùƒ</span>
          <input id="phone" required inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" />
        </label>
        <div class="field">
          <span>Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©</span>
          <div class="role-grid">
            <button class="role-option active" type="button" data-role="participant">Ù…Ø´Ø§Ø±Ùƒ</button>
            <button class="role-option" type="button" data-role="organizer">Ù…Ù†Ø¸Ù…</button>
          </div>
        </div>
        <input id="role" type="hidden" value="participant" />
        <button class="primary-btn" id="loginBtn" type="submit">Ø¯Ø®ÙˆÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚</button>
      </form>
    </section>
  `;
}

function appTemplate() {
  const roleTabs = state.currentUser.role === "organizer"
    ? `<button class="tab ${activeTab === "manage" ? "active" : ""}" data-tab="manage">Ø¥Ø¯Ø§Ø±Ø©</button>`
    : `<button class="tab ${activeTab === "matches" ? "active" : ""}" data-tab="matches">Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª</button>`;

  return `
    <header class="topbar">
      <div class="brand-row">
        <div class="mark">26</div>
        <div class="user-meta">
          <strong>${escapeHtml(state.currentUser.name)}</strong>
          <span>${state.currentUser.role === "organizer" ? "Ù…Ù†Ø¸Ù… Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©" : "Ù…Ø´Ø§Ø±Ùƒ"}</span>
        </div>
      </div>
      <button class="pill" id="logoutBtn">Ø®Ø±ÙˆØ¬</button>
    </header>
    <nav class="tabs">
      ${roleTabs}
      <button class="tab ${activeTab === "standings" ? "active" : ""}" data-tab="standings">Ø§Ù„ØªØ±ØªÙŠØ¨</button>
      <button class="tab ${activeTab === "laws" ? "active" : ""}" data-tab="laws">Ø§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ†</button>
    </nav>
    <section class="content">
      ${noticeView()}
      ${state.loading ? loadingView() : state.error ? errorView(state.error) : currentView()}
    </section>
  `;
}

function currentView() {
  if (activeTab === "standings") return standingsView();
  if (activeTab === "laws") return lawsView();
  if (state.currentUser.role === "organizer") return manageView();
  return participantMatchesView();
}

function noticeView() {
  if (!state.notice) return "";
  const notice = state.notice;
  state.notice = "";
  return `<div class="notice">${escapeHtml(notice)}</div>`;
}

function loadingView() {
  return `<div class="empty">Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¨Ø·ÙˆÙ„Ø© Ù…Ù† Ø§Ù„Ø³ÙŠØ±ÙØ±...</div>`;
}

function errorView(message) {
  return `
    <div class="notice danger-notice">${escapeHtml(message)}</div>
    <button class="primary-btn" id="retryBtn" type="button">Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©</button>
  `;
}

function roundTabs() {
  return `
    <div class="round-tabs">
      ${rounds.map(round => `
        <button class="round-tab ${activeRound === round.id ? "active" : ""}" data-round="${round.id}">
          ${round.name}
        </button>
      `).join("")}
    </div>
  `;
}

function participantMatchesView() {
  const matches = state.matches.filter(match => match.round_id === activeRound);
  return `
    ${summaryView()}
    <div class="section-title">
      <h2>Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª</h2>
      <span class="small">Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ù…Ø­ÙÙˆØ¸Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ±ÙØ±</span>
    </div>
    ${roundTabs()}
    <div class="match-list">
      ${matches.length ? matches.map(match => matchCard(match, state.predictions[match.id])).join("") : emptyView("Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¨Ø§Ø±ÙŠØ§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ø¯ÙˆØ± Ø­Ø§Ù„ÙŠØ§Ù‹.")}
    </div>
  `;
}

function manageView() {
  const matches = state.matches.filter(match => match.round_id === activeRound);
  return `
    <form class="panel stack" id="matchForm">
      <div class="section-title">
        <h2>Ø¥Ø¶Ø§ÙØ© Ù…Ø¨Ø§Ø±Ø§Ø©</h2>
        <span class="small">ØªØ­ÙØ¸ Ù…Ø¨Ø§Ø´Ø±Ø© ÙÙŠ Ø§Ù„Ø³ÙŠØ±ÙØ±</span>
      </div>
      <label class="field">
        <span>Ø§Ù„Ø¯ÙˆØ±</span>
        <select id="matchRound">${rounds.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}</select>
      </label>
      <label class="field"><span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø£ÙˆÙ„</span><input id="teamA" required placeholder="Ø§Ø³Ù… Ø§Ù„ÙØ±ÙŠÙ‚" /></label>
      <label class="field"><span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø«Ø§Ù†ÙŠ</span><input id="teamB" required placeholder="Ø§Ø³Ù… Ø§Ù„ÙØ±ÙŠÙ‚" /></label>
      <label class="field"><span>ÙˆÙ‚Øª Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</span><input id="startsAt" required type="datetime-local" /></label>
      <label class="field"><span>ÙˆÙ‚Øª Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„ØªØµÙˆÙŠØª</span><input id="voteEndsAt" required type="datetime-local" /></label>
      <button class="primary-btn" type="submit">Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</button>
    </form>
    <div class="section-title" style="margin-top:18px">
      <h2>Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù†ØªØ§Ø¦Ø¬</h2>
      <span class="small">ØªÙ†Ø¹ÙƒØ³ Ø¹Ù„Ù‰ ÙƒÙ„ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†</span>
    </div>
    ${roundTabs()}
    <div class="match-list">
      ${matches.length ? matches.map(managerMatchCard).join("") : emptyView("Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¨Ø§Ø±ÙŠØ§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ø¯ÙˆØ± Ø­Ø§Ù„ÙŠØ§Ù‹.")}
    </div>
  `;
}

function standingsView() {
  return `
    <div class="section-title">
      <h2>ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†</h2>
      <span class="small">Ù…Ù† Ø§Ù„Ø£Ø¹Ù„Ù‰ Ù„Ù„Ø£Ù‚Ù„</span>
    </div>
    <div class="leader-list">
      ${state.standings.length ? state.standings.map((row, index) => `
        <div class="leader-row ${row.id === state.currentUser.id ? "current" : ""}">
          <div class="rank">${index + 1}</div>
          <div class="leader-name">
            <strong>${escapeHtml(row.name)}</strong>
            <span class="small">ØµØ­ÙŠØ­: ${row.correct_predictions} | Ø®Ø·Ø£: ${row.wrong_predictions}</span>
          </div>
          <div class="points">${row.points}</div>
        </div>
      `).join("") : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙƒÙˆÙ† Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.")}
    </div>
  `;
}

function lawsView() {
  return `
    <div class="section-title">
      <h2>Ù‚ÙˆØ§Ù†ÙŠÙ† Ø£Ø¯ÙˆØ§Ø± Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©</h2>
      <span class="small">Ù†Ø¸Ø§Ù… Ø§Ù„Ù†Ù‚Ø§Ø· ÙˆØ§Ù„Ø¥ØºÙ„Ø§Ù‚</span>
    </div>
    <div class="law-list">
      ${rounds.map(round => `
        <article class="law-card">
          <h3>${round.name}</h3>
          <p>${laws[round.id]} Ø§Ù„Ù†Ù‚Ø§Ø·: ${round.points} Ù„ÙƒÙ„ ØªÙˆÙ‚Ø¹ ØµØ­ÙŠØ­.</p>
        </article>
      `).join("")}
    </div>
  `;
}

function summaryView() {
  const mine = state.standings.find(row => row.id === state.currentUser.id) || { points: 0, correct_predictions: 0, wrong_predictions: 0 };
  return `
    <div class="summary-grid" style="margin-bottom:16px">
      <div class="summary-card"><span class="small">Ø§Ù„Ù†Ù‚Ø§Ø·</span><strong>${mine.points}</strong></div>
      <div class="summary-card"><span class="small">ØµØ­ÙŠØ­</span><strong>${mine.correct_predictions}</strong></div>
      <div class="summary-card"><span class="small">Ø®Ø·Ø£</span><strong>${mine.wrong_predictions}</strong></div>
    </div>
  `;
}

function matchCard(match, selected) {
  const locked = new Date(match.vote_ends_at) <= new Date();
  const status = match.winner ? `<span class="status-chip done">Ø§Ù„ÙØ§Ø¦Ø²: ${escapeHtml(match.winner)}</span>` : `<span class="status-chip">Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù†ØªÙŠØ¬Ø©</span>`;
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        ${status}
      </div>
      <div class="teams">${escapeHtml(match.team_a)} Ø¶Ø¯ ${escapeHtml(match.team_b)}</div>
      <div class="deadline">ÙˆÙ‚Øª Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©: ${formatDate(match.starts_at)}<br>Ù†Ù‡Ø§ÙŠØ© Ø§Ù„ØªØµÙˆÙŠØª: ${formatDate(match.vote_ends_at)}</div>
      <div class="choices">
        <button class="choice ${selected === match.team_a ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.team_a)}">${escapeHtml(match.team_a)}</button>
        <button class="choice ${selected === match.team_b ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.team_b)}">${escapeHtml(match.team_b)}</button>
      </div>
      ${selected ? `<p class="small">ØªÙ… Ø­ÙØ¸ ØªÙˆÙ‚Ø¹Ùƒ: ${escapeHtml(selected)}</p>` : `<p class="small">Ù„Ù… ØªØ­ÙØ¸ ØªÙˆÙ‚Ø¹Ùƒ Ù„Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ø¨Ø¹Ø¯.</p>`}
      ${locked ? `<p class="small">Ø§Ù†ØªÙ‡Ù‰ ÙˆÙ‚Øª Ø§Ù„ØªØµÙˆÙŠØª Ù„Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©.</p>` : ""}
    </article>
  `;
}

function managerMatchCard(match) {
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        <span class="status-chip ${match.winner ? "done" : ""}">${match.winner ? "ØªÙ… Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ù†ØªÙŠØ¬Ø©" : "Ø¨Ø¯ÙˆÙ† Ù†ØªÙŠØ¬Ø©"}</span>
      </div>
      <div class="teams">${escapeHtml(match.team_a)} Ø¶Ø¯ ${escapeHtml(match.team_b)}</div>
      <div class="deadline">ÙˆÙ‚Øª Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©: ${formatDate(match.starts_at)}<br>Ù†Ù‡Ø§ÙŠØ© Ø§Ù„ØªØµÙˆÙŠØª: ${formatDate(match.vote_ends_at)}</div>
      <div class="result-row">
        <button class="choice ${match.winner === match.team_a ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_a)}">${escapeHtml(match.team_a)}</button>
        <button class="choice ${match.winner === match.team_b ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_b)}">${escapeHtml(match.team_b)}</button>
      </div>
      <button class="ghost-btn" style="margin-top:8px" data-clear="${match.id}">Ù…Ø³Ø­ Ø§Ù„Ù†ØªÙŠØ¬Ø©</button>
    </article>
  `;
}

function bindLogin() {
  let selectedRole = "participant";
  document.querySelectorAll(".role-option").forEach(button => {
    button.addEventListener("click", () => {
      selectedRole = button.dataset.role;
      document.querySelector("#role").value = selectedRole;
      document.querySelectorAll(".role-option").forEach(item => item.classList.toggle("active", item === button));
    });
  });

  document.querySelector("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const errorBox = document.querySelector("#loginError");
    const loginBtn = document.querySelector("#loginBtn");
    errorBox.classList.add("hidden");
    loginBtn.disabled = true;
    loginBtn.textContent = "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¯Ø®ÙˆÙ„...";

    try {
      const payload = await api("login", {
        method: "POST",
        body: JSON.stringify({
          name: document.querySelector("#name").value.trim(),
          phone: document.querySelector("#phone").value.trim(),
          role: selectedRole
        })
      });
      state.currentUser = payload.user;
      writeSession(payload.user);
      activeTab = payload.user.role === "organizer" ? "manage" : "matches";
      await loadData();
    } catch (error) {
      errorBox.textContent = error.message || "ØªØ¹Ø°Ø± Ø§Ù„Ø¯Ø®ÙˆÙ„";
      errorBox.classList.remove("hidden");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Ø¯Ø®ÙˆÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚";
    }
  });
}

function bindApp() {
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    state.currentUser = null;
    writeSession(null);
    render();
  });

  document.querySelector("#retryBtn")?.addEventListener("click", loadData);

  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      render();
    });
  });

  document.querySelectorAll("[data-round]").forEach(button => {
    button.addEventListener("click", () => {
      activeRound = button.dataset.round;
      render();
    });
  });

  document.querySelectorAll("[data-pick]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        await api("prediction", {
          method: "POST",
          body: JSON.stringify({ userId: state.currentUser.id, matchId: button.dataset.pick, winner: button.dataset.team })
        });
        state.notice = "ØªÙ… Ø­ÙØ¸ ØªÙˆÙ‚Ø¹Ùƒ ÙÙŠ Ø§Ù„Ø³ÙŠØ±ÙØ±.";
        await loadData();
      } catch (error) {
        state.error = error.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„ØªÙˆÙ‚Ø¹";
        render();
      }
    });
  });

  document.querySelectorAll("[data-result]").forEach(button => {
    button.addEventListener("click", async () => {
      await saveResult(button.dataset.result, button.dataset.team);
    });
  });

  document.querySelectorAll("[data-clear]").forEach(button => {
    button.addEventListener("click", async () => {
      await saveResult(button.dataset.clear, "");
    });
  });

  document.querySelector("#matchForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    try {
      const match = {
        userId: state.currentUser.id,
        roundId: document.querySelector("#matchRound").value,
        teamA: document.querySelector("#teamA").value.trim(),
        teamB: document.querySelector("#teamB").value.trim(),
        startsAt: document.querySelector("#startsAt").value,
        voteEndsAt: document.querySelector("#voteEndsAt").value
      };
      await api("match", { method: "POST", body: JSON.stringify(match) });
      activeRound = match.roundId;
      state.notice = "ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© ÙÙŠ Ø§Ù„Ø³ÙŠØ±ÙØ±.";
      await loadData();
    } catch (error) {
      state.error = error.message || "ØªØ¹Ø°Ø± Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©";
      render();
    }
  });
}

async function saveResult(matchId, winner) {
  try {
    await api("result", {
      method: "POST",
      body: JSON.stringify({ userId: state.currentUser.id, matchId, winner })
    });
    state.notice = winner ? "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙˆØ§Ù„ØªØ±ØªÙŠØ¨." : "ØªÙ… Ù…Ø³Ø­ Ø§Ù„Ù†ØªÙŠØ¬Ø©.";
    await loadData();
  } catch (error) {
    state.error = error.message || "ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†ØªÙŠØ¬Ø©";
    render();
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function writeSession(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

function roundName(id) {
  return rounds.find(round => round.id === id)?.name || id;
}

function emptyView(text) {
  return `<div class="empty">${text}</div>`;
}

function formatDate(value) {
  if (!value) return "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
  return new Intl.DateTimeFormat("ar-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadData();

