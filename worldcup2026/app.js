const SESSION_KEY = "wc2026-live-session-v1";
const RANK_SNAPSHOT_KEY = "wc2026-rank-snapshot-v1";
const APP_TIME_ZONE = "Asia/Dubai";
const APP_TIME_OFFSET_MINUTES = 4 * 60;
let deferredInstallPrompt = null;

const rounds = [
  { id: "r32", name: "دور الـ 32" },
  { id: "r16", name: "دور الـ 16" },
  { id: "r8", name: "دور الـ 8" },
  { id: "qf", name: "ربع النهائي" },
  { id: "sf", name: "نصف النهائي" },
  { id: "final", name: "النهائي" }
];

const roundMatchLimits = {
  r32: 16,
  r16: 8,
  r8: 4,
  qf: 4,
  sf: 2,
  final: 1
};

const laws = {
  r32: "كل مباراة قيمتها 200 نقطة: 150 نقطة لترشيح الفائز و50 نقطة للترشيح الأقل. التوقع الصحيح يسترجع 150 نقطة ويحصل على نصيبه من نقاط توقعات الخاسرين، والتوقع الخطأ يسترجع 50 نقطة فقط.",
  r16: "كل مباراة قيمتها 300 نقطة: 250 نقطة لترشيح الفائز و50 نقطة للترشيح الأقل. نقاط التوقعات الخاطئة تتجمع وتتوزع بالتساوي على أصحاب التوقع الصحيح.",
  r8: "رصيد كل مشارك قبل الدور ينقسم على 4 مباريات. في كل مباراة 90% من حصة المباراة للفائز و10% للترشيح الأقل، ونقاط الخسارة تتوزع على أصحاب التوقع الصحيح.",
  qf: "ربع النهائي يعمل بنفس نظام دور الـ 8: الرصيد ينقسم على 4 مباريات، 90% للفائز و10% للترشيح الأقل، مع توزيع خسائر التوقعات الخاطئة على الفائزين.",
  sf: "رصيد كل مشارك قبل نصف النهائي ينقسم على مباراتين. في كل مباراة 90% للفائز و10% للترشيح الأقل، وخسائر التوقعات الخاطئة تتوزع على أصحاب التوقع الصحيح.",
  final: "في النهائي يذهب كامل رصيد المشارك لترشيح الفائز. بعد إدخال النتيجة، أرصدة أصحاب التوقع الخاطئ تتوزع بالتساوي على أصحاب التوقع الصحيح ويحدد البطل."
};

const displayLaws = {
  r32: "كل مباراة قيمتها 200 نقطة. عند اختيار الفريق المتوقع فوزه يتم وضع 150 نقطة على الفائز و50 نقطة على الفريق الآخر. إذا كان توقعك صحيحاً تحصل على 150 نقطة، وتدخل الـ 50 نقطة التي خسرتها ضمن نقاط الخاسرين ثم توزع على أصحاب التوقع الصحيح. إذا كان توقعك خطأ تحصل على 50 نقطة فقط، وتذهب الـ 150 نقطة إلى مجموع نقاط الخاسرين لتوزع على الفائزين في التوقع.",
  r16: "كل مباراة قيمتها 300 نقطة. عند اختيار الفريق المتوقع فوزه يتم وضع 250 نقطة على الفائز و50 نقطة على الفريق الآخر. إذا كان توقعك صحيحاً تحصل على 250 نقطة، وتدخل الـ 50 نقطة ضمن مجموع نقاط الخاسرين ثم توزع على أصحاب التوقع الصحيح. إذا كان توقعك خطأ تحصل على 50 نقطة فقط، وتذهب الـ 250 نقطة لتوزع على أصحاب التوقع الصحيح. الجوكر متاح في هذا الدور لمباراة واحدة فقط.",
  r8: "رصيد كل مشارك قبل بداية الدور يقسم على 4 مباريات. في كل مباراة يذهب 90% من حصة المباراة للفريق الذي تتوقع فوزه، و10% للفريق الآخر. بعد اعتماد النتيجة، نقاط التوقعات الخاطئة تجمع وتوزع بالتساوي على أصحاب التوقع الصحيح في نفس المباراة.",
  qf: "ربع النهائي يعمل بنفس نظام دور الـ 8: رصيد اللاعب قبل الدور يقسم على 4 مباريات، وداخل كل مباراة 90% للفريق المتوقع فوزه و10% للفريق الآخر. نقاط الخاسرين في التوقع توزع على أصحاب التوقع الصحيح بعد اعتماد النتيجة.",
  sf: "رصيد كل مشارك قبل نصف النهائي يقسم على مباراتين. في كل مباراة يذهب 90% من حصة المباراة للفريق المتوقع فوزه و10% للفريق الآخر. نقاط التوقعات الخاطئة توزع على أصحاب التوقع الصحيح. الجوكر متاح في هذا الدور لمباراة واحدة فقط.",
  final: "في المباراة النهائية يضع كل مشارك كامل رصيده على الفريق الذي يتوقع فوزه. بعد اعتماد النتيجة، أرصدة أصحاب التوقع الخاطئ توزع بالتساوي على أصحاب التوقع الصحيح، وبناءً على الرصيد النهائي يتحدد بطل البطولة."
};

