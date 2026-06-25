const SESSION_KEY = "wc2026-live-session-v1";
let deferredInstallPrompt = null;

const rounds = [
  { id: "r32", name: "دور الـ 32" },
  { id: "r16", name: "دور الـ 16" },
  { id: "r8", name: "دور الـ 8" },
  { id: "qf", name: "ربع النهائي" },
  { id: "sf", name: "نصف النهائي" },
  { id: "final", name: "النهائي" }
];

const laws = {
  r32: "كل مباراة قيمتها 200 نقطة: 150 نقطة لترشيح الفائز و50 نقطة للترشيح الأقل. التوقع الصحيح يسترجع 150 نقطة ويحصل على نصيبه من نقاط توقعات الخاسرين، والتوقع الخطأ يسترجع 50 نقطة فقط.",
  r16: "كل مباراة قيمتها 300 نقطة: 250 نقطة لترشيح الفائز و50 نقطة للترشيح الأقل. نقاط التوقعات الخاطئة تتجمع وتتوزع بالتساوي على أصحاب التوقع الصحيح.",
  r8: "رصيد كل مشارك قبل الدور ينقسم على 4 مباريات. في كل مباراة 90% من حصة المباراة للفائز و10% للترشيح الأقل، ونقاط الخسارة تتوزع على أصحاب التوقع الصحيح.",
  qf: "ربع النهائي يعمل بنفس نظام دور الـ 8: الرصيد ينقسم على 4 مباريات، 90% للفائز و10% للترشيح الأقل، مع توزيع خسائر التوقعات الخاطئة على الفائزين.",
  sf: "رصيد كل مشارك قبل نصف النهائي ينقسم على مباراتين. في كل مباراة 90% للفائز و10% للترشيح الأقل، وخسائر التوقعات الخاطئة تتوزع على أصحاب التوقع الصحيح.",
  final: "في النهائي يذهب كامل رصيد المشارك لترشيح الفائز. بعد إدخال النتيجة، أرصدة أصحاب التوقع الخاطئ تتوزع بالتساوي على أصحاب التوقع الصحيح ويحدد البطل."
};

const state = {
  currentUser: readSession(),
  matches: [],
  standings: [],
  predictions: {},
  matchPoints: {},
  participants: [],
  loading: true,
  error: "",
  notice: "",
  profileOpen: false,
  voterModalMatch: null,
  addMatchOpen: false
};

let activeTab = state.currentUser?.role === "organizer" ? "manage" : "matches";
let activeRound = "r32";
let countdownTimer = null;

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (!state.currentUser) render();
});

function apiUrl(action) {
  const base = window.location.protocol === "file:" ? "https://www.pickaside.mobile/api/app-config?worldcup=1" : "/api/app-config?worldcup=1";
  return action ? `${base}&action=${action}` : base;
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
    if (payload.user) {
      state.currentUser = { ...state.currentUser, ...payload.user };
      writeSession(state.currentUser);
    }
    state.matches = payload.matches || [];
    state.standings = payload.standings || [];
    state.predictions = payload.predictions || {};
    state.matchPoints = payload.matchPoints || {};
    state.participants = payload.participants || [];
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
    bindInstallControls();
    return;
  }

  app.innerHTML = appTemplate();
  bindApp();
}

function loginTemplate() {
  return `
    <section class="hero">
      <div class="brand-row">
        <div class="logo-tile"><img src="assets/worldcup-icon-192.png" alt="شعار كأس العالم 2026" /></div>
        <span class="pill">بطولة مباشرة</span>
      </div>
      <img class="hero-logo" src="assets/worldcup-logo-wide.jpg" alt="FIFA World Cup 2026" />
      <h1>كأس العالم 2026</h1>
      <p>توقعات ونتائج وترتيب مباشر محفوظ على السيرفر لكل المشاركين.</p>
    </section>
    <section class="content">
      <form class="panel" id="loginForm">
        <h2>دخول البطولة</h2>
        <p class="small" id="authHint">ادخل برقم الهاتف وكلمة المرور. إنشاء الحساب مطلوب أول مرة فقط.</p>
        <div id="loginError" class="notice danger-notice hidden"></div>
        <div class="field">
          <span>نوع العملية</span>
          <div class="role-grid">
            <button class="role-option active" type="button" data-auth-mode="login">دخول</button>
            <button class="role-option" type="button" data-auth-mode="create">إنشاء حساب</button>
          </div>
        </div>
        <label class="field hidden" id="nameField">
          <span>الاسم</span>
          <input id="name" autocomplete="name" placeholder="مثال: عبدالله" />
        </label>
        <label class="field">
          <span>رقم الهاتف المتحرك</span>
          <input id="phone" required inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" />
        </label>
        <label class="field">
          <span>كلمة المرور</span>
          <input id="password" required type="password" autocomplete="current-password" placeholder="كلمة المرور" />
        </label>
        <div class="field hidden" id="roleField">
          <span>الصلاحية</span>
          <div class="role-grid">
            <button class="role-option active" type="button" data-role="participant">مشارك</button>
            <button class="role-option" type="button" data-role="organizer">منظم</button>
          </div>
        </div>
        <label class="field hidden" id="organizerCodeField">
          <span>كود المنظم</span>
          <input id="organizerCode" autocomplete="one-time-code" placeholder="ادخل كود المنظم" />
        </label>
        <input id="role" type="hidden" value="participant" />
        <input id="mode" type="hidden" value="login" />
        <button class="primary-btn" id="loginBtn" type="submit">دخول التطبيق</button>
      </form>

      <section class="install-panel">
        <div>
          <h2>تنزيل التطبيق</h2>
          <p>ثبّت صفحة البطولة على شاشة الهاتف لاستخدامها كتطبيق مستقل.</p>
        </div>
        <div class="install-actions">
          <button class="install-btn android-install" id="androidInstallBtn" type="button">تنزيل للأندرويد</button>
          <button class="install-btn ios-install" id="iosInstallBtn" type="button">تنزيل للآيفون</button>
        </div>
        <div class="install-help" id="installHelp">
          على الآيفون: افتح الرابط من Safari، اضغط زر المشاركة، ثم اختر Add to Home Screen.
        </div>
      </section>
    </section>
  `;
}

