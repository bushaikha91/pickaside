const STORAGE_KEY = "wc2026-predictions-app-v1";

const rounds = [
  { id: "r32", name: "دور الـ 32", matches: 16, points: 2 },
  { id: "r16", name: "دور الـ 16", matches: 8, points: 3 },
  { id: "r8", name: "دور الـ 8", matches: 4, points: 4 },
  { id: "qf", name: "ربع النهائي", matches: 4, points: 5 },
  { id: "sf", name: "نصف النهائي", matches: 2, points: 7 },
  { id: "final", name: "النهائي", matches: 1, points: 10 }
];

const laws = {
  r32: "يختار المشارك فائز كل مباراة قبل نهاية وقت التصويت. كل توقع صحيح يمنح نقطتين.",
  r16: "تغلق التوقعات حسب وقت كل مباراة. لا يمكن تعديل الاختيار بعد الإغلاق.",
  r8: "تزيد قيمة النقاط مع تقدم البطولة، ويتم تحديث الترتيب بعد إدخال النتيجة.",
  qf: "في ربع النهائي تحتسب النتيجة حسب الفائز النهائي للمباراة وليس نتيجة الوقت الأصلي فقط.",
  sf: "توقعات نصف النهائي أعلى قيمة، وأي مباراة بلا نتيجة لا تدخل في حساب النقاط.",
  final: "توقع النهائي يمنح أعلى نقاط في البطولة، والترتيب النهائي يعتمد على مجموع كل الجولات."
};

const seedTeams = [
  ["كندا", "اليابان"], ["المكسيك", "تشيلي"], ["أمريكا", "غانا"], ["الأرجنتين", "كوريا"],
  ["فرنسا", "المغرب"], ["البرازيل", "الدنمارك"], ["إنجلترا", "أستراليا"], ["إسبانيا", "مصر"],
  ["ألمانيا", "السنغال"], ["البرتغال", "سويسرا"], ["هولندا", "كولومبيا"], ["أوروغواي", "السويد"],
  ["إيطاليا", "تونس"], ["بلجيكا", "نيجيريا"], ["كرواتيا", "الإكوادور"], ["السعودية", "بولندا"]
];

const state = loadState();
let activeTab = "matches";
let activeRound = "r32";
let notice = "";