const jokerLaw = "الجوكر متاح في دور الـ 16 ونصف النهائي فقط. لكل مشارك جوكر واحد في كل دور من هذين الدورين، ويختار مباراة واحدة لتفعيله عليها قبل إغلاق التصويت. إذا كان توقع الجوكر صحيحاً، يتم مضاعفة نقاط هذه المباراة ×2. إذا كان التوقع خطأ، تبقى خسارة النقاط حسب قانون الدور ولا يعطي الجوكر نقاطاً إضافية.";

const state = {
  currentUser: readSession(),
  matches: [],
  standings: [],
  predictions: {},
  matchPoints: {},
  allPredictions: [],
  allMatchPoints: {},
  allMatchStakes: {},
  rankMovement: {},
  participants: [],
  loading: true,
  error: "",
  notice: "",
  profileOpen: false,
  voterModalMatch: null,
  voteResultsModalMatch: null,
  editModalMatch: null,
  resultModalMatch: null,
  detailParticipantId: null,
  addMatchOpen: false
};

let activeTab = state.currentUser?.role === "organizer" ? "manage" : "matches";
let activeRound = "r32";
let countdownTimer = null;
let predictionSaveSeq = 0;

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

async function loadData(options = {}) {
  const silent = !!options.silent;
  if (!state.currentUser) {
    state.loading = false;
    render();
    return;
  }

  if (!silent) state.loading = true;
  state.error = "";
  if (!silent) render();

  try {
    const query = state.currentUser.id ? `state&userId=${encodeURIComponent(state.currentUser.id)}` : "state";
    const payload = await api(query);
    if (payload.user) {
      state.currentUser = { ...state.currentUser, ...payload.user };
      writeSession(state.currentUser);
    }
    state.matches = payload.matches || [];
    state.standings = payload.standings || [];
    state.rankMovement = rankMovementFor(state.standings);
    state.predictions = payload.predictions || {};
    state.matchPoints = payload.matchPoints || {};
    state.allPredictions = payload.allPredictions || [];
    state.allMatchPoints = payload.allMatchPoints || {};
    state.allMatchStakes = payload.allMatchStakes || {};
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
        <button class="forgot-link" id="forgotPasswordToggle" type="button">نسيت كلمة المرور؟</button>
      </form>

      <form class="panel password-reset-panel hidden" id="passwordResetForm">
        <h2>إعادة ضبط كلمة المرور</h2>
        <p class="small">ادخل رقم الهاتف المسجل، وسيظهر الطلب عند المنظم لتعيين كلمة مرور جديدة.</p>
        <div id="passwordResetMessage" class="notice hidden"></div>
        <label class="field">
          <span>رقم الهاتف المتحرك</span>
          <input id="resetPhone" required inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" />
        </label>
        <button class="primary-btn" id="passwordResetBtn" type="submit">إرسال طلب إعادة الضبط</button>
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
    ${state.voteResultsModalMatch ? voteResultsModal(state.voteResultsModalMatch) : ""}
    ${state.editModalMatch ? matchEditModal(state.editModalMatch) : ""}
    ${state.resultModalMatch ? resultModal(state.resultModalMatch) : ""}
    ${state.detailParticipantId ? participantDetailModal(state.detailParticipantId) : ""}
    ${state.addMatchOpen ? matchFormModal() : ""}
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
            <input id="profileAvatar" type="file" accept="image/*" />
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
      <p class="small">${rejected ? "يمكنك تقديم طلب انضمام جديد، وسيظهر الطلب مرة أخرى عند المنظم." : "بعد قبولك ستظهر لك المباريات والتوقعات تلقائياً عند إعادة المحاولة."}</p>
      <button class="primary-btn" id="${rejected ? "reapplyBtn" : "retryBtn"}" type="button">${rejected ? "تقديم طلب انضمام" : "تحديث الحالة"}</button>
    </section>
  `;
}

function participantsView() {
  const pending = state.participants.filter(user => user.participant_status === "pending");
  const approved = state.participants.filter(user => user.participant_status === "approved");
  const rejected = state.participants.filter(user => user.participant_status === "rejected");
  const passwordResetRequests = state.participants.filter(user => user.password_reset_requested_at);
  return `
    <div class="section-title">
      <h2>طلبات المشاركين</h2>
      <span class="small">${pending.length} بانتظار الموافقة</span>
    </div>
    <div class="participant-list">
      ${pending.length ? pending.map(requestRow).join("") : emptyView("لا توجد طلبات جديدة.")}
    </div>
    <div class="section-title" style="margin-top:18px">
      <h2>إعادة كلمة المرور</h2>
      <span class="small">${passwordResetRequests.length} طلب</span>
    </div>
    <div class="participant-list">
      ${passwordResetRequests.length ? passwordResetRequests.map(passwordResetRow).join("") : emptyView("لا توجد طلبات إعادة كلمة مرور.")}
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

function passwordResetRow(user) {
  return `
    <form class="participant-row password-reset-row" data-password-reset="${user.id}">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
        <span>طلب إعادة كلمة المرور</span>
      </div>
      <span class="status-chip pending">بانتظار التعيين</span>
      <div class="participant-actions password-reset-actions">
        <input name="password" required minlength="4" type="text" autocomplete="new-password" placeholder="كلمة المرور الجديدة" />
        <button class="mini-btn approve" type="submit">حفظ كلمة المرور</button>
      </div>
    </form>
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
  const roundLimit = roundMatchLimits[activeRound] || Infinity;
  const roundIsFull = matches.length >= roundLimit;
  return `
    <div class="section-title">
      <h2>المباريات</h2>
      <span class="small">تنعكس على كل المشاركين</span>
    </div>
    ${roundTabs()}
    <button class="add-match-toggle" id="addMatchToggle" type="button" ${roundIsFull ? "disabled" : ""}>
      ${roundIsFull ? `اكتمل عدد مباريات ${roundName(activeRound)} (${roundLimit}/${roundLimit})` : `إضافة مباراة في ${roundName(activeRound)} (${matches.length}/${roundLimit})`}
    </button>
    <div class="match-list">
      ${matches.length ? matches.map(managerMatchCardV2).join("") : emptyView("لا توجد مباريات في هذا الدور حالياً.")}
    </div>
  `;
}

function matchFormModal() {
  return `
    <div class="modal-backdrop">
      <section class="modal-card stack add-match-modal">
        <div class="section-title">
          <h2>إضافة مباراة</h2>
          <button class="icon-close" type="button" data-add-match-close>×</button>
        </div>
        ${matchFormView()}
      </section>
    </div>
  `;
}

function matchFormView() {
  return `
    <form class="stack match-form-card" id="matchForm">
      <div class="section-title">
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
  if (state.currentUser.role === "organizer") return organizerStandingsMatrixView();
  return participantStandingsListView();
}

function normalizePrediction(prediction) {
  if (!prediction) return null;
  if (typeof prediction === "string") return { winner: prediction, is_joker: false };
  return { ...prediction, is_joker: !!prediction.is_joker };
}

function setOptimisticPrediction(matchId, winner, isJoker) {
  const previous = normalizePrediction(state.predictions[matchId]);
  state.predictions = {
    ...state.predictions,
    [matchId]: {
      ...(previous || {}),
      match_id: matchId,
      winner,
      is_joker: !!isJoker
    }
  };
  return previous;
}

function restorePrediction(matchId, previous) {
  const next = { ...state.predictions };
  if (previous) {
    next[matchId] = previous;
  } else {
    delete next[matchId];
  }
  state.predictions = next;
}

function participantStandingsListView() {
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

function organizerStandingsMatrixView() {
  const settledMatches = sortMatches(state.matches.filter(match => match.winner));
  return `
    ${state.standings.length ? `
      <div class="standings-board" role="region" aria-label="جدول ترتيب المشاركين">
        <div class="standings-total-col">
          <div class="matrix-cell matrix-head total-head">إجمالي النقاط</div>
          ${state.standings.map((row, index) => `<div class="matrix-cell total-cell ${index < 3 ? "podium-cell" : ""}">${row.points}</div>`).join("")}
        </div>
        <div class="standings-middle-scroll">
          <div class="standings-scroll-table">
            <div class="standings-middle-row matrix-head-row">
              ${settledMatches.map(match => `
                <div class="match-score-group">
                  <div class="matrix-cell match-team-head">${escapeHtml(match.team_a)}</div>
                  <div class="matrix-cell match-team-head">${escapeHtml(match.team_b)}</div>
                  <div class="matrix-cell match-round-head">نقاط الجولة</div>
                </div>
              `).join("")}
              <div class="match-score-group summary-group">
                <div class="matrix-cell summary-head">إجمالي الصحيح</div>
                <div class="matrix-cell summary-head">إجمالي الخطأ</div>
                <div class="matrix-cell summary-head">نسبة الصحيح</div>
              </div>
            </div>
            ${state.standings.map(row => `
              <div class="standings-middle-row">
                ${settledMatches.map(match => `
                  <div class="match-score-group">
                    ${matchVoteCells(row.id, match)}
                    <div class="matrix-cell round-points ${matchCellClass(row.id, match.id)}">${matchCellPoints(row.id, match.id)}</div>
                  </div>
                `).join("")}
                <div class="match-score-group summary-group">
                  <div class="matrix-cell summary-cell correct-total">${row.correct_predictions}</div>
                  <div class="matrix-cell summary-cell wrong-total">${row.wrong_predictions}</div>
                  <div class="matrix-cell summary-cell percent-total">${correctPercent(row)}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="standings-player-col">
          <div class="matrix-player-row matrix-head-row">
            <div class="matrix-cell player-head">المتسابق</div>
            <div class="matrix-cell rank-head">الترتيب</div>
          </div>
          ${state.standings.map((row, index) => `
            <div class="matrix-player-row ${index < 3 ? "podium-row" : ""}">
              <div class="matrix-cell player-cell">
                <button class="leader-name-button" data-participant-detail="${row.id}" type="button">
                  ${avatarTile(row, "avatar-mini")}
                  <strong>${escapeHtml(row.name)}</strong>
                </button>
              </div>
              <div class="matrix-cell rank-cell"><span class="rank-number">${index + 1}</span>${rankTrendView(row.id)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : emptyView("لا يوجد مشاركون مقبولون حتى الآن.")}
  `;
}

function matchVoteCells(userId, match) {
  const prediction = state.allPredictions.find(item => item.user_id === userId && item.match_id === match.id);
  const stakes = state.allMatchStakes[userId]?.[match.id] || {};
  return `
    <div class="matrix-cell team-vote ${prediction?.winner === match.team_a ? "picked" : ""}">${stakes.team_a ?? 0}</div>
    <div class="matrix-cell team-vote ${prediction?.winner === match.team_b ? "picked" : ""}">${stakes.team_b ?? 0}</div>
  `;
}

function matchCellPoints(userId, matchId) {
  return state.allMatchPoints[userId]?.[matchId]?.points ?? 0;
}

function matchCellClass(userId, matchId) {
  const points = state.allMatchPoints[userId]?.[matchId];
  if (!points) return "missed";
  return points.correct ? "correct" : "wrong";
}

function correctPercent(row) {
  const total = (row.correct_predictions || 0) + (row.wrong_predictions || 0);
  if (!total) return "0%";
  return `${Math.round((row.correct_predictions / total) * 100)}%`;
}

function rankTrendView(userId) {
  const movement = state.rankMovement[userId];
  if (!movement) return "";
  return `<span class="rank-trend ${movement > 0 ? "up" : "down"}">${movement > 0 ? "▲" : "▼"}</span>`;
}

function participantDetailModal(participantId) {
  const participant = state.standings.find(row => row.id === participantId)
    || state.participants.find(row => row.id === participantId);
  if (!participant) return "";
  const participantPredictions = new Map(
    state.allPredictions
      .filter(item => item.user_id === participantId)
      .map(item => [item.match_id, item])
  );
  const participantPoints = state.allMatchPoints[participantId] || {};
  const rows = sortMatches(state.matches).map(match => {
    const prediction = participantPredictions.get(match.id);
    const points = participantPoints[match.id];
    const status = !match.winner
      ? "بانتظار النتيجة"
      : points
        ? `${points.correct ? "صحيح" : "خطأ"} - ${points.points} نقطة${points.is_joker ? " ×2" : ""}`
        : "لم يدخل في الحسبة";
    return `
      <article class="detail-match-row">
        <div>
          <strong>${escapeHtml(match.team_a)} ضد ${escapeHtml(match.team_b)}</strong>
          <span>${roundName(match.round_id)} | ${formatAdminMatchDate(match.starts_at)}</span>
        </div>
        <div class="detail-pick">
          <span>${prediction ? `توقع: ${escapeHtml(prediction.winner)}${prediction.is_joker ? " | جوكر" : ""}` : "لم يصوت"}</span>
          <em class="${points?.correct ? "ok" : match.winner ? "bad" : ""}">${status}</em>
        </div>
      </article>
    `;
  }).join("");

  return `
    <div class="modal-backdrop" data-detail-modal-close>
      <section class="modal-card stack participant-detail-modal">
        <div class="section-title">
          <h2>تفاصيل المشارك</h2>
          <button class="icon-close" type="button" data-detail-close>×</button>
        </div>
        <div class="participant-detail-head">
          ${avatarTile(participant, "avatar-small")}
          <div>
            <strong>${escapeHtml(participant.name)}</strong>
            <span class="small">النقاط: ${participant.points || 0} | صحيح: ${participant.correct_predictions || 0} | خطأ: ${participant.wrong_predictions || 0}</span>
          </div>
        </div>
        <div class="detail-match-list">
          ${rows || emptyView("لا توجد مباريات لعرضها.")}
        </div>
      </section>
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
      <article class="law-card joker-law-card">
        <h3>الجوكر</h3>
        <p>${jokerLaw}</p>
      </article>
      ${rounds.map(round => `
        <article class="law-card">
          <h3>${round.name}</h3>
          <p>${displayLaws[round.id] || laws[round.id]}</p>
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
  const locked = !!match.winner || new Date(match.vote_ends_at) <= new Date();
  const selected = prediction?.winner || prediction || "";
  const isJoker = !!prediction?.is_joker;
  const points = state.matchPoints[match.id];
  const canUseJoker = ["r16", "sf"].includes(match.round_id);
  const status = participantMatchStatus(match, selected, points, locked);
  return `
    <article class="match-card participant-match-card ${locked ? "locked-card" : ""}">
      <div class="participant-match-top">
        <span>${formatAdminMatchDate(match.starts_at)}</span>
        <span class="participant-countdown ${locked ? "expired" : ""}" ${!match.winner && !locked ? countdownAttrs(match.vote_ends_at, "باقي للتصويت: ") : ""}>${match.winner ? "مغلق" : locked ? "انتهى التصويت" : `باقي للتصويت: ${countdownText(match.vote_ends_at)}`}</span>
      </div>
      <div class="participant-choice-grid">
        ${participantChoiceButton(match, match.team_a, match.team_a_flag, selected, locked, isJoker)}
        ${participantChoiceButton(match, match.team_b, match.team_b_flag, selected, locked, isJoker)}
      </div>
      ${canUseJoker ? `
        <button class="joker-toggle participant-joker ${isJoker ? "active" : ""}" ${locked ? "disabled" : ""} data-joker="${match.id}" type="button">
          ${isJoker ? "الجوكر مفعل ×2" : "تفعيل الجوكر ×2"}
        </button>
      ` : ""}
      <div class="participant-match-footer">
        ${status}
        <span class="saved-pick">${selected ? `تم حفظ توقعك: ${escapeHtml(selected)}` : "اختر الفائز لحفظ توقعك"}</span>
      </div>
    </article>
  `;
}

function participantChoiceButton(match, team, flagUrl, selected, locked, isJoker) {
  const active = selected === team;
  const flag = flagUrl ? `<img src="${escapeHtml(flagUrl)}" alt="${escapeHtml(team)}" />` : "";
  return `
    <button class="participant-choice ${active ? "active" : ""}" ${locked ? "disabled" : ""} data-pick="${match.id}" data-team="${escapeHtml(team)}" data-joker-state="${isJoker ? "true" : "false"}" type="button">
      <span class="participant-team-name">${escapeHtml(team)}</span>
      <span class="participant-pick-circle">${flag}</span>
    </button>
  `;
}

function participantMatchStatus(match, selected, points, locked) {
  if (match.winner && points) {
    return `<span class="participant-status ${points.correct ? "correct" : "wrong"}"><span></span>${points.correct ? "توقع صحيح" : "توقع خاطئ"}: ${points.points} نقطة${points.is_joker ? " ×2" : ""}</span>`;
  }
  if (locked) return `<span class="participant-status pending"><span></span>بانتظار اعتماد النتائج</span>`;
  if (selected) return `<span class="participant-status saved"><span></span>تم حفظ التوقع</span>`;
  return `<span class="participant-status open"><span></span>لم يتم التصويت</span>`;
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
  const scoreA = Number.isInteger(match.score_a) ? match.score_a : "";
  const scoreB = Number.isInteger(match.score_b) ? match.score_b : "";
  return `
    <article class="admin-match-card">
      <div class="admin-match-top">
        <button class="text-link" data-match-edit-open="${match.id}" type="button">تعديل</button>
        <span>${formatAdminMatchDate(match.starts_at)}</span>
      </div>
      <div class="admin-match-body">
        ${adminTeamView(match.team_a, match.team_a_flag)}
        <div class="admin-match-center ${match.winner ? "has-result" : ""}" ${!match.winner ? countdownAttrs(match.vote_ends_at) : ""}>
          ${match.winner ? `${scoreA} : ${scoreB}` : countdownText(match.vote_ends_at)}
        </div>
        ${adminTeamView(match.team_b, match.team_b_flag)}
      </div>
      <div class="admin-match-bottom">
        <button class="text-link result-link" data-result-open="${match.id}" type="button">${match.winner ? "تعديل نتيجة نهاية المباراة" : "إضافة نتيجة نهاية المباراة"}</button>
        <div class="admin-match-actions">
          <button class="vote-results-link" data-vote-results="${match.id}" type="button">نتائج التصويت</button>
        </div>
        <button class="vote-count-link" data-voters="${match.id}" type="button">${match.vote_count || 0}/${match.eligible_count || 0}</button>
      </div>
    </article>
  `;
}

function adminTeamView(name, flagUrl) {
  const flag = flagUrl ? `<img src="${escapeHtml(flagUrl)}" alt="${escapeHtml(name)}" />` : "";
  return `
    <div class="admin-team">
      <span class="admin-flag">${flag}</span>
      <strong>${escapeHtml(name)}</strong>
    </div>
  `;
}

function matchEditModal(matchId) {
  const match = state.matches.find(item => item.id === matchId);
  if (!match) return "";
  return `
    <div class="modal-backdrop" data-edit-modal-close>
      <section class="modal-card stack">
        <div class="section-title">
          <h2>تعديل بطاقة المباراة</h2>
          <button class="icon-close" type="button" data-edit-close>×</button>
        </div>
        <div id="editError" class="notice danger-notice hidden"></div>
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
                <input name="teamAFlagFile" data-edit-flag="teamA-${match.id}" type="file" accept="image/*" />
                <input name="teamAFlag" type="hidden" value="${escapeHtml(match.team_a_flag || "")}" />
              </div>
            </label>
            <label class="field image-field">
              <span>علم الفريق الثاني</span>
              <div class="image-input-row">
                <span class="flag-tile preview-tile" data-flag-preview="teamB-${match.id}">${match.team_b_flag ? `<img src="${escapeHtml(match.team_b_flag)}" alt="" />` : "B"}</span>
                <input name="teamBFlagFile" data-edit-flag="teamB-${match.id}" type="file" accept="image/*" />
                <input name="teamBFlag" type="hidden" value="${escapeHtml(match.team_b_flag || "")}" />
              </div>
            </label>
          </div>
          <label class="field"><span>وقت المباراة</span><input name="startsAt" required type="datetime-local" value="${datetimeLocalValue(match.starts_at)}" /></label>
          <label class="field"><span>وقت انتهاء التصويت</span><input name="voteEndsAt" required type="datetime-local" value="${datetimeLocalValue(match.vote_ends_at)}" /></label>
          <button class="primary-btn" type="submit">حفظ تعديل المباراة</button>
        </form>
        <button class="danger-btn" data-match-delete="${match.id}" data-match-name="${escapeHtml(`${match.team_a} ضد ${match.team_b}`)}" type="button">حذف المباراة</button>
      </section>
    </div>
  `;
}

function resultModal(matchId) {
  const match = state.matches.find(item => item.id === matchId);
  if (!match) return "";
  const scoreA = Number.isInteger(match.score_a) ? match.score_a : "";
  const scoreB = Number.isInteger(match.score_b) ? match.score_b : "";
  return `
    <div class="modal-backdrop" data-result-modal-close>
      <section class="modal-card stack">
        <div class="section-title">
          <h2>${match.winner ? "تعديل نتيجة المباراة" : "إضافة نتيجة المباراة"}</h2>
          <button class="icon-close" type="button" data-result-close>×</button>
        </div>
        <div class="teams team-row">${teamBadge(match.team_a, match.team_a_flag)}<span class="versus">ضد</span>${teamBadge(match.team_b, match.team_b_flag)}</div>
        <div id="resultError" class="notice danger-notice hidden"></div>
        <form class="manager-result-form" data-result-form="${match.id}">
          <div class="score-grid">
            <label class="field"><span>أهداف ${escapeHtml(match.team_a)}</span><input name="scoreA" required min="0" step="1" type="number" value="${scoreA}" /></label>
            <label class="field"><span>أهداف ${escapeHtml(match.team_b)}</span><input name="scoreB" required min="0" step="1" type="number" value="${scoreB}" /></label>
          </div>
          <button class="primary-btn" type="submit">${match.winner ? "حفظ تعديل النتيجة" : "اعتماد النتيجة"}</button>
        </form>
        ${match.winner ? `<button class="ghost-btn" data-clear="${match.id}" type="button">مسح النتيجة</button>` : ""}
      </section>
    </div>
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

function voteResultsModal(matchId) {
  const match = state.matches.find(item => item.id === matchId);
  if (!match) return "";
  const approved = state.participants.filter(user => user.participant_status === "approved");
  const predictions = new Map(
    state.allPredictions
      .filter(item => item.match_id === match.id)
      .map(item => [item.user_id, item])
  );
  const rows = approved.map(user => {
    const prediction = predictions.get(user.id);
    return { user, prediction };
  });
  const teamACount = rows.filter(row => row.prediction?.winner === match.team_a).length;
  const teamBCount = rows.filter(row => row.prediction?.winner === match.team_b).length;
  const missingCount = rows.filter(row => !row.prediction).length;
  return `
    <div class="modal-backdrop" data-vote-results-modal-close>
      <section class="modal-card stack">
        <div class="section-title">
          <h2>نتائج التصويت</h2>
          <button class="icon-close" type="button" data-vote-results-close>×</button>
        </div>
        <div class="vote-result-match">
          <strong>${escapeHtml(match.team_a)} ضد ${escapeHtml(match.team_b)}</strong>
          <span>${formatAdminMatchDate(match.starts_at)}</span>
        </div>
        <div class="vote-result-summary">
          <span>${escapeHtml(match.team_a)}: ${teamACount}</span>
          <span>${escapeHtml(match.team_b)}: ${teamBCount}</span>
          <span>لم يصوتوا: ${missingCount}</span>
        </div>
        <div class="vote-result-table">
          <div class="vote-result-head">
            <span>المشارك</span>
            <span>الترشيح</span>
            <span>جوكر</span>
          </div>
          ${rows.length ? rows.map(row => voteResultRow(row, match)).join("") : emptyView("لا يوجد مشاركون مقبولون.")}
        </div>
      </section>
    </div>
  `;
}

function voteResultRow(row, match) {
  const picked = row.prediction?.winner || "لم يصوت";
  const pickedClass = row.prediction
    ? row.prediction.winner === match.team_a ? "team-a" : "team-b"
    : "missing";
  return `
    <div class="vote-result-row">
      <span class="vote-result-player">${avatarTile(row.user, "avatar-mini")}<strong>${escapeHtml(row.user.name)}</strong></span>
      <span class="vote-result-pick ${pickedClass}">${escapeHtml(picked)}</span>
      <span class="vote-result-joker">${row.prediction?.is_joker ? "×2" : "-"}</span>
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
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function countdownAttrs(value, prefix = "") {
  return `data-countdown="${escapeHtml(value)}" data-countdown-prefix="${escapeHtml(prefix)}"`;
}

function updateCountdowns() {
  let expired = false;
  document.querySelectorAll("[data-countdown]").forEach(element => {
    const deadline = element.dataset.countdown;
    const prefix = element.dataset.countdownPrefix || "";
    const isExpired = new Date(deadline).getTime() <= Date.now();
    element.textContent = isExpired ? "مغلق" : `${prefix}${countdownText(deadline)}`;
    element.classList.toggle("expired", isExpired);
    if (isExpired && element.dataset.wasExpired !== "true") expired = true;
    element.dataset.wasExpired = isExpired ? "true" : "false";
  });
  return expired;
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
  const forgotToggle = document.querySelector("#forgotPasswordToggle");
  const resetForm = document.querySelector("#passwordResetForm");

  function syncAuthMode() {
    const isCreate = selectedMode === "create";
    document.querySelector("#mode").value = selectedMode;
    nameField.classList.toggle("hidden", !isCreate);
    roleField.classList.toggle("hidden", !isCreate);
    codeField.classList.toggle("hidden", !isCreate || selectedRole !== "organizer");
    document.querySelector("#name").required = isCreate;
    passwordInput.autocomplete = isCreate ? "new-password" : "current-password";
    forgotToggle?.classList.toggle("hidden", isCreate);
    resetForm?.classList.add("hidden");
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

  forgotToggle?.addEventListener("click", () => {
    resetForm?.classList.toggle("hidden");
    document.querySelector("#resetPhone").value = document.querySelector("#phone").value.trim();
  });

  resetForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const messageBox = document.querySelector("#passwordResetMessage");
    const resetButton = document.querySelector("#passwordResetBtn");
    messageBox.className = "notice hidden";
    resetButton.disabled = true;
    resetButton.textContent = "جاري إرسال الطلب...";
    try {
      await api("password-reset-request", {
        method: "POST",
        body: JSON.stringify({ phone: document.querySelector("#resetPhone").value.trim() })
      });
      messageBox.textContent = "تم إرسال الطلب. راجع المنظم لتعيين كلمة مرور جديدة.";
      messageBox.className = "notice";
      resetForm.reset();
    } catch (error) {
      messageBox.textContent = error.message || "تعذر إرسال طلب إعادة الضبط";
      messageBox.className = "notice danger-notice";
    } finally {
      resetButton.disabled = false;
      resetButton.textContent = "إرسال طلب إعادة الضبط";
    }
  });

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

  document.querySelector("#reapplyBtn")?.addEventListener("click", async () => {
    try {
      const payload = await api("participant-reapply", {
        method: "POST",
        body: JSON.stringify({ userId: state.currentUser.id })
      });
      state.currentUser = { ...state.currentUser, ...payload.user };
      writeSession(state.currentUser);
      state.notice = "تم تقديم طلب الانضمام من جديد.";
      await loadData({ silent: true });
    } catch (error) {
      state.error = error.message || "تعذر تقديم طلب الانضمام";
      render();
    }
  });

  document.querySelector("#profileOpenBtn")?.addEventListener("click", () => {
    state.profileOpen = true;
    render();
  });

  document.querySelector("[data-profile-close]")?.addEventListener("click", () => {
    state.profileOpen = false;
    render();
  });

  document.querySelectorAll("[data-modal-close], [data-detail-modal-close]").forEach(backdrop => backdrop.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.profileOpen = false;
      state.voterModalMatch = null;
      state.editModalMatch = null;
      state.resultModalMatch = null;
      state.detailParticipantId = null;
      render();
    }
  }));

  document.querySelector("[data-detail-close]")?.addEventListener("click", () => {
    state.detailParticipantId = null;
    render();
  });

  document.querySelectorAll(".modal-card").forEach(card => {
    card.addEventListener("click", event => event.stopPropagation());
    card.addEventListener("touchstart", event => event.stopPropagation(), { passive: true });
  });

  document.querySelectorAll("[data-match-edit-open]").forEach(button => {
    button.addEventListener("click", () => {
      state.editModalMatch = button.dataset.matchEditOpen;
      render();
    });
  });

  document.querySelectorAll("[data-result-open]").forEach(button => {
    button.addEventListener("click", () => {
      state.resultModalMatch = button.dataset.resultOpen;
      render();
    });
  });

  document.querySelectorAll("[data-participant-detail]").forEach(button => {
    button.addEventListener("click", () => {
      state.detailParticipantId = button.dataset.participantDetail;
      render();
    });
  });

  document.querySelector("[data-edit-close]")?.addEventListener("click", () => {
    state.editModalMatch = null;
    render();
  });

  document.querySelector("[data-result-close]")?.addEventListener("click", () => {
    state.resultModalMatch = null;
    render();
  });

  document.querySelectorAll("[data-voters]").forEach(button => {
    button.addEventListener("click", () => {
      state.voterModalMatch = button.dataset.voters;
      render();
    });
  });

  document.querySelectorAll("[data-vote-results]").forEach(button => {
    button.addEventListener("click", () => {
      state.voteResultsModalMatch = button.dataset.voteResults;
      render();
    });
  });

  document.querySelector("[data-voters-close]")?.addEventListener("click", () => {
    state.voterModalMatch = null;
    render();
  });

  document.querySelector("[data-vote-results-close]")?.addEventListener("click", () => {
    state.voteResultsModalMatch = null;
    render();
  });

  document.querySelector("[data-voter-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.voterModalMatch = null;
      render();
    }
  });

  document.querySelector("[data-vote-results-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.voteResultsModalMatch = null;
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
    state.addMatchOpen = true;
    render();
  });

  document.querySelector("[data-add-match-close]")?.addEventListener("click", () => {
    state.addMatchOpen = false;
    render();
  });

  document.querySelectorAll("[data-password-reset]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      button.textContent = "جاري الحفظ...";
      try {
        await api("password-reset-complete", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            participantId: form.dataset.passwordReset,
            password: form.elements.password.value.trim()
          })
        });
        state.notice = "تم تعيين كلمة المرور الجديدة.";
        await loadData({ silent: true });
      } catch (error) {
        state.error = error.message || "تعذر تعيين كلمة المرور";
        render();
      }
    });
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
        await loadData({ silent: true });
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
        await loadData({ silent: true });
      } catch (error) {
        closeSwipeRows();
        state.error = error.message || "تعذر حذف اللاعب";
        render();
      }
    });
  });

  document.querySelectorAll("[data-pick]").forEach(button => {
    button.addEventListener("click", async () => {
      const matchId = button.dataset.pick;
      const winner = button.dataset.team;
      const isJoker = button.dataset.jokerState === "true";
      const requestSeq = ++predictionSaveSeq;
      const previous = setOptimisticPrediction(matchId, winner, isJoker);
      state.error = "";
      render();
      try {
        await api("prediction", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            matchId,
            winner,
            isJoker
          })
        });
        if (requestSeq !== predictionSaveSeq) return;
        state.notice = "تم حفظ توقعك في السيرفر.";
        render();
      } catch (error) {
        if (requestSeq === predictionSaveSeq) restorePrediction(matchId, previous);
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
      const requestSeq = ++predictionSaveSeq;
      const previous = normalizePrediction(prediction);
      const nextJokerState = !prediction?.is_joker;
      setOptimisticPrediction(matchId, winner, nextJokerState);
      state.error = "";
      render();
      try {
        await api("prediction", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            matchId,
            winner,
            isJoker: nextJokerState
          })
        });
        if (requestSeq !== predictionSaveSeq) return;
        state.notice = prediction?.is_joker ? "تم إلغاء الجوكر." : "تم تفعيل الجوكر.";
        await loadData({ silent: true });
      } catch (error) {
        if (requestSeq === predictionSaveSeq) restorePrediction(matchId, previous);
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
      const errorBox = document.querySelector("#resultError");
      errorBox?.classList.add("hidden");
      if (!match || !Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
        showInlineError(errorBox, "أدخل أهداف الفريقين بشكل صحيح");
        return;
      }
      if (scoreA === scoreB) {
        showInlineError(errorBox, "لا يمكن اعتماد تعادل في أدوار خروج المغلوب. عدل الأهداف حسب النتيجة النهائية.");
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
        state.editModalMatch = null;
        state.resultModalMatch = null;
        await loadData({ silent: true });
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
        startsAt: datetimeLocalToIso(document.querySelector("#startsAt").value),
        voteEndsAt: datetimeLocalToIso(document.querySelector("#voteEndsAt").value)
      };
      await api("match", { method: "POST", body: JSON.stringify(match) });
      activeRound = match.roundId;
      state.addMatchOpen = false;
      state.notice = "تمت إضافة المباراة في السيرفر.";
      await loadData({ silent: true });
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
      avatarUrl = await imageFileToDataUrl(file, 180);
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
      await loadData({ silent: true });
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
        <input id="teamAFlag" type="file" accept="image/*" />
      </div>
    </label>
    <label class="field image-field">
      <span>علم الفريق الثاني</span>
      <div class="image-input-row">
        <span class="flag-tile preview-tile" id="teamBFlagPreview">B</span>
        <input id="teamBFlag" type="file" accept="image/*" />
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
  const errorBox = document.querySelector("#editError");
  errorBox?.classList.add("hidden");
  try {
    const formData = new FormData(form);
    await api("match", {
      method: "POST",
      body: JSON.stringify({
        userId: state.currentUser.id,
        matchId: form.dataset.matchEdit,
        roundId: activeRound,
        teamA: String(formData.get("teamA") || "").trim(),
        teamB: String(formData.get("teamB") || "").trim(),
        teamAFlag: String(formData.get("teamAFlag") || ""),
        teamBFlag: String(formData.get("teamBFlag") || ""),
        startsAt: datetimeLocalToIso(String(formData.get("startsAt") || "")),
        voteEndsAt: datetimeLocalToIso(String(formData.get("voteEndsAt") || ""))
      })
    });
    state.notice = "تم تعديل بطاقة المباراة.";
    state.editModalMatch = null;
    await loadData({ silent: true });
  } catch (error) {
    showInlineError(errorBox, error.message || "تعذر تعديل المباراة");
  }
}

function showInlineError(errorBox, message) {
  if (!errorBox) {
    state.error = message;
    render();
    return;
  }
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function syncCountdownTimer() {
  const hasOpenMatch = state.currentUser && state.matches.some(match => new Date(match.vote_ends_at) > new Date() && !match.winner);
  updateCountdowns();
  if (hasOpenMatch && !countdownTimer) {
    countdownTimer = setInterval(() => {
      if (!state.currentUser) return;
      const expired = updateCountdowns();
      if (expired && !hasOpenModal()) render();
    }, 1000);
  }
  if (!hasOpenMatch && countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function hasOpenModal() {
  return !!(state.profileOpen || state.voterModalMatch || state.voteResultsModalMatch || state.editModalMatch || state.resultModalMatch || state.detailParticipantId || state.addMatchOpen);
}

function bindSwipeRows() {
  document.querySelectorAll("[data-swipe-row]").forEach(row => {
    const content = row.querySelector("[data-swipe-content]");
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    row.addEventListener("touchstart", event => {
      if (event.target.closest("[data-participant-delete]")) return;
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
      if (!dragging) return;
      dragging = false;
      content.style.transition = "";
      const delta = currentX - startX;
      const shouldOpen = row.classList.contains("open")
        ? delta > 24 ? false : true
        : delta < -42;
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
    state.resultModalMatch = null;
    await loadData({ silent: true });
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

function rankMovementFor(standings) {
  if (state.currentUser?.role !== "organizer") return {};
  let previous = {};
  try {
    previous = JSON.parse(localStorage.getItem(RANK_SNAPSHOT_KEY) || "{}") || {};
  } catch {
    previous = {};
  }
  const current = {};
  const movement = {};
  standings.forEach((row, index) => {
    const rank = index + 1;
    current[row.id] = rank;
    const previousRank = previous[row.id];
    if (previousRank && previousRank !== rank) {
      movement[row.id] = previousRank - rank;
    }
  });
  localStorage.setItem(RANK_SNAPSHOT_KEY, JSON.stringify(current));
  return movement;
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
    if (file.type && !file.type.startsWith("image/")) {
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
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function formatDate(value) {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat("ar-AE", { dateStyle: "medium", timeStyle: "short", timeZone: APP_TIME_ZONE }).format(new Date(value));
}

function formatAdminMatchDate(value) {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat("ar-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE
  }).format(new Date(value));
}

function datetimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const dubaiLocal = new Date(date.getTime() + APP_TIME_OFFSET_MINUTES * 60000);
  return dubaiLocal.toISOString().slice(0, 16);
}

function datetimeLocalToIso(value) {
  if (!value) return "";
  const parts = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (parts) {
    const [, year, month, day, hour, minute] = parts;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)) - APP_TIME_OFFSET_MINUTES * 60000).toISOString();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
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