function appTemplate() {
  const roleTabs = state.currentUser.role === "organizer"
    ? `
      <button class="tab ${activeTab === "manage" ? "active" : ""}" data-tab="manage">إدارة</button>
      <button class="tab ${activeTab === "participants" ? "active" : ""}" data-tab="participants">الطلبات</button>
    `
    : `<button class="tab ${activeTab === "matches" ? "active" : ""}" data-tab="matches">المباريات</button>`;

  return `
    <header class="topbar">
      <button class="brand-row profile-trigger" id="profileOpenBtn" type="button">
        ${avatarTile(state.currentUser, "top-logo")}
        <div class="user-meta">
          <strong>${escapeHtml(state.currentUser.name)}</strong>
          <span>${state.currentUser.role === "organizer" ? "منظم البطولة" : statusLabel(state.currentUser.participant_status)}</span>
        </div>
      </button>
      <button class="pill" id="logoutBtn">خروج</button>
    </header>
    <nav class="tabs ${state.currentUser.role === "organizer" ? "organizer-tabs" : ""}">
      ${roleTabs}
      <button class="tab ${activeTab === "standings" ? "active" : ""}" data-tab="standings">الترتيب</button>
      <button class="tab ${activeTab === "laws" ? "active" : ""}" data-tab="laws">القوانين</button>
    </nav>
    <section class="content">
      ${noticeView()}
      ${state.loading ? loadingView() : state.error ? errorView(state.error) : currentView()}
    </section>
    ${state.profileOpen ? profileModal() : ""}
    ${state.voterModalMatch ? voterModal(state.voterModalMatch) : ""}
  `;
}

function currentView() {
  if (activeTab === "standings") return standingsView();
  if (activeTab === "laws") return lawsView();
  if (state.currentUser.role === "participant" && state.currentUser.participant_status !== "approved") {
    return participantStatusView();
  }
  if (activeTab === "participants" && state.currentUser.role === "organizer") return participantsView();
  if (state.currentUser.role === "organizer") return manageView();
  return participantMatchesView();
}

function profileModal() {
  return `
    <div class="modal-backdrop" data-modal-close>
      <form class="modal-card stack profile-panel" id="profileForm">
        <div class="section-title">
          <h2>الملف الشخصي</h2>
          <button class="icon-close" type="button" data-profile-close>×</button>
        </div>
        <div class="profile-photo-row">
          ${avatarTile(state.currentUser, "avatar-large", "profileAvatarPreview")}
          <label class="field image-upload-field">
            <span>اختيار صورة</span>
            <input id="profileAvatar" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>
        <div id="profileError" class="notice danger-notice hidden"></div>
        <label class="field">
          <span>الاسم</span>
          <input id="profileName" required autocomplete="name" value="${escapeHtml(state.currentUser.name)}" />
        </label>
        <button class="primary-btn" type="submit">حفظ التعديل</button>
      </form>
    </div>
  `;
}

function participantStatusView() {
  const rejected = state.currentUser.participant_status === "rejected";
  return `
    <section class="panel waiting-panel">
      <span class="status-chip ${rejected ? "rejected" : ""}">${rejected ? "تم رفض الطلب" : "بانتظار موافقة المنظم"}</span>
      <h2>${rejected ? "لم يتم قبول دخولك" : "طلبك وصل للمنظم"}</h2>
      <p class="small">${rejected ? "راجع المنظم إذا كنت تعتقد أن الرفض بالخطأ." : "بعد قبولك ستظهر لك المباريات والتوقعات تلقائياً عند إعادة المحاولة."}</p>
      <button class="primary-btn" id="retryBtn" type="button">تحديث الحالة</button>
    </section>
  `;
}