function defaultState() {
  const now = new Date();
  const matches = seedTeams.map((teams, index) => {
    const startsAt = new Date(now.getTime() + (index + 1) * 86400000);
    const voteEndsAt = new Date(startsAt.getTime() - 2 * 60 * 60 * 1000);
    return {
      id: createId(),
      round: "r32",
      teamA: teams[0],
      teamB: teams[1],
      startsAt: toInputDateTime(startsAt),
      voteEndsAt: toInputDateTime(voteEndsAt),
      winner: ""
    };
  });

  return {
    currentUser: null,
    participants: [
      { id: "demo-1", name: "سالم", phone: "0500000001" },
      { id: "demo-2", name: "مريم", phone: "0500000002" },
      { id: "demo-3", name: "راشد", phone: "0500000003" }
    ],
    matches,
    predictions: {
      "demo-1": {},
      "demo-2": {},
      "demo-3": {}
    }
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultState();
  try {
    return { ...defaultState(), ...JSON.parse(saved) };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
        <span class="pill">توقعات البطولة</span>
      </div>
      <h1>كأس العالم 2026</h1>
      <p>إدارة مباريات البطولة وتوقعات المشاركين بنظام نقاط واضح وتحديث مباشر للترتيب.</p>
    </section>
    <section class="content">
      <form class="panel" id="loginForm">
        <h2>إنشاء حساب</h2>
        <p class="small">ادخل الاسم ورقم الهاتف فقط، ثم اختر نوع الحساب.</p>
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
        <button class="primary-btn" type="submit">دخول التطبيق</button>
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
      ${currentView()}
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
  if (!notice) return "";
  const text = notice;
  notice = "";
  return `<div class="notice">${text}</div>`;
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
  const matches = state.matches.filter(match => match.round === activeRound);
  const predictionMap = state.predictions[state.currentUser.id] || {};

  return `
    ${noticeView()}
    ${summaryView()}
    <div class="section-title">
      <h2>قائمة المباريات</h2>
      <span class="small">اختر الفائز قبل إغلاق التصويت</span>
    </div>
    ${roundTabs()}
    <div class="match-list">
      ${matches.length ? matches.map(match => matchCard(match, predictionMap[match.id])).join("") : emptyView("لا توجد مباريات في هذا الدور حالياً.")}
    </div>
  `;
}

function manageView() {
  const matches = state.matches.filter(match => match.round === activeRound);

  return `
    <form class="panel stack" id="matchForm">
      <div class="section-title">
        <h2>إضافة مباراة</h2>
        <span class="small">صلاحية المنظم</span>
      </div>
      <label class="field">
        <span>الدور</span>
        <select id="matchRound">${rounds.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}</select>
      </label>
      <label class="field">
        <span>الفريق الأول</span>
        <input id="teamA" required placeholder="اسم الفريق" />
      </label>
      <label class="field">
        <span>الفريق الثاني</span>
        <input id="teamB" required placeholder="اسم الفريق" />
      </label>
      <label class="field">
        <span>وقت المباراة</span>
        <input id="startsAt" required type="datetime-local" />
      </label>
      <label class="field">
        <span>وقت انتهاء التصويت</span>
        <input id="voteEndsAt" required type="datetime-local" />
      </label>
      <button class="primary-btn" type="submit">إضافة المباراة</button>
    </form>
    <div class="section-title" style="margin-top:18px">
      <h2>إدارة النتائج</h2>
      <span class="small">تنعكس على النقاط مباشرة</span>
    </div>
    ${roundTabs()}
    <div class="match-list">
      ${matches.length ? matches.map(managerMatchCard).join("") : emptyView("لا توجد مباريات في هذا الدور حالياً.")}
    </div>
  `;
}

function standingsView() {
  const standings = calculateStandings();
  return `
    <div class="section-title">
      <h2>ترتيب المشاركين</h2>
      <span class="small">تحديث تلقائي حسب النتائج</span>
    </div>
    <div class="leader-list">
      ${standings.map((row, index) => `
        <div class="leader-row ${row.id === state.currentUser.id ? "current" : ""}">
          <div class="rank">${index + 1}</div>
          <div class="leader-name">
            <strong>${escapeHtml(row.name)}</strong>
            <span class="small">صحيح: ${row.correct} | خطأ: ${row.wrong}</span>
          </div>
          <div class="points">${row.points}</div>
        </div>
      `).join("")}
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
  const mine = calculateStandings().find(row => row.id === state.currentUser.id) || { points: 0, correct: 0, wrong: 0 };
  return `
    <div class="summary-grid" style="margin-bottom:16px">
      <div class="summary-card"><span class="small">النقاط</span><strong>${mine.points}</strong></div>
      <div class="summary-card"><span class="small">صحيح</span><strong>${mine.correct}</strong></div>
      <div class="summary-card"><span class="small">خطأ</span><strong>${mine.wrong}</strong></div>
    </div>
  `;
}

function matchCard(match, selected) {
  const locked = new Date(match.voteEndsAt) <= new Date();
  const status = match.winner ? `<span class="status-chip done">الفائز: ${escapeHtml(match.winner)}</span>` : `<span class="status-chip">بانتظار النتيجة</span>`;
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round)}</span>
        ${status}
      </div>
      <div class="teams">${escapeHtml(match.teamA)} ضد ${escapeHtml(match.teamB)}</div>
      <div class="deadline">وقت المباراة: ${formatDate(match.startsAt)}<br>نهاية التصويت: ${formatDate(match.voteEndsAt)}</div>
      <div class="choices">
        <button class="choice ${selected === match.teamA ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.teamA)}">${escapeHtml(match.teamA)}</button>
        <button class="choice ${selected === match.teamB ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.teamB)}">${escapeHtml(match.teamB)}</button>
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
        <span class="round-badge">${roundName(match.round)}</span>
        <span class="status-chip ${match.winner ? "done" : ""}">${match.winner ? "تم إدخال النتيجة" : "بدون نتيجة"}</span>
      </div>
      <div class="teams">${escapeHtml(match.teamA)} ضد ${escapeHtml(match.teamB)}</div>
      <div class="deadline">وقت المباراة: ${formatDate(match.startsAt)}<br>نهاية التصويت: ${formatDate(match.voteEndsAt)}</div>
      <div class="result-row">
        <button class="choice ${match.winner === match.teamA ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.teamA)}">${escapeHtml(match.teamA)}</button>
        <button class="choice ${match.winner === match.teamB ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.teamB)}">${escapeHtml(match.teamB)}</button>
      </div>
      <button class="ghost-btn" style="margin-top:8px" data-clear="${match.id}">مسح النتيجة</button>
    </article>
  `;
}

function calculateStandings() {
  return state.participants.map(participant => {
    const picks = state.predictions[participant.id] || {};
    let points = 0;
    let correct = 0;
    let wrong = 0;

    state.matches.forEach(match => {
      if (!match.winner || !picks[match.id]) return;
      if (picks[match.id] === match.winner) {
        correct += 1;
        points += rounds.find(round => round.id === match.round)?.points || 0;
      } else {
        wrong += 1;
      }
    });

    return { ...participant, points, correct, wrong };
  }).sort((a, b) => b.points - a.points || b.correct - a.correct || a.wrong - b.wrong);
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

  document.querySelector("#loginForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = document.querySelector("#name").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    if (!name || !phone) return;

    let user = state.participants.find(item => item.phone === phone);
    if (selectedRole === "participant") {
      if (!user) {
        user = { id: createId(), name, phone };
        state.participants.push(user);
      } else {
        user.name = name;
      }
      if (!state.predictions[user.id]) state.predictions[user.id] = {};
    } else {
      user = user || { id: `organizer-${phone}`, name, phone };
    }

    state.currentUser = { ...user, name, phone, role: selectedRole };
    activeTab = selectedRole === "organizer" ? "manage" : "matches";
    saveState();
    render();
  });
}

function bindApp() {
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    state.currentUser = null;
    saveState();
    render();
  });

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
    button.addEventListener("click", () => {
      const matchId = button.dataset.pick;
      const team = button.dataset.team;
      state.predictions[state.currentUser.id][matchId] = team;
      notice = "تم حفظ توقعك بنجاح.";
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-result]").forEach(button => {
    button.addEventListener("click", () => {
      const match = state.matches.find(item => item.id === button.dataset.result);
      if (match) match.winner = button.dataset.team;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-clear]").forEach(button => {
    button.addEventListener("click", () => {
      const match = state.matches.find(item => item.id === button.dataset.clear);
      if (match) match.winner = "";
      saveState();
      render();
    });
  });

  const form = document.querySelector("#matchForm");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const match = {
        id: createId(),
        round: document.querySelector("#matchRound").value,
        teamA: document.querySelector("#teamA").value.trim(),
        teamB: document.querySelector("#teamB").value.trim(),
        startsAt: document.querySelector("#startsAt").value,
        voteEndsAt: document.querySelector("#voteEndsAt").value,
        winner: ""
      };
      if (!match.teamA || !match.teamB || !match.startsAt || !match.voteEndsAt) return;
      state.matches.push(match);
      activeRound = match.round;
      saveState();
      render();
    });
  }
}

function roundName(id) {
  return rounds.find(round => round.id === id)?.name || id;
}

function emptyView(text) {
  return `<div class="empty">${text}</div>`;
}

function toInputDateTime(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value) {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat("ar-AE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
