const SESSION_KEY = "wc2026-live-session-v1";

const rounds = [
  { id: "r32", name: "دور الـ 32", points: 2 },
  { id: "r16", name: "دور الـ 16", points: 3 },
  { id: "r8", name: "دور الـ 8", points: 4 },
  { id: "qf", name: "ربع النهائي", points: 5 },
  { id: "sf", name: "نصف النهائي", points: 7 },
  { id: "final", name: "النهائي", points: 10 }
];

const laws = {
  r32: "يختار المشارك فائز كل مباراة قبل نهاية وقت التصويت. كل توقع صحيح يمنح نقطتين.",
  r16: "تغلق التوقعات حسب وقت كل مباراة. لا يمكن تعديل الاختيار بعد الإغلاق.",
  r8: "تزيد قيمة النقاط مع تقدم البطولة، ويتم تحديث الترتيب بعد إدخال النتيجة.",
  qf: "في ربع النهائي تحتسب النتيجة حسب الفائز النهائي للمباراة وليس نتيجة الوقت الأصلي فقط.",
  sf: "توقعات نصف النهائي أعلى قيمة، وأي مباراة بلا نتيجة لا تدخل في حساب النقاط.",
  final: "توقع النهائي يمنح أعلى نقاط في البطولة، والترتيب النهائي يعتمد على مجموع كل الجولات."
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
  const base = window.location.protocol === "file:" ? "https://www.pickaside.mobile/api/worldcup2026" : "/api/worldcup2026";
  return action ? `${base}?action=${action}` : base;
}