function participantsView() {
  const pending = state.participants.filter(user => user.participant_status === "pending");
  const approved = state.participants.filter(user => user.participant_status === "approved");
  const rejected = state.participants.filter(user => user.participant_status === "rejected");
  return `
    <div class="section-title">
      <h2>طلبات المشاركين</h2>
      <span class="small">${pending.length} بانتظار الموافقة</span>
    </div>
    <div class="participant-list">
      ${pending.length ? pending.map(requestRow).join("") : emptyView("لا توجد طلبات جديدة.")}
    </div>
    <div class="section-title" style="margin-top:18px">
      <h2>المشاركون</h2>
      <span class="small">${approved.length} مقبول</span>
    </div>
    <div class="participant-list">
      ${approved.length ? approved.map(participantRow).join("") : emptyView("لا يوجد مشاركون مقبولون حتى الآن.")}
    </div>
    ${rejected.length ? `
      <div class="section-title" style="margin-top:18px">
        <h2>المرفوضون</h2>
        <span class="small">${rejected.length} مرفوض</span>
      </div>
      <div class="participant-list">
        ${rejected.map(rejectedRow).join("")}
      </div>
    ` : ""}
  `;
}

function requestRow(user) {
  return `
    <article class="participant-row">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
      </div>
      <span class="status-chip ${user.participant_status}">${statusLabel(user.participant_status)}</span>
      <div class="participant-actions">
        <button class="mini-btn approve" data-participant-status="approved" data-participant-id="${user.id}">قبول</button>
        <button class="mini-btn reject" data-participant-status="rejected" data-participant-id="${user.id}">رفض</button>
      </div>
    </article>
  `;
}

function participantRow(user) {
  return `
    <article class="swipe-row" data-swipe-row>
      <button class="swipe-delete" data-participant-delete="${user.id}" data-participant-name="${escapeHtml(user.name)}">حذف</button>
      <div class="participant-row swipe-content" data-swipe-content>
        ${avatarTile(user, "avatar-small")}
        <div>
          <strong>${escapeHtml(user.name)}</strong>
        </div>
        <span class="status-chip approved">مقبول</span>
      </div>
    </article>
  `;
}

function rejectedRow(user) {
  return `
    <article class="participant-row">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
      </div>
      <span class="status-chip rejected">مرفوض</span>
    </article>
  `;
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
  const matches = sortMatches(state.matches.filter(match => match.round_id === activeRound));
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
  const matches = sortMatches(state.matches.filter(match => match.round_id === activeRound));
  return `
    <div class="section-title">
      <h2>إدارة النتائج</h2>
      <span class="small">تنعكس على كل المشاركين</span>
    </div>
    ${roundTabs()}
    <button class="add-match-toggle" id="addMatchToggle" type="button">
      ${state.addMatchOpen ? "إغلاق إضافة المباراة" : `إضافة مباراة في ${roundName(activeRound)}`}
    </button>
    ${state.addMatchOpen ? matchFormView() : ""}
    <div class="match-list">
      ${matches.length ? matches.map(managerMatchCardV2).join("") : emptyView("لا توجد مباريات في هذا الدور حالياً.")}
    </div>
  `;
}

function matchFormView() {
  return `
    <form class="panel stack match-form-card" id="matchForm">
      <div class="section-title">
        <h2>إضافة مباراة</h2>
        <span class="small">${roundName(activeRound)}</span>
      </div>
      <div class="form-grid">
        <label class="field"><span>الفريق الأول</span><input id="teamA" required placeholder="اسم الفريق" /></label>
        <label class="field"><span>الفريق الثاني</span><input id="teamB" required placeholder="اسم الفريق" /></label>
      </div>
      <label class="field"><span>وقت المباراة</span><input id="startsAt" required type="datetime-local" /></label>
      <label class="field"><span>وقت انتهاء التصويت</span><input id="voteEndsAt" required type="datetime-local" /></label>
      <button class="primary-btn" type="submit">حفظ المباراة</button>
    </form>
  `;
}

