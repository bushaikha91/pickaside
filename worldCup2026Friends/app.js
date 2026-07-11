const SESSION_KEY = "wc2026friends-live-session-v1";
const RANK_SNAPSHOT_KEY = "wc2026friends-rank-snapshot-v1";
const ACTIVE_TAB_KEY = "wc2026friends-active-tab-v1";
const STATE_CACHE_KEY = "wc2026friends-state-cache-v1";
const APP_TIME_ZONE = "Asia/Dubai";
const APP_TIME_OFFSET_MINUTES = 4 * 60;
const JOKER_RULE_VERSION = "round-of-8";
let deferredInstallPrompt = null;

const rounds = [
  { id: "r32", name: "دور الـ 32" },
  { id: "r16", name: "دور الـ 16" },
  { id: "qf", name: "ربع النهائي" },
  { id: "sf", name: "نصف النهائي" },
  { id: "final", name: "النهائي" }
];

const roundMatchLimits = {
  r32: 16,
  r16: 8,
  qf: 4,
  sf: 2,
  final: 1
};

const jokerLimits = {
  r16: 2,
  qf: 1
};

const fixedChampionTeams = [
  { name: "البرازيل", image: "https://flagcdn.com/w160/br.png" },
  { name: "فرنسا", image: "https://flagcdn.com/w160/fr.png" },
  { name: "اسبانيا", image: "https://flagcdn.com/w160/es.png" },
  { name: "الارجنتين", image: "https://flagcdn.com/w160/ar.png" },
  { name: "البرتغال", image: "https://flagcdn.com/w160/pt.png" },
  { name: "هولندا", image: "https://flagcdn.com/w160/nl.png" }
];
const fixedTopScorers = [
  { name: "توريس", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ferran%20Torres%20Garc%C3%ADa.png" },
  { name: "ميسي", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lionel%20Messi%20in%202018.jpg" },
  { name: "هاري كين", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Harry%20Kane%20in%20Russia%202.jpg" },
  { name: "اوليسي", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Michael%20Olise%20bayern%202025.jpg" },
  { name: "جوليان", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Juli%C3%A1n%20%C3%81lvarez%20(footballer)%202023.jpg" },
  { name: "امبابي", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kylian%20Mbapp%C3%A9.jpg" },
  { name: "رافينيا", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Raphinha.jpg" }
];

const laws = {
  r32: "كل مباراة قيمتها 200 نقطة: 150 نقطة لترشيح الفائز و50 نقطة للترشيح الأقل. التوقع الصحيح يسترجع 150 نقطة ويحصل على نصيبه من نقاط توقعات الخاسرين، والتوقع الخطأ يسترجع 50 نقطة فقط.",
  r16: "كل مباراة قيمتها 300 نقطة: 250 نقطة لترشيح الفائز و50 نقطة للترشيح الأقل. نقاط التوقعات الخاطئة تتجمع وتتوزع بالتساوي على أصحاب التوقع الصحيح.",
  r8: "كل مباراة في دور الـ 8 قيمتها 450 نقطة: 350 نقطة لترشيح الفائز و100 نقطة للترشيح الأقل. نقاط الخسارة تتوزع على أصحاب التوقع الصحيح.",
  qf: "ربع النهائي يعمل بنفس نظام دور الـ 8: كل مباراة قيمتها 450 نقطة، 350 نقطة لترشيح الفائز و100 نقطة للترشيح الأقل. نقاط الخسارة تتوزع على أصحاب التوقع الصحيح.",
  sf: "رصيد كل مشارك قبل نصف النهائي ينقسم على عدد مباريات الدور. يحدد المتسابق نسبة نقاط الفائز بين 60% و90%، والنظام يحسب المتبقي تلقائياً للفريق الآخر. خسائر التوقعات الخاطئة تتوزع على أصحاب التوقع الصحيح.",
  final: "في النهائي يستخدم المتسابق رصيده على مباراة واحدة. يحدد نسبة نقاط الفائز بين 60% و90%، والنظام يحسب المتبقي تلقائياً للفريق الآخر. خسائر التوقعات الخاطئة تتوزع على أصحاب التوقع الصحيح."
};

const displayLaws = {
  r32: "كل مباراة قيمتها 200 نقطة. عند اختيار الفريق المتوقع فوزه يتم وضع 150 نقطة على الفائز و50 نقطة على الفريق الآخر. إذا كان توقعك صحيحاً تحصل على 150 نقطة، وتُلغى الـ 50 نقطة الخاصة بترشيح الخسارة ولا تدخل في بول الخسارة. إذا كان توقعك خطأ تحصل على 50 نقطة فقط، وتذهب الـ 150 نقطة إلى مجموع نقاط الخاسرين لتوزع على أصحاب التوقع الصحيح.",
  r16: "كل مباراة قيمتها 300 نقطة. عند اختيار الفريق المتوقع فوزه يتم وضع 250 نقطة على الفائز و50 نقطة على الفريق الآخر. إذا كان توقعك صحيحاً تحصل على 250 نقطة، وتُلغى الـ 50 نقطة الخاصة بترشيح الخسارة ولا تدخل في بول الخسارة. إذا كان توقعك خطأ تحصل على 50 نقطة فقط، وتذهب الـ 250 نقطة لتوزع على أصحاب التوقع الصحيح. الجوكر متاح في هذا الدور لمباراتين فقط.",
  r8: "كل مباراة في دور الـ 8 قيمتها 450 نقطة. عند اختيار الفريق المتوقع فوزه يتم وضع 350 نقطة على الفائز و100 نقطة على الفريق الآخر. إذا كان توقعك صحيحاً تحصل على 350 نقطة، وتُلغى الـ 100 نقطة الخاصة بترشيح الخسارة ولا تدخل في بول الخسارة. إذا كان توقعك خطأ تحصل على 100 نقطة فقط، وتذهب الـ 350 نقطة إلى مجموع نقاط الخاسرين لتوزع على أصحاب التوقع الصحيح في نفس المباراة.",
  qf: "ربع النهائي يعمل بنظام دور الـ 8: كل مباراة قيمتها 450 نقطة. عند اختيار الفريق المتوقع فوزه يتم وضع 350 نقطة على الفائز و100 نقطة على الفريق الآخر. إذا كان توقعك صحيحاً تحصل على 350 نقطة، وتُلغى الـ 100 نقطة الخاصة بترشيح الخسارة ولا تدخل في بول الخسارة. إذا كان توقعك خطأ تحصل على 100 نقطة فقط، وتذهب الـ 350 نقطة إلى مجموع نقاط الخاسرين لتوزع على أصحاب التوقع الصحيح بعد اعتماد النتيجة. الجوكر متاح في هذا الدور لمباراة واحدة فقط.",
  sf: "رصيد كل مشارك قبل نصف النهائي يقسم على عدد مباريات الدور. عند اختيار الفائز يحدد المتسابق نسبة نقاط الفائز بين 60% و90%، ويحسب النظام النسبة المتبقية للفريق الآخر تلقائياً. إذا كان التوقع صحيحاً يحصل على نقاط نسبة الفائز وتُلغى النسبة المتبقية ولا تدخل في بول الخسارة. إذا كان التوقع خطأ يحصل على النسبة المتبقية فقط، وتذهب نقاط نسبة الفائز إلى مجموع نقاط الخاسرين لتوزع على أصحاب التوقع الصحيح.",
  final: "في المباراة النهائية يستخدم كل مشارك رصيده على مباراة واحدة. عند اختيار الفائز يحدد نسبة نقاط الفائز بين 60% و90%، ويحسب النظام النسبة المتبقية للفريق الآخر تلقائياً. إذا كان التوقع صحيحاً يحصل على نقاط نسبة الفائز وتُلغى النسبة المتبقية ولا تدخل في بول الخسارة. إذا كان التوقع خطأ يحصل على النسبة المتبقية فقط، وتذهب نقاط نسبة الفائز إلى مجموع نقاط الخاسرين لتوزع على أصحاب التوقع الصحيح."
};

const jokerLaw = "الجوكر متاح في دور الـ 16 ودور الـ 8 فقط. في دور الـ 16 يملك كل مشارك جوكرين يمكن تفعيلهما على مباراتين مختلفتين، وفي دور الـ 8 يملك جوكراً واحداً فقط. يجب تفعيل الجوكر قبل إغلاق التصويت للمباراة. إذا كان توقع الجوكر صحيحاً، يتم مضاعفة نقاط هذه المباراة ×2. إذا كان التوقع خطأ، تبقى خسارة النقاط حسب قانون الدور ولا يعطي الجوكر نقاطاً إضافية.";

const state = {
  currentUser: readSession(),
  matches: [],
  standings: [],
  predictions: {},
  matchPoints: {},
  allPredictions: [],
  allMatchPoints: {},
  allMatchStakes: {},
  championOptions: [],
  championPicks: [],
  triviaQuestions: [],
  triviaQuestionPages: {},
  triviaQuestionsLoadingMore: false,
  triviaAssignments: [],
  allTriviaAssignments: [],
  triviaSettings: [],
  adminDecisions: [],
  rankMovement: {},
  participants: [],
  organizers: [],
  serverNowOffsetMs: 0,
  loading: true,
  error: "",
  notice: "",
  profileOpen: false,
  voterModalMatch: null,
  voteResultsModalMatch: null,
  triviaResultsRound: null,
  championListOpen: false,
  editModalMatch: null,
  resultModalMatch: null,
  posterRound: null,
  detailParticipantId: null,
  addMatchOpen: false,
  addTriviaOpen: false,
  addTriviaRoundOpen: false,
  addAdminDecisionOpen: false,
  editAdminDecisionId: null,
  adminDecisionModalError: "",
  editTriviaQuestionId: null,
  editTriviaRoundId: null,
  activeTriviaRoundKey: null,
  triviaModalError: "",
  triviaRoundModalError: "",
  organizerTriviaTab: "questions",
  triviaQuestionDifficulty: "easy"
};

let activeTab = readActiveTab(state.currentUser);
let activeRound = "r16";
let userSelectedRound = false;
let countdownTimer = null;
let predictionSaveSeq = 0;

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (!state.currentUser) render();
});

function apiUrl(action) {
  const base = "/api/app-config?worldcupFriends=1";
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
    applyStatePayload(payload);
    writeStateCache(payload);
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

  syncActiveTab();
  app.innerHTML = appTemplate();
  bindApp();
}

function loginTemplate() {
  return `
    <section class="hero login-hero">
      <img class="login-hero-image" src="assets/worldcup-2026-login-hero.jpg" alt="FIFA World Cup 2026" />
    </section>
    <section class="content auth-content">
      <form class="panel login-panel" id="loginForm">
        <h2>دخول البطولة</h2>
        <p class="small" id="authHint">ادخل برقم الهاتف وكلمة المرور فقط.</p>
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
  const matchAlert = state.currentUser.role === "participant" && hasPendingMatchVotes();
  const triviaAlert = state.currentUser.role === "participant" && hasPendingTriviaRounds();
  const roleTabs = state.currentUser.role === "organizer"
    ? `
      <button class="tab ${activeTab === "manage" ? "active" : ""}" data-tab="manage">إدارة</button>
      <button class="tab ${activeTab === "participants" ? "active" : ""}" data-tab="participants">الطلبات</button>
      <button class="tab ${activeTab === "champions" ? "active" : ""}" data-tab="champions">ترشيحات البطل</button>
      <button class="tab ${activeTab === "trivia" ? "active" : ""}" data-tab="trivia">س/ج</button>
      <button class="tab ${activeTab === "admin-decisions" ? "active" : ""}" data-tab="admin-decisions">القرارات الإدارية</button>
    `
    : `
      <button class="tab ${activeTab === "matches" ? "active" : ""} ${matchAlert ? "has-alert" : ""}" data-tab="matches">المباريات</button>
      <button class="tab ${activeTab === "trivia" ? "active" : ""} ${triviaAlert ? "has-alert" : ""}" data-tab="trivia">س/ج</button>
    `;

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
    ${state.triviaResultsRound ? triviaResultsModal(state.triviaResultsRound) : ""}
    ${state.championListOpen ? championListModal() : ""}
    ${state.editModalMatch ? matchEditModal(state.editModalMatch) : ""}
    ${state.resultModalMatch ? resultModal(state.resultModalMatch) : ""}
    ${state.posterRound ? roundPosterModal(state.posterRound) : ""}
    ${state.detailParticipantId ? participantDetailModal(state.detailParticipantId) : ""}
    ${state.addMatchOpen ? matchFormModal() : ""}
    ${state.addTriviaOpen ? triviaQuestionModal() : ""}
    ${state.addTriviaRoundOpen ? triviaRoundModal() : ""}
    ${state.addAdminDecisionOpen ? adminDecisionModal() : ""}
    ${state.activeTriviaRoundKey ? triviaParticipantRoundModal() : ""}
  `;
}

function hasPendingMatchVotes() {
  return state.matches.some(match =>
    !isHiddenRound(match.round_id) &&
    !isVoteClosed(match) &&
    !normalizePrediction(state.predictions[match.id])
  );
}

function hasPendingTriviaRounds() {
  return triviaRoundGroups(state.triviaAssignments).some(([roundNumber, assignments]) => {
    if (triviaRoundGroupComplete(assignments)) return false;
    const roundId = normalizeRoundId(assignments[0]?.round_id);
    const setting = triviaRoundSetting(roundId, roundNumber);
    return !triviaRoundOpenState(setting).locked;
  });
}

function currentView() {
  if (activeTab === "standings") return standingsView();
  if (activeTab === "laws") return lawsView();
  if (activeTab === "trivia") return triviaView();
  if (state.currentUser.role === "participant" && state.currentUser.participant_status !== "approved") {
    return participantStatusView();
  }
  if (activeTab === "participants" && state.currentUser.role === "organizer") return participantsView();
  if (activeTab === "champions" && state.currentUser.role === "organizer") return championPicksView();
  if (activeTab === "admin-decisions" && state.currentUser.role === "organizer") return adminDecisionsView();
  if (state.currentUser.role === "organizer") return manageView();
  return participantMatchesView();
}

function adminDecisionsView() {
  return `
    <div class="stack admin-decisions-view">
      <div class="section-title">
        <h2>القرارات الإدارية</h2>
        <button class="icon-close add-decision-btn" id="addAdminDecisionToggle" type="button" aria-label="إضافة قرار">+</button>
      </div>
      <div class="match-list">
        ${state.adminDecisions.length ? state.adminDecisions.map(adminDecisionCard).join("") : emptyView("لا توجد قرارات إدارية مضافة حتى الآن.")}
      </div>
    </div>
  `;
}

function adminDecisionCard(decision) {
  return `
    <article class="match-card admin-decision-card">
      <div class="match-card-top">
        <strong>${escapeHtml(decision.title)}</strong>
        <button class="text-action" type="button" data-admin-decision-edit="${escapeHtml(decision.id)}">تعديل</button>
      </div>
      <p class="admin-decision-details">${escapeHtml(decision.details)}</p>
      <span class="small">${formatDate(decision.updated_at || decision.created_at)}</span>
    </article>
  `;
}

function adminDecisionModal() {
  const decision = state.editAdminDecisionId
    ? state.adminDecisions.find(item => item.id === state.editAdminDecisionId)
    : null;
  return `
    <div class="modal-backdrop" data-admin-decision-modal-close>
      <section class="modal-card stack add-match-modal">
        <div class="section-title">
          <h2>${decision ? "تعديل القرار" : "إضافة قرار"}</h2>
          <button class="icon-close" type="button" data-admin-decision-close>×</button>
        </div>
        <div class="notice danger-notice ${state.adminDecisionModalError ? "" : "hidden"}">${escapeHtml(state.adminDecisionModalError)}</div>
        <form class="stack" id="adminDecisionForm">
          <label class="field">
            <span>عنوان القرار</span>
            <input name="title" required value="${escapeHtml(decision?.title || "")}" placeholder="مثال: اعتماد نتيجة مباراة" />
          </label>
          <label class="field">
            <span>تفاصيل القرار</span>
            <textarea name="details" required rows="6" placeholder="اكتب تفاصيل القرار الإداري">${escapeHtml(decision?.details || "")}</textarea>
          </label>
          <button class="primary-btn" type="submit">حفظ</button>
          ${decision ? `<button class="danger-text-btn" type="button" data-admin-decision-delete="${escapeHtml(decision.id)}">حذف القرار</button>` : ""}
        </form>
      </section>
    </div>
  `;
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
    <div class="section-title" style="margin-top:18px">
      <h2>المنظمون المسجلون</h2>
      <span class="small">${state.organizers.length} منظم</span>
    </div>
    <div class="participant-list">
      ${state.organizers.length ? state.organizers.map(organizerRow).join("") : emptyView("لا يوجد منظمون مسجلون.")}
    </div>
  `;
}

function requestRow(user) {
  const avatarControl = participantAvatarControl(user);
  return `
    <article class="participant-row">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
      </div>
      <span class="status-chip ${user.participant_status}">${statusLabel(user.participant_status)}</span>
      <div class="participant-actions">
        ${avatarControl}
        <button class="mini-btn approve" data-participant-status="approved" data-participant-id="${user.id}">قبول</button>
        <button class="mini-btn reject" data-participant-status="rejected" data-participant-id="${user.id}">رفض</button>
      </div>
    </article>
  `;
}

function championPicksView() {
  const approved = state.participants.filter(user => user.participant_status === "approved");
  const teams = championOptionsByType("team");
  const scorers = championOptionsByType("scorer");
  const picksByParticipant = new Map(state.championPicks.map(item => [item.participant_id, item]));
  const availableParticipants = approved.filter(user => !picksByParticipant.has(user.id));
  const pickedParticipants = approved.filter(user => picksByParticipant.has(user.id));
  return `
    <div class="section-title champion-title">
      <div>
        <h2>ترشيحات البطل</h2>
        <span class="small">أضف كل متسابق مرة واحدة فقط</span>
      </div>
    </div>
    ${availableParticipants.length ? `<button class="primary-btn champion-open-btn" id="championListsBtn" type="button">إضافة ترشيح</button>` : `<div class="notice">تمت إضافة ترشيحات لكل المتسابقين المقبولين.</div>`}
    <div class="champion-picks-list">
      ${pickedParticipants.length ? pickedParticipants.map(user => championPickRow(user, picksByParticipant.get(user.id))).join("") : emptyView("لا توجد ترشيحات مضافة حتى الآن.")}
    </div>
  `;
}

function championAddForm(participants, teams, scorers) {
  return `
    <form class="champion-add-card" data-champion-add-pick>
      <label class="field compact-field">
        <span>المتسابق</span>
        <select name="participantId" required>
          <option value="">اختر المتسابق</option>
          ${participants.map(user => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)}</option>`).join("")}
        </select>
      </label>
      <label class="field compact-field">
        <span>الفريق المرشح</span>
        <select name="championTeam" required>
          <option value="">اختر الفريق</option>
          ${teams.map(team => `<option value="${escapeHtml(team.name)}">${escapeHtml(team.name)}</option>`).join("")}
        </select>
      </label>
      <label class="field compact-field">
        <span>هداف البطولة</span>
        <select name="topScorer" required>
          <option value="">اختر الهداف</option>
          ${scorers.map(scorer => `<option value="${escapeHtml(scorer.name)}">${escapeHtml(scorer.name)}</option>`).join("")}
        </select>
      </label>
      <button class="primary-btn" type="submit">إضافة ترشيح</button>
    </form>
  `;
}

function championPickRow(user, pick) {
  const team = championOptionByName("team", pick?.champion_team);
  const scorer = championOptionByName("scorer", pick?.top_scorer);
  return `
    <article class="champion-pick-row">
      <div class="champion-player">
        ${avatarTile(user, "avatar-small")}
        <strong>${escapeHtml(user.name)}</strong>
      </div>
      <div class="champion-pick-values media">
        ${championMediaTile(team, "flag")}
        <div>
          <span>الفريق المرشح</span>
          <strong>${escapeHtml(pick?.champion_team || "-")}</strong>
        </div>
      </div>
      <div class="champion-pick-values media">
        ${championMediaTile(scorer, "player")}
        <div>
          <span>هداف البطولة</span>
          <strong>${escapeHtml(pick?.top_scorer || "-")}</strong>
        </div>
      </div>
    </article>
  `;
}

function championMediaTile(option, type) {
  if (!option?.image) return `<span class="champion-media ${type}">${type === "flag" ? "?" : "هـ"}</span>`;
  return `<span class="champion-media ${type}"><img src="${escapeHtml(option.image)}" alt="${escapeHtml(option.name)}" loading="lazy" /></span>`;
}

function championOptionByName(type, name) {
  return championOptionsByType(type).find(item => item.name === name);
}

function championOptionsByType(type) {
  return type === "team" ? fixedChampionTeams : fixedTopScorers;
}

function championListModal() {
  const approved = state.participants.filter(user => user.participant_status === "approved");
  const picksByParticipant = new Map(state.championPicks.map(item => [item.participant_id, item]));
  const participants = approved.filter(user => !picksByParticipant.has(user.id));
  const teams = championOptionsByType("team");
  const scorers = championOptionsByType("scorer");
  return `
    <div class="modal-backdrop" data-champion-list-close>
      <section class="modal-card stack champion-list-modal">
        <div class="section-title">
          <h2>إضافة ترشيح</h2>
          <button class="icon-close" type="button" data-champion-list-x>×</button>
        </div>
        ${participants.length ? championAddForm(participants, teams, scorers) : `<div class="notice">تمت إضافة ترشيحات لكل المتسابقين المقبولين.</div>`}
      </section>
    </div>
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
  const avatarControl = participantAvatarControl(user);
  return `
    <article class="swipe-row" data-swipe-row>
      <button class="swipe-delete" data-participant-delete="${user.id}" data-participant-name="${escapeHtml(user.name)}">حذف</button>
      <div class="participant-row swipe-content" data-swipe-content>
        ${avatarTile(user, "avatar-small")}
        <div>
          <strong>${escapeHtml(user.name)}</strong>
        </div>
        <span class="status-chip approved">مقبول</span>
        <div class="participant-actions">
          ${avatarControl}
        </div>
      </div>
    </article>
  `;
}

function rejectedRow(user) {
  const avatarControl = participantAvatarControl(user);
  return `
    <article class="participant-row">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
      </div>
      <span class="status-chip rejected">مرفوض</span>
      <div class="participant-actions">
        ${avatarControl}
      </div>
    </article>
  `;
}

function participantAvatarControl(user) {
  return `
    <label class="mini-btn avatar-edit-btn">
      تغيير الصورة
      <input class="visually-hidden" type="file" accept="image/*" data-participant-avatar="${escapeHtml(user.id)}" />
    </label>
  `;
}

function organizerRow(user) {
  const isCurrentUser = user.id === state.currentUser?.id;
  return `
    <article class="participant-row organizer-row">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
        <span>${isCurrentUser ? "أنت" : "منظم"}</span>
      </div>
      <span class="status-chip approved">منظم</span>
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
      ${visibleRounds().map(round => `
        <button class="round-tab ${activeRound === round.id ? "active" : ""}" data-round="${round.id}">
          ${round.name}
        </button>
      `).join("")}
    </div>
  `;
}

function visibleRounds() {
  return rounds.filter(round => round.id !== "r32");
}

function isHiddenRound(roundId) {
  return normalizeRoundId(roundId) === "r32";
}

function syncParticipantActiveRound() {
  if (state.currentUser?.role !== "participant") return;
  if (!visibleRounds().some(round => round.id === normalizeRoundId(activeRound))) {
    activeRound = defaultParticipantRound();
    return;
  }
  if (!userSelectedRound || isRoundCompleted(activeRound)) {
    activeRound = defaultParticipantRound();
  }
}

function defaultParticipantRound() {
  const visible = visibleRounds();
  for (const round of visible) {
    const matches = matchesForRound(round.id);
    if (!matches.length || !matches.every(match => !!match.winner)) return round.id;
  }
  return visible[visible.length - 1]?.id || "r16";
}

function isRoundCompleted(roundId) {
  const matches = matchesForRound(roundId);
  return !!matches.length && matches.every(match => !!match.winner);
}

function matchesForRound(roundId) {
  return state.matches.filter(match => roundMatchesActiveTab(match, roundId));
}

function participantMatchesView() {
  const matches = sortMatches(state.matches.filter(match => roundMatchesActiveTab(match, activeRound)));
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
  const matches = sortMatches(state.matches.filter(match => roundMatchesActiveTab(match, activeRound)));
  const roundLimit = roundMatchLimits[normalizeRoundId(activeRound)] || Infinity;
  const roundIsFull = matches.length >= roundLimit;
  const posterReady = roundPosterReady(activeRound, matches, roundLimit);
  return `
    <div class="section-title">
      <h2>المباريات</h2>
      <span class="small">تنعكس على كل المشاركين</span>
    </div>
    ${roundTabs()}
    <button class="add-match-toggle" id="addMatchToggle" type="button" ${roundIsFull ? "disabled" : ""}>
      ${roundIsFull ? `اكتمل عدد مباريات ${roundName(activeRound)} (${roundLimit}/${roundLimit})` : `إضافة مباراة في ${roundName(activeRound)} (${matches.length}/${roundLimit})`}
    </button>
    ${posterReady ? `<button class="poster-create-btn" data-round-poster type="button">${normalizeRoundId(activeRound) === "final" ? "إنشاء بوستر البطل" : "إنشاء بوستر المتصدر"}</button>` : ""}
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
  return standingsMatrixView({ allowDetails: state.currentUser.role === "organizer" });
}

function normalizePrediction(prediction) {
  if (!prediction) return null;
  if (typeof prediction === "string") return { winner: prediction, is_joker: false };
  return { ...prediction, is_joker: !!prediction.is_joker, winner_percent: normalizeWinnerPercent(prediction.winner_percent) };
}

function normalizeWinnerPercent(value) {
  const percent = Number(value);
  if (!Number.isFinite(percent)) return null;
  const decimal = percent > 1 ? percent / 100 : percent;
  return Math.min(0.9, Math.max(0.6, decimal));
}

function predictionWinnerPercent(prediction) {
  return normalizeWinnerPercent(prediction?.winner_percent) || 0.9;
}

function winnerPercentValue(prediction) {
  return Math.round(predictionWinnerPercent(prediction) * 100);
}

function isCustomPercentMatch(match) {
  return ["sf", "final"].includes(normalizeRoundId(match?.round_id));
}

function setOptimisticPrediction(matchId, winner, isJoker, winnerPercent = null, pendingPercentSave = false) {
  const previous = normalizePrediction(state.predictions[matchId]);
  const previousPredictions = state.predictions;
  const nextPredictions = { ...state.predictions };

  if (isJoker) {
    const match = state.matches.find(item => item.id === matchId);
    const roundId = normalizeRoundId(match?.round_id);
    if (roundId === "qf") {
      const matchRounds = new Map(state.matches.map(item => [item.id, normalizeRoundId(item.round_id)]));
      Object.entries(nextPredictions).forEach(([otherMatchId, prediction]) => {
        if (otherMatchId !== matchId && matchRounds.get(otherMatchId) === roundId) {
          nextPredictions[otherMatchId] = { ...prediction, is_joker: false };
        }
      });
    }
  }

  nextPredictions[matchId] = {
    ...(previous || {}),
    match_id: matchId,
    winner,
    is_joker: !!isJoker,
    winner_percent: normalizeWinnerPercent(winnerPercent) ?? previous?.winner_percent ?? null,
    pending_percent_save: !!pendingPercentSave
  };
  state.predictions = nextPredictions;
  return isJoker ? { __snapshot: true, predictions: previousPredictions } : previous;
}

function restorePrediction(matchId, previous) {
  if (previous?.__snapshot) {
    state.predictions = previous.predictions;
    return;
  }
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

function standingsMatrixView(options = {}) {
  const allowDetails = !!options.allowDetails;
  const settledMatches = sortMatches(state.matches.filter(match => match.winner && !isHiddenRound(match.round_id)));
  return `
    ${state.standings.length ? `
      <div class="standings-board" role="region" aria-label="جدول ترتيب المشاركين">
        <div class="standings-total-col">
          <div class="matrix-cell matrix-head total-head">إجمالي النقاط</div>
          ${state.standings.map((row, index) => `<div class="matrix-cell total-cell ${index < 3 ? "podium-cell" : ""}">${row.points}</div>`).join("")}
        </div>
        <div class="standings-middle-scroll" data-standings-scroll>
          <div class="standings-scroll-table">
            <div class="standings-middle-row matrix-head-row">
              ${settledMatches.map(match => `
                <div class="match-score-group">
                  <div class="matrix-cell match-team-head">${escapeHtml(match.team_a)}</div>
                  <div class="matrix-cell match-team-head">${escapeHtml(match.team_b)}</div>
                  <div class="matrix-cell match-round-head">نقاط الجولة</div>
                </div>
              `).join("")}
              <div class="match-score-group summary-group" data-standings-summary-anchor>
                <div class="matrix-cell summary-head">إجمالي الصحيح</div>
                <div class="matrix-cell summary-head">إجمالي الخطأ</div>
                <div class="matrix-cell summary-head">نسبة الصحيح</div>
              </div>
              <div class="match-score-group summary-group">
                <div class="matrix-cell summary-head">س/ج صحيح</div>
                <div class="matrix-cell summary-head">س/ج خطأ</div>
                <div class="matrix-cell summary-head">نقاط س/ج</div>
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
                <div class="match-score-group summary-group">
                  <div class="matrix-cell summary-cell correct-total">${Number(row.trivia_correct) || 0}</div>
                  <div class="matrix-cell summary-cell wrong-total">${Number(row.trivia_wrong) || 0}</div>
                  <div class="matrix-cell summary-cell percent-total">${roundPoints(Number(row.trivia_points) || 0)}</div>
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
                ${allowDetails ? `<button class="leader-name-button" data-participant-detail="${row.id}" type="button">` : `<div class="leader-name-button static-leader-name">`}
                  ${avatarTile(row, "avatar-mini")}
                  <strong>${escapeHtml(row.name)}</strong>
                ${allowDetails ? `</button>` : `</div>`}
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
  const rows = sortMatches(state.matches.filter(match => !isHiddenRound(match.round_id))).map(match => {
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
      ${visibleRounds().map(round => `
        <article class="law-card">
          <h3>${round.name}</h3>
          <p>${displayLaws[round.id] || laws[round.id]}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function triviaView() {
  return state.currentUser.role === "organizer" ? organizerTriviaView() : participantTriviaView();
}

function organizerTriviaView() {
  const triviaTab = state.organizerTriviaTab || "questions";
  const activeDifficulty = normalizeDifficulty(state.triviaQuestionDifficulty);
  return `
    <div class="tabs trivia-page-tabs">
      <button class="tab ${triviaTab === "questions" ? "active" : ""}" data-trivia-page-tab="questions" type="button">الأسئلة</button>
      <button class="tab ${triviaTab === "rounds" ? "active" : ""}" data-trivia-page-tab="rounds" type="button">الجولات</button>
    </div>
    <div class="trivia-question-list">
      ${triviaTab === "rounds" ? `<section class="panel stack">
        <div class="section-title">
          <div>
            <h2>الجولات</h2>
            <span class="small">أضف عنوان الجولة، الدور الذي تظهر فيه، ونقاط كل مستوى.</span>
          </div>
          <button class="mini-btn" id="addTriviaRoundToggle" type="button">إضافة جولة</button>
        </div>
        ${state.triviaSettings.length ? visibleRounds().map(round => triviaRoundList(round.id)).join("") : emptyView("لا توجد جولات. أضف جولة لبدء عرض الأسئلة للمتسابقين.")}
      </section>` : `<section class="panel stack">
        <div class="section-title">
          <div>
            <h2>بنك الأسئلة العام</h2>
            <span class="small">${state.triviaQuestions.length} سؤال</span>
          </div>
          <button class="mini-btn" id="addTriviaToggle" type="button">إضافة سؤال ${difficultyLabel(activeDifficulty)}</button>
        </div>
        <div class="tabs trivia-level-tabs">
          ${["easy", "medium", "hard"].map(difficulty => `
            <button class="tab ${activeDifficulty === difficulty ? "active" : ""}" data-trivia-difficulty-tab="${difficulty}" type="button">
              ${difficultyLabel(difficulty)}
            </button>
          `).join("")}
        </div>
        ${triviaDifficultyQuestionList(activeDifficulty)}
      </section>`}
    </div>
  `;
}

function triviaRoundListLegacy(roundId) {
  const items = triviaRoundsFor(roundId);
  if (!items.length) return "";
  return `
    <section class="stack trivia-round-group">
      <div class="section-title">
        <h2>${roundName(roundId)}</h2>
        <span class="small">${items.length} جولة</span>
      </div>
      ${items.map(item => `
        <article class="trivia-admin-row">
          <div>
            <strong>${escapeHtml(item.title || `جولة ${item.sort_order || 1}`)}</strong>
            <span class="small">سهل ${triviaSettingPoints(item, "easy")} | متوسط ${triviaSettingPoints(item, "medium")} | صعب ${triviaSettingPoints(item, "hard")}</span>
            <span class="small">${triviaRoundOpenLabel(item)}</span>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function triviaRoundList(roundId) {
  const items = triviaRoundsFor(roundId);
  if (!items.length) return "";
  return `
    <section class="stack trivia-round-group trivia-round-admin-cards">
      <div class="section-title">
        <h2>${roundName(roundId)}</h2>
        <span class="small">${items.length} جولة</span>
      </div>
      ${items.map(item => `
        <article class="trivia-admin-row">
          <div class="trivia-round-card-top">
            <span>${triviaRoundAdminDateLabel(item)}</span>
            <strong>${triviaRoundStatusLabel(item)}</strong>
          </div>
          <div>
            <strong>${escapeHtml(item.title || `جولة ${item.sort_order || 1}`)}</strong>
            <span class="small">سهل ${triviaSettingPoints(item, "easy")} | متوسط ${triviaSettingPoints(item, "medium")} | صعب ${triviaSettingPoints(item, "hard")}</span>
            <span class="small">${triviaRoundOpenLabel(item)}</span>
          </div>
          <div class="trivia-admin-actions">
            <button class="mini-btn" data-trivia-results="${item.id}" type="button">${triviaRoundCompletionLabel(item)}</button>
            <button class="mini-btn" data-trivia-round-edit="${item.id}" type="button">تعديل</button>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function triviaRoundAdminSummary(round) {
  const approvedCount = state.participants.filter(user => user.participant_status === "approved").length;
  const rows = triviaRoundResultRows(round);
  const completed = rows.filter(row => row.completedCount === 3).length;
  const correct = rows.reduce((sum, row) => sum + row.correctCount, 0);
  const points = rows.reduce((sum, row) => sum + row.points, 0);
  return `اكتمل ${completed}/${approvedCount} | صحيح ${correct} | نقاط ${points}`;
}

function triviaRoundCompletionLabel(round) {
  const approvedCount = state.participants.filter(user => user.participant_status === "approved").length;
  const completed = triviaRoundResultRows(round).filter(row => row.completedCount === 3).length;
  return `اكتمل ${completed}/${approvedCount}`;
}

function triviaRoundResultRows(round) {
  const approved = state.participants
    .filter(user => user.participant_status === "approved")
    .map(hydrateParticipantAvatar);
  const roundId = normalizeRoundId(round?.round_id);
  const roundNumber = Math.max(1, Number(round?.sort_order || 1));
  const assignments = state.allTriviaAssignments.filter(item =>
    normalizeRoundId(item.round_id) === roundId &&
    Math.max(1, Number(item.question_round || 1)) === roundNumber
  );
  const byUser = new Map();
  assignments.forEach(item => {
    const participantId = item.participant_id || item.user?.id;
    if (!participantId) return;
    if (!byUser.has(participantId)) byUser.set(participantId, []);
    byUser.get(participantId).push(item);
  });
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  return approved.map(user => {
    const items = (byUser.get(user.id) || []).sort((a, b) =>
      (difficultyOrder[normalizeDifficulty(a.difficulty || a.question?.difficulty)] || 9) -
      (difficultyOrder[normalizeDifficulty(b.difficulty || b.question?.difficulty)] || 9)
    );
    const answered = items.filter(item => item.answered_at);
    const completedCount = answered.length;
    const correctCount = answered.filter(item => item.is_correct).length;
    const points = answered.reduce((sum, item) => sum + (Number(item.points_awarded) || 0), 0);
    return { user, assignments: items, completedCount, correctCount, points };
  });
}

function triviaResultsModal(roundIdValue) {
  const round = state.triviaSettings.find(item => item.id === roundIdValue);
  if (!round) return "";
  const rows = triviaRoundResultRows(round);
  const answeredPlayers = rows.filter(row => row.completedCount > 0).length;
  const completedPlayers = rows.filter(row => row.completedCount === 3).length;
  const correct = rows.reduce((sum, row) => sum + row.correctCount, 0);
  const points = rows.reduce((sum, row) => sum + row.points, 0);
  return `
    <div class="modal-backdrop" data-trivia-results-modal-close>
      <section class="modal-card stack">
        <div class="section-title">
          <h2>نتائج س/ج</h2>
          <button class="icon-close" type="button" data-trivia-results-close>×</button>
        </div>
        <div class="vote-result-match">
          <strong>${escapeHtml(round.title || `جولة ${round.sort_order || 1}`)}</strong>
          <span class="vote-result-date">${roundName(round.round_id)} | ${triviaRoundOpenLabel(round)}</span>
        </div>
        <div class="vote-result-summary trivia-result-summary">
          <span>شاركوا: ${answeredPlayers}</span>
          <span>مكتمل: ${completedPlayers}/${rows.length}</span>
          <span>صحيح: ${correct}</span>
          <span>النقاط: ${points}</span>
        </div>
        <div class="vote-result-table trivia-result-table">
          <div class="vote-result-head trivia-result-head">
            <span>المشارك</span>
            <span>النتيجة</span>
            <span>النقاط</span>
          </div>
          ${rows.length ? rows.map(row => triviaResultRow(row)).join("") : emptyView("لا يوجد مشاركون مقبولون.")}
        </div>
      </section>
    </div>
  `;
}

function triviaResultRow(row) {
  const statusClass = row.completedCount === 3 ? "team-a" : row.completedCount > 0 ? "team-b" : "missing";
  const statusText = row.completedCount === 3 ? `${row.correctCount}/3 صحيح` : row.completedCount > 0 ? `${row.completedCount}/3 مكتمل` : "لم يبدأ";
  return `
    <div class="vote-result-row trivia-result-row">
      <span class="vote-result-player">${avatarTile(row.user, "vote-avatar")}<strong>${escapeHtml(row.user.name)}</strong></span>
      <span class="vote-result-pick ${statusClass}">${statusText}</span>
      <span class="vote-result-joker">${row.points}</span>
      <div class="trivia-result-answers">
        ${row.assignments.length ? row.assignments.map(triviaResultAnswer).join("") : `<span class="small">لا توجد أسئلة مخصصة بعد.</span>`}
      </div>
    </div>
  `;
}

function triviaResultAnswer(assignment) {
  const question = assignment.question || {};
  const selected = String(assignment.selected_option || "").toLowerCase();
  const correct = String(question.correct_option || "").toLowerCase();
  const selectedText = selected ? triviaOptionText(question, selected) : "لم تتم الإجابة";
  const correctText = correct ? triviaOptionText(question, correct) : "غير متاحة";
  const status = assignment.answered_at ? assignment.is_correct ? "صحيح" : "خطأ" : assignment.started_at ? "بدأ ولم يجب" : "لم يبدأ";
  const statusClass = assignment.answered_at ? assignment.is_correct ? "approved" : "wrong" : "pending";
  return `
    <article class="trivia-result-answer">
      <div>
        <strong>${difficultyLabel(assignment.difficulty || question.difficulty)}</strong>
        <span class="small">${escapeHtml(question.question_text || "السؤال غير متاح")}</span>
      </div>
      <span class="status-chip ${statusClass}">${status}</span>
      <span class="small">اختياره: ${escapeHtml(selectedText)}</span>
      <span class="small">الصحيح: ${escapeHtml(correctText)}</span>
      <span class="small">النقاط: ${Number(assignment.points_awarded) || 0}</span>
    </article>
  `;
}

function triviaRoundModal() {
  const editingRound = state.editTriviaRoundId
    ? state.triviaSettings.find(item => item.id === state.editTriviaRoundId)
    : null;
  const isEditing = !!editingRound;
  const title = editingRound?.title || "";
  const roundId = normalizeRoundId(editingRound?.round_id || "r16");
  const opensAt = datetimeLocalValue(editingRound?.opens_at);
  const easyPoints = triviaSettingPoints(editingRound || {}, "easy") || 10;
  const mediumPoints = triviaSettingPoints(editingRound || {}, "medium") || 20;
  const hardPoints = triviaSettingPoints(editingRound || {}, "hard") || 30;
  return `
    <div class="modal-backdrop" data-trivia-round-modal-close>
      <section class="modal-card stack add-match-modal">
        <div class="section-title">
          <h2>${isEditing ? "تعديل جولة" : "إضافة جولة"}</h2>
          <button class="icon-close" type="button" data-trivia-round-close>×</button>
        </div>
        <form class="stack trivia-form" id="triviaRoundForm">
          ${state.triviaRoundModalError ? `<div class="inline-error">${escapeHtml(state.triviaRoundModalError)}</div>` : ""}
          <label class="field"><span>عنوان الجولة</span><input name="title" required value="${escapeHtml(title)}" placeholder="مثال: جولة معلومات الملاعب" /></label>
          <label class="field">
            <span>تظهر في دور</span>
            <select name="roundId" required>
              ${visibleRounds().map(round => `<option value="${round.id}" ${normalizeRoundId(round.id) === roundId ? "selected" : ""}>${round.name}</option>`).join("")}
            </select>
          </label>
          <label class="field"><span>وقت فتح الجولة</span><input name="opensAt" required type="datetime-local" value="${escapeHtml(opensAt)}" /></label>
          <div class="form-grid">
            <label class="field"><span>نقاط السهل</span><input name="easyPoints" type="number" min="1" max="1000" value="${easyPoints}" /></label>
            <label class="field"><span>نقاط المتوسط</span><input name="mediumPoints" type="number" min="1" max="1000" value="${mediumPoints}" /></label>
            <label class="field"><span>نقاط الصعب</span><input name="hardPoints" type="number" min="1" max="1000" value="${hardPoints}" /></label>
          </div>
          <button class="primary-btn" type="submit">${isEditing ? "حفظ التعديل" : "إضافة الجولة"}</button>
        </form>
        ${isEditing ? `<button class="danger-btn" data-trivia-round-delete="${editingRound.id}" type="button">حذف الجولة</button>` : ""}
      </section>
    </div>
  `;
}

function triviaDifficultyQuestionList(difficulty) {
  const normalized = normalizeDifficulty(difficulty);
  const questions = state.triviaQuestions.filter(item => normalizeDifficulty(item.difficulty) === normalized);
  const page = triviaQuestionPageState(normalized);
  const loadMore = page.hasMore
    ? `<div class="trivia-load-more" data-trivia-load-more="${normalized}">${state.triviaQuestionsLoadingMore ? "جاري تحميل المزيد..." : "جاري تحميل المزيد عند النزول..."}</div>`
    : "";
  return `
    <section class="stack trivia-round-group">
      <div class="section-title">
        <h2>${difficultyLabel(normalized)}</h2>
        <span class="small">${triviaQuestionTotalCount(normalized)} سؤال</span>
      </div>
      ${questions.length ? questions.map(triviaQuestionRow).join("") : emptyView("لا توجد أسئلة لهذا المستوى.")}
      ${loadMore}
    </section>
  `;
}

function triviaQuestionPageState(difficulty) {
  const normalized = normalizeDifficulty(difficulty);
  return state.triviaQuestionPages?.[normalized] || {
    loaded: state.triviaQuestions.filter(item => normalizeDifficulty(item.difficulty) === normalized).length,
    total: state.triviaQuestions.filter(item => normalizeDifficulty(item.difficulty) === normalized).length,
    hasMore: false
  };
}

function triviaQuestionTotalCount(difficulty) {
  const page = triviaQuestionPageState(difficulty);
  return Number(page.total ?? page.loaded ?? 0);
}

function bumpTriviaQuestionTotal(difficulty, delta) {
  const normalized = normalizeDifficulty(difficulty);
  const page = triviaQuestionPageState(normalized);
  state.triviaQuestionPages = {
    ...state.triviaQuestionPages,
    [normalized]: {
      ...page,
      total: Math.max(0, triviaQuestionTotalCount(normalized) + delta)
    }
  };
}

function triviaQuestionModal() {
  const question = state.triviaQuestions.find(item => item.id === state.editTriviaQuestionId) || {};
  const isEditing = !!question.id;
  const selectedDifficulty = isEditing ? normalizeDifficulty(question.difficulty) : normalizeDifficulty(state.triviaQuestionDifficulty);
  const selectedCorrect = String(question.correct_option || "a").toLowerCase();
  return `
    <div class="modal-backdrop" data-trivia-modal-close>
      <section class="modal-card stack add-match-modal">
        <div class="section-title">
          <h2>${isEditing ? "تعديل سؤال" : "إضافة سؤال"}</h2>
          <button class="icon-close" type="button" data-trivia-close>×</button>
        </div>
        <form class="stack trivia-form" id="triviaQuestionForm">
      ${state.triviaModalError ? `<div class="inline-error">${escapeHtml(state.triviaModalError)}</div>` : ""}
      <input name="difficulty" type="hidden" value="${selectedDifficulty}" />
      <span class="pill">${difficultyLabel(selectedDifficulty)}</span>
      <label class="field"><span>السؤال</span><input name="questionText" required placeholder="اكتب السؤال" value="${escapeHtml(question.question_text || "")}" /></label>
      <div class="form-grid">
        <label class="field"><span>الخيار A</span><input name="optionA" required value="${escapeHtml(question.option_a || "")}" /></label>
        <label class="field"><span>الخيار B</span><input name="optionB" required value="${escapeHtml(question.option_b || "")}" /></label>
        <label class="field"><span>الخيار C</span><input name="optionC" required value="${escapeHtml(question.option_c || "")}" /></label>
        <label class="field"><span>الخيار D</span><input name="optionD" required value="${escapeHtml(question.option_d || "")}" /></label>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>الإجابة الصحيحة</span>
          <select name="correctOption" required>
            <option value="a" ${selectedCorrect === "a" ? "selected" : ""}>A</option>
            <option value="b" ${selectedCorrect === "b" ? "selected" : ""}>B</option>
            <option value="c" ${selectedCorrect === "c" ? "selected" : ""}>C</option>
            <option value="d" ${selectedCorrect === "d" ? "selected" : ""}>D</option>
          </select>
        </label>
        <label class="field"><span>الثواني</span><input name="timeLimitSeconds" type="number" min="5" max="300" value="${triviaTimeLimitSeconds({ question })}" /></label>
      </div>
      <button class="primary-btn" type="submit">${isEditing ? "حفظ التعديل" : "إضافة السؤال"}</button>
        </form>
        ${isEditing ? `<button class="danger-btn" data-trivia-delete="${question.id}" data-trivia-question="${escapeHtml(question.question_text || "هذا السؤال")}" type="button">حذف السؤال</button>` : ""}
      </section>
    </div>
  `;
}

function triviaQuestionRow(question) {
  const correct = String(question.correct_option || "").toUpperCase();
  return `
    <article class="trivia-admin-row">
      <div>
        <strong>${escapeHtml(question.question_text)}</strong>
        <span class="small">${difficultyLabel(question.difficulty)} | الإجابة: ${correct} | ${triviaTimeLimitSeconds({ question })} ثانية</span>
      </div>
      <div class="trivia-admin-actions">
        <button class="text-link" data-trivia-edit="${question.id}" type="button">تعديل</button>
      </div>
    </article>
  `;
}

function triviaRoundsFor(roundId) {
  return state.triviaSettings
    .filter(item => normalizeRoundId(item.round_id) === normalizeRoundId(roundId))
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
}

function triviaRoundSetting(roundId, questionRound = 1) {
  const rounds = triviaRoundsFor(roundId);
  return rounds.find(item => Math.max(1, Number(item.sort_order || 1)) === Math.max(1, Number(questionRound || 1))) || rounds[0] || {};
}

function triviaRoundOpenState(setting) {
  const value = setting?.opens_at || setting?.opensAt || "";
  if (!value) return { locked: false, label: "الآن", value: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { locked: false, label: "الآن", value: "" };
  return {
    locked: date.getTime() > serverNowMs(),
    label: formatDate(value),
    value: date.toISOString()
  };
}

function triviaRoundOpenLabel(setting) {
  const openState = triviaRoundOpenState(setting);
  if (!openState.value) return "مفتوحة الآن";
  return `${openState.locked ? "تفتح في" : "مفتوحة من"} ${openState.label}`;
}

function triviaRoundAdminDateLabel(setting) {
  const openState = triviaRoundOpenState(setting);
  return openState.value ? openState.label : "الآن";
}

function triviaRoundStatusLabel(setting) {
  return triviaRoundOpenState(setting).locked ? "لم تفتح" : "مفتوحة";
}

function triviaSettingPoints(setting, difficulty) {
  const normalized = normalizeDifficulty(difficulty);
  if (normalized === "hard") return Math.max(1, Number(setting?.hard_points || 30));
  if (normalized === "medium") return Math.max(1, Number(setting?.medium_points || 20));
  return Math.max(1, Number(setting?.easy_points || 10));
}

function triviaDifficultyPoints(roundId, difficulty) {
  return triviaSettingPoints(triviaRoundSetting(roundId), difficulty);
}

function difficultyLabel(value) {
  return ({ easy: "سهل", medium: "متوسط", hard: "صعب" })[String(value || "easy")] || "سهل";
}

function triviaTimeLimitSeconds(assignment) {
  return Math.max(1, Number(assignment.question?.time_limit_seconds || 20));
}

function updateTriviaAssignment(assignmentId, updates) {
  state.triviaAssignments = state.triviaAssignments.map(item => {
    if (item.id !== assignmentId) return item;
    return {
      ...item,
      ...updates,
      question: updates.question || item.question
    };
  });
}

function participantTriviaView() {
  const assignments = state.triviaAssignments.filter(item => normalizeRoundId(item.round_id) === normalizeRoundId(activeRound));
  const earned = state.triviaAssignments.reduce((sum, item) => sum + (Number(item.points_awarded) || 0), 0);
  const answeredAssignments = state.triviaAssignments.filter(item => item.answered_at);
  const correctAnswers = answeredAssignments.filter(item => item.is_correct).length;
  const intelligencePercent = answeredAssignments.length ? Math.round((correctAnswers / answeredAssignments.length) * 100) : 0;
  return `
    <div class="summary-grid trivia-stats-grid">
      <div class="summary-card"><span class="small">نقاط إضافية</span><strong>${earned}</strong></div>
      <div class="summary-card"><span class="small">إجابات صحيحة</span><strong>${correctAnswers}/${answeredAssignments.length}</strong></div>
      <div class="summary-card"><span class="small">نسبة الذكاء</span><strong>${intelligencePercent}%</strong></div>
    </div>
    ${roundTabs()}
    <div class="trivia-question-list">
      ${assignments.length ? sortParticipantTriviaRoundGroups(triviaRoundGroups(assignments)).map(([roundNumber, roundAssignments]) => `
        ${triviaRoundSummaryCard(roundNumber, roundAssignments)}
      `).join("") : emptyView("لا توجد أسئلة متاحة لهذا الدور حالياً.")}
    </div>
  `;
}

function sortParticipantTriviaRoundGroups(groups) {
  return [...groups].sort((a, b) => {
    const aDone = triviaRoundGroupComplete(a[1]);
    const bDone = triviaRoundGroupComplete(b[1]);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return a[0] - b[0];
  });
}

function triviaRoundGroupComplete(assignments) {
  return assignments.length > 0 && assignments.every(triviaAssignmentComplete);
}

function triviaRoundGroups(assignments) {
  const grouped = new Map();
  assignments.forEach(item => {
    const roundNumber = Math.max(1, Number(item.question_round || item.question?.question_round || 1));
    if (!grouped.has(roundNumber)) grouped.set(roundNumber, []);
    grouped.get(roundNumber).push(item);
  });
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([roundNumber, items]) => [
      roundNumber,
      items.sort((a, b) => (difficultyOrder[a.difficulty || a.question?.difficulty || "easy"] || 9) - (difficultyOrder[b.difficulty || b.question?.difficulty || "easy"] || 9))
    ]);
}

function triviaRoundKey(roundId, roundNumber) {
  return `${normalizeRoundId(roundId)}:${Math.max(1, Number(roundNumber) || 1)}`;
}

function triviaRoundSummaryCard(roundNumber, assignments) {
  const setting = triviaRoundSetting(activeRound, roundNumber);
  const openState = triviaRoundOpenState(setting);
  const title = setting.title || `جولة ${roundNumber}`;
  const completed = assignments.filter(triviaAssignmentComplete);
  const correct = completed.filter(item => item.is_correct).length;
  const points = completed.reduce((sum, item) => sum + (Number(item.points_awarded) || 0), 0);
  const started = assignments.some(item => item.started_at || item.answered_at);
  const allDone = assignments.length > 0 && completed.length === assignments.length;
  const locked = openState.locked && !started && !allDone;
  const statusClass = allDone ? "approved" : locked ? "rejected" : started ? "pending" : "";
  const statusText = allDone ? "مكتمل" : locked ? "مقفلة" : started ? "قيد اللعب" : "جديدة";
  const detailText = allDone ? `${correct}/3 صحيح | ${points} نقطة` : locked ? `تفتح ${openState.label}` : started ? `${completed.length}/3 مكتمل` : "جاهزة للبدء";
  const buttonText = allDone ? "عرض النتيجة" : locked ? "مقفلة الآن" : started ? "متابعة الجولة" : "بدء الجولة";
  const buttonAttrs = locked ? "disabled" : `data-trivia-round-open="${triviaRoundKey(activeRound, roundNumber)}"`;
  return `
    <article class="panel stack trivia-card trivia-round-card ${allDone ? "correct" : ""}">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(title)}</h2>
          <span class="small">${allDone ? `${correct}/3 صحيح | ${points} نقطة` : started ? `${completed.length}/3 مكتمل` : "جاهزة للبدء"}</span>
        </div>
        <span class="status-chip ${allDone ? "approved" : started ? "pending" : ""}">${allDone ? "مكتمل" : started ? "قيد اللعب" : "جديدة"}</span>
      </div>
      <button class="primary-btn" data-trivia-round-open="${triviaRoundKey(activeRound, roundNumber)}" type="button">${allDone ? "عرض النتيجة" : started ? "متابعة الجولة" : "فتح الجولة"}</button>
    </article>
  `;
}

function triviaParticipantRoundModal() {
  const [roundId, roundValue] = String(state.activeTriviaRoundKey || "").split(":");
  const roundNumber = Math.max(1, Number(roundValue) || 1);
  const assignments = triviaRoundGroups(state.triviaAssignments.filter(item => normalizeRoundId(item.round_id) === normalizeRoundId(roundId)))
    .find(([itemRound]) => itemRound === roundNumber)?.[1] || [];
  if (!assignments.length) return "";
  return `
    <div class="modal-backdrop" data-trivia-participant-round-close>
      <section class="modal-card stack trivia-play-modal">
        <div class="section-title">
          <h2>${escapeHtml(triviaRoundSetting(roundId, roundNumber).title || `جولة ${roundNumber}`)}</h2>
          <button class="icon-close" type="button" data-trivia-participant-round-x>×</button>
        </div>
        ${triviaRoundCard(roundNumber, assignments, roundId)}
      </section>
    </div>
  `;
}

function triviaRoundCard(roundNumber, assignments, displayRoundId = activeRound) {
  const setting = triviaRoundSetting(displayRoundId, roundNumber);
  const title = setting.title || `جولة ${roundNumber}`;
  const completed = assignments.filter(triviaAssignmentComplete);
  const correct = completed.filter(item => item.is_correct).length;
  const points = completed.reduce((sum, item) => sum + (Number(item.points_awarded) || 0), 0);
  const active = assignments.find(item => !triviaAssignmentComplete(item));
  const started = assignments.some(item => item.started_at || item.answered_at);
  const allDone = assignments.length > 0 && completed.length === assignments.length;
  return `
    <article class="panel stack trivia-card trivia-round-card ${allDone ? "correct" : ""}">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(title)}</h2>
          <span class="small">3 أسئلة بثلاث مستويات: سهل، متوسط، صعب</span>
        </div>
        <span class="status-chip ${allDone ? "approved" : started ? "pending" : ""}">${allDone ? "مكتمل" : started ? `${completed.length}/3` : "جاهزة"}</span>
      </div>
      <div class="trivia-round-points">
        <span>سهل: ${triviaSettingPoints(setting, "easy")} نقطة</span>
        <span>متوسط: ${triviaSettingPoints(setting, "medium")} نقطة</span>
        <span>صعب: ${triviaSettingPoints(setting, "hard")} نقطة</span>
      </div>
      ${allDone ? triviaRoundResult(correct, points, assignments) : !started ? triviaRoundIntro(assignments[0]) : triviaAssignmentCard(active, assignments)}
    </article>
  `;
}

function triviaRoundIntro(firstAssignment) {
  return `
    <p class="small">عند بدء الجولة ستظهر لك الأسئلة واحداً بعد الآخر. بعد اختيار الإجابة أو انتهاء الوقت ينتقل التطبيق تلقائياً للسؤال التالي، وبعد السؤال الثالث تظهر النتيجة.</p>
    <button class="primary-btn" data-trivia-start="${firstAssignment?.id || ""}" type="button" ${firstAssignment ? "" : "disabled"}>ابدأ الجولة</button>
  `;
}

function triviaRoundSummaryCard(roundNumber, assignments) {
  const setting = triviaRoundSetting(activeRound, roundNumber);
  const openState = triviaRoundOpenState(setting);
  const title = setting.title || `جولة ${roundNumber}`;
  const completed = assignments.filter(triviaAssignmentComplete);
  const correct = completed.filter(item => item.is_correct).length;
  const points = completed.reduce((sum, item) => sum + (Number(item.points_awarded) || 0), 0);
  const started = assignments.some(item => item.started_at || item.answered_at);
  const allDone = assignments.length > 0 && completed.length === assignments.length;
  const locked = openState.locked && !started && !allDone;
  const buttonText = allDone ? "عرض النتيجة" : locked ? "مقفلة الآن" : started ? "متابعة الجولة" : "بدء الجولة";
  const buttonClass = allDone ? "primary-btn trivia-result-btn" : "primary-btn";
  const buttonAttrs = locked ? "disabled" : `data-trivia-round-open="${triviaRoundKey(activeRound, roundNumber)}"`;
  const countdownLabel = allDone
    ? "مكتملة"
    : locked
      ? `تفتح بعد: ${countdownText(openState.value)}`
      : started
        ? "قيد اللعب"
        : "مفتوحة الآن";
  const countdownAttribute = locked ? countdownAttrs(openState.value, "تفتح بعد: ", "مفتوحة الآن") : "";
  return `
    <article class="match-card participant-match-card participant-trivia-card ${allDone ? "correct" : ""} ${locked ? "locked-card" : ""}">
      <div class="participant-match-top">
        <span>${openState.value ? formatAdminMatchDate(openState.value) : "غير محدد"}</span>
        <span class="participant-countdown ${allDone ? "expired" : ""}" ${countdownAttribute}>${countdownLabel}</span>
      </div>
      <div class="participant-trivia-main">
        <h2>${escapeHtml(title)}</h2>
        <button class="${buttonClass}" ${buttonAttrs} type="button">${buttonText}</button>
      </div>
      <div class="participant-trivia-bottom">
        <span><strong>${correct}/${assignments.length || 3}</strong><small>الصحيح</small></span>
        <span><strong>${points}</strong><small>النقاط</small></span>
      </div>
    </article>
  `;
}

function triviaRoundCard(roundNumber, assignments, displayRoundId = activeRound) {
  const setting = triviaRoundSetting(displayRoundId, roundNumber);
  const openState = triviaRoundOpenState(setting);
  const title = setting.title || `جولة ${roundNumber}`;
  const completed = assignments.filter(triviaAssignmentComplete);
  const correct = completed.filter(item => item.is_correct).length;
  const points = completed.reduce((sum, item) => sum + (Number(item.points_awarded) || 0), 0);
  const active = assignments.find(item => !triviaAssignmentComplete(item));
  const started = assignments.some(item => item.started_at || item.answered_at);
  const allDone = assignments.length > 0 && completed.length === assignments.length;
  const locked = openState.locked && !started && !allDone;
  return `
    <article class="panel stack trivia-card trivia-round-card ${allDone ? "correct" : ""}">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(title)}</h2>
          <span class="small">3 أسئلة بثلاث مستويات: سهل، متوسط، صعب</span>
        </div>
        <span class="status-chip ${allDone ? "approved" : locked ? "rejected" : started ? "pending" : ""}">${allDone ? "مكتمل" : locked ? "مقفلة" : started ? `${completed.length}/3` : "جاهزة"}</span>
      </div>
      <div class="trivia-round-points">
        <span>سهل: ${triviaSettingPoints(setting, "easy")} نقطة</span>
        <span>متوسط: ${triviaSettingPoints(setting, "medium")} نقطة</span>
        <span>صعب: ${triviaSettingPoints(setting, "hard")} نقطة</span>
      </div>
      ${allDone ? triviaRoundResult(correct, points, assignments) : locked ? triviaRoundLockedView(openState) : !started ? triviaRoundIntro(assignments[0]) : triviaAssignmentCard(active, assignments)}
    </article>
  `;
}

function triviaRoundLockedView(openState) {
  return `
    <div class="trivia-round-lock">
      <strong>الجولة مقفلة حالياً</strong>
      <span class="small">تفتح تلقائياً في ${openState.label}</span>
    </div>
  `;
}

function triviaRoundResult(correct, points, assignments = []) {
  return `
    <div class="summary-grid trivia-round-result">
      <div class="summary-card"><span class="small">الإجابات الصحيحة</span><strong>${correct}/3</strong></div>
      <div class="summary-card"><span class="small">نقاط الجولة</span><strong>${points}</strong></div>
    </div>
    <div class="trivia-answer-review">
      <strong>مراجعة الإجابات</strong>
      ${assignments.map((assignment, index) => triviaAnswerReviewItem(assignment, index)).join("")}
    </div>
  `;
}

function triviaAnswerReviewItem(assignment, index) {
  const question = assignment.question || {};
  const selected = String(assignment.selected_option || "").toLowerCase();
  const correct = String(question.correct_option || "").toLowerCase();
  const selectedText = selected ? triviaOptionText(question, selected) : "لم تتم الإجابة";
  const correctText = correct ? triviaOptionText(question, correct) : "غير متاحة";
  return `
    <article class="trivia-answer-review-item ${assignment.is_correct ? "correct" : "wrong"}">
      <div class="trivia-answer-review-head">
        <span>السؤال ${index + 1}</span>
        <strong>${assignment.is_correct ? "صحيح" : "خطأ"}</strong>
      </div>
      <p>${escapeHtml(question.question_text || "السؤال غير متاح")}</p>
      <div class="trivia-answer-lines">
        <span>اختيارك: <b>${escapeHtml(selectedText)}</b></span>
        <span>الإجابة الصحيحة: <b>${escapeHtml(correctText)}</b></span>
        <span>النقاط: <b>${Number(assignment.points_awarded) || 0}</b></span>
      </div>
    </article>
  `;
}

function triviaOptionText(question, option) {
  const key = `option_${String(option || "").toLowerCase()}`;
  const label = String(option || "").toUpperCase();
  const value = question?.[key] || "";
  return value ? `${label} - ${value}` : label || "-";
}

function triviaAssignmentComplete(assignment) {
  return !!assignment?.answered_at || triviaAssignmentExpired(assignment);
}

function triviaAssignmentExpired(assignment) {
  if (!assignment?.started_at || assignment.answered_at) return false;
  return new Date(assignment.started_at).getTime() + triviaTimeLimitSeconds(assignment) * 1000 <= serverNowMs();
}

function triviaAssignmentCard(assignment, roundAssignments = []) {
  if (!assignment) {
    return `<span class="small">جاري تجهيز السؤال التالي...</span>`;
  }
  const question = assignment.question || {};
  const availablePoints = triviaSettingPoints(triviaRoundSetting(assignment.round_id, assignment.question_round), assignment.difficulty || question.difficulty);
  const started = !!assignment.started_at;
  const answered = !!assignment.answered_at;
  const deadline = assignment.started_at ? new Date(new Date(assignment.started_at).getTime() + triviaTimeLimitSeconds(assignment) * 1000).toISOString() : "";
  const expired = triviaAssignmentExpired(assignment);
  const options = [
    ["a", question.option_a],
    ["b", question.option_b],
    ["c", question.option_c],
    ["d", question.option_d]
  ];
  const autoStart = started && expired ? nextTriviaAssignment(roundAssignments, assignment) : null;
  return `
    <div class="stack ${answered ? assignment.is_correct ? "correct" : "wrong" : expired ? "expired" : ""}">
      <div class="section-title">
        <h2>${started ? escapeHtml(question.question_text || "سؤال") : "سؤال جاهز"}</h2>
        <span class="status-chip ${answered ? assignment.is_correct ? "approved" : "wrong" : expired ? "rejected" : "pending"}">
          ${difficultyLabel(assignment.difficulty || question.difficulty)} | ${assignment._pendingAnswer ? "جاري اعتماد الإجابة..." : answered ? assignment.is_correct ? `صحيح +${assignment.points_awarded}` : "خطأ" : expired ? "انتهى الوقت" : `${availablePoints} نقطة`}
        </span>
      </div>
      ${!started ? `<span class="small">اضغط ابدأ السؤال لعرض السؤال وتشغيل العداد.</span>` : ""}
      ${started && !answered && !expired ? `<span class="countdown" ${countdownAttrs(deadline, "الوقت: ")} data-trivia-expire="${assignment.id}">${countdownText(deadline)}</span>` : ""}
      ${expired && autoStart ? `<span class="small" data-trivia-autostart="${autoStart.id}" data-trivia-expire-first="${assignment.id}">انتهى الوقت. جاري فتح السؤال التالي...</span>` : ""}
      ${expired && !autoStart ? `<span class="small" data-trivia-expire-only="${assignment.id}">انتهى الوقت. جاري عرض النتيجة...</span>` : ""}
      ${!started ? `<button class="primary-btn" data-trivia-start="${assignment.id}" type="button">ابدأ السؤال</button>` : `
        <div class="trivia-options">
          ${options.map(([key, value]) => `
            <button class="choice ${assignment.selected_option === key ? "active" : ""}" data-trivia-answer="${assignment.id}" data-option="${key}" type="button" ${answered || expired || assignment._pendingAnswer ? "disabled" : ""}>
              <span>${key.toUpperCase()}</span>
              ${escapeHtml(value || "-")}
            </button>
          `).join("")}
        </div>
      `}
    </div>
  `;
}

function nextTriviaAssignment(assignments, current) {
  const index = assignments.findIndex(item => item.id === current?.id);
  return assignments.slice(index + 1).find(item => !triviaAssignmentComplete(item));
}

function triviaRoundAssignmentsFor(assignment) {
  if (!assignment) return [];
  return triviaRoundGroups(state.triviaAssignments.filter(item => normalizeRoundId(item.round_id) === normalizeRoundId(assignment.round_id)))
    .find(([roundNumber]) => roundNumber === Math.max(1, Number(assignment.question_round || 1)))?.[1] || [];
}

const pendingTriviaStarts = new Set();
const pendingTriviaExpires = new Set();

async function startTriviaAssignment(assignmentId) {
  if (!assignmentId || pendingTriviaStarts.has(assignmentId)) return;
  pendingTriviaStarts.add(assignmentId);
  const previous = state.triviaAssignments.find(item => item.id === assignmentId);
  try {
    updateTriviaAssignment(assignmentId, { started_at: new Date(serverNowMs()).toISOString() });
    render();
    const payload = await api("trivia-start", {
      method: "POST",
      body: JSON.stringify({ userId: state.currentUser.id, assignmentId })
    });
    if (payload.serverNow) state.serverNowOffsetMs = new Date(payload.serverNow).getTime() - Date.now();
    updateTriviaAssignment(assignmentId, payload.assignment || {});
    render();
  } catch (error) {
    if (previous) updateTriviaAssignment(assignmentId, previous);
    state.error = error.message || "تعذر بدء السؤال";
    render();
  } finally {
    pendingTriviaStarts.delete(assignmentId);
  }
}

async function expireTriviaAssignment(assignmentId) {
  if (!assignmentId || pendingTriviaExpires.has(assignmentId)) return;
  const current = state.triviaAssignments.find(item => item.id === assignmentId);
  if (!current || current.answered_at) return;
  pendingTriviaExpires.add(assignmentId);
  try {
    const payload = await api("trivia-expire", {
      method: "POST",
      body: JSON.stringify({ userId: state.currentUser.id, assignmentId })
    });
    if (payload.serverNow) state.serverNowOffsetMs = new Date(payload.serverNow).getTime() - Date.now();
    if (payload.assignment) updateTriviaAssignment(assignmentId, payload.assignment);
    render();
  } catch {
    render();
  } finally {
    pendingTriviaExpires.delete(assignmentId);
  }
}

function summaryView() {
  const mine = state.standings.find(row => row.id === state.currentUser.id) || { points: 0, correct_predictions: 0, wrong_predictions: 0 };
  const correctPredictions = Number(mine.correct_predictions) || 0;
  const wrongPredictions = Number(mine.wrong_predictions) || 0;
  const totalPredictions = correctPredictions + wrongPredictions;
  const voteAccuracy = totalPredictions ? Math.round((correctPredictions / totalPredictions) * 100) : 0;
  return `
    <div class="summary-grid" style="margin-bottom:16px">
      <div class="summary-card"><span class="small">النقاط</span><strong>${mine.points}</strong></div>
      <div class="summary-card"><span class="small">صحيح</span><strong>${correctPredictions}/${totalPredictions}</strong></div>
      <div class="summary-card"><span class="small">دقة التصويت</span><strong>${voteAccuracy}%</strong></div>
    </div>
  `;
}

function matchCard(match, prediction) {
  const locked = isVoteClosed(match);
  const selected = prediction?.winner || prediction || "";
  const isJoker = !!prediction?.is_joker;
  const points = state.matchPoints[match.id];
  const canUseJoker = shouldShowJokerButton(match, isJoker);
  const percentBox = isCustomPercentMatch(match) && selected ? participantWinnerPercentBox(match, prediction, locked) : "";
  const status = participantMatchStatus(match, selected, points, locked);
  const pickText = selected
    ? prediction?.pending_percent_save ? "حدد النسبة ثم اضغط حفظ الترشيح" : `تم حفظ توقعك: ${escapeHtml(selected)}`
    : "اختر الفائز لحفظ توقعك";
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
      ${percentBox}
      ${canUseJoker ? `
        <button class="joker-toggle participant-joker ${isJoker ? "active" : ""}" ${locked ? "disabled" : ""} data-joker="${match.id}" type="button">
          ${isJoker ? "الجوكر مفعل ×2" : "تفعيل الجوكر ×2"}
        </button>
      ` : ""}
      <div class="participant-match-footer">
        ${status}
        <span class="saved-pick">${pickText}</span>
      </div>
    </article>
  `;
}

function participantWinnerPercentBox(match, prediction, locked) {
  const winnerPercent = winnerPercentValue(prediction);
  const safetyPercent = 100 - winnerPercent;
  const selected = prediction?.winner || "";
  return `
    <div class="winner-percent-box">
      <label class="winner-percent-field">
        <span>نسبة نقاط الفائز</span>
        <input type="number" min="60" max="90" step="1" value="${winnerPercent}" ${locked ? "disabled" : ""} data-winner-percent="${match.id}" />
      </label>
      <div class="winner-percent-preview">
        <span>${winnerPercent}% للفائز</span>
        <span>${safetyPercent}% للفريق الآخر</span>
      </div>
      <button class="primary-btn winner-percent-save" type="button" ${locked ? "disabled" : ""} data-save-percent-pick="${match.id}" data-team="${escapeHtml(selected)}">
        حفظ الترشيح
      </button>
    </div>
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

function shouldShowJokerButton(match, isJoker) {
  const roundId = normalizeRoundId(match.round_id);
  const limit = jokerLimits[roundId] || 0;
  if (!limit) return false;
  if (roundId === "qf") return true;
  if (isJoker) return true;
  return usedJokersInRound(roundId) < limit;
}

function usedJokersInRound(roundId) {
  const normalizedRoundId = normalizeRoundId(roundId);
  const matchRounds = new Map(state.matches.map(match => [match.id, normalizeRoundId(match.round_id)]));
  return Object.entries(state.predictions).filter(([matchId, prediction]) => {
    const normalizedPrediction = normalizePrediction(prediction);
    return normalizedPrediction?.is_joker && matchRounds.get(normalizedPrediction.match_id || matchId) === normalizedRoundId;
  }).length;
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

function roundPosterReady(roundId, matches, roundLimit) {
  return state.standings.length > 0;
}

function roundPosterModal(roundId) {
  const data = roundPosterData(roundId);
  if (!data) return "";
  return `
    <div class="modal-backdrop" data-poster-modal-close>
      <section class="modal-card stack poster-modal">
        <div class="section-title">
          <h2>${data.isFinal ? "بوستر البطل" : "بوستر المتصدر"}</h2>
          <button class="icon-close" type="button" data-poster-close>×</button>
        </div>
        <canvas id="roundPosterCanvas" class="round-poster-canvas" width="1080" height="1920"></canvas>
        <div class="poster-actions">
          <button class="primary-btn" id="savePosterBtn" type="button">حفظ البوستر</button>
          <button class="ghost-btn" id="sharePosterBtn" type="button">مشاركة الصورة</button>
        </div>
      </section>
    </div>
  `;
}

function roundPosterData(roundId) {
  const normalizedRoundId = normalizeRoundId(roundId);
  const leaderboard = roundLeaderboard(normalizedRoundId);
  const winner = leaderboard[0];
  if (!winner) return null;
  const total = winner.correct + winner.wrong;
  return {
    ...winner,
    roundId: normalizedRoundId,
    roundLabel: posterRoundLabel(normalizedRoundId),
    title: normalizedRoundId === "final" ? "بطل بطولة التوقعات" : `متصدر ${posterRoundLabel(normalizedRoundId)}`,
    subtitle: normalizedRoundId === "final" ? "بطولة توقعات العالم 2026" : `متصدر ${posterRoundLabel(normalizedRoundId)} في بطولة توقعات العالم 2026`,
    isFinal: normalizedRoundId === "final",
    accuracy: total ? Math.round((winner.correct / total) * 100) : 0,
    correctLabel: `${winner.correct}/${total || 0}`,
    palette: posterPalette(normalizedRoundId)
  };
}

function roundLeaderboard(roundId) {
  const order = ["r32", "r16", "qf", "sf", "final"];
  const targetIndex = order.indexOf(normalizeRoundId(roundId));
  if (targetIndex < 0) return [];
  const rows = state.standings.map(user => ({
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url || "",
    total_points: Number(user.points) || 0,
    trivia_correct: Number(user.trivia_correct) || 0,
    trivia_wrong: Number(user.trivia_wrong) || 0,
    trivia_points: Number(user.trivia_points) || 0,
    points: 0,
    correct: 0,
    wrong: 0
  }));

  for (let index = 0; index <= targetIndex; index += 1) {
    const currentRound = order[index];
    const roundMatches = sortMatches(state.matches.filter(match => normalizeRoundId(match.round_id) === currentRound && match.winner));
    if (!roundMatches.length) continue;
    rows.forEach(row => {
      const pointsInRound = roundMatches.reduce((sum, match) => sum + (state.allMatchPoints[row.id]?.[match.id]?.points || 0), 0);
      if (currentRound === "r32" || currentRound === "r16") row.points += pointsInRound;
      else row.points = pointsInRound;
      roundMatches.forEach(match => {
        const matchPoint = state.allMatchPoints[row.id]?.[match.id];
        if (!matchPoint) return;
        if (matchPoint.correct) row.correct += 1;
        else row.wrong += 1;
      });
    });
  }

  return rows
    .map(row => ({ ...row, points: roundPoints(row.points), total_points: roundPoints(row.total_points) }))
    .sort((a, b) => b.points - a.points || b.correct - a.correct || a.wrong - b.wrong)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function posterRoundLabel(roundId) {
  return ({
    r32: "دور الـ 32",
    r16: "دور الـ 16",
    qf: "ربع النهائي",
    sf: "نصف النهائي",
    final: "النهائي"
  })[normalizeRoundId(roundId)] || roundName(roundId);
}

function posterPalette(roundId) {
  return ({
    r32: { a: "#08265f", b: "#009368", c: "#2f80ed", accent: "#28d17c" },
    r16: { a: "#071b4f", b: "#c91f3a", c: "#246bfe", accent: "#ffcf5a" },
    qf: { a: "#042f4f", b: "#008c7a", c: "#2d5bff", accent: "#6ee7b7" },
    sf: { a: "#190b4d", b: "#0f8f7d", c: "#d7264f", accent: "#f6c85f" },
    final: { a: "#061b46", b: "#003d77", c: "#0b1030", accent: "#d9b45f" }
  })[normalizeRoundId(roundId)] || { a: "#061b46", b: "#003d77", c: "#0b1030", accent: "#28d17c" };
}

async function renderRoundPoster(roundId) {
  const canvas = document.querySelector("#roundPosterCanvas");
  if (!canvas) return;
  const data = roundPosterData(roundId);
  if (!data) return;
  const context = canvas.getContext("2d");
  await drawRoundPoster(context, canvas.width, canvas.height, data);

  document.querySelector("#savePosterBtn")?.addEventListener("click", async () => {
    await savePosterImage(canvas, data);
  });

  document.querySelector("#sharePosterBtn")?.addEventListener("click", async () => {
    await sharePosterImage(canvas, data);
  });
}

async function savePosterImage(canvas, data) {
  const shared = await sharePosterImage(canvas, data, "احفظ الصورة من خيارات المشاركة");
  if (!shared) downloadPosterImage(canvas, data);
}

async function sharePosterImage(canvas, data, text = "") {
  const file = await posterCanvasFile(canvas, data);
  if (!file || !navigator.canShare || !navigator.share || !navigator.canShare({ files: [file] })) return false;
  await navigator.share({
    files: [file],
    title: data.title,
    text: text || `${data.title} - ${data.name}`
  });
  return true;
}

function posterCanvasFile(canvas, data) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (!blob) {
        resolve(null);
        return;
      }
      resolve(new File([blob], `worldcup-${data.roundId}-winner.png`, { type: "image/png" }));
    }, "image/png");
  });
}

function downloadPosterImage(canvas, data) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `worldcup-${data.roundId}-winner.png`;
  link.click();
}

async function drawRoundPoster(context, width, height, data) {
  if (!data.isFinal) {
    await drawLeaderPoster(context, width, height, data);
    return;
  }

  await drawFinalChampionPoster(context, width, height, data);
}

async function drawFinalChampionPoster(context, width, height, data) {
  const template = await loadPosterImage("assets/final-champion-poster-template.png");
  if (!template) {
    await drawGeneratedFinalPoster(context, width, height, data);
    return;
  }

  context.clearRect(0, 0, width, height);
  drawImageCover(context, template, 0, 0, width, height);
  await drawTemplateAvatar(context, data, width / 2, 644, 540);

  context.save();
  context.shadowColor = "rgba(0,0,0,.9)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 4;
  drawCenteredTextFit(context, posterNumber(data.total_points || data.points), width / 2, 286, 62, "#f9d77a", 900, 700);
  drawCenteredTextFit(context, "نقطة", width / 2, 336, 30, "rgba(255,255,255,.88)", 900, 420);
  drawCenteredTextFit(context, data.name, width / 2, 998, 60, "#ffffff", 900, 820);
  context.restore();
}

async function drawGeneratedFinalPoster(context, width, height, data) {
  const palette = data.palette;
  context.clearRect(0, 0, width, height);
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, palette.a);
  background.addColorStop(0.55, palette.c);
  background.addColorStop(1, "#02091f");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  drawConfetti(context, width, height, palette);
  drawStadium(context, width, height, palette);
  await drawPosterLogo(context, width);

  drawCenteredText(context, "تهانينا للفائز", width / 2, 345, 62, "#fff", 900);
  drawCenteredText(context, data.subtitle, width / 2, 410, 31, "rgba(255,255,255,.86)", 700);
  drawLaurelFrame(context, width / 2, 720, 235, palette);
  await drawWinnerAvatar(context, data, width / 2, 690, 220);

  drawRibbon(context, width / 2, 885, data.isFinal ? "البطل" : "المتصدر", palette);
  drawCenteredText(context, data.name, width / 2, 1025, 64, "#fff", 900);
  drawCenteredText(context, "إجمالي النقاط", width / 2, 1090, 26, "rgba(255,255,255,.82)", 700);
  drawCenteredText(context, posterNumber(data.points), width / 2, 1160, 70, palette.accent, 900);
  drawStatsPanel(context, data, width, 1320, palette);
  drawCenteredText(context, data.title, width / 2, 1615, 44, "#fff", 900);
  drawCenteredText(context, "شكراً لمشاركتك وتوقعاتك في بطولة العالم 2026", width / 2, 1670, 29, "rgba(255,255,255,.8)", 700);
}

async function drawLeaderPoster(context, width, height, data) {
  const template = await loadPosterImage("assets/leader-poster-template.png");
  context.clearRect(0, 0, width, height);

  if (!template) {
    await drawRoundPosterFallback(context, width, height, data);
    return;
  }

  const circle = {
    x: width / 2,
    y: 610,
    radius: 262
  };

  await drawTemplateAvatar(context, data, circle.x, circle.y, circle.radius * 2);
  context.drawImage(template, 0, 0, width, height);

  drawCenteredTextFit(context, `المتصدر ل${data.roundLabel} من بطولة التوقعات`, width / 2, 975, 38, "#ffffff", 900, 900);
  drawCenteredTextFit(context, data.name, width / 2, 1065, 58, "#f8d46d", 900, 820);
  drawLeaderPosterStats(context, width, data);
}

async function drawRoundPosterFallback(context, width, height, data) {
  const fallbackData = { ...data, isFinal: true };
  await drawRoundPoster(context, width, height, fallbackData);
}

async function drawTemplateAvatar(context, data, x, y, size) {
  context.save();
  context.beginPath();
  context.arc(x, y, size / 2, 0, Math.PI * 2);
  context.clip();

  const image = await loadPosterImage(data.avatar_url);
  if (image) {
    drawImageCover(context, image, x - size / 2, y - size / 2, size, size);
  } else {
    context.fillStyle = "#08143a";
    context.fillRect(x - size / 2, y - size / 2, size, size);
    drawCenteredText(context, initials(data.name), x, y + 8, 132, "rgba(255,255,255,.82)", 900);
  }

  context.restore();
}

function drawLeaderPosterStats(context, width, data) {
  const predictionTotal = (Number(data.correct) || 0) + (Number(data.wrong) || 0);
  const predictionAccuracy = predictionTotal ? Math.round((Number(data.correct) / predictionTotal) * 100) : 0;
  const triviaCorrect = Number(data.trivia_correct) || 0;
  const triviaTotal = triviaCorrect + (Number(data.trivia_wrong) || 0);
  const triviaAccuracy = triviaTotal ? Math.round((triviaCorrect / triviaTotal) * 100) : 0;
  const totalPoints = roundPoints(Number(data.total_points) || Number(data.points) || 0);

  const panelX = 118;
  const panelY = 1150;
  const panelW = width - panelX * 2;
  const panelH = 150;
  const halfW = panelW / 2;

  context.save();
  context.strokeStyle = "rgba(255, 255, 255, 0.45)";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(width / 2, panelY + 22);
  context.lineTo(width / 2, panelY + panelH - 22);
  context.stroke();
  context.restore();

  drawLeaderMetricBlock(context, panelX, panelY, halfW, panelH, {
    label: "التوقعات الصحيحة",
    value: `${Number(data.correct) || 0}/${predictionTotal}`,
    detail: `دقة التوقعات ${predictionAccuracy}%`
  });
  drawLeaderMetricBlock(context, panelX + halfW, panelY, halfW, panelH, {
    label: "إجابات س/ج الصحيحة",
    value: `${triviaCorrect}/${triviaTotal}`,
    detail: `دقة الإجابات ${triviaAccuracy}%`
  });

  const totalY = 1332;
  const totalH = 170;
  drawCenteredText(context, "إجمالي النقاط", width / 2, totalY + 45, 34, "#ffffff", 900);
  drawCenteredText(context, posterNumber(totalPoints), width / 2, totalY + 113, 74, "#ffffff", 900);

  drawCenteredTextFit(context, "تهانينا للمتصدر، وحظاً أوفر لباقي المتسابقين", width / 2, 1585, 38, "#ffffff", 900, 880);
  drawCenteredTextFit(context, "المنافسة مستمرة والقادم أقوى", width / 2, 1640, 34, "#f8d46d", 900, 840);
}

function drawLeaderMetricBlock(context, x, y, width, height, metric) {
  drawCenteredText(context, metric.label, x + width / 2, y + 35, 25, "#ffffff", 900);
  drawCenteredText(context, metric.value, x + width / 2, y + 83, 40, "#ffffff", 900);
  drawCenteredText(context, metric.detail, x + width / 2, y + 120, 23, "#ffffff", 800);
}

function drawCenteredText(context, text, x, y, size, color, weight = 700) {
  context.save();
  context.direction = "rtl";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.font = `${weight} ${size}px Tahoma, Arial, sans-serif`;
  context.fillText(text, x, y);
  context.restore();
}

function drawCenteredTextFit(context, text, x, y, size, color, weight = 700, maxWidth = Infinity) {
  context.save();
  context.direction = "rtl";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  let fontSize = size;
  do {
    context.font = `${weight} ${fontSize}px Tahoma, Arial, sans-serif`;
    if (context.measureText(String(text)).width <= maxWidth || fontSize <= 34) break;
    fontSize -= 2;
  } while (fontSize > 34);
  context.fillText(text, x, y);
  context.restore();
}

function drawConfetti(context, width, height, palette) {
  const colors = ["#ffffff", palette.accent, "#d7264f", "#009368", "#2f80ed"];
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 127) % width;
    const y = 20 + ((i * 83) % 500);
    context.save();
    context.translate(x, y);
    context.rotate((i % 9) * 0.25);
    context.fillStyle = colors[i % colors.length];
    context.globalAlpha = 0.35 + (i % 5) * 0.09;
    context.fillRect(-5, -10, 10, 20);
    context.restore();
  }
}

function drawStadium(context, width, height, palette) {
  const glow = context.createRadialGradient(width / 2, 1180, 40, width / 2, 1180, 750);
  glow.addColorStop(0, "rgba(47,128,237,.35)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = glow;
  context.fillRect(0, 600, width, 720);
  context.strokeStyle = "rgba(255,255,255,.18)";
  context.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    context.beginPath();
    context.ellipse(width / 2, 1140 + i * 22, 520 + i * 25, 120 + i * 12, 0, Math.PI, Math.PI * 2);
    context.stroke();
  }
  context.fillStyle = "rgba(255,255,255,.75)";
  for (let i = 0; i < 48; i += 1) {
    const x = 80 + (i % 24) * 40;
    const y = 900 + Math.floor(i / 24) * 58;
    context.beginPath();
    context.arc(x, y, 2.8, 0, Math.PI * 2);
    context.fill();
  }
  context.strokeStyle = palette.b;
  context.lineWidth = 26;
  context.beginPath();
  context.arc(-40, 1470, 430, -1.15, -0.15);
  context.stroke();
  context.strokeStyle = "#d7264f";
  context.beginPath();
  context.arc(width + 40, 1470, 430, Math.PI + 0.15, Math.PI + 1.15);
  context.stroke();
}

async function drawPosterLogo(context, width) {
  const logo = await loadPosterImage("assets/worldcup-logo-wide.jpg");
  if (logo) {
    context.drawImage(logo, width / 2 - 230, 125, 460, 142);
  } else {
    drawCenteredText(context, "FIFA WORLD CUP 2026", width / 2, 185, 36, "#fff", 900);
  }
}

function drawLaurelFrame(context, x, y, radius, palette) {
  context.save();
  context.strokeStyle = "#d9b45f";
  context.lineWidth = 12;
  context.beginPath();
  context.arc(x, y, radius, 0.15, Math.PI * 1.85);
  context.stroke();
  context.fillStyle = "#f6d77b";
  for (let side of [-1, 1]) {
    for (let i = 0; i < 15; i += 1) {
      const angle = side === -1 ? 2.55 + i * 0.075 : 0.58 - i * 0.075;
      const lx = x + Math.cos(angle) * (radius + 24);
      const ly = y - Math.sin(angle) * (radius + 24);
      context.save();
      context.translate(lx, ly);
      context.rotate(side * -0.75 + i * side * 0.03);
      context.beginPath();
      context.ellipse(0, 0, 12, 28, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }
  context.fillStyle = "#f6d77b";
  context.beginPath();
  context.moveTo(x - 58, y - radius - 18);
  context.lineTo(x - 25, y - radius - 80);
  context.lineTo(x, y - radius - 28);
  context.lineTo(x + 25, y - radius - 80);
  context.lineTo(x + 58, y - radius - 18);
  context.closePath();
  context.fill();
  context.restore();
}

async function drawWinnerAvatar(context, data, x, y, size) {
  context.save();
  context.beginPath();
  context.arc(x, y, size / 2, 0, Math.PI * 2);
  context.clip();
  const image = await loadPosterImage(data.avatar_url);
  if (image) {
    drawImageCover(context, image, x - size / 2, y - size / 2, size, size);
  } else {
    const gradient = context.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
    gradient.addColorStop(0, "#102a67");
    gradient.addColorStop(1, "#03112d");
    context.fillStyle = gradient;
    context.fillRect(x - size / 2, y - size / 2, size, size);
    drawCenteredText(context, initials(data.name), x, y + 8, 72, "rgba(255,255,255,.72)", 900);
  }
  context.restore();
  context.strokeStyle = "#f6d77b";
  context.lineWidth = 8;
  context.beginPath();
  context.arc(x, y, size / 2 + 4, 0, Math.PI * 2);
  context.stroke();
}

function drawImageCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (image.width - sw) / 2;
  const sy = (image.height - sh) / 2;
  context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawRibbon(context, x, y, text, palette) {
  const gradient = context.createLinearGradient(x - 250, y, x + 250, y);
  gradient.addColorStop(0, "#05173e");
  gradient.addColorStop(0.5, palette.a);
  gradient.addColorStop(1, "#05173e");
  context.fillStyle = gradient;
  roundRectPath(context, x - 260, y - 48, 520, 96, 30);
  context.fill();
  context.strokeStyle = "#d9b45f";
  context.lineWidth = 3;
  context.stroke();
  drawCenteredText(context, text, x, y + 2, 58, "#f6d77b", 900);
}

function drawStatsPanel(context, data, width, y, palette) {
  const x = 72;
  const w = width - 144;
  const h = 215;
  context.strokeStyle = "rgba(255,255,255,.24)";
  context.lineWidth = 2;
  context.fillStyle = "rgba(3,13,42,.42)";
  roundRectPath(context, x, y, w, h, 26);
  context.fill();
  context.stroke();
  const stats = [
    { icon: "◎", value: `${data.accuracy}%`, label: "دقة التوقعات" },
    { icon: "♕", value: data.correctLabel, label: "جولات صحيحة" },
    { icon: "↗", value: String(data.rank), label: data.isFinal ? "الترتيب النهائي" : "ترتيب الدور" }
  ];
  stats.forEach((item, index) => {
    const cx = x + w - (index + 0.5) * (w / 3);
    if (index) {
      context.strokeStyle = "rgba(255,255,255,.15)";
      context.beginPath();
      context.moveTo(x + w - index * (w / 3), y + 35);
      context.lineTo(x + w - index * (w / 3), y + h - 35);
      context.stroke();
    }
    drawCenteredText(context, item.icon, cx, y + 58, 50, "#fff", 800);
    drawCenteredText(context, item.value, cx, y + 118, 43, palette.accent, 900);
    drawCenteredText(context, item.label, cx, y + 168, 25, "rgba(255,255,255,.78)", 700);
  });
}

function roundRectPath(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function posterNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value || 0);
}

function roundPoints(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function loadPosterImage(src) {
  return new Promise(resolve => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function voterModal(matchId) {
  const match = state.matches.find(item => item.id === matchId);
  if (!match) return "";
  const voted = (match.voted_users || []).map(hydrateParticipantAvatar);
  const missing = (match.missing_users || []).map(hydrateParticipantAvatar);
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
  const approved = state.participants
    .filter(user => user.participant_status === "approved")
    .map(hydrateParticipantAvatar);
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
          <div class="vote-result-teams">
            ${voteResultTeamView(match.team_a, match.team_a_flag)}
            <span class="vote-result-vs">ضد</span>
            ${voteResultTeamView(match.team_b, match.team_b_flag)}
          </div>
          <span class="vote-result-date">${formatAdminMatchDate(match.starts_at)}</span>
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

function voteResultTeamView(name, flagUrl) {
  const flag = flagUrl ? `<img src="${escapeHtml(flagUrl)}" alt="${escapeHtml(name)}" />` : "";
  return `
    <div class="vote-result-team">
      <span class="vote-result-flag">${flag}</span>
      <strong>${escapeHtml(name)}</strong>
    </div>
  `;
}

function voteResultRow(row, match) {
  const picked = row.prediction?.winner || "لم يصوت";
  const percentText = row.prediction && isCustomPercentMatch(match)
    ? ` | ${winnerPercentValue(row.prediction)}%`
    : "";
  const pickedClass = row.prediction
    ? row.prediction.winner === match.team_a ? "team-a" : "team-b"
    : "missing";
  return `
    <div class="vote-result-row">
      <span class="vote-result-player">${avatarTile(row.user, "vote-avatar")}<strong>${escapeHtml(row.user.name)}</strong></span>
      <span class="vote-result-pick ${pickedClass}">${escapeHtml(picked)}${percentText}</span>
      <span class="vote-result-joker">${row.prediction?.is_joker ? "×2" : "-"}</span>
    </div>
  `;
}

function voterRow(user) {
  const voter = hydrateParticipantAvatar(user);
  return `
    <div class="voter-row">
      ${avatarTile(voter, "avatar-small")}
      <div>
        <strong>${escapeHtml(voter.name)}</strong>
      </div>
    </div>
  `;
}

function hydrateParticipantAvatar(user) {
  if (!user?.id || user.avatar_url) return user;
  const standingUser = state.standings.find(row => row.id === user.id);
  const participantUser = state.participants.find(row => row.id === user.id);
  return {
    ...user,
    avatar_url: standingUser?.avatar_url || participantUser?.avatar_url || ""
  };
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
  const diff = Math.max(0, new Date(value).getTime() - serverNowMs());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function countdownAttrs(value, prefix = "", expiredText = "مغلق") {
  return `data-countdown="${escapeHtml(value)}" data-countdown-prefix="${escapeHtml(prefix)}" data-countdown-expired-text="${escapeHtml(expiredText)}"`;
}

function updateCountdowns() {
  let expired = false;
  document.querySelectorAll("[data-countdown]").forEach(element => {
    const deadline = element.dataset.countdown;
    const prefix = element.dataset.countdownPrefix || "";
    const expiredText = element.dataset.countdownExpiredText || "مغلق";
    const isExpired = new Date(deadline).getTime() <= serverNowMs();
    element.textContent = isExpired ? expiredText : `${prefix}${countdownText(deadline)}`;
    element.classList.toggle("expired", isExpired);
    if (isExpired && element.dataset.wasExpired !== "true") expired = true;
    element.dataset.wasExpired = isExpired ? "true" : "false";
  });
  return expired;
}

function serverNowMs() {
  return Date.now() + (state.serverNowOffsetMs || 0);
}

function isVoteClosed(match) {
  return !!match.winner || new Date(match.vote_ends_at).getTime() <= serverNowMs();
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
      writeActiveTab(activeTab);
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
    writeActiveTab(null);
    localStorage.removeItem(STATE_CACHE_KEY);
    activeTab = defaultTabForUser(null);
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

  document.querySelectorAll("[data-modal-close], [data-detail-modal-close], [data-poster-modal-close]").forEach(backdrop => backdrop.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.profileOpen = false;
      state.voterModalMatch = null;
      state.editModalMatch = null;
      state.resultModalMatch = null;
      state.posterRound = null;
      state.detailParticipantId = null;
      state.championListOpen = false;
      state.addAdminDecisionOpen = false;
      state.editAdminDecisionId = null;
      state.adminDecisionModalError = "";
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

  if (state.posterRound) {
    requestAnimationFrame(() => renderRoundPoster(state.posterRound));
  }

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

  document.querySelector("[data-round-poster]")?.addEventListener("click", () => {
    state.posterRound = normalizeRoundId(activeRound);
    render();
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

  document.querySelector("[data-poster-close]")?.addEventListener("click", () => {
    state.posterRound = null;
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

  document.querySelectorAll("[data-trivia-results]").forEach(button => {
    button.addEventListener("click", () => {
      state.triviaResultsRound = button.dataset.triviaResults;
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

  document.querySelector("[data-trivia-results-close]")?.addEventListener("click", () => {
    state.triviaResultsRound = null;
    render();
  });

  document.querySelector("#championListsBtn")?.addEventListener("click", () => {
    state.championListOpen = true;
    render();
  });

  document.querySelector("[data-champion-list-x]")?.addEventListener("click", () => {
    state.championListOpen = false;
    render();
  });

  document.querySelector("#addAdminDecisionToggle")?.addEventListener("click", () => {
    state.addAdminDecisionOpen = true;
    state.editAdminDecisionId = null;
    state.adminDecisionModalError = "";
    render();
  });

  document.querySelectorAll("[data-admin-decision-edit]").forEach(button => {
    button.addEventListener("click", () => {
      state.addAdminDecisionOpen = true;
      state.editAdminDecisionId = button.dataset.adminDecisionEdit;
      state.adminDecisionModalError = "";
      render();
    });
  });

  document.querySelector("[data-admin-decision-close]")?.addEventListener("click", () => {
    state.addAdminDecisionOpen = false;
    state.editAdminDecisionId = null;
    state.adminDecisionModalError = "";
    render();
  });

  document.querySelector("[data-admin-decision-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.addAdminDecisionOpen = false;
      state.editAdminDecisionId = null;
      state.adminDecisionModalError = "";
      render();
    }
  });

  document.querySelector("#adminDecisionForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    try {
      const wasEditing = !!state.editAdminDecisionId;
      const payload = await api("admin-decision", {
        method: "POST",
        body: JSON.stringify({
          userId: state.currentUser.id,
          decisionId: state.editAdminDecisionId,
          title: form.elements.title.value.trim(),
          details: form.elements.details.value.trim()
        })
      });
      if (payload.decision?.id) {
        const decision = payload.decision;
        state.adminDecisions = state.adminDecisions.some(item => item.id === decision.id)
          ? state.adminDecisions.map(item => item.id === decision.id ? { ...item, ...decision } : item)
          : [decision, ...state.adminDecisions];
      }
      state.notice = wasEditing ? "تم تعديل القرار الإداري." : "تمت إضافة القرار الإداري.";
      state.addAdminDecisionOpen = false;
      state.editAdminDecisionId = null;
      state.adminDecisionModalError = "";
      render();
      loadData({ silent: true }).catch(() => {});
    } catch (error) {
      state.adminDecisionModalError = error.message || "تعذر حفظ القرار الإداري";
      render();
    } finally {
      if (button) button.disabled = false;
    }
  });

  document.querySelector("[data-admin-decision-delete]")?.addEventListener("click", async event => {
    const decisionId = event.currentTarget.dataset.adminDecisionDelete;
    if (!confirm("حذف القرار الإداري؟")) return;
    try {
      await api("admin-decision-delete", {
        method: "POST",
        body: JSON.stringify({ userId: state.currentUser.id, decisionId })
      });
      state.adminDecisions = state.adminDecisions.filter(item => item.id !== decisionId);
      state.notice = "تم حذف القرار الإداري.";
      state.addAdminDecisionOpen = false;
      state.editAdminDecisionId = null;
      state.adminDecisionModalError = "";
      render();
      loadData({ silent: true }).catch(() => {});
    } catch (error) {
      state.adminDecisionModalError = error.message || "تعذر حذف القرار الإداري";
      render();
    }
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

  document.querySelector("[data-trivia-results-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.triviaResultsRound = null;
      render();
    }
  });

  document.querySelector("[data-champion-list-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.championListOpen = false;
      render();
    }
  });

  document.querySelector("#addTriviaToggle")?.addEventListener("click", () => {
    state.addTriviaOpen = true;
    state.editTriviaQuestionId = null;
    state.triviaModalError = "";
    render();
  });

  document.querySelector("#addTriviaRoundToggle")?.addEventListener("click", () => {
    state.addTriviaRoundOpen = true;
    state.editTriviaRoundId = null;
    state.triviaRoundModalError = "";
    render();
  });

  document.querySelectorAll("[data-trivia-round-edit]").forEach(button => {
    button.addEventListener("click", () => {
      state.addTriviaRoundOpen = true;
      state.editTriviaRoundId = button.dataset.triviaRoundEdit;
      state.triviaRoundModalError = "";
      render();
    });
  });

  document.querySelector("[data-trivia-round-close]")?.addEventListener("click", () => {
    state.addTriviaRoundOpen = false;
    state.editTriviaRoundId = null;
    state.triviaRoundModalError = "";
    render();
  });

  document.querySelector("[data-trivia-round-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.addTriviaRoundOpen = false;
      state.editTriviaRoundId = null;
      state.triviaRoundModalError = "";
      render();
    }
  });

  document.querySelector("[data-trivia-close]")?.addEventListener("click", () => {
    state.addTriviaOpen = false;
    state.editTriviaQuestionId = null;
    state.triviaModalError = "";
    render();
  });

  document.querySelector("[data-trivia-modal-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.addTriviaOpen = false;
      state.editTriviaQuestionId = null;
      state.triviaModalError = "";
      render();
    }
  });

  document.querySelectorAll("[data-trivia-page-tab]").forEach(button => {
    button.addEventListener("click", () => {
      state.organizerTriviaTab = button.dataset.triviaPageTab || "questions";
      render();
    });
  });

  document.querySelectorAll("[data-trivia-difficulty-tab]").forEach(button => {
    button.addEventListener("click", () => {
      state.triviaQuestionDifficulty = normalizeDifficulty(button.dataset.triviaDifficultyTab);
      render();
    });
  });
  setupTriviaQuestionAutoLoad();

  document.querySelectorAll("[data-trivia-round-open]").forEach(button => {
    button.addEventListener("click", () => {
      state.activeTriviaRoundKey = button.dataset.triviaRoundOpen;
      render();
    });
  });

  document.querySelector("[data-trivia-participant-round-x]")?.addEventListener("click", () => {
    state.activeTriviaRoundKey = null;
    render();
  });

  document.querySelector("[data-trivia-participant-round-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.activeTriviaRoundKey = null;
      render();
    }
  });

  document.querySelector("#triviaQuestionForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    try {
      const wasEditing = !!state.editTriviaQuestionId;
      const payload = await api("trivia-question", {
        method: "POST",
        body: JSON.stringify({
          userId: state.currentUser.id,
          questionId: state.editTriviaQuestionId,
          difficulty: form.elements.difficulty.value,
          questionText: form.elements.questionText.value.trim(),
          optionA: form.elements.optionA.value.trim(),
          optionB: form.elements.optionB.value.trim(),
          optionC: form.elements.optionC.value.trim(),
          optionD: form.elements.optionD.value.trim(),
          correctOption: form.elements.correctOption.value,
          timeLimitSeconds: form.elements.timeLimitSeconds.value
        })
      });
      if (payload.question?.id) {
        const question = payload.question;
        const previousQuestion = state.triviaQuestions.find(item => item.id === question.id);
        const exists = state.triviaQuestions.some(item => item.id === question.id);
        state.triviaQuestions = exists
          ? state.triviaQuestions.map(item => item.id === question.id ? { ...item, ...question } : item)
          : [question, ...state.triviaQuestions];
        state.triviaQuestionDifficulty = normalizeDifficulty(question.difficulty);
        if (!exists) bumpTriviaQuestionTotal(question.difficulty, 1);
        if (exists && normalizeDifficulty(previousQuestion?.difficulty) !== normalizeDifficulty(question.difficulty)) {
          bumpTriviaQuestionTotal(previousQuestion?.difficulty, -1);
          bumpTriviaQuestionTotal(question.difficulty, 1);
        }
      }
      state.notice = wasEditing ? "تم تعديل السؤال." : "تمت إضافة السؤال.";
      state.addTriviaOpen = false;
      state.editTriviaQuestionId = null;
      state.triviaModalError = "";
      form.reset();
      render();
      loadData({ silent: true }).catch(() => {});
    } catch (error) {
      state.triviaModalError = error.message || "تعذر حفظ السؤال";
      render();
    } finally {
      if (button) button.disabled = false;
    }
  });

  document.querySelector("#triviaRoundForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    try {
      const wasEditing = !!state.editTriviaRoundId;
      const payload = await api("trivia-round", {
        method: "POST",
        body: JSON.stringify({
          userId: state.currentUser.id,
          roundRecordId: state.editTriviaRoundId,
          title: form.elements.title.value.trim(),
          roundId: form.elements.roundId.value,
          opensAt: datetimeLocalToIso(form.elements.opensAt.value),
          easyPoints: form.elements.easyPoints.value,
          mediumPoints: form.elements.mediumPoints.value,
          hardPoints: form.elements.hardPoints.value
        })
      });
      if (payload.round?.id) {
        const round = payload.round;
        state.triviaSettings = state.triviaSettings.some(item => item.id === round.id)
          ? state.triviaSettings.map(item => item.id === round.id ? { ...item, ...round } : item)
          : [...state.triviaSettings, round];
      }
      state.notice = wasEditing ? "تم تعديل الجولة." : "تمت إضافة الجولة.";
      state.addTriviaRoundOpen = false;
      state.editTriviaRoundId = null;
      state.triviaRoundModalError = "";
      render();
      loadData({ silent: true }).catch(() => {});
    } catch (error) {
      state.triviaRoundModalError = error.message || "تعذر حفظ الجولة";
      render();
    } finally {
      if (button) button.disabled = false;
    }
  });

  document.querySelectorAll("[data-trivia-round-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("حذف الجولة؟")) return;
      try {
        await api("trivia-round-delete", {
          method: "POST",
          body: JSON.stringify({ userId: state.currentUser.id, roundId: button.dataset.triviaRoundDelete })
        });
        state.triviaSettings = state.triviaSettings.filter(item => item.id !== button.dataset.triviaRoundDelete);
        state.notice = "تم حذف الجولة.";
        state.addTriviaRoundOpen = false;
        state.editTriviaRoundId = null;
        state.triviaRoundModalError = "";
        render();
        loadData({ silent: true }).catch(() => {});
      } catch (error) {
        state.error = error.message || "تعذر حذف الجولة";
        render();
      }
    });
  });

  document.querySelectorAll("[data-trivia-edit]").forEach(button => {
    button.addEventListener("click", () => {
      state.editTriviaQuestionId = button.dataset.triviaEdit;
      const question = state.triviaQuestions.find(item => item.id === state.editTriviaQuestionId);
      state.triviaQuestionDifficulty = normalizeDifficulty(question?.difficulty);
      state.addTriviaOpen = true;
      state.triviaModalError = "";
      render();
    });
  });

  document.querySelectorAll("[data-trivia-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      const questionText = button.dataset.triviaQuestion || "هذا السؤال";
      if (!confirm(`سيتم حذف ${questionText} وكل مشاركات اللاعبين المرتبطة به. هل تريد المتابعة؟`)) return;
      try {
        await api("trivia-question-delete", {
          method: "POST",
          body: JSON.stringify({ userId: state.currentUser.id, questionId: button.dataset.triviaDelete })
        });
        state.notice = "تم حذف السؤال.";
        state.addTriviaOpen = false;
        state.editTriviaQuestionId = null;
        state.triviaModalError = "";
        await loadData({ silent: true });
      } catch (error) {
        state.error = error.message || "تعذر حذف السؤال";
        render();
      }
    });
  });

  document.querySelectorAll("[data-trivia-start]").forEach(button => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      await startTriviaAssignment(button.dataset.triviaStart);
    });
  });

  document.querySelectorAll("[data-trivia-autostart]").forEach(element => {
    const nextId = element.dataset.triviaAutostart;
    const expiredId = element.dataset.triviaExpireFirst;
    setTimeout(async () => {
      await expireTriviaAssignment(expiredId);
      await startTriviaAssignment(nextId);
    }, 350);
  });

  document.querySelectorAll("[data-trivia-expire-only]").forEach(element => {
    setTimeout(async () => {
      await expireTriviaAssignment(element.dataset.triviaExpireOnly);
    }, 350);
  });

  document.querySelectorAll("[data-trivia-answer]").forEach(button => {
    button.addEventListener("click", async () => {
      const assignmentId = button.dataset.triviaAnswer;
      const selectedOption = button.dataset.option;
      const previous = state.triviaAssignments.find(item => item.id === assignmentId);
      try {
        updateTriviaAssignment(assignmentId, { selected_option: selectedOption, _pendingAnswer: true });
        render();
        const payload = await api("trivia-answer", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            assignmentId,
            selectedOption
          })
        });
        state.notice = payload.isCorrect ? "إجابة صحيحة. تمت إضافة النقاط." : "إجابة غير صحيحة.";
        updateTriviaAssignment(assignmentId, { ...(payload.assignment || {}), _pendingAnswer: false });
        render();
        const next = nextTriviaAssignment(triviaRoundAssignmentsFor(previous), payload.assignment || previous);
        if (next) setTimeout(() => startTriviaAssignment(next.id), 350);
        else setTimeout(() => loadData({ silent: true }), 500);
      } catch (error) {
        if (previous) updateTriviaAssignment(assignmentId, previous);
        state.error = error.message || "تعذر حفظ الإجابة";
        render();
      }
    });
  });

  document.querySelectorAll("[data-champion-option]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      try {
        await api("champion-option", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            optionType: form.dataset.championOption,
            name: form.elements.name.value.trim()
          })
        });
        state.notice = form.dataset.championOption === "team" ? "تمت إضافة الفريق." : "تمت إضافة الهداف.";
        await loadData({ silent: true });
        state.championListOpen = true;
      } catch (error) {
        state.error = error.message || "تعذر حفظ القائمة";
        render();
      } finally {
        button.disabled = false;
      }
    });
  });

  document.querySelectorAll("[data-champion-add-pick]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      button.textContent = "جارٍ";
      try {
        await api("champion-pick", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            participantId: form.elements.participantId.value,
            championTeam: form.elements.championTeam.value,
            topScorer: form.elements.topScorer.value
          })
        });
        state.notice = "تمت إضافة الترشيح.";
        await loadData({ silent: true });
        state.championListOpen = false;
      } catch (error) {
        state.error = error.message || "تعذر حفظ الترشيح";
        render();
      } finally {
        button.disabled = false;
        button.textContent = "إضافة ترشيح";
      }
    });
  });

  bindProfileForm();
  const matchFlagState = bindMatchFlagFields();
  bindInlineFlagInputs();
  syncCountdownTimer();

  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      syncActiveTab({ persist: true });
      state.triviaResultsRound = null;
      render();
    });
  });

  if (activeTab === "standings") {
    requestAnimationFrame(focusStandingsPredictionSummary);
  }

  document.querySelectorAll("[data-round]").forEach(button => {
    button.addEventListener("click", () => {
      activeRound = button.dataset.round;
      userSelectedRound = true;
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

  document.querySelectorAll("[data-participant-avatar]").forEach(input => {
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const label = input.closest(".avatar-edit-btn");
      const previousText = label?.childNodes?.[0]?.textContent || "";
      if (label) label.childNodes[0].textContent = "جاري...";
      try {
        const avatarUrl = await imageFileToDataUrl(file, 180);
        await api("participant-avatar", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            participantId: input.dataset.participantAvatar,
            avatarUrl
          })
        });
        state.notice = "تم تحديث صورة المتسابق.";
        await loadData({ silent: true });
      } catch (error) {
        state.error = error.message || "تعذر تحديث صورة المتسابق";
        render();
      } finally {
        input.value = "";
        if (label) label.childNodes[0].textContent = previousText || "تغيير الصورة";
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
      const match = state.matches.find(item => item.id === matchId);
      if (isCustomPercentMatch(match)) {
        setOptimisticPrediction(matchId, winner, isJoker, null, true);
        state.notice = "حدد نسبة نقاط الفائز ثم اضغط حفظ الترشيح.";
        state.error = "";
        render();
        return;
      }
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

  document.querySelectorAll("[data-winner-percent]").forEach(input => {
    input.addEventListener("change", () => {
      const matchId = input.dataset.winnerPercent;
      const prediction = normalizePrediction(state.predictions[matchId]);
      if (!prediction) return;
      const value = Math.min(90, Math.max(60, Number(input.value) || 90));
      const next = { ...state.predictions };
      next[matchId] = { ...prediction, winner_percent: value / 100 };
      state.predictions = next;
      render();
    });
  });

  document.querySelectorAll("[data-save-percent-pick]").forEach(button => {
    button.addEventListener("click", async () => {
      const matchId = button.dataset.savePercentPick;
      const prediction = normalizePrediction(state.predictions[matchId]);
      const winner = prediction?.winner || button.dataset.team;
      if (!winner) {
        state.notice = "اختر الفائز أولاً.";
        render();
        return;
      }
      const percentInput = document.querySelector(`[data-winner-percent="${matchId}"]`);
      const winnerPercent = Math.round(Number(percentInput?.value) || winnerPercentValue(prediction));
      if (winnerPercent < 60 || winnerPercent > 90) {
        state.error = "نسبة ترشيح الفائز يجب أن تكون بين 60% و90%.";
        render();
        return;
      }
      const requestSeq = ++predictionSaveSeq;
      const previous = normalizePrediction(prediction);
      setOptimisticPrediction(matchId, winner, !!prediction?.is_joker, winnerPercent / 100, false);
      state.error = "";
      render();
      try {
        await api("prediction", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            matchId,
            winner,
            winnerPercent,
            isJoker: !!prediction?.is_joker
          })
        });
        if (requestSeq !== predictionSaveSeq) return;
        state.notice = "تم حفظ ترشيحك ونسبة نقاط الفائز.";
        await loadData({ silent: true });
      } catch (error) {
        if (requestSeq === predictionSaveSeq) restorePrediction(matchId, previous);
        state.error = error.message || "تعذر حفظ الترشيح";
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
        roundId: normalizeRoundId(activeRound),
        teamA: document.querySelector("#teamA").value.trim(),
        teamB: document.querySelector("#teamB").value.trim(),
        teamAFlag: matchFlagState.teamAFlag,
        teamBFlag: matchFlagState.teamBFlag,
        startsAt: datetimeLocalToIso(document.querySelector("#startsAt").value),
        voteEndsAt: datetimeLocalToIso(document.querySelector("#voteEndsAt").value)
      };
      await api("match", { method: "POST", body: JSON.stringify(match) });
      activeRound = normalizeRoundId(match.roundId);
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
        roundId: normalizeRoundId(activeRound),
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
  const hasOpenMatch = state.currentUser && state.matches.some(match => !isVoteClosed(match));
  const hasPendingTriviaOpen = state.currentUser && state.triviaAssignments.some(item => {
    if (triviaAssignmentComplete(item)) return false;
    const setting = triviaRoundSetting(item.round_id, item.question_round);
    return triviaRoundOpenState(setting).locked;
  });
  const hasOpenTrivia = state.currentUser && state.triviaAssignments.some(item => {
    if (!item.started_at || item.answered_at) return false;
    return new Date(item.started_at).getTime() + triviaTimeLimitSeconds(item) * 1000 > serverNowMs();
  });
  updateCountdowns();
  if ((hasOpenMatch || hasOpenTrivia || hasPendingTriviaOpen) && !countdownTimer) {
    countdownTimer = setInterval(() => {
      if (!state.currentUser) return;
      const expired = updateCountdowns();
      if (expired) handleExpiredTriviaQuestions();
      if (expired && !hasOpenModal()) render();
    }, 1000);
  }
  if (!hasOpenMatch && !hasOpenTrivia && !hasPendingTriviaOpen && countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function handleExpiredTriviaQuestions() {
  state.triviaAssignments
    .filter(item => triviaAssignmentExpired(item))
    .forEach(item => {
      const next = nextTriviaAssignment(triviaRoundAssignmentsFor(item), item);
      expireTriviaAssignment(item.id).then(() => {
        if (next) startTriviaAssignment(next.id);
      });
    });
}

function hasOpenModal() {
  return !!(state.profileOpen || state.voterModalMatch || state.voteResultsModalMatch || state.triviaResultsRound || state.editModalMatch || state.resultModalMatch || state.posterRound || state.detailParticipantId || state.addMatchOpen || state.addTriviaOpen || state.addTriviaRoundOpen || state.addAdminDecisionOpen || state.activeTriviaRoundKey);
}

function focusStandingsPredictionSummary() {
  const scroll = document.querySelector("[data-standings-scroll]");
  const anchor = document.querySelector("[data-standings-summary-anchor]");
  if (!scroll || !anchor) return;
  anchor.scrollIntoView({ block: "nearest", inline: "start" });
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

function setupTriviaQuestionAutoLoad() {
  const marker = document.querySelector("[data-trivia-load-more]");
  if (!marker || state.currentUser?.role !== "organizer" || activeTab !== "trivia" || state.organizerTriviaTab === "rounds") return;
  const difficulty = normalizeDifficulty(marker.dataset.triviaLoadMore);
  const load = () => loadMoreTriviaQuestions(difficulty);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: "240px" });
    observer.observe(marker);
    return;
  }
  const onScroll = () => {
    if (!document.body.contains(marker)) {
      window.removeEventListener("scroll", onScroll);
      return;
    }
    if (marker.getBoundingClientRect().top < window.innerHeight + 240) {
      window.removeEventListener("scroll", onScroll);
      load();
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

async function loadMoreTriviaQuestions(difficulty) {
  const normalized = normalizeDifficulty(difficulty);
  const page = triviaQuestionPageState(normalized);
  if (state.triviaQuestionsLoadingMore || !page.hasMore) return;
  state.triviaQuestionsLoadingMore = true;
  render();
  try {
    const offset = state.triviaQuestions.filter(item => normalizeDifficulty(item.difficulty) === normalized).length;
    const payload = await api(`trivia-questions&userId=${encodeURIComponent(state.currentUser.id)}&difficulty=${encodeURIComponent(normalized)}&offset=${offset}&limit=10`);
    const existing = new Set(state.triviaQuestions.map(item => item.id));
    const incoming = (payload.questions || []).filter(item => item?.id && !existing.has(item.id));
    state.triviaQuestions = [...state.triviaQuestions, ...incoming];
    state.triviaQuestionPages = {
      ...state.triviaQuestionPages,
      [normalized]: {
        loaded: offset + incoming.length,
        total: Number(payload.total ?? page.total ?? offset + incoming.length),
        hasMore: !!payload.hasMore
      }
    };
    writeStateCache(stateCachePayload());
  } catch (error) {
    state.error = error.message || "تعذر تحميل المزيد من الأسئلة";
  } finally {
    state.triviaQuestionsLoadingMore = false;
    render();
  }
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

function applyStatePayload(payload = {}) {
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
  state.championOptions = payload.championOptions || [];
  state.championPicks = payload.championPicks || [];
  state.triviaQuestions = payload.triviaQuestions || [];
  state.triviaQuestionPages = payload.triviaQuestionPages || {};
  state.triviaQuestionsLoadingMore = false;
  state.triviaAssignments = payload.triviaAssignments || [];
  state.allTriviaAssignments = payload.allTriviaAssignments || [];
  state.triviaSettings = payload.triviaSettings || [];
  state.adminDecisions = payload.adminDecisions || [];
  state.participants = payload.participants || [];
  state.organizers = payload.organizers || [];
  if (payload.serverNow) state.serverNowOffsetMs = new Date(payload.serverNow).getTime() - Date.now();
  syncActiveTab({ persist: true });
  syncParticipantActiveRound();
}

function readStateCache(user) {
  if (!user?.id) return null;
  try {
    const cached = JSON.parse(localStorage.getItem(STATE_CACHE_KEY) || "null");
    if (cached?.userId !== user.id || !cached.payload) return null;
    return cached.payload;
  } catch {
    return null;
  }
}

function writeStateCache(payload) {
  if (!state.currentUser?.id || !payload) return;
  try {
    localStorage.setItem(STATE_CACHE_KEY, JSON.stringify({
      userId: state.currentUser.id,
      savedAt: new Date().toISOString(),
      payload
    }));
  } catch {
    localStorage.removeItem(STATE_CACHE_KEY);
  }
}

function stateCachePayload() {
  return {
    user: state.currentUser,
    matches: state.matches,
    standings: state.standings,
    predictions: state.predictions,
    matchPoints: state.matchPoints,
    allPredictions: state.allPredictions,
    allMatchPoints: state.allMatchPoints,
    allMatchStakes: state.allMatchStakes,
    championOptions: state.championOptions,
    championPicks: state.championPicks,
    triviaQuestions: state.triviaQuestions,
    triviaQuestionPages: state.triviaQuestionPages,
    triviaAssignments: state.triviaAssignments,
    allTriviaAssignments: state.allTriviaAssignments,
    triviaSettings: state.triviaSettings,
    adminDecisions: state.adminDecisions,
    participants: state.participants,
    organizers: state.organizers,
    serverNow: new Date(Date.now() + state.serverNowOffsetMs).toISOString()
  };
}

function hydrateStateFromCache() {
  const cached = readStateCache(state.currentUser);
  if (!cached) return false;
  applyStatePayload(cached);
  state.loading = false;
  state.error = "";
  return true;
}

function defaultTabForUser(user) {
  return user?.role === "organizer" ? "manage" : "matches";
}

function allowedTabsForUser(user) {
  const sharedTabs = ["standings", "laws", "trivia"];
  if (user?.role === "organizer") return ["manage", "participants", "champions", "admin-decisions", ...sharedTabs];
  return ["matches", ...sharedTabs];
}

function normalizeActiveTabForUser(user, tab) {
  const candidate = String(tab || "").trim();
  return allowedTabsForUser(user).includes(candidate) ? candidate : defaultTabForUser(user);
}

function readActiveTab(user) {
  try {
    return normalizeActiveTabForUser(user, localStorage.getItem(ACTIVE_TAB_KEY));
  } catch {
    return defaultTabForUser(user);
  }
}

function writeActiveTab(tab) {
  if (tab) localStorage.setItem(ACTIVE_TAB_KEY, tab);
  else localStorage.removeItem(ACTIVE_TAB_KEY);
}

function syncActiveTab(options = {}) {
  activeTab = normalizeActiveTabForUser(state.currentUser, activeTab);
  if (options.persist) writeActiveTab(activeTab);
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
  return rounds.find(round => round.id === normalizeRoundId(id))?.name || id;
}

function normalizeRoundId(id) {
  return id === "r8" ? "qf" : id;
}

function normalizeDifficulty(value) {
  const difficulty = String(value || "easy").toLowerCase();
  return ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "easy";
}

function roundMatchesActiveTab(match, roundId) {
  return normalizeRoundId(match.round_id) === normalizeRoundId(roundId);
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

const bootedFromCache = hydrateStateFromCache();
if (bootedFromCache) render();
loadData({ silent: bootedFromCache });