async function api(action, options = {}) {
  const response = await fetch(apiUrl(action), {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "تعذر الاتصال بالسيرفر");
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
    state.error = error.message || "تعذر تحميل بيانات البطولة";
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
        <span class="pill">بطولة مباشرة</span>
      </div>
      <h1>كأس العالم 2026</h1>
      <p>توقعات ونتائج وترتيب مباشر محفوظ على السيرفر لكل المشاركين.</p>
    </section>
    <section class="content">
      <form class="panel" id="loginForm">
        <h2>دخول البطولة</h2>
        <p class="small">ادخل الاسم ورقم الهاتف فقط، ثم اختر نوع الحساب.</p>
        <div id="loginError" class="notice danger-notice hidden"></div>
        <label class="field">
          <span>الاسم</span>
          <input id="name" required autocomplete="name" placeholder="مثال: عبدالله" />
        </label>
        <label class="field">
          <span>رقم الهاتف المتحرك</span>
          <input id="phone" required inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" />
        </label>
        <div class="field">
          <span>الصلاحية</span>
          <div class="role-grid">
            <button class="role-option active" type="button" data-role="participant">مشارك</button>
            <button class="role-option" type="button" data-role="organizer">منظم</button>
          </div>
        </div>
        <input id="role" type="hidden" value="participant" />
        <button class="primary-btn" id="loginBtn" type="submit">دخول التطبيق</button>
      </form>
    </section>
  `;
}

function appTemplate() {
  const roleTabs = state.currentUser.role === "organizer"
    ? `<button class="tab ${activeTab === "manage" ? "active" : ""}" data-tab="manage">إدارة</button>`
    : `<button class="tab ${activeTab === "matches" ? "active" : ""}" data-tab="matches">المباريات</button>`;

  return `
    <header class="topbar">
      <div class="brand-row">
        <div class="mark">26</div>
        <div class="user-meta">
          <strong>${escapeHtml(state.currentUser.name)}</strong>
          <span>${state.currentUser.role === "organizer" ? "منظم البطولة" : "مشارك"}</span>
        </div>
      </div>
      <button class="pill" id="logoutBtn">خروج</button>
    </header>
    <nav class="tabs">
      ${roleTabs}
      <button class="tab ${activeTab === "standings" ? "active" : ""}" data-tab="standings">الترتيب</button>
      <button class="tab ${activeTab === "laws" ? "active" : ""}" data-tab="laws">القوانين</button>
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
  return `<div class="empty">جاري تحميل بيانات البطولة من السيرفر...</div>`;
}

function errorView(message) {
  return `
    <div class="notice danger-notice">${escapeHtml(message)}</div>
    <button class="primary-btn" id="retryBtn" type="button">إعادة المحاولة</button>
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
      <h2>قائمة المباريات</h2>
      <span class="small">التوقعات محفوظة على السيرفر</span>
    </div>
    ${roundTabs()}
    <div class="match-list">
      ${matches.length ? matches.map(match => matchCard(match, state.predictions[match.id])).join("") : emptyView("لا توجد مباريات في هذا الدور حالياً.")}
    </div>
  `;
}

function manageView() {
  const matches = state.matches.filter(match => match.round_id === activeRound);
  return `
    <form class="panel stack" id="matchForm">
      <div class="section-title">
        <h2>إضافة مباراة</h2>
        <span class="small">تحفظ مباشرة في السيرفر</span>
      </div>
      <label class="field">
        <span>الدور</span>
        <select id="matchRound">${rounds.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}</select>
      </label>
      <label class="field"><span>الفريق الأول</span><input id="teamA" required placeholder="اسم الفريق" /></label>
      <label class="field"><span>الفريق الثاني</span><input id="teamB" required placeholder="اسم الفريق" /></label>
      <label class="field"><span>وقت المباراة</span><input id="startsAt" required type="datetime-local" /></label>
      <label class="field"><span>وقت انتهاء التصويت</span><input id="voteEndsAt" required type="datetime-local" /></label>
      <button class="primary-btn" type="submit">إضافة المباراة</button>
    </form>
    <div class="section-title" style="margin-top:18px">
      <h2>إدارة النتائج</h2>
      <span class="small">تنعكس على كل المشاركين</span>
    </div>
    ${roundTabs()}
    <div class="match-list">
      ${matches.length ? matches.map(managerMatchCard).join("") : emptyView("لا توجد مباريات في هذا الدور حالياً.")}
    </div>
  `;
}

function standingsView() {
  return `
    <div class="section-title">
      <h2>ترتيب المشاركين</h2>
      <span class="small">من الأعلى للأقل</span>
    </div>
    <div class="leader-list">
      ${state.standings.length ? state.standings.map((row, index) => `
        <div class="leader-row ${row.id === state.currentUser.id ? "current" : ""}">
          <div class="rank">${index + 1}</div>
          <div class="leader-name">
            <strong>${escapeHtml(row.name)}</strong>
            <span class="small">صحيح: ${row.correct_predictions} | خطأ: ${row.wrong_predictions}</span>
          </div>
          <div class="points">${row.points}</div>
        </div>
      `).join("") : emptyView("لا يوجد مشاركون حتى الآن.")}
    </div>
  `;
}

function lawsView() {
  return `
    <div class="section-title">
      <h2>قوانين أدوار البطولة</h2>
      <span class="small">نظام النقاط والإغلاق</span>
    </div>
    <div class="law-list">
      ${rounds.map(round => `
        <article class="law-card">
          <h3>${round.name}</h3>
          <p>${laws[round.id]} النقاط: ${round.points} لكل توقع صحيح.</p>
        </article>
      `).join("")}
    </div>
  `;
}

function summaryView() {
  const mine = state.standings.find(row => row.id === state.currentUser.id) || { points: 0, correct_predictions: 0, wrong_predictions: 0 };
  return `
    <div class="summary-grid" style="margin-bottom:16px">
      <div class="summary-card"><span class="small">النقاط</span><strong>${mine.points}</strong></div>
      <div class="summary-card"><span class="small">صحيح</span><strong>${mine.correct_predictions}</strong></div>
      <div class="summary-card"><span class="small">خطأ</span><strong>${mine.wrong_predictions}</strong></div>
    </div>
  `;
}

function matchCard(match, selected) {
  const locked = new Date(match.vote_ends_at) <= new Date();
  const status = match.winner ? `<span class="status-chip done">الفائز: ${escapeHtml(match.winner)}</span>` : `<span class="status-chip">بانتظار النتيجة</span>`;
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        ${status}
      </div>
      <div class="teams">${escapeHtml(match.team_a)} ضد ${escapeHtml(match.team_b)}</div>
      <div class="deadline">وقت المباراة: ${formatDate(match.starts_at)}<br>نهاية التصويت: ${formatDate(match.vote_ends_at)}</div>
      <div class="choices">
        <button class="choice ${selected === match.team_a ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.team_a)}">${escapeHtml(match.team_a)}</button>
        <button class="choice ${selected === match.team_b ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.team_b)}">${escapeHtml(match.team_b)}</button>
      </div>
      ${selected ? `<p class="small">تم حفظ توقعك: ${escapeHtml(selected)}</p>` : `<p class="small">لم تحفظ توقعك لهذه المباراة بعد.</p>`}
      ${locked ? `<p class="small">انتهى وقت التصويت لهذه المباراة.</p>` : ""}
    </article>
  `;
}

function managerMatchCard(match) {
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        <span class="status-chip ${match.winner ? "done" : ""}">${match.winner ? "تم إدخال النتيجة" : "بدون نتيجة"}</span>
      </div>
      <div class="teams">${escapeHtml(match.team_a)} ضد ${escapeHtml(match.team_b)}</div>
      <div class="deadline">وقت المباراة: ${formatDate(match.starts_at)}<br>نهاية التصويت: ${formatDate(match.vote_ends_at)}</div>
      <div class="result-row">
        <button class="choice ${match.winner === match.team_a ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_a)}">${escapeHtml(match.team_a)}</button>
        <button class="choice ${match.winner === match.team_b ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_b)}">${escapeHtml(match.team_b)}</button>
      </div>
      <button class="ghost-btn" style="margin-top:8px" data-clear="${match.id}">مسح النتيجة</button>
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
    loginBtn.textContent = "جاري الدخول...";

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
      errorBox.textContent = error.message || "تعذر الدخول";
      errorBox.classList.remove("hidden");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "دخول التطبيق";
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
        state.notice = "تم حفظ توقعك في السيرفر.";
        await loadData();
      } catch (error) {
        state.error = error.message || "تعذر حفظ التوقع";
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
      state.notice = "تمت إضافة المباراة في السيرفر.";
      await loadData();
    } catch (error) {
      state.error = error.message || "تعذر إضافة المباراة";
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
    state.notice = winner ? "تم تحديث النتيجة والترتيب." : "تم مسح النتيجة.";
    await loadData();
  } catch (error) {
    state.error = error.message || "تعذر تحديث النتيجة";
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
  if (!value) return "غير محدد";
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