function standingsView() {
  return `
    <div class="section-title">
      <h2>ترتيب المشاركين</h2>
      <span class="small">المقبولون فقط</span>
    </div>
    <div class="leader-list">
      ${state.standings.length ? state.standings.map((row, index) => `
        <div class="leader-row ${row.id === state.currentUser.id ? "current" : ""}">
          <div class="rank">${index + 1}</div>
          ${avatarTile(row, "avatar-small")}
          <div class="leader-name">
            <strong>${escapeHtml(row.name)}</strong>
            <span class="small">صحيح: ${row.correct_predictions} | خطأ: ${row.wrong_predictions}</span>
          </div>
          <div class="points">${row.points}</div>
        </div>
      `).join("") : emptyView("لا يوجد مشاركون مقبولون حتى الآن.")}
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
          <p>${laws[round.id]}</p>
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

function matchCard(match, prediction) {
  const locked = new Date(match.vote_ends_at) <= new Date();
  const selected = prediction?.winner || prediction || "";
  const isJoker = !!prediction?.is_joker;
  const points = state.matchPoints[match.id];
  const canUseJoker = ["r16", "sf"].includes(match.round_id);
  const status = matchStatusView(match, selected, points, locked);
  return `
    <article class="match-card ${locked ? "locked-card" : ""}">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        ${status}
      </div>
      <div class="teams team-row">${teamBadge(match.team_a, match.team_a_flag)}<span class="versus">ضد</span>${teamBadge(match.team_b, match.team_b_flag)}</div>
      <div class="teams">${escapeHtml(match.team_a)} ضد ${escapeHtml(match.team_b)}</div>
      <div class="deadline">وقت المباراة: ${formatDate(match.starts_at)}<br>نهاية التصويت: ${formatDate(match.vote_ends_at)}</div>
      <div class="countdown ${locked ? "expired" : ""}">${locked ? "انتهى التصويت" : `باقي للتصويت: ${countdownText(match.vote_ends_at)}`}</div>
      ${canUseJoker ? `
        <button class="joker-toggle ${isJoker ? "active" : ""}" ${locked ? "disabled" : ""} data-joker="${match.id}" type="button">
          ${isJoker ? "الجوكر مفعل ×2" : "تفعيل الجوكر ×2"}
        </button>
      ` : ""}
      <div class="choices">
        <button class="choice ${selected === match.team_a ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.team_a)}" data-joker-state="${isJoker ? "true" : "false"}">${escapeHtml(match.team_a)}</button>
        <button class="choice ${selected === match.team_b ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(match.team_b)}" data-joker-state="${isJoker ? "true" : "false"}">${escapeHtml(match.team_b)}</button>
      </div>
      ${selected ? `<p class="small">تم حفظ توقعك: ${escapeHtml(selected)}</p>` : `<p class="small">لم تحفظ توقعك لهذه المباراة بعد.</p>`}
    </article>
  `;
}

function managerMatchCard(match) {
  const teamsView = `<div class="teams team-row">${teamBadge(match.team_a, match.team_a_flag)}<span class="versus">ضد</span>${teamBadge(match.team_b, match.team_b_flag)}</div>`;
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        <span class="status-chip ${match.winner ? "done" : ""}">${match.winner ? "تم إدخال النتيجة" : "بدون نتيجة"}</span>
      </div>
      <div class="teams">${escapeHtml(match.team_a)} ضد ${escapeHtml(match.team_b)}</div>
      <div class="deadline">وقت المباراة: ${formatDate(match.starts_at)}<br>نهاية التصويت: ${formatDate(match.vote_ends_at)}</div>
      ${teamsView}
      <button class="vote-count-btn" data-voters="${match.id}" type="button">
        التصويت: ${match.vote_count || 0} من ${match.eligible_count || 0}
      </button>
      <div class="result-row">
        <button class="choice ${match.winner === match.team_a ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_a)}">${escapeHtml(match.team_a)}</button>
        <button class="choice ${match.winner === match.team_b ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_b)}">${escapeHtml(match.team_b)}</button>
      </div>
      <button class="ghost-btn" style="margin-top:8px" data-clear="${match.id}">مسح النتيجة</button>
    </article>
  `;
}

function managerMatchCardV2(match) {
  const teamsView = `<div class="teams team-row">${teamBadge(match.team_a, match.team_a_flag)}<span class="versus">ضد</span>${teamBadge(match.team_b, match.team_b_flag)}</div>`;
  const scoreA = Number.isInteger(match.score_a) ? match.score_a : "";
  const scoreB = Number.isInteger(match.score_b) ? match.score_b : "";
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        <span class="status-chip ${match.winner ? "done" : ""}">${match.winner ? `تم اعتماد النتيجة ${scoreA} - ${scoreB}` : "بدون نتيجة"}</span>
      </div>
      ${teamsView}
      <div class="deadline">وقت المباراة: ${formatDate(match.starts_at)}<br>نهاية التصويت: ${formatDate(match.vote_ends_at)}</div>
      <button class="vote-count-btn" data-voters="${match.id}" type="button">
        التصويت: ${match.vote_count || 0} من ${match.eligible_count || 0}
      </button>
      <details class="manager-tools">
        <summary>تعديل بطاقة المباراة</summary>
        <form class="stack manager-match-form" data-match-edit="${match.id}">
          <div class="form-grid">
            <label class="field"><span>الفريق الأول</span><input name="teamA" required value="${escapeHtml(match.team_a)}" /></label>
            <label class="field"><span>الفريق الثاني</span><input name="teamB" required value="${escapeHtml(match.team_b)}" /></label>
          </div>
          <div class="form-grid">
            <label class="field image-field">
              <span>علم الفريق الأول</span>
              <div class="image-input-row">
                <span class="flag-tile preview-tile" data-flag-preview="teamA-${match.id}">${match.team_a_flag ? `<img src="${escapeHtml(match.team_a_flag)}" alt="" />` : "A"}</span>
                <input name="teamAFlagFile" data-edit-flag="teamA-${match.id}" type="file" accept="image/png,image/jpeg,image/webp" />
                <input name="teamAFlag" type="hidden" value="${escapeHtml(match.team_a_flag || "")}" />
              </div>
            </label>
            <label class="field image-field">
              <span>علم الفريق الثاني</span>
              <div class="image-input-row">
                <span class="flag-tile preview-tile" data-flag-preview="teamB-${match.id}">${match.team_b_flag ? `<img src="${escapeHtml(match.team_b_flag)}" alt="" />` : "B"}</span>
                <input name="teamBFlagFile" data-edit-flag="teamB-${match.id}" type="file" accept="image/png,image/jpeg,image/webp" />
                <input name="teamBFlag" type="hidden" value="${escapeHtml(match.team_b_flag || "")}" />
              </div>
            </label>
          </div>
          <label class="field"><span>وقت المباراة</span><input name="startsAt" required type="datetime-local" value="${datetimeLocalValue(match.starts_at)}" /></label>
          <label class="field"><span>وقت انتهاء التصويت</span><input name="voteEndsAt" required type="datetime-local" value="${datetimeLocalValue(match.vote_ends_at)}" /></label>
          <button class="primary-btn" type="submit">حفظ تعديل المباراة</button>
        </form>
      </details>
      <form class="manager-result-form" data-result-form="${match.id}">
        <div class="score-grid">
          <label class="field"><span>أهداف ${escapeHtml(match.team_a)}</span><input name="scoreA" required min="0" step="1" type="number" value="${scoreA}" /></label>
          <label class="field"><span>أهداف ${escapeHtml(match.team_b)}</span><input name="scoreB" required min="0" step="1" type="number" value="${scoreB}" /></label>
        </div>
        <button class="primary-btn" type="submit">${match.winner ? "تعديل النتيجة" : "اعتماد النتيجة"}</button>
      </form>
      <div class="manager-actions">
        <button class="ghost-btn" data-clear="${match.id}" type="button">مسح النتيجة</button>
        <button class="danger-btn" data-match-delete="${match.id}" data-match-name="${escapeHtml(`${match.team_a} ضد ${match.team_b}`)}" type="button">حذف المباراة</button>
      </div>
    </article>
  `;
}

function voterModal(matchId) {
  const match = state.matches.find(item => item.id === matchId);
  if (!match) return "";
  const voted = match.voted_users || [];
  const missing = match.missing_users || [];
  return `
    <div class="modal-backdrop" data-voter-modal-close>
      <section class="modal-card stack">
        <div class="section-title">
          <h2>حالة التصويت</h2>
          <button class="icon-close" type="button" data-voters-close>×</button>
        </div>
        <div class="vote-summary">اكتمل ${match.vote_count || 0} من ${match.eligible_count || 0}</div>
        <h3 class="modal-subtitle">انتهوا من التصويت</h3>
        <div class="voter-list">
          ${voted.length ? voted.map(voterRow).join("") : emptyView("لا يوجد مصوتون حتى الآن.")}
        </div>
        <h3 class="modal-subtitle">لم ينتهوا من التصويت</h3>
        <div class="voter-list">
          ${missing.length ? missing.map(voterRow).join("") : emptyView("لا يوجد لاعبون متبقون.")}
        </div>
      </section>
    </div>
  `;
}

function voterRow(user) {
  return `
    <div class="voter-row">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
      </div>
    </div>
  `;
}

function matchStatusView(match, selected, points, locked) {
  if (match.winner && points) {
    return `<span class="status-chip ${points.correct ? "done" : "wrong"}">${points.correct ? "توقع صحيح" : "توقع خاطئ"}: ${points.points} نقطة${points.is_joker ? " ×2" : ""}</span>`;
  }
  if (locked) return `<span class="status-chip pending">بانتظار اعتماد النتائج</span>`;
  if (selected) return `<span class="status-chip done">تم التصويت</span>`;
  return `<span class="status-chip">مفتوح للتصويت</span>`;
}

function countdownText(value) {
  const diff = Math.max(0, new Date(value).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days} يوم ${hours} ساعة`;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function bindLogin() {
  let selectedRole = "participant";
  let selectedMode = "login";
  const codeField = document.querySelector("#organizerCodeField");
  const nameField = document.querySelector("#nameField");
  const roleField = document.querySelector("#roleField");
  const passwordInput = document.querySelector("#password");
  const loginBtn = document.querySelector("#loginBtn");
  const authHint = document.querySelector("#authHint");

  function syncAuthMode() {
    const isCreate = selectedMode === "create";
    document.querySelector("#mode").value = selectedMode;
    nameField.classList.toggle("hidden", !isCreate);
    roleField.classList.toggle("hidden", !isCreate);
    codeField.classList.toggle("hidden", !isCreate || selectedRole !== "organizer");
    document.querySelector("#name").required = isCreate;
    passwordInput.autocomplete = isCreate ? "new-password" : "current-password";
    loginBtn.textContent = isCreate ? "إنشاء الحساب" : "دخول التطبيق";
    authHint.textContent = isCreate
      ? "أنشئ الحساب أول مرة بالاسم ورقم الهاتف وكلمة المرور."
      : "ادخل برقم الهاتف وكلمة المرور فقط.";
  }

  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    button.addEventListener("click", () => {
      selectedMode = button.dataset.authMode;
      document.querySelectorAll("[data-auth-mode]").forEach(item => item.classList.toggle("active", item === button));
      syncAuthMode();
    });
  });

  document.querySelectorAll(".role-option").forEach(button => {
    if (!button.dataset.role) return;
    button.addEventListener("click", () => {
      selectedRole = button.dataset.role;
      document.querySelector("#role").value = selectedRole;
      syncAuthMode();
      document.querySelectorAll("[data-role]").forEach(item => item.classList.toggle("active", item === button));
    });
  });
  syncAuthMode();

  document.querySelector("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const errorBox = document.querySelector("#loginError");
    errorBox.classList.add("hidden");
    loginBtn.disabled = true;
    loginBtn.textContent = selectedMode === "create" ? "جاري إنشاء الحساب..." : "جاري الدخول...";

    try {
      const payload = await api("login", {
        method: "POST",
        body: JSON.stringify({
          mode: selectedMode,
          name: document.querySelector("#name").value.trim(),
          phone: document.querySelector("#phone").value.trim(),
          password: passwordInput.value.trim(),
          role: selectedRole,
          organizerCode: document.querySelector("#organizerCode").value.trim()
        })
      });
      state.currentUser = payload.user;
      writeSession(payload.user);
      activeTab = payload.user.role === "organizer" ? "participants" : "matches";
      await loadData();
    } catch (error) {
      errorBox.textContent = error.message || "تعذر الدخول";
      errorBox.classList.remove("hidden");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = selectedMode === "create" ? "إنشاء الحساب" : "دخول التطبيق";
    }
  });
}

function bindInstallControls() {
  document.querySelector("#androidInstallBtn")?.addEventListener("click", async () => {
    const help = document.querySelector("#installHelp");
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => null);
      deferredInstallPrompt = null;
      return;
    }
    help.textContent = "إذا لم تظهر نافذة التثبيت، افتح القائمة في Chrome واختر Install app أو Add to Home screen.";
    help.classList.add("show");
  });

  document.querySelector("#iosInstallBtn")?.addEventListener("click", () => {
    const help = document.querySelector("#installHelp");
    help.textContent = "على الآيفون: افتح الرابط من Safari، اضغط زر المشاركة، ثم اختر Add to Home Screen.";
    help.classList.add("show");
  });
}

function bindApp() {
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    state.currentUser = null;
    writeSession(null);
    render();
  });

  document.querySelector("#retryBtn")?.addEventListener("click", loadData);

  document.querySelector("#profileOpenBtn")?.addEventListener("click", () => {
    state.profileOpen = true;
    render();
  });

  document.querySelector("[data-profile-close]")?.addEventListener("click", () => {
    state.profileOpen = false;
    render();
  });

  document.querySelector("[data-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.profileOpen = false;
      state.voterModalMatch = null;
      render();
    }
  });

  document.querySelectorAll("[data-voters]").forEach(button => {
    button.addEventListener("click", () => {
      state.voterModalMatch = button.dataset.voters;
      render();
    });
  });

  document.querySelector("[data-voters-close]")?.addEventListener("click", () => {
    state.voterModalMatch = null;
    render();
  });

  document.querySelector("[data-voter-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.voterModalMatch = null;
      render();
    }
  });

  bindProfileForm();
  const matchFlagState = bindMatchFlagFields();
  bindInlineFlagInputs();
  syncCountdownTimer();

  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      render();
    });
  });

  document.querySelectorAll("[data-round]").forEach(button => {
    button.addEventListener("click", () => {
      activeRound = button.dataset.round;
      state.addMatchOpen = false;
      render();
    });
  });

  document.querySelector("#addMatchToggle")?.addEventListener("click", () => {
    state.addMatchOpen = !state.addMatchOpen;
    render();
  });

  document.querySelectorAll("[data-participant-id]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        await api("participant-status", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            participantId: button.dataset.participantId,
            status: button.dataset.participantStatus
          })
        });
        state.notice = button.dataset.participantStatus === "approved" ? "تم قبول المشارك." : "تم رفض المشارك.";
        await loadData();
      } catch (error) {
        state.error = error.message || "تعذر تحديث طلب المشارك";
        render();
      }
    });
  });

  bindSwipeRows();

  document.querySelectorAll("[data-participant-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      const participantName = button.dataset.participantName || "هذا اللاعب";
      const confirmed = confirm(`سيتم حذف ${participantName} من البطولة، وحذف توقعاته وسحب نقاطه من كل المشاركين ثم إعادة توزيع النقاط كأنه غير موجود. هل تريد المتابعة؟`);
      if (!confirmed) {
        closeSwipeRows();
        return;
      }
      try {
        await api("participant-delete", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            participantId: button.dataset.participantDelete
          })
        });
        state.notice = "تم حذف اللاعب من البطولة.";
        closeSwipeRows();
        await loadData();
      } catch (error) {
        closeSwipeRows();
        state.error = error.message || "تعذر حذف اللاعب";
        render();
      }
    });
  });

  document.querySelectorAll("[data-pick]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        await api("prediction", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            matchId: button.dataset.pick,
            winner: button.dataset.team,
            isJoker: button.dataset.jokerState === "true"
          })
        });
        state.notice = "تم حفظ توقعك في السيرفر.";
        await loadData();
      } catch (error) {
        state.error = error.message || "تعذر حفظ التوقع";
        render();
      }
    });
  });

  document.querySelectorAll("[data-joker]").forEach(button => {
    button.addEventListener("click", async () => {
      const matchId = button.dataset.joker;
      const prediction = state.predictions[matchId];
      const winner = prediction?.winner || prediction;
      if (!winner) {
        state.notice = "اختر الفائز أولاً ثم فعّل الجوكر.";
        render();
        return;
      }
      try {
        await api("prediction", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            matchId,
            winner,
            isJoker: !prediction?.is_joker
          })
        });
        state.notice = prediction?.is_joker ? "تم إلغاء الجوكر." : "تم تفعيل الجوكر.";
        await loadData();
      } catch (error) {
        state.error = error.message || "تعذر تحديث الجوكر";
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

  document.querySelectorAll("[data-result-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const match = state.matches.find(item => item.id === form.dataset.resultForm);
      const scoreA = Number(form.elements.scoreA.value);
      const scoreB = Number(form.elements.scoreB.value);
      if (!match || !Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
        state.error = "أدخل أهداف الفريقين بشكل صحيح";
        render();
        return;
      }
      if (scoreA === scoreB) {
        state.error = "لا يمكن اعتماد تعادل في أدوار خروج المغلوب. عدل الأهداف حسب النتيجة النهائية.";
        render();
        return;
      }
      await saveResult(match.id, scoreA > scoreB ? match.team_a : match.team_b, scoreA, scoreB);
    });
  });

  document.querySelectorAll("[data-match-edit]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      await saveMatchEdit(form);
    });
  });

  document.querySelectorAll("[data-match-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      const matchName = button.dataset.matchName || "هذه المباراة";
      const confirmed = confirm(`سيتم حذف ${matchName} مع نتيجتها وكل توقعاتها، وسيعاد ترتيب النقاط كأن المباراة غير موجودة. هل تريد المتابعة؟`);
      if (!confirmed) return;
      try {
        await api("match-delete", {
          method: "POST",
          body: JSON.stringify({ userId: state.currentUser.id, matchId: button.dataset.matchDelete })
        });
        state.notice = "تم حذف المباراة وتحديث الترتيب.";
        await loadData();
      } catch (error) {
        state.error = error.message || "تعذر حذف المباراة";
        render();
      }
    });
  });

  document.querySelector("#matchForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    try {
      const match = {
        userId: state.currentUser.id,
        roundId: activeRound,
        teamA: document.querySelector("#teamA").value.trim(),
        teamB: document.querySelector("#teamB").value.trim(),
        teamAFlag: matchFlagState.teamAFlag,
        teamBFlag: matchFlagState.teamBFlag,
        startsAt: document.querySelector("#startsAt").value,
        voteEndsAt: document.querySelector("#voteEndsAt").value
      };
      await api("match", { method: "POST", body: JSON.stringify(match) });
      activeRound = match.roundId;
      state.addMatchOpen = false;
      state.notice = "تمت إضافة المباراة في السيرفر.";
      await loadData();
    } catch (error) {
      state.error = error.message || "تعذر إضافة المباراة";
      render();
    }
  });
}

function bindProfileForm() {
  const form = document.querySelector("#profileForm");
  if (!form) return;
  let avatarUrl = state.currentUser.avatar_url || "";
  const fileInput = document.querySelector("#profileAvatar");
  const preview = document.querySelector("#profileAvatarPreview");
  const errorBox = document.querySelector("#profileError");

  form.addEventListener("click", event => {
    event.stopPropagation();
  });

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      errorBox?.classList.add("hidden");
      avatarUrl = await imageFileToDataUrl(file, 320);
      if (preview) preview.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="" />`;
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || "تعذر تجهيز الصورة";
        errorBox.classList.remove("hidden");
      }
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopPropagation();
    const saveButton = form.querySelector("button[type='submit']");
    if (errorBox) errorBox.classList.add("hidden");
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "جاري الحفظ...";
    }
    try {
      const payload = await api("profile", {
        method: "POST",
        body: JSON.stringify({
          userId: state.currentUser.id,
          name: document.querySelector("#profileName").value.trim(),
          avatarUrl
        })
      });
      state.currentUser = { ...state.currentUser, ...payload.user };
      writeSession(state.currentUser);
      state.profileOpen = false;
      state.notice = "تم تحديث الملف الشخصي.";
      await loadData();
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || "تعذر حفظ الملف الشخصي";
        errorBox.classList.remove("hidden");
      }
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = "حفظ التعديل";
      }
    }
  });
}

function bindMatchFlagFields() {
  const form = document.querySelector("#matchForm");
  const stateFlags = { teamAFlag: "", teamBFlag: "" };
  if (!form || document.querySelector("#teamAFlag")) return stateFlags;

  const teamBField = document.querySelector("#teamB")?.closest(".field");
  teamBField?.insertAdjacentHTML("afterend", `
    <label class="field image-field">
      <span>علم الفريق الأول</span>
      <div class="image-input-row">
        <span class="flag-tile preview-tile" id="teamAFlagPreview">A</span>
        <input id="teamAFlag" type="file" accept="image/png,image/jpeg,image/webp" />
      </div>
    </label>
    <label class="field image-field">
      <span>علم الفريق الثاني</span>
      <div class="image-input-row">
        <span class="flag-tile preview-tile" id="teamBFlagPreview">B</span>
        <input id="teamBFlag" type="file" accept="image/png,image/jpeg,image/webp" />
      </div>
    </label>
  `);

  bindFlagInput("#teamAFlag", "#teamAFlagPreview", value => { stateFlags.teamAFlag = value; });
  bindFlagInput("#teamBFlag", "#teamBFlagPreview", value => { stateFlags.teamBFlag = value; });
  return stateFlags;
}

function bindFlagInput(inputSelector, previewSelector, onChange) {
  const input = document.querySelector(inputSelector);
  const preview = document.querySelector(previewSelector);
  input?.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const value = await imageFileToDataUrl(file, 180);
      onChange(value);
      if (preview) {
        preview.innerHTML = `<img src="${escapeHtml(value)}" alt="" />`;
      }
    } catch (error) {
      state.error = error.message || "تعذر تجهيز العلم";
      render();
    }
  });
}

function bindInlineFlagInputs() {
  document.querySelectorAll("[data-edit-flag]").forEach(input => {
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const value = await imageFileToDataUrl(file, 180);
        const key = input.dataset.editFlag;
        const preview = document.querySelector(`[data-flag-preview="${key}"]`);
        const hidden = input.closest(".image-input-row")?.querySelector("input[type='hidden']");
        if (hidden) hidden.value = value;
        if (preview) preview.innerHTML = `<img src="${escapeHtml(value)}" alt="" />`;
      } catch (error) {
        state.error = error.message || "تعذر تجهيز العلم";
        render();
      }
    });
  });
}

async function saveMatchEdit(form) {
  try {
    await api("match", {
      method: "POST",
      body: JSON.stringify({
        userId: state.currentUser.id,
        matchId: form.dataset.matchEdit,
        roundId: activeRound,
        teamA: form.elements.teamA.value.trim(),
        teamB: form.elements.teamB.value.trim(),
        teamAFlag: form.elements.teamAFlag.value,
        teamBFlag: form.elements.teamBFlag.value,
        startsAt: form.elements.startsAt.value,
        voteEndsAt: form.elements.voteEndsAt.value
      })
    });
    state.notice = "تم تعديل بطاقة المباراة.";
    await loadData();
  } catch (error) {
    state.error = error.message || "تعذر تعديل المباراة";
    render();
  }
}

function syncCountdownTimer() {
  const hasOpenMatch = state.currentUser && state.matches.some(match => new Date(match.vote_ends_at) > new Date() && !match.winner);
  if (hasOpenMatch && !countdownTimer) {
    countdownTimer = setInterval(() => {
      if (!state.currentUser) return;
      render();
    }, 1000);
  }
  if (!hasOpenMatch && countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function bindSwipeRows() {
  document.querySelectorAll("[data-swipe-row]").forEach(row => {
    const content = row.querySelector("[data-swipe-content]");
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    row.addEventListener("touchstart", event => {
      startX = event.touches[0].clientX;
      currentX = startX;
      dragging = true;
      content.style.transition = "none";
    }, { passive: true });

    row.addEventListener("touchmove", event => {
      if (!dragging) return;
      currentX = event.touches[0].clientX;
      const delta = Math.min(0, Math.max(currentX - startX, -92));
      content.style.transform = `translateX(${delta}px)`;
    }, { passive: true });

    row.addEventListener("touchend", () => {
      dragging = false;
      content.style.transition = "";
      const shouldOpen = currentX - startX < -42;
      closeSwipeRows(row);
      row.classList.toggle("open", shouldOpen);
      content.style.transform = "";
    });
  });
}

function closeSwipeRows(exceptRow) {
  document.querySelectorAll("[data-swipe-row]").forEach(row => {
    if (row !== exceptRow) row.classList.remove("open");
  });
}

async function saveResult(matchId, winner, scoreA = null, scoreB = null) {
  try {
    await api("result", {
      method: "POST",
      body: JSON.stringify({ userId: state.currentUser.id, matchId, winner, scoreA, scoreB })
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

function statusLabel(status) {
  if (status === "approved") return "مقبول";
  if (status === "rejected") return "مرفوض";
  return "بانتظار الموافقة";
}

function roundName(id) {
  return rounds.find(round => round.id === id)?.name || id;
}

function sortMatches(matches) {
  return [...matches].sort((a, b) => {
    const resultOrder = Number(!!a.winner) - Number(!!b.winner);
    if (resultOrder) return resultOrder;
    return new Date(a.starts_at || 0) - new Date(b.starts_at || 0);
  });
}

function emptyView(text) {
  return `<div class="empty">${text}</div>`;
}

function avatarTile(user, className = "avatar-small", id = "") {
  const label = initials(user?.name);
  const idAttr = id ? ` id="${id}"` : "";
  if (user?.avatar_url) {
    return `<span${idAttr} class="avatar-tile ${className}"><img src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(user.name || "player")}" /></span>`;
  }
  return `<span${idAttr} class="avatar-tile ${className}">${escapeHtml(label)}</span>`;
}

function teamBadge(name, flagUrl) {
  const flag = flagUrl
    ? `<img src="${escapeHtml(flagUrl)}" alt="${escapeHtml(name)}" />`
    : `<span>${escapeHtml(initials(name))}</span>`;
  return `
    <div class="team-badge">
      <span class="flag-tile">${flag}</span>
      <strong>${escapeHtml(name)}</strong>
    </div>
  `;
}

function initials(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
  return (words[0]?.[0] || "؟") + (words[1]?.[0] || "");
}

function imageFileToDataUrl(file, size = 320) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("اختر ملف صورة فقط"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("تعذر فتح الصورة"));
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        const edge = Math.min(image.width, image.height);
        const sx = (image.width - edge) / 2;
        const sy = (image.height - edge) / 2;
        context.drawImage(image, sx, sy, edge, edge, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function formatDate(value) {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat("ar-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function datetimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
}

loadData();
