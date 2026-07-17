const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
let mainChromeScrollHandler = null;
let liveAutoRefreshTimer = null;
let localStateLoaded = false;
let cardTouchStart = null;
let cardPointerStart = null;
let lastTouchCardNavigationAt = 0;

const LOCAL_STATE_KEY = "pickaside_local_state_v1";
const LOCAL_TOURNAMENT_KEY_PREFIX = "pickaside_tournament_v1:";

const state = {
  selectedChampionshipsTab: "active",
  selectedPointRuleRound: "",
  editingPointRuleRound: "",
  selectedRulesRound: "",
  editingRulesRound: "",
  selectedPredictionViewer: "",
  selectedVotingRound: "",
  selectedMatchdayByTournament: {},
  selectedLiveRoundByTournament: {},
  selectedLiveMatchdayByTournament: {},
  selectedLiveScopeByTournament: {},
  predictionPlayerQuery: "",
  playerInviteQuery: "",
  searchFocused: false,
  searchHistory: [],
  publicTournamentFilter: "all",
  pendingCreateCoverImage: null,
  createFormDraft: {},
  showExtraPrizeForm: false,
  routeHistory: [],
  isHistoryNavigation: false,
  currentUser: {
    name: "Pick A Side User",
    handle: "@user",
    phone: "",
    timezone: "Asia/Dubai",
    timezoneLabel: "الإمارات",
    gmtOffset: "+04:00",
    avatar: "P",
    avatarUrl: "",
    favoriteTeam: "",
    correctPredictions: 0,
    totalPredictions: 0,
    followers: [],
    following: []
  },
  users: [],
  tournaments: [],
  matches: {
    group: [],
    round16: [],
    quarter: [],
    semi: [],
    final: []
  },
  liveMatches: [],
  predictions: {},
  quickPicks: {},
  editingPredictions: {},
  predictionErrors: {},
  awardPicks: {},
  awardSearchQueries: {},
  notifications: [],
  notificationPreferences: {
    invites: true,
    joinRequests: true,
    tournamentUpdates: true,
    social: true
  },
  backend: {
    loading: true,
    configured: false,
    client: null,
    session: null,
    error: ""
  },
  selectedLiveTournamentId: "",
  competitionSearchQuery: "",
  selectedCompetitionId: "",
  apiCompetitions: [],
  competitionCatalogRequested: false,
  competitionSearchStatus: "",
  competitionSearchError: "",
  competitionSearchTimer: null,
  selectedCompetitionMatchesByRound: null,
  selectedCompetitionFixtureStatus: "",
  selectedCompetitionFixtureError: "",
  createSourceMode: "official",
  manualTeams: [],
  manualMatches: [],
  liveApi: {
    endpoint: "/api/live-results",
    lastFetchAt: 0,
    lastStatus: "تحديث تلقائي كل 5 ثواني",
    lastError: "",
    lastEvents: [],
    isRefreshing: false
  },
  language: "ar",
  theme: "dark",
  route: getInitialRoute()
};

const rounds = [
  { id: "qualifying", label: "التصفيات" },
  { id: "preliminary", label: "الدور التمهيدي" },
  { id: "playoff", label: "الملحق" },
  { id: "group", label: "دور المجموعات" },
  { id: "round64", label: "دور 64" },
  { id: "round32", label: "دور 32" },
  { id: "round16", label: "دور 16" },
  { id: "quarter", label: "ربع النهائي" },
  { id: "semi", label: "نصف النهائي" },
  { id: "third-place", label: "تحديد المركز الثالث" },
  { id: "final", label: "النهائي" }
];

const timezoneOptions = [
  { id: "Asia/Dubai", label: "الإمارات", gmt: "GMT+4", offset: "+04:00" },
  { id: "Asia/Muscat", label: "عُمان", gmt: "GMT+4", offset: "+04:00" },
  { id: "Asia/Riyadh", label: "السعودية", gmt: "GMT+3", offset: "+03:00" },
  { id: "Asia/Qatar", label: "قطر", gmt: "GMT+3", offset: "+03:00" },
  { id: "Asia/Kuwait", label: "الكويت", gmt: "GMT+3", offset: "+03:00" },
  { id: "Asia/Bahrain", label: "البحرين", gmt: "GMT+3", offset: "+03:00" },
  { id: "Asia/Baghdad", label: "العراق", gmt: "GMT+3", offset: "+03:00" },
  { id: "Africa/Cairo", label: "مصر", gmt: "GMT+2", offset: "+02:00" },
  { id: "Europe/London", label: "المملكة المتحدة", gmt: "GMT+0", offset: "+00:00" }
];

const notificationPreferenceOptions = [
  { id: "invites", label: "دعوات البطولات", description: "قبول أو رفض دعوات المشاركة" },
  { id: "joinRequests", label: "طلبات الانضمام", description: "موافقة صاحب البطولة على دخول اللاعبين" },
  { id: "tournamentUpdates", label: "تحديثات البطولة", description: "قفل التوقعات وفتح الأدوار والنتائج" },
  { id: "social", label: "المتابعات", description: "متابعة ورد متابعة" }
];

const PREDICTION_LOCK_MINUTES = 30;
const MATCH_RESULT_AFTER_MINUTES = 120;
let countdownTimer = null;

const translations = {
  en: {
    "تسجيل الدخول": "Login",
    "إنشاء حساب": "Sign Up",
    "البريد الإلكتروني": "Email",
    "اسم المستخدم": "Username",
    "كلمة المرور": "Password",
    "دخول": "Login",
    "إنشاء الحساب": "Create account",
    "لدي حساب": "I already have an account",
    "إنشاء حساب جديد": "Create a new account",
    "Accuracy": "Accuracy",
    "Followers": "Followers",
    "Following": "Following",
    "Favorite team": "Favorite team",
    "Not set": "Not set",
    "Edit Profile": "Edit Profile",
    "Share Profile": "Share Profile",
    "Football prediction profile": "Football prediction profile",
    "I pick match winners, manage point budgets, and compete with friends.": "I pick match winners, manage point budgets, and compete with friends.",
    "Favorite team: Not set": "Favorite team: Not set",
    "Settings": "Settings",
    "My Results": "My Results",
    "Created Challenges": "Created Challenges",
    "Tournaments you founded": "Tournaments you founded",
    "Joined Challenges": "Joined Challenges",
    "Active competitions": "Active competitions",
    "Draft": "Draft",
    "Unpublished setups": "Unpublished setups",
    "History": "History",
    "Settled tournaments": "Settled tournaments",
    "Notifications": "Notifications",
    "طلب انضمام": "Join request",
    "طلب جديد للانضمام إلى البطولة": "New request to join the championship",
    "توقعاتك تقفل قريباً": "Predictions close soon",
    "باقي وقت قصير على البطولة": "Championship predictions close soon",
    "فتح الدور التالي": "Next round unlocked",
    "ربع النهائي جاهز للتوقع": "Quarter final is ready",
    "مستخدم جديد تابعك": "A new user followed you",
    "رد المتابعة": "Follow back",
    "متابعة": "Follow",
    "تتابعه": "Following",
    "تم رد المتابعة": "Followed back",
    "أنت الآن تتابع": "You now follow",
    "الآن": "Now",
    "اليوم": "Today",
    "قبل 12 د": "12m ago",
    "قبول": "Approve",
    "رفض": "Decline",
    "تم القبول": "Approved",
    "تم الرفض": "Declined",
    "تم قبول الطلب": "Request approved",
    "تم رفض الطلب": "Request declined",
    "دعوة بطولة": "Tournament invite",
    "تمت دعوتك إلى بطولة": "You were invited to a championship",
    "تم قبول الدعوة": "Invite accepted",
    "تم رفض الدعوة": "Invite declined",
    "انضممت إلى": "Joined",
    "رفضت دعوة": "Declined invite to",
    "لوحة التنبيهات": "Notification controls",
    "دعوات البطولات": "Tournament invites",
    "قبول أو رفض دعوات المشاركة": "Accept or decline participation invites",
    "طلبات الانضمام": "Join requests",
    "موافقة صاحب البطولة على دخول اللاعبين": "Creator approval for player entry",
    "تحديثات البطولة": "Tournament updates",
    "قفل التوقعات وفتح الأدوار والنتائج": "Prediction locks, unlocked rounds, and results",
    "المتابعات": "Follows",
    "متابعة ورد متابعة": "Follows and follow backs",
    "المباشر": "Live",
    "المباريات الحية": "Live Matches",
    "تظهر هنا فقط البطولات التي أنت مشارك فيها. اختر بطولة لعرض نتائجها الحية وتأثيرها على رصيدك.": "Only tournaments you joined appear here. Pick one to view live results and balance impact.",
    "Live results from this championship only.": "Live results from this championship only.",
    "أثرها على رصيدك": "Balance impact",
    "لا يوجد توقع": "No pick",
    "أنت غير مشارك في أي بطولة نشطة حالياً. انضم إلى بطولة Public من صفحة Search.": "You are not in any active tournament. Join a public tournament from Search.",
    "إنشاء بطولة": "Create Tournament",
    "إنشاء بطولة جديدة": "Create New Tournament",
    "البطولات": "Championships",
    "إدارة البطولات": "Manage championships",
    "البطولات التي تشارك فيها حالياً": "Championships you currently participate in",
    "بطولات من أتابعهم": "Championships from people I follow",
    "بطولات عامة أنشأها الأشخاص الذين تتابعهم": "Public championships created by people you follow",
    "لا توجد بطولات هنا حالياً.": "No championships here yet.",
    "المشاركة": "Join",
    "تم الانضمام": "Joined",
    "عرض التفاصيل": "View details",
    "بدأت": "Started",
    "لم تبدأ": "Not started",
    "المنشئ": "Creator",
    "المتصدر": "Leader",
    "المشاركون": "Participants",
    "اضبط الخصوصية، الدور، وميزانية النقاط التي ستحكم توقعات اللاعبين.": "Set privacy, starting round, and the points budget for predictions.",
    "اختر البطولة الرسمية": "Official competition",
    "اسم التحدي داخل التطبيق": "Challenge name in app",
    "الشعار": "Logo",
    "وصف القوانين": "Rules description",
    "بطولة خاصة": "Private tournament",
    "عند التفعيل يتم توليد كود دعوة تلقائي.": "When enabled, an invite code is generated automatically.",
    "الحد الأقصى للمشاركين": "Max players",
    "نقطة الانطلاق": "Starting round",
    "دور المجموعات": "Group Stage",
    "دور 16": "Round of 16",
    "ربع النهائي": "Quarter Final",
    "نصف النهائي": "Semi Final",
    "النهائي": "Final",
    "ميزانية النقاط لكل لاعب في الدور": "Point budget per player",
    "الحد الأدنى لكل فريق": "Minimum points per team",
    "ترشيحات الجوائز الاختيارية": "Optional award nominations",
    "حدد الجوائز التي تريد إضافتها ضمن المسابقة. ستظهر للمشاركين داخل صفحة البطولة فقط إذا تم تفعيلها هنا.": "Choose awards to include. They appear to participants only if enabled here.",
    "أفضل لاعب في البطولة": "Best player",
    "هداف البطولة": "Top scorer",
    "أفضل حارس مرمى": "Best goalkeeper",
    "أفضل لاعب صاعد": "Best young player",
    "ترشيح بطل البطولة الفعلي": "Actual tournament champion pick",
    "ترشيح وصيف البطولة الفعلي": "Actual tournament runner-up pick",
    "حفظ كمسودة": "Save draft",
    "تفعيل": "Activate",
    "التحديات المنشأة": "Created Challenges",
    "التحديات المنضم إليها": "Joined Challenges",
    "المسودات": "Drafts",
    "الأرشيف": "History",
    "لا توجد عناصر حالياً.": "No items yet.",
    "الصفحة غير موجودة": "Page not found",
    "العودة للرئيسية": "Go home",
    "بحث": "Search",
    "Search users, championships, or invite code": "Search users, championships, or invite code",
    "Search challenges or users...": "Search challenges or users...",
    "ابحث باسم البطولة أو الكود من المصدر الرسمي": "Search official competition name or code",
    "اكتب اسم اللاعب أو الفريق": "Type player or team name",
    "التحديات": "Challenges",
    "نشطة": "Active",
    "مسودة": "Draft",
    "منتهية": "Finished",
    "عام": "Public",
    "خاص": "Private",
    "الدور الحالي": "Current round",
    "الميزانية": "Budget",
    "الحد الأدنى للفريق": "Minimum per team",
    "Leaderboard": "Leaderboard",
    "توقع": "Predict",
    "توزيع النقاط": "Point allocation",
    "حفظ التوقع": "Save prediction",
    "إلغاء": "Cancel",
    "People": "People",
    "Championships": "Championships",
    "Public Championships": "Public Championships",
    "Explore open challenges": "Explore open challenges",
    "No users found": "No users found",
    "No public championships found": "No public championships found",
    "Follow": "Follow",
    "Following": "Following",
    "Unfollow": "Unfollow",
    "Follow back": "Follow back",
    "Join": "Join",
    "Joined": "Joined",
    "Join Championship": "Join Championship",
    "Profile Settings": "Profile Settings",
    "Edit profile details": "Edit profile details",
    "Share profile": "Share profile",
    "الصورة الشخصية": "Profile Photo",
    "رفع صورة": "Upload photo",
    "اختيار صورة": "Choose image",
    "يرجى اختيار ملف صورة.": "Please choose an image file.",
    "الاسم الظاهر": "Display Name",
    "اسم المستخدم": "Username",
    "الفريق المفضل": "Favorite Team",
    "الاسم واسم المستخدم مطلوبان.": "Name and username are required.",
    "اسم المستخدم يجب أن يكون 3-20 حرفاً أو رقماً أو شرطة سفلية.": "Username must be 3-20 letters, numbers, or underscores.",
    "تسجيل الخروج": "Logout",
    "اللغة": "Language",
    "العربية": "Arabic",
    "المظهر": "Theme",
    "داكن": "Dark",
    "فاتح": "Light",
    "تصويت مطلوب": "Required predictions",
    "مباراة": "matches",
    "لا توجد مباريات تحتاج تصويت حالياً.": "No matches require predictions right now.",
    "النقاط": "Points",
    "نقطة": "points",
    "الترتيب": "Rank",
    "الأخيرة": "Recent",
    "حذف الكل": "Clear all",
    "لا يوجد تاريخ بحث حتى الآن.": "No recent searches yet.",
    "بحث سابق": "Recent search",
    "حساب مستخدم": "User account",
    "بطولة عامة": "Public championship",
    "بدون كود": "No code",
    "الأشخاص": "People",
    "البطولات": "Championships",
    "لا توجد بطولات مطابقة لهذا الفلتر.": "No championships match this filter.",
    "لا يوجد مستخدمون مطابقون.": "No matching users.",
    "لا توجد بطولات عامة مطابقة.": "No matching public championships.",
    "Public championship": "Public championship",
    "No results found": "No results found",
    "JOINED": "JOINED",
    "Go to Search": "Go to Search",
    "تحتاج تصويتك": "Needs your prediction",
    "مكتمل": "Completed",
    "ينتهي التصويت": "Voting closes",
    "انضمام": "Join",
    "منضم": "Joined",
    "إدارة البطولات": "Manage championships",
    "البطولات النشطة": "Active championships",
    "بطولات جديدة": "New championships",
    "لا توجد بطولات مشارك فيها حالياً.": "You are not participating in any championships yet.",
    "لا توجد بطولات أنشأتها حالياً.": "You have not created any championships yet.",
    "لا توجد بطولات جديدة حالياً.": "No new championships right now.",
    "فتح": "Open",
    "تعديل الملف": "Edit Profile",
    "مشاركة الملف": "Share Profile",
    "حفظ التغييرات": "Save Changes",
    "نسخ الرابط": "Copy Link",
    "تم نسخ رابط الملف.": "Profile link copied.",
    "انسخ رابط هذا الملف.": "Copy this profile link.",
    "إعدادات الملف": "Profile Settings",
    "إعدادات التنبيهات": "Notification Settings",
    "الأرشيف": "History",
    "لا توجد أسماء حالياً.": "No names yet.",
    "إغلاق": "Close",
    "حالة المباراة": "Match status",
    "الدقيقة": "Minute",
    "بدأت المباراة": "Match started",
    "نتيجة المباراة": "Match result",
    "بانتظار النتيجة": "Waiting for result",
    "تم اعتماد النتيجة من الربط الرياضي.": "Result confirmed from the sports feed.",
    "بانتظار النتيجة النهائية من الربط الرياضي.": "Waiting for the final result from the sports feed.",
    "ترشيحات الجوائز": "Award Nominations",
    "جوائز اختيارية": "Optional awards",
    "تم اختيار جوائز": "awards picked",
    "مفتاح API": "API Key",
    "رابط المباشر": "Live endpoint",
    "ضد": "VS",
    "English": "English"
  },
  ar: {
    "Login": "تسجيل الدخول",
    "Sign Up": "إنشاء حساب",
    "Email": "البريد الإلكتروني",
    "Username": "اسم المستخدم",
    "Password": "كلمة المرور",
    "Create account": "إنشاء الحساب",
    "I already have an account": "لدي حساب",
    "Create a new account": "إنشاء حساب جديد",
    "Accuracy": "الدقة",
    "Followers": "المتابعون",
    "Following": "يتابع",
    "Favorite team": "الفريق المفضل",
    "Not set": "غير محدد",
    "Edit Profile": "تعديل الملف",
    "Share Profile": "مشاركة الملف",
    "Football prediction profile": "ملف توقعات كروي",
    "I pick match winners, manage point budgets, and compete with friends.": "أتوقع الفائزين، أدير ميزانية النقاط، وأتنافس مع الأصدقاء.",
    "Favorite team: Not set": "الفريق المفضل: غير محدد",
    "Settings": "الإعدادات",
    "My Results": "نتائجي",
    "Created Challenges": "التحديات المنشأة",
    "Tournaments you founded": "البطولات التي أنشأتها",
    "Joined Challenges": "التحديات المنضم لها",
    "Active competitions": "المسابقات النشطة",
    "Draft": "المسودات",
    "Unpublished setups": "إعدادات غير منشورة",
    "History": "الأرشيف",
    "Settled tournaments": "بطولات منتهية",
    "Notifications": "التنبيهات",
    "Join request": "طلب انضمام",
    "New request to join the championship": "طلب جديد للانضمام إلى البطولة",
    "Predictions close soon": "توقعاتك تقفل قريباً",
    "Championship predictions close soon": "باقي وقت قصير على البطولة",
    "Next round unlocked": "فتح الدور التالي",
    "Quarter final is ready": "ربع النهائي جاهز للتوقع",
    "A new user followed you": "مستخدم جديد تابعك",
    "Followed back": "تم رد المتابعة",
    "You now follow": "أنت الآن تتابع",
    "Follow": "متابعة",
    "Now": "الآن",
    "Today": "اليوم",
    "12m ago": "قبل 12 د",
    "Approve": "قبول",
    "Decline": "رفض",
    "Approved": "تم القبول",
    "Declined": "تم الرفض",
    "Tournament invite": "دعوة بطولة",
    "You were invited to a championship": "تمت دعوتك إلى بطولة",
    "Invite accepted": "تم قبول الدعوة",
    "Invite declined": "تم رفض الدعوة",
    "Joined": "انضممت إلى",
    "Declined invite to": "رفضت دعوة",
    "Notification controls": "لوحة التنبيهات",
    "Tournament invites": "دعوات البطولات",
    "Accept or decline participation invites": "قبول أو رفض دعوات المشاركة",
    "Join requests": "طلبات الانضمام",
    "Creator approval for player entry": "موافقة صاحب البطولة على دخول اللاعبين",
    "Tournament updates": "تحديثات البطولة",
    "Prediction locks, unlocked rounds, and results": "قفل التوقعات وفتح الأدوار والنتائج",
    "Follows": "المتابعات",
    "Follows and follow backs": "متابعة ورد متابعة",
    "Live": "المباشر",
    "Live Matches": "المباريات الحية",
    "Only tournaments you joined appear here. Pick one to view live results and balance impact.": "تظهر هنا فقط البطولات التي أنت مشارك فيها. اختر بطولة لعرض نتائجها الحية وتأثيرها على رصيدك.",
    "Balance impact": "أثرها على رصيدك",
    "No pick": "لا يوجد توقع",
    "Create Tournament": "إنشاء بطولة",
    "Create New Tournament": "إنشاء بطولة جديدة",
    "Championships": "البطولات",
    "Manage championships": "إدارة البطولات",
    "Championships you currently participate in": "البطولات التي تشارك فيها حالياً",
    "Championships from people I follow": "بطولات من أتابعهم",
    "Public championships created by people you follow": "بطولات عامة أنشأها الأشخاص الذين تتابعهم",
    "No championships here yet.": "لا توجد بطولات هنا حالياً.",
    "View details": "عرض التفاصيل",
    "Started": "بدأت",
    "Not started": "لم تبدأ",
    "Creator": "المنشئ",
    "Leader": "المتصدر",
    "Participants": "المشاركون",
    "Official competition": "اختر البطولة الرسمية",
    "Challenge name in app": "اسم التحدي داخل التطبيق",
    "Logo": "الشعار",
    "Rules description": "وصف القوانين",
    "Private tournament": "بطولة خاصة",
    "Max players": "الحد الأقصى للمشاركين",
    "Starting round": "نقطة الانطلاق",
    "Group Stage": "دور المجموعات",
    "Round of 16": "دور 16",
    "Quarter Final": "ربع النهائي",
    "Semi Final": "نصف النهائي",
    "Final": "النهائي",
    "Point budget per player": "ميزانية النقاط لكل لاعب في الدور",
    "Minimum points per team": "الحد الأدنى لكل فريق",
    "Optional award nominations": "ترشيحات الجوائز الاختيارية",
    "Best player": "أفضل لاعب في البطولة",
    "Top scorer": "هداف البطولة",
    "Best goalkeeper": "أفضل حارس مرمى",
    "Best young player": "أفضل لاعب صاعد",
    "Actual tournament champion pick": "ترشيح بطل البطولة الفعلي",
    "Actual tournament runner-up pick": "ترشيح وصيف البطولة الفعلي",
    "Save draft": "حفظ كمسودة",
    "Activate": "تفعيل",
    "Created Challenges": "التحديات المنشأة",
    "Joined Challenges": "التحديات المنضم إليها",
    "Drafts": "المسودات",
    "No items yet.": "لا توجد عناصر حالياً.",
    "Page not found": "الصفحة غير موجودة",
    "Go home": "العودة للرئيسية",
    "Search": "بحث",
    "Search official competition name or code": "ابحث باسم البطولة أو الكود من المصدر الرسمي",
    "Type player or team name": "اكتب اسم اللاعب أو الفريق",
    "Challenges": "التحديات",
    "Active": "نشطة",
    "Finished": "منتهية",
    "Public": "عام",
    "Private": "خاص",
    "Current round": "الدور الحالي",
    "Budget": "الميزانية",
    "Minimum per team": "الحد الأدنى للفريق",
    "Predict": "توقع",
    "Point allocation": "توزيع النقاط",
    "Save prediction": "حفظ التوقع",
    "Cancel": "إلغاء",
    "People": "الأشخاص",
    "Championships": "البطولات",
    "Public Championships": "البطولات العامة",
    "Explore open challenges": "استكشف التحديات المفتوحة",
    "No users found": "لا يوجد مستخدمون",
    "No public championships found": "لا توجد بطولات عامة",
    "Follow": "متابعة",
    "Unfollow": "إلغاء المتابعة",
    "Follow back": "رد المتابعة",
    "Join": "انضمام",
    "Joined": "منضم",
    "Join Championship": "انضمام",
    "Profile Settings": "إعدادات الملف",
    "Edit profile details": "تعديل بيانات الملف",
    "Share profile": "مشاركة الملف",
    "Profile Photo": "الصورة الشخصية",
    "Upload photo": "رفع صورة",
    "Choose image": "اختيار صورة",
    "Please choose an image file.": "يرجى اختيار ملف صورة.",
    "Display Name": "الاسم الظاهر",
    "Username": "اسم المستخدم",
    "Favorite Team": "الفريق المفضل",
    "Name and username are required.": "الاسم واسم المستخدم مطلوبان.",
    "Username must be 3-20 letters, numbers, or underscores.": "اسم المستخدم يجب أن يكون 3-20 حرفاً أو رقماً أو شرطة سفلية.",
    "Logout": "تسجيل الخروج",
    "Language": "اللغة",
    "Arabic": "العربية",
    "Theme": "المظهر",
    "Dark": "داكن",
    "Light": "فاتح",
    "Required predictions": "تصويت مطلوب",
    "matches": "مباراة",
    "Points": "النقاط",
    "points": "نقطة",
    "Rank": "الترتيب",
    "Recent": "الأخيرة",
    "Clear all": "حذف الكل",
    "No recent searches yet.": "لا يوجد تاريخ بحث حتى الآن.",
    "Recent search": "بحث سابق",
    "User account": "حساب مستخدم",
    "Public championship": "بطولة عامة",
    "No code": "بدون كود",
    "No matching users.": "لا يوجد مستخدمون مطابقون.",
    "No matching public championships.": "لا توجد بطولات عامة مطابقة.",
    "No championships match this filter.": "لا توجد بطولات مطابقة لهذا الفلتر.",
    "No results found": "لا توجد نتائج",
    "JOINED": "منضم",
    "Go to Search": "اذهب إلى البحث",
    "Needs your prediction": "تحتاج تصويتك",
    "Completed": "مكتمل",
    "Voting closes": "ينتهي التصويت",
    "Active championships": "البطولات النشطة",
    "New championships": "بطولات جديدة",
    "You are not participating in any championships yet.": "لا توجد بطولات مشارك فيها حالياً.",
    "You have not created any championships yet.": "لا توجد بطولات أنشأتها حالياً.",
    "No new championships right now.": "لا توجد بطولات جديدة حالياً.",
    "Open": "فتح",
    "Save Changes": "حفظ التغييرات",
    "Copy Link": "نسخ الرابط",
    "Profile link copied.": "تم نسخ رابط الملف.",
    "Copy this profile link.": "انسخ رابط هذا الملف.",
    "Notification Settings": "إعدادات التنبيهات",
    "Close": "إغلاق",
    "Match status": "حالة المباراة",
    "Minute": "الدقيقة",
    "Match started": "بدأت المباراة",
    "Match result": "نتيجة المباراة",
    "Waiting for result": "بانتظار النتيجة",
    "Result confirmed from the sports feed.": "تم اعتماد النتيجة من الربط الرياضي.",
    "Waiting for the final result from the sports feed.": "بانتظار النتيجة النهائية من الربط الرياضي.",
    "Award Nominations": "ترشيحات الجوائز",
    "Optional awards": "جوائز اختيارية",
    "awards picked": "تم اختيار جوائز",
    "API Key": "مفتاح API",
    "Live endpoint": "رابط المباشر",
    "VS": "ضد"
  }
};

const dataNameTranslations = {
  en: {
    "العين": "Al Ain",
    "النصر": "Al Nassr",
    "الهلال": "Al Hilal",
    "الوصل": "Al Wasl",
    "الاتحاد": "Al Ittihad",
    "الشارقة": "Sharjah",
    "الأهلي": "Al Ahli",
    "الوحدة": "Al Wahda",
    "الفائز 1": "Winner 1",
    "الفائز 2": "Winner 2",
    "الفائز 3": "Winner 3",
    "الفائز 4": "Winner 4",
    "Champions League": "Champions League",
    "Friendly Championship": "Friendly Championship",
    "Private Championship": "Private Championship",
    "AFC Champions League Elite": "AFC Champions League Elite",
    "UEFA Champions League": "UEFA Champions League",
    "UAE Pro League": "UAE Pro League",
    "Club World Championship": "Club World Championship",
    "Gulf Cup": "Gulf Cup",
    "Friendly Championship Series": "Friendly Championship Series"
  },
  ar: {
    "Al Ain": "العين",
    "Al Nassr": "النصر",
    "Al Hilal": "الهلال",
    "Al Wasl": "الوصل",
    "Al Ittihad": "الاتحاد",
    "Sharjah": "الشارقة",
    "Al Ahli": "الأهلي",
    "Al Wahda": "الوحدة",
    "Winner 1": "الفائز 1",
    "Winner 2": "الفائز 2",
    "Winner 3": "الفائز 3",
    "Winner 4": "الفائز 4",
    "Champions League": "دوري الأبطال",
    "Friendly Championship": "بطولة ودية",
    "Private Championship": "بطولة خاصة",
    "AFC Champions League Elite": "دوري أبطال آسيا للنخبة",
    "UEFA Champions League": "دوري أبطال أوروبا",
    "UAE Pro League": "دوري أدنوك للمحترفين",
    "Club World Championship": "بطولة العالم للأندية",
    "Gulf Cup": "كأس الخليج",
    "Friendly Championship Series": "سلسلة بطولة ودية"
  }
};

const awardOptions = [
  { id: "best-player", label: "أفضل لاعب في البطولة" },
  { id: "top-scorer", label: "هداف البطولة" },
  { id: "best-goalkeeper", label: "أفضل حارس مرمى" },
  { id: "best-young-player", label: "أفضل لاعب صاعد" },
  { id: "best-playmaker", label: "أفضل صانع ألعاب في البطولة" },
  { id: "champion-pick", label: "ترشيح بطل البطولة الفعلي", target: "team" },
  { id: "runner-up-pick", label: "ترشيح وصيف البطولة الفعلي", target: "team" }
];

const extraPrizeOptions = [
  { id: "top-scorer", label: "هداف البطولة" },
  { id: "prediction-runner-up", label: "وصيف ملك التوقعات" },
  { id: "best-player", label: "أفضل لاعب في البطولة" },
  { id: "best-young-player", label: "أفضل لاعب صاعد في البطولة" },
  { id: "best-playmaker", label: "أفضل صانع ألعاب في البطولة" }
];

const officialRosterPlayers = [];
const sportsApiTeamDirectory = {};

function navigate(path) {
  if (path !== state.route) {
    state.routeHistory.push(state.route || getInitialRoute());
    if (state.routeHistory.length > 40) state.routeHistory.shift();
  }
  state.route = path;
  window.location.hash = path;
  render();
}

function tournamentPath(tournamentOrId, suffix = "") {
  const id = typeof tournamentOrId === "object" ? tournamentOrId.id : tournamentOrId;
  return `/tournament/${encodeURIComponent(String(id))}${suffix}`;
}

function readRoutePart(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function tr(text) {
  const dictionary = translations[state.language] || {};
  return dictionary[text] || text;
}

function translateDataNames(text) {
  const dictionary = dataNameTranslations[state.language] || {};
  return Object.keys(dictionary)
    .sort((a, b) => b.length - a.length)
    .reduce((value, key) => value.replaceAll(key, dictionary[key]), text);
}

function avatarHtml(user, id = "") {
  const idAttribute = id ? ` id="${id}"` : "";
  const fallback = user.avatar || user.name?.trim().charAt(0) || "P";
  const image = user.avatarUrl
    ? `<img src="${user.avatarUrl}" alt="" loading="lazy">`
    : fallback;
  return `<span class="avatar"${idAttribute}>${image}</span>`;
}

function appLogoHtml(className = "") {
  return `
    <span class="app-logo ${className}" aria-label="Pick A Side">
      <img class="app-logo-dark" src="assets/logo-header-dark.png" alt="Pick A Side">
      <img class="app-logo-light" src="assets/logo-header-light.png" alt="Pick A Side">
    </span>
  `;
}

function currentLogoSrc() {
  return state.theme === "light" ? "assets/logo-dark.png" : "assets/logo-light.png";
}

function setLanguage(language) {
  state.language = language;
  applyAppPreferences();
  saveLocalAppState();
  render();
}

function languageToggle() {
  return `
    <div class="language-toggle" aria-label="Language">
      <button class="${state.language === "ar" ? "active" : ""}" type="button" data-language="ar">AR</button>
      <button class="${state.language === "en" ? "active" : ""}" type="button" data-language="en">EN</button>
    </div>
  `;
}

function themeToggle() {
  return `
    <div class="theme-toggle" aria-label="Theme">
      <button class="${state.theme === "dark" ? "active" : ""}" type="button" data-theme-option="dark">داكن</button>
      <button class="${state.theme === "light" ? "active" : ""}" type="button" data-theme-option="light">فاتح</button>
    </div>
  `;
}

function setTheme(theme) {
  if (!["dark", "light"].includes(theme)) return;
  state.theme = theme;
  applyAppPreferences();
  saveLocalAppState();
  profileSettingsModal();
  updateNotificationBadges();
}

function applyAppPreferences() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.theme = state.theme;
  document.querySelector("meta[name='theme-color']")?.setAttribute("content", state.theme === "light" ? "#f6f7f9" : "#12131a");
  document.querySelector("meta[name='color-scheme']")?.setAttribute("content", state.theme);
}

function applyTranslations(root = document.body) {
  applyAppPreferences();
  const walker = document.createTreeWalker(root, 4);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    if (!isTranslatableTextNode(node)) return;
    const value = node.nodeValue;
    const trimmed = value.trim();
    if (!trimmed) return;
    const uiTranslated = tr(trimmed);
    const translated = uiTranslated === trimmed ? translateDataNames(trimmed) : uiTranslated;
    if (translated !== trimmed) node.nodeValue = value.replace(trimmed, translated);
  });

  root.querySelectorAll("[placeholder], [title], [aria-label]").forEach((element) => {
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, tr(value));
    });
  });
}

function isTranslatableTextNode(node) {
  const element = node.parentElement;
  if (!element) return false;
  return !element.closest("script, style, textarea, input, [data-no-translate]");
}

window.addEventListener("popstate", () => {
  state.route = getInitialRoute();
  render();
});

window.addEventListener("hashchange", () => {
  const nextRoute = getInitialRoute();
  if (!state.isHistoryNavigation && nextRoute !== state.route) {
    state.routeHistory.push(state.route || "/");
    if (state.routeHistory.length > 40) state.routeHistory.shift();
  }
  state.isHistoryNavigation = false;
  state.route = nextRoute;
  render();
});

document.body.addEventListener("click", (event) => {
  if (Date.now() - lastTouchCardNavigationAt < 500 && closestElement(event.target, "[data-card-route]")) {
    event.preventDefault();
    return;
  }

  const backButton = closestElement(event.target, "[data-back]");
  if (backButton) {
    event.preventDefault();
    goBack();
    return;
  }

  const extraPrizeButton = closestElement(event.target, "[data-show-extra-prize-form]");
  if (extraPrizeButton) {
    event.preventDefault();
    const match = state.route.match(/^\/tournament\/([^/]+)\/manage\/prizes$/);
    const tournament = match ? getTournamentById(match[1]) : null;
    if (tournament) prizeEditorModal(tournament);
    return;
  }

  const notificationsButton = closestElement(event.target, "[data-open-notifications]");
  if (notificationsButton) {
    event.preventDefault();
    notificationsModal();
    return;
  }

  const languageButton = closestElement(event.target, "[data-language]");
  if (languageButton) {
    event.preventDefault();
    setLanguage(languageButton.dataset.language);
    return;
  }

  const themeButton = closestElement(event.target, "[data-theme-option]");
  if (themeButton) {
    event.preventDefault();
    setTheme(themeButton.dataset.themeOption);
    return;
  }

  const notificationPreferenceButton = closestElement(event.target, "[data-notification-pref]");
  if (notificationPreferenceButton) {
    event.preventDefault();
    toggleNotificationPreference(notificationPreferenceButton.dataset.notificationPref);
    return;
  }

  const notificationAction = closestElement(event.target, "[data-notification-action]");
  if (notificationAction) {
    event.preventDefault();
    event.stopPropagation();
    handleNotificationAction(notificationAction.dataset.notificationId, notificationAction.dataset.notificationAction);
    return;
  }

  const notificationRow = closestElement(event.target, "[data-notification-route]");
  if (notificationRow) {
    event.preventDefault();
    openNotification(notificationRow.dataset.notificationId, notificationRow.dataset.notificationRoute);
    return;
  }

  const cardInfoButton = closestElement(event.target, "[data-card-info]");
  if (cardInfoButton) {
    event.preventDefault();
    event.stopPropagation();
    openTournamentCardInfo(cardInfoButton.dataset.tournamentId, cardInfoButton.dataset.cardInfo);
    return;
  }

  const awardPlayerButton = closestElement(event.target, "[data-award-player]");
  if (awardPlayerButton) {
    event.preventDefault();
    const awardKey = awardPlayerButton.dataset.awardKey;
    state.awardPicks[awardKey] = awardPlayerButton.dataset.awardPlayer;
    state.awardSearchQueries[awardKey] = "";
    queueTournamentPersist(getTournamentById(awardKey.split(":")[0]));
    render();
    return;
  }

  const awardTeamButton = closestElement(event.target, "[data-award-team]");
  if (awardTeamButton) {
    event.preventDefault();
    const awardKey = awardTeamButton.dataset.awardKey;
    state.awardPicks[awardKey] = awardTeamButton.dataset.awardTeam;
    state.awardSearchQueries[awardKey] = "";
    queueTournamentPersist(getTournamentById(awardKey.split(":")[0]));
    render();
    return;
  }

  const competitionButton = closestElement(event.target, "[data-competition-id]");
  if (competitionButton) {
    event.preventDefault();
    selectOfficialCompetition(competitionButton.dataset.competitionId);
    return;
  }

  const editRulesRoundButton = closestElement(event.target, "[data-edit-rules-round]");
  if (editRulesRoundButton) {
    event.preventDefault();
    const match = state.route.match(/^\/tournament\/([^/]+)\/manage\/rules$/);
    const tournamentId = match ? match[1] : editRulesRoundButton.dataset.tournamentId;
    const tournament = getTournamentById(tournamentId);
    const roundId = editRulesRoundButton.dataset.editRulesRound;
    if (tournament && isPointRuleRoundLocked(tournament, roundId)) return;
    state.selectedRulesRound = roundId;
    state.editingRulesRound = roundId;
    if (tournament) renderTournamentManageSection(tournament, "rules");
    return;
  }

  const routeButton = closestElement(event.target, "[data-route]");
  if (routeButton) {
    event.preventDefault();
    navigate(routeButton.dataset.route);
    return;
  }

  const cardRoute = closestElement(event.target, "[data-card-route]");
  if (cardRoute) {
    if (isInteractiveTarget(event.target)) return;
    event.preventDefault();
    navigate(cardRoute.dataset.cardRoute);
  }
});

document.body.addEventListener("touchstart", (event) => {
  if (event.touches.length !== 1) {
    cardTouchStart = null;
    return;
  }
  const cardRoute = closestElement(event.target, "[data-card-route]");
  if (!cardRoute || isInteractiveTarget(event.target)) {
    cardTouchStart = null;
    return;
  }
  const touch = event.touches[0];
  cardTouchStart = {
    x: touch.clientX,
    y: touch.clientY,
    route: cardRoute.dataset.cardRoute
  };
}, { passive: true });

document.body.addEventListener("touchend", (event) => {
  if (!cardTouchStart) return;
  const touch = event.changedTouches[0];
  const absX = Math.abs(touch.clientX - cardTouchStart.x);
  const absY = Math.abs(touch.clientY - cardTouchStart.y);
  const route = cardTouchStart.route;
  cardTouchStart = null;
  if (!route || absX > 34 || absY > 34) return;
  event.preventDefault();
  lastTouchCardNavigationAt = Date.now();
  navigate(route);
}, { passive: false });

document.body.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  const cardRoute = closestElement(event.target, "[data-card-route]");
  if (!cardRoute || isInteractiveTarget(event.target)) {
    cardPointerStart = null;
    return;
  }
  cardPointerStart = {
    x: event.clientX,
    y: event.clientY,
    route: cardRoute.dataset.cardRoute,
    pointerId: event.pointerId
  };
}, true);

document.body.addEventListener("pointerup", (event) => {
  if (!cardPointerStart || cardPointerStart.pointerId !== event.pointerId) return;
  const absX = Math.abs(event.clientX - cardPointerStart.x);
  const absY = Math.abs(event.clientY - cardPointerStart.y);
  const route = cardPointerStart.route;
  cardPointerStart = null;
  if (!route || absX > 34 || absY > 34) return;
  event.preventDefault();
  lastTouchCardNavigationAt = Date.now();
  navigate(route);
}, true);

document.body.addEventListener("pointercancel", () => {
  cardPointerStart = null;
}, true);

document.body.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const cardRoute = closestElement(event.target, "[data-card-route]");
  if (!cardRoute || isInteractiveTarget(event.target)) return;
  event.preventDefault();
  navigate(cardRoute.dataset.cardRoute);
});

function closestElement(target, selector) {
  let node = target;
  while (node && node !== document) {
    if (node.matches && node.matches(selector)) return node;
    node = node.parentElement || node.parentNode;
  }
  return null;
}

function isInteractiveTarget(target) {
  return Boolean(closestElement(target, "button, a, input, textarea, select, label"));
}

function goBack() {
  const previousRoute = state.routeHistory.pop();
  if (previousRoute && previousRoute !== state.route) {
    replaceRoute(previousRoute);
    return;
  }

  if (window.history.length > 1 && window.location.protocol !== "file:") {
    state.isHistoryNavigation = true;
    window.history.back();
    return;
  }

  replaceRoute(getFallbackBackRoute(state.route));
}

function replaceRoute(route) {
  state.isHistoryNavigation = true;
  state.route = route;
  window.location.hash = route;
  render();
}

function getFallbackBackRoute(route = state.route) {
  const manageSectionMatch = route.match(/^\/tournament\/([^/]+)\/manage\/[^/]+$/);
  if (manageSectionMatch) return `/tournament/${manageSectionMatch[1]}/manage`;

  const manageMatch = route.match(/^\/tournament\/([^/]+)\/manage$/);
  if (manageMatch) return `/tournament/${manageMatch[1]}`;

  const tournamentPlayerMatch = route.match(/^\/tournament\/([^/]+)\/player$/);
  if (tournamentPlayerMatch) return "/create-tournament";

  const tournamentMatch = route.match(/^\/tournament\/([^/]+)$/);
  if (tournamentMatch) return "/create-tournament";

  const userMatch = route.match(/^\/user\/[^/]+$/);
  if (userMatch) return "/search";

  if (route.startsWith("/challenges/")) return "/";
  return "/";
}

function templateTopbar(title = "Pick A Side", actionHtml = "") {
  const showBack = shouldShowBackButton(state.route);
  const titleContent = title === "Pick A Side" ? appLogoHtml("topbar-logo") : `<span>${title}</span>`;
  return `
    <header class="topbar page-topbar">
      <div class="topbar-side">
        ${showBack ? `<button class="btn ghost back-btn" data-back="true" aria-label="Back" title="Back">←</button>` : ""}
      </div>
      <button class="page-title-btn" data-route="/">
        ${titleContent}
      </button>
      <div class="topbar-side">${actionHtml}</div>
    </header>
  `;
}

function shouldShowBackButton(route) {
  const mainRoutes = new Set(["/", "/home", "/search", "/live", "/create-tournament", "/login", "/signup"]);
  return !mainRoutes.has(route);
}

function notificationBell() {
  const unreadCount = enabledNotifications().filter((notification) => notification.unread).length;
  return `
    <button class="notification-bell" type="button" data-open-notifications aria-label="Notifications" title="Notifications">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
        <path d="M10 21h4"/>
      </svg>
      ${unreadCount ? `<span>${unreadCount}</span>` : ""}
    </button>
  `;
}

function notificationsModal() {
  const notifications = enabledNotifications();
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">Notifications</h2>
        ${modalCloseButton()}
      </div>
      <div class="notification-list">
        ${notifications.length ? notifications.map(notificationRow).join("") : `<p class="muted">لا توجد تنبيهات حالياً.</p>`}
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function enabledNotifications() {
  return state.notifications.filter((notification) => {
    const preference = notificationPreferenceKey(notification);
    return state.notificationPreferences[preference] !== false;
  });
}

function notificationPreferenceKey(notification) {
  if (notification.type === "tournament-invite") return "invites";
  if (notification.type === "join-request") return "joinRequests";
  if (notification.type === "follow") return "social";
  if (notification.id === "n-follow") return "social";
  return "tournamentUpdates";
}

function notificationRow(notification) {
  const isActionable = ["join-request", "tournament-invite", "follow"].includes(notification.type);
  const isPending = notification.status === "pending";
  const isFollow = notification.type === "follow";
  const actionHtml = isActionable
    ? isFollow ? followNotificationActions(notification) : isPending ? `
      <button class="btn compact-btn accent" type="button" data-notification-action="approve" data-notification-id="${notification.id}">قبول</button>
      <button class="btn compact-btn ghost" type="button" data-notification-action="decline" data-notification-id="${notification.id}">رفض</button>
    ` : `<b class="request-status ${notification.status}">${notificationStatusLabel(notification)}</b>`
    : `<time>${notification.time}</time>`;
  return `
    <article class="notification-row ${notification.unread ? "unread" : ""} ${isActionable ? "actionable" : ""}" data-notification-id="${notification.id}" data-notification-route="${notification.route}" role="button" tabindex="0">
      <span class="notification-icon">${notificationIcon(notification.icon)}</span>
      <span class="notification-copy">
        <strong>${notification.title}</strong>
        ${notification.body ? `<small>${notification.body}</small>` : ""}
      </span>
      <span class="notification-actions">${actionHtml}</span>
    </article>
  `;
}

function followNotificationActions(notification) {
  if (notification.status === "approved") {
    return `<button class="btn compact-btn ghost" type="button" data-notification-action="unfollow" data-notification-id="${notification.id}">تتابعه</button>`;
  }
  return `<button class="btn compact-btn accent" type="button" data-notification-action="follow-back" data-notification-id="${notification.id}">رد المتابعة</button>`;
}

function notificationIcon(type) {
  const icons = {
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4"/><path d="M17 6h3v2a4 4 0 0 1-4 4"/></svg>`,
    user: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`
  };
  return icons[type] || icons.clock;
}

function notificationSettingsModal() {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">لوحة التنبيهات</h2>
        ${modalCloseButton()}
      </div>
      <div class="settings-list">
        ${notificationPreferenceOptions.map((option) => `
          <div class="settings-row notification-pref-row">
            <span>
              <strong>${option.label}</strong>
              <small>${option.description}</small>
            </span>
            <button class="switch ${state.notificationPreferences[option.id] ? "on" : ""}" type="button" data-notification-pref="${option.id}" aria-pressed="${state.notificationPreferences[option.id] ? "true" : "false"}">
              <span></span>
            </button>
          </div>
        `).join("")}
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function toggleNotificationPreference(preferenceId) {
  state.notificationPreferences[preferenceId] = !state.notificationPreferences[preferenceId];
  saveLocalAppState();
  notificationSettingsModal();
  updateNotificationBadges();
}

function openNotification(notificationId, route) {
  const notification = state.notifications.find((item) => item.id === notificationId);
  if (notification) notification.unread = false;
  saveLocalAppState();
  updateNotificationBadges();
  closeModal();
  navigate(route);
}

function notificationStatusLabel(notification) {
  if (notification.type === "tournament-invite") {
    return notification.status === "approved" ? "تم قبول الدعوة" : "تم رفض الدعوة";
  }
  return notification.status === "approved" ? "تم القبول" : "تم الرفض";
}

function handleNotificationAction(notificationId, action) {
  const notification = state.notifications.find((item) => item.id === notificationId);
  if (!notification || !["join-request", "tournament-invite", "follow"].includes(notification.type)) return;

  if (notification.type === "follow") {
    notification.unread = false;
    if (action === "follow-back") {
      notification.status = "approved";
      followBackFromNotification(notification);
    } else if (action === "unfollow") {
      notification.status = "pending";
      unfollowFromNotification(notification);
    } else {
      return;
    }
    notificationsModal();
    updateNotificationBadges();
    updateProfileCounters();
    saveLocalAppState();
    return;
  }

  notification.unread = false;
  notification.status = action === "approve" ? "approved" : "declined";
  notification.time = "الآن";

  if (notification.type === "join-request") {
    notification.title = action === "approve" ? "تم قبول الطلب" : "تم رفض الطلب";
    notification.body = action === "approve"
      ? `${notification.requesterName} انضم إلى ${notification.tournamentName}`
      : `${notification.requesterName} لم يتم قبوله في ${notification.tournamentName}`;
    if (action === "approve") approveJoinRequest(notification);
  }

  if (notification.type === "tournament-invite") {
    notification.title = action === "approve" ? "تم قبول الدعوة" : "تم رفض الدعوة";
    notification.body = action === "approve"
      ? `انضممت إلى ${notification.tournamentName}`
      : `رفضت دعوة ${notification.tournamentName}`;
    if (action === "approve") acceptTournamentInvite(notification);
  }

  notificationsModal();
  updateNotificationBadges();
  saveLocalAppState();
}

function followBackFromNotification(notification) {
  const user = state.users.find((item) => item.username === notification.followerUsername);
  const displayName = user ? user.name.split(" ")[0] : notification.followerName;
  state.currentUser.following = [...new Set([...state.currentUser.following, displayName])];
  if (user) user.relation = "Unfollow";
  saveLocalAppState();
}

function unfollowFromNotification(notification) {
  const user = state.users.find((item) => item.username === notification.followerUsername);
  const displayName = user ? user.name.split(" ")[0] : notification.followerName;
  state.currentUser.following = state.currentUser.following.filter((name) => name !== displayName);
  if (user) user.relation = "Follow back";
  saveLocalAppState();
}

function approveJoinRequest(notification) {
  const tournament = state.tournaments.find((item) => item.id === notification.tournamentId);
  if (tournament) {
    if (isTournamentAtCapacity(tournament)) {
      notification.title = "لم يتم قبول الطلب";
      notification.body = `اكتمل عدد المشاركين في ${notification.tournamentName}`;
      notification.status = "declined";
      return;
    }
    tournament.joinRequests = (tournament.joinRequests || []).filter((request) => {
      const name = typeof request === "string" ? request : request.name;
      return name !== notification.requesterName;
    });
    tournament.participants = [...new Set([...(tournament.participants || []), notification.requesterName])];
    tournament.friends = Math.max(tournament.friends || 0, tournament.participants.length);
    queueTournamentPersist(tournament);
  }
}

function acceptTournamentInvite(notification) {
  const tournament = state.tournaments.find((item) => item.id === notification.tournamentId);
  if (!tournament) return;
  if (isTournamentAtCapacity(tournament)) {
    notification.title = "لم يتم قبول الدعوة";
    notification.body = `اكتمل عدد المشاركين في ${notification.tournamentName}`;
    notification.status = "declined";
    return;
  }
  tournament.joined = true;
  tournament.active = true;
  tournament.friends = (tournament.friends || 0) + 1;
  tournament.rank = tournament.rank || tournament.friends;
  notification.route = `/tournament/${tournament.id}`;
  queueTournamentPersist(tournament);
}

function updateNotificationBadges() {
  const unreadCount = enabledNotifications().filter((notification) => notification.unread).length;
  document.querySelectorAll(".notification-bell").forEach((bell) => {
    const badge = bell.querySelector("span");
    if (!unreadCount) {
      if (badge) badge.remove();
      return;
    }
    if (badge) {
      badge.textContent = unreadCount;
      return;
    }
    bell.insertAdjacentHTML("beforeend", `<span>${unreadCount}</span>`);
  });
}

function render() {
  stopCountdownTimer();
  stopLiveAutoRefresh();
  closeModal();
  if (state.backend.loading) {
    updateBottomNav(state.route);
    return renderAuthLoading();
  }
  const route = normalizeAuthRoute(state.route);
  state.route = route;
  syncRouteHash(route);
  updateBottomNav(route);
  window.setTimeout(() => applyTranslations(app), 0);

  if (route === "/login" || route === "/signup") return renderAuth(route);
  if (route === "/" || route === "/home") return renderHome();
  if (route === "/search") return renderSearch();
  if (route === "/create-tournament") return renderChampionshipsPage();
  if (route === "/create-tournament/new") return renderCreateTournament();
  if (route === "/live") return renderLive();
  if (route.startsWith("/tournament/")) {
    const manageMatch = route.match(/^\/tournament\/(.+)\/manage(?:\/([^/]+))?$/);
    if (manageMatch) return renderTournamentManage(readRoutePart(manageMatch[1]), manageMatch[2] || "");
    const playerMatch = route.match(/^\/tournament\/(.+)\/player$/);
    if (playerMatch) return renderTournament(readRoutePart(playerMatch[1]), { forcePlayer: true });
    const tournamentMatch = route.match(/^\/tournament\/(.+)$/);
    if (tournamentMatch) return renderTournament(readRoutePart(tournamentMatch[1]));
  }
  if (route.startsWith("/user/")) return renderUser(route.split("/").pop());
  if (route.startsWith("/challenges/")) return renderChallenges(route.split("/").pop());

  renderNotFound();
}

function normalizeAuthRoute(route = state.route) {
  if (!state.backend.configured) return route;
  if (state.backend.session?.user?.id) {
    return route === "/login" || route === "/signup" ? "/" : route;
  }
  return isPublicAuthRoute(route) ? route : "/login";
}

function isPublicAuthRoute(route = state.route) {
  return route === "/login" || route === "/signup";
}

function renderAuthLoading() {
  document.body.classList.add("auth-screen");
  app.innerHTML = `
    <section class="auth-layout">
      <div class="card auth-card stack auth-loading-card">
        ${appLogoHtml("auth-logo")}
        <p class="muted">جاري التحقق من الجلسة...</p>
      </div>
    </section>
  `;
}

function syncRouteHash(route) {
  const currentHashRoute = window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "";
  if (currentHashRoute === route) return;
  state.isHistoryNavigation = true;
  window.location.hash = route;
}

function updateBottomNav(route) {
  document.body.classList.toggle("auth-screen", isPublicAuthRoute(route));
  document.querySelectorAll(".bottom-nav [data-route]").forEach((button) => {
    const target = button.dataset.route;
    const isHome = target === "/" && (route === "/" || route === "/home");
    const isSearch = target === "/search" && route === "/search";
    const isCreate = target === "/create-tournament" && route.startsWith("/create-tournament");
    const isLive = target === "/live" && route === "/live";
    button.classList.toggle("active", isHome || isSearch || isCreate || isLive);
  });
}

function getInitialRoute() {
  if (window.location.hash.startsWith("#/")) return window.location.hash.slice(1);
  if (window.location.protocol === "file:" && window.location.pathname.toLowerCase().endsWith("/index.html")) return "/";
  return window.location.pathname === "/index.html" ? "/" : window.location.pathname;
}

function appConfigEndpoint() {
  if (window.location.protocol === "file:") return "https://www.pickaside.mobile/api/app-config";
  return "/api/app-config";
}

function authRedirectUrl() {
  const origin = window.location.protocol === "file:" ? "https://www.pickaside.mobile" : window.location.origin;
  return `${origin}/?authcheck=1#/login`;
}

function welcomeEmailEndpoint() {
  if (window.location.protocol === "file:") return "https://www.pickaside.mobile/api/welcome-email";
  return "/api/welcome-email";
}

async function initializeBackend() {
  loadLocalAppState();
  state.backend.loading = true;
  state.backend.error = "";
  try {
    const response = await fetch(appConfigEndpoint(), { cache: "no-store" });
    const config = response.ok ? await response.json() : {};
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase?.createClient) {
      state.backend.loading = false;
      state.backend.configured = false;
      state.backend.error = "Supabase is not configured";
      return;
    }
    state.backend.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    state.backend.configured = true;
    const { data } = await state.backend.client.auth.getSession();
    state.backend.session = data.session || null;
    if (state.backend.session) {
      await loadCurrentUserProfile(state.backend.session);
      await loadBackendData();
    }
    state.backend.client.auth.onAuthStateChange(async (_event, session) => {
      state.backend.session = session || null;
      if (session) {
        await loadCurrentUserProfile(session);
        await loadBackendData();
      }
      render();
    });
  } catch (error) {
    state.backend.configured = false;
    state.backend.error = error.message || "Backend configuration failed";
  } finally {
    state.backend.loading = false;
  }
}

async function loadCurrentUserProfile(session) {
  const user = session?.user;
  if (!user || !state.backend.client) return;
  let { data, error } = await state.backend.client
    .from("profiles")
    .select("id, username, display_name, phone_number, avatar_url, favorite_team, followers_count, following_count, correct_predictions, total_predictions")
    .eq("id", user.id)
    .maybeSingle();
  if (isMissingPhoneColumnError(error)) {
    const fallback = await state.backend.client
      .from("profiles")
      .select("id, username, display_name, avatar_url, favorite_team, followers_count, following_count, correct_predictions, total_predictions")
      .eq("id", user.id)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return;
  if (!data) {
    await upsertCurrentUserProfile(user, {
      username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
      displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "Pick A Side User",
      phone: user.user_metadata?.phone || "",
      timezone: normalizeTimezone(user.user_metadata?.timezone || state.currentUser.timezone)
    });
    return;
  }
  const backendUser = profileToCurrentUser(data);
  const userTimezone = normalizeTimezone(user.user_metadata?.timezone || state.currentUser.timezone);
  state.currentUser = {
    ...state.currentUser,
    ...backendUser,
    phone: backendUser.phone || state.currentUser.phone,
    ...timezoneState(userTimezone),
    avatarUrl: backendUser.avatarUrl || state.currentUser.avatarUrl,
    favoriteTeam: backendUser.favoriteTeam || state.currentUser.favoriteTeam
  };
  saveLocalAppState();
}

async function upsertCurrentUserProfile(user, profile) {
  if (!user || !state.backend.client) return;
  const row = {
    id: user.id,
    username: profile.username,
    display_name: profile.displayName,
    phone_number: profile.phone || "",
    avatar_url: profile.avatarUrl || "",
    favorite_team: profile.favoriteTeam || "",
    updated_at: new Date().toISOString()
  };
  let { data, error } = await state.backend.client
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select("id, username, display_name, phone_number, avatar_url, favorite_team, followers_count, following_count, correct_predictions, total_predictions")
    .single();
  if (isMissingPhoneColumnError(error)) {
    const { phone_number, ...fallbackRow } = row;
    const fallback = await state.backend.client
      .from("profiles")
      .upsert(fallbackRow, { onConflict: "id" })
      .select("id, username, display_name, avatar_url, favorite_team, followers_count, following_count, correct_predictions, total_predictions")
      .single();
    data = fallback.data;
    error = fallback.error;
  }
  if (!error && data) {
    const previousTimezone = normalizeTimezone(profile.timezone || state.currentUser.timezone);
    state.currentUser = {
      ...state.currentUser,
      ...profileToCurrentUser(data),
      ...timezoneState(previousTimezone)
    };
    saveLocalAppState();
  }
}

function profileToCurrentUser(profile) {
  const displayName = profile.display_name || profile.username || "Pick A Side User";
  return {
    name: displayName,
    handle: `@${profile.username || "user"}`,
    phone: profile.phone_number || "",
    avatar: displayName.trim().charAt(0).toUpperCase() || "P",
    avatarUrl: profile.avatar_url || "",
    favoriteTeam: profile.favorite_team || "",
    correctPredictions: Number(profile.correct_predictions) || 0,
    totalPredictions: Number(profile.total_predictions) || 0,
    followers: Array.from({ length: Number(profile.followers_count) || 0 }, (_, index) => `follower-${index + 1}`),
    following: Array.from({ length: Number(profile.following_count) || 0 }, (_, index) => `following-${index + 1}`)
  };
}

function normalizeTimezone(timezone) {
  return timezoneOptions.some((option) => option.id === timezone) ? timezone : "Asia/Dubai";
}

function timezoneOption(timezone = state.currentUser.timezone) {
  const id = normalizeTimezone(timezone);
  return timezoneOptions.find((option) => option.id === id) || timezoneOptions[0];
}

function timezoneState(timezone) {
  const option = timezoneOption(timezone);
  return {
    timezone: option.id,
    timezoneLabel: option.label,
    gmtOffset: option.offset
  };
}

function timezoneDisplay(timezone = state.currentUser.timezone) {
  const option = timezoneOption(timezone);
  return `${option.label} ${option.gmt}`;
}

function timezoneSelectHtml(id, selected = state.currentUser.timezone) {
  const current = normalizeTimezone(selected);
  return `
    <select class="input" id="${id}" required>
      ${timezoneOptions.map((option) => `
        <option value="${option.id}" ${option.id === current ? "selected" : ""}>${option.label} · ${option.gmt}</option>
      `).join("")}
    </select>
  `;
}

function isMissingPhoneColumnError(error) {
  return Boolean(error && /phone_number|column/i.test(error.message || ""));
}

function isBackendReady() {
  return Boolean(state.backend.configured && state.backend.client && state.backend.session?.user?.id);
}

function makeTournamentId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `t-${Date.now()}`;
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function mergeTournamentSnapshots(primary = [], secondary = []) {
  const byId = new Map();
  [...secondary, ...primary].forEach((tournament) => {
    if (!tournament?.id) return;
    const previous = byId.get(tournament.id) || {};
    byId.set(tournament.id, { ...previous, ...tournament });
  });
  return Array.from(byId.values());
}

function tournamentBackupKey(tournamentId) {
  return `${LOCAL_TOURNAMENT_KEY_PREFIX}${tournamentId}`;
}

function saveTournamentLocalBackup(tournament) {
  if (!tournament?.id) return true;
  try {
    localStorage.setItem(tournamentBackupKey(tournament.id), JSON.stringify({
      savedAt: new Date().toISOString(),
      tournament
    }));
    return true;
  } catch {
    state.backend.error = "تعذر حفظ البطولة محلياً على هذا الجهاز.";
    return false;
  }
}

function loadTournamentLocalBackups() {
  const backups = [];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(LOCAL_TOURNAMENT_KEY_PREFIX)) continue;
      const saved = safeJsonParse(localStorage.getItem(key), null);
      const tournament = saved?.tournament;
      if (tournament?.id && !tournament.cancelled) backups.push(tournament);
    }
  } catch {
    return backups;
  }
  return backups;
}

function localStateSnapshot() {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    language: state.language,
    theme: state.theme,
    currentUser: state.currentUser,
    tournaments: state.tournaments,
    predictions: state.predictions,
    quickPicks: state.quickPicks,
    awardPicks: state.awardPicks,
    notifications: state.notifications,
    notificationPreferences: state.notificationPreferences,
    selectedMatchdayByTournament: state.selectedMatchdayByTournament,
    selectedLiveRoundByTournament: state.selectedLiveRoundByTournament,
    selectedLiveMatchdayByTournament: state.selectedLiveMatchdayByTournament,
    selectedLiveScopeByTournament: state.selectedLiveScopeByTournament,
    searchHistory: state.searchHistory
  };
}

function loadLocalAppState() {
  if (localStateLoaded) return;
  localStateLoaded = true;
  let saved = null;
  const tournamentBackups = loadTournamentLocalBackups();
  try {
    saved = safeJsonParse(localStorage.getItem(LOCAL_STATE_KEY), null);
  } catch {
    saved = null;
  }
  if (!saved || typeof saved !== "object") {
    if (tournamentBackups.length) {
      state.tournaments = mergeTournamentSnapshots(tournamentBackups, state.tournaments).map(normalizeTournamentData).filter(Boolean);
    }
    return;
  }
  if (saved.language) state.language = saved.language;
  if (saved.theme) state.theme = saved.theme;
  if (saved.currentUser) state.currentUser = { ...state.currentUser, ...saved.currentUser };
  if (Array.isArray(saved.tournaments) || tournamentBackups.length) {
    state.tournaments = mergeTournamentSnapshots([...(saved.tournaments || []), ...tournamentBackups], state.tournaments).map(normalizeTournamentData).filter(Boolean);
  }
  if (saved.predictions && typeof saved.predictions === "object") state.predictions = { ...state.predictions, ...saved.predictions };
  if (saved.quickPicks && typeof saved.quickPicks === "object") state.quickPicks = { ...state.quickPicks, ...saved.quickPicks };
  if (saved.awardPicks && typeof saved.awardPicks === "object") state.awardPicks = { ...state.awardPicks, ...saved.awardPicks };
  if (Array.isArray(saved.notifications)) state.notifications = saved.notifications;
  if (saved.notificationPreferences && typeof saved.notificationPreferences === "object") {
    state.notificationPreferences = { ...state.notificationPreferences, ...saved.notificationPreferences };
  }
  if (saved.selectedMatchdayByTournament && typeof saved.selectedMatchdayByTournament === "object") {
    state.selectedMatchdayByTournament = { ...state.selectedMatchdayByTournament, ...saved.selectedMatchdayByTournament };
  }
  if (saved.selectedLiveRoundByTournament && typeof saved.selectedLiveRoundByTournament === "object") {
    state.selectedLiveRoundByTournament = { ...state.selectedLiveRoundByTournament, ...saved.selectedLiveRoundByTournament };
  }
  if (saved.selectedLiveMatchdayByTournament && typeof saved.selectedLiveMatchdayByTournament === "object") {
    state.selectedLiveMatchdayByTournament = { ...state.selectedLiveMatchdayByTournament, ...saved.selectedLiveMatchdayByTournament };
  }
  if (saved.selectedLiveScopeByTournament && typeof saved.selectedLiveScopeByTournament === "object") {
    state.selectedLiveScopeByTournament = { ...state.selectedLiveScopeByTournament, ...saved.selectedLiveScopeByTournament };
  }
  if (Array.isArray(saved.searchHistory)) state.searchHistory = saved.searchHistory;
}

function saveLocalAppState() {
  try {
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(localStateSnapshot()));
    if (state.backend.error === "تعذر حفظ البيانات محلياً على هذا الجهاز.") state.backend.error = "";
  } catch {
    state.backend.error = "تعذر حفظ البيانات محلياً على هذا الجهاز.";
  }
}

function profileMapById(profiles = []) {
  return new Map((profiles || []).map((profile) => [profile.id, profile]));
}

async function loadBackendData() {
  if (!isBackendReady()) return;
  await loadBackendTournaments();
}

async function loadBackendTournaments() {
  if (!isBackendReady()) return;
  const client = state.backend.client;
  const userId = state.backend.session.user.id;
  const [{ data: tournaments, error: tournamentsError }, { data: participants, error: participantsError }] = await Promise.all([
    client
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false }),
    client
      .from("tournament_participants")
      .select("tournament_id, profile_id, role, status, points, correct_predictions, wrong_predictions")
      .eq("profile_id", userId)
  ]);

  if (tournamentsError || participantsError) {
    state.backend.error = tournamentsError?.message || participantsError?.message || "";
    return;
  }

  const ownerIds = [...new Set((tournaments || []).map((tournament) => tournament.owner_id).filter(Boolean))];
  let owners = [];
  if (ownerIds.length) {
    const { data } = await client
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", ownerIds);
    owners = data || [];
  }

  const ownersById = profileMapById(owners);
  const participantByTournament = new Map((participants || []).map((participant) => [participant.tournament_id, participant]));
  const backendTournaments = (tournaments || []).map((row) => {
    mergeStoredTournamentState(row.settings || {});
    return dbTournamentToApp(row, participantByTournament.get(row.id), ownersById.get(row.owner_id));
  });
  mergeBackendTournaments(backendTournaments);
}

function tournamentScopedState(source, tournamentId) {
  const prefix = `${tournamentId}:`;
  return Object.fromEntries(Object.entries(source || {}).filter(([key]) => key.startsWith(prefix)));
}

function mergeStoredTournamentState(settings = {}) {
  Object.assign(state.predictions, settings.predictions || {});
  Object.assign(state.quickPicks, settings.quickPicks || {});
  Object.assign(state.awardPicks, settings.awardPicks || {});
}

function mergeBackendTournaments(backendTournaments) {
  const localById = new Map(state.tournaments.map((tournament) => [tournament.id, tournament]));
  const mergedBackend = backendTournaments.map((backendTournament) => {
    const localTournament = localById.get(backendTournament.id);
    if (!localTournament) return normalizeTournamentData(backendTournament);
    return normalizeTournamentData(mergeBackendTournamentWithLocal(backendTournament, localTournament));
  });
  const backendIds = new Set(backendTournaments.map((tournament) => tournament.id));
  const localOnly = state.tournaments.filter((tournament) => !backendIds.has(tournament.id)).map(normalizeTournamentData).filter(Boolean);
  state.tournaments = [...mergedBackend, ...localOnly].filter(Boolean);
  saveLocalAppState();
}

function mergeBackendTournamentWithLocal(backendTournament, localTournament) {
  const localUnsynced = localTournament.backendSynced === false || Boolean(localTournament.backendSyncError);
  return {
    ...localTournament,
    ...backendTournament,
    predictions: localTournament.predictions || backendTournament.predictions,
    quickPicks: localTournament.quickPicks || backendTournament.quickPicks,
    editingPredictions: localTournament.editingPredictions || backendTournament.editingPredictions,
    backendSynced: !localUnsynced,
    backendSyncError: localUnsynced ? localTournament.backendSyncError || "" : ""
  };
}

function dbTournamentToApp(row, participation, ownerProfile) {
  const isOwner = row.owner_id === state.backend.session?.user?.id;
  const ownerName = ownerProfile?.display_name || (isOwner ? state.currentUser.name : "صاحب البطولة");
  const ownerUsername = ownerProfile?.username || (isOwner ? state.currentUser.handle.replace("@", "") : "owner");
  const settings = row.settings || {};
  const matchesByRound = row.matches_by_round || emptyMatchesByRound();
  const roundIds = Array.isArray(row.round_ids) && row.round_ids.length
    ? row.round_ids
    : roundOptionsFromMatches(matchesByRound).map((round) => round.id);

  return {
    id: row.id,
    name: row.name,
    sourceMode: settings.sourceMode || (settings.manual ? "manual" : "official"),
    manual: Boolean(settings.manual || settings.sourceMode === "manual"),
    manualTeams: settings.manualTeams || [],
    manualMatches: settings.manualMatches || [],
    officialCompetitionId: row.official_competition_api_id ? `api-${row.official_competition_api_id}-${row.official_competition_season || ""}` : "",
    officialCompetitionApiId: row.official_competition_api_id || "",
    officialCompetitionSeason: row.official_competition_season || "",
    officialCompetitionLogoUrl: row.official_competition_logo_url || "",
    officialCompetitionCode: settings.officialCompetitionCode || "",
    officialCompetitionName: row.official_competition_name || row.name,
    matchesByRound,
    fixturesStatus: settings.fixturesStatus || "",
    logoFileName: settings.logoFileName || "",
    coverImageUrl: row.cover_image_url || "",
    postImageFileName: settings.postImageFileName || "",
    public: row.is_public,
    publicCode: row.is_public ? (settings.publicCode || row.invite_code || "") : "",
    active: row.is_active,
    draft: row.is_draft,
    setupIncomplete: row.setup_incomplete,
    cancelled: Boolean(settings.cancelled),
    cancelReason: settings.cancelReason || "",
    resultsVoided: Boolean(settings.resultsVoided),
    joinClosed: Boolean(settings.joinClosed),
    activationReady: Boolean(settings.activationReady),
    startDate: row.start_date,
    hasPrizes: row.has_prizes,
    joined: isOwner || Boolean(participation),
    owner: ownerName,
    ownerUsername,
    rank: Number(settings.rank) || 1,
    friends: Number(settings.friends) || Number(settings.participantCount) || (participation ? 1 : 0),
    maxPlayers: row.max_players,
    participants: settings.participants || (participation || isOwner ? [state.currentUser.name] : []),
    points: Number(participation?.points ?? settings.points ?? 0),
    correct: Number(participation?.correct_predictions ?? settings.correct ?? 0),
    wrong: Number(participation?.wrong_predictions ?? settings.wrong ?? 0),
    budget: settings.budget ?? null,
    minPoints: settings.minPoints ?? null,
    pointRules: settings.pointRules || {},
    pointRulesSaved: settings.pointRulesSaved || {},
    rulesConfigured: Boolean(settings.rulesConfigured),
    roundIds,
    startingRound: row.starting_round,
    currentRound: row.current_round,
    inviteCode: row.invite_code,
    awardCategories: row.award_categories || [],
    prizes: row.prizes || [],
    joinRequests: settings.joinRequests || [],
    invitedUsers: settings.invitedUsers || [],
    sentInvites: settings.sentInvites || [],
    adminTeam: settings.adminTeam || [],
    localUpdatedAt: settings.localUpdatedAt || row.updated_at || "",
    backendSynced: true
  };
}

function appTournamentToDb(tournament) {
  const officialApiId = Number(tournament.officialCompetitionApiId) || null;
  const season = Number(tournament.officialCompetitionSeason) || null;
  return {
    id: tournament.id,
    owner_id: state.backend.session.user.id,
    name: tournament.name,
    official_competition_api_id: officialApiId,
    official_competition_name: tournament.officialCompetitionName || tournament.name,
    official_competition_season: season,
    official_competition_logo_url: tournament.officialCompetitionLogoUrl || null,
    cover_image_url: tournament.coverImageUrl || null,
    is_public: Boolean(tournament.public),
    invite_code: tournament.inviteCode || null,
    max_players: Number(tournament.maxPlayers) || 16,
    starting_round: tournament.startingRound || "group",
    current_round: tournament.currentRound || tournament.startingRound || "group",
    start_date: tournament.startDate,
    has_prizes: Boolean(tournament.hasPrizes),
    is_active: Boolean(tournament.active && !tournament.cancelled),
    is_draft: Boolean(tournament.draft),
    setup_incomplete: Boolean(tournament.setupIncomplete),
    matches_by_round: tournament.matchesByRound || emptyMatchesByRound(),
    round_ids: tournament.roundIds || roundOptionsFromMatches(tournament.matchesByRound || emptyMatchesByRound()).map((round) => round.id),
    prizes: tournament.prizes || [],
    award_categories: tournament.awardCategories || [],
    settings: {
      sourceMode: tournament.sourceMode || (tournament.manual ? "manual" : "official"),
      manual: Boolean(tournament.manual || tournament.sourceMode === "manual"),
      manualTeams: tournament.manualTeams || [],
      officialCompetitionCode: tournament.officialCompetitionCode || "",
      fixturesStatus: tournament.fixturesStatus || "",
      logoFileName: tournament.logoFileName || "",
      postImageFileName: tournament.postImageFileName || "",
      publicCode: tournament.publicCode || "",
      activationReady: Boolean(tournament.activationReady),
      rank: tournament.rank || 1,
      friends: tournament.friends || 1,
      participantCount: Math.max(tournament.friends || 0, (tournament.participants || []).length),
      participants: tournament.participants || [],
      points: tournament.points || 0,
      correct: tournament.correct || 0,
      wrong: tournament.wrong || 0,
      budget: tournament.budget ?? null,
      minPoints: tournament.minPoints ?? null,
      pointRules: tournament.pointRules || {},
      pointRulesSaved: tournament.pointRulesSaved || {},
      rulesConfigured: Boolean(tournament.rulesConfigured),
      joinRequests: tournament.joinRequests || [],
      invitedUsers: tournament.invitedUsers || [],
      sentInvites: tournament.sentInvites || [],
      adminTeam: tournament.adminTeam || [],
      joinClosed: Boolean(tournament.joinClosed),
      cancelled: Boolean(tournament.cancelled),
      cancelReason: tournament.cancelReason || "",
      resultsVoided: Boolean(tournament.resultsVoided),
      localUpdatedAt: tournament.localUpdatedAt || new Date().toISOString(),
      predictions: tournamentScopedState(state.predictions, tournament.id),
      quickPicks: tournamentScopedState(state.quickPicks, tournament.id),
      awardPicks: tournamentScopedState(state.awardPicks, tournament.id)
    },
    updated_at: new Date().toISOString()
  };
}

async function persistTournamentToBackend(tournament) {
  if (!isBackendReady() || !tournament) return false;
  const client = state.backend.client;
  const { error } = await client
    .from("tournaments")
    .upsert(appTournamentToDb(tournament), { onConflict: "id" });
  if (error) throw error;
  const participantRow = {
    tournament_id: tournament.id,
    profile_id: state.backend.session.user.id,
    role: isTournamentOwner(tournament) ? "owner" : "player",
    status: "joined",
    points: Number(tournament.points) || 0,
    correct_predictions: Number(tournament.correct) || 0,
    wrong_predictions: Number(tournament.wrong) || 0
  };
  const { error: participantError } = await client
    .from("tournament_participants")
    .upsert(participantRow, { onConflict: "tournament_id,profile_id" });
  if (participantError) throw participantError;
  tournament.backendSynced = true;
  tournament.backendSyncError = "";
  saveTournamentLocalBackup(tournament);
  saveLocalAppState();
  return true;
}

function queueTournamentPersist(tournament) {
  if (!tournament) return;
  tournament.backendSynced = false;
  tournament.localUpdatedAt = new Date().toISOString();
  saveTournamentLocalBackup(tournament);
  saveLocalAppState();
  if (!isBackendReady()) return;
  persistTournamentToBackend(tournament).catch((error) => {
    tournament.backendSyncError = error.message || "تعذر حفظ البطولة في قاعدة البيانات.";
    state.backend.error = tournament.backendSyncError;
    saveLocalAppState();
  });
}

async function deleteTournamentFromBackend(tournamentId) {
  if (!isBackendReady() || !tournamentId) return false;
  const client = state.backend.client;
  await client.from("tournament_participants").delete().eq("tournament_id", tournamentId);
  const { error } = await client.from("tournaments").delete().eq("id", tournamentId);
  if (error) throw error;
  try {
    localStorage.removeItem(tournamentBackupKey(tournamentId));
  } catch {
    // Ignore local cleanup failures.
  }
  return true;
}

function renderAuth(route) {
  const isSignup = route === "/signup";
  const backendStatus = authBackendStatusHtml();
  app.innerHTML = `
    <section class="auth-layout">
      <div class="hero-panel">
        <div class="brand">${appLogoHtml("brand-logo")}</div>
        <div>
          <h1>Pick A Side</h1>
          <p>A strategic football prediction game built around point budgets, proportional jackpots, and locked tournament stages.</p>
        </div>
      </div>
      <form class="card auth-card stack" id="auth-form">
        <h2>${isSignup ? "إنشاء حساب" : "تسجيل الدخول"}</h2>
        ${backendStatus}
        <div class="field">
          <label>البريد الإلكتروني</label>
          <input class="input" id="auth-email" type="email" autocomplete="email" required>
        </div>
        ${isSignup ? `
          <div class="field">
            <label>اسم المستخدم</label>
            <input class="input" id="auth-username" type="text" autocomplete="username" required>
          </div>
          <div class="field">
            <label>الاسم الظاهر</label>
            <input class="input" id="auth-display-name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label>رقم الهاتف</label>
            <input class="input" id="auth-phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="+9715XXXXXXXX">
          </div>
          <div class="field">
            <label>الدولة / التوقيت</label>
            ${timezoneSelectHtml("auth-timezone")}
          </div>` : ""}
        <div class="field">
          <label>كلمة المرور</label>
          <input class="input" id="auth-password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" required>
        </div>
        <div class="error-text" id="auth-error"></div>
        <button class="btn accent" type="submit">${isSignup ? "إنشاء الحساب" : "دخول"}</button>
        <button class="btn ghost" type="button" data-route="${isSignup ? "/login" : "/signup"}">
          ${isSignup ? "لدي حساب" : "إنشاء حساب جديد"}
        </button>
      </form>
    </section>
  `;
  document.querySelector("#auth-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleAuthSubmit(isSignup);
  });
}

function authBackendStatusHtml() {
  if (state.backend.loading) {
    return `<div class="notice">جاري تجهيز الاتصال بالحسابات...</div>`;
  }
  if (state.backend.configured) {
    return `<div class="notice success-notice">نظام الحسابات الحقيقي جاهز.</div>`;
  }
  return `
    <div class="notice danger-notice">
      نظام الحسابات الحقيقي غير مفعّل بعد. أضف مفاتيح Supabase في Vercel: SUPABASE_URL و SUPABASE_ANON_KEY.
    </div>
  `;
}

async function handleAuthSubmit(isSignup) {
  const errorBox = document.querySelector("#auth-error");
  const email = document.querySelector("#auth-email")?.value.trim();
  const password = document.querySelector("#auth-password")?.value;
  const username = document.querySelector("#auth-username")?.value.trim().replace(/^@/, "").toLowerCase();
  const displayName = document.querySelector("#auth-display-name")?.value.trim();
  const phone = document.querySelector("#auth-phone")?.value.trim();
  const timezone = normalizeTimezone(document.querySelector("#auth-timezone")?.value || state.currentUser.timezone);

  if (!state.backend.configured || !state.backend.client) {
    errorBox.textContent = "لا يمكن إنشاء حساب حقيقي قبل تفعيل Supabase في Vercel.";
    return;
  }

  try {
    if (isSignup) {
      if (!phone) {
        errorBox.textContent = "رقم الهاتف مطلوب لإنشاء الحساب.";
        return;
      }
      const { data, error } = await state.backend.client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authRedirectUrl(),
          data: {
            username,
            display_name: displayName || username,
            phone,
            timezone
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        await upsertCurrentUserProfile(data.user, { username, displayName: displayName || username, phone, timezone });
        sendWelcomeEmail({ email, username, displayName: displayName || username });
      }
      if (!data.session) {
        const signInAttempt = await state.backend.client.auth.signInWithPassword({ email, password });
        if (signInAttempt.error) {
          const message = String(signInAttempt.error.message || "");
          if (/email.*confirm|confirm.*email|not confirmed/i.test(message)) {
            errorBox.textContent = "تم إنشاء الحساب. تأكيد البريد مفعّل حالياً، افتح رابط التأكيد من بريدك ثم سيتم توجيهك إلى صفحة الدخول.";
          } else {
            errorBox.textContent = message || "تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائياً.";
          }
          return;
        }
        state.backend.session = signInAttempt.data.session;
        await loadCurrentUserProfile(signInAttempt.data.session);
      } else {
        state.backend.session = data.session;
      }
    } else {
      const { data, error } = await state.backend.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      state.backend.session = data.session;
      await loadCurrentUserProfile(data.session);
    }
    await loadBackendData();
    navigate("/");
  } catch (error) {
    errorBox.textContent = error.message || "تعذر تنفيذ العملية حالياً.";
  }
}

async function sendWelcomeEmail(payload) {
  try {
    await fetch(welcomeEmailEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (_error) {
    // Welcome email should never block account creation.
  }
}

function renderHome() {
  const user = state.currentUser;
  const efficiency = user.totalPredictions ? Math.round((user.correctPredictions / user.totalPredictions) * 100) : 0;
  const activeTournaments = state.tournaments.filter((item) => item.active && item.joined && !item.draft && !item.cancelled);
  const pendingVoteTasks = getHomePendingVoteTasks();
  app.innerHTML = `
    <section class="home-stack">
      <header class="home-header page-topbar main-auto-hide-chrome">
        <div class="topbar-side">
          ${notificationBell()}
        </div>
        <button class="page-title-btn" data-route="/">
          ${appLogoHtml("topbar-logo")}
        </button>
        <div class="home-header-actions">
          <button class="home-menu-btn" type="button" id="home-menu-btn" aria-label="Settings" title="Settings">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      <section class="panel profile-header">
        <div class="profile-top-row">
          <div class="profile-identity">
            <div class="profile-avatar-ring" aria-label="Profile photo">
              ${avatarHtml(user)}
            </div>
          </div>
          <div class="profile-summary">
            <div class="profile-bio">
              <h1 class="profile-name">${user.name}</h1>
              <div class="muted">${user.handle}</div>
              <div class="muted">${tr("Favorite team")}: ${user.favoriteTeam || tr("Not set")}</div>
            </div>
          </div>
        </div>
        <div class="stats-row profile-stats-row">
          <div class="stat-column">
            <strong class="highlight">${efficiency}%</strong>
            <span>Accuracy</span>
          </div>
          <button class="stat-column" id="followers-btn">
            <strong>${user.followers.length}</strong>
            <span>Followers</span>
          </button>
          <button class="stat-column" id="following-btn">
            <strong>${user.following.length}</strong>
            <span>Following</span>
          </button>
        </div>
        <div class="profile-actions">
          <button class="btn ghost compact-btn" id="edit-profile-btn">Edit Profile</button>
          <button class="btn ghost compact-btn" id="share-profile-btn">Share Profile</button>
        </div>
      </section>

      <section class="panel home-vote-shell">
        <div class="carousel-label">
          <h2 class="section-title">تصويت مطلوب</h2>
          <span class="muted">${pendingVoteTasks.length} مباراة</span>
        </div>
        <div class="home-vote-list">
          ${pendingVoteTasks.length ? pendingVoteTasks.map(homeVoteTaskCard).join("") : `<p class="muted empty-row">لا توجد مباريات تحتاج تصويت حالياً.</p>`}
        </div>
      </section>

      <section class="panel results-shell">
        <div class="carousel-label">
          <h2 class="section-title">My Results</h2>
        </div>
        <div class="carousel" id="results-carousel">
          ${activeTournaments.map(tournamentCard).join("")}
        </div>
        ${carouselDots(activeTournaments.length)}
      </section>

    </section>
  `;

  document.querySelector("#followers-btn").addEventListener("click", () => peopleModal("followers"));
  document.querySelector("#following-btn").addEventListener("click", () => peopleModal("following"));
  document.querySelector("#edit-profile-btn").addEventListener("click", editProfileModal);
  document.querySelector("#share-profile-btn").addEventListener("click", shareProfile);
  document.querySelector("#home-menu-btn").addEventListener("click", profileSettingsModal);
  document.querySelectorAll("[data-home-vote-task]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRound = button.dataset.homeVoteRound;
      navigate(`/tournament/${button.dataset.homeVoteTask}/player`);
    });
  });
  setupCarouselDots();
  setupMainChromeAutoHide(".home-header");
  startMatchCountdowns();
}

function tournamentCard(tournament) {
  const rankLabel = tr("Rank");
  return `
    <button class="result-card" data-route="/tournament/${tournament.id}/player">
      <div class="result-card-head">
        <h3>${tournament.name}</h3>
        <span class="rank-badge">${rankLabel} #${tournament.rank || "-"}</span>
      </div>
      <div class="stat-line"><span class="muted">${tr("Points")}</span><strong>${tournament.points}</strong></div>
      <div class="prediction-counters">
        <span class="correct">● C: ${tournament.correct}</span>
        <span class="wrong">● W: ${tournament.wrong}</span>
      </div>
    </button>
  `;
}

function getHomePendingVoteTasks() {
  return state.tournaments
    .filter((tournament) => tournament.active && tournament.joined && !tournament.draft && !tournament.cancelled)
    .flatMap((tournament) => {
      const round = getTournamentPlayerActiveRound(tournament);
      const roundLabel = rounds.find((item) => item.id === round)?.label || "الدور الحالي";
      const roundMatches = getTournamentPredictionSourceMatches(tournament, round);
      const matches = getVisiblePredictionMatchesForRound(tournament, round, roundMatches);
      return matches
        .filter((match) => !isPredictionComplete(tournament.id, round, match.id))
        .map((match) => {
          const kickoff = new Date(match.kickoff).getTime();
          const lockAt = kickoff - PREDICTION_LOCK_MINUTES * 60 * 1000;
          const displayRoundLabel = round === "group" ? `${roundLabel} · ${getGroupMatchdayLabel(match, roundMatches)}` : roundLabel;
          return { tournament, round, roundLabel: displayRoundLabel, match, lockAt, kickoff };
        })
        .filter((task) => Date.now() < task.lockAt);
    })
    .sort((a, b) => a.lockAt - b.lockAt)
    .slice(0, 6);
}

function homeVoteTaskCard(task) {
  return `
    <article class="home-vote-card">
      <div class="home-vote-copy">
        <strong>${task.tournament.name}</strong>
        <small>${task.roundLabel}</small>
        <div class="home-vote-match">${matchIdentityHtml(task.match)}</div>
      </div>
      <div class="home-vote-side">
        <span class="match-countdown mini-vote-countdown" data-match-countdown data-countdown-mode="match" data-kickoff="${new Date(task.kickoff).toISOString()}" data-lock-at="${task.lockAt}">
          <small data-countdown-label>يغلق التصويت</small>
          <b data-countdown-value>--:--:--</b>
          <small data-countdown-lock></small>
        </span>
        <button class="btn accent compact-btn" type="button" data-home-vote-task="${task.tournament.id}" data-home-vote-round="${task.round}">تصويت</button>
      </div>
    </article>
  `;
}

function carouselDots(count) {
  if (count <= 1) return "";
  return `
    <div class="carousel-dots" id="results-carousel-dots" aria-label="Carousel position">
      ${Array.from({ length: count }, (_, index) => `
        <button class="carousel-dot ${index === 0 ? "active" : ""}" type="button" data-carousel-dot="${index}" aria-label="Go to item ${index + 1}"></button>
      `).join("")}
    </div>
  `;
}

function setupCarouselDots() {
  const carousel = document.querySelector("#results-carousel");
  const dots = [...document.querySelectorAll("[data-carousel-dot]")];
  if (!carousel || !dots.length) return;

  const cards = [...carousel.querySelectorAll(".result-card")];
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let moved = false;
  let suppressClick = false;
  let pressedRoute = "";

  const setActiveDot = () => {
    const carouselBox = carousel.getBoundingClientRect();
    const carouselCenter = carouselBox.left + carouselBox.width / 2;
    const index = cards.reduce((closestIndex, card, currentIndex) => {
      const cardBox = card.getBoundingClientRect();
      const cardCenter = cardBox.left + cardBox.width / 2;
      const closestBox = cards[closestIndex].getBoundingClientRect();
      const closestCenter = closestBox.left + closestBox.width / 2;
      return Math.abs(cardCenter - carouselCenter) < Math.abs(closestCenter - carouselCenter) ? currentIndex : closestIndex;
    }, 0);
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
  };

  carousel.addEventListener("scroll", () => window.requestAnimationFrame(setActiveDot), { passive: true });
  carousel.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    isDragging = true;
    moved = false;
    pressedRoute = event.target.closest("[data-route]")?.dataset.route || "";
    startX = event.clientX;
    startScrollLeft = carousel.scrollLeft;
    carousel.classList.add("dragging");
    carousel.setPointerCapture(event.pointerId);
  });
  carousel.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 4) moved = true;
    carousel.scrollLeft = startScrollLeft - delta;
  });
  carousel.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove("dragging");
    if (!moved && pressedRoute) {
      event.preventDefault();
      suppressClick = true;
      const targetRoute = pressedRoute;
      pressedRoute = "";
      navigate(targetRoute);
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
      return;
    }
    pressedRoute = "";
    suppressClick = moved;
    window.requestAnimationFrame(setActiveDot);
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  });
  carousel.addEventListener("pointercancel", () => {
    isDragging = false;
    pressedRoute = "";
    carousel.classList.remove("dragging");
  });
  carousel.addEventListener("click", (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const card = cards[Number(dot.dataset.carouselDot)];
      if (card) carousel.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    });
  });
  setActiveDot();
}

function handleSearch(event) {
  const query = event.target.value.trim();
  const box = document.querySelector("#search-results");
  if (!query) {
    box.innerHTML = "";
    return;
  }
  const results = query.startsWith("@")
    ? state.users.filter((user) => user.handle.includes(query.toLowerCase()))
    : state.tournaments.filter((item) => item.public && item.name.toLowerCase().includes(query.toLowerCase()));

  box.innerHTML = results.length
    ? results.map((item) => {
      if (item.username) {
        return `<button class="search-result" data-route="/user/${item.username}"><strong>${item.name}</strong><div class="muted">${item.handle}</div></button>`;
      }
      return `<button class="search-result" data-route="/tournament/${item.id}"><strong>${item.name}</strong><div class="muted">${tr("Public championship")}</div></button>`;
    }).join("")
    : `<div class="search-result">${tr("No results found")}</div>`;
}

function renderSearch() {
  const query = state.searchQuery || "";
  const isFocused = Boolean(state.searchFocused);
  const people = searchPeople(query);
  const allTournaments = searchPublicTournaments(query);
  const tournaments = filterPublicTournamentsByStatus(allTournaments);
  const hasQuery = Boolean(query.trim());
  const showExplore = !isFocused && !hasQuery;
  const showRecent = isFocused && !hasQuery;
  const showResults = isFocused && hasQuery;

  app.innerHTML = `
    <section class="search-page search-compact-page ${isFocused ? "search-focused-page" : ""}">
      <div class="search-sticky ${isFocused ? "search-sticky-focused" : ""}">
        <div class="search-entry-row">
          <div class="search-bar-shell">
            <span class="search-bar-icon" aria-hidden="true">⌕</span>
            <input class="input search-page-input" id="search-page-input" value="${query}" placeholder="${tr("Search")}">
          </div>
          ${isFocused ? `<button class="search-cancel-btn" type="button" id="search-cancel-btn">${tr("Cancel")}</button>` : ""}
        </div>
        ${showExplore ? publicTournamentFilterHtml(allTournaments) : ""}
      </div>

      ${showExplore ? `
        <section class="search-section">
          <div class="search-list championship-card-list">
            ${tournaments.length ? tournaments.map(searchTournamentCard).join("") : `<div class="muted empty-row">${tr("No championships match this filter.")}</div>`}
          </div>
        </section>
      ` : showRecent ? `
        ${searchHistoryHtml()}
      ` : showResults ? `
        <section class="search-section">
          <h2 class="section-title">${tr("People")}</h2>
          <div class="search-list">
            ${people.length ? people.map(searchUserRow).join("") : `<div class="muted empty-row">${tr("No matching users.")}</div>`}
          </div>
        </section>
        <section class="search-section">
          <h2 class="section-title">${tr("Championships")}</h2>
          <div class="search-list championship-card-list">
            ${tournaments.length ? tournaments.map(searchTournamentRow).join("") : `<div class="muted empty-row">${tr("No matching public championships.")}</div>`}
          </div>
        </section>
      ` : `
        ${searchHistoryHtml()}
      `}
    </section>
  `;

  const input = document.querySelector("#search-page-input");
  input.addEventListener("focus", () => {
    if (state.searchFocused) return;
    state.searchFocused = true;
    renderSearch();
  });
  input.addEventListener("input", () => {
    state.searchQuery = input.value;
    state.searchFocused = true;
    renderSearch();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    saveSearchHistory(input.value);
    renderSearch();
  });
  if (isFocused) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
  setupMainChromeAutoHide(".search-sticky");

  const cancelButton = document.querySelector("#search-cancel-btn");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      state.searchFocused = false;
      state.searchQuery = "";
      renderSearch();
    });
  }

  document.querySelectorAll("[data-follow-user]").forEach((button) => {
    button.addEventListener("click", () => toggleFollowUser(button.dataset.followUser));
  });
  document.querySelectorAll("[data-join-tournament]").forEach((button) => {
    button.addEventListener("click", () => joinTournament(button.dataset.joinTournament));
  });
  document.querySelectorAll("[data-hub-join-tournament]").forEach((button) => {
    button.addEventListener("click", () => joinTournament(button.dataset.hubJoinTournament));
  });
  document.querySelectorAll("[data-public-tournament-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.publicTournamentFilter = button.dataset.publicTournamentFilter;
      renderSearch();
    });
  });
  document.querySelectorAll("[data-search-history-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.searchQuery = state.searchHistory[Number(button.dataset.searchHistoryIndex)] || "";
      state.searchFocused = true;
      saveSearchHistory(state.searchQuery);
      renderSearch();
    });
  });
  document.querySelectorAll("[data-delete-search-history]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteSearchHistoryItem(Number(button.dataset.deleteSearchHistory));
      renderSearch();
    });
  });
  const clearSearchHistoryButton = document.querySelector("#clear-search-history");
  if (clearSearchHistoryButton) {
    clearSearchHistoryButton.addEventListener("click", () => {
      state.searchHistory = [];
      saveLocalAppState();
      renderSearch();
    });
  }
}

function searchHistoryHtml() {
  if (!state.searchHistory.length) {
    return `<section class="search-history-panel search-history-empty"><p class="muted">${tr("No recent searches yet.")}</p></section>`;
  }
  return `
    <section class="search-history-panel">
      <div class="search-history-head">
        <strong>${tr("Recent")}</strong>
        <button type="button" id="clear-search-history">${tr("Clear all")}</button>
      </div>
      <div class="search-history-list">
        ${state.searchHistory.map((item, index) => {
          const details = searchHistoryDetails(item);
          return `
          <div class="search-history-row">
            <button type="button" data-search-history-index="${index}">
              <span class="search-history-avatar">${details.avatar}</span>
              <span class="search-history-copy">
                <strong>${details.title}</strong>
                <small>${details.subtitle}</small>
              </span>
            </button>
            <button class="search-history-delete" type="button" data-delete-search-history="${index}" aria-label="حذف ${item}">×</button>
          </div>
        `;
        }).join("")}
      </div>
    </section>
  `;
}

function searchHistoryDetails(item) {
  const normalized = item.trim();
  if (normalized.startsWith("@")) {
    const username = normalized.slice(1).toLowerCase();
    const user = state.users.find((person) => person.username.toLowerCase() === username || person.handle.toLowerCase() === normalized.toLowerCase());
    return {
      avatar: user?.name?.charAt(0) || "@",
      title: user?.handle || normalized,
      subtitle: user?.name || tr("User account")
    };
  }
  const tournament = state.tournaments.find((entry) => {
    return entry.name.toLowerCase() === normalized.toLowerCase()
      || (entry.publicCode || "").toLowerCase() === normalized.toLowerCase();
  });
  return {
    avatar: tournament ? "🏆" : "⌕",
    title: tournament?.name || normalized,
    subtitle: tournament ? `${tr("Public championship")} · ${tournament.publicCode || tr("No code")}` : tr("Recent search")
  };
}

function saveSearchHistory(query) {
  const value = query.trim();
  if (!value) return;
  state.searchHistory = [value, ...state.searchHistory.filter((item) => item !== value)].slice(0, 6);
  saveLocalAppState();
}

function deleteSearchHistoryItem(index) {
  state.searchHistory = state.searchHistory.filter((_, itemIndex) => itemIndex !== index);
  saveLocalAppState();
}

function setupMainChromeAutoHide(selector = ".main-auto-hide-chrome") {
  if (mainChromeScrollHandler) {
    window.removeEventListener("scroll", mainChromeScrollHandler);
  }
  const chrome = document.querySelector(selector);
  if (!chrome) return;
  let lastY = window.scrollY;
  mainChromeScrollHandler = () => {
    const currentRoute = state.route || getInitialRoute();
    if (!["/", "/home", "/search", "/live", "/create-tournament"].includes(currentRoute)) {
      window.removeEventListener("scroll", mainChromeScrollHandler);
      mainChromeScrollHandler = null;
      return;
    }
    const currentY = window.scrollY;
    const delta = currentY - lastY;
    if (currentY < 24) {
      chrome.classList.remove("is-hidden");
    } else if (delta > 6) {
      chrome.classList.add("is-hidden");
    } else if (delta < -6) {
      chrome.classList.remove("is-hidden");
    }
    lastY = currentY;
  };
  window.addEventListener("scroll", mainChromeScrollHandler, { passive: true });
}

function searchPeople(query) {
  const normalized = query.trim().toLowerCase().replace(/^@/, "");
  if (!normalized) return state.users;
  return state.users.filter((user) => {
    return user.name.toLowerCase().includes(normalized)
      || user.username.toLowerCase().includes(normalized)
      || user.handle.toLowerCase().includes(`@${normalized}`);
  });
}

function searchPublicTournaments(query) {
  const normalized = query.trim().toLowerCase();
  return state.tournaments.filter((tournament) => {
    if (!tournament.public) return false;
    if (tournament.cancelled || tournament.draft) return false;
    if (!normalized) return true;
    return tournament.name.toLowerCase().includes(normalized)
      || (tournament.publicCode || "").toLowerCase().includes(normalized);
  });
}

function searchUserRow(user) {
  return `
    <article class="instagram-row">
      <button class="user-row-main" data-route="/user/${user.username}">
        <span class="mini-avatar">${user.name[0]}</span>
        <span>
          <strong>${user.name}</strong>
          <small>${user.handle}</small>
        </span>
      </button>
      <button class="btn compact-btn ${user.relation === "Unfollow" ? "ghost" : "accent"}" data-follow-user="${user.username}">
        ${user.relation === "Unfollow" ? "Following" : "Follow"}
      </button>
    </article>
  `;
}

function searchTournamentRow(tournament) {
  return participantTournamentCard(tournament, "following");
}

function searchTournamentCard(tournament) {
  return participantTournamentCard(tournament, "following");
}

function toggleFollowUser(username, rerenderSearch = true) {
  const user = state.users.find((item) => item.username === username);
  if (!user) return;
  const isFollowing = user.relation === "Unfollow";
  user.relation = isFollowing ? "Follow back" : "Unfollow";
  if (isFollowing) {
    state.currentUser.following = state.currentUser.following.filter((name) => name !== user.name.split(" ")[0]);
  } else {
    state.currentUser.following = [...new Set([...state.currentUser.following, user.name.split(" ")[0]])];
  }
  saveLocalAppState();
  if (rerenderSearch) renderSearch();
}

function joinTournament(tournamentId) {
  if (joinTournamentSilently(tournamentId)) renderSearch();
}

function searchOfficialCompetitions(query) {
  const normalized = query.trim().toLowerCase();
  const source = state.apiCompetitions;
  if (!normalized) return [];

  const competitions = source.filter((competition) => {
    return competition.name.toLowerCase().includes(normalized)
      || competition.code.toLowerCase().includes(normalized)
      || competition.region.toLowerCase().includes(normalized);
  });
  return competitions.slice(0, 6);
}

function getSelectedCompetition() {
  return state.apiCompetitions.find((competition) => competition.id === state.selectedCompetitionId);
}

function competitionResultsHtml(query) {
  if (!query.trim()) {
    return `<div class="competition-empty">اكتب اسم البطولة للبحث في جميع البطولات الفعلية لكرة القدم. مثال: World Cup أو كأس العالم.</div>`;
  }
  const competitions = searchOfficialCompetitions(query);
  if (state.competitionSearchStatus === "loading") {
    return `<div class="competition-empty">جاري البحث في البطولات الرسمية من API-Football...</div>`;
  }
  if (!competitions.length) {
    const message = state.competitionSearchError || "اكتب اسم البطولة للبحث في جميع البطولات الفعلية لكرة القدم.";
    return `<div class="competition-empty">${message}</div>`;
  }

  return competitions.map((competition) => `
    <button class="competition-result" type="button" data-competition-id="${competition.id}">
      <span>
        <strong>${competition.name}</strong>
        <small>${competition.region} · موسم ${competition.season}</small>
      </span>
      <b>${competition.code || competition.apiId}</b>
    </button>
  `).join("");
}

function selectedCompetitionSummary() {
  const competition = getSelectedCompetition();
  if (!competition) {
    return `<span class="muted">اختر بطولة من القائمة حتى يتم جلب مبارياتها، أدوارها، وقوائم اللاعبين من الربط الرياضي.</span>`;
  }

  const apiRounds = createStartingRoundOptions();
  const startRound = apiRounds.length
    ? apiRounds.map((round) => round.label).join("، ")
    : "حسب بيانات الربط";
  const matchCount = countMatchesByRound(state.selectedCompetitionMatchesByRound);
  const predictableCount = countPredictableMatchesByRound(state.selectedCompetitionMatchesByRound);
  const fixtureStatus = state.selectedCompetitionFixtureStatus === "loading"
    ? `<small>جاري جلب مباريات البطولة من الربط...</small>`
    : state.selectedCompetitionFixtureStatus === "loaded"
      ? `<small>تم ربط ${matchCount} مباراة، منها ${predictableCount} مباراة متاحة للتوقع.</small>`
      : state.selectedCompetitionFixtureStatus === "live-only"
        ? `<small>${state.selectedCompetitionFixtureError || "ظهرت مباريات مباشرة فقط، ولا توجد مباريات قادمة متاحة للتوقع حالياً."}</small>`
      : state.selectedCompetitionFixtureStatus === "empty"
        ? `<small>${state.selectedCompetitionFixtureError || "لم تظهر مباريات لهذا الموسم من المصدر الرسمي حتى الآن."}</small>`
        : state.selectedCompetitionFixtureError
          ? `<small>${state.selectedCompetitionFixtureError}</small>`
          : "";
  return `
    <div>
      <strong>${competition.name}</strong>
      <span>${competition.region} · موسم ${competition.season} · الأدوار المتاحة: ${startRound}</span>
      ${fixtureStatus}
    </div>
    <span class="badge">${competition.code}</span>
  `;
}

function refreshCreateSubmitState() {
  const createButton = document.querySelector("#create-form button[type=\"submit\"]");
  if (!createButton) return;
  if (state.createSourceMode === "manual") {
    createButton.disabled = false;
    createButton.textContent = "إنشاء البطولة";
    return;
  }
  const hasCompetition = Boolean(state.selectedCompetitionId);
  const isLoading = state.selectedCompetitionFixtureStatus === "loading";
  const hasPredictableMatches = countPredictableMatchesByRound(state.selectedCompetitionMatchesByRound) > 0;
  const blocked = hasCompetition && !isLoading && !hasPredictableMatches;
  createButton.disabled = isLoading || blocked;
  createButton.textContent = isLoading
    ? "جاري جلب المباريات"
    : blocked
      ? "المباريات غير متاحة"
      : "إنشاء البطولة";
}

function selectOfficialCompetition(competitionId) {
  const competition = state.apiCompetitions.find((item) => item.id === competitionId);
  if (!competition) return;

  state.selectedCompetitionId = competition.id;
  state.competitionSearchQuery = `${competition.name} (${competition.code})`;

  const searchInput = document.querySelector("#competition-search");
  const idInput = document.querySelector("#competition-id");
  const results = document.querySelector("#competition-results");
  const summary = document.querySelector("#selected-competition");
  const nameInput = document.querySelector("#tournament-name");
  const startingRound = document.querySelector("#starting-round");
  const preview = document.querySelector("#api-preview");
  const error = document.querySelector("#create-error");

  if (searchInput) searchInput.value = state.competitionSearchQuery;
  if (idInput) idInput.value = competition.id;
  if (results) results.innerHTML = "";
  if (summary) summary.innerHTML = selectedCompetitionSummary();
  if (nameInput && (!nameInput.value.trim() || nameInput.value === "تحدي نهاية الأسبوع")) nameInput.value = competition.name;
  if (startingRound && competition.defaultStart) {
    startingRound.value = competition.defaultStart;
    const label = rounds.find((round) => round.id === competition.defaultStart)?.label || "المرحلة المختارة";
    if (preview) preview.textContent = `مرحلة البداية: سيتم جلب مباريات ${label} من الربط الرياضي، وبعد اعتماد نتائجها تفتح المرحلة التالية تلقائياً.`;
  }
  if (error) error.textContent = "";
  refreshCreateSubmitState();
  loadOfficialCompetitionFixtures(competition);
}

function validateCompetitionSelection() {
  if (state.createSourceMode === "manual") return true;
  if (state.selectedCompetitionId) return true;
  const error = document.querySelector("#create-error");
  if (error) error.textContent = "اختر بطولة رسمية من القائمة أولاً حتى يتم ربط المباريات وقوائم اللاعبين.";
  return false;
}

function ensureOfficialCompetitionCatalog() {
  if (state.competitionCatalogRequested || state.apiCompetitions.length) return;
  state.competitionCatalogRequested = true;
  state.competitionSearchStatus = "loading";
  const results = document.querySelector("#competition-results");
  if (results) results.innerHTML = competitionResultsHtml(state.competitionSearchQuery);
  fetchOfficialCompetitions("");
}

function scheduleOfficialCompetitionSearch(query) {
  window.clearTimeout(state.competitionSearchTimer);
  const normalized = query.trim();
  if (normalized.length < 2) {
    state.competitionSearchStatus = "";
    state.competitionSearchError = "";
    document.querySelector("#competition-results").innerHTML = competitionResultsHtml(query);
    return;
  }
  state.competitionSearchStatus = "loading";
  state.competitionSearchError = "";
  document.querySelector("#competition-results").innerHTML = competitionResultsHtml(query);
  state.competitionSearchTimer = window.setTimeout(() => fetchOfficialCompetitions(normalized), 450);
}

async function fetchOfficialCompetitions(query) {
  try {
    const response = await fetch(`${competitionsApiEndpoint()}?search=${encodeURIComponent(officialCompetitionSearchTerm(query))}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.apiCompetitions = normalizeCompetitionPayload(payload);
    state.competitionSearchStatus = "";
    state.competitionSearchError = state.apiCompetitions.length ? "" : "لا توجد بطولة مطابقة من المصدر الرسمي.";
  } catch (error) {
    state.competitionSearchStatus = "";
    state.competitionCatalogRequested = false;
    state.competitionSearchError = "تعذر جلب البطولات الرسمية حالياً. جرّب بعد قليل أو ابحث باسم إنجليزي مثل World Cup.";
  }
  const results = document.querySelector("#competition-results");
  if (results) results.innerHTML = competitionResultsHtml(state.competitionSearchQuery);
}

function officialCompetitionSearchTerm(query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (/world\s*cup/.test(normalized)) return "world cup";
  if (/fifa/.test(normalized) && /world/.test(normalized)) return "world cup";
  if (/كأس|كاس/.test(normalized) && /العالم/.test(normalized)) return "world cup";
  if (/دوري/.test(normalized) && /ابطال|أبطال/.test(normalized)) return "champions league";
  if (/كوبا/.test(normalized) || /امريكا|أمريكا/.test(normalized)) return "copa america";
  if (/امم|أمم/.test(normalized) && /اوروبا|أوروبا/.test(normalized)) return "euro";
  if (/اسيا|آسيا/.test(normalized)) return "asian cup";
  return query;
}

function competitionsApiEndpoint() {
  if (window.location.protocol === "file:") return "https://www.pickaside.mobile/api/competitions";
  return "/api/competitions";
}

function fixturesApiEndpoint() {
  if (window.location.protocol === "file:") return "https://www.pickaside.mobile/api/fixtures";
  return "/api/fixtures";
}

async function loadOfficialCompetitionFixtures(competition) {
  if (!competition?.apiId) return;
  state.selectedCompetitionFixtureStatus = "loading";
  state.selectedCompetitionFixtureError = "";
  state.selectedCompetitionMatchesByRound = null;
  const summary = document.querySelector("#selected-competition");
  if (summary) summary.innerHTML = selectedCompetitionSummary();
  refreshCreateSubmitState();

  try {
    const season = competition.season || new Date().getFullYear();
    let payload = await fetchCompetitionFixturesPayload(competition.apiId, { season });
    let matchesByRound = normalizeFixturePayload(payload);
    let futureAccessError = apiFootballErrorMessage(payload);
    if (!countPredictableMatchesByRound(matchesByRound)) {
      const windowPayload = await fetchUpcomingCompetitionFixturesPayload(competition.apiId, season);
      const windowMatchesByRound = normalizeFixturePayload(windowPayload);
      futureAccessError = futureAccessError || apiFootballErrorMessage(windowPayload);
      if (countPredictableMatchesByRound(windowMatchesByRound)) {
        payload = windowPayload;
        matchesByRound = windowMatchesByRound;
        futureAccessError = "";
      }
    }
  if (!countPredictableMatchesByRound(matchesByRound)) {
    const upcomingPayload = await fetchCompetitionFixturesPayload(competition.apiId, { next: 80 });
    const upcomingMatchesByRound = normalizeFixturePayload(upcomingPayload);
    futureAccessError = futureAccessError || apiFootballErrorMessage(upcomingPayload);
    if (countPredictableMatchesByRound(upcomingMatchesByRound)) {
        payload = upcomingPayload;
        matchesByRound = upcomingMatchesByRound;
      futureAccessError = "";
    }
  }
  const apiError = apiFootballErrorMessage(payload);
    state.selectedCompetitionMatchesByRound = matchesByRound;
    const predictableCount = countPredictableMatchesByRound(matchesByRound);
    const totalCount = countMatchesByRound(matchesByRound);
    state.selectedCompetitionFixtureStatus = predictableCount ? "loaded" : totalCount ? "live-only" : "empty";
    state.selectedCompetitionFixtureError = predictableCount
      ? ""
      : totalCount
        ? (futureAccessError || "الربط رجع مباريات مباشرة/منتهية فقط. لإنشاء بطولة توقعات نحتاج مباريات قادمة لم تبدأ بعد.")
        : (apiError || "لم تظهر مباريات قادمة أو مباريات حية لهذه البطولة من المصدر الرسمي.");
    syncStartingRoundSelectWithApiRounds();
  } catch (error) {
    state.selectedCompetitionMatchesByRound = emptyMatchesByRound();
    state.selectedCompetitionFixtureStatus = "error";
    state.selectedCompetitionFixtureError = "تعذر جلب مباريات البطولة حالياً. لن يتم استخدام مباريات تجريبية بدلاً منها.";
  }

  const nextSummary = document.querySelector("#selected-competition");
  if (nextSummary) nextSummary.innerHTML = selectedCompetitionSummary();
  refreshCreateSubmitState();
}

async function fetchCompetitionFixturesPayload(apiId, options = {}) {
  const params = new URLSearchParams({ league: String(apiId) });
  if (options.live) params.set("live", options.live);
  else if (options.next) params.set("next", String(options.next));
  else {
    params.set("season", String(options.season || new Date().getFullYear()));
    if (options.date) params.set("date", options.date);
    if (options.from) params.set("from", options.from);
    if (options.to) params.set("to", options.to);
  }
  const response = await fetch(`${fixturesApiEndpoint()}?${params.toString()}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchUpcomingCompetitionFixturesPayload(apiId, season) {
  const today = new Date();
  return fetchCompetitionFixturesPayload(apiId, {
    season,
    from: formatApiDate(today),
    to: formatApiDate(addDays(today, 90))
  });
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatApiDate(date) {
  return date.toISOString().slice(0, 10);
}

function apiFootballErrorMessage(payload) {
  const errors = payload?.errors;
  if (!errors) return "";
  if (typeof errors === "string") return localizeApiFootballError(errors);
  if (Array.isArray(errors)) return localizeApiFootballError(errors.join(" "));
  if (typeof errors === "object") {
    return localizeApiFootballError(Object.values(errors).filter(Boolean).join(" "));
  }
  return "";
}

function localizeApiFootballError(message) {
  const text = String(message || "");
  if (/Free plans do not have access to this season/i.test(text)) {
    const years = text.match(/try from\s+([0-9]{4})\s+to\s+([0-9]{4})/i);
    const range = years ? ` من ${years[1]} إلى ${years[2]}` : "";
    return `خطة API-Football المجانية لا تسمح بجلب مباريات هذا الموسم. للتجربة اختر موسماً متاحاً${range} أو قم بترقية خطة API-Football.`;
  }
  if (/Free plans do not have access to the Next parameter/i.test(text)) {
    return "خطة API-Football المجانية لا تسمح بجلب المباريات القادمة بهذه الطريقة. نحتاج صلاحية جلب المباريات القادمة لإنشاء بطولة توقعات واقعية.";
  }
  if (/Missing application key/i.test(text)) {
    return "مفتاح API-Football غير مضاف في إعدادات الخادم.";
  }
  return text;
}

function syncStartingRoundSelectWithApiRounds() {
  const startingRound = document.querySelector("#starting-round");
  const preview = document.querySelector("#api-preview");
  if (!startingRound) return;
  const options = createStartingRoundOptions();
  const selected = normalizeStartingRoundValue(startingRound.value, options);
  startingRound.innerHTML = options.map((round) => `<option value="${round.id}" ${round.id === selected ? "selected" : ""}>${round.label}</option>`).join("");
  const label = options.find((round) => round.id === selected)?.label || "المرحلة المختارة";
  if (preview) {
    preview.textContent = `مرحلة البداية: سيتم استخدام مباريات ${label} من الربط الرياضي، وبعد اعتماد نتائجها تفتح المرحلة التالية تلقائياً حسب أدوار البطولة.`;
  }
}

function normalizeFixturePayload(payload) {
  const byRound = emptyMatchesByRound();
  const list = Array.isArray(payload?.response) ? payload.response : [];
  list.forEach((item) => {
    const fixture = item.fixture || {};
    const league = item.league || {};
    const teams = item.teams || {};
    const goals = item.goals || {};
    const score = item.score || {};
    const status = fixture.status || {};
    const roundDetails = parseApiRoundDetails(league.round || "");
    const groupRound = parseApiGroupRound(league.round || "");
    const round = roundDetails.id;
    const homeGoals = goals.home ?? score.fulltime?.home ?? score.halftime?.home;
    const awayGoals = goals.away ?? score.fulltime?.away ?? score.halftime?.away;
    const hasScore = homeGoals !== null && homeGoals !== undefined && awayGoals !== null && awayGoals !== undefined;
    byRound[round].push({
      id: `fx-${fixture.id || `${round}-${byRound[round].length + 1}`}`,
      fixtureId: fixture.id || "",
      kickoff: fixture.date || new Date().toISOString(),
      a: teams.home?.name || "Home",
      b: teams.away?.name || "Away",
      logoA: teams.home?.logo || "",
      logoB: teams.away?.logo || "",
      score: hasScore ? `${homeGoals} - ${awayGoals}` : "",
      statusShort: status.short || "",
      minute: status.elapsed || "",
      apiRound: league.round || "",
      roundLabel: roundDetails.label,
      legLabel: roundDetails.legLabel,
      stageLabel: roundDetails.stageLabel,
      groupRoundId: groupRound.id,
      groupRoundLabel: groupRound.label
    });
  });
  Object.keys(byRound).forEach((round) => {
    byRound[round].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  });
  return byRound;
}

function parseApiGroupRound(value) {
  const text = String(value || "").trim();
  const numberMatch = text.match(/(?:group stage|regular season|league stage|matchday|round|week)\s*[-:]?\s*(\d+)/i)
    || text.match(/-\s*(\d+)\s*$/)
    || text.match(/الجولة\s*(\d+)/);
  if (!numberMatch) return { id: "", label: "" };
  const number = Number(numberMatch[1]);
  if (!Number.isFinite(number)) return { id: "", label: "" };
  return { id: `group-matchday-${number}`, label: `الجولة ${number}` };
}

function emptyMatchesByRound() {
  return rounds.reduce((acc, round) => {
    acc[round.id] = [];
    return acc;
  }, {});
}

function countMatchesByRound(matchesByRound) {
  if (!matchesByRound) return 0;
  return Object.values(matchesByRound).reduce((sum, matches) => sum + (Array.isArray(matches) ? matches.length : 0), 0);
}

function countPredictableMatchesByRound(matchesByRound) {
  if (!matchesByRound) return 0;
  return Object.values(matchesByRound).reduce((sum, matches) => {
    if (!Array.isArray(matches)) return sum;
    return sum + matches.filter(isPredictableFixtureMatch).length;
  }, 0);
}

function isPredictableFixtureMatch(match) {
  const status = String(match?.statusShort || "").toUpperCase();
  const kickoff = new Date(match?.kickoff || "").getTime();
  const isFuture = Number.isFinite(kickoff) && kickoff > Date.now();
  if (["NS", "TBD", "PST"].includes(status)) return isFuture;
  if (["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"].includes(status)) return false;
  return isFuture;
}

function roundOptionsFromMatches(matchesByRound) {
  if (!matchesByRound) return [];
  return rounds.filter((round) => Array.isArray(matchesByRound[round.id]) && matchesByRound[round.id].length);
}

function createStartingRoundOptions() {
  const apiRoundOptions = roundOptionsFromMatches(state.selectedCompetitionMatchesByRound);
  const inferredRoundOptions = inferCompetitionRoundOptions(getSelectedCompetition(), apiRoundOptions);
  return inferredRoundOptions.length ? inferredRoundOptions : rounds;
}

function inferCompetitionRoundOptions(competition, apiRoundOptions = []) {
  const apiIds = apiRoundOptions.map((round) => round.id);
  const name = `${competition?.name || ""} ${competition?.region || ""}`.toLowerCase();
  let inferredIds = apiIds;

  if (/world cup/.test(name) && Number(competition?.season) >= 2026) {
    inferredIds = mergeRoundIds(apiIds, ["group", "round32", "round16", "quarter", "semi", "third-place", "final"]);
  } else if (apiIds.includes("group")) {
    inferredIds = mergeRoundIds(apiIds, ["group", "round16", "quarter", "semi", "final"]);
  } else if (apiIds.includes("round32")) {
    inferredIds = mergeRoundIds(apiIds, ["round32", "round16", "quarter", "semi", "final"]);
  } else if (apiIds.includes("round16")) {
    inferredIds = mergeRoundIds(apiIds, ["round16", "quarter", "semi", "final"]);
  }

  return rounds.filter((round) => inferredIds.includes(round.id));
}

function mergeRoundIds(primaryIds, inferredIds) {
  return rounds
    .map((round) => round.id)
    .filter((id) => primaryIds.includes(id) || inferredIds.includes(id));
}

function normalizeStartingRoundValue(value, options = rounds) {
  if (options.some((round) => round.id === value)) return value;
  return options[0]?.id || "group";
}

function roundIdFromApiRound(value) {
  return parseApiRoundDetails(value).id;
}

function parseApiRoundDetails(value) {
  const original = String(value || "").trim();
  const round = original.toLowerCase();
  const legLabel = apiRoundLegLabel(round);
  let id = "group";

  if (/qualif|qualification|تصفيات/.test(round)) id = "qualifying";
  else if (/prelim|preliminary|تمهيدي/.test(round)) id = "preliminary";
  else if (/play[-\s]?off|playoff|ملحق/.test(round)) id = "playoff";
  else if (/round of 64|round\s*64|1\/32|64th finals|last 64/.test(round)) id = "round64";
  else if (/round of 32|round\s*32|1\/16|32nd finals|last 32/.test(round)) id = "round32";
  else if (/round of 16|round\s*16|1\/8|8th finals|last 16/.test(round)) id = "round16";
  else if (/quarter|1\/4|ربع/.test(round)) id = "quarter";
  else if (/semi|1\/2|نصف/.test(round)) id = "semi";
  else if (/third|3rd|bronze|المركز الثالث/.test(round)) id = "third-place";
  else if (/final|نهائي/.test(round)) id = "final";
  else if (/group|regular season|league stage|round\s+\d+|مجموعة|مجموعات/.test(round)) id = "group";

  const baseLabel = rounds.find((item) => item.id === id)?.label || "الدور";
  return {
    id,
    label: legLabel ? `${baseLabel} - ${legLabel}` : baseLabel,
    stageLabel: original || baseLabel,
    legLabel
  };
}

function apiRoundLegLabel(round) {
  if (/1st leg|first leg|leg 1|1st|ذهاب/.test(round)) return "ذهاب";
  if (/2nd leg|second leg|leg 2|2nd|إياب|اياب/.test(round)) return "إياب";
  return "";
}

function isApiCompetitionTournament(tournament) {
  return String(tournament?.officialCompetitionId || "").startsWith("api-league-")
    || Boolean(tournament?.officialCompetitionApiId);
}

function isManualTournament(tournament) {
  return Boolean(tournament?.manual || tournament?.sourceMode === "manual" || tournament?.fixturesStatus === "manual");
}

function normalizeTournamentData(tournament) {
  if (!tournament || !tournament.id) return null;
  tournament.sourceMode = tournament.sourceMode || (tournament.manual ? "manual" : "official");
  tournament.manual = Boolean(tournament.manual || tournament.sourceMode === "manual" || tournament.fixturesStatus === "manual");
  tournament.matchesByRound = tournament.matchesByRound || emptyMatchesByRound();
  tournament.participants = Array.isArray(tournament.participants) ? tournament.participants : [];
  if (tournament.joined && !tournament.participants.includes(state.currentUser.name)) {
    tournament.participants = [state.currentUser.name, ...tournament.participants];
  }
  const availableRounds = roundOptionsFromMatches(tournament.matchesByRound);
  if (!Array.isArray(tournament.roundIds) || !tournament.roundIds.length) {
    tournament.roundIds = inferCompetitionRoundOptions(tournament, availableRounds).map((round) => round.id);
  }
  if (!tournament.roundIds.length) tournament.roundIds = ["group", "round32", "round16", "quarter", "semi", "final"];
  if (!tournament.startingRound || !rounds.some((round) => round.id === tournament.startingRound)) {
    tournament.startingRound = tournament.roundIds[0] || "group";
  }
  if (!tournament.currentRound || !rounds.some((round) => round.id === tournament.currentRound)) {
    tournament.currentRound = tournament.startingRound;
  }
  if (!tournament.roundIds.includes(tournament.currentRound)) {
    tournament.roundIds = [tournament.currentRound, ...tournament.roundIds.filter((roundId) => roundId !== tournament.currentRound)];
  }
  return normalizeManualTournamentData(tournament);
}

function normalizeManualTournamentData(tournament) {
  if (!isManualTournament(tournament)) return tournament;
  tournament.matchesByRound = tournament.matchesByRound || emptyMatchesByRound();
  const legacyMatches = Array.isArray(tournament.manualMatches) ? tournament.manualMatches : [];
  legacyMatches.forEach((match) => {
    const round = match.round || match.roundId || match.stage || tournament.startingRound || tournament.currentRound || "group";
    tournament.matchesByRound[round] = tournament.matchesByRound[round] || [];
    if (!tournament.matchesByRound[round].some((item) => item.id === match.id)) {
      tournament.matchesByRound[round].push(match);
    }
  });
  Object.keys(tournament.matchesByRound).forEach((round) => {
    tournament.matchesByRound[round] = [...(tournament.matchesByRound[round] || [])].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  });
  return tournament;
}

function getTournamentMatches(tournament, round) {
  normalizeManualTournamentData(tournament);
  if (tournament?.matchesByRound) return tournament.matchesByRound[round] || [];
  if (isApiCompetitionTournament(tournament)) return [];
  return state.matches[round] || [];
}

function getTournamentPredictionSourceMatches(tournament, round) {
  const matches = getTournamentMatches(tournament, round);
  if (isManualTournament(tournament)) {
    return [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  }
  return getTournamentPredictionMatches(tournament, round);
}

function emptyRoundMatchesMessage(tournament, isLocked = false) {
  if (isLocked) return "هذا الدور مغلق حتى يؤكد الربط الرياضي الفرق المتأهلة من الدور السابق.";
  if (isApiCompetitionTournament(tournament)) {
    return `لم يتم جلب مباريات ${tournament.officialCompetitionName || tournament.name} لهذا الدور من المصدر الرسمي بعد. لن نعرض مباريات تجريبية لا تخص هذه البطولة.`;
  }
  return "لا توجد مباريات في هذا الدور حالياً.";
}

function setTournamentMatches(tournament, round, matches) {
  if (!tournament || !(isApiCompetitionTournament(tournament) || isManualTournament(tournament))) return;
  tournament.matchesByRound = tournament.matchesByRound || emptyMatchesByRound();
  tournament.matchesByRound[round] = matches;
}

function getRoundPredictionLockAtForTournament(tournament, round) {
  const matches = getTournamentPredictionSourceMatches(tournament, round);
  if (!matches.length) return "";
  if (round === "group") {
    const nextOpenMatch = matches.find((match) => !isMatchPredictionLocked(match)) || matches[0];
    return String(getMatchPredictionLockAt(nextOpenMatch));
  }
  const firstKickoff = Math.min(...matches.map((match) => new Date(match.kickoff).getTime()));
  return String(firstKickoff - PREDICTION_LOCK_MINUTES * 60 * 1000);
}

function getMatchPredictionLockAt(match) {
  const kickoff = new Date(match?.kickoff || "").getTime();
  return Number.isFinite(kickoff) ? kickoff - PREDICTION_LOCK_MINUTES * 60 * 1000 : 0;
}

function isMatchPredictionLocked(match) {
  const lockAt = getMatchPredictionLockAt(match);
  return Boolean(lockAt && Date.now() >= lockAt);
}

function isPredictionLockedForMatch(round, match, roundMatches = []) {
  if (round === "group") return isMatchPredictionLocked(match);
  return isPredictionLocked(roundMatches.length ? roundMatches : [match]);
}

function getUnlockedPredictionMatches(tournament, round) {
  return getTournamentPredictionSourceMatches(tournament, round)
    .filter((match) => !isPredictionLockedForMatch(round, match, [match]));
}

function normalizeCompetitionPayload(payload) {
  const list = Array.isArray(payload?.response) ? payload.response : [];
  const todayKey = formatApiDate(new Date());
  return list.map((item) => {
    const league = item.league || item;
    const country = item.country || {};
    const seasons = Array.isArray(item.seasons) ? item.seasons : [];
    const schedulableSeasons = seasons.filter((entry) => !entry.end || String(entry.end) >= todayKey);
    const season = schedulableSeasons.find((entry) => Number(entry.year) === 2026)
      || schedulableSeasons.find((entry) => entry.current)
      || schedulableSeasons[schedulableSeasons.length - 1]
      || {};
    if (!season.year && seasons.length) return null;
    const type = league.type ? `${league.type}` : "League";
    return {
      id: `api-league-${league.id}`,
      apiId: league.id,
      name: league.name || "Official competition",
      code: league.id ? `#${league.id}` : type,
      region: country.name || type,
      season: season.year || new Date().getFullYear(),
      defaultStart: "group",
      logoUrl: league.logo || "",
      countryFlag: country.flag || ""
    };
  }).filter((competition) => competition?.apiId && competition.name)
    .sort(officialCompetitionSort);
}

function officialCompetitionSort(a, b) {
  return officialCompetitionRank(a) - officialCompetitionRank(b)
    || String(a.name).localeCompare(String(b.name));
}

function officialCompetitionRank(competition) {
  const name = String(competition.name || "").toLowerCase();
  const region = String(competition.region || "").toLowerCase();
  let rank = 50;
  if (name === "world cup") rank -= 30;
  if (name.includes("world cup")) rank -= 15;
  if (region === "world") rank -= 8;
  if (name.includes("club")) rank += 12;
  if (Number(competition.season) === 2026) rank -= 5;
  return rank;
}

function renderChampionshipsPage() {
  const activeTournaments = state.tournaments.filter((tournament) => tournament.joined === true && tournament.active && !tournament.draft && !tournament.cancelled);
  const ownedTournaments = state.tournaments.filter((tournament) => isTournamentOwner(tournament) && !tournament.draft && !tournament.cancelled);
  const followingTournaments = followedPublicTournaments();
  const championshipTabs = [
    { id: "active", label: "البطولات النشطة", tournaments: activeTournaments, empty: "لا توجد بطولات مشارك فيها حالياً." },
    { id: "mine", label: "إدارة البطولات", tournaments: ownedTournaments, empty: "لا توجد بطولات أنشأتها حالياً." },
    { id: "following", label: "بطولات جديدة", tournaments: followingTournaments, empty: "لا توجد بطولات جديدة حالياً." }
  ];
  const activeTab = championshipTabs.some((tab) => tab.id === state.selectedChampionshipsTab)
    ? state.selectedChampionshipsTab
    : "active";
  const activeIndex = Math.max(0, championshipTabs.findIndex((tab) => tab.id === activeTab));
  app.innerHTML = `
    <div class="main-auto-hide-chrome main-tabs-chrome">
      ${tournamentsTopbar()}
      <div class="championship-segment" role="tablist" aria-label="Championship categories" style="--tab-count: ${championshipTabs.length}; --active-index: ${activeIndex};">
        ${championshipTabs.map((tab) => `
          <button class="championship-segment-btn ${activeTab === tab.id ? "active" : ""}" type="button" data-championship-tab="${tab.id}" role="tab" aria-selected="${activeTab === tab.id}">
            <strong>${tab.label} (${tab.tournaments.length})</strong>
          </button>
        `).join("")}
        <span class="championship-segment-indicator" aria-hidden="true"></span>
      </div>
    </div>
    <section class="grid championships-page">
      <div class="card panel stack championships-switch-shell">
        <div class="championship-page-slider" id="championship-page-slider" style="--championship-index: ${activeIndex}; --tab-count: ${championshipTabs.length};">
          <div class="championship-page-track">
            ${championshipTabs.map((tab) => `
              <section class="championship-slide" aria-label="${tab.label}">
                <div class="list-grid championship-card-list">
                  ${tab.tournaments.length ? tab.tournaments.map((tournament) => {
                    if (tab.id === "mine") return ownerManagementCard(tournament);
                    if (tab.id === "active") return activeChampionshipCard(tournament);
                    return participantTournamentCard(tournament, "following");
                  }).join("") : `<p class="muted">${tab.empty}</p>`}
                </div>
              </section>
            `).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
  scheduleScrollableTabsIntoView();

  document.querySelectorAll("[data-championship-tab]").forEach((button) => {
    button.addEventListener("click", () => setChampionshipsTab(button.dataset.championshipTab));
  });

  setupChampionshipsSwipe();
  setupMainChromeAutoHide(".main-auto-hide-chrome");

  document.querySelectorAll("[data-hub-join-tournament]").forEach((button) => {
    button.addEventListener("click", () => {
      if (joinTournamentSilently(button.dataset.hubJoinTournament)) {
        state.selectedChampionshipsTab = "active";
        renderChampionshipsPage();
      }
    });
  });

  startMatchCountdowns();
}

function setChampionshipsTab(tab) {
  state.selectedChampionshipsTab = ["active", "mine", "following"].includes(tab) ? tab : "active";
  renderChampionshipsPage();
}

function getAdjacentChampionshipTab(direction) {
  const tabs = ["active", "mine", "following"];
  const currentIndex = Math.max(0, tabs.indexOf(state.selectedChampionshipsTab));
  const nextIndex = Math.min(tabs.length - 1, Math.max(0, currentIndex + direction));
  return tabs[nextIndex];
}

function setupChampionshipsSwipe() {
  const slider = document.querySelector("#championship-page-slider");
  if (!slider) return;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let pressedCardRoute = "";
  let pressedInteractive = false;

  slider.addEventListener("pointerdown", (event) => {
    pressedInteractive = isInteractiveTarget(event.target) || isScrollableTabGestureTarget(event.target);
    pressedCardRoute = pressedInteractive ? "" : event.target.closest("[data-card-route]")?.dataset.cardRoute || "";
    if (pressedInteractive) return;
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX < 30 && absY < 30 && pressedCardRoute) {
      event.preventDefault();
      navigate(pressedCardRoute);
      pressedCardRoute = "";
      return;
    }
    pressedCardRoute = "";
    if (absX < 54 || absX < absY) return;
    const direction = deltaX < 0 ? 1 : -1;
    setChampionshipsTab(getAdjacentChampionshipTab(direction));
  });

  slider.addEventListener("pointercancel", () => {
    isDragging = false;
    pressedCardRoute = "";
    pressedInteractive = false;
  });
}

function tournamentsTopbar() {
  const draftsCount = state.tournaments.filter((tournament) => tournament.draft).length;
  return `
    <header class="topbar page-topbar tournaments-topbar">
      <div class="topbar-side">
        <button class="drafts-icon-btn" type="button" data-route="/challenges/drafts" aria-label="المسودات" title="المسودات">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 4.5h6.2L18 8.3V19.5H8z"></path>
            <path d="M14 4.5v4h4"></path>
            <path d="M10.8 12.2h4.4M10.8 15.2h3.1"></path>
          </svg>
          ${draftsCount ? `<span class="drafts-count-badge">${draftsCount}</span>` : ""}
        </button>
      </div>
      <button class="page-title-btn" data-route="/create-tournament">
        <span>البطولات</span>
      </button>
      <div class="topbar-side">
        <button class="create-plus-btn" type="button" data-route="/create-tournament/new" aria-label="Create Tournament" title="Create Tournament">+</button>
      </div>
    </header>
  `;
}

function tournamentNeedsUserVote(tournament) {
  if (!tournament.joined || tournament.draft) return false;
  const round = getTournamentPlayerActiveRound(tournament);
  const matches = getTournamentPredictionSourceMatches(tournament, round);
  if (!matches.length) return false;
  const visibleMatches = getVisiblePredictionMatchesForRound(tournament, round, matches);
  return visibleMatches.some((match) => !isPredictionComplete(tournament.id, round, match.id) && !isPredictionLockedForMatch(round, match, visibleMatches));
}

function activeChampionshipCard(tournament) {
  return tournamentNeedsUserVote(tournament)
    ? activeVoteTaskCard(tournament)
    : participantTournamentCard(tournament, "joined");
}

function activeVoteTaskCard(tournament) {
  const playerRoute = tournamentPath(tournament, "/player");
  const round = getTournamentPlayerActiveRound(tournament);
  const roundMatches = getTournamentPredictionSourceMatches(tournament, round);
  const visibleRoundMatches = getVisiblePredictionMatchesForRound(tournament, round, roundMatches);
  const matches = sortPredictionMatches(tournament.id, round, visibleRoundMatches);
  const roundLabel = rounds.find((item) => item.id === round)?.label || "الجولة الحالية";
  const completedCount = matches.filter((match) => isPredictionComplete(tournament.id, round, match.id)).length;
  const pendingMatches = matches.filter((match) => !isPredictionComplete(tournament.id, round, match.id) && !isPredictionLockedForMatch(round, match, matches));
  const pendingCount = pendingMatches.length;
  const nextPendingMatch = pendingMatches[0] || matches.find((match) => !isPredictionComplete(tournament.id, round, match.id)) || matches[0];
  const lockAt = nextPendingMatch ? String(getMatchPredictionLockAt(nextPendingMatch)) : getRoundPredictionLockAtForTournament(tournament, round);
  const taskLabel = round === "group" && nextPendingMatch ? `${roundLabel} · ${getGroupMatchdayLabel(nextPendingMatch, matches)}` : roundLabel;
  return `
    <article class="active-vote-card" data-card-route="${playerRoute}" role="button" tabindex="0" aria-label="فتح تصويت ${tournament.name}">
      <div class="active-vote-main">
        <span class="active-vote-kicker">تحتاج تصويتك</span>
        <strong>${tournament.name}</strong>
        <small>${taskLabel}</small>
      </div>
      <div class="active-vote-stats">
        <span><b>${pendingCount}</b><small>مباريات متبقية</small></span>
        <span><b>${completedCount}/${matches.length}</b><small>مكتمل</small></span>
      </div>
      <div class="active-vote-footer">
        <span class="match-countdown mini-vote-countdown" data-match-countdown data-countdown-mode="${round === "group" ? "match" : "round"}" data-kickoff="${nextPendingMatch ? new Date(nextPendingMatch.kickoff).toISOString() : ""}" data-lock-at="${lockAt}">
          <small data-countdown-label>يغلق التصويت</small>
          <b data-countdown-value>--:--:--</b>
          <small data-countdown-lock></small>
        </span>
        <button class="btn accent compact-btn" type="button" data-route="${playerRoute}">صوّت الآن</button>
      </div>
    </article>
  `;
}

function followedPublicTournaments() {
  return state.tournaments.filter((tournament) => {
    if (!tournament.public || tournament.draft || tournament.cancelled || tournament.active) return false;
    if (tournament.joined) return false;
    if (tournament.owner === state.currentUser.name || tournament.ownerUsername === state.currentUser.handle.replace("@", "")) return false;
    return isFollowingTournamentOwner(tournament);
  });
}

function isFollowingTournamentOwner(tournament) {
  const ownerUsername = tournament.ownerUsername || "";
  const ownerName = String(tournament.owner || "");
  const ownerFirstName = ownerName.split(" ")[0];
  const matchingUser = state.users.find((user) => user.username === ownerUsername || user.name.split(" ")[0] === ownerFirstName);
  return state.currentUser.following.includes(ownerFirstName)
    || (matchingUser && matchingUser.relation === "Unfollow");
}

function participantTournamentCard(tournament, source) {
  return championshipLiveCard(tournament, source);
}

function ownerManagementCard(tournament) {
  const participants = getTournamentParticipants(tournament);
  const participantCount = tournament.friends || participants.length || 0;
  const requestCount = getJoinRequestCount(tournament);
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const roundLabel = rounds.find((item) => item.id === activeRound)?.label || "الدور الحالي";
  const incompleteSections = ["voting", "prediction-results", "leaderboard", "rules", "prizes"].filter((section) => isSectionIncomplete(tournament, section));
  const isIncomplete = Boolean(tournament.setupIncomplete || incompleteSections.length);
  const phaseLabel = tournament.active && !isIncomplete ? roundLabel : "مرحلة إدخال التفاصيل";
  const statusLabel = isIncomplete ? "غير مكتملة" : tournament.active ? "مفعلة" : "جاهزة للتفعيل";
  return `
    <article class="owner-management-card" data-card-route="${tournamentPath(tournament)}" role="button" tabindex="0" aria-label="إدارة بطولة ${tournament.name}">
      <div class="owner-management-head">
        <span class="owner-management-title">
          <strong>${tournament.name}</strong>
          <small>${phaseLabel}</small>
        </span>
        <span class="owner-management-status ${isIncomplete ? "is-incomplete" : "is-ready"}">${statusLabel}</span>
      </div>
      <div class="owner-management-stats">
        <span>
          <b>${participantCount}</b>
          <small>المشاركون</small>
        </span>
        <span>
          <b>${requestCount}</b>
          <small>طلبات الدخول</small>
        </span>
        <span>
          <b>${tournament.public ? "عام" : "خاص"}</b>
          <small>الظهور</small>
        </span>
      </div>
      <div class="owner-management-foot">
        <small>${isIncomplete ? `استكمل ${incompleteSections.length || 1} قسم قبل التفعيل` : "كل البيانات الأساسية جاهزة"}</small>
        <span>إدارة ›</span>
      </div>
    </article>
  `;
}

function championshipHubCard(tournament, source) {
  const hasStarted = tournament.active;
  const leader = getTournamentLeaderName(tournament);
  const participants = tournament.participants || [];
  return `
    <article class="championship-hub-card">
      <button class="championship-hub-main" data-route="/tournament/${tournament.id}">
        <span>
          <strong>${tournament.name}</strong>
          <small>${tournament.publicCode || "PUBLIC"} · ${tournament.friends || participants.length || 0} مشارك</small>
        </span>
        <b class="badge">${hasStarted ? "بدأت" : "لم تبدأ"}</b>
      </button>
      <div class="championship-hub-meta">
        <span>المنشئ: <strong>${tournament.owner || "-"}</strong></span>
        <span>المتصدر: <strong>${hasStarted ? leader : "يظهر بعد البداية"}</strong></span>
        <span>المشاركون: <strong>${participants.slice(0, 4).join("، ") || `${tournament.friends || 0} مشارك`}</strong></span>
      </div>
      ${source === "following" && !hasStarted ? `
        <button class="btn accent compact-btn" type="button" data-hub-join-tournament="${tournament.id}" ${tournament.joined ? "disabled" : ""}>
          ${tournament.joined ? "تم الانضمام" : "المشاركة"}
        </button>
      ` : `
        <button class="btn ghost compact-btn" type="button" data-route="/tournament/${tournament.id}">عرض التفاصيل</button>
      `}
    </article>
  `;
}

function championshipLiveCard(tournament, source) {
  const hasStarted = tournament.active;
  const leader = getTournamentLeaderName(tournament);
  const participantCount = getTournamentParticipantCount(tournament);
  const maxPlayers = Number.isFinite(getTournamentCapacity(tournament)) ? getTournamentCapacity(tournament) : null;
  const full = isTournamentAtCapacity(tournament);
  const canJoin = source === "following" && !hasStarted && !tournament.joined && !full;
  const showPlayerStats = source === "joined";
  const ownerUsername = getTournamentOwnerUsername(tournament);
  const prizesLabel = tournamentPrizeStatusLabel(tournament);
  const coverClass = tournament.coverImageUrl ? "has-cover-image" : "has-default-cover";
  const participantRoute = tournamentPath(tournament, "/player");
  return `
    <article class="live-tournament-tab championship-live-card ${coverClass} ${canJoin ? "can-join" : ""}"${tournamentCoverStyle(tournament)} data-card-route="${participantRoute}" role="button" tabindex="0" aria-label="فتح بطولة ${tournament.name}">
      <div class="championship-live-content">
        <div class="championship-live-head">
          <span class="championship-title-stack">
            <button class="championship-title-open" type="button" data-route="${participantRoute}"><strong>${tournament.name}</strong></button>
            <small>منشئ البطولة <button class="inline-profile-link" type="button" data-route="/user/${ownerUsername}">@${ownerUsername}</button></small>
          </span>
          <span class="championship-status-text">${hasStarted ? "بدأت" : "لم تبدأ"}</span>
        </div>
        <div class="championship-live-meta">
          <button class="championship-meta-chip" type="button" data-card-info="participants" data-tournament-id="${tournament.id}">${maxPlayers ? `${participantCount}/${maxPlayers}` : participantCount} مشارك</button>
          <button class="championship-meta-chip" type="button" data-card-info="leaderboard" data-tournament-id="${tournament.id}">المتصدر: ${hasStarted ? leader : "بعد البداية"}</button>
          ${showPlayerStats ? `<span class="championship-meta-chip static-chip">${tournament.points || 0} نقطة</span>` : ""}
          ${showPlayerStats ? `<span class="championship-meta-chip static-chip">ترتيبي #${tournament.rank || "-"}</span>` : ""}
          <button class="championship-meta-chip" type="button" data-card-info="prizes" data-tournament-id="${tournament.id}">${prizesLabel}</button>
        </div>
        ${source === "following" && !hasStarted && !tournament.joined ? `
          ${full ? `<button class="btn ghost compact-btn championship-join-pill" type="button" disabled>مكتملة</button>` : `
          <button class="btn accent compact-btn championship-join-pill" type="button" data-hub-join-tournament="${tournament.id}">المشاركة</button>
          `}
        ` : ""}
      </div>
    </article>
  `;
}

function tournamentPrizeStatusLabel(tournament) {
  const hasPrizeDetails = Array.isArray(tournament.prizes) && tournament.prizes.some((prize) => getPrizeDetail(prize));
  return tournament.hasPrizes || hasPrizeDetails ? "فيها جوائز" : "بدون جوائز";
}

function openTournamentCardInfo(tournamentId, infoType) {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return;
  if (infoType === "participants") {
    tournamentParticipantsModal(tournament);
    return;
  }
  if (infoType === "leaderboard") {
    tournamentLeaderboardTableModal(tournament);
    return;
  }
  if (infoType === "prizes") {
    tournamentPrizesModal(tournament);
  }
}

function tournamentParticipantsModal(tournament) {
  const participants = getTournamentParticipants(tournament);
  openModal(`
    <section class="card modal compact-info-modal stack">
      <div class="modal-title-row">
        <h2 class="section-title">المشاركون</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      <div class="compact-info-list">
        ${participants.map((name, index) => `
          <div class="compact-info-row">
            <span class="mini-avatar">${name.charAt(0)}</span>
            <strong>${name}</strong>
            <small>#${index + 1}</small>
          </div>
        `).join("")}
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function tournamentLeaderboardTableModal(tournament) {
  const rows = leaderboardData(tournament);
  openModal(`
    <section class="card modal compact-info-modal stack">
      <div class="modal-title-row">
        <h2 class="section-title">ترتيب اللاعبين</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      <div class="compact-table-wrap">
        <table class="compact-leaderboard-table">
          <thead>
            <tr>
              <th>المركز</th>
              <th>اللاعب</th>
              <th>النقاط</th>
              <th>صحيح</th>
              <th>خاطئ</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, index) => `
              <tr class="${row.name === state.currentUser.name ? "current-user-row" : ""}">
                <td>#${index + 1}</td>
                <td>${row.name}</td>
                <td>${row.points}</td>
                <td><span class="correct">${row.correct}</span></td>
                <td><span class="wrong">${row.wrong}</span></td>
                <td>${row.total}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function tournamentPrizesModal(tournament) {
  const prizes = getTournamentPrizes(tournament).filter((prize) => getPrizeDetail(prize));
  openModal(`
    <section class="card modal compact-info-modal stack">
      <div class="modal-title-row">
        <h2 class="section-title">جوائز البطولة</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      ${tournament.hasPrizes || prizes.length ? `
        <div class="compact-info-list">
          ${prizes.length ? prizes.map((prize) => `
            <div class="compact-info-row">
              <span class="prize-rank">${prize.rank || prize.title}</span>
              <strong>${prize.title}</strong>
              <small>${prizeValueText(prize)}</small>
            </div>
          `).join("") : `<p class="muted">تم تفعيل الجوائز، ولم يتم إدخال تفاصيلها بعد.</p>`}
        </div>
      ` : `<p class="muted">هذه البطولة بدون جوائز حالياً.</p>`}
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function tournamentCoverStyle(tournament) {
  const coverUrl = String(tournament.coverImageUrl || "").trim();
  if (!coverUrl) return "";
  return ` style="--tournament-cover-image: url('${coverUrl.replace(/'/g, "%27")}')"`;
}

function getTournamentOwnerUsername(tournament) {
  if (tournament.ownerUsername) return tournament.ownerUsername;
  const ownerName = String(tournament.owner || "").trim();
  if (!ownerName || ownerName === state.currentUser.name) return state.currentUser.handle.replace("@", "");
  const ownerFirstName = ownerName.split(" ")[0].toLowerCase();
  const matchingUser = state.users.find((user) => {
    const firstName = user.name.split(" ")[0].toLowerCase();
    return user.username === ownerFirstName || firstName === ownerFirstName;
  });
  return matchingUser?.username || ownerFirstName || "profile";
}

function getTournamentLeaderName(tournament) {
  if (tournament.leaderName) return tournament.leaderName;
  const participants = getTournamentParticipants(tournament);
  return participants[0] || "غير محدد";
}

function joinTournamentSilently(tournamentId) {
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament || tournament.joined) return false;
  if (isTournamentAtCapacity(tournament)) {
    capacityReachedModal(tournament);
    return false;
  }
  tournament.joined = true;
  tournament.participants = [...new Set([...(tournament.participants || []), state.currentUser.name])];
  tournament.friends = (tournament.friends || 0) + 1;
  tournament.rank = tournament.friends;
  queueTournamentPersist(tournament);
  return true;
}

function renderCreateTournament() {
  const sourceMode = state.createSourceMode || "official";
  const selectedCompetition = getSelectedCompetition();
  const startingRoundOptions = createStartingRoundOptions();
  const initialRoundId = normalizeStartingRoundValue(sourceMode === "manual" ? "group" : selectedCompetition?.defaultStart || "group", startingRoundOptions);
  const initialRoundLabel = rounds.find((round) => round.id === initialRoundId)?.label || "دور المجموعات";
  const today = new Date().toISOString().slice(0, 10);
  const draft = state.createFormDraft || {};
  const selectedRoundValue = normalizeStartingRoundValue(draft.startingRound || initialRoundId, startingRoundOptions);
  app.innerHTML = `
    ${templateTopbar("بطولة جديدة")}
    <form class="card panel stack" id="create-form">
      <div>
        <h1 class="section-title">بطولة جديدة</h1>
        <p class="muted">أدخل البيانات الأساسية فقط. القوانين، الجوائز وقواعد النقاط تستكمل من إدارة البطولة.</p>
      </div>
      <div class="grid form-grid">
        <div class="field wide">
          <label>طريقة إنشاء البطولة</label>
          <div class="championship-segment create-source-segment" role="tablist" aria-label="طريقة إنشاء البطولة" style="--tab-count:2; --active-index:${sourceMode === "manual" ? 1 : 0}">
            <button class="championship-segment-btn create-source-btn ${sourceMode === "official" ? "active" : ""}" type="button" data-create-source="official" role="tab" aria-selected="${sourceMode === "official"}">من الربط الرياضي</button>
            <button class="championship-segment-btn create-source-btn ${sourceMode === "manual" ? "active" : ""}" type="button" data-create-source="manual" role="tab" aria-selected="${sourceMode === "manual"}">يدوي</button>
            <span class="championship-segment-indicator" aria-hidden="true"></span>
          </div>
          <small class="muted">${sourceMode === "manual" ? "ستضيف الفرق والمباريات لاحقاً من صفحة إدارة البطولة." : "اختر بطولة رسمية ليتم جلب أدوارها ومبارياتها من المصدر الرياضي."}</small>
        </div>
        <div class="field wide official-competition-picker ${sourceMode === "manual" ? "hidden" : ""}">
          <label>اختر البطولة الرسمية</label>
          <input class="input" id="competition-search" autocomplete="off" value="${state.competitionSearchQuery}" placeholder="ابحث باسم البطولة أو الكود من المصدر الرسمي">
          <input type="hidden" id="competition-id" value="${state.selectedCompetitionId}">
          <div class="competition-results" id="competition-results">
            ${selectedCompetition ? "" : competitionResultsHtml(state.competitionSearchQuery)}
          </div>
          <div class="selected-competition" id="selected-competition">
            ${selectedCompetitionSummary()}
          </div>
        </div>
        <div class="field wide">
          <label>اسم البطولة</label>
          <input class="input" id="tournament-name" required maxlength="40" value="${draft.name || (sourceMode === "official" ? selectedCompetition?.name || "" : "")}" placeholder="مثال: بطولة الأصدقاء">
        </div>
        <div class="field wide">
          <label>صورة بوست البطولة</label>
          <div class="post-image-setting create-post-image-setting">
            <div class="post-image-preview ${state.pendingCreateCoverImage?.url ? "has-image" : ""}">
              ${state.pendingCreateCoverImage?.url ? `<img src="${state.pendingCreateCoverImage.url}" alt="">` : `<span>تصميم الملعب الافتراضي</span>`}
            </div>
            <div>
              <strong>${state.pendingCreateCoverImage?.url ? "تم اختيار صورة" : "اختياري"}</strong>
              <p class="muted">هذه هي صورة البوست التي تظهر أعلى صفحة البطولة. إذا لم تضف صورة، يظهر تصميم الملعب الافتراضي.</p>
              <input class="sr-only-file" id="tournament-logo" type="file" accept="image/*">
              <button class="btn ghost compact-btn" type="button" id="choose-create-post-image">${state.pendingCreateCoverImage?.url ? "تعديل الصورة" : "اختيار صورة"}</button>
              ${state.pendingCreateCoverImage?.url ? `<button class="btn ghost compact-btn" type="button" id="remove-create-post-image">إزالة الصورة</button>` : ""}
            </div>
          </div>
        </div>
        <div class="toggle-row wide">
          <div>
            <strong>بطولة خاصة</strong>
            <div class="muted">عند التفعيل يتم توليد كود دعوة تلقائي.</div>
          </div>
          <button type="button" class="switch" id="privacy-switch" aria-pressed="false"><span></span></button>
        </div>
        <div class="field">
          <label>الحد الأقصى للمشاركين</label>
          <input class="input" id="max-players" type="number" min="2" value="${draft.maxPlayers || 16}">
        </div>
        <div class="field">
          <label>نقطة الانطلاق</label>
          <select class="select" id="starting-round">
            ${startingRoundOptions.map((round) => `<option value="${round.id}" ${round.id === selectedRoundValue ? "selected" : ""}>${round.label}</option>`).join("")}
          </select>
          <small class="muted">تتغير هذه القائمة حسب الأدوار التي يرجعها الربط الرياضي للبطولة المختارة.</small>
        </div>
        <div class="field">
          <label>تاريخ بداية البطولة</label>
          <input class="input" id="tournament-start-date" type="date" min="${today}" value="${draft.startDate || today}" required>
        </div>
        <div class="toggle-row wide">
          <div>
            <strong>هل البطولة فيها جوائز؟</strong>
            <div class="muted">إذا نعم، تضيف تفاصيل الجوائز لاحقاً من إدارة البطولة.</div>
          </div>
          <button type="button" class="switch" id="prizes-switch" aria-pressed="false"><span></span></button>
        </div>
      </div>
      <div class="notice" id="api-preview">${sourceMode === "manual" ? `مرحلة البداية: ستبدأ البطولة من ${initialRoundLabel}. أضف الفرق والمباريات من إدارة البطولة قبل التفعيل.` : `مرحلة البداية: سيتم جلب مباريات ${initialRoundLabel}، وبعد اعتماد نتائجها تفتح المرحلة التالية تلقائياً.`}</div>
      <div class="error-text" id="create-error"></div>
      <div class="topbar">
        <button class="btn warn" type="button" id="save-draft">حفظ كمسودة</button>
        <button class="btn accent" type="submit">إنشاء البطولة</button>
      </div>
    </form>
  `;

  const privacy = document.querySelector("#privacy-switch");
  const prizesSwitch = document.querySelector("#prizes-switch");
  privacy.classList.toggle("on", Boolean(draft.isPrivate));
  privacy.setAttribute("aria-pressed", String(Boolean(draft.isPrivate)));
  prizesSwitch.classList.toggle("on", Boolean(draft.hasPrizes));
  prizesSwitch.setAttribute("aria-pressed", String(Boolean(draft.hasPrizes)));
  document.querySelectorAll("[data-create-source]").forEach((button) => {
    button.addEventListener("click", () => {
      captureCreateFormDraft();
      state.createSourceMode = button.dataset.createSource;
      if (state.createSourceMode === "manual") {
        state.selectedCompetitionId = "";
        state.selectedCompetitionMatchesByRound = null;
        state.selectedCompetitionFixtureStatus = "";
        state.selectedCompetitionFixtureError = "";
      }
      renderCreateTournament();
    });
  });
  const competitionSearch = document.querySelector("#competition-search");
  if (competitionSearch) competitionSearch.addEventListener("input", (event) => {
    state.competitionSearchQuery = event.target.value;
    state.selectedCompetitionId = "";
    state.selectedCompetitionMatchesByRound = null;
    state.selectedCompetitionFixtureStatus = "";
    state.selectedCompetitionFixtureError = "";
    document.querySelector("#competition-id").value = "";
    document.querySelector("#selected-competition").innerHTML = selectedCompetitionSummary();
    document.querySelector("#create-error").textContent = "";
    refreshCreateSubmitState();
    scheduleOfficialCompetitionSearch(event.target.value);
  });
  privacy.addEventListener("click", () => {
    const isOn = !privacy.classList.contains("on");
    privacy.classList.toggle("on", isOn);
    privacy.setAttribute("aria-pressed", String(isOn));
  });
  prizesSwitch.addEventListener("click", () => {
    const isOn = !prizesSwitch.classList.contains("on");
    prizesSwitch.classList.toggle("on", isOn);
    prizesSwitch.setAttribute("aria-pressed", String(isOn));
  });
  const createPostImageInput = document.querySelector("#tournament-logo");
  const chooseCreatePostImage = document.querySelector("#choose-create-post-image");
  if (createPostImageInput && chooseCreatePostImage) {
    chooseCreatePostImage.addEventListener("click", () => {
      captureCreateFormDraft();
      createPostImageInput.click();
    });
    createPostImageInput.addEventListener("change", () => handleCreateTournamentPostImageSelection(createPostImageInput));
  }
  const removeCreatePostImage = document.querySelector("#remove-create-post-image");
  if (removeCreatePostImage) {
    removeCreatePostImage.addEventListener("click", () => {
      captureCreateFormDraft();
      state.pendingCreateCoverImage = null;
      renderCreateTournament();
    });
  }
  document.querySelector("#starting-round").addEventListener("change", (event) => {
    const label = rounds.find((round) => round.id === event.target.value).label;
    document.querySelector("#api-preview").textContent = state.createSourceMode === "manual"
      ? `مرحلة البداية: ستبدأ البطولة من ${label}. أضف الفرق والمباريات من إدارة البطولة قبل التفعيل.`
      : `مرحلة البداية: سيتم جلب مباريات ${label}، وبعد اعتماد نتائجها تفتح المرحلة التالية تلقائياً.`;
  });
  document.querySelector("#save-draft").addEventListener("click", async () => {
    const id = await saveTournament(true);
    if (id) navigate("/challenges/drafts");
  });
  document.querySelector("#create-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = await saveTournament(false);
    if (id) {
      state.selectedChampionshipsTab = "mine";
      tournamentCreatedModal(id);
    }
  });
}

function captureCreateFormDraft() {
  const nameInput = document.querySelector("#tournament-name");
  if (!nameInput) return;
  state.createFormDraft = {
    sourceMode: state.createSourceMode || "official",
    name: nameInput.value,
    maxPlayers: document.querySelector("#max-players")?.value || "16",
    startingRound: document.querySelector("#starting-round")?.value || "",
    startDate: document.querySelector("#tournament-start-date")?.value || "",
    isPrivate: document.querySelector("#privacy-switch")?.classList.contains("on") || false,
    hasPrizes: document.querySelector("#prizes-switch")?.classList.contains("on") || false
  };
}

function filterPublicTournamentsByStatus(tournaments) {
  const visible = tournaments.filter((tournament) => !tournament.cancelled && !tournament.draft);
  if (state.publicTournamentFilter === "started") return visible.filter((tournament) => tournament.active);
  if (state.publicTournamentFilter === "upcoming") return visible.filter((tournament) => !tournament.active);
  return visible;
}

function publicTournamentFilterHtml(tournaments) {
  const visible = tournaments.filter((tournament) => !tournament.cancelled && !tournament.draft);
  const filters = [
    { id: "all", label: "الكل", count: visible.length },
    { id: "started", label: "بدأت", count: visible.filter((tournament) => tournament.active).length },
    { id: "upcoming", label: "لم تبدأ", count: visible.filter((tournament) => !tournament.active).length }
  ];
  const activeIndex = Math.max(0, filters.findIndex((filter) => filter.id === state.publicTournamentFilter));
  return `
    <div class="championship-segment public-filter-segment" role="tablist" aria-label="فلترة البطولات العامة" style="--tab-count:${filters.length}; --active-index:${activeIndex}">
      ${filters.map((filter) => `
        <button class="championship-segment-btn public-filter-btn ${state.publicTournamentFilter === filter.id ? "active" : ""}" type="button" role="tab" aria-selected="${state.publicTournamentFilter === filter.id}" data-public-tournament-filter="${filter.id}">
          <span>${filter.label}</span>
          <strong>${filter.count}</strong>
        </button>
      `).join("")}
      <span class="championship-segment-indicator public-filter-indicator" aria-hidden="true"></span>
    </div>
  `;
}

function tournamentCreatedModal(tournamentId) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">تم حفظ البطولة</h2>
        ${modalCloseButton()}
      </div>
      <p class="muted">تم حفظ البطولة في صفحة إدارة البطولات. يرجى الدخول عليها لاستكمال بيانات البطولة قبل التفعيل.</p>
      <button class="btn accent" type="button" id="go-to-my-tournaments">الانتقال إلى إدارة البطولات</button>
    </section>
  `);
  document.querySelector("#close-modal")?.addEventListener("click", closeModal);
  document.querySelector("#go-to-my-tournaments")?.addEventListener("click", () => {
    closeModal();
    state.selectedChampionshipsTab = "mine";
    navigate("/create-tournament");
  });
}

function handleCreateTournamentPostImageSelection(input) {
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    openModal(`
      <section class="card modal stack">
        <div class="topbar">
          <h2 class="section-title">اختيار صورة</h2>
          ${modalCloseButton()}
        </div>
        <p class="muted">يرجى اختيار ملف صورة.</p>
      </section>
    `);
    document.querySelector("#close-modal").addEventListener("click", closeModal);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => createTournamentPostImageCropModal(String(reader.result || ""), file.name);
  reader.readAsDataURL(file);
}

function createTournamentPostImageCropModal(imageUrl, fileName) {
  openPostImageCropModal(imageUrl, fileName, (croppedUrl) => {
    captureCreateFormDraft();
    state.pendingCreateCoverImage = { url: croppedUrl, fileName };
    closeModal();
    renderCreateTournament();
  });
}

async function saveTournament(draft = false) {
  if (!validateCompetitionSelection()) return "";
  const sourceMode = state.createSourceMode || "official";
  const isManual = sourceMode === "manual";
  const tournamentName = document.querySelector("#tournament-name").value.trim();
  if (!tournamentName) {
    document.querySelector("#create-error").textContent = "اكتب اسم البطولة أولاً.";
    return "";
  }
  const startDate = document.querySelector("#tournament-start-date").value;
  if (!startDate) {
    document.querySelector("#create-error").textContent = "حدد تاريخ بداية البطولة أولاً.";
    return "";
  }
  const id = makeTournamentId();
  const selectedCompetition = getSelectedCompetition();
  const isPrivate = document.querySelector("#privacy-switch").classList.contains("on");
  const hasPrizes = document.querySelector("#prizes-switch").classList.contains("on");
  const competitionMatchesByRound = !isManual && selectedCompetition?.apiId
    ? (state.selectedCompetitionMatchesByRound || emptyMatchesByRound())
    : emptyMatchesByRound();
  if (!isManual && selectedCompetition?.apiId && state.selectedCompetitionFixtureStatus === "loading") {
    document.querySelector("#create-error").textContent = "انتظر حتى يكتمل جلب مباريات البطولة من الربط الرياضي.";
    return "";
  }
  if (!isManual && selectedCompetition?.apiId && !countPredictableMatchesByRound(competitionMatchesByRound)) {
    document.querySelector("#create-error").textContent = state.selectedCompetitionFixtureError || "لم يتم جلب مباريات قادمة لم تبدأ بعد لهذه البطولة، لذلك لا يمكن إنشاء بطولة توقعات واقعية منها حالياً.";
    return "";
  }
  const tournamentRoundIds = createStartingRoundOptions().map((round) => round.id);
  const startingRound = normalizeStartingRoundValue(document.querySelector("#starting-round").value, rounds.filter((round) => tournamentRoundIds.includes(round.id)));
  const tournament = {
    id,
    name: tournamentName,
    sourceMode,
    manual: isManual,
    manualTeams: [],
    officialCompetitionId: isManual ? "" : selectedCompetition.id,
    officialCompetitionApiId: isManual ? "" : selectedCompetition.apiId || "",
    officialCompetitionSeason: isManual ? "" : selectedCompetition.season || "",
    officialCompetitionLogoUrl: isManual ? "" : selectedCompetition.logoUrl || "",
    officialCompetitionCode: isManual ? "MANUAL" : selectedCompetition.code,
    officialCompetitionName: isManual ? tournamentName : selectedCompetition.name,
    matchesByRound: competitionMatchesByRound,
    fixturesStatus: isManual ? "manual" : state.selectedCompetitionFixtureStatus || (competitionMatchesByRound ? "pending" : ""),
    logoFileName: "",
    coverImageUrl: state.pendingCreateCoverImage?.url || "",
    postImageFileName: state.pendingCreateCoverImage?.fileName || "",
    public: !isPrivate,
    publicCode: isPrivate ? "" : (isManual ? "MANUAL" : selectedCompetition.code),
    active: false,
    draft,
    setupIncomplete: true,
    activationReady: false,
    startDate,
    hasPrizes,
    joined: true,
    owner: state.currentUser.name,
    ownerUsername: state.currentUser.handle.replace("@", ""),
    rank: 1,
    friends: 1,
    maxPlayers: Number(document.querySelector("#max-players").value) || 16,
    participants: [state.currentUser.name],
    points: 0,
    correct: 0,
    wrong: 0,
    budget: null,
    minPoints: null,
    rulesConfigured: false,
    roundIds: tournamentRoundIds,
    startingRound,
    currentRound: startingRound,
    inviteCode: isPrivate ? generateInviteCode() : null,
    awardCategories: [],
    prizes: [],
    joinRequests: [],
    localUpdatedAt: new Date().toISOString(),
    backendSynced: false
  };
  state.tournaments.unshift(tournament);
  const localBackupSaved = saveTournamentLocalBackup(tournament);
  saveLocalAppState();
  let backendSaved = false;
  try {
    backendSaved = Boolean(await persistTournamentToBackend(tournament));
  } catch (error) {
    tournament.backendSyncError = error.message || "تعذر حفظ البطولة في قاعدة البيانات.";
    state.backend.error = tournament.backendSyncError;
    saveLocalAppState();
  }
  if (!localBackupSaved && !backendSaved) {
    state.tournaments = state.tournaments.filter((item) => item.id !== id);
    const errorBox = document.querySelector("#create-error");
    if (errorBox) errorBox.textContent = tournament.backendSyncError || state.backend.error || "تعذر حفظ البطولة. جرّب تحديث الصفحة وتسجيل الدخول مرة أخرى.";
    return "";
  }
  state.pendingCreateCoverImage = null;
  state.createFormDraft = {};
  state.createSourceMode = "official";
  saveLocalAppState();
  return id;
}

function renderTournament(id, options = {}) {
  const tournament = getTournamentById(id);
  if (!tournament) return renderNotFoundPage("البطولة غير موجودة", "/create-tournament");
  const forcePlayerView = options.forcePlayer || state.route.endsWith("/player");
  if (isTournamentOwner(tournament) && !forcePlayerView) return renderOwnerTournament(tournament);
  const activeRound = forcePlayerView ? getTournamentPlayerActiveRound(tournament) : (tournament.currentRound || tournament.startingRound || "round16");
  const tournamentRounds = getTournamentRounds(tournament);
  const awardTabId = "pre-tournament-awards";
  const hasAwardTab = Boolean((tournament.awardCategories || []).length);
  const tournamentTabs = [
    ...(hasAwardTab ? [{ id: awardTabId, label: "ترشيحات البطولة", locked: false, type: "awards" }] : []),
    ...tournamentRounds.map((round) => {
      const roundIndex = rounds.findIndex((item) => item.id === round.id);
      const activeRoundIndexForTab = rounds.findIndex((item) => item.id === activeRound);
      return { ...round, locked: roundIndex > activeRoundIndexForTab, type: "round" };
    })
  ];
  const savedViewExists = tournamentTabs.some((tab) => tab.id === state.selectedRound);
  const savedViewHasManualMatches = isManualTournament(tournament) && getTournamentMatches(tournament, state.selectedRound).length;
  const selectedView = savedViewExists && (!forcePlayerView || !isManualTournament(tournament) || state.selectedRound === activeRound || savedViewHasManualMatches)
    ? state.selectedRound
    : activeRound;
  const showingAwards = selectedView === awardTabId;
  const selectedRound = showingAwards ? activeRound : selectedView;
  const selectedRoundIndex = rounds.findIndex((round) => round.id === selectedRound);
  const activeRoundIndex = rounds.findIndex((round) => round.id === activeRound);
  const selectedTournamentRoundIndex = Math.max(0, tournamentTabs.findIndex((tab) => tab.id === selectedView));
  const isLocked = selectedRoundIndex > activeRoundIndex;
  const matches = showingAwards || isLocked ? [] : getTournamentPredictionSourceMatches(tournament, selectedRound);
  const visibleMatches = showingAwards || isLocked ? [] : getVisiblePredictionMatchesForRound(tournament, selectedRound, matches);
  const selectedPredictionClosed = visibleMatches.length && visibleMatches.every((match) => isPredictionLockedForMatch(selectedRound, match, visibleMatches));
  const used = getUsedBudget(tournament.id, selectedRound);
  const nextRound = getNextRound(tournament);
  const canAdvanceRound = isTournamentOwner(tournament) && !forcePlayerView;
  const tournamentFinished = isTournamentFinished(tournament);
  const selectedRule = getTournamentPointRules(tournament)[selectedRound] || {};
  const rerenderCurrentTournamentView = () => renderTournament(tournament.id, { forcePlayer: forcePlayerView });

  app.innerHTML = `
    ${templateTopbar(tournament.name)}
    <section class="grid">
      ${playerTournamentSummaryCard(tournament, activeRound)}
      <div class="card panel stack">
        <div class="championship-segment round-segment" role="tablist" aria-label="أدوار البطولة" style="--tab-count: ${tournamentTabs.length}; --active-index: ${selectedTournamentRoundIndex};">
          ${tournamentTabs.map((round) => {
            const locked = Boolean(round.locked);
            return `
            <button class="championship-segment-btn round-segment-btn ${round.id === selectedView ? "active" : ""} ${locked ? "locked" : ""}" type="button" data-round="${round.id}" role="tab" aria-selected="${round.id === selectedView}" ${locked ? "disabled" : ""}>
              ${locked ? "🔒 " : ""}${round.label}
            </button>
          `}).join("")}
          <span class="championship-segment-indicator" aria-hidden="true"></span>
        </div>
        ${showingAwards ? "" : groupMatchdayFilterHtml(tournament, selectedRound, matches, "player")}
        ${showingAwards ? "" : playerRoundRulesBox(tournament, selectedRound, selectedRule)}
        <div class="round-lifecycle">
          <div>
            <strong>الدور الحالي: ${rounds.find((round) => round.id === activeRound).label}</strong>
            <p class="muted">${nextRound ? `الدور التالي يفتح بعد اعتماد نتائج ${rounds.find((round) => round.id === activeRound).label} من الـ API.` : "هذه آخر مرحلة في البطولة."}</p>
          </div>
          ${nextRound && canAdvanceRound ? `<button class="btn warn" data-advance-round="${tournament.id}">تحديث واعتماد الدور</button>` : ""}
        </div>
        ${selectedPredictionClosed ? `<div class="notice danger-notice">${selectedRound === "group" ? "تم قفل توقعات مباريات هذه الجولة. اللاعبون بدون توقعات مكتملة في المباراة المقفلة يعتبرون خاسرين لنقاطها عند التسوية." : "تم قفل توقعات هذا الدور. اللاعبون بدون توقعات مكتملة يعتبرون خاسرين لنقاط الجولة عند التسوية."}</div>` : ""}
      </div>
      ${tournamentFinished ? tournamentFinalAwardResults(tournament) : showingAwards ? awardNominationWorkflow(tournament) : `
        ${matches.length ? "" : `<div class="card panel">${emptyRoundMatchesMessage(tournament, isLocked)}</div>`}
        ${pickBoardWorkflow(tournament, selectedRound, matches, { used })}
      `}
    </section>
  `;
  scheduleScrollableTabsIntoView();

  document.querySelectorAll("[data-round]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRound = button.dataset.round;
      rerenderCurrentTournamentView();
    });
  });
  document.querySelectorAll("[data-group-matchday]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMatchdayByTournament[matchdayStateKey(tournament.id, selectedRound)] = button.dataset.groupMatchday;
      saveLocalAppState();
      rerenderCurrentTournamentView();
    });
  });
  setupTournamentRoundSwipe(tournament, tournamentTabs, selectedView, activeRoundIndex);
  document.querySelectorAll("[data-predict]").forEach((button) => {
    button.addEventListener("click", () => predictionModal(tournament, selectedRound, button.dataset.predict));
  });
  document.querySelectorAll("[data-inline-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      saveInlinePredictionAuto(tournament, selectedRound, button.dataset.inlinePick, button.dataset.outcome, button);
    });
  });
  document.querySelectorAll("[data-inline-edit]").forEach((button) => {
    button.addEventListener("click", () => startInlinePredictionEdit(tournament, selectedRound, button.dataset.inlineEdit));
  });
  document.querySelectorAll("[data-inline-detail-save]").forEach((button) => {
    button.addEventListener("click", () => saveInlinePredictionDetails(tournament, selectedRound, button.dataset.inlineDetailSave));
  });
  document.querySelectorAll("[data-quick-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.quickPicks[button.dataset.quickPick] = button.dataset.outcome;
      rerenderCurrentTournamentView();
    });
  });
  document.querySelectorAll("[data-advance-round]").forEach((button) => {
    button.addEventListener("click", async () => {
      await refreshAndAdvanceTournamentRound(button.dataset.advanceRound);
    });
  });
  document.querySelectorAll("[data-full-leaderboard]").forEach((button) => {
    button.addEventListener("click", () => leaderboardModal(getTournamentById(button.dataset.fullLeaderboard)));
  });
  document.querySelectorAll("[data-award-search]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.awardSearch;
      state.awardSearchQueries[key] = input.value;
      const resultsBox = input.closest(".award-card").querySelector("[data-award-results]");
      resultsBox.innerHTML = awardSearchResultsHtml(input.dataset.awardId, key, input.value);
    });
  });
  startMatchCountdowns();
}

function markInlinePredictionSelection(button) {
  const card = button.closest(".prediction-row-card");
  if (!card) return;
  card.querySelectorAll("[data-inline-pick]").forEach((item) => {
    item.classList.toggle("selected", item === button);
  });
  const error = card.querySelector(".prediction-inline-error");
  if (error) error.remove();
}

function renderTournamentInCurrentMode(tournament) {
  renderTournament(tournament.id, { forcePlayer: state.route.endsWith("/player") });
}

function startInlinePredictionEdit(tournament, round, matchId) {
  const matches = getTournamentPredictionSourceMatches(tournament, round);
  const match = matches.find((item) => item.id === matchId);
  if (!match || isPredictionLockedForMatch(round, match, matches)) return;
  const key = `${tournament.id}:${round}:${match.id}`;
  state.editingPredictions[key] = true;
  state.quickPicks[key] = getPredictionOutcome(state.predictions[key] || {});
  delete state.predictionErrors[key];
  renderTournamentInCurrentMode(tournament);
}

function saveInlinePredictionAuto(tournament, round, matchId, outcome, button = null) {
  const matches = getTournamentPredictionSourceMatches(tournament, round);
  const match = matches.find((item) => item.id === matchId);
  if (!match || isPredictionLockedForMatch(round, match, matches)) return;
  const rule = getPointRuleForRound(tournament, round);
  const key = `${tournament.id}:${round}:${match.id}`;
  if (isPredictionComplete(tournament.id, round, match.id) && !isPredictionEditing(key)) return;
  state.quickPicks[key] = outcome;
  delete state.predictionErrors[key];

  if (requiresInlinePredictionDetails(rule, outcome)) {
    if (button) markInlinePredictionSelection(button);
    renderTournamentInCurrentMode(tournament);
    return;
  }

  const next = {
    outcome,
    points: getAutoPredictionPoints(tournament, round, match, outcome, rule),
    pointEntry: "auto"
  };
  const validation = validatePrediction(tournament, round, key, next);
  if (validation) {
    state.predictionErrors[key] = validation;
    renderTournamentInCurrentMode(tournament);
    return;
  }

  state.predictions[key] = next;
  state.quickPicks[key] = outcome;
  delete state.editingPredictions[key];
  delete state.predictionErrors[key];
  if (button) markInlinePredictionSelection(button);
  queueTournamentPersist(tournament);
  renderTournamentInCurrentMode(tournament);
}

function saveInlinePredictionDetails(tournament, round, matchId) {
  const matches = getTournamentPredictionSourceMatches(tournament, round);
  const match = matches.find((item) => item.id === matchId);
  if (!match || isPredictionLockedForMatch(round, match, matches)) return;
  const key = `${tournament.id}:${round}:${match.id}`;
  if (isPredictionComplete(tournament.id, round, match.id) && !isPredictionEditing(key)) return;

  const rule = getPointRuleForRound(tournament, round);
  const outcome = state.quickPicks[key] || getPredictionOutcome(state.predictions[key] || {});
  if (!outcome) {
    state.predictionErrors[key] = "اختر الفائز من البطاقة أولاً.";
    renderTournamentInCurrentMode(tournament);
    return;
  }

  let next = { outcome, points: getAutoPredictionPoints(tournament, round, match, outcome, rule), pointEntry: "auto" };

  if (requiresManualPredictionPoints(rule)) {
    const input = document.querySelector(`[data-inline-points="${CSS.escape(match.id)}"]`);
    next = { outcome, points: Number(input?.value || 0), pointEntry: "manual" };
  } else if (requiresVariablePercentInput(rule, outcome)) {
    const input = document.querySelector(`[data-inline-percent="${CSS.escape(match.id)}"]`);
    const winnerPercent = Number(input?.value || 0);
    const minPercent = Number(rule.minPercent || 20);
    if (winnerPercent < minPercent || winnerPercent > 100 - minPercent) {
      state.predictionErrors[key] = `النسبة يجب أن تكون بين ${minPercent}% و ${100 - minPercent}%.`;
      renderTournamentInCurrentMode(tournament);
      return;
    }
    next = {
      outcome,
      points: getAutoPredictionPoints(tournament, round, match, outcome, rule, { winnerPercent }),
      pointEntry: "auto",
      winnerPercent,
      loserPercent: 100 - winnerPercent
    };
  }

  const validation = validatePrediction(tournament, round, key, next);
  if (validation) {
    state.predictionErrors[key] = validation;
    renderTournamentInCurrentMode(tournament);
    return;
  }

  state.predictions[key] = next;
  state.quickPicks[key] = outcome;
  delete state.editingPredictions[key];
  delete state.predictionErrors[key];
  queueTournamentPersist(tournament);
  renderTournamentInCurrentMode(tournament);
}

function playerTournamentSummaryCard(tournament, activeRound) {
  const rows = leaderboardData(tournament);
  const currentRowIndex = rows.findIndex((row) => row.name === state.currentUser.name);
  const currentRow = currentRowIndex >= 0 ? rows[currentRowIndex] : null;
  const points = currentRow?.points ?? tournament.points ?? 0;
  const correct = currentRow?.correct ?? tournament.correct ?? 0;
  const wrong = currentRow?.wrong ?? tournament.wrong ?? 0;
  const total = currentRow?.total ?? (correct + wrong);
  const rank = currentRowIndex >= 0 ? currentRowIndex + 1 : tournament.rank || "-";
  const roundLabel = rounds.find((round) => round.id === activeRound)?.label || "الدور الحالي";
  const prizesLabel = tournamentPrizeStatusLabel(tournament);
  return `
    <section class="player-tournament-summary">
      <div class="player-summary-cover">
        ${tournament.coverImageUrl ? `<img class="owner-cover-image" src="${tournament.coverImageUrl}" alt="">` : `<img class="owner-tournament-logo" src="${currentLogoSrc()}" alt="">`}
      </div>
      <div class="player-summary-body">
        <div class="player-summary-title">
          <div>
            <h1>${tournament.name}</h1>
            <p>${roundLabel} · ${tournament.public ? "بطولة عامة" : "بطولة خاصة"}</p>
          </div>
        </div>
        <div class="player-summary-grid">
          <div>
            <span>إجمالي الترشيحات</span>
            <strong>${total}</strong>
          </div>
          <div>
            <span>صحيحة</span>
            <strong class="success-text">${correct}</strong>
          </div>
          <div>
            <span>خاطئة</span>
            <strong class="danger-text">${wrong}</strong>
          </div>
          <div>
            <span>إجمالي النقاط</span>
            <strong>${points}</strong>
          </div>
          <button type="button" data-card-info="leaderboard" data-tournament-id="${tournament.id}">
            <span>الترتيب</span>
            <strong>#${rank}</strong>
          </button>
          <button type="button" data-card-info="prizes" data-tournament-id="${tournament.id}">
            <span>الجوائز</span>
            <strong>${prizesLabel}</strong>
          </button>
        </div>
      </div>
    </section>
  `;
}

function playerRoundRulesBox(tournament, roundId, rule) {
  const roundLabel = rounds.find((round) => round.id === roundId)?.label || "الدور الحالي";
  const hasRule = isPointRuleRoundSaved(tournament, roundId);
  const ruleTitle = hasRule ? pointRuleTypeLabel(rule) : "قوانين غير مكتملة";
  const details = hasRule
    ? [
      pointRuleDescription(rule),
      `التوقعات تقفل قبل ${PREDICTION_LOCK_MINUTES} دقيقة من بداية أول مباراة في الدور.`,
      `أي لاعب يقل رصيده عن الحد الأدنى للتصويت لكل فريق يتم إقصاؤه تلقائياً.`
    ]
    : ["لم يتم اعتماد قوانين هذا الدور بعد من صاحب البطولة."];
  return `
    <section class="player-round-rules">
      <div class="section-row">
        <div>
          <h2 class="section-title">شروط وقوانين ${roundLabel}</h2>
          <p class="muted">${ruleTitle}</p>
        </div>
      </div>
      <div class="player-round-rule-list">
        ${details.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </section>
  `;
}

function setupTournamentRoundSwipe(tournament, tournamentRounds, selectedRound, activeRoundIndex) {
  const segment = document.querySelector(".round-segment");
  if (!segment) return;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let pressedRound = "";

  segment.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const button = event.target.closest("[data-round]");
    pressedRound = button && !button.disabled ? button.dataset.round : "";
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  segment.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && pressedRound) {
      event.preventDefault();
      state.selectedRound = pressedRound;
      pressedRound = "";
      renderTournament(tournament.id, { forcePlayer: state.route.endsWith("/player") });
      return;
    }
    pressedRound = "";
  });

  segment.addEventListener("pointercancel", () => {
    isDragging = false;
    pressedRound = "";
  });
}

function isDeveloperMode() {
  return new URLSearchParams(window.location.search).has("dev");
}

function isTournamentOwner(tournament) {
  if (!tournament) return false;
  const currentUsername = state.currentUser.handle.replace("@", "");
  return tournament.owner === state.currentUser.name
    || tournament.ownerUsername === currentUsername;
}

function renderOwnerTournament(tournament) {
  if (!tournament) return renderNotFoundPage("البطولة غير موجودة", "/create-tournament");
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const matches = getTournamentMatches(tournament, activeRound);
  const participants = getTournamentParticipants(tournament);
  const captainUsername = getTournamentOwnerUsername(tournament);
  const aboutLabel = tournament.public ? "بطولة عامة" : "بطولة خاصة";
  const prizesLabel = tournament.hasPrizes || (tournament.awardCategories || []).length || getTournamentPrizes(tournament).length ? "جوائز متاحة" : "بدون جوائز";
  const requestCount = getJoinRequestCount(tournament);
  const participantCount = tournament.friends || participants.length || 1;
  const currentStageTitle = tournament.active && !tournament.setupIncomplete
    ? (rounds.find((round) => round.id === activeRound)?.label || "الدور الحالي")
    : "مرحلة إدخال تفاصيل البطولة";
  const startingRoundLabel = rounds.find((round) => round.id === (tournament.startingRound || "round16"))?.label || "دور 16";
  app.innerHTML = `
    ${ownerTournamentTopbar(tournament)}
    <section class="owner-tournament-page">
      <section class="owner-tournament-hero">
        <div class="owner-cover">
          ${tournament.coverImageUrl ? `<img class="owner-cover-image" src="${tournament.coverImageUrl}" alt="">` : ""}
          ${tournament.coverImageUrl ? "" : `<img class="owner-tournament-logo" src="${currentLogoSrc()}" alt="">`}
        </div>
        <div class="owner-title-block">
          <div class="owner-group-avatar">${tournament.name.slice(0, 1)}</div>
          <div class="owner-title-content">
            <div class="owner-title-row">
              <div>
                <h1>${tournament.name}</h1>
                <p>تبدأ من ${startingRoundLabel} · ${aboutLabel}</p>
              </div>
            </div>
            <div class="owner-priority-actions">
              <button type="button" data-share-tournament="${tournament.id}" aria-label="مشاركة البطولة" title="مشاركة البطولة">
                <strong>${ownerTournamentIcon("share")}</strong>
                <span>مشاركة</span>
              </button>
              <button type="button" data-route="/tournament/${tournament.id}/manage/requests">
                <strong>${requestCount}</strong>
                <span>طلبات الدخول</span>
              </button>
              <button type="button" data-route="/tournament/${tournament.id}/manage/players">
                <strong>${participantCount}</strong>
                <span>المشاركون</span>
              </button>
              <button type="button" data-route="/user/${captainUsername}">
                <strong>@${captainUsername}</strong>
                <span>القائد</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      ${!tournament.active ? ownerActivationPanel(tournament) : ""}

      <section class="owner-action-list">
        ${isManualTournament(tournament) ? ownerTournamentActionRow("manual-teams", "إضافة الفرق", "bars", `/tournament/${tournament.id}/manage/manual-teams`, isSectionIncomplete(tournament, "manual-teams")) : ""}
        ${isManualTournament(tournament) ? ownerTournamentActionRow("manual-matches", "إدارة المباريات", "ball", `/tournament/${tournament.id}/manage/manual-matches`, isSectionIncomplete(tournament, "manual-matches")) : ""}
        ${ownerTournamentActionRow("voting", "حالة التصويت", "check", `/tournament/${tournament.id}/manage/voting`, isSectionIncomplete(tournament, "voting"))}
        ${ownerTournamentActionRow("results", "نتائج المباريات", "ball", `/tournament/${tournament.id}/manage/results`, isSectionIncomplete(tournament, "results"))}
        ${ownerTournamentActionRow("prediction-results", "نتائج التوقعات", "bars", `/tournament/${tournament.id}/manage/prediction-results`, isSectionIncomplete(tournament, "prediction-results"))}
        ${ownerTournamentActionRow("leaderboard", "ترتيب المشاركين", "trophy", `/tournament/${tournament.id}/manage/leaderboard`, isSectionIncomplete(tournament, "leaderboard"))}
        ${ownerTournamentActionRow("rules", "قوانين البطولة", "ball", `/tournament/${tournament.id}/manage/rules`, isSectionIncomplete(tournament, "rules"))}
        ${ownerTournamentActionRow("prizes", "إدارة الجوائز", "trophy", `/tournament/${tournament.id}/manage/prizes`, isSectionIncomplete(tournament, "prizes"))}
        ${ownerTournamentActionRow("notify", "الإشعارات", "chat", `/tournament/${tournament.id}/manage/notify`, isSectionIncomplete(tournament, "notify"))}
        ${ownerTournamentActionRow("danger", "منطقة الخطر", "gear", `/tournament/${tournament.id}/manage/danger`)}
        ${ownerTournamentActionRow("admin-team", "إدارة البطولة", "gear", `/tournament/${tournament.id}/manage/admin-team`, isSectionIncomplete(tournament, "admin-team"))}
      </section>
    </section>
  `;

  document.querySelectorAll("[data-owner-tournament-action]").forEach((button) => {
    button.addEventListener("click", () => ownerTournamentModal(tournament, button.dataset.ownerTournamentAction, matches));
  });
  document.querySelectorAll("[data-share-tournament]").forEach((button) => {
    button.addEventListener("click", () => shareTournamentInvite(getTournamentById(button.dataset.shareTournament)));
  });
  document.querySelectorAll("[data-activate-tournament]").forEach((button) => {
    button.addEventListener("click", () => activateTournament(button.dataset.activateTournament));
  });
}

function ownerTournamentTopbar(tournament) {
  return `
    <header class="topbar page-topbar owner-tournament-topbar">
      <div class="topbar-side">
        <button class="btn ghost back-btn" data-back="true" aria-label="Back" title="Back">←</button>
      </div>
      <button class="page-title-btn" data-route="/create-tournament">
        <span>إدارة البطولة</span>
      </button>
      <div class="topbar-side">
        <button class="owner-gear-btn" type="button" data-route="/tournament/${tournament.id}/manage/settings" aria-label="Tournament settings" title="إعدادات البطولة">
          ${ownerTournamentIcon("gear")}
        </button>
      </div>
    </header>
  `;
}

function getTournamentById(id) {
  const tournament = state.tournaments.find((item) => item.id === id) || null;
  return tournament ? normalizeTournamentData(tournament) : null;
}

function ownerTournamentActionRow(action, label, icon, route = "", incomplete = false) {
  const actionAttribute = route ? `data-route="${route}"` : `data-owner-tournament-action="${action}"`;
  const description = ownerActionDescription(action);
  return `
    <button class="owner-action-row" type="button" ${actionAttribute}>
      <span class="owner-action-icon">${ownerTournamentIcon(icon)}</span>
      <span class="owner-action-copy">
        <strong>${label}</strong>
        <small>${description}</small>
      </span>
      ${incomplete ? `<i class="incomplete-dot row-end-dot" aria-hidden="true"></i>` : `<span class="row-end-dot-placeholder"></span>`}
      <span class="owner-action-arrow">›</span>
    </button>
  `;
}

function ownerActionDescription(action) {
  const descriptions = {
    requests: "اعتماد أو رفض طلبات الانضمام",
    players: "إدارة المشاركين وحذف المخالفين",
    voting: "متابعة من صوّت ومن لم يصوّت",
    results: "استعراض نتائج المباريات المعتمدة",
    "prediction-results": "مراجعة توقعات المشاركين لكل دور",
    leaderboard: "ترتيب المشاركين حسب النقاط",
    rules: "قوانين البطولة الظاهرة للمشاركين",
    prizes: "تفعيل الجوائز وتحديد تفاصيلها",
    invites: "كود الدعوة ورابط المشاركة",
    notify: "إرسال تنبيهات لأعضاء البطولة",
    danger: "إيقاف المشاركة أو إلغاء البطولة",
    "admin-team": "تعيين مساعدين وصلاحياتهم",
    settings: "تعديل بيانات البطولة الأساسية",
    awards: "إدارة ترشيحات اللاعبين والفرق",
    points: "تحديد آلية النقاط لكل دور",
    "manual-teams": "إضافة الفرق وشعاراتها مرة واحدة",
    "manual-matches": "إنشاء مباريات البطولة من قائمة الفرق"
  };
  return descriptions[action] || "إدارة هذا القسم";
}

function ownerTournamentIcon(type) {
  const icons = {
    ball: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9 8 3-2 3 2 1 4-4 3-4-3 1-4Z"/><path d="M12 15v4M8 12l-4 1M16 12l4 1M9 8 6 5M15 8l3-3"/></svg>`,
    bars: `<svg viewBox="0 0 24 24"><path d="M5 20V10"/><path d="M12 20V5"/><path d="M19 20v-8"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/><circle cx="12" cy="12" r="9"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4"/><path d="M17 6h3v2a4 4 0 0 1-4 4"/></svg>`,
    chat: `<svg viewBox="0 0 24 24"><path d="M5 6h14v9H8l-4 4V6Z"/><path d="M8 10h8M8 13h5"/></svg>`,
    share: `<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/></svg>`,
    gear: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.8-1L14.4 3h-4.8l-.3 3.1a7 7 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.8 1l.3 3.1h4.8l.3-3.1a7 7 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/></svg>`
  };
  return icons[type] || icons.gear;
}

async function shareTournamentInvite(tournament) {
  const baseUrl = window.location.href.split("#")[0].split("?")[0];
  const inviteUrl = `${baseUrl}#/tournament/${tournament.id}`;
  const inviteText = `انضم إلى ${tournament.name} في Pick A Side. يجب أن يكون لديك حساب للمشاركة.`;

  try {
    if (navigator.share) {
      await navigator.share({ title: tournament.name, text: inviteText, url: inviteUrl });
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(inviteUrl);
      tournamentShareModal(inviteUrl, "تم نسخ رابط البطولة. المشاركون يحتاجون حساب للدخول.");
      return;
    }
  } catch {
    // Fall back to showing the link.
  }

  tournamentShareModal(inviteUrl, "انسخ رابط البطولة. المشاركون يحتاجون حساب للدخول.");
}

function tournamentShareModal(inviteUrl, message) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">مشاركة البطولة</h2>
        ${modalCloseButton()}
      </div>
      <p class="muted">${message}</p>
      <input class="input" readonly value="${inviteUrl}">
      <button class="btn accent" id="copy-tournament-link" type="button">نسخ الرابط</button>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#copy-tournament-link").addEventListener("click", async () => {
    if (navigator.clipboard) await navigator.clipboard.writeText(inviteUrl);
  });
}

function getTournamentOrganizers(tournament) {
  return tournament.organizers || [`@${getTournamentOwnerUsername(tournament)}`];
}

function getTournamentSponsors(tournament) {
  return tournament.sponsors || [];
}

function ownerTournamentModal(tournament, action, matches) {
  const titles = {
    results: "نتائج المباريات",
    standings: "ترتيب الجولة",
    leaderboard: "المتصدرون",
    notify: "إرسال إشعار للأعضاء",
    manage: "إدارة البطولة"
  };
  const content = {
    results: matches.map((match) => `<div class="leader-row"><span>${teamIdentityHtml(match.a)} ضد ${teamIdentityHtml(match.b)}</span><strong>${match.score || "لم تبدأ"}</strong></div>`).join(""),
    standings: `<p class="muted">يعرض ترتيب اللاعبين داخل الجولة الحالية بعد اعتماد النتائج من الربط الرياضي.</p>`,
    leaderboard: leaderboardRows(tournament).join(""),
    notify: ownerNotificationForm(tournament),
    manage: `<p class="muted">من هنا يدير صاحب البطولة الطلبات، حذف اللاعبين المخالفين، إعدادات الخصوصية، والجوائز.</p>`
  };
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">${titles[action] || titles.manage}</h2>
        ${modalCloseButton()}
      </div>
      <div class="owner-modal-content">${content[action] || content.manage}</div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  const notifyForm = document.querySelector("#owner-notification-form");
  if (notifyForm) {
    notifyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendOwnerNotification(tournament);
    });
  }
}

function ownerNotificationForm(tournament) {
  const participantCount = tournament.participants?.length || tournament.friends || 1;
  return `
    <form class="stack owner-notification-form" id="owner-notification-form">
      <p class="muted">أرسل تحديثاً مختصراً لأعضاء البطولة. سيظهر في خانة التنبيهات ويفتح صفحة البطولة عند الضغط عليه.</p>
      <label class="field">
        <span>عنوان الإشعار</span>
        <input class="input" id="owner-notification-title" maxlength="40" value="تحديث من ${tournament.name}">
      </label>
      <label class="field">
        <span>نص الإشعار</span>
        <textarea class="textarea" id="owner-notification-body" maxlength="140" rows="4" placeholder="مثال: تم اعتماد نتائج الجولة، راجع ترتيبك الآن."></textarea>
      </label>
      <label class="field">
        <span>الإرسال إلى</span>
        <select class="select" id="owner-notification-scope">
          <option value="all">كل الأعضاء (${participantCount})</option>
          <option value="pending">الذين لم يصوتوا بعد</option>
          <option value="voted">الذين أنهوا التصويت</option>
        </select>
      </label>
      <div class="topbar">
        <span class="muted" id="owner-notification-status"></span>
        <button class="btn accent" type="submit">إرسال الإشعار</button>
      </div>
    </form>
  `;
}

function ownerRecentNotificationsForTournament(tournament) {
  return state.notifications
    .filter((notification) => notification.tournamentId === tournament.id || notification.route === `/tournament/${tournament.id}`)
    .slice(0, 5);
}

function ownerRecentNotificationsListHtml(tournament) {
  const recentNotifications = ownerRecentNotificationsForTournament(tournament);
  if (!recentNotifications.length) {
    return `<p class="muted">لا توجد إشعارات مرسلة لهذه البطولة بعد.</p>`;
  }
  return recentNotifications.map((notification) => `
    <div class="leader-row compact-notification-row">
      <div>
        <span>${notification.title}</span>
        <small>${notification.body || ""}</small>
      </div>
      <strong>${notification.time}</strong>
    </div>
  `).join("");
}

function ownerRecentNotificationsPanel(tournament) {
  return `
    <section class="card panel stack manage-detail-card">
      <h2 class="section-title">آخر الإشعارات</h2>
      <div id="owner-recent-notifications">
        ${ownerRecentNotificationsListHtml(tournament)}
      </div>
    </section>
  `;
}

function sendOwnerNotification(tournament) {
  const title = document.querySelector("#owner-notification-title")?.value.trim() || `تحديث من ${tournament.name}`;
  const body = document.querySelector("#owner-notification-body")?.value.trim();
  const scope = document.querySelector("#owner-notification-scope")?.value || "all";
  const status = document.querySelector("#owner-notification-status");
  if (!body) {
    if (status) {
      status.textContent = "اكتب نص الإشعار أولاً.";
      status.classList.add("form-error-inline");
    }
    return;
  }

  state.notifications.unshift({
    id: `n-owner-${Date.now()}`,
    type: "tournament-update",
    title,
    body,
    time: "الآن",
    icon: "trophy",
    unread: true,
    route: `/tournament/${tournament.id}`,
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    scope
  });

  saveLocalAppState();
  updateNotificationBadges();
  const recentNotifications = document.querySelector("#owner-recent-notifications");
  if (recentNotifications) {
    recentNotifications.innerHTML = ownerRecentNotificationsListHtml(tournament);
  }
  if (status) {
    status.textContent = "تم إرسال الإشعار للأعضاء.";
    status.classList.remove("form-error-inline");
    status.classList.add("form-success-inline");
  }
  const bodyField = document.querySelector("#owner-notification-body");
  if (bodyField) bodyField.value = "";
}

function renderTournamentManage(id, section) {
  const tournament = getTournamentById(id);
  if (!tournament) return renderNotFoundPage("البطولة غير موجودة", "/create-tournament");
  if (!isTournamentOwner(tournament)) return renderTournament(tournament.id);
  if (section) return renderTournamentManageSection(tournament, section);
  const statusText = tournament.cancelled ? "ملغية" : (tournament.active ? "نشطة" : "لم تبدأ");
  const introText = tournament.cancelled
    ? "تم إلغاء البطولة ولن تكون متاحة للمشاركة أو التوقعات."
    : (tournament.active ? "البطولة مفعلة وتظهر للمشاركين." : "استكمل بيانات البطولة ثم فعّلها لتظهر للجميع.");

  app.innerHTML = `
    ${templateTopbar("إدارة البطولة")}
    <section class="owner-manage-page">
      <section class="card panel stack manage-intro-card">
        <div>
          <h1 class="section-title">${tournament.name}</h1>
          <p class="muted">${introText}</p>
        </div>
        <span class="championship-status-text">${statusText}</span>
        ${tournament.cancelled && tournament.cancelReason ? `<div class="notice danger-notice">سبب الإلغاء: ${tournament.cancelReason}</div>` : ""}
        ${!tournament.active && !tournament.cancelled ? ownerActivationPanel(tournament) : ""}
      </section>

      <section class="owner-action-list">
        ${isManualTournament(tournament) ? ownerManageRow(tournament, "manual-teams", "إضافة الفرق", "bars", getManualTeams(tournament).length, isSectionIncomplete(tournament, "manual-teams")) : ""}
        ${isManualTournament(tournament) ? ownerManageRow(tournament, "manual-matches", "إدارة المباريات", "ball", countMatchesByRound(tournament.matchesByRound), isSectionIncomplete(tournament, "manual-matches")) : ""}
        ${ownerManageRow(tournament, "voting", "حالة التصويت", "check", getVotingSummary(tournament), isSectionIncomplete(tournament, "voting"))}
        ${ownerManageRow(tournament, "results", "نتائج المباريات", "ball", tournament.currentRound || tournament.startingRound || "-", isSectionIncomplete(tournament, "results"))}
        ${ownerManageRow(tournament, "prediction-results", "نتائج التوقعات", "bars", `${tournament.correct || 0}/${tournament.wrong || 0}`, isSectionIncomplete(tournament, "prediction-results"))}
        ${ownerManageRow(tournament, "leaderboard", "ترتيب المشاركين", "trophy", tournament.friends || getTournamentParticipants(tournament).length || 0, isSectionIncomplete(tournament, "leaderboard"))}
        ${ownerManageRow(tournament, "rules", "قوانين البطولة", "ball", areAllPointRulesSaved(tournament) ? "مكتملة" : "بيانات فارغة", isSectionIncomplete(tournament, "rules"))}
        ${ownerManageRow(tournament, "prizes", "إدارة الجوائز", "trophy", tournament.hasPrizes ? (getTournamentPrizes(tournament).length || "بيانات فارغة") : "غير مفعلة", isSectionIncomplete(tournament, "prizes"))}
        ${ownerManageRow(tournament, "invites", "الدعوات والكود", "share", tournament.public ? "رابط عام" : (tournament.inviteCode || "تلقائي"), false)}
        ${ownerManageRow(tournament, "notify", "الإشعارات", "chat", "إرسال", isSectionIncomplete(tournament, "notify"))}
        ${ownerManageRow(tournament, "danger", "منطقة الخطر", "gear", "حساس", false)}
        ${ownerManageRow(tournament, "admin-team", "إدارة البطولة", "gear", getTournamentOrganizers(tournament).length, isSectionIncomplete(tournament, "admin-team"))}
      </section>
    </section>
  `;
  document.querySelectorAll("[data-activate-tournament]").forEach((button) => {
    button.addEventListener("click", () => activateTournament(button.dataset.activateTournament));
  });
}

function ownerActivationPanel(tournament) {
  const readiness = getTournamentReadiness(tournament);
  return `
    <div class="activation-panel ${readiness.ready ? "ready" : ""}">
      <div>
        <strong>${readiness.ready ? "جاهزة للتفعيل" : "تحتاج استكمال البيانات"}</strong>
        <span>${readiness.ready ? "بعد التفعيل ستظهر البطولة للجميع حسب الخصوصية." : readiness.missing.join("، ")}</span>
      </div>
      <button class="btn accent compact-btn" type="button" data-activate-tournament="${tournament.id}">تفعيل البطولة</button>
    </div>
  `;
}

function getTournamentReadiness(tournament) {
  const missing = [];
  if (!tournament.name) missing.push("اسم البطولة");
  if (isManualTournament(tournament)) {
    if (!getManualTeams(tournament).length) missing.push("الفرق");
    if (!countMatchesByRound(tournament.matchesByRound)) missing.push("المباريات");
  } else if (!tournament.officialCompetitionId) {
    missing.push("البطولة الرسمية");
  }
  if (!tournament.startDate) missing.push("تاريخ البداية");
  if (!tournament.startingRound) missing.push("نقطة الانطلاق");
  if (!tournament.maxPlayers) missing.push("عدد المشاركين");
  if (!areAllPointRulesSaved(tournament)) missing.push("قوانين البطولة");
  if (tournament.hasPrizes && !hasConfiguredPrizes(tournament)) missing.push("الجوائز");
  return { ready: missing.length === 0, missing };
}

function activateTournament(tournamentId) {
  const tournament = getTournamentById(tournamentId);
  if (!tournament || tournament.cancelled) return;
  const readiness = getTournamentReadiness(tournament);
  if (!readiness.ready) {
    activationMissingModal(readiness.missing);
    return;
  }
  tournament.active = true;
  tournament.draft = false;
  tournament.setupIncomplete = false;
  tournament.activationReady = true;
  queueTournamentPersist(tournament);
  renderTournamentManage(tournament.id, "");
}

function activationMissingModal(missing = []) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">لا يمكن تفعيل البطولة</h2>
        ${modalCloseButton()}
      </div>
      <p class="muted">استكمل البيانات الإجبارية التالية قبل التفعيل:</p>
      <div class="missing-list">
        ${missing.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </section>
  `);
  document.querySelector("#close-modal")?.addEventListener("click", closeModal);
}

function ownerManageRow(tournament, section, label, icon, meta, incomplete = false) {
  return `
    <button class="owner-action-row manage-action-row" type="button" data-route="/tournament/${tournament.id}/manage/${section}">
      <span class="owner-action-icon">${ownerTournamentIcon(icon)}</span>
      <span class="owner-action-copy">
        <strong>${label}</strong>
        <small>${ownerActionDescription(section)}</small>
      </span>
      <span class="manage-row-meta">${incomplete ? `<b class="incomplete-chip">غير مكتمل</b>` : meta}</span>
      ${incomplete ? `<i class="incomplete-dot row-end-dot" aria-hidden="true"></i>` : `<span class="row-end-dot-placeholder"></span>`}
      <span class="owner-action-arrow">›</span>
    </button>
  `;
}

function isSectionIncomplete(tournament, section) {
  if (tournament.active && !tournament.setupIncomplete) return false;
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const hasMatches = Boolean(getTournamentMatches(tournament, activeRound).length);
  const participants = getTournamentParticipants(tournament);
  const checks = {
    voting: !hasMatches,
    results: !hasMatches,
    "prediction-results": !participants.length,
    leaderboard: !participants.length,
    rules: !(areAllPointRulesSaved(tournament) && tournament.startingRound),
    prizes: Boolean(tournament.hasPrizes) && !hasConfiguredPrizes(tournament),
    "manual-teams": isManualTournament(tournament) && !getManualTeams(tournament).length,
    "manual-matches": isManualTournament(tournament) && !countMatchesByRound(tournament.matchesByRound),
    notify: false,
    "admin-team": false
  };
  return Boolean(checks[section]);
}

function renderTournamentManageSection(tournament, section) {
  const titles = {
    requests: "طلبات الانضمام",
    players: "المشاركون",
    voting: "حالة التصويت",
    results: "نتائج المباريات",
    "prediction-results": "نتائج التوقعات",
    leaderboard: "ترتيب المشاركين",
    rules: "قوانين البطولة",
    invites: "الدعوات والكود",
    settings: "إعدادات البطولة",
    prizes: "جوائز البطولة",
    notify: "الإشعارات",
    awards: "الجوائز والترشيحات",
    points: "قواعد النقاط",
    danger: "منطقة الخطر",
    "admin-team": "إدارة البطولة",
    "manual-teams": "إضافة الفرق",
    "manual-matches": "إدارة المباريات"
  };
  const title = titles[section] || "إدارة البطولة";
  const topbarAction = section === "prizes" && tournament.hasPrizes
    ? `<button class="btn ghost back-btn topbar-add-btn" type="button" id="show-extra-prize-form" data-show-extra-prize-form="true" aria-label="إضافة جائزة أخرى" title="إضافة جائزة أخرى">+</button>`
    : "";
  app.innerHTML = `
    ${templateTopbar(title, topbarAction)}
    <section class="owner-manage-page">
      ${ownerManageSectionContent(tournament, section)}
    </section>
  `;
  if (section === "rules") scheduleActiveTabIntoView(".rules-round-tabs", "[data-rules-round-tab].active");
  scheduleScrollableTabsIntoView();

  document.querySelectorAll("[data-request-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.requestAction;
      updateJoinRequestFromManage(tournament, Number(button.dataset.requestIndex), action);
    });
  });
  document.querySelectorAll("[data-remove-player]").forEach((button) => {
    button.addEventListener("click", () => confirmRemoveTournamentPlayer(tournament, button.dataset.removePlayer));
  });
  const openPlayerInviteButton = document.querySelector("#open-player-invite");
  if (openPlayerInviteButton) {
    openPlayerInviteButton.addEventListener("click", () => playerInviteModal(tournament));
  }
  document.querySelectorAll("[data-send-player-invite]").forEach((button) => {
    button.addEventListener("click", () => sendPlayerTournamentInvite(tournament, button.dataset.sendPlayerInvite));
  });
  const addPrizeButton = document.querySelector("#add-tournament-prize");
  if (addPrizeButton) {
    addPrizeButton.addEventListener("click", () => addTournamentPrize(tournament));
  }
  const saveMainPrizeButton = document.querySelector("#save-main-prize");
  if (saveMainPrizeButton) {
    saveMainPrizeButton.addEventListener("click", () => saveMainPredictionPrize(tournament));
  }
  document.querySelectorAll("[data-prize-kind]").forEach((select) => {
    select.addEventListener("change", () => updatePrizeKindFields(select.dataset.prizeKind, select.value));
    updatePrizeKindFields(select.dataset.prizeKind, select.value);
  });
  document.querySelectorAll("[data-show-extra-prize-form], #show-extra-prize-form").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      prizeEditorModal(tournament);
    });
  });
  const managePrizesSwitch = document.querySelector("#manage-prizes-switch");
  if (managePrizesSwitch) {
    managePrizesSwitch.addEventListener("click", () => toggleTournamentPrizes(tournament));
  }
  const saveSettingsButton = document.querySelector("#save-tournament-settings");
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener("click", () => saveTournamentSettings(tournament));
  }
  const choosePostImageButton = document.querySelector("#choose-post-image");
  const postImageInput = document.querySelector("#settings-post-image");
  if (choosePostImageButton && postImageInput) {
    choosePostImageButton.addEventListener("click", () => postImageInput.click());
    postImageInput.addEventListener("change", () => handleTournamentPostImageSelection(tournament, postImageInput));
  }
  const removePostImageButton = document.querySelector("#remove-post-image");
  if (removePostImageButton) {
    removePostImageButton.addEventListener("click", () => {
      tournament.coverImageUrl = "";
      tournament.postImageFileName = "";
      queueTournamentPersist(tournament);
      renderTournamentManageSection(tournament, "settings");
    });
  }
  const notifyForm = document.querySelector("#owner-notification-form");
  if (notifyForm) {
    notifyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendOwnerNotification(tournament);
    });
  }
  const cancelButton = document.querySelector("#cancel-tournament-button");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => cancelTournamentWithReason(tournament));
  }
  const confirmCancelButton = document.querySelector("#confirm-cancel-tournament");
  if (confirmCancelButton) {
    confirmCancelButton.addEventListener("click", () => confirmTournamentCancellation(tournament));
  }
  const joinWindowButton = document.querySelector("#toggle-join-window");
  if (joinWindowButton) {
    joinWindowButton.addEventListener("click", () => toggleJoinWindow(tournament));
  }
  const saveAdminTeamButton = document.querySelector("#save-admin-team");
  if (saveAdminTeamButton) {
    saveAdminTeamButton.addEventListener("click", () => saveAdminTeam(tournament));
  }
  const predictionPlayerSearch = document.querySelector("#prediction-player-search");
  if (predictionPlayerSearch) {
    predictionPlayerSearch.addEventListener("input", () => {
      state.predictionPlayerQuery = predictionPlayerSearch.value;
      const dropdown = document.querySelector("#prediction-player-dropdown");
      if (dropdown) {
        dropdown.innerHTML = predictionPlayerDropdownHtml(
          filterPredictionParticipants(getTournamentParticipants(tournament), state.predictionPlayerQuery),
          state.selectedPredictionViewer
        );
        bindPredictionPlayerButtons(tournament);
      }
    });
  }
  bindPredictionPlayerButtons(tournament);
  const saveAwardsButton = document.querySelector("#save-award-categories");
  if (saveAwardsButton) {
    saveAwardsButton.addEventListener("click", () => {
      tournament.awardCategories = [...document.querySelectorAll("[data-award-category]:checked")].map((input) => input.value);
      tournament.hasPrizes = tournament.hasPrizes || tournament.awardCategories.length > 0;
      queueTournamentPersist(tournament);
      renderTournamentManageSection(tournament, "awards");
    });
  }
  document.querySelectorAll("[data-remove-prize]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      tournament.prizes = getTournamentPrizes(tournament).filter((prize) => prize.id !== button.dataset.removePrize);
      queueTournamentPersist(tournament);
      renderTournamentManageSection(tournament, "prizes");
    });
  });
  document.querySelectorAll("[data-edit-prize]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      prizeEditorModal(tournament, button.dataset.editPrize);
    });
  });
  document.querySelectorAll("[data-edit-main-prize]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      mainPrizeEditorModal(tournament);
    });
  });
  document.querySelectorAll("[data-view-prize]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (closestElement(event.target, "button")) return;
      const swipeRow = closestElement(event.target, "[data-prize-swipe-row]");
      if (swipeRow?.dataset.prizeJustSwiped === "true") return;
      const prize = getTournamentPrizes(tournament).find((item) => item.id === card.dataset.viewPrize);
      if (prize && getPrizeDetail(prize)) prizeDetailsModal(prize);
    });
  });
  bindPrizeSwipeRows();
  document.querySelectorAll("[data-point-rule-round-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPointRuleRound = button.dataset.pointRuleRoundTab;
      if (state.editingPointRuleRound && state.editingPointRuleRound !== button.dataset.pointRuleRoundTab) {
        state.editingPointRuleRound = "";
      }
      renderTournamentManageSection(tournament, currentManageSection() || "points");
    });
  });
  document.querySelectorAll("[data-edit-point-rule-round]").forEach((button) => {
    button.addEventListener("click", () => {
      state.editingPointRuleRound = button.dataset.editPointRuleRound;
      state.selectedPointRuleRound = button.dataset.editPointRuleRound;
      renderTournamentManageSection(tournament, currentManageSection() || "points");
    });
  });
  document.querySelectorAll("[data-rules-round-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRulesRound = button.dataset.rulesRoundTab;
      if (state.editingRulesRound && state.editingRulesRound !== button.dataset.rulesRoundTab) {
        state.editingRulesRound = "";
      }
      renderTournamentManageSection(tournament, "rules");
    });
  });
  bindRulesSwipe(tournament);
  const savePointRulesButton = document.querySelector("#save-point-rules");
  if (savePointRulesButton) {
    savePointRulesButton.addEventListener("click", () => savePointRules(tournament));
  }
  document.querySelectorAll("[data-point-rule-type]").forEach((input) => {
    input.addEventListener("change", () => {
      if (isPointRuleRoundControlsReadOnly(tournament, input.dataset.pointRuleRound)) return;
      markPointRuleRoundDirty(tournament, input.dataset.pointRuleRound);
      updateTournamentPointRule(tournament, input.dataset.pointRuleRound, { type: input.value });
      renderTournamentManageSection(tournament, currentManageSection() || "points");
    });
  });
  document.querySelectorAll("[data-point-rule-field]").forEach((input) => {
    const eventName = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(eventName, () => {
      if (isPointRuleRoundControlsReadOnly(tournament, input.dataset.pointRuleRound)) return;
      const field = input.dataset.pointRuleField;
      markPointRuleRoundDirty(tournament, input.dataset.pointRuleRound);
      const stringFields = ["pointSource", "nominationType", "percentMode", "pointsMode", "settlement"];
      const rawValue = stringFields.includes(field) ? input.value : field === "jokerEnabled" ? input.checked : Number(input.value) || 0;
      const value = field === "winnerPercent" ? getFixedPercentWinnerShare({ winnerPercent: rawValue }) : rawValue;
      const patch = { [field]: value };
      if (field === "winnerPercent") patch.loserPercent = getFixedPercentLoserShare({ winnerPercent: value });
      if (field === "winnerPoints" || field === "matchPointsTotal") {
        const nextRule = { ...getTournamentPointRules(tournament)[input.dataset.pointRuleRound], [field]: value };
        patch.matchPointsTotal = getFixedMatchPointTotal(nextRule);
        patch.winnerPoints = getFixedMatchWinnerPoints(nextRule);
        patch.loserPoints = getFixedMatchLoserPoints(nextRule);
      }
      updateTournamentPointRule(tournament, input.dataset.pointRuleRound, patch);
      if (stringFields.includes(field) || field === "jokerEnabled") renderTournamentManageSection(tournament, currentManageSection() || "points");
    });
  });
  document.querySelectorAll("[data-voting-player]").forEach((button) => {
    button.addEventListener("click", () => votingPlayerDetailsModal(tournament, button.dataset.votingRound, button.dataset.votingPlayer, button.dataset.votingStatus));
  });
  document.querySelectorAll("[data-voting-round-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedVotingRound = button.dataset.votingRoundTab;
      renderTournamentManageSection(tournament, "voting");
    });
  });
  bindVotingSwipe(tournament);
  const leaderboardPdfButton = document.querySelector("[data-download-leaderboard-pdf]");
  if (leaderboardPdfButton) {
    leaderboardPdfButton.addEventListener("click", () => exportLeaderboardPdf(tournament));
  }
  const manualTeamForm = document.querySelector("#manual-team-form");
  if (manualTeamForm) {
    manualTeamForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addManualTournamentTeam(tournament);
    });
  }
  document.querySelectorAll("[data-delete-manual-team]").forEach((button) => {
    button.addEventListener("click", () => deleteManualTournamentTeam(tournament, button.dataset.deleteManualTeam));
  });
  const manualMatchRound = document.querySelector("#manual-match-round");
  if (manualMatchRound) {
    manualMatchRound.addEventListener("change", () => {
      state.selectedManualMatchRound = manualMatchRound.value;
      renderTournamentManageSection(tournament, "manual-matches");
    });
  }
  const manualMatchForm = document.querySelector("#manual-match-form");
  if (manualMatchForm) {
    manualMatchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addManualTournamentMatch(tournament);
    });
  }
  document.querySelectorAll("[data-delete-manual-match]").forEach((button) => {
    button.addEventListener("click", () => deleteManualTournamentMatch(tournament, button.dataset.manualMatchRound, button.dataset.deleteManualMatch));
  });
}

function scheduleActiveTabIntoView(containerSelector, activeSelector) {
  const alignActiveTab = () => {
    const container = document.querySelector(containerSelector);
    const active = container?.querySelector(activeSelector);
    if (!container || !active) return;
    active.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    updateScrollableSegmentIndicator(container, active);
  };
  window.requestAnimationFrame(() => {
    alignActiveTab();
    window.setTimeout(alignActiveTab, 80);
  });
}

function scheduleScrollableTabsIntoView() {
  [
    [".round-segment", ".round-segment-btn.active"],
    [".voting-role-tabs", ".voting-role-tab.active"],
    [".live-championship-segment", ".live-championship-tab.active"],
    [".public-filter-segment", ".public-filter-btn.active"]
  ].forEach(([containerSelector, activeSelector]) => scheduleActiveTabIntoView(containerSelector, activeSelector));
}

function isScrollableTabGestureTarget(target) {
  return Boolean(closestElement(target, ".championship-segment, .voting-role-tabs, .round-segment"));
}

function updateScrollableSegmentIndicator(container, active) {
  const indicator = container.querySelector(".championship-segment-indicator");
  if (!indicator || !active) return;
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.transform = `translateX(${active.offsetLeft}px)`;
}

function currentManageSection() {
  const match = state.route.match(/^\/tournament\/[^/]+\/manage\/([^/?#]+)/);
  return match ? match[1] : "";
}

function ownerManageSectionContent(tournament, section) {
  const content = {
    requests: ownerRequestsPage(tournament),
    players: ownerPlayersPage(tournament),
    voting: ownerVotingStatusPage(tournament),
    results: ownerMatchResultsPage(tournament),
    "prediction-results": ownerPredictionResultsPage(tournament),
    leaderboard: ownerLeaderboardPage(tournament),
    rules: ownerRulesPage(tournament),
    invites: ownerInvitesPage(tournament),
    settings: ownerSettingsPage(tournament),
    prizes: ownerPrizesPage(tournament),
    notify: ownerNotificationsPage(tournament),
    awards: ownerAwardsPage(tournament),
    points: ownerPointsPage(tournament),
    danger: ownerDangerPage(tournament),
    "admin-team": ownerAdminTeamPage(tournament),
    "manual-teams": ownerManualTeamsPage(tournament),
    "manual-matches": ownerManualMatchesPage(tournament)
  };
  return content[section] || ownerSettingsPage(tournament);
}

function getManualTeams(tournament) {
  return Array.isArray(tournament?.manualTeams) ? tournament.manualTeams : [];
}

function ownerManualTeamsPage(tournament) {
  const teams = getManualTeams(tournament);
  return `
    <section class="card panel stack manage-detail-card">
      <div>
        <h2 class="section-title">إضافة الفرق</h2>
        <p class="muted">أضف الفرق وشعاراتها مرة واحدة. بعد ذلك ستظهر هذه الفرق كقائمة اختيار عند إنشاء المباريات.</p>
      </div>
      <form class="manual-team-form" id="manual-team-form">
        <label class="field">
          <span>اسم الفريق</span>
          <input class="input" id="manual-team-name" maxlength="42" placeholder="مثال: الإمارات" required>
        </label>
        <label class="field">
          <span>رابط الشعار</span>
          <input class="input" id="manual-team-logo" placeholder="اختياري: https://...">
        </label>
        <label class="field">
          <span>أو رفع شعار من الجهاز</span>
          <input class="input" id="manual-team-logo-file" type="file" accept="image/*">
        </label>
        <button class="btn accent" type="submit">إضافة الفريق</button>
        <div class="error-text" id="manual-team-error"></div>
      </form>
      <div class="manual-team-list">
        ${teams.length ? teams.map((team) => `
          <div class="manual-team-row">
            ${teamIdentityHtml(team.name, "", team.logoUrl || "")}
            <button class="btn ghost compact-btn" type="button" data-delete-manual-team="${team.id}">حذف</button>
          </div>
        `).join("") : `<p class="muted">لا توجد فرق مضافة بعد.</p>`}
      </div>
    </section>
  `;
}

function ownerManualMatchesPage(tournament) {
  const teams = getManualTeams(tournament);
  const tournamentRounds = getTournamentRounds(tournament);
  const selectedRound = state.selectedManualMatchRound && tournamentRounds.some((round) => round.id === state.selectedManualMatchRound)
    ? state.selectedManualMatchRound
    : (tournament.startingRound || tournamentRounds[0]?.id || "group");
  state.selectedManualMatchRound = selectedRound;
  const selectedRoundLabel = rounds.find((round) => round.id === selectedRound)?.label || "الدور";
  const matches = getTournamentMatches(tournament, selectedRound);
  return `
    <section class="card panel stack manage-detail-card">
      <div>
        <h2 class="section-title">إدارة المباريات</h2>
        <p class="muted">اختر الفريقين من قائمة الفرق المضافة، ثم حدد توقيت المباراة. التوقيت يحفظ ويظهر للمشاركين في صفحة التصويت.</p>
      </div>
      <label class="field">
        <span>الدور</span>
        <select class="select" id="manual-match-round">
          ${tournamentRounds.map((round) => `<option value="${round.id}" ${round.id === selectedRound ? "selected" : ""}>${round.label}</option>`).join("")}
        </select>
      </label>
      ${teams.length < 2 ? `<div class="notice danger-notice">أضف فريقين على الأقل قبل إنشاء المباريات.</div>` : `
        <form class="manual-match-form" id="manual-match-form">
          <div class="grid form-grid">
            <label class="field">
              <span>الفريق الأول</span>
              <select class="select" id="manual-match-team-a" required>${manualTeamOptionsHtml(teams)}</select>
            </label>
            <label class="field">
              <span>الفريق الثاني</span>
              <select class="select" id="manual-match-team-b" required>${manualTeamOptionsHtml(teams)}</select>
            </label>
            <label class="field wide">
              <span>تاريخ ووقت المباراة</span>
              <input class="input" id="manual-match-kickoff" type="datetime-local" required>
            </label>
          </div>
          <button class="btn accent" type="submit">إضافة مباراة</button>
        </form>
      `}
      <div class="manual-match-list">
        <h3 class="section-title small-title">${selectedRoundLabel}</h3>
        ${matches.length ? matches.map((match) => `
          <div class="manual-match-row">
            <div>
              <strong>${formatDate(match.kickoff)}</strong>
              <span>${teamIdentityHtml(match.a, "", match.logoA || "")} <small>ضد</small> ${teamIdentityHtml(match.b, "", match.logoB || "")}</span>
            </div>
            <button class="btn ghost compact-btn" type="button" data-manual-match-round="${selectedRound}" data-delete-manual-match="${match.id}">حذف</button>
          </div>
        `).join("") : `<p class="muted">لا توجد مباريات في ${selectedRoundLabel} بعد.</p>`}
      </div>
    </section>
  `;
}

function manualTeamOptionsHtml(teams) {
  return teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("");
}

function setManualTeamError(message = "") {
  const error = document.querySelector("#manual-team-error");
  if (error) error.textContent = message;
}

async function addManualTournamentTeam(tournament) {
  const name = document.querySelector("#manual-team-name")?.value.trim();
  const logoInput = document.querySelector("#manual-team-logo");
  const fileInput = document.querySelector("#manual-team-logo-file");
  if (!name) return;
  const finish = (logoUrl = "") => {
    tournament.manualTeams = [
      ...getManualTeams(tournament),
      { id: `manual-team-${Date.now()}`, name, logoUrl }
    ];
    queueTournamentPersist(tournament);
    renderTournamentManageSection(tournament, "manual-teams");
  };
  const file = fileInput?.files?.[0];
  if (file && file.type.startsWith("image/")) {
    try {
      setManualTeamError("");
      finish(await readImageFileAsCompactDataUrl(file, 256, 0.82));
    } catch {
      setManualTeamError("تعذر تجهيز الشعار. جرّب صورة أخرى أو استخدم رابط الشعار.");
    }
    return;
  }
  finish(logoInput?.value.trim() || "");
}

function deleteManualTournamentTeam(tournament, teamId) {
  const isUsed = Object.values(tournament.matchesByRound || {}).some((matches) => (matches || []).some((match) => match.teamAId === teamId || match.teamBId === teamId));
  if (isUsed) {
    openModal(`
      <section class="card modal stack">
        <div class="topbar">
          <h2 class="section-title">لا يمكن حذف الفريق</h2>
          ${modalCloseButton()}
        </div>
        <p class="muted">هذا الفريق مستخدم في مباراة. احذف المباراة أولاً ثم احذف الفريق.</p>
      </section>
    `);
    document.querySelector("#close-modal")?.addEventListener("click", closeModal);
    return;
  }
  tournament.manualTeams = getManualTeams(tournament).filter((team) => team.id !== teamId);
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, "manual-teams");
}

function addManualTournamentMatch(tournament) {
  const round = document.querySelector("#manual-match-round")?.value || state.selectedManualMatchRound || tournament.startingRound || "group";
  const teamA = getManualTeams(tournament).find((team) => team.id === document.querySelector("#manual-match-team-a")?.value);
  const teamB = getManualTeams(tournament).find((team) => team.id === document.querySelector("#manual-match-team-b")?.value);
  const kickoffValue = document.querySelector("#manual-match-kickoff")?.value;
  if (!teamA || !teamB || !kickoffValue || teamA.id === teamB.id) {
    openModal(`
      <section class="card modal stack">
        <div class="topbar">
          <h2 class="section-title">بيانات غير مكتملة</h2>
          ${modalCloseButton()}
        </div>
        <p class="muted">اختر فريقين مختلفين وحدد وقت المباراة.</p>
      </section>
    `);
    document.querySelector("#close-modal")?.addEventListener("click", closeModal);
    return;
  }
  const roundLabel = rounds.find((item) => item.id === round)?.label || "الدور";
  const nextMatches = [
    ...getTournamentMatches(tournament, round),
    {
      id: `manual-match-${Date.now()}`,
      teamAId: teamA.id,
      teamBId: teamB.id,
      a: teamA.name,
      b: teamB.name,
      logoA: teamA.logoUrl || "",
      logoB: teamB.logoUrl || "",
      kickoff: new Date(kickoffValue).toISOString(),
      statusShort: "NS",
      score: "",
      roundLabel,
      stageLabel: roundLabel,
      manual: true
    }
  ].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  setTournamentMatches(tournament, round, nextMatches);
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, "manual-matches");
}

function deleteManualTournamentMatch(tournament, round, matchId) {
  setTournamentMatches(tournament, round, getTournamentMatches(tournament, round).filter((match) => match.id !== matchId));
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, "manual-matches");
}

function getJoinRequestCount(tournament) {
  return (tournament.joinRequests || []).filter((request) => request.status === "pending" || !request.status).length;
}

function updateJoinRequestFromManage(tournament, requestIndex, action) {
  const requests = tournament.joinRequests || [];
  const request = requests[requestIndex];
  if (!request) return;
  const requesterName = typeof request === "string" ? request : request.name;
  if (action === "accept") {
    if (isTournamentAtCapacity(tournament)) {
      openModal(`
        <section class="card modal stack">
          <div class="topbar">
            <h2 class="section-title">اكتمل العدد</h2>
            ${modalCloseButton()}
          </div>
          <p class="muted">لا يمكن قبول لاعب جديد لأن البطولة وصلت للحد الأقصى للمشاركين.</p>
        </section>
      `);
      document.querySelector("#close-modal")?.addEventListener("click", closeModal);
      return;
    }
    tournament.participants = [...new Set([...(tournament.participants || []), requesterName])];
    tournament.friends = Math.max(tournament.friends || 0, tournament.participants.length);
  }
  tournament.joinRequests = requests.map((item, index) => {
    if (index !== requestIndex) return item;
    return typeof item === "string"
      ? { name: item, handle: "", status: action === "accept" ? "approved" : "declined" }
      : { ...item, status: action === "accept" ? "approved" : "declined" };
  });
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, "requests");
}

function ownerRequestsPage(tournament) {
  const requests = (tournament.joinRequests || []).filter((request) => request.status === "pending" || !request.status);
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">راجع طلبات المشاركة قبل دخول اللاعبين للبطولة.</p>
      <div class="request-list">
        ${requests.length ? requests.map((request) => {
          const originalIndex = (tournament.joinRequests || []).indexOf(request);
          return `
          <div class="request-row">
            <div>
              <strong>${typeof request === "string" ? request : request.name}</strong>
              <span>${typeof request === "string" ? "" : request.handle}</span>
            </div>
            <button class="btn accent compact-btn" type="button" data-request-action="accept" data-request-index="${originalIndex}">قبول</button>
            <button class="btn ghost compact-btn" type="button" data-request-action="reject" data-request-index="${originalIndex}">رفض</button>
          </div>
        `;
        }).join("") : `<p class="muted">لا توجد طلبات انضمام حالياً.</p>`}
      </div>
    </section>
  `;
}

function ownerPlayersPage(tournament) {
  const players = getTournamentParticipants(tournament);
  return `
    <section class="card panel stack manage-detail-card">
      <div class="players-page-head">
        <div>
          <h2 class="section-title">قائمة المشاركين</h2>
          <p class="muted">${players.length} مشارك · حذف اللاعب متاح لصاحب البطولة فقط.</p>
        </div>
        <button class="btn ghost compact-btn" type="button" id="open-player-invite">إرسال دعوة</button>
      </div>
      ${tournament.inviteStatusMessage ? `<p class="invite-status-message compact">${tournament.inviteStatusMessage}</p>` : ""}
      <div class="participant-list">
        ${players.map((player, index) => `
          <div class="participant-row">
            <span class="mini-avatar">${player.trim().slice(0, 1)}</span>
            <strong>${player}</strong>
            ${index === 0 ? `<span class="championship-status-text">القائد</span>` : `<button class="btn ghost compact-btn" type="button" data-remove-player="${player}">حذف</button>`}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function ownerMatchResultsPage(tournament) {
  const round = tournament.currentRound || tournament.startingRound || "round16";
  const matches = getTournamentMatches(tournament, round);
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">نتائج المباريات المعتمدة من الربط الرياضي، وتستخدم لاحقاً في تسوية النقاط.</p>
      ${matches.map((match) => `
        <div class="leader-row">
          <span>${teamIdentityHtml(match.a)} ضد ${teamIdentityHtml(match.b)}</span>
          <strong>${match.score || "لم تبدأ"}</strong>
        </div>
      `).join("") || `<p class="muted">لا توجد مباريات في هذا الدور بعد.</p>`}
    </section>
  `;
}

function ownerPredictionResultsPage(tournament) {
  const participants = getTournamentParticipants(tournament);
  const filteredParticipants = filterPredictionParticipants(participants, state.predictionPlayerQuery);
  const selectedPlayer = participants.includes(state.selectedPredictionViewer)
    ? state.selectedPredictionViewer
    : participants[0];
  state.selectedPredictionViewer = selectedPlayer || "";
  const tournamentRounds = getTournamentRounds(tournament);
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">ابحث داخل قائمة المشاركين فقط، ثم اختر لاعباً لمشاهدة توقعاته لكل دور حتى قبل انتهاء الجولة.</p>
      <label class="settings-control prediction-player-picker">
        <span>اختيار المشارك</span>
        <input class="input" id="prediction-player-search" value="${state.predictionPlayerQuery || selectedPlayer || ""}" placeholder="اكتب أول أحرف من اسم المشارك">
        <div class="prediction-player-dropdown" id="prediction-player-dropdown">
          ${predictionPlayerDropdownHtml(filteredParticipants, selectedPlayer)}
        </div>
      </label>
    </section>
    <section class="card panel stack manage-detail-card">
      <div class="section-row">
        <h2 class="section-title">${selectedPlayer || "لا يوجد مشاركون"}</h2>
        <span class="muted">${tournamentRounds.length} أدوار</span>
      </div>
      ${selectedPlayer ? tournamentRounds.map((round) => ownerPredictionRoundBlock(tournament, round.id, selectedPlayer)).join("") : `<p class="muted">لا توجد بيانات مشاركين.</p>`}
    </section>
  `;
}

function playerInviteModal(tournament) {
  const inviteResults = tournamentInviteSearchResults(tournament, state.playerInviteQuery);
  openModal(`
    <section class="card modal stack player-invite-modal">
      <div class="topbar">
        <div>
          <h2 class="section-title">إرسال دعوة</h2>
          <p class="muted">ابحث عن لاعب مسجل وأرسل له دعوة للبطولة.</p>
        </div>
        ${modalCloseButton()}
      </div>
      <input class="input" id="player-invite-search" value="${state.playerInviteQuery || ""}" placeholder="ابحث بالاسم أو اليوزرنيم">
      ${tournament.inviteStatusMessage ? `<p class="invite-status-message">${tournament.inviteStatusMessage}</p>` : ""}
      <div class="invite-search-results">
        ${inviteResults.length ? inviteResults.map((user) => playerInviteResultRow(tournament, user)).join("") : `<p class="muted">اكتب اسم لاعب لإظهار النتائج.</p>`}
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  const search = document.querySelector("#player-invite-search");
  if (search) {
    search.addEventListener("input", (event) => {
      state.playerInviteQuery = event.target.value;
      tournament.inviteStatusMessage = "";
      playerInviteModal(tournament);
      document.querySelector("#player-invite-search")?.focus();
    });
    search.focus();
  }
  document.querySelectorAll("[data-send-player-invite]").forEach((button) => {
    button.addEventListener("click", () => sendPlayerTournamentInvite(tournament, button.dataset.sendPlayerInvite, { keepModalOpen: true }));
  });
}

function tournamentInviteSearchResults(tournament, query = "") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return state.users
    .filter((user) => {
      const haystack = `${user.name} ${user.username} ${user.handle}`.toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, 5);
}

function isTournamentParticipantName(tournament, user) {
  const participants = getTournamentParticipants(tournament).map((name) => name.toLowerCase());
  const firstName = user.name.split(" ")[0].toLowerCase();
  return participants.some((name) => name === user.name.toLowerCase() || name === firstName || name === user.username.toLowerCase());
}

function playerInviteResultRow(tournament, user) {
  const invited = (tournament.invitedUsers || []).includes(user.username);
  const participant = isTournamentParticipantName(tournament, user);
  const disabled = invited || participant;
  const label = participant ? "مشارك" : invited ? "تم الإرسال" : "إرسال دعوة";
  return `
    <div class="invite-result-row">
      <span class="mini-avatar">${user.name.trim().slice(0, 1)}</span>
      <span>
        <strong>${user.name}</strong>
        <small>${user.handle}</small>
      </span>
      <button class="btn ${disabled ? "ghost" : "accent"} compact-btn" type="button" data-send-player-invite="${user.username}" ${disabled ? "disabled" : ""}>${label}</button>
    </div>
  `;
}

function sendPlayerTournamentInvite(tournament, username, options = {}) {
  const user = state.users.find((item) => item.username === username);
  if (!user || isTournamentParticipantName(tournament, user)) return;
  tournament.invitedUsers = [...new Set([...(tournament.invitedUsers || []), user.username])];
  tournament.sentInvites = [
    ...(tournament.sentInvites || []),
    {
      username: user.username,
      name: user.name,
      sentAt: new Date().toISOString(),
      status: "pending"
    }
  ];
  tournament.inviteStatusMessage = `تم إرسال دعوة إلى ${user.name}`;
  state.playerInviteQuery = "";
  queueTournamentPersist(tournament);
  if (options.keepModalOpen) {
    playerInviteModal(tournament);
    return;
  }
  renderTournamentManageSection(tournament, "players");
}

function filterPredictionParticipants(participants, query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return participants;
  return participants.filter((player) => String(player).toLowerCase().includes(normalizedQuery));
}

function predictionPlayerDropdownHtml(participants, selectedPlayer) {
  return participants.length ? participants.map((player) => `
    <button class="${player === selectedPlayer ? "active" : ""}" type="button" data-prediction-player="${player}">
      <span>${player}</span>
      <strong>${player === selectedPlayer ? "مختار" : "اختيار"}</strong>
    </button>
  `).join("") : `<p class="muted">لا يوجد مشارك بهذا الاسم.</p>`;
}

function bindPredictionPlayerButtons(tournament) {
  document.querySelectorAll("[data-prediction-player]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPredictionViewer = button.dataset.predictionPlayer;
      state.predictionPlayerQuery = button.dataset.predictionPlayer;
      renderTournamentManageSection(tournament, "prediction-results");
    });
  });
}

function ownerPredictionRoundBlock(tournament, roundId, playerName) {
  const round = rounds.find((item) => item.id === roundId);
  const matches = getTournamentMatches(tournament, roundId);
  const status = getVotingStatusForRound(tournament, roundId);
  const completed = status.completed.includes(playerName);
  const isCurrentUser = playerName === state.currentUser.name;
  return `
    <article class="prediction-admin-round">
      <div class="leader-row">
        <span>${round?.label || roundId}</span>
        <strong class="${completed ? "correct" : "muted"}">${completed ? "أنهى التصويت" : "لم يصوت"}</strong>
      </div>
      ${matches.length ? matches.map((match, index) => {
        const key = `${tournament.id}:${roundId}:${match.id}`;
        const actual = isCurrentUser ? state.predictions[key] : null;
        const outcome = actual ? getPredictionOutcome(actual) : "";
        const points = actual ? getPredictionPoints(actual) : 0;
        const fallback = completed && !actual ? (index % 2 ? match.b : match.a) : "";
        const label = outcome
          ? `${outcomeText(outcome, match)}${points ? ` · ${points} نقطة` : ""}`
          : fallback ? `${outcomeText(fallback, match)} · معاينة` : "بانتظار التصويت";
        return `
          <div class="leader-row compact-row">
            <span>${teamIdentityHtml(match.a)} ضد ${teamIdentityHtml(match.b)}</span>
            <strong>${label}</strong>
          </div>
        `;
      }).join("") : `<p class="muted">لا توجد مباريات لهذا الدور.</p>`}
    </article>
  `;
}

function ownerLeaderboardPage(tournament) {
  const rows = leaderboardData(tournament);
  return `
    <section class="card panel stack manage-detail-card">
      <div class="section-row">
        <div>
          <h2 class="section-title">ترتيب المشاركين</h2>
          <p class="muted">جميع المشاركين مرتبين من الأعلى نقاطاً إلى الأقل.</p>
        </div>
        <button class="icon-btn pdf-download-btn" type="button" data-download-leaderboard-pdf aria-label="تنزيل جدول الترتيب PDF" title="تنزيل PDF">
          ${downloadIcon()}
        </button>
      </div>
      <div class="leaderboard-table-wrap">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>الترتيب</th>
              <th>المشارك</th>
              <th>النقاط</th>
              <th>صحيح</th>
              <th>خاطئ</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, index) => `
              <tr class="${index < 3 ? `top-leader-row top-leader-${index + 1}` : ""} ${row.name === state.currentUser.name ? "current-user-row" : ""}">
                <td><span class="leader-rank">#${index + 1}</span></td>
                <td class="leaderboard-player-cell">${row.name}</td>
                <td><strong>${row.points}</strong></td>
                <td><span class="correct">${row.correct}</span></td>
                <td><span class="wrong">${row.wrong}</span></td>
                <td>${row.total}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function downloadIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3v10"></path>
      <path d="m7 9 5 5 5-5"></path>
      <path d="M5 19h14"></path>
    </svg>
  `;
}

function ownerRulesPage(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const selectedRoundId = tournamentRounds.some((round) => round.id === state.selectedRulesRound)
    ? state.selectedRulesRound
    : tournamentRounds[0]?.id;
  state.selectedRulesRound = selectedRoundId || "";
  const selectedIndex = Math.max(0, tournamentRounds.findIndex((round) => round.id === selectedRoundId));
  const selectedRound = tournamentRounds[selectedIndex] || tournamentRounds[0];
  const selectedLocked = selectedRound ? isPointRuleRoundLocked(tournament, selectedRound.id) : false;
  const selectedSaved = selectedRound ? isPointRuleRoundSaved(tournament, selectedRound.id) : false;
  const selectedEditing = selectedRound ? state.editingRulesRound === selectedRound.id : false;
  const showEditor = Boolean(selectedRound && !selectedLocked && (!selectedSaved || selectedEditing));
  return `
    <section class="voting-screen rules-screen" data-rules-swipe>
      <p class="muted">القوانين التي تظهر للمشاركين داخل البطولة حسب كل دور.</p>
      <div class="championship-segment round-segment rules-round-tabs" role="tablist" aria-label="أدوار البطولة" style="--tab-count:${tournamentRounds.length}; --active-index:${selectedIndex};">
        ${tournamentRounds.map((round) => `
          <button class="championship-segment-btn round-segment-btn ${round.id === selectedRound?.id ? "active" : ""}" type="button" role="tab" aria-selected="${round.id === selectedRound?.id}" data-rules-round-tab="${round.id}">
            <strong>${round.label}</strong>
            ${isPointRuleRoundSaved(tournament, round.id) ? "" : `<i class="incomplete-dot tab-incomplete-dot" aria-hidden="true"></i>`}
          </button>
        `).join("")}
        <span class="championship-segment-indicator" aria-hidden="true"></span>
      </div>
      <div class="voting-swipe-pane">
        ${selectedRound ? (showEditor ? pointRuleCard(tournament, selectedRound) : ownerRulesRoundPanel(tournament, selectedRound)) : ""}
      </div>
      ${showEditor ? `
        <button class="btn accent" type="button" id="save-point-rules">حفظ قواعد ${selectedRound?.label || "الدور الحالي"}</button>
        <p class="action-help-text">بعد الحفظ يغلق الكرت ويصبح للعرض فقط. يمكن فتحه من جديد بزر تعديل إذا لم يبدأ الدور.</p>
      ` : ""}
      ${selectedLocked ? `<p class="action-help-text locked-help">لا يمكن تعديل قواعد هذا الدور لأنه بدأ مسبقاً. القواعد محفوظة للقراءة فقط.</p>` : ""}
    </section>
  `;
}

function ownerRulesRoundPanel(tournament, round) {
  const rule = getTournamentPointRules(tournament)[round.id];
  const rulesReady = isPointRuleRoundSaved(tournament, round.id);
  return `
    <article class="voting-round-card rules-round-card">
      <div class="voting-round-head">
        <div>
          <strong>قوانين ${round.label}</strong>
          <span>${rulesReady ? pointRuleTypeLabel(rule) : "غير مكتمل"}</span>
        </div>
        <div class="point-rule-actions">
          <span class="championship-status-text">${isPointRuleRoundLocked(tournament, round.id) ? "مقفل" : "قابل للمراجعة"}</span>
          ${!isPointRuleRoundLocked(tournament, round.id) ? `<button class="btn ghost compact-btn" type="button" data-edit-rules-round="${round.id}" data-tournament-id="${tournament.id}">تعديل</button>` : ""}
        </div>
      </div>
      ${rulesReady ? `
        <div class="leader-row"><span>مصدر النقاط</span><strong>${pointSourceLabel(rule)}</strong></div>
        <div class="leader-row"><span>طريقة الترشيح</span><strong>${pointRuleTypeLabel(rule)}</strong></div>
        <div class="leader-row"><span>آلية الاحتساب</span><strong>${rule.pointSource === "league" ? "صحيح / خطأ" : settlementSummary(rule)}</strong></div>
        <div class="point-rule-example"><strong>شرح الدور</strong><span>${pointRuleDescription(rule)}</span></div>
      ` : `
        <div class="leader-row"><span>مصدر النقاط</span><strong>بيانات فارغة</strong></div>
        <div class="leader-row"><span>طريقة الترشيح</span><strong>بيانات فارغة</strong></div>
        <div class="leader-row"><span>آلية الاحتساب</span><strong>بيانات فارغة</strong></div>
        <div class="notice">هذا الدور غير مكتمل. أضف قواعد النقاط واحفظها قبل تفعيل البطولة.</div>
      `}
    </article>
  `;
}

function pointSourceLabel(rule) {
  if (rule.pointSource === "league") return "دوري النقاط";
  if (rule.pointSource === "grant") return `إضافة ${rule.budget} نقطة لكل لاعب`;
  return "استخدام الرصيد المتراكم";
}

function getTournamentParticipants(tournament) {
  return Array.isArray(tournament?.participants) ? [...new Set(tournament.participants)] : [];
}

function getTournamentParticipantCount(tournament) {
  return getTournamentParticipants(tournament).length;
}

function getTournamentCapacity(tournament) {
  return Number(tournament.maxPlayers) || Infinity;
}

function isTournamentAtCapacity(tournament) {
  return getTournamentParticipantCount(tournament) >= getTournamentCapacity(tournament);
}

function capacityReachedModal(tournament) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">اكتمل عدد المشاركين</h2>
        ${modalCloseButton()}
      </div>
      <p class="muted">وصلت بطولة ${tournament.name} إلى الحد الأقصى للمشاركين (${getTournamentCapacity(tournament)}).</p>
    </section>
  `);
  document.querySelector("#close-modal")?.addEventListener("click", closeModal);
}

function getVotingSummary(tournament) {
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const status = getVotingStatusForRound(tournament, activeRound);
  return `${status.completed.length}/${status.total}`;
}

function getVotingStatusForRound(tournament, roundId) {
  const players = getTournamentParticipants(tournament);
  const matches = getTournamentMatches(tournament, roundId);
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const activeRoundIndex = rounds.findIndex((round) => round.id === activeRound);
  const roundIndex = rounds.findIndex((round) => round.id === roundId);
  const isFutureRound = roundIndex > activeRoundIndex;

  if (isFutureRound) {
    return { total: players.length, completed: [], pending: players, locked: true, matchesCount: matches.length };
  }

  const completed = players.filter((player, index) => {
    if (player === state.currentUser.name) return true;
    return (index + roundIndex) % 3 !== 1;
  });
  const pending = players.filter((player) => !completed.includes(player));
  return { total: players.length, completed, pending, locked: false, matchesCount: matches.length };
}

function ownerVotingStatusPage(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const activeRound = tournament.currentRound || tournament.startingRound || tournamentRounds[0]?.id;
  const selectedRoundId = tournamentRounds.some((round) => round.id === state.selectedVotingRound)
    ? state.selectedVotingRound
    : activeRound;
  state.selectedVotingRound = selectedRoundId;
  const selectedIndex = Math.max(0, tournamentRounds.findIndex((round) => round.id === selectedRoundId));
  const selectedRound = tournamentRounds[selectedIndex] || tournamentRounds[0];
  const status = getVotingStatusForRound(tournament, selectedRound.id);
  return `
    <section class="voting-screen" data-voting-swipe>
      <div class="voting-role-tabs" style="--tab-count:${tournamentRounds.length}; --active-index:${selectedIndex};">
        ${tournamentRounds.map((round) => `
          <button class="voting-role-tab ${round.id === selectedRound.id ? "active" : ""}" type="button" data-voting-round-tab="${round.id}">
            ${round.label}
          </button>
        `).join("")}
        <span class="voting-role-indicator" aria-hidden="true"></span>
      </div>
      <div class="voting-swipe-pane">
        ${ownerVotingRoundPanel(tournament, selectedRound, status)}
      </div>
    </section>
  `;
}

function ownerVotingRoundPanel(tournament, round, status) {
  const completedPct = status.total ? Math.round((status.completed.length / status.total) * 100) : 0;
  return `
    <article class="voting-round-card voting-round-panel">
      <div class="voting-round-head">
        <div>
          <strong>${round.label}</strong>
          <span>${status.matchesCount} مباريات · ${status.completed.length}/${status.total} مكتمل</span>
        </div>
        <span class="championship-status-text">${status.locked ? "مغلقة حالياً" : "متابعة مباشرة"}</span>
      </div>
      <div class="voting-summary-card" aria-label="ملخص حالة التصويت">
        <div>
          <span>إجمالي المشاركين</span>
          <strong>${status.total}</strong>
        </div>
        <div>
          <span>قاموا بالتصويت</span>
          <strong>${status.completed.length}</strong>
        </div>
        <div>
          <span>لم يصوتوا</span>
          <strong>${status.pending.length}</strong>
        </div>
      </div>
      <div class="voting-progress" style="--pct: ${completedPct}%"><span></span></div>
      <div class="voting-status-grid">
        <div>
          <h3>أنهوا التصويت</h3>
          ${status.completed.length ? status.completed.map((player) => votingPlayerRow(player, "done", round.id)).join("") : `<p class="muted">لا يوجد حتى الآن.</p>`}
        </div>
        <div>
          <h3>لم يصوتوا</h3>
          ${status.pending.length ? status.pending.map((player) => votingPlayerRow(player, "pending", round.id)).join("") : `<p class="muted">الجميع أنهى التصويت.</p>`}
        </div>
      </div>
    </article>
  `;
}

function votingPlayerRow(player, status, roundId) {
  return `
    <button class="voting-player-row ${status}" type="button" data-voting-player="${player}" data-voting-round="${roundId}" data-voting-status="${status}">
      <span class="mini-avatar">${player.trim().slice(0, 1)}</span>
      <strong>${player}</strong>
      <span>${status === "done" ? "مكتمل" : "بانتظار التصويت"}</span>
    </button>
  `;
}

function bindVotingSwipe(tournament) {
  const pane = document.querySelector("[data-voting-swipe]");
  if (!pane) return;
  let startX = 0;
  let startY = 0;
  let isHorizontal = false;
  let ignoreSwipe = false;
  pane.addEventListener("pointerdown", (event) => {
    ignoreSwipe = isInteractiveTarget(event.target) || isScrollableTabGestureTarget(event.target);
    startX = event.clientX;
    startY = event.clientY;
    isHorizontal = false;
  });
  pane.addEventListener("pointermove", (event) => {
    if (ignoreSwipe) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 16 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      isHorizontal = true;
    }
  });
  pane.addEventListener("pointerup", (event) => {
    if (ignoreSwipe) {
      ignoreSwipe = false;
      return;
    }
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!isHorizontal || Math.abs(deltaX) < 48 || Math.abs(deltaY) > Math.abs(deltaX)) return;
    const tournamentRounds = getTournamentRounds(tournament);
    const currentIndex = Math.max(0, tournamentRounds.findIndex((round) => round.id === state.selectedVotingRound));
    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    if (!tournamentRounds[nextIndex]) return;
    state.selectedVotingRound = tournamentRounds[nextIndex].id;
    renderTournamentManageSection(tournament, "voting");
  });
}

function bindRulesSwipe(tournament) {
  const pane = document.querySelector("[data-rules-swipe]");
  if (!pane) return;
  let startX = 0;
  let startY = 0;
  let isHorizontal = false;
  let ignoreSwipe = false;
  pane.addEventListener("pointerdown", (event) => {
    ignoreSwipe = isInteractiveTarget(event.target) || isScrollableTabGestureTarget(event.target);
    startX = event.clientX;
    startY = event.clientY;
    isHorizontal = false;
  });
  pane.addEventListener("pointermove", (event) => {
    if (ignoreSwipe) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 16 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      isHorizontal = true;
    }
  });
  pane.addEventListener("pointerup", (event) => {
    if (ignoreSwipe) {
      ignoreSwipe = false;
      return;
    }
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!isHorizontal || Math.abs(deltaX) < 48 || Math.abs(deltaY) > Math.abs(deltaX)) return;
    const tournamentRounds = getTournamentRounds(tournament);
    const currentIndex = Math.max(0, tournamentRounds.findIndex((round) => round.id === state.selectedRulesRound));
    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    if (!tournamentRounds[nextIndex]) return;
    state.selectedRulesRound = tournamentRounds[nextIndex].id;
    if (state.editingRulesRound && state.editingRulesRound !== state.selectedRulesRound) {
      state.editingRulesRound = "";
    }
    renderTournamentManageSection(tournament, "rules");
  });
}

function votingPlayerDetailsModal(tournament, roundId, playerName, status) {
  const round = rounds.find((item) => item.id === roundId);
  const matches = getTournamentMatches(tournament, roundId);
  const completed = status === "done";
  const rows = matches.length ? matches.map((match, index) => {
    const pickedTeam = completed ? (index % 2 ? match.b : match.a) : "لم يصوت";
    const points = completed ? Math.max(tournament.minPoints, Math.round((tournament.budget || 0) / Math.max(matches.length, 1))) : 0;
    return `
      <div class="vote-detail-row">
        <span>${teamIdentityHtml(match.a)} ضد ${teamIdentityHtml(match.b)}</span>
        <strong>${pickedTeam}</strong>
        <b>${points} نقطة</b>
      </div>
    `;
  }).join("") : `<p class="muted">لا توجد مباريات في هذا الدور حتى الآن.</p>`;

  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">تفاصيل تصويت اللاعب</h2>
        ${modalCloseButton()}
      </div>
      <div class="danger-confirm-body">
        <div class="mini-avatar">${playerName.trim().slice(0, 1)}</div>
        <div>
          <strong>${playerName}</strong>
          <p class="muted">${round?.label || "الجولة"} · ${completed ? "أنهى التصويت" : "لم يصوت بعد"}</p>
        </div>
      </div>
      <div class="vote-detail-list">${rows}</div>
      ${completed ? "" : `<div class="notice danger-notice">إذا انتهى وقت القفل بدون تصويت، يخسر اللاعب نقاط الجولة حسب قواعد البطولة.</div>`}
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function confirmRemoveTournamentPlayer(tournament, playerName) {
  openModal(`
    <section class="card modal stack destructive-confirm-modal">
      <div class="topbar">
        <h2 class="section-title">تأكيد حذف اللاعب</h2>
        ${modalCloseButton()}
      </div>
      <div class="danger-confirm-body">
        <div class="mini-avatar">${playerName.trim().slice(0, 1)}</div>
        <div>
          <strong>${playerName}</strong>
          <p class="muted">سيتم حذف هذا اللاعب من بطولة ${tournament.name}.</p>
        </div>
      </div>
      <div class="notice danger-notice">
        عند التأكيد سيتم إلغاء مشاركته، حذف رصيده داخل البطولة، إزالة توقعاته، وإلغاء أي نقاط قام بتوزيعها ضمن الجولات الحالية والسابقة.
      </div>
      <div class="confirm-actions">
        <button class="btn ghost" type="button" id="cancel-remove-player">إلغاء</button>
        <button class="btn danger-btn" type="button" id="confirm-remove-player">حذف اللاعب</button>
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#cancel-remove-player").addEventListener("click", closeModal);
  document.querySelector("#confirm-remove-player").addEventListener("click", () => {
    removeTournamentPlayer(tournament, playerName);
    closeModal();
    renderTournamentManageSection(tournament, "players");
  });
}

function removeTournamentPlayer(tournament, playerName) {
  const currentPlayers = getTournamentParticipants(tournament);
  tournament.participants = currentPlayers.filter((player) => player !== playerName);
  tournament.friends = Math.max(0, tournament.participants.length);
  Object.keys(state.quickPicks).forEach((key) => {
    if (key.startsWith(`${tournament.id}:`) && key.includes(playerName)) delete state.quickPicks[key];
  });
  queueTournamentPersist(tournament);
}

function ownerInvitesPage(tournament) {
  const code = tournament.inviteCode || tournament.publicCode || "PUBLIC";
  return `
    <section class="card panel stack manage-detail-card">
      <div class="manage-code-box">
        <span>كود البطولة</span>
        <strong>${code}</strong>
      </div>
      <button class="btn accent" type="button">مشاركة الدعوة</button>
      <button class="btn ghost" type="button">توليد كود جديد</button>
    </section>
  `;
}

function ownerSettingsPage(tournament) {
  const today = new Date().toISOString().slice(0, 10);
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">هذه الإعدادات في أيقونة أعلى صفحة الأدمن. لا تظهر البطولة للجميع قبل تاريخ البداية المحدد وبعد التفعيل.</p>
      <div class="post-image-setting">
        <div class="post-image-preview ${tournament.coverImageUrl ? "has-image" : ""}">
          ${tournament.coverImageUrl ? `<img src="${tournament.coverImageUrl}" alt="">` : `<span>تصميم الملعب الافتراضي</span>`}
        </div>
        <div>
          <strong>صورة بوست البطولة</strong>
          <p class="muted">تظهر في أعلى صفحة البطولة. إذا لم تضف صورة، يبقى تصميم الملعب الحالي كخيار تلقائي.</p>
          <input class="sr-only-file" id="settings-post-image" type="file" accept="image/*">
          <button class="btn ghost compact-btn" type="button" id="choose-post-image">${tournament.coverImageUrl ? "تعديل الصورة" : "اختيار صورة"}</button>
          ${tournament.coverImageUrl ? `<button class="btn ghost compact-btn" type="button" id="remove-post-image">إزالة الصورة</button>` : ""}
        </div>
      </div>
      <label class="settings-control"><span>اسم البطولة</span><input class="input" id="settings-tournament-name" value="${tournament.name}"></label>
      <label class="settings-control"><span>الخصوصية</span><select class="select" id="settings-privacy"><option value="public" ${tournament.public ? "selected" : ""}>عام</option><option value="private" ${!tournament.public ? "selected" : ""}>خاص</option></select></label>
      <label class="settings-control"><span>الحد الأقصى للمشاركين</span><input class="input" id="settings-max-players" type="number" min="2" value="${tournament.maxPlayers || Math.max(tournament.friends || 1, 16)}"></label>
      <label class="settings-control"><span>تاريخ بدء البطولة</span><input class="input" id="settings-start-date" type="date" min="${today}" value="${tournament.startDate || today}"></label>
      <div class="notice">خيار المشاركة يظهر دائماً لصاحب البطولة، لكن البطولة تظهر للجميع بعد تاريخ البداية وعند التفعيل.</div>
      <button class="btn accent" id="save-tournament-settings" type="button">حفظ التغييرات</button>
    </section>
  `;
}

function saveTournamentSettings(tournament) {
  tournament.name = document.querySelector("#settings-tournament-name")?.value.trim() || tournament.name;
  tournament.public = document.querySelector("#settings-privacy")?.value !== "private";
  tournament.maxPlayers = Number(document.querySelector("#settings-max-players")?.value) || tournament.maxPlayers || 16;
  tournament.startDate = document.querySelector("#settings-start-date")?.value || tournament.startDate;
  if (!tournament.public && !tournament.inviteCode) tournament.inviteCode = generateInviteCode();
  tournament.publicCode = tournament.public ? (tournament.publicCode || tournament.officialCompetitionCode || "PUBLIC") : "";
  queueTournamentPersist(tournament);
  const previousRoute = state.routeHistory.pop();
  replaceRoute(previousRoute || `/tournament/${tournament.id}/manage`);
}

function handleTournamentPostImageSelection(tournament, input) {
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    openModal(`
      <section class="card modal stack">
        <div class="topbar">
          <h2 class="section-title">اختيار صورة</h2>
          ${modalCloseButton()}
        </div>
        <p class="muted">يرجى اختيار ملف صورة.</p>
      </section>
    `);
    document.querySelector("#close-modal").addEventListener("click", closeModal);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => postImageCropModal(tournament, String(reader.result || ""), file.name);
  reader.readAsDataURL(file);
}

function postImageCropModal(tournament, imageUrl, fileName) {
  openPostImageCropModal(imageUrl, fileName, (cropped) => {
    tournament.coverImageUrl = cropped;
    tournament.postImageFileName = fileName;
    queueTournamentPersist(tournament);
    closeModal();
    renderTournamentManageSection(tournament, "settings");
  });
}

function openPostImageCropModal(imageUrl, fileName, onSave) {
  openModal(`
    <section class="card modal stack post-crop-modal">
      <div class="topbar">
        <h2 class="section-title">قص صورة البوست</h2>
        ${modalCloseButton()}
      </div>
      <p class="muted">حرّك الصورة واختر حجمها حتى تظهر بشكل مناسب في أعلى صفحة البطولة.</p>
      <div class="post-crop-frame" id="post-crop-frame">
        <img id="post-crop-image" src="${imageUrl}" alt="">
      </div>
      <div class="post-crop-controls">
        <label class="settings-control"><span>تكبير الصورة</span><input class="input" id="post-crop-zoom" type="range" min="1" max="2.4" step="0.05" value="1.2"></label>
        <label class="settings-control"><span>تحريك أفقي</span><input class="input" id="post-crop-x" type="range" min="-50" max="50" step="1" value="0"></label>
        <label class="settings-control"><span>تحريك عمودي</span><input class="input" id="post-crop-y" type="range" min="-50" max="50" step="1" value="0"></label>
      </div>
      <button class="btn accent" type="button" id="save-post-crop" disabled>حفظ الصورة</button>
    </section>
  `);
  const close = document.querySelector("#close-modal");
  const image = document.querySelector("#post-crop-image");
  const zoom = document.querySelector("#post-crop-zoom");
  const x = document.querySelector("#post-crop-x");
  const y = document.querySelector("#post-crop-y");
  const saveButton = document.querySelector("#save-post-crop");
  const applyPreview = () => {
    image.style.transform = `translate(calc(-50% + ${x.value}%), calc(-50% + ${y.value}%)) scale(${zoom.value})`;
  };
  [zoom, x, y].forEach((input) => input.addEventListener("input", applyPreview));
  applyPreview();
  image.addEventListener("load", () => {
    saveButton.disabled = false;
  });
  if (image.complete && image.naturalWidth) saveButton.disabled = false;
  close.addEventListener("click", closeModal);
  saveButton.addEventListener("click", () => {
    const cropped = cropPostImageToDataUrl(image, Number(zoom.value), Number(x.value), Number(y.value));
    onSave(cropped, fileName);
  });
}

function cropPostImageToDataUrl(image, zoom = 1.2, offsetX = 0, offsetY = 0) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight) * zoom;
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = (canvas.width - drawWidth) / 2 + (offsetX / 100) * canvas.width;
  const y = (canvas.height - drawHeight) / 2 + (offsetY / 100) * canvas.height;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  return canvas.toDataURL("image/jpeg", 0.88);
}

function readImageFileAsCompactDataUrl(file, maxSize = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image-failed"));
      image.onload = () => {
        const sourceWidth = image.naturalWidth || image.width || maxSize;
        const sourceHeight = image.naturalHeight || image.height || maxSize;
        const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight));
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", quality));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function getTournamentPrizes(tournament) {
  if (Array.isArray(tournament.prizes)) return tournament.prizes;
  tournament.prizes = [];
  return tournament.prizes;
}

function ownerPrizesPage(tournament) {
  const prizes = getTournamentPrizes(tournament);
  const mainPrize = getMainPredictionPrize(tournament);
  const extraPrizes = prizes.filter((prize) => prize.awardId !== "prediction-champion");
  return `
    <section class="card panel stack manage-detail-card">
      <div class="toggle-row wide prize-toggle-row compact-toggle-row">
        <div class="compact-toggle-copy">
          <strong>تفعيل الجوائز</strong>
        </div>
        <button type="button" class="switch ${tournament.hasPrizes ? "on" : ""}" id="manage-prizes-switch" aria-pressed="${tournament.hasPrizes ? "true" : "false"}"><span></span></button>
      </div>
    </section>

    ${tournament.hasPrizes ? `
    <section class="card panel stack manage-detail-card">
      <div class="prize-section-block">
        <h3 class="subsection-title">الجائزة الرئيسية</h3>
        ${mainPredictionPrizeCard(mainPrize)}
      </div>
      <div class="prize-section-divider" aria-hidden="true"></div>
      <div class="prize-section-block">
        <h3 class="subsection-title">الجوائز الأخرى</h3>
        <div class="prize-list">
          ${extraPrizes.length ? extraPrizes.map(tournamentPrizeCard).join("") : `<p class="muted">لا توجد جوائز إضافية حتى الآن.</p>`}
        </div>
      </div>
    </section>
    ` : `
    <section class="card panel stack manage-detail-card">
      <h2 class="section-title">الجوائز غير مفعلة</h2>
    </section>
    `}
  `;
}

function toggleTournamentPrizes(tournament) {
  tournament.hasPrizes = !tournament.hasPrizes;
  state.showExtraPrizeForm = false;
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, "prizes");
}

function getMainPredictionPrize(tournament) {
  return getTournamentPrizes(tournament).find((prize) => prize.awardId === "prediction-champion");
}

function hasConfiguredPrizes(tournament) {
  const mainPrize = getMainPredictionPrize(tournament);
  return Boolean(mainPrize?.title && getPrizeDetail(mainPrize));
}

function mainPredictionPrizeCard(prize) {
  const complete = Boolean(prize?.title && getPrizeDetail(prize));
  return `
    <article class="prize-card main-prize-card ${complete ? "clickable-prize-card" : ""}" ${complete ? `data-view-prize="${prize.id}"` : ""}>
      <div class="prize-rank">بطل التوقعات</div>
      <div>
        <strong>جائزة بطل التوقعات ${complete ? "" : `<i class="incomplete-dot prize-inline-dot" aria-hidden="true"></i>`}</strong>
        <span>${prize ? prizeValueText(prize) : "بيانات الجائزة مطلوبة قبل تفعيل البطولة"}</span>
      </div>
      <div class="prize-card-actions">
        ${complete ? "" : `<span class="incomplete-chip">غير مكتمل</span>`}
        <button class="btn ghost compact-btn" type="button" data-edit-main-prize="true">تعديل</button>
      </div>
    </article>
  `;
}

function prizeKindFields(prefix, prize = {}) {
  const type = prize.prizeType || "cash";
  const cashHidden = type !== "cash";
  const inKindHidden = type !== "in-kind";
  return `
    <label class="settings-control"><span>نوع الجائزة</span><select class="select" id="${prefix}-prize-type" data-prize-kind="${prefix}">
      <option value="cash" ${type === "cash" ? "selected" : ""}>نقدية</option>
      <option value="in-kind" ${type === "in-kind" ? "selected" : ""}>عينية</option>
    </select></label>
    <label class="settings-control" data-prize-kind-field="${prefix}" data-kind="cash" ${cashHidden ? "hidden" : ""}><span>القيمة</span><input class="input" id="${prefix}-prize-cash" value="${prize.value || ""}" placeholder="مثال: 500 درهم" ${cashHidden ? "disabled" : ""}></label>
    <label class="settings-control" data-prize-kind-field="${prefix}" data-kind="in-kind" ${inKindHidden ? "hidden" : ""}><span>وصف الجائزة</span><input class="input" id="${prefix}-prize-description" value="${prize.description || ""}" placeholder="مثال: قميص رسمي / كأس / جهاز" ${inKindHidden ? "disabled" : ""}></label>
  `;
}

function mainPrizeEditorModal(tournament) {
  const prize = getMainPredictionPrize(tournament) || {};
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">تعديل الجائزة الرئيسية</h2>
        ${modalCloseButton()}
      </div>
      <div class="prize-form-grid">
        ${prizeKindFields("main", prize)}
      </div>
      <button class="btn accent" type="button" id="save-main-prize">حفظ الجائزة الرئيسية</button>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelectorAll("[data-prize-kind]").forEach((select) => {
    select.addEventListener("change", () => updatePrizeKindFields(select.dataset.prizeKind, select.value));
    updatePrizeKindFields(select.dataset.prizeKind, select.value);
  });
  document.querySelector("#save-main-prize").addEventListener("click", () => saveMainPredictionPrize(tournament));
}

function updatePrizeKindFields(prefix, type) {
  document.querySelectorAll(`[data-prize-kind-field="${prefix}"]`).forEach((field) => {
    const active = field.dataset.kind === type;
    field.hidden = !active;
    field.style.display = active ? "" : "none";
    field.querySelectorAll("input, textarea, select").forEach((input) => {
      input.disabled = !active;
    });
  });
}

function getPrizeDetail(prize = {}) {
  return prize.prizeType === "in-kind" ? prize.description : prize.value;
}

function prizeValueText(prize = {}) {
  const isInKind = prize.prizeType === "in-kind";
  const label = isInKind ? "عينية" : "نقدية";
  const detail = getPrizeDetail(prize) || prize.value || prize.description || "-";
  return `${label}: ${detail}`;
}

function saveMainPredictionPrize(tournament) {
  const prizeType = document.querySelector("#main-prize-type")?.value || "cash";
  const value = prizeType === "cash" ? document.querySelector("#main-prize-cash")?.value.trim() || "" : "";
  const description = prizeType === "in-kind" ? document.querySelector("#main-prize-description")?.value.trim() || "" : "";
  if ((prizeType === "cash" && !value) || (prizeType === "in-kind" && !description)) {
    openModal(`
      <section class="card modal stack">
        <div class="topbar">
          <h2 class="section-title">بيانات ناقصة</h2>
          ${modalCloseButton()}
        </div>
        <p class="muted">حدد نوع الجائزة ثم أدخل ${prizeType === "cash" ? "القيمة النقدية" : "وصف الجائزة العينية"} قبل الحفظ.</p>
      </section>
    `);
    document.querySelector("#close-modal").addEventListener("click", closeModal);
    return;
  }
  const prizes = getTournamentPrizes(tournament);
  const existing = getMainPredictionPrize(tournament);
  const payload = {
    id: existing?.id || `p-main-${Date.now()}`,
    rank: "بطل التوقعات",
    awardId: "prediction-champion",
    title: "جائزة بطل التوقعات",
    prizeType,
    value,
    description
  };
  if (existing) {
    Object.assign(existing, payload);
  } else {
    prizes.unshift(payload);
  }
  queueTournamentPersist(tournament);
  closeModal();
  renderTournamentManageSection(tournament, "prizes");
}

function awardPrizeRow(tournament, award) {
  const prize = getPrizeForAward(tournament, award.id);
  return `
    <article class="prize-card award-prize-card">
      <div class="prize-rank">${prize ? "محدد" : "اختياري"}</div>
      <div>
        <strong>${award.label}</strong>
        ${prize ? `<span>${prize.title} · ${prizeValueText(prize)}</span>` : `<span>لا توجد جائزة محددة لهذا النوع حالياً.</span>`}
      </div>
      ${prize ? `<button class="btn ghost compact-btn" type="button" data-remove-prize="${prize.id}">حذف</button>` : `<span class="muted">يمكن إضافتها من النموذج أدناه</span>`}
    </article>
  `;
}

function getPrizeForAward(tournament, awardId) {
  return getTournamentPrizes(tournament).find((prize) => prize.awardId === awardId || prize.rank === awardId);
}

function tournamentPrizeCard(prize) {
  const complete = Boolean(getPrizeDetail(prize));
  return `
    <div class="prize-swipe-row" data-prize-swipe-row>
      <button class="prize-swipe-delete" type="button" data-remove-prize="${prize.id}">حذف</button>
      <article class="prize-card prize-swipe-card ${complete ? "clickable-prize-card" : ""}" ${complete ? `data-view-prize="${prize.id}"` : ""}>
        <div class="prize-rank">${prize.rank}</div>
        <div>
          <strong>${prize.title}</strong>
          <span>${prizeValueText(prize)}</span>
        </div>
        <div class="prize-card-actions">
          <button class="btn ghost compact-btn" type="button" data-edit-prize="${prize.id}">تعديل</button>
        </div>
      </article>
    </div>
  `;
}

function bindPrizeSwipeRows() {
  document.querySelectorAll("[data-prize-swipe-row]").forEach((row) => {
    const card = row.querySelector(".prize-swipe-card");
    if (!card || row.dataset.swipeBound === "true") return;
    row.dataset.swipeBound = "true";
    let startX = 0;
    let dragging = false;
    let moved = 0;
    const closeOtherRows = () => {
      document.querySelectorAll("[data-prize-swipe-row].is-open").forEach((openRow) => {
        if (openRow !== row) openRow.classList.remove("is-open");
      });
    };
    const setDrag = (x) => {
      moved = Math.min(84, Math.max(0, startX - x));
      card.style.transform = `translateX(${-moved}px)`;
    };
    card.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      dragging = true;
      moved = 0;
      closeOtherRows();
      card.setPointerCapture?.(event.pointerId);
      card.classList.add("is-dragging");
    });
    card.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = startX - event.clientX;
      if (delta > 3) {
        event.preventDefault();
        setDrag(event.clientX);
      }
    });
    const finish = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("is-dragging");
      card.style.transform = "";
      row.classList.toggle("is-open", moved > 42);
      if (moved > 8) {
        row.dataset.prizeJustSwiped = "true";
        window.setTimeout(() => delete row.dataset.prizeJustSwiped, 220);
      }
    };
    card.addEventListener("pointerup", finish);
    card.addEventListener("pointercancel", finish);
  });
}

function prizeDetailsModal(prize) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">تفاصيل الجائزة</h2>
        ${modalCloseButton()}
      </div>
      <div class="prize-detail-list">
        <div><span>الجائزة</span><strong>${prize.title}</strong></div>
        <div><span>النوع</span><strong>${prize.prizeType === "in-kind" ? "عينية" : "نقدية"}</strong></div>
        <div><span>${prize.prizeType === "in-kind" ? "الوصف" : "القيمة"}</span><strong>${getPrizeDetail(prize)}</strong></div>
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function prizeEditorModal(tournament, prizeId = "") {
  const prize = getTournamentPrizes(tournament).find((item) => item.id === prizeId) || null;
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">${prize ? "تعديل الجائزة" : "إضافة جائزة أخرى"}</h2>
        ${modalCloseButton()}
      </div>
      <div class="prize-form-grid">
        <label class="settings-control"><span>نوع الجائزة</span><select class="select" id="prize-rank">
          ${extraPrizeOptions.map((option) => `<option value="${option.id}" ${prize?.awardId === option.id ? "selected" : ""}>${option.label}</option>`).join("")}
        </select></label>
        ${prizeKindFields("extra", prize || {})}
      </div>
      <button class="btn accent" type="button" id="add-tournament-prize" data-prize-id="${prize?.id || ""}">${prize ? "حفظ التعديل" : "حفظ الجائزة"}</button>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelectorAll("[data-prize-kind]").forEach((select) => {
    select.addEventListener("change", () => updatePrizeKindFields(select.dataset.prizeKind, select.value));
    updatePrizeKindFields(select.dataset.prizeKind, select.value);
  });
  document.querySelector("#add-tournament-prize").addEventListener("click", () => addTournamentPrize(tournament, prize?.id || ""));
}

function addTournamentPrize(tournament, prizeId = "") {
  const rank = document.querySelector("#prize-rank")?.value || "جائزة خاصة";
  const prizeType = document.querySelector("#extra-prize-type")?.value || "cash";
  const value = prizeType === "cash" ? document.querySelector("#extra-prize-cash")?.value.trim() || "" : "";
  const description = prizeType === "in-kind" ? document.querySelector("#extra-prize-description")?.value.trim() || "" : "";
  const award = extraPrizeOptions.find((item) => item.id === rank) || awardOptions.find((item) => item.id === rank);
  if ((prizeType === "cash" && !value) || (prizeType === "in-kind" && !description)) {
    openModal(`
      <section class="card modal stack">
        <div class="topbar">
          <h2 class="section-title">بيانات ناقصة</h2>
          ${modalCloseButton()}
        </div>
        <p class="muted">حدد نوع الجائزة ثم أدخل ${prizeType === "cash" ? "القيمة النقدية" : "وصف الجائزة العينية"} قبل الإضافة.</p>
      </section>
    `);
    document.querySelector("#close-modal").addEventListener("click", closeModal);
    return;
  }
  const prizes = getTournamentPrizes(tournament);
  const existing = prizes.find((prize) => prize.id === prizeId);
  const payload = {
    id: existing?.id || `p-${Date.now()}`,
    rank: award ? award.label : rank,
    awardId: award?.id || "",
    title: award ? award.label : rank,
    prizeType,
    value,
    description
  };
  if (existing) Object.assign(existing, payload);
  else prizes.push(payload);
  queueTournamentPersist(tournament);
  closeModal();
  renderTournamentManageSection(tournament, "prizes");
}

function ownerAwardsPage(tournament) {
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">الترشيحات المفعلة تظهر للمشاركين داخل صفحة البطولة.</p>
      <div class="award-checkbox-grid">
        ${awardOptions.map((award) => `
          <label class="checkbox-card">
            <input type="checkbox" data-award-category value="${award.id}" ${((tournament.awardCategories || []).includes(award.id)) ? "checked" : ""}>
            <span>${award.label}</span>
          </label>
        `).join("")}
      </div>
      <button class="btn accent" type="button" id="save-award-categories">حفظ الأنواع</button>
    </section>
  `;
}

function ownerNotificationsPage(tournament) {
  return `
    <section class="card panel stack manage-detail-card">
      <h2 class="section-title">إرسال إشعار</h2>
      ${ownerNotificationForm(tournament)}
    </section>
    ${ownerRecentNotificationsPanel(tournament)}
  `;
}

function ownerAdminTeamPage(tournament) {
  const admins = tournament.adminTeam || [
    { name: state.currentUser.name, role: "المالك", permissions: ["كل الصلاحيات"] }
  ];
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">عيّن مساعدين لإدارة البطولة وحدد صلاحياتهم داخل صفحة الأدمن.</p>
      <div class="prize-list">
        ${admins.map((admin) => `
          <article class="prize-card">
            <div class="prize-rank">${admin.role}</div>
            <div>
              <strong>${admin.name}</strong>
              <span>${admin.permissions.join("، ")}</span>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="prize-form-grid">
        <label class="settings-control"><span>اسم المساعد</span><input class="input" id="admin-helper-name" placeholder="مثال: مدير مساعد"></label>
        <label class="settings-control"><span>الدور</span><select class="select" id="admin-helper-role"><option>مشرف نتائج</option><option>مشرف لاعبين</option><option>مشرف جوائز</option><option>مشرف كامل</option></select></label>
        <label class="checkbox-card"><input type="checkbox" data-admin-permission value="اعتماد الطلبات"><span>اعتماد الطلبات</span></label>
        <label class="checkbox-card"><input type="checkbox" data-admin-permission value="حذف اللاعبين"><span>حذف اللاعبين</span></label>
        <label class="checkbox-card"><input type="checkbox" data-admin-permission value="تعديل النتائج"><span>تعديل النتائج</span></label>
        <label class="checkbox-card"><input type="checkbox" data-admin-permission value="إدارة الجوائز"><span>إدارة الجوائز</span></label>
      </div>
      <button class="btn accent" type="button" id="save-admin-team">إضافة المساعد</button>
      <p class="muted" id="admin-team-status"></p>
    </section>
  `;
}

function saveAdminTeam(tournament) {
  const name = document.querySelector("#admin-helper-name")?.value.trim();
  const role = document.querySelector("#admin-helper-role")?.value || "مشرف";
  const permissions = [...document.querySelectorAll("[data-admin-permission]:checked")].map((input) => input.value);
  const status = document.querySelector("#admin-team-status");
  if (!name) {
    if (status) {
      status.textContent = "اكتب اسم المساعد أولاً.";
      status.classList.add("form-error-inline");
    }
    return;
  }
  tournament.adminTeam = [...(tournament.adminTeam || [{ name: state.currentUser.name, role: "المالك", permissions: ["كل الصلاحيات"] }]), {
    name,
    role,
    permissions: permissions.length ? permissions : ["عرض فقط"]
  }];
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, "admin-team");
}

function ownerPointsPage(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const selectedRoundId = tournamentRounds.some((round) => round.id === state.selectedPointRuleRound)
    ? state.selectedPointRuleRound
    : tournamentRounds[0]?.id;
  state.selectedPointRuleRound = selectedRoundId || "";
  const selectedIndex = Math.max(0, tournamentRounds.findIndex((round) => round.id === selectedRoundId));
  const selectedRound = tournamentRounds.find((round) => round.id === selectedRoundId) || tournamentRounds[0];
  const selectedReadOnly = selectedRound ? isPointRuleRoundControlsReadOnly(tournament, selectedRound.id) : true;
  const selectedLocked = selectedRound ? isPointRuleRoundLocked(tournament, selectedRound.id) : false;
  return `
    <section class="voting-role-tabs" role="tablist" aria-label="أدوار قواعد النقاط" style="--tab-count:${tournamentRounds.length}; --active-index:${selectedIndex};">
      ${tournamentRounds.map((round) => pointRuleRoundTab(tournament, round, round.id === selectedRoundId)).join("")}
      <span class="voting-role-indicator" aria-hidden="true"></span>
    </section>
    <section class="point-rules-list">
      ${selectedRound ? pointRuleCard(tournament, selectedRound) : ""}
    </section>
    <section class="card panel stack manage-detail-card">
      ${selectedReadOnly ? `
        <p class="muted">${selectedLocked ? "هذا الدور بدأ أو أصبح نشطاً، لذلك لا يمكن تعديل قواعده." : "القواعد محفوظة. اضغط تعديل داخل بطاقة الدور إذا احتجت تغييرها."}</p>
      ` : `
        <button class="btn accent" type="button" id="save-point-rules">حفظ قواعد ${selectedRound?.label || "الدور الحالي"}</button>
        <p class="muted">هذا الحفظ يخص الدور الحالي فقط. بقية الأدوار تحفظ بشكل منفصل.</p>
      `}
    </section>
  `;
}

function savePointRules(tournament) {
  const rules = getTournamentPointRules(tournament);
  const selectedRoundId = currentManageSection() === "rules"
    ? state.selectedRulesRound || getTournamentRounds(tournament)[0]?.id
    : state.selectedPointRuleRound || getTournamentRounds(tournament)[0]?.id;
  const selectedRule = selectedRoundId ? rules[selectedRoundId] : null;
  if (!selectedRoundId || !selectedRule) return;
  const saved = getPointRulesSaved(tournament);
  saved[selectedRoundId] = true;
  tournament.rulesConfigured = areAllPointRulesSaved(tournament);
  tournament.budget = Number(selectedRule?.budget || tournament.budget || 0);
  tournament.minPoints = Number(selectedRule?.minPoints || tournament.minPoints || 0);
  tournament.points = tournament.points || tournament.budget || 0;
  state.editingPointRuleRound = "";
  state.editingRulesRound = "";
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, currentManageSection() || "points");
}

function getPointRulesSaved(tournament) {
  if (!tournament.pointRulesSaved) tournament.pointRulesSaved = {};
  return tournament.pointRulesSaved;
}

function markPointRuleRoundDirty(tournament, roundId) {
  if (!roundId) return;
  getPointRulesSaved(tournament)[roundId] = false;
  tournament.rulesConfigured = areAllPointRulesSaved(tournament);
}

function isPointRuleRoundSaved(tournament, roundId) {
  if (!roundId) return false;
  if (getPointRulesSaved(tournament)[roundId]) return true;
  return Boolean(tournament.rulesConfigured && tournament.budget && tournament.minPoints);
}

function areAllPointRulesSaved(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  return Boolean(tournament.startingRound && tournamentRounds.length && tournamentRounds.every((round) => isPointRuleRoundSaved(tournament, round.id)));
}

function pointRuleRoundTab(tournament, round, isActive) {
  const locked = isPointRuleRoundLocked(tournament, round.id);
  return `
    <button class="voting-role-tab ${isActive ? "active" : ""} ${locked ? "locked" : ""}" type="button" role="tab" aria-selected="${isActive}" data-point-rule-round-tab="${round.id}" title="${locked ? "مقفل" : round.label}">
      ${round.label}
    </button>
  `;
}

function getTournamentPointRules(tournament) {
  if (!tournament.pointRules) tournament.pointRules = {};
  getTournamentRounds(tournament).forEach((round, index) => {
    if (!tournament.pointRules[round.id]) {
      tournament.pointRules[round.id] = {
        pointSource: index === 0 ? "grant" : "carry",
        nominationType: "percent",
        percentMode: "fixed",
        pointsMode: "minimum",
        settlement: "loser-pool-equal",
        budget: tournament.budget || 400,
        minPoints: tournament.minPoints || 20,
        minPercent: 20,
        winnerPercent: 70,
        loserPercent: 30,
        correctPoints: 10,
        wrongPoints: 0,
        matchPointsTotal: 100,
        winnerPoints: 70,
        loserPoints: 30,
        jokerEnabled: false,
        jokerUses: 1
      };
    }
    const rule = tournament.pointRules[round.id];
    if (rule.pointSource === "pool") rule.pointSource = "league";
    if (rule.preMatchDistribution === "direct-score") rule.pointSource = "league";
    if (!rule.nominationType) {
      rule.nominationType = rule.predictionInput === "points" || rule.preMatchDistribution === "round-budget" || rule.preMatchDistribution === "fixed-match-points" ? "points" : "percent";
    }
    if (!rule.percentMode) {
      rule.percentMode = rule.preMatchDistribution === "player-variable-percent" ? "minimum" : "fixed";
    }
    if (!rule.pointsMode) {
      rule.pointsMode = rule.preMatchDistribution === "fixed-match-points" ? "fixed" : "minimum";
    }
    if (!rule.settlement || rule.settlement === "direct-score") rule.settlement = "loser-pool-equal";
    rule.budget = rule.budget || tournament.budget || 400;
    rule.minPoints = rule.minPoints || tournament.minPoints || 20;
    rule.minPercent = rule.minPercent || 20;
    rule.winnerPercent = getFixedPercentWinnerShare(rule);
    rule.loserPercent = getFixedPercentLoserShare(rule);
    rule.correctPoints = rule.correctPoints ?? 10;
    rule.wrongPoints = rule.wrongPoints ?? 0;
    rule.matchPointsTotal = getFixedMatchPointTotal(rule);
    rule.winnerPoints = getFixedMatchWinnerPoints(rule);
    rule.loserPoints = getFixedMatchLoserPoints(rule);
    rule.jokerEnabled = Boolean(rule.jokerEnabled);
    rule.jokerUses = rule.jokerUses || 1;
  });
  return tournament.pointRules;
}

function updateTournamentPointRule(tournament, roundId, patch) {
  const rules = getTournamentPointRules(tournament);
  rules[roundId] = { ...rules[roundId], ...patch };
}

function pointRuleCard(tournament, round) {
  const rule = getTournamentPointRules(tournament)[round.id];
  const roundIndex = getTournamentRounds(tournament).findIndex((item) => item.id === round.id);
  const locked = isPointRuleRoundLocked(tournament, round.id);
  const saved = isPointRuleRoundSaved(tournament, round.id);
  const editing = state.editingPointRuleRound === round.id || state.editingRulesRound === round.id;
  const readOnly = locked || (saved && !editing);
  if (roundIndex === 0 && rule.pointSource === "carry") rule.pointSource = "grant";
  rule.__readOnly = readOnly;
  const fieldsHtml = pointRuleFields(round.id, rule, roundIndex);
  delete rule.__readOnly;
  return `
    <article class="card panel point-rule-card ${locked ? "locked" : ""} ${readOnly ? "read-only" : ""}">
      <div class="point-rule-head">
        <div>
          <h2 class="section-title">${round.label}</h2>
          <p class="muted">${pointRuleDescription(rule)}</p>
        </div>
        <div class="point-rule-actions">
          <span class="championship-status-text">${locked ? "التعديل مقفل" : saved && !editing ? "محفوظ" : editing ? "وضع التعديل" : "غير مكتمل"}</span>
          ${locked && saved && !editing ? `<button class="btn ghost compact-btn disabled-action" type="button" disabled>تعديل</button>` : ""}
          ${!locked && saved && !editing ? `<button class="btn ghost compact-btn" type="button" data-edit-point-rule-round="${round.id}">تعديل</button>` : ""}
        </div>
      </div>
      ${locked ? `<div class="notice danger-notice">بدأت هذه الجولة أو تم فتحها فعلياً، لذلك لا يمكن تعديل قواعد النقاط الخاصة بها. القواعد التالية للقراءة فقط.</div>` : ""}
      ${saved && !editing && !locked ? `<div class="notice">هذه القواعد محفوظة ومغلقة. اضغط تعديل لفتح الحقول، ثم احفظ بعد الانتهاء.</div>` : ""}
      <div class="point-rule-fields">
        ${fieldsHtml}
      </div>
    </article>
  `;
}

function isPointRuleRoundLocked(tournament, roundId) {
  if (!tournament.active) return false;
  const tournamentRounds = getTournamentRounds(tournament);
  const activeRound = tournament.currentRound || tournament.startingRound || tournamentRounds[0]?.id;
  const roundIndex = tournamentRounds.findIndex((round) => round.id === roundId);
  const activeIndex = tournamentRounds.findIndex((round) => round.id === activeRound);
  if (roundIndex < 0 || activeIndex < 0) return false;
  return roundIndex <= activeIndex;
}

function isPointRuleRoundControlsReadOnly(tournament, roundId) {
  if (isPointRuleRoundLocked(tournament, roundId)) return true;
  return Boolean(isPointRuleRoundSaved(tournament, roundId)
    && state.editingPointRuleRound !== roundId
    && state.editingRulesRound !== roundId);
}

function pointRuleTypeOption(roundId, selectedType, value, label) {
  return `
    <label class="point-rule-option ${selectedType === value ? "active" : ""}">
      <input type="radio" name="point-rule-${roundId}" value="${value}" data-point-rule-type data-point-rule-round="${roundId}" ${selectedType === value ? "checked" : ""}>
      <span>${label}</span>
    </label>
  `;
}

function pointRuleFields(roundId, rule, roundIndex) {
  const sourceFields = pointSourceFields(roundId, rule, roundIndex);
  const nominationFieldsHtml = rule.pointSource === "league" ? leaguePointFields(roundId, rule) : nominationFields(roundId, rule);
  const settlementFields = settlementFieldsHtml(roundId, rule);
  const jokerFields = jokerRuleFields(roundId, rule);
  return disablePointRuleControlsIfLocked(rule, `
    ${sourceFields}
    ${nominationFieldsHtml}
    ${settlementFields}
    ${jokerFields}
  `);
}

function disablePointRuleControlsIfLocked(rule, html) {
  if (!rule.__readOnly) return html;
  return html
    .replace(/<select /g, "<select disabled ")
    .replace(/<input /g, "<input disabled ")
    .replace(/<textarea /g, "<textarea disabled ");
}

function pointSourceFields(roundId, rule, roundIndex = 0) {
  const canCarry = roundIndex > 0;
  return `
    <label class="settings-control"><span>مصدر نقاط الدور</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="pointSource">
      ${canCarry ? `<option value="carry" ${rule.pointSource !== "grant" && rule.pointSource !== "league" ? "selected" : ""}>استخدام الرصيد المتراكم وتقسيمه</option>` : ""}
      <option value="grant" ${rule.pointSource === "grant" || (!canCarry && rule.pointSource !== "league") ? "selected" : ""}>إضافة نقاط جديدة لكل لاعب</option>
      <option value="league" ${rule.pointSource === "league" ? "selected" : ""}>دوري النقاط</option>
    </select></label>
    ${pointSourceConfig(roundId, rule, canCarry)}
  `;
}

function pointSourceConfig(roundId, rule, canCarry) {
  if (rule.pointSource === "league") {
    return `
      <div class="point-rule-example"><strong>دوري النقاط</strong><span>الأدمن يحدد نقاط الفوز ونقاط الخسارة، والنظام يحتسبها مباشرة بدون توزيع نقاط الخاسرين.</span></div>
    `;
  }
  if (rule.pointSource === "grant" || (!canCarry && rule.pointSource !== "league")) {
    return `<label class="settings-control"><span>عدد النقاط المضافة لكل لاعب</span><input class="input" type="number" data-point-rule-round="${roundId}" data-point-rule-field="budget" value="${rule.budget}"></label>`;
  }
  return `
    <div class="point-rule-example"><strong>بدون إضافة نقاط</strong><span>سيستخدم النظام رصيد كل لاعب المتراكم من الأدوار السابقة ويقسمه تلقائياً على مباريات هذا الدور.</span></div>
  `;
}

function leaguePointFields(roundId, rule) {
  return `
    <label class="settings-control"><span>نقاط الفوز بالتوقع</span><input class="input" type="number" data-point-rule-round="${roundId}" data-point-rule-field="correctPoints" value="${rule.correctPoints || 10}"></label>
    <label class="settings-control"><span>نقاط الخسارة بالتوقع</span><input class="input" type="number" data-point-rule-round="${roundId}" data-point-rule-field="wrongPoints" value="${rule.wrongPoints || 0}"></label>
    <div class="point-rule-example"><strong>التعادل</strong><span>خيار التعادل يظهر للاعبين تلقائياً فقط في الدوريات أو دور المجموعات. في الأدوار الإقصائية يظهر فوز أو خسارة فقط.</span></div>
  `;
}

function nominationFields(roundId, rule) {
  return `
    <label class="settings-control"><span>طريقة الترشيح</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="nominationType">
      <option value="percent" ${rule.nominationType !== "points" ? "selected" : ""}>نسب مئوية</option>
      <option value="points" ${rule.nominationType === "points" ? "selected" : ""}>نقاط</option>
    </select></label>
    ${rule.nominationType === "points" ? pointsNominationFields(roundId, rule) : percentNominationFields(roundId, rule)}
  `;
}

function percentNominationFields(roundId, rule) {
  return `
    <label class="settings-control"><span>إعداد النسب</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="percentMode">
      <option value="fixed" ${rule.percentMode !== "minimum" ? "selected" : ""}>نسب ثابتة لكل مباراة</option>
      <option value="minimum" ${rule.percentMode === "minimum" ? "selected" : ""}>حد أدنى للفريق</option>
    </select></label>
    ${rule.percentMode === "minimum" ? `
      <label class="settings-control"><span>أقل نسبة مسموحة لأي طرف</span><input class="input" type="number" min="1" max="49" data-point-rule-round="${roundId}" data-point-rule-field="minPercent" value="${rule.minPercent}"></label>
    ` : `
      <label class="settings-control"><span>نسبة الفريق المرشح للفوز</span><input class="input" type="number" min="1" max="99" data-point-rule-round="${roundId}" data-point-rule-field="winnerPercent" value="${getFixedPercentWinnerShare(rule)}"></label>
    `}
    ${compactRuleGuide(rule)}
  `;
}

function pointsNominationFields(roundId, rule) {
  const totalPoints = getFixedMatchPointTotal(rule);
  const winnerPoints = getFixedMatchWinnerPoints(rule);
  return `
    <label class="settings-control"><span>إعداد النقاط</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="pointsMode">
      <option value="fixed" ${rule.pointsMode === "fixed" ? "selected" : ""}>نقاط ثابتة للترشيح لكل فريق</option>
      <option value="minimum" ${rule.pointsMode !== "fixed" ? "selected" : ""}>حد أدنى للنقاط لكل فريق</option>
    </select></label>
    ${rule.pointsMode === "fixed" ? `
      <label class="settings-control"><span>إجمالي نقاط المباراة</span><input class="input" type="number" min="2" data-point-rule-round="${roundId}" data-point-rule-field="matchPointsTotal" value="${totalPoints}"></label>
      <label class="settings-control"><span>نقاط الفريق المرشح للفوز</span><input class="input" type="number" min="1" max="${Math.max(1, totalPoints - 1)}" data-point-rule-round="${roundId}" data-point-rule-field="winnerPoints" value="${winnerPoints}"></label>
    ` : `
      <label class="settings-control"><span>الحد الأدنى للنقاط لكل فريق</span><input class="input" type="number" data-point-rule-round="${roundId}" data-point-rule-field="minPoints" value="${rule.minPoints}"></label>
    `}
    ${compactRuleGuide(rule)}
  `;
}

function compactRuleGuide(rule) {
  const display = "يظهر للاعب اختيار الفائز فقط في الأدوار الإقصائية، ويظهر التعادل تلقائياً في الدوريات أو دور المجموعات.";
  const global = `اختر قانون النقاط لهذا الدور حسب المرحلة التي ستبدأ منها البطولة. التوقعات تقفل قبل ${PREDICTION_LOCK_MINUTES} دقيقة من بداية أول مباراة في الدور. قاعدة عامة: أي لاعب يصل رصيده إلى أقل من الحد الأدنى للتصويت لكل فريق يتم إقصاؤه من البطولة تلقائياً.`;
  let body = "";

  if (rule.nominationType === "points") {
    if (rule.pointsMode === "fixed") {
      body = `النظام يستخدم ${getFixedMatchPointTotal(rule)} نقطة لكل مباراة: ${getFixedMatchWinnerPoints(rule)} نقطة للفريق المرشح للفوز، و${getFixedMatchLoserPoints(rule)} نقطة للطرف الآخر محسوبة تلقائياً. مثال: إذا اختار اللاعب الفريق الأقوى يتم اعتماد نقاط الترشيح الأعلى مباشرة بدون إدخال يدوي.`;
    } else {
      body = `النظام يقسم نقاط الدور على المباريات، واللاعب يوزع النقاط بشرط ألا يقل أي فريق عن ${rule.minPoints || 0} نقطة. مثال: إذا كانت ميزانية الدور 400 نقطة وفيه 4 مباريات، يبدأ توزيع كل مباراة من 100 نقطة تقريباً حسب اختيارات اللاعب.`;
    }
  } else if (rule.percentMode === "minimum") {
    body = `اللاعب يحدد نسبة كل طرف بنفسه، مجموع النسب في كل مباراة يجب أن يساوي 100%، وأقل نسبة مسموحة لأي طرف هي ${rule.minPercent || 20}%. مثال: 65% لفريق و35% للطرف الآخر تعني أن ترشيحه الأقوى هو صاحب النسبة الأعلى.`;
  } else {
    const sampleBalance = rule.pointSource === "grant" ? (rule.budget || 200) : 200;
    const sampleMatches = 2;
    const perMatch = sampleBalance / sampleMatches;
    const winnerPoints = Math.round(perMatch * (getFixedPercentWinnerShare(rule) / 100));
    const loserPoints = Math.round(perMatch * (getFixedPercentLoserShare(rule) / 100));
    body = `النسبة الأعلى ${getFixedPercentWinnerShare(rule)}% للفريق المرشح للفوز، والطرف الآخر ${getFixedPercentLoserShare(rule)}% محسوبة تلقائياً لأن المجموع دائماً 100%. مثال: إذا كان رصيد اللاعب ${sampleBalance} نقطة والدور فيه ${sampleMatches} مباريات، يحسب النظام ${winnerPoints} نقطة للترشيح الأقوى و${loserPoints} نقطة للطرف الآخر في كل مباراة.`;
  }

  return `
    <div class="point-rule-example compact-guide">
      <strong>شرح مختصر</strong>
      <p>${body} ${display} ${global}</p>
    </div>
  `;
}

function settlementFieldsHtml(roundId, rule) {
  if (rule.pointSource === "league") return "";
  return `
    <label class="settings-control"><span>آلية احتساب النقاط</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="settlement">
      <option value="cancel-losers" ${rule.settlement === "cancel-losers" ? "selected" : ""}>إلغاء نقاط الخاسرين</option>
      <option value="loser-pool-equal" ${rule.settlement !== "loser-pool-ratio" && rule.settlement !== "cancel-losers" ? "selected" : ""}>توزيع مجموع نقاط الخاسرين على الفائزين بالتساوي</option>
      <option value="loser-pool-ratio" ${rule.settlement === "loser-pool-ratio" ? "selected" : ""}>توزيع نقاط الخاسرين على الفائزين حسب وزن التصويت</option>
    </select></label>
  `;
}

function jokerRuleFields(roundId, rule) {
  return `
    <label class="joker-checkbox-card ${rule.jokerEnabled ? "active" : ""}">
      <input type="checkbox" data-point-rule-round="${roundId}" data-point-rule-field="jokerEnabled" ${rule.jokerEnabled ? "checked" : ""}>
      <span class="joker-checkmark" aria-hidden="true"></span>
      <span class="joker-copy">
        <strong>تفعيل الجوكر</strong>
        <small>يسمح للمتسابق بمضاعفة النقاط التي يحصل عليها عند توقع صحيح في مباريات محددة من هذا الدور.</small>
      </span>
    </label>
    ${rule.jokerEnabled ? `<label class="settings-control"><span>عدد مباريات الجوكر في الجولة</span><input class="input" type="number" min="1" data-point-rule-round="${roundId}" data-point-rule-field="jokerUses" value="${rule.jokerUses || 1}"></label>` : ""}
  `;
}

function pointRuleTypeLabel(rule) {
  if (rule.pointSource === "league") return "دوري النقاط";
  if (rule.nominationType === "points") return rule.pointsMode === "fixed" ? "نقاط ثابتة" : "نقاط بحد أدنى";
  return rule.percentMode === "minimum" ? "نسب متغيرة" : "نسب ثابتة";
}

function pointRuleDescription(rule) {
  const source = rule.pointSource === "league" ? "دوري النقاط" : rule.pointSource === "grant" ? `تضاف ${rule.budget} نقطة لكل لاعب` : "يستخدم الرصيد المتراكم لكل لاعب";
  const joker = rule.jokerEnabled ? ` الجوكر مفعل ${rule.jokerUses || 1} مرة في الجولة.` : "";
  if (rule.pointSource === "league") return `${source}: الفوز بالتوقع ${rule.correctPoints || 10} والخسارة بالتوقع ${rule.wrongPoints || 0}. لا يوجد توزيع لنقاط الخاسرين.${joker}`;
  const settlement = settlementSummary(rule);
  if (rule.nominationType === "points") {
    if (rule.pointsMode === "fixed") return `${source}: إجمالي المباراة ${getFixedMatchPointTotal(rule)} نقطة، ${getFixedMatchWinnerPoints(rule)} للترشيح الأعلى و${getFixedMatchLoserPoints(rule)} للطرف الآخر. ${settlement}${joker}`;
    return `${source} ثم تقسم نقاط الدور على المباريات، حد أدنى ${rule.minPoints} لكل فريق. ${settlement}${joker}`;
  }
  if (rule.percentMode === "minimum") return `${source} ثم يحدد اللاعب النسب بشرط مجموع 100% وأقل نسبة ${rule.minPercent}% لأي طرف. ${settlement}${joker}`;
  return `${source} ثم يقسم على مباريات الدور: ${getFixedPercentWinnerShare(rule)}% للفريق المرشح للفوز و${getFixedPercentLoserShare(rule)}% للطرف الآخر. ${settlement}${joker}`;
}

function settlementSummary(rule) {
  if (rule.settlement === "cancel-losers") return "نقاط الخاسرين تلغى ولا توزع.";
  if (rule.settlement === "loser-pool-ratio") return "نقاط الخاسرين توزع حسب وزن التصويت.";
  return "نقاط الخاسرين توزع بالتساوي على الفائزين.";
}

function pointRulePlayerGuide(rule, context) {
  const { hasDraw, totalBudget, minPoints, matchCount } = context;
  const resultChoice = hasDraw ? "يمكنك اختيار فوز أحد الطرفين أو التعادل." : "اختر الفريق الفائز فقط، التعادل غير متاح في هذه الجولة.";
  const items = [];

  if (rule.pointSource === "league") {
    items.push(`الصحيح: ${rule.correctPoints || 10} نقطة`);
    items.push(`الخاطئ: ${rule.wrongPoints || 0} نقطة`);
    items.push("لا يوجد توزيع لنقاط الخاسرين");
    return {
      summary: `${resultChoice} هذه الجولة بنظام دوري النقاط: تحصل على نقاط ثابتة عند صحة التوقع، ونقاط الخسارة يحددها الأدمن.`,
      items: withJokerGuide(rule, items)
    };
  }

  if (rule.pointSource === "grant") {
    items.push(`ميزانية الجولة: ${rule.budget || totalBudget} نقطة`);
  } else {
    items.push("يتم استخدام رصيدك المتراكم لهذه الجولة");
  }

  if (rule.nominationType === "points") {
    if (rule.pointsMode === "fixed") {
      items.push(`إجمالي كل مباراة: ${getFixedMatchPointTotal(rule)} نقطة`);
      items.push(`الفائز: ${getFixedMatchWinnerPoints(rule)} / الطرف الآخر: ${getFixedMatchLoserPoints(rule)}`);
      return {
        summary: `${resultChoice} النقاط ثابتة لكل مباراة حسب إعداد الأدمن، والنظام يحسب نقاط الطرف الآخر تلقائياً.`,
        items: withJokerGuide(rule, [...items, settlementPlayerGuide(rule)])
      };
    }

    items.push(`الحد الأدنى لكل فريق: ${rule.minPoints || minPoints} نقطة`);
    items.push(`عدد مباريات الجولة: ${matchCount}`);
    return {
      summary: `${resultChoice} وزّع نقاطك من ميزانية الجولة على المباريات، مع الالتزام بالحد الأدنى لكل فريق.`,
      items: withJokerGuide(rule, [...items, settlementPlayerGuide(rule)])
    };
  }

  if (rule.percentMode === "minimum") {
    items.push(`أقل نسبة لأي طرف: ${rule.minPercent || 20}%`);
    items.push("مجموع نسب كل مباراة يجب أن يساوي 100%");
    return {
      summary: `${resultChoice} حدّد نسبة فرصة كل طرف في كل مباراة، وصاحب النسبة الأعلى يعني أنه ترشيحك الأقوى.`,
      items: withJokerGuide(rule, [...items, settlementPlayerGuide(rule)])
    };
  }

  items.push(`ترشيحك الأقوى: ${getFixedPercentWinnerShare(rule)}%`);
  items.push(`الطرف الآخر: ${getFixedPercentLoserShare(rule)}%`);
  return {
    summary: `${resultChoice} هذه الجولة تستخدم نسباً ثابتة حددها الأدمن، وأنت تختار الترشيح فقط.`,
    items: withJokerGuide(rule, [...items, settlementPlayerGuide(rule)])
  };
}

function settlementPlayerGuide(rule) {
  if (rule.settlement === "cancel-losers") return "نقاط الخاسرين تلغى";
  if (rule.settlement === "loser-pool-ratio") return "نقاط الخاسرين توزع حسب وزن التوقع الصحيح";
  return "نقاط الخاسرين توزع بالتساوي على أصحاب التوقع الصحيح";
}

function withJokerGuide(rule, items) {
  if (!rule.jokerEnabled) return items;
  return [...items, `الجوكر متاح ${rule.jokerUses || 1} مرة في الجولة`];
}

function fixedPercentRuleExample(rule) {
  const sampleBalance = rule.pointSource === "grant" ? (rule.budget || 200) : 200;
  const sampleMatches = 2;
  const perMatch = sampleBalance / sampleMatches;
  const winnerPoints = Math.round(perMatch * (getFixedPercentWinnerShare(rule) / 100));
  const loserPoints = Math.round(perMatch * (getFixedPercentLoserShare(rule) / 100));
  return `
    <strong>مثال</strong>
    <span>إذا كان رصيد اللاعب ${sampleBalance} نقطة والدور فيه ${sampleMatches} مباريات، يخصص النظام ${winnerPoints} نقطة لترشيح الفائز و${loserPoints} نقطة للفريق الخاسر في كل مباراة.</span>
  `;
}

function getFixedPercentLoserShare(rule) {
  const winnerPercent = getFixedPercentWinnerShare(rule);
  return 100 - winnerPercent;
}

function getFixedPercentWinnerShare(rule) {
  return Math.min(99, Math.max(1, Number(rule.winnerPercent) || 70));
}

function getFixedMatchPointTotal(rule) {
  const explicitTotal = Number(rule.matchPointsTotal);
  const inferredTotal = Number(rule.winnerPoints || 0) + Number(rule.loserPoints || 0);
  return Math.max(2, explicitTotal || inferredTotal || 100);
}

function getFixedMatchWinnerPoints(rule) {
  const total = getFixedMatchPointTotal(rule);
  return Math.min(total - 1, Math.max(1, Number(rule.winnerPoints) || Math.round(total * 0.7)));
}

function getFixedMatchLoserPoints(rule) {
  return getFixedMatchPointTotal(rule) - getFixedMatchWinnerPoints(rule);
}

function variablePercentRuleExample(rule) {
  const minPercent = rule.minPercent || 20;
  return `
    <strong>مثال</strong>
    <span>إذا كان الحد الأدنى ${minPercent}%، يستطيع اللاعب اختيار 65% لفريق و35% للفريق الآخر. إذا فاز الفريق صاحب 65%، يحصل اللاعب على نقاط أكثر من لاعب وضع 55% على نفس الفائز.</span>
  `;
}

function ownerDangerPage(tournament) {
  if (tournament.cancelled) {
    return `
      <section class="card panel stack manage-detail-card">
        <div class="notice danger-notice">تم إلغاء البطولة.</div>
        <p class="muted">السبب الظاهر للمشاركين: ${tournament.cancelReason || "لم يتم تحديد سبب."}</p>
      </section>
    `;
  }
  return `
    <section class="card panel stack manage-detail-card">
      <div class="notice danger-notice">هذه الخيارات تؤثر على البطولة والمشاركين. تستخدم فقط عند الحاجة.</div>
      <button class="btn warn" type="button" id="toggle-join-window">${tournament.joinClosed ? "إعادة فتح استقبال المشاركين" : "إيقاف استقبال المشاركين"}</button>
      <button class="btn danger-btn" type="button" id="cancel-tournament-button">إلغاء البطولة</button>
      <p class="muted" id="danger-action-status">${tournament.cancelReason ? `تم الإلغاء. السبب الظاهر للمشاركين: ${tournament.cancelReason}` : "عند الإلغاء سيتم طلب السبب في نافذة تأكيد قبل التنفيذ."}</p>
    </section>
  `;
}

function toggleJoinWindow(tournament) {
  if (!tournament || tournament.cancelled) {
    if (tournament) renderTournamentManageSection(tournament, "danger");
    return;
  }
  tournament.joinClosed = !tournament.joinClosed;
  queueTournamentPersist(tournament);
  renderTournamentManageSection(tournament, "danger");
}

function cancelTournamentWithReason(tournament) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">إلغاء البطولة</h2>
        ${modalCloseButton()}
      </div>
      <div class="notice danger-notice">
        سبب الإلغاء سيظهر للمشاركين داخل البطولة. بعد التأكيد سيتم إلغاء نتائج هذه البطولة من بروفايلات المشاركين وإحصائياتهم المرتبطة بها.
      </div>
      <label class="settings-control wide">
        <span>سبب إلغاء البطولة</span>
        <textarea class="textarea" id="cancel-tournament-reason" placeholder="اكتب سبب واضح ومختصر للمشاركين.">${tournament.cancelReason || ""}</textarea>
      </label>
      <p class="muted" id="cancel-tournament-error"></p>
      <div class="topbar">
        <button class="btn ghost" type="button" id="close-cancel-modal">تراجع</button>
        <button class="btn danger-btn" type="button" id="confirm-cancel-tournament">تأكيد الإلغاء</button>
      </div>
    </section>
  `);
  document.querySelector("#close-modal")?.addEventListener("click", closeModal);
  document.querySelector("#close-cancel-modal")?.addEventListener("click", closeModal);
  document.querySelector("#confirm-cancel-tournament")?.addEventListener("click", () => confirmTournamentCancellation(tournament));
}

function confirmTournamentCancellation(tournament) {
  const reason = document.querySelector("#cancel-tournament-reason")?.value.trim();
  const error = document.querySelector("#cancel-tournament-error");
  const confirmButton = document.querySelector("#confirm-cancel-tournament");
  if (!reason) {
    if (error) {
      error.textContent = "اكتب سبب الإلغاء قبل تنفيذ الإجراء.";
      error.classList.add("form-error-inline");
    }
    return;
  }
  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = "جار الإلغاء...";
  }
  tournament.active = false;
  tournament.draft = false;
  tournament.cancelled = true;
  tournament.cancelReason = reason;
  tournament.resultsVoided = true;
  tournament.joinClosed = true;
  tournament.points = 0;
  tournament.correct = 0;
  tournament.wrong = 0;
  tournament.rank = null;
  tournament.leaderName = "";
  tournament.leaderPoints = 0;
  state.notifications.unshift({
    id: `n-cancel-${Date.now()}`,
    type: "tournament-update",
    title: `تم إلغاء ${tournament.name}`,
    body: `سبب الإلغاء: ${reason}. تم إلغاء نتائج هذه البطولة من الإحصائيات.`,
    time: "الآن",
    icon: "trophy",
    unread: true,
    route: `/tournament/${tournament.id}`,
    tournamentId: tournament.id
  });
  queueTournamentPersist(tournament);
  closeModal();
  navigate(tournamentPath(tournament, "/manage"));
}

function getTournamentRounds(tournament) {
  const explicitRounds = Array.isArray(tournament?.roundIds)
    ? rounds.filter((round) => tournament.roundIds.includes(round.id))
    : [];
  const sourceRounds = explicitRounds.length ? explicitRounds : rounds;
  const startIndex = Math.max(0, sourceRounds.findIndex((round) => round.id === (tournament.startingRound || sourceRounds[0]?.id || "group")));
  return sourceRounds.slice(startIndex);
}

function getTournamentPlayerActiveRound(tournament) {
  const fallbackRound = tournament.currentRound || tournament.startingRound || "round16";
  if (!isManualTournament(tournament)) return fallbackRound;
  if (getTournamentMatches(tournament, fallbackRound).length) return fallbackRound;
  return getTournamentRounds(tournament).find((round) => getTournamentMatches(tournament, round.id).length)?.id || fallbackRound;
}

function getNextRound(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const currentIndex = tournamentRounds.findIndex((round) => round.id === tournament.currentRound);
  return currentIndex >= 0 ? tournamentRounds[currentIndex + 1] : null;
}

async function refreshAndAdvanceTournamentRound(tournamentId) {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return;
  state.liveApi.lastStatus = "جاري مزامنة أدوار البطولة";
  state.liveApi.lastError = "";
  renderTournament(tournament.id, { forcePlayer: state.route.endsWith("/player") });

  if (isApiCompetitionTournament(tournament)) {
    await refreshTournamentFixturesFromApi(tournament);
  }

  const advanced = syncTournamentCurrentRound(tournament);
  if (advanced) {
    state.liveApi.lastStatus = "تم فتح الدور التالي من بيانات الربط";
    state.liveApi.lastError = "";
  } else if (isRoundCompleted(tournament, tournament.currentRound)) {
    state.liveApi.lastStatus = "الدور مكتمل، بانتظار ظهور مباريات الدور التالي من الربط";
    state.liveApi.lastError = "";
  } else {
    state.liveApi.lastStatus = "لم يكتمل الدور الحالي بعد";
    state.liveApi.lastError = "لا يتم فتح الدور التالي إلا بعد اعتماد نتائج كل مباريات الدور الحالي.";
  }
  queueTournamentPersist(tournament);
  renderTournament(tournament.id, { forcePlayer: state.route.endsWith("/player") });
}

function advanceTournamentRound(tournamentId) {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return false;
  const nextRound = getNextRound(tournament);
  if (!nextRound) return false;
  if (!isRoundCompleted(tournament, tournament.currentRound)) return false;
  if (!getTournamentMatches(tournament, nextRound.id).length) return false;
  tournament.currentRound = nextRound.id;
  state.selectedRound = nextRound.id;
  queueTournamentPersist(tournament);
  return true;
}

async function refreshTournamentFixturesFromApi(tournament) {
  if (!tournament?.officialCompetitionApiId) return false;
  try {
    const season = tournament.officialCompetitionSeason || new Date().getFullYear();
    let payload = await fetchCompetitionFixturesPayload(tournament.officialCompetitionApiId, { season });
    let latestMatches = normalizeFixturePayload(payload);
    if (!countPredictableMatchesByRound(latestMatches)) {
      const windowPayload = await fetchUpcomingCompetitionFixturesPayload(tournament.officialCompetitionApiId, season);
      const windowMatches = normalizeFixturePayload(windowPayload);
      if (countPredictableMatchesByRound(windowMatches)) {
        payload = windowPayload;
        latestMatches = windowMatches;
      }
    }
    if (!countPredictableMatchesByRound(latestMatches)) {
      const upcomingPayload = await fetchCompetitionFixturesPayload(tournament.officialCompetitionApiId, { next: 80 });
      const upcomingMatches = normalizeFixturePayload(upcomingPayload);
      if (countPredictableMatchesByRound(upcomingMatches)) {
        payload = upcomingPayload;
        latestMatches = upcomingMatches;
      }
    }
    if (!countMatchesByRound(latestMatches)) {
      const livePayload = await fetchCompetitionFixturesPayload(tournament.officialCompetitionApiId, { live: "all" });
      const liveMatches = normalizeFixturePayload(livePayload);
      if (countMatchesByRound(liveMatches)) {
        payload = livePayload;
        latestMatches = liveMatches;
      }
    }
    tournament.matchesByRound = mergeTournamentMatchesByRound(tournament.matchesByRound || emptyMatchesByRound(), latestMatches);
    const apiRounds = inferCompetitionRoundOptions({
      name: tournament.officialCompetitionName || tournament.name,
      region: "",
      season: tournament.officialCompetitionSeason
    }, roundOptionsFromMatches(tournament.matchesByRound)).map((round) => round.id);
    if (apiRounds.length) tournament.roundIds = apiRounds;
    tournament.fixturesStatus = countMatchesByRound(tournament.matchesByRound) ? "loaded" : "empty";
    if (!countMatchesByRound(tournament.matchesByRound)) {
      state.liveApi.lastError = apiFootballErrorMessage(payload) || "لم تظهر مباريات من الربط لهذه البطولة.";
    }
    return true;
  } catch (error) {
    state.liveApi.lastError = error.message || "تعذر جلب مباريات البطولة";
    return false;
  }
}

function mergeTournamentMatchesByRound(currentMatchesByRound, latestMatchesByRound) {
  const merged = emptyMatchesByRound();
  rounds.forEach((round) => {
    const latest = latestMatchesByRound?.[round.id] || [];
    const current = currentMatchesByRound?.[round.id] || [];
    merged[round.id] = latest.length ? latest : current;
  });
  return merged;
}

function syncTournamentCurrentRound(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const previousRound = tournament.currentRound;
  for (let index = 0; index < tournamentRounds.length; index += 1) {
    const round = tournamentRounds[index];
    const matches = getTournamentMatches(tournament, round.id);
    if (!matches.length) {
      if (index === 0) {
        tournament.currentRound = round.id;
        state.selectedRound = round.id;
      }
      break;
    }
    if (!isRoundCompleted(tournament, round.id)) {
      tournament.currentRound = round.id;
      state.selectedRound = round.id;
      break;
    }
    const nextRound = tournamentRounds[index + 1];
    if (!nextRound) {
      tournament.currentRound = round.id;
      state.selectedRound = round.id;
      tournament.finished = true;
      break;
    }
    if (!getTournamentMatches(tournament, nextRound.id).length) {
      tournament.currentRound = round.id;
      state.selectedRound = round.id;
      break;
    }
  }
  return previousRound !== tournament.currentRound;
}

function isRoundCompleted(tournament, roundId) {
  const matches = getTournamentMatches(tournament, roundId);
  return Boolean(matches.length) && matches.every(isMatchFinal);
}

function isMatchFinal(match) {
  const status = String(match.statusShort || "").toUpperCase();
  return ["FT", "AET", "PEN"].includes(status) || Boolean(match.finished);
}

function isMatchLive(match) {
  const status = String(match?.statusShort || "").toUpperCase();
  return ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(status);
}

function isTournamentFinished(tournament) {
  if (tournament.completed || tournament.finished) return true;
  const tournamentRounds = getTournamentRounds(tournament);
  const finalRound = tournamentRounds[tournamentRounds.length - 1];
  const finalMatches = finalRound ? getTournamentMatches(tournament, finalRound.id) : [];
  return Boolean(finalMatches.length && finalMatches.every((match) => getMatchResultOutcome(match, finalRound.id)));
}

function tournamentFinalAwardResults(tournament) {
  const enabledAwards = awardOptions.filter((award) => (tournament.awardCategories || []).includes(award.id));
  const rows = [
    { id: "prediction-champion", label: "بطل مسابقة التوقعات", winner: leaderboardData(tournament)[0]?.name || "غير محدد", prize: getMainPredictionPrize(tournament) },
    ...enabledAwards.map((award) => ({
      id: award.id,
      label: award.label,
      winner: getAwardFinalWinner(tournament, award),
      prize: getPrizeForAward(tournament, award.id)
    }))
  ];
  return `
    <section class="panel final-awards-shell">
      <div class="pick-board-hero">
        <div>
          <span class="badge">نتائج البطولة</span>
          <h2 class="section-title">الفائزون بالترشيحات</h2>
          <p class="muted">بعد اعتماد نتيجة آخر مباراة، تظهر هنا المراكز الفائزة في كل توقع والجائزة المرتبطة بها.</p>
        </div>
      </div>
      <div class="final-awards-grid">
        ${rows.map((row) => finalAwardResultCard(row)).join("")}
      </div>
    </section>
  `;
}

function finalAwardResultCard(row) {
  return `
    <article class="final-award-card">
      <span>${row.label}</span>
      <strong>${row.winner}</strong>
      <small>${row.prize ? prizeValueText(row.prize) : "لا توجد جائزة محددة"}</small>
    </article>
  `;
}

function getAwardFinalWinner(tournament, award) {
  const winners = tournament.awardWinners || {};
  if (winners[award.id]) return winners[award.id];
  if (award.id === "champion-pick") return getTournamentChampionName(tournament);
  if (award.id === "runner-up-pick") return getTournamentRunnerUpName(tournament);
  const eligible = officialRosterPlayers.filter((player) => isEligibleForAward(player, award.id));
  return eligible[0]?.name || "غير محدد";
}

function getTournamentFinalMatch(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const finalRound = tournamentRounds[tournamentRounds.length - 1];
  const finalMatches = finalRound ? getTournamentMatches(tournament, finalRound.id) : [];
  return finalMatches.find((match) => getMatchResultOutcome(match, finalRound.id)) || null;
}

function getTournamentChampionName(tournament) {
  const finalMatch = getTournamentFinalMatch(tournament);
  if (!finalMatch) return "غير محدد";
  return getMatchResultOutcome(finalMatch, "final") || "غير محدد";
}

function getTournamentRunnerUpName(tournament) {
  const finalMatch = getTournamentFinalMatch(tournament);
  if (!finalMatch) return "غير محدد";
  const champion = getTournamentChampionName(tournament);
  if (champion === finalMatch.a) return finalMatch.b;
  if (champion === finalMatch.b) return finalMatch.a;
  return "غير محدد";
}

function awardNominationWorkflow(tournament) {
  const enabledAwards = awardOptions.filter((award) => (tournament.awardCategories || []).includes(award.id));
  if (!enabledAwards.length) return "";

  return `
    <section class="panel award-shell">
      <div class="pick-board-hero">
        <div>
          <span class="badge">Optional awards</span>
          <h2 class="section-title">Award Nominations</h2>
          <p class="muted">These categories were enabled by the tournament creator. Each participant can submit one nomination per category.</p>
        </div>
        <div class="pick-board-progress">
          <strong>${getAwardPickCount(tournament)}/${enabledAwards.length}</strong>
          <span>awards picked</span>
        </div>
      </div>
      <div class="award-grid">
        ${enabledAwards.map((award) => awardNominationCard(tournament, award)).join("")}
      </div>
    </section>
  `;
}

function awardNominationCard(tournament, award) {
  const key = `${tournament.id}:${award.id}`;
  const isTeamAward = award.target === "team";
  const selected = isTeamAward ? state.awardPicks[key] : getRosterPlayerById(state.awardPicks[key]);
  const query = state.awardSearchQueries[key] || "";

  return `
    <article class="award-card">
      <div>
        <h3>${award.label}</h3>
        <p class="muted">${isTeamAward ? "ابحث في الفرق الرسمية واختر فريقاً." : "ابحث في قوائم الفرق الرسمية واختر لاعباً مسجلاً."}</p>
      </div>
      <input class="input award-search-input" data-award-search="${key}" data-award-id="${award.id}" value="${query}" placeholder="اكتب اسم اللاعب أو الفريق">
      <div class="award-search-results" data-award-results="${key}">
        ${awardSearchResultsHtml(award.id, key, query)}
      </div>
      <div class="review-strip">
        <span>ترشيحك: <strong>${selected ? (isTeamAward ? selected : selected.name) : "لم يتم الاختيار"}</strong></span>
        ${selected && !isTeamAward ? `<span>${selected.team} · ${selected.position}</span>` : ""}
      </div>
    </article>
  `;
}

function getAwardPickCount(tournament) {
  return (tournament.awardCategories || []).filter((awardId) => state.awardPicks[`${tournament.id}:${awardId}`]).length;
}

function awardSearchResultsHtml(awardId, key, query) {
  if (isTeamAward(awardId)) return teamAwardSearchResultsHtml(key, query);

  const players = searchOfficialRosterPlayers(query, awardId).slice(0, 5);
  if (!query.trim()) {
    return `<div class="muted roster-empty">ابدأ بالكتابة للبحث في اللاعبين الرسميين.</div>`;
  }
  if (!players.length) {
    return `<div class="muted roster-empty">لا يوجد لاعب مطابق في القوائم الرسمية الحالية.</div>`;
  }
  return players.map((player) => `
    <button class="roster-result" data-award-player="${player.id}" data-award-key="${key}">
      <strong>${player.name}</strong>
      <span>${player.team} · ${player.position} · ${player.age}</span>
    </button>
  `).join("");
}

function teamAwardSearchResultsHtml(key, query) {
  const tournamentId = String(key || "").split(":")[0];
  const teams = searchOfficialTeams(query, getTournamentById(tournamentId)).slice(0, 6);
  if (!query.trim()) {
    return `<div class="muted roster-empty">ابدأ بالكتابة للبحث في الفرق الرسمية.</div>`;
  }
  if (!teams.length) {
    return `<div class="muted roster-empty">لا يوجد فريق مطابق في القائمة الرسمية الحالية.</div>`;
  }
  return teams.map((team) => `
    <button class="roster-result" data-award-team="${team}" data-award-key="${key}">
      <strong>${team}</strong>
      <span>فريق رسمي ضمن البطولة</span>
    </button>
  `).join("");
}

function isTeamAward(awardId) {
  return awardOptions.find((award) => award.id === awardId)?.target === "team";
}

function searchOfficialTeams(query, tournament = null) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  const matchSource = tournament ? Object.values(tournament.matchesByRound || {}) : Object.values(state.matches);
  const teams = [...new Set(matchSource.flat().flatMap((match) => [match.a, match.b]))]
    .filter((team) => !team.startsWith("الفائز"));
  return teams.filter((team) => translateDataNames(team).toLowerCase().includes(normalizedQuery) || team.toLowerCase().includes(normalizedQuery));
}

function searchOfficialRosterPlayers(query, awardId) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  return officialRosterPlayers
    .filter((player) => isEligibleForAward(player, awardId))
    .filter((player) => {
      const haystack = `${player.name} ${player.team} ${player.position}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
}

function isEligibleForAward(player, awardId) {
  if (awardId === "best-goalkeeper") return player.position === "GK";
  if (awardId === "top-scorer") return ["FWD", "MID"].includes(player.position);
  if (awardId === "best-young-player") return player.age <= 23;
  return true;
}

function getRosterPlayerById(playerId) {
  return officialRosterPlayers.find((player) => player.id === playerId) || null;
}

function teamLogoDataUri(label, primary, textColor) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${primary}"/>
          <stop offset="1" stop-color="#111827"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#g)"/>
      <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="3"/>
      <text x="32" y="39" text-anchor="middle" font-family="Arial, sans-serif" font-size="${label.length > 1 ? 19 : 26}" font-weight="800" fill="${textColor}">${label}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getTeamIdentity(teamName, logoUrl = "") {
  const flags = {
    "الإمارات": "🇦🇪",
    "السعودية": "🇸🇦",
    "قطر": "🇶🇦",
    "الكويت": "🇰🇼",
    "البحرين": "🇧🇭",
    "عمان": "🇴🇲",
    "العراق": "🇮🇶",
    "الأردن": "🇯🇴",
    "مصر": "🇪🇬",
    "المغرب": "🇲🇦",
    "تونس": "🇹🇳",
    "الجزائر": "🇩🇿",
    "فرنسا": "🇫🇷",
    "البرازيل": "🇧🇷",
    "الأرجنتين": "🇦🇷",
    "إسبانيا": "🇪🇸",
    "إنجلترا": "🏴",
    "ألمانيا": "🇩🇪",
    "إيطاليا": "🇮🇹"
  };
  const apiTeam = sportsApiTeamDirectory[teamName] || null;
  const crestLabels = {
    "العين": "ع",
    "النصر": "ن",
    "الهلال": "هـ",
    "الوصل": "و",
    "الاتحاد": "إ",
    "الشارقة": "ش",
    "الأهلي": "أ",
    "الوحدة": "ح",
    "الجزيرة": "ج",
    "شباب الأهلي": "ش",
    "اتحاد كلباء": "ك"
  };
  if (logoUrl) return { type: "logo", mark: crestLabels[teamName] || teamName.trim().charAt(0) || "•", logoUrl };
  if (apiTeam?.logoUrl) return { type: "logo", mark: crestLabels[teamName] || teamName.trim().charAt(0) || "•", logoUrl: apiTeam.logoUrl };
  if (flags[teamName]) return { type: "flag", mark: flags[teamName] };
  return { type: "crest", mark: crestLabels[teamName] || teamName.trim().charAt(0) || "•" };
}

function teamIdentityHtml(teamName, className = "", logoUrl = "") {
  const identity = getTeamIdentity(teamName, logoUrl);
  const emblem = identity.logoUrl
    ? `<span class="team-emblem logo" aria-hidden="true"><img src="${identity.logoUrl}" alt="" loading="lazy" onerror="this.closest('.team-emblem').classList.add('fallback'); this.remove();"></span>`
    : `<span class="team-emblem ${identity.type}" aria-hidden="true">${identity.mark}</span>`;
  return `
    <span class="team-identity ${className}">
      ${emblem}
      <span class="team-name">${teamName}</span>
    </span>
  `;
}

function matchIdentityHtml(match) {
  return `
    <span class="match-title">
      ${teamIdentityHtml(match.a, "", match.logoA || "")}
      <span class="match-versus">VS</span>
      ${teamIdentityHtml(match.b, "", match.logoB || "")}
    </span>
  `;
}

function matchRoundMetaHtml(match) {
  const items = [];
  if (match.legLabel) items.push(translateRoundMetaLabel(match.legLabel));
  if (match.stageLabel && match.stageLabel !== match.roundLabel) items.push(translateRoundMetaLabel(match.stageLabel));
  return items.length ? `<span class="muted match-round-meta">${items.join(" · ")}</span>` : "";
}

function translateRoundMetaLabel(label = "") {
  const value = String(label).trim();
  const normalized = value.toLowerCase();
  if (normalized === "group stage") return "دور المجموعات";
  if (normalized === "regular season") return "الدوري";
  if (normalized === "league stage") return "مرحلة الدوري";
  if (normalized === "first half") return "الشوط الأول";
  if (normalized === "second half") return "الشوط الثاني";
  if (/^matchday\s+\d+/i.test(value)) return value.replace(/matchday/i, "الجولة");
  if (/^round\s+\d+/i.test(value)) return value.replace(/round/i, "الجولة");
  return value;
}

function pickBoardWorkflow(tournament, round, matches, budgetState = {}) {
  if (!matches.length) return "";
  const visibleMatches = getVisiblePredictionMatchesForRound(tournament, round, matches);
  const sortedMatches = sortPredictionMatches(tournament.id, round, visibleMatches);
  const pickedCount = visibleMatches.filter((match) => isPredictionComplete(tournament.id, round, match.id)).length;
  const locked = round === "group"
    ? visibleMatches.every((match) => isPredictionLockedForMatch(round, match, visibleMatches))
    : isPredictionLocked(visibleMatches);
  const roundLabel = rounds.find((item) => item.id === round)?.label || "الجولة الحالية";
  const groupMatchdayLabel = round === "group" ? getGroupMatchdayLabel(visibleMatches[0], matches) : "";
  const displayRoundLabel = groupMatchdayLabel ? `${roundLabel} · ${groupMatchdayLabel}` : roundLabel;
  const hasDraw = predictionOutcomes(round, visibleMatches[0]).some((outcome) => outcome.value === "draw");
  const totalBudget = tournament.budget || 0;
  const minPoints = tournament.minPoints || 0;
  const nextOpenMatch = visibleMatches.find((match) => !isPredictionComplete(tournament.id, round, match.id) && !isPredictionLockedForMatch(round, match, visibleMatches))
    || visibleMatches.find((match) => !isPredictionComplete(tournament.id, round, match.id))
    || visibleMatches[0];
  const firstKickoff = new Date(nextOpenMatch.kickoff).getTime();
  const roundLockAt = round === "group" ? String(getMatchPredictionLockAt(nextOpenMatch)) : getRoundPredictionLockAtForTournament(tournament, round);
  const rule = getTournamentPointRules(tournament)[round] || {};
  const playerGuide = pointRulePlayerGuide(rule, { hasDraw, totalBudget, minPoints, matchCount: visibleMatches.length });
  const used = budgetState.used ?? getUsedBudget(tournament.id, round);
  const roundBudget = getRoundBudgetForPlayer(tournament, round, rule) || tournament.budget || 0;
  const pct = budgetState.pct ?? Math.min(100, Math.round((used / Math.max(1, roundBudget)) * 100));

  return `
    <section class="panel pick-board-shell">
      <div class="pick-board-hero">
        <div>
          <div class="pick-board-title-line">
            <h2 class="section-title">توقع النتائج - ${displayRoundLabel}</h2>
            <span class="prediction-progress-chip">${pickedCount}/${visibleMatches.length} ${locked ? "مقفلة" : "مكتملة"}</span>
          </div>
          <p class="muted">${playerGuide.summary}</p>
          ${round === "group" ? `<p class="muted compact-helper">دور المجموعات يفتح جولة بجولة. كل مباراة تقفل قبل بدايتها بـ ${PREDICTION_LOCK_MINUTES} دقيقة حسب ${timezoneDisplay()}.</p>` : ""}
        </div>
      </div>

      <div class="prediction-guide">
        ${playerGuide.items.map((item) => `<span>${item}</span>`).join("")}
      </div>

      <div class="prediction-budget-box">
        <div class="stat-line"><span>المستخدم من ميزانية الجولة</span><strong>${used} / ${roundBudget}</strong></div>
        <div class="budget-bar" style="--pct: ${pct}%"><span></span></div>
      </div>

      <div class="match-countdown round-vote-countdown" data-match-countdown data-countdown-mode="${round === "group" ? "group-matchday" : "round"}" data-kickoff="${new Date(firstKickoff).toISOString()}" data-lock-at="${roundLockAt}">
        <span data-countdown-label>يتم حساب وقت القفل</span>
        <strong data-countdown-value>--:--:--</strong>
        <small data-countdown-lock>${round === "group" ? "قفل المباراة القادمة" : "قفل التصويت قبل أول مباراة في الجولة"} بـ ${PREDICTION_LOCK_MINUTES} دقيقة · ${timezoneDisplay()}</small>
      </div>

      <div class="prediction-list">
        ${predictionMatchGroups(tournament, round, sortedMatches, locked)}
      </div>
    </section>
  `;
}

function predictionMatchGroups(tournament, round, matches, locked) {
  const groups = matches.reduce((acc, match) => {
    const key = new Date(match.kickoff).toISOString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  return Object.entries(groups).map(([kickoff, groupMatches]) => `
    <section class="prediction-time-group">
      <h3 class="prediction-time-title">${formatUaeDate(kickoff)} <small>${timezoneDisplay()}</small></h3>
      <div class="prediction-time-list">
        ${groupMatches.map((match) => pickBoardCard(tournament, round, match, locked)).join("")}
      </div>
    </section>
  `).join("");
}

function getMatchLockTimestamp(match) {
  const kickoff = new Date(match?.kickoff).getTime();
  return Number.isFinite(kickoff) ? kickoff - PREDICTION_LOCK_MINUTES * 60 * 1000 : 0;
}

function pickBoardCard(tournament, round, match, locked) {
  const matchLocked = isPredictionLockedForMatch(round, match, getTournamentPredictionSourceMatches(tournament, round));
  const key = `${tournament.id}:${round}:${match.id}`;
  const picked = state.quickPicks[key];
  const prediction = state.predictions[key] || {};
  const rule = getPointRuleForRound(tournament, round);
  const allocated = getPredictionPoints(prediction);
  const completed = isPredictionComplete(tournament.id, round, match.id);
  const editing = isPredictionEditing(key);
  const pickLocked = matchLocked || (completed && !editing);
  const resultState = getPredictionResultState(match, round, prediction);
  const missed = !completed && matchLocked;
  const statusText = resultState
    ? resultState.label
    : completed && editing ? "قيد التعديل" : completed ? "مكتمل" : missed ? "لم يتم التصويت" : "بانتظار التصويت";
  const statusClass = resultState?.className || (completed ? "done" : missed ? "missed" : "todo");
  const selectedOutcome = editing || !completed ? picked || getPredictionOutcome(prediction) : getPredictionOutcome(prediction) || picked;
  const selectedLabel = selectedOutcome ? outcomeText(selectedOutcome, match) : "لم يتم الاختيار";
  const errorText = state.predictionErrors[key] || "";
  const needsDetails = requiresInlinePredictionDetails(rule, selectedOutcome);
  const showDetails = !pickLocked && selectedOutcome && needsDetails;
  const parsedScore = parseMatchScore(match.score);
  const scoreText = isMatchFinal(match)
    ? parsedScore
      ? `${parsedScore.home} - ${parsedScore.away}`
      : `${Number(match.scoreA ?? match.goalsA ?? 0)} - ${Number(match.scoreB ?? match.goalsB ?? 0)}`
    : "";
  const pickText = editing
    ? selectedOutcome
      ? showDetails
        ? "أكمل تفاصيل التعديل ثم اضغط حفظ التوقع"
        : `الاختيار الحالي: ${escapeHtml(selectedLabel)} · اختر فريقاً لحفظ التعديل`
      : "اختر الفائز لحفظ التعديل"
    : selectedOutcome
      ? showDetails ? "أكمل تفاصيل التوقع ثم اضغط حفظ التوقع" : `تم حفظ توقعك: ${escapeHtml(selectedLabel)}`
      : "اختر الفائز لحفظ توقعك";

  return `
    <article class="prediction-row-card participant-style-card ${completed && !editing ? "completed" : "pending"} ${editing ? "editing" : ""} ${matchLocked ? "locked-card" : ""}">
      <div class="prediction-card-top">
        <span>${formatUaeDate(match.kickoff, { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        <span class="prediction-card-countdown match-countdown" data-match-countdown data-countdown-mode="match" data-kickoff="${new Date(match.kickoff).toISOString()}" data-lock-at="${getMatchLockTimestamp(match)}" data-score="${scoreText}">
          <small data-countdown-label>يتم حساب الوقت</small>
          <b data-countdown-value>--:--:--</b>
          <small data-countdown-lock></small>
        </span>
      </div>
      <div class="prediction-choice-grid ${isDrawAllowed(round) ? "has-draw" : ""}">
        ${predictionTeamButton(tournament, round, match, match.a, selectedOutcome, pickLocked)}
        ${isDrawAllowed(round) ? predictionDrawButton(tournament, round, match, selectedOutcome, pickLocked) : `<span class="prediction-vs-chip">VS</span>`}
        ${predictionTeamButton(tournament, round, match, match.b, selectedOutcome, pickLocked)}
      </div>
      ${showDetails ? predictionInlineDetailBox(tournament, round, match, rule, selectedOutcome, prediction) : ""}
      <div class="prediction-match-footer">
        <span class="prediction-status ${statusClass}">${statusText}</span>
        <span class="prediction-saved-pick">${pickText}</span>
        ${allocated ? `<span class="prediction-card-points">${allocated} نقطة</span>` : ""}
        ${completed && !matchLocked && !editing ? `<button class="prediction-edit-link" type="button" data-inline-edit="${match.id}">تعديل</button>` : ""}
      </div>
      ${errorText ? `<div class="prediction-inline-error">${errorText}</div>` : ""}
    </article>
  `;
}

function supportsInlinePrediction(rule) {
  return true;
}

function requiresVariablePercentInput(rule, outcome = "") {
  return rule.nominationType === "percent" && rule.percentMode === "minimum" && outcome !== "draw";
}

function requiresInlinePredictionDetails(rule, outcome = "") {
  return requiresManualPredictionPoints(rule) || requiresVariablePercentInput(rule, outcome);
}

function predictionTeamButton(tournament, round, match, team, selectedOutcome, locked) {
  const logoUrl = team === match.a ? match.logoA : match.logoB;
  const selected = selectedOutcome === team ? "selected" : "";
  return `
    <button class="prediction-team-pick ${selected}" type="button" data-inline-pick="${match.id}" data-outcome="${team}" ${locked ? "disabled" : ""}>
      ${teamIdentityHtml(team, "", logoUrl || "")}
    </button>
  `;
}

function predictionInlineDetailBox(tournament, round, match, rule, outcome, prediction = {}) {
  if (requiresManualPredictionPoints(rule)) {
    const value = getPredictionPoints(prediction) || Number(rule.minPoints || tournament.minPoints || 1);
    return `
      <div class="prediction-detail-box">
        <label>
          <span>نقاط هذا التوقع</span>
          <input class="input" type="number" min="${rule.minPoints || tournament.minPoints || 1}" data-inline-points="${match.id}" value="${value}">
        </label>
        <button class="btn accent compact-btn" type="button" data-inline-detail-save="${match.id}">حفظ التوقع</button>
      </div>
    `;
  }
  if (requiresVariablePercentInput(rule, outcome)) {
    const minPercent = Number(rule.minPercent || 20);
    const value = Number(prediction.winnerPercent || Math.max(minPercent, 60));
    return `
      <div class="prediction-detail-box percent-detail-box">
        <label>
          <span>نسبة ترجيح الفائز</span>
          <input class="input" type="number" min="${minPercent}" max="${100 - minPercent}" data-inline-percent="${match.id}" value="${value}">
        </label>
        <p>${value}% للفائز · ${100 - value}% للطرف الآخر</p>
        <button class="btn accent compact-btn" type="button" data-inline-detail-save="${match.id}">حفظ التوقع</button>
      </div>
    `;
  }
  return "";
}

function predictionDrawButton(tournament, round, match, selectedOutcome, locked) {
  const selected = selectedOutcome === "draw" ? "selected" : "";
  return `
    <button class="prediction-draw-pick ${selected}" type="button" data-inline-pick="${match.id}" data-outcome="draw" ${locked ? "disabled" : ""}>
      تعادل
    </button>
  `;
}

function confirmInlinePrediction(tournament, round, matchId) {
  const matches = getTournamentPredictionSourceMatches(tournament, round);
  const match = matches.find((item) => item.id === matchId);
  if (!match || isPredictionLockedForMatch(round, match, matches)) return;
  const rule = getPointRuleForRound(tournament, round);
  if (!supportsInlinePrediction(rule)) {
    predictionModal(tournament, round, matchId);
    return;
  }
  const key = `${tournament.id}:${round}:${match.id}`;
  if (isPredictionComplete(tournament.id, round, match.id) && !isPredictionEditing(key)) {
    state.editingPredictions[key] = true;
    state.quickPicks[key] = getPredictionOutcome(state.predictions[key] || {});
    delete state.predictionErrors[key];
    renderTournament(tournament.id);
    return;
  }
  const outcome = state.quickPicks[key] || getPredictionOutcome(state.predictions[key] || {});
  if (!outcome) {
    state.predictionErrors[key] = "يجب اختيار الفائز بالضغط على اسم الفريق لقبول التصويت.";
    renderTournament(tournament.id);
    return;
  }
  const next = {
    outcome,
    points: getAutoPredictionPoints(tournament, round, match, outcome, rule),
    pointEntry: "auto"
  };
  const validation = validatePrediction(tournament, round, key, next);
  if (validation) return;
  state.predictions[key] = next;
  state.quickPicks[key] = outcome;
  delete state.editingPredictions[key];
  delete state.predictionErrors[key];
  queueTournamentPersist(tournament);
  renderTournament(tournament.id);
}

function isPredictionEditing(key) {
  return Boolean(state.editingPredictions[key]);
}

function getPredictionResultState(match, round, prediction) {
  const outcome = getPredictionOutcome(prediction || {});
  if (!outcome || !isMatchFinal(match)) return null;
  const result = getMatchResultOutcome(match, round);
  if (!result) return null;
  return outcome === result
    ? { label: "توقع صحيح", className: "correct" }
    : { label: "توقع خاطئ", className: "wrong" };
}

function isPredictionComplete(tournamentId, round, matchId) {
  const prediction = state.predictions[`${tournamentId}:${round}:${matchId}`] || {};
  return Boolean(getPredictionOutcome(prediction) && getPredictionPoints(prediction) > 0);
}

function sortPredictionMatches(tournamentId, round, matches) {
  return [...matches].sort((a, b) => {
    const aDone = isPredictionComplete(tournamentId, round, a.id);
    const bDone = isPredictionComplete(tournamentId, round, b.id);
    if (aDone !== bDone) return Number(aDone) - Number(bDone);
    return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
  });
}

function getGroupMatchdayGroups(matches) {
  const sorted = [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  const fallbackIndexes = new Map();
  return sorted.reduce((groups, match) => {
    const parsed = match.groupRoundId
      ? { id: match.groupRoundId, label: match.groupRoundLabel || "" }
      : parseApiGroupRound(match.apiRound || match.stageLabel || "");
    const dateKey = formatUaeDateKey(match.kickoff);
    const key = parsed.id || `group-date-${dateKey}`;
    if (!fallbackIndexes.has(key)) fallbackIndexes.set(key, fallbackIndexes.size + 1);
    const fallbackLabel = `الجولة ${fallbackIndexes.get(key)}`;
    const label = parsed.label || match.groupRoundLabel || fallbackLabel;
    let group = groups.find((item) => item.id === key);
    if (!group) {
      group = { id: key, label, matches: [] };
      groups.push(group);
    }
    group.matches.push(match);
    return groups;
  }, []);
}

function matchdayStateKey(tournamentId, round) {
  return `${tournamentId}:${round}`;
}

function getMatchdayIdForMatch(match, matches = []) {
  const groups = getGroupMatchdayGroups(matches.length ? matches : [match]);
  return groups.find((group) => group.matches.some((item) => item.id === match?.id))?.id || "";
}

function getDefaultMatchdayId(matches) {
  return "all";
}

function getSelectedPredictionMatchdayId(tournament, round, matches) {
  const groups = getGroupMatchdayGroups(matches);
  if (groups.length <= 1) return "";
  const saved = state.selectedMatchdayByTournament[matchdayStateKey(tournament.id, round)];
  if (saved === "all") return "all";
  return groups.some((group) => group.id === saved) ? saved : getDefaultMatchdayId(matches);
}

function getSelectedLiveRound(tournament) {
  const saved = state.selectedLiveRoundByTournament[tournament.id];
  const tournamentRounds = getTournamentRounds(tournament);
  if (saved && tournamentRounds.some((item) => item.id === saved)) return saved;
  const preferredRound = tournament.currentRound || tournament.startingRound || "round16";
  if (tournamentRounds.some((item) => item.id === preferredRound)) return preferredRound;
  return tournamentRounds.find((item) => getTournamentMatches(tournament, item.id).length)?.id || tournamentRounds[0]?.id || preferredRound;
}

function getSelectedLiveMatchdayId(tournament, round, matches) {
  const saved = state.selectedLiveMatchdayByTournament[matchdayStateKey(tournament.id, round)];
  const groups = getGroupMatchdayGroups(matches);
  if (groups.length <= 1) return "";
  if (saved === "all") return "all";
  return groups.some((group) => group.id === saved) ? saved : "all";
}

function groupMatchdayFilterHtml(tournament, round, matches, mode = "player") {
  const groups = getGroupMatchdayGroups(matches);
  if (groups.length <= 1) return "";
  const selectedId = mode === "live"
    ? getSelectedLiveMatchdayId(tournament, round, matches)
    : getSelectedPredictionMatchdayId(tournament, round, matches);
  const attribute = mode === "live" ? "data-live-matchday" : "data-group-matchday";
  const tournamentAttribute = mode === "live" ? `data-live-tournament-id="${tournament.id}"` : "";
  const options = [{ id: "all", label: "جميع المباريات" }, ...groups];
  const activeIndex = Math.max(0, options.findIndex((group) => group.id === selectedId));
  return `
    <div class="championship-segment round-segment matchday-segment" role="tablist" aria-label="فلتر مباريات الدور" style="--tab-count: ${options.length}; --active-index: ${activeIndex};">
      ${options.map((group) => `
        <button class="championship-segment-btn round-segment-btn ${group.id === selectedId ? "active" : ""}" type="button" ${attribute}="${group.id}" ${tournamentAttribute} role="tab" aria-selected="${group.id === selectedId}">
          ${group.label}
        </button>
      `).join("")}
      <span class="championship-segment-indicator" aria-hidden="true"></span>
    </div>
  `;
}

function liveRoundFilterHtml(tournament, selectedRound) {
  const roundOptions = getTournamentRounds(tournament);
  if (roundOptions.length <= 1) return "";
  const activeIndex = Math.max(0, roundOptions.findIndex((round) => round.id === selectedRound));
  return `
    <div class="championship-segment round-segment live-round-segment" role="tablist" aria-label="أدوار المباشر" style="--tab-count: ${roundOptions.length}; --active-index: ${activeIndex};">
      ${roundOptions.map((round) => `
        <button class="championship-segment-btn round-segment-btn ${round.id === selectedRound ? "active" : ""}" type="button" data-live-round="${round.id}" data-live-tournament-id="${tournament.id}" role="tab" aria-selected="${round.id === selectedRound}">
          ${round.label}
        </button>
      `).join("")}
      <span class="championship-segment-indicator" aria-hidden="true"></span>
    </div>
  `;
}

const liveScopeOptions = [
  { id: "live", label: "الآن" },
  { id: "today", label: "اليوم" },
  { id: "upcoming", label: "القادمة" },
  { id: "past", label: "السابقة" },
  { id: "all", label: "الكل" }
];

function getLiveScopeForTournament(tournament, matches) {
  const saved = state.selectedLiveScopeByTournament[tournament.id];
  if (liveScopeOptions.some((option) => option.id === saved)) return saved;
  if (matches.some(isMatchLive)) return "live";
  if (matches.some(isMatchToday)) return "today";
  if (matches.some(isFutureMatch)) return "upcoming";
  return "all";
}

function liveScopeFilterHtml(tournament, selectedScope) {
  const activeIndex = Math.max(0, liveScopeOptions.findIndex((option) => option.id === selectedScope));
  return `
    <div class="championship-segment round-segment live-scope-segment" role="tablist" aria-label="فلتر مباريات المباشر" style="--tab-count: ${liveScopeOptions.length}; --active-index: ${activeIndex};">
      ${liveScopeOptions.map((option) => `
        <button class="championship-segment-btn round-segment-btn ${option.id === selectedScope ? "active" : ""}" type="button" data-live-scope="${option.id}" data-live-tournament-id="${tournament.id}" role="tab" aria-selected="${option.id === selectedScope}">
          ${option.label}
        </button>
      `).join("")}
      <span class="championship-segment-indicator" aria-hidden="true"></span>
    </div>
  `;
}

function liveFilterButtonHtml(tournament, round, matches) {
  const groups = getGroupMatchdayGroups(matches);
  const selectedMatchday = getSelectedLiveMatchdayId(tournament, round, matches);
  const matchdayLabel = selectedMatchday && selectedMatchday !== "all"
    ? groups.find((group) => group.id === selectedMatchday)?.label || "جميع المباريات"
    : "جميع المباريات";
  return `
    <div class="live-filter-actions">
      <button class="live-filter-trigger" type="button" data-live-filter-sheet="${tournament.id}" data-live-round-id="${round}" aria-label="فلترة المباريات">
        <span class="live-filter-main">${matchdayLabel}</span>
        <span class="live-filter-chevron" aria-hidden="true">⌄</span>
      </button>
      <button class="live-standings-chip" type="button" data-live-standings="${tournament.id}" data-live-round-id="${round}">الترتيب</button>
    </div>
  `;
}

function openLiveFilterSheet(tournament, roundId) {
  const round = roundId || getSelectedLiveRound(tournament);
  const matches = getTournamentMatches(tournament, round);
  const groups = getGroupMatchdayGroups(matches);
  const selectedMatchday = getSelectedLiveMatchdayId(tournament, round, matches) || "all";
  const matchdayOptions = [{ id: "all", label: "جميع المباريات" }, ...groups];
  openModal(`
    <section class="live-filter-sheet" role="dialog" aria-label="فلترة المباريات">
      <div class="sheet-handle" aria-hidden="true"></div>
      <div class="live-filter-sheet-group">
        <p class="live-filter-sheet-title">الجولات</p>
        ${matchdayOptions.map((option) => `
          <button class="live-filter-sheet-row" type="button" data-live-sheet-matchday="${option.id}" data-live-tournament-id="${tournament.id}" data-live-round-id="${round}">
            <span class="radio-dot ${option.id === selectedMatchday ? "active" : ""}" aria-hidden="true"></span>
            <span>${option.label}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `);
  document.querySelectorAll("[data-live-sheet-matchday]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLiveMatchdayByTournament[matchdayStateKey(button.dataset.liveTournamentId, button.dataset.liveRoundId)] = button.dataset.liveSheetMatchday;
      delete state.selectedLiveScopeByTournament[button.dataset.liveTournamentId];
      saveLocalAppState();
      closeModal();
      renderLive();
    });
  });
}

function isFutureMatch(match) {
  const time = new Date(match?.kickoff || "").getTime();
  return Number.isFinite(time) && time > Date.now();
}

function isPastMatch(match) {
  const status = String(match?.statusShort || "").toUpperCase();
  if (["FT", "AET", "PEN"].includes(status)) return true;
  const time = new Date(match?.kickoff || "").getTime();
  return Number.isFinite(time) && time + MATCH_RESULT_AFTER_MINUTES * 60000 < Date.now();
}

function isMatchToday(match) {
  return formatUaeDateKey(match?.kickoff) === formatUaeDateKey(new Date().toISOString());
}

function liveScopeEmptyText(scope) {
  if (scope === "live") return "لا توجد مباريات مباشرة حالياً لهذه البطولة.";
  if (scope === "today") return "لا توجد مباريات اليوم لهذه البطولة.";
  if (scope === "upcoming") return "لا توجد مباريات قادمة ظاهرة من المصدر الرسمي حالياً.";
  if (scope === "past") return "لا توجد مباريات سابقة لهذا الدور.";
  return "لا توجد مباريات مرتبطة بهذا الاختيار حالياً.";
}

function getGroupMatchdayLabel(match, matches = []) {
  if (match?.groupRoundLabel) return match.groupRoundLabel;
  const groups = getGroupMatchdayGroups(matches.length ? matches : [match]);
  return groups.find((group) => group.matches.some((item) => item.id === match?.id))?.label || "الجولة الحالية";
}

function getVisiblePredictionMatchesForRound(tournament, round, matches) {
  const groups = getGroupMatchdayGroups(matches);
  if (!groups.length) return matches;
  const selectedId = getSelectedPredictionMatchdayId(tournament, round, matches);
  if (!selectedId || selectedId === "all") return matches;
  return (groups.find((group) => group.id === selectedId) || groups[0]).matches;
}

function formatUaeDateKey(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "unknown";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: normalizeTimezone(state.currentUser.timezone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function predictionOutcomeCompactHtml(outcome, match) {
  if (outcome.value === "draw") return `<span><b>تعادل</b><small>نقطة وسط</small></span>`;
  const teamName = outcome.value === match.a ? match.a : match.b;
  return `<span><b>فوز</b><small>${teamName}</small></span>`;
}

function matchTemplate(tournament, round, match) {
  const predictionMatches = getTournamentPredictionSourceMatches(tournament, round);
  const locked = isPredictionLockedForMatch(round, match, predictionMatches.length ? predictionMatches : [match]);
  const existing = state.predictions[`${tournament.id}:${round}:${match.id}`] || {};
  const pickedOutcome = getPredictionOutcome(existing);
  const points = getPredictionPoints(existing);
  const lockAt = round === "group" ? String(getMatchPredictionLockAt(match)) : getRoundPredictionLockAtForTournament(tournament, round);
  return `
    <article class="match-card">
      <div class="match-top">
        <strong>${matchIdentityHtml(match)}</strong>
        <span class="muted">${formatDate(match.kickoff)}${match.legLabel ? ` · ${match.legLabel}` : ""}</span>
      </div>
      <div class="match-countdown" data-match-countdown data-kickoff="${match.kickoff}" data-lock-at="${lockAt}" data-score="${match.score || ""}">
        <span data-countdown-label>يتم حساب الوقت</span>
        <strong data-countdown-value>--:--:--</strong>
        <small data-countdown-lock>قفل التوقعات قبل ${PREDICTION_LOCK_MINUTES} دقيقة من البداية</small>
      </div>
      <div class="team-row">
        <div>
          <strong>توقعك</strong>
          <span class="muted">${pickedOutcome ? outcomeText(pickedOutcome, match) : "لم يتم التوقع"}</span>
        </div>
        <strong>${points} نقطة</strong>
      </div>
      <button class="btn accent" data-predict="${match.id}" ${locked ? "disabled" : ""}>توقع</button>
    </article>
  `;
}

function predictionModal(tournament, round, matchId) {
  const matches = getTournamentPredictionSourceMatches(tournament, round);
  const match = matches.find((item) => item.id === matchId);
  if (!match || isPredictionLockedForMatch(round, match, matches)) return;
  const key = `${tournament.id}:${round}:${match.id}`;
  const existing = state.predictions[key] || {};
  const rule = getPointRuleForRound(tournament, round);
  const manualPoints = requiresManualPredictionPoints(rule);
  const quickPick = state.quickPicks[key];
  const existingOutcome = getPredictionOutcome(existing) || quickPick || predictionOutcomes(round, match)[0].value;
  const existingPoints = getPredictionPoints(existing) || getAutoPredictionPoints(tournament, round, match, existingOutcome, rule);
  openModal(`
    <form class="card modal stack" id="prediction-form">
      <h2 class="section-title">تأكيد التوقع</h2>
      <p class="muted prediction-match-title">${matchIdentityHtml(match)}</p>
      <div class="prediction-outcome-grid">
        ${predictionOutcomes(round, match).map((outcome) => `
          <label class="point-rule-option ${existingOutcome === outcome.value ? "active" : ""}">
            <input type="radio" name="prediction-outcome" value="${outcome.value}" ${existingOutcome === outcome.value ? "checked" : ""}>
            <span>${outcome.text}</span>
          </label>
        `).join("")}
      </div>
      ${manualPoints ? `
        <div class="field">
          <label>النقاط على هذا التوقع</label>
          <input class="input points-input" type="number" min="${rule.minPoints || tournament.minPoints}" id="prediction-points" value="${existingPoints}">
        </div>
      ` : `
        <div class="point-rule-example prediction-auto-points">
          <strong>النقاط تحسب تلقائياً</strong>
          <span>${predictionPointExplanation(tournament, round, rule, existingPoints)}</span>
        </div>
      `}
      <div class="error-text" id="prediction-error"></div>
      <div class="topbar">
        <button class="btn ghost" type="button" id="close-modal">إلغاء</button>
        <button class="btn accent" type="submit">حفظ التوقع</button>
      </div>
    </form>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#prediction-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const outcome = document.querySelector("[name='prediction-outcome']:checked")?.value;
    const points = manualPoints ? Number(document.querySelector("#prediction-points").value) : getAutoPredictionPoints(tournament, round, match, outcome, rule);
    const next = { outcome, points, pointEntry: manualPoints ? "manual" : "auto" };
    const validation = validatePrediction(tournament, round, key, next);
    if (validation) {
      document.querySelector("#prediction-error").textContent = validation;
      return;
    }
    state.predictions[key] = next;
    state.quickPicks[key] = outcome;
    delete state.editingPredictions[key];
    queueTournamentPersist(tournament);
    closeModal();
    renderTournament(tournament.id);
  });
}

function getPointRuleForRound(tournament, round) {
  return getTournamentPointRules(tournament)[round] || {};
}

function requiresManualPredictionPoints(rule) {
  return rule.pointSource !== "league" && rule.nominationType === "points" && rule.pointsMode !== "fixed";
}

function getAutoPredictionPoints(tournament, round, match, outcome, rule, options = {}) {
  if (rule.pointSource === "league") return Math.max(1, Number(rule.correctPoints) || 10);
  if (rule.nominationType === "points" && rule.pointsMode === "fixed") {
    if (outcome && outcome !== "draw") return getFixedMatchWinnerPoints(rule);
    return Math.max(1, Math.round(getFixedMatchPointTotal(rule) / 2));
  }

  const matches = getTournamentPredictionSourceMatches(tournament, round);
  const matchCount = Math.max(1, matches.length);
  const roundBudget = rule.pointSource === "grant" ? Number(rule.budget || tournament.budget || 0) : Number(tournament.points || tournament.budget || rule.budget || 0);
  const perMatch = roundBudget / matchCount;

  if (rule.nominationType === "percent") {
    if (rule.percentMode === "fixed") {
      const share = outcome === "draw" ? 50 : getFixedPercentWinnerShare(rule);
      return Math.max(1, Math.round(perMatch * (share / 100)));
    }
    const share = outcome === "draw" ? 50 : Number(options.winnerPercent || 0);
    return Math.max(1, Math.round(perMatch * ((share || 100) / 100)));
  }

  return Math.max(1, Number(rule.minPoints || tournament.minPoints || 1));
}

function predictionPointExplanation(tournament, round, rule, autoPoints) {
  const pointText = `${autoPoints} نقطة لهذا التوقع`;
  if (rule.pointSource === "league") {
    return `لا تحتاج لإدخال نقاط. هذا الدور بنظام دوري النقاط، والنظام يحتسب الصحيح والخاطئ تلقائياً.`;
  }
  if (rule.nominationType === "percent" && rule.percentMode === "fixed") {
    return `لا تحتاج لإدخال نقاط. النظام يستخدم النسب الثابتة التي حددها الأدمن ويحسب ${pointText} تلقائياً من ميزانية الجولة.`;
  }
  if (rule.nominationType === "percent") {
    return `لا تحتاج لإدخال نقاط هنا. النسب تحدد وزن الترشيح، والنقاط تحسب تلقائياً من ميزانية الجولة.`;
  }
  if (rule.nominationType === "points" && rule.pointsMode === "fixed") {
    return `لا تحتاج لإدخال نقاط. نقاط كل مباراة ثابتة حسب إعداد الأدمن، وسيتم احتساب ${pointText} تلقائياً.`;
  }
  return `النظام سيحسب نقاط هذا التوقع تلقائياً حسب إعدادات الجولة.`;
}

function liveApiStatusText() {
  const time = state.liveApi.lastFetchAt ? ` · آخر تحديث ${formatDate(new Date(state.liveApi.lastFetchAt).toISOString())}` : "";
  const error = state.liveApi.lastError ? ` · ${state.liveApi.lastError}` : "";
  return `${state.liveApi.lastStatus}${time}${error}`;
}

function liveApiKeyModal() {
  openModal(`
    <form class="card modal stack" id="live-api-key-form">
      <div class="modal-title-row">
        <h2 class="section-title">ربط API النتائج</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      <p class="muted">للإطلاق الرسمي يجب حفظ مفتاح API-Sports في Vercel كمتغير API_SPORTS_KEY. الإدخال هنا للاختبار المحلي فقط عند استخدام رابط مباشر.</p>
      <label class="field">
        <span>API Key</span>
        <input class="input" id="live-api-key" value="${getApiSportsKey()}" placeholder="x-apisports-key">
      </label>
      <label class="field">
        <span>Live endpoint</span>
        <input class="input" id="live-api-endpoint" value="${state.liveApi.endpoint}">
      </label>
      <button class="btn accent" type="submit">حفظ الربط</button>
    </form>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#live-api-key-form").addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem("pickaside_api_sports_key", document.querySelector("#live-api-key").value.trim());
    state.liveApi.endpoint = document.querySelector("#live-api-endpoint").value.trim() || state.liveApi.endpoint;
    state.liveApi.lastStatus = "تم حفظ إعدادات الربط";
    state.liveApi.lastError = "";
    closeModal();
    render();
  });
}

function getApiSportsKey() {
  try {
    return localStorage.getItem("pickaside_api_sports_key") || "";
  } catch {
    return "";
  }
}

function getApiSportsQuota() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const saved = JSON.parse(localStorage.getItem("pickaside_api_sports_quota") || "{}");
    if (saved.day !== today) return { day: today, count: 0 };
    return { day: today, count: Number(saved.count) || 0 };
  } catch {
    return { day: today, count: 0 };
  }
}

function incrementApiSportsQuota() {
  const quota = getApiSportsQuota();
  const next = { ...quota, count: quota.count + 1 };
  localStorage.setItem("pickaside_api_sports_quota", JSON.stringify(next));
  return next;
}

async function refreshLiveApiResults(tournament, round) {
  if (state.liveApi.isRefreshing) return;
  const endpoint = liveApiEndpoint();
  const usesBackendProxy = isBackendProxyEndpoint(endpoint);
  const key = getApiSportsKey();
  if (!usesBackendProxy && !key) {
    state.liveApi.lastStatus = "فشل تحديث النتائج";
    state.liveApi.lastError = "هذا الرابط يحتاج مفتاح API. استخدم ربط Vercel الرسمي.";
    renderLiveApiTarget(tournament);
    return;
  }
  const quota = getApiSportsQuota();
  if (!usesBackendProxy && quota.count >= 100) {
    state.liveApi.lastStatus = "تم إيقاف التحديث";
    state.liveApi.lastError = "وصلت إلى 100 طلب اليوم";
    renderLiveApiTarget(tournament);
    return;
  }

  state.liveApi.isRefreshing = true;
  state.liveApi.lastStatus = "جاري تحديث النتائج";
  state.liveApi.lastError = "";
  renderLiveApiTarget(tournament);

  try {
    const headers = usesBackendProxy ? {} : { "x-apisports-key": key };
    const response = await fetch(endpoint, { headers });
    if (!usesBackendProxy) incrementApiSportsQuota();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const events = normalizeApiSportsLivePayload(payload);
    const applied = applyLiveResultEvents(tournament, round, events);
    if (applied) queueTournamentPersist(tournament);
    if (tournament && isRoundCompleted(tournament, round)) {
      await refreshTournamentFixturesFromApi(tournament);
      syncTournamentCurrentRound(tournament);
      queueTournamentPersist(tournament);
    }
    state.liveApi.lastEvents = events;
    state.liveApi.lastFetchAt = Date.now();
    state.liveApi.lastStatus = applied
      ? `تم تحديث ${applied} نتيجة/حالة`
      : "تم الاتصال، لا توجد نتيجة أو HT/FT مطابقة حالياً";
    state.liveApi.lastError = "";
  } catch (error) {
    state.liveApi.lastFetchAt = Date.now();
    state.liveApi.lastStatus = "فشل تحديث النتائج";
    state.liveApi.lastError = error.message || "خطأ غير معروف";
  } finally {
    state.liveApi.isRefreshing = false;
  }
  renderLiveApiTarget(tournament);
}

function liveApiEndpoint() {
  const endpoint = state.liveApi.endpoint || "/api/live-results";
  if (window.location.protocol === "file:" && endpoint.startsWith("/api/")) {
    return `https://www.pickaside.mobile${endpoint}`;
  }
  return endpoint;
}

function isBackendProxyEndpoint(endpoint) {
  if (String(endpoint || "").startsWith("/api/")) return true;
  try {
    const url = new URL(endpoint);
    return /(^|\.)pickaside\.mobile$/i.test(url.hostname) && url.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

function renderLiveApiTarget(tournament) {
  if (state.route === "/live") {
    renderLive();
    return;
  }
  if (tournament?.id) renderTournament(tournament.id, { forcePlayer: state.route.endsWith("/player") });
}

function normalizeApiSportsLivePayload(payload) {
  const list = Array.isArray(payload?.response) ? payload.response : [];
  const events = list.map((item) => {
    const fixture = item.fixture || item;
    const teams = item.teams || fixture.teams || {};
    const league = item.league || fixture.league || {};
    const goals = item.goals || fixture.goals || {};
    const score = item.score || fixture.score || {};
    const status = fixture.status || item.status || {};
    const homeName = teams.home?.name || item.home?.name || item.home || "";
    const awayName = teams.away?.name || item.away?.name || item.away || "";
    const homeGoals = goals.home ?? score.fulltime?.home ?? score.halftime?.home ?? item.homeGoals;
    const awayGoals = goals.away ?? score.fulltime?.away ?? score.halftime?.away ?? item.awayGoals;
    return {
      homeName,
      awayName,
      homeLogo: teams.home?.logo || "",
      awayLogo: teams.away?.logo || "",
      leagueName: league.name || "",
      leagueLogo: league.logo || "",
      fixtureId: fixture.id || item.id || "",
      score: homeGoals !== undefined && awayGoals !== undefined ? `${homeGoals} - ${awayGoals}` : "",
      statusShort: status.short || item.statusShort || "",
      statusLong: status.long || item.statusLong || "",
      elapsed: status.elapsed || item.elapsed || "",
      raw: item
    };
  }).filter((event) => event.homeName || event.awayName || event.score || event.statusShort);
  return uniqueLiveEvents(events);
}

function uniqueLiveEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = event.fixtureId
      ? `fixture:${event.fixtureId}`
      : `teams:${normalizeName(event.homeName)}:${normalizeName(event.awayName)}:${event.leagueName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyLiveResultEvents(tournament, round, events) {
  const matches = getTournamentMatches(tournament, round);
  let applied = 0;
  events.forEach((event) => {
    if (!isRelevantResultEvent(event)) return;
    const match = matches.find((item) => isSameFixture(item, event));
    if (!match) return;
    const nextScore = scoreForMatchOrder(match, event) || match.score;
    const nextStatus = event.statusShort || event.statusLong || "";
    const homeIsA = sameTeamName(normalizeName(event.homeName), normalizeName(match.a));
    if (nextScore && nextScore !== match.score) {
      match.score = nextScore;
      applied += 1;
    }
    if (nextStatus && nextStatus !== match.statusShort) {
      match.statusShort = nextStatus;
      match.minute = event.elapsed || match.minute || "";
      applied += 1;
    }
    if (event.homeLogo || event.awayLogo) {
      match.logoA = homeIsA ? event.homeLogo : event.awayLogo;
      match.logoB = homeIsA ? event.awayLogo : event.homeLogo;
    }
    if (event.fixtureId) match.fixtureId = event.fixtureId;
  });
  setTournamentMatches(tournament, round, matches);
  return applied;
}

function scoreForMatchOrder(match, event) {
  if (!event.score) return "";
  const parsedScore = parseMatchScore(event.score);
  if (!parsedScore) return event.score;
  const { home: homeGoals, away: awayGoals } = parsedScore;
  const home = normalizeName(event.homeName);
  const away = normalizeName(event.awayName);
  const a = normalizeName(match.a);
  const b = normalizeName(match.b);
  if (sameTeamName(home, a) && sameTeamName(away, b)) return `${homeGoals} - ${awayGoals}`;
  if (sameTeamName(home, b) && sameTeamName(away, a)) return `${awayGoals} - ${homeGoals}`;
  return event.score;
}

function isRelevantResultEvent(event) {
  const status = String(event.statusShort || "").toUpperCase();
  return Boolean(event.score) || ["HT", "FT", "AET", "PEN"].includes(status);
}

function isSameFixture(match, event) {
  if (match.fixtureId && event.fixtureId && String(match.fixtureId) === String(event.fixtureId)) return true;
  const home = normalizeName(event.homeName);
  const away = normalizeName(event.awayName);
  const a = normalizeName(match.a);
  const b = normalizeName(match.b);
  if (!home && !away) return false;
  return (sameTeamName(home, a) && sameTeamName(away, b))
    || (sameTeamName(home, b) && sameTeamName(away, a));
}

function sameTeamName(left, right) {
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\u0600-\u06ff\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function validatePrediction(tournament, round, key, nextPrediction) {
  if (!nextPrediction.outcome) {
    return "اختر نتيجة المباراة أولاً.";
  }
  const rule = getPointRuleForRound(tournament, round);
  const manualPoints = requiresManualPredictionPoints(rule);
  const points = getPredictionPoints(nextPrediction);
  if (manualPoints && points < (rule.minPoints || tournament.minPoints)) {
    return `الحد الأدنى للتصويت هو ${rule.minPoints || tournament.minPoints} نقطة.`;
  }
  const currentValue = getPredictionPoints(state.predictions[key] || {});
  const nextValue = points;
  const total = getUsedBudget(tournament.id, round) - currentValue + nextValue;
  const roundBudget = getRoundBudgetForPlayer(tournament, round, rule);
  if (manualPoints && total > roundBudget) {
    return `مجموع النقاط ${total} يتخطى ميزانية الدور ${roundBudget}.`;
  }
  return "";
}

function getRoundBudgetForPlayer(tournament, round, rule = getPointRuleForRound(tournament, round), currentBalance = null) {
  if (rule.pointSource === "grant") return Number(rule.budget || tournament.budget || 0);
  if (currentBalance !== null) return Number(currentBalance) || Number(tournament.budget || rule.budget || 0);
  return Number(tournament.points || tournament.budget || rule.budget || 0);
}

function getUsedBudget(tournamentId, round) {
  const prefix = `${tournamentId}:${round}:`;
  return Object.entries(state.predictions)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((sum, [, prediction]) => sum + getPredictionPoints(prediction), 0);
}

function predictionOutcomes(round, match) {
  const outcomes = [
    { value: match.a, text: `فوز ${match.a}`, html: `<span><b>فوز</b>${teamIdentityHtml(match.a)}</span>` }
  ];
  if (isDrawAllowed(round)) {
    outcomes.push({ value: "draw", text: "تعادل", html: `<span><b>تعادل</b><small>بدون فائز</small></span>` });
  }
  outcomes.push({ value: match.b, text: `فوز ${match.b}`, html: `<span><b>فوز</b>${teamIdentityHtml(match.b)}</span>` });
  return outcomes;
}

function isDrawAllowed(round) {
  return round === "group";
}

function getPredictionOutcome(prediction) {
  if (prediction.outcome) return prediction.outcome;
  const legacyEntry = Object.entries(prediction).find(([, value]) => Number(value) > 0);
  return legacyEntry ? legacyEntry[0] : "";
}

function getPredictionPoints(prediction) {
  if (prediction.points !== undefined) return Number(prediction.points) || 0;
  return Object.values(prediction).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function outcomeText(outcome, match) {
  if (outcome === "draw") return "تعادل";
  if (outcome === match.a) return `فوز ${match.a}`;
  if (outcome === match.b) return `فوز ${match.b}`;
  return outcome || "غير محدد";
}

function isPredictionLocked(matches) {
  if (!matches.length) return false;
  const kickoffTimes = matches
    .map((match) => new Date(match.kickoff).getTime())
    .filter(Number.isFinite);
  if (!kickoffTimes.length) return false;
  const firstKickoff = Math.min(...kickoffTimes);
  return Date.now() >= firstKickoff - PREDICTION_LOCK_MINUTES * 60 * 1000;
}

function startMatchCountdowns() {
  updateMatchCountdowns();
  if (document.querySelector("[data-match-countdown]")) {
    countdownTimer = window.setInterval(updateMatchCountdowns, 1000);
  }
}

function stopCountdownTimer() {
  if (!countdownTimer) return;
  window.clearInterval(countdownTimer);
  countdownTimer = null;
}

function updateMatchCountdowns() {
  document.querySelectorAll("[data-match-countdown]").forEach((box) => {
    const kickoff = new Date(box.dataset.kickoff).getTime();
    const lockAt = Number(box.dataset.lockAt) || kickoff - PREDICTION_LOCK_MINUTES * 60 * 1000;
    const resultAt = kickoff + MATCH_RESULT_AFTER_MINUTES * 60 * 1000;
    const score = box.dataset.score || "";
    const mode = box.dataset.countdownMode || "match";
    const now = Date.now();
    const label = box.querySelector("[data-countdown-label]");
    const value = box.querySelector("[data-countdown-value]");
    const lock = box.querySelector("[data-countdown-lock]");

    box.classList.toggle("locked", now >= lockAt);
    const isRoundMode = mode === "round" || mode === "group-matchday";
    box.classList.toggle("live", !isRoundMode && now >= kickoff && now < resultAt);
    box.classList.toggle("finished", !isRoundMode && now >= resultAt);

    if (now < lockAt) {
      label.textContent = mode === "round" ? "ينتهي تصويت الجولة بعد" : mode === "group-matchday" ? "ينتهي تصويت المباراة القادمة بعد" : "ينتهي التصويت بعد";
      value.textContent = formatCountdown(lockAt - now);
      lock.textContent = mode === "round"
        ? `قفل الجولة قبل أول مباراة بـ ${PREDICTION_LOCK_MINUTES} دقيقة`
        : mode === "group-matchday"
          ? `كل مباراة في دور المجموعات تقفل قبل بدايتها بـ ${PREDICTION_LOCK_MINUTES} دقيقة حسب توقيت الإمارات`
          : `قفل هذه المباراة قبل بدايتها بـ ${PREDICTION_LOCK_MINUTES} دقيقة. تبدأ بعد ${formatCountdown(kickoff - now)}`;
      return;
    }

    if (isRoundMode) {
      label.textContent = mode === "group-matchday" ? "تصويت المباراة القادمة مقفل" : "تصويت الجولة مقفل";
      value.textContent = "مغلق";
      lock.textContent = mode === "group-matchday"
        ? "المباريات اللاحقة في نفس دور المجموعات تبقى مفتوحة حتى وقت قفلها."
        : "لا يمكن تعديل توقعات أي مباراة في هذه الجولة بعد القفل.";
      return;
    }

    if (now < kickoff) {
      label.textContent = "التصويت مقفل، تبدأ هذه المباراة بعد";
      value.textContent = formatCountdown(kickoff - now);
      lock.textContent = "أي لاعب لم يرسل توقعه قبل القفل يعتبر خاسراً لنقاطه.";
      return;
    }

    if (now < resultAt) {
      label.textContent = "بدأت المباراة";
      value.textContent = "LIVE";
      lock.textContent = "التوقعات مقفلة، ويتم تحديث النتيجة من الربط الرياضي.";
      return;
    }

    label.textContent = "نتيجة المباراة";
    value.textContent = score || "بانتظار النتيجة";
    lock.textContent = score ? "تم اعتماد النتيجة من الربط الرياضي." : "بانتظار النتيجة النهائية من الربط الرياضي.";
  });
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  return days ? `${days} يوم ${time}` : time;
}

function renderLive() {
  const joinedTournaments = state.tournaments.filter((tournament) => tournament.joined && tournament.active && !tournament.draft && !tournament.cancelled);
  const selectedTournament = joinedTournaments.find((tournament) => tournament.id === state.selectedLiveTournamentId) || joinedTournaments[0] || null;
  if (selectedTournament && state.selectedLiveTournamentId !== selectedTournament.id) {
    state.selectedLiveTournamentId = selectedTournament.id;
  }
  const activeIndex = Math.max(0, joinedTournaments.findIndex((tournament) => tournament.id === selectedTournament?.id));

  app.innerHTML = `
    <div class="main-auto-hide-chrome main-tabs-chrome">
      ${templateTopbar("المباريات الحية")}
      ${joinedTournaments.length ? `
        <div class="championship-segment live-championship-segment" role="tablist" aria-label="بطولات المباشر" style="--tab-count: ${joinedTournaments.length}; --active-index: ${activeIndex};">
          ${joinedTournaments.map((tournament) => `
            <button class="championship-segment-btn live-championship-tab ${selectedTournament && selectedTournament.id === tournament.id ? "active" : ""}" type="button" data-live-tournament="${tournament.id}" role="tab" aria-selected="${selectedTournament && selectedTournament.id === tournament.id}">
              <strong>${tournament.name} ${tournament.rank ? `#${tournament.rank}` : ""}</strong>
            </button>
          `).join("")}
          <span class="championship-segment-indicator" aria-hidden="true"></span>
        </div>
      ` : ""}
    </div>
    <section class="grid">
      ${joinedTournaments.length ? `
        <div class="championship-page-slider live-page-slider" id="live-page-slider" style="--championship-index: ${activeIndex}; --tab-count: ${joinedTournaments.length};">
          <div class="championship-page-track">
            ${joinedTournaments.map((tournament) => {
              const liveRound = getSelectedLiveRound(tournament);
              const liveRoundMatches = getTournamentMatches(tournament, liveRound);
              const liveMatches = getTournamentLiveMatches(tournament, "all");
              const selectedRoundLabel = getTournamentRounds(tournament).find((round) => round.id === liveRound)?.label || "الدور الحالي";
              return `
                <section class="championship-slide" aria-label="${tournament.name}">
                  <div class="card panel live-results-panel">
                    <div class="topbar">
                      <div>
                        <h2 class="section-title">${tournament.name}</h2>
                        <p class="muted">نتائج ${selectedRoundLabel} فقط، بدون احتساب أثرها على التوقعات.</p>
                      </div>
                    </div>
                    ${liveRoundFilterHtml(tournament, liveRound)}
                    ${liveFilterButtonHtml(tournament, liveRound, liveRoundMatches)}
                    ${liveMatches.length ? liveFixtureListHtml(liveMatches) : `<p class="muted empty-row">${liveScopeEmptyText("all")}</p>`}
                  </div>
                </section>
              `;
            }).join("")}
          </div>
        </div>
      ` : `
        <div class="card panel">
          <p class="muted">${tr("أنت غير مشارك في أي بطولة نشطة حالياً. انضم إلى بطولة Public من صفحة Search.")}</p>
          <button class="btn accent" data-route="/search">${tr("Go to Search")}</button>
        </div>
      `}
    </section>
  `;
  scheduleScrollableTabsIntoView();

  document.querySelectorAll("[data-live-tournament]").forEach((button) => {
    button.addEventListener("click", () => {
      setLiveTournament(button.dataset.liveTournament);
    });
  });
  document.querySelectorAll("[data-live-round]").forEach((button) => {
    button.addEventListener("click", () => {
      const tournamentId = button.dataset.liveTournamentId;
      state.selectedLiveRoundByTournament[tournamentId] = button.dataset.liveRound;
      delete state.selectedLiveScopeByTournament[tournamentId];
      saveLocalAppState();
      renderLive();
    });
  });
  document.querySelectorAll("[data-live-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLiveScopeByTournament[button.dataset.liveTournamentId] = button.dataset.liveScope;
      saveLocalAppState();
      renderLive();
    });
  });
  document.querySelectorAll("[data-live-filter-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      const tournament = getTournamentById(button.dataset.liveFilterSheet);
      if (tournament) openLiveFilterSheet(tournament, button.dataset.liveRoundId);
    });
  });
  document.querySelectorAll("[data-live-matchday]").forEach((button) => {
    button.addEventListener("click", () => {
      const tournament = getTournamentById(button.dataset.liveTournamentId) || getTournamentById(state.selectedLiveTournamentId) || selectedTournament;
      if (!tournament) return;
      const round = getSelectedLiveRound(tournament);
      state.selectedLiveMatchdayByTournament[matchdayStateKey(tournament.id, round)] = button.dataset.liveMatchday;
      saveLocalAppState();
      renderLive();
    });
  });
  document.querySelectorAll("[data-live-standings]").forEach((button) => {
    button.addEventListener("click", () => {
      const tournament = getTournamentById(button.dataset.liveStandings);
      if (tournament) openLiveStandingsModal(tournament, button.dataset.liveRoundId);
    });
  });
  setupLiveTournamentSwipe(joinedTournaments);
  setupMainChromeAutoHide(".main-auto-hide-chrome");
  setupLiveAutoRefresh(selectedTournament);
}

function setLiveTournament(tournamentId) {
  state.selectedLiveTournamentId = tournamentId;
  render();
}

function setupLiveAutoRefresh(tournament) {
  stopLiveAutoRefresh();
  if (state.route !== "/live" || !tournament) return;
  const refreshSelected = () => {
    const selected = getTournamentById(state.selectedLiveTournamentId) || tournament;
    if (!selected) return;
    const round = getSelectedLiveRound(selected);
    refreshLiveApiResults(selected, round);
  };
  if (!state.liveApi.lastFetchAt || Date.now() - state.liveApi.lastFetchAt > 4000) {
    window.setTimeout(refreshSelected, 100);
  }
  liveAutoRefreshTimer = window.setInterval(refreshSelected, 5000);
}

function stopLiveAutoRefresh() {
  if (!liveAutoRefreshTimer) return;
  window.clearInterval(liveAutoRefreshTimer);
  liveAutoRefreshTimer = null;
}

function getAdjacentLiveTournament(tournaments, direction) {
  if (!tournaments.length) return "";
  const currentIndex = Math.max(0, tournaments.findIndex((tournament) => tournament.id === state.selectedLiveTournamentId));
  const nextIndex = Math.min(tournaments.length - 1, Math.max(0, currentIndex + direction));
  return tournaments[nextIndex]?.id || tournaments[0].id;
}

function setupLiveTournamentSwipe(tournaments) {
  const slider = document.querySelector("#live-page-slider");
  if (!slider || tournaments.length < 2) return;
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  slider.addEventListener("pointerdown", (event) => {
    if (isInteractiveTarget(event.target) || isScrollableTabGestureTarget(event.target)) return;
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) < 54 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    const direction = deltaX < 0 ? 1 : -1;
    setLiveTournament(getAdjacentLiveTournament(tournaments, direction));
  });

  slider.addEventListener("pointercancel", () => {
    isDragging = false;
  });
}

function getTournamentLiveMatches(tournament, selectedScope = "") {
  const round = getSelectedLiveRound(tournament);
  const allMatches = getTournamentMatches(tournament, round);
  const scope = selectedScope || "all";
  const selectedMatchday = getSelectedLiveMatchdayId(tournament, round, allMatches);
  const visibleMatches = selectedMatchday && selectedMatchday !== "all"
    ? allMatches.filter((match) => getMatchdayIdForMatch(match, allMatches) === selectedMatchday)
    : allMatches;
  const matches = visibleMatches
    .filter((match) => {
      if (scope === "live") return isMatchLive(match);
      if (scope === "today") return isMatchToday(match);
      if (scope === "upcoming") return isFutureMatch(match) && !isMatchLive(match);
      if (scope === "past") return isPastMatch(match);
      return true;
    })
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.kickoff).getTime();
      const bTime = new Date(b.kickoff).getTime();
      const aLive = isMatchLive(a);
      const bLive = isMatchLive(b);
      if (aLive !== bLive) return aLive ? -1 : 1;
      return aTime - bTime;
    });
  return matches.map((match) => {
      const score = match.score || "";
      const minute = match.minute || "";
      const kickoffLabel = formatUaeDate(match.kickoff, { weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
    return {
      ...match,
      tournamentName: tournament.name,
      round,
      minute,
      statusShort: match.statusShort || "",
      score,
      kickoffLabel
    };
  });
}

function liveFixtureListHtml(matches) {
  const groups = [];
  matches.forEach((match) => {
    const key = getLiveMatchSectionKey(match);
    let group = groups.find((item) => item.key === key);
    if (!group) {
      group = { key, label: getLiveMatchSectionLabel(match), matches: [] };
      groups.push(group);
    }
    group.matches.push(match);
  });
  return `
    <div class="live-fixture-list">
      ${groups.map((group) => `
        <section class="live-fixture-group">
          <div class="live-fixture-group-title">${group.label}</div>
          ${group.matches.map(liveFixtureRowHtml).join("")}
        </section>
      `).join("")}
    </div>
  `;
}

function getLiveMatchSectionKey(match) {
  return getMatchGroupLabel(match) || formatUaeDateKey(match.kickoff);
}

function getLiveMatchSectionLabel(match) {
  const groupLabel = getMatchGroupLabel(match);
  if (groupLabel) return groupLabel;
  if (isMatchToday(match)) return "اليوم";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (formatUaeDateKey(match.kickoff) === formatUaeDateKey(tomorrow.toISOString())) return "غداً";
  return formatUaeDate(match.kickoff, { weekday: "short", day: "2-digit", month: "short" });
}

function getMatchGroupLabel(match) {
  const candidates = [
    match.groupName,
    match.groupLabel,
    match.poolName,
    match.apiGroup,
    match.apiRound,
    match.stageLabel
  ].filter(Boolean);
  for (const candidate of candidates) {
    const text = String(candidate);
    const letter = text.match(/group\s+([A-H])\b/i) || text.match(/المجموعة\s*([أ-يA-H])/i);
    if (letter && !/group\s+stage/i.test(text)) return `المجموعة ${letter[1].toUpperCase()}`;
  }
  return "";
}

function liveFixtureRowHtml(match) {
  const final = isMatchFinal(match);
  const live = isMatchLive(match);
  const status = final ? "انتهت" : live ? liveStatusLabel(match.statusShort, match.minute) : "لم تبدأ";
  const centerValue = final || live
    ? match.score || "0 - 0"
    : formatUaeDate(match.kickoff, { hour: "2-digit", minute: "2-digit" });
  const dateLabel = final || live
    ? status
    : formatUaeDate(match.kickoff, { weekday: "short", day: "2-digit", month: "short" });
  return `
    <article class="live-fixture-row">
      <div class="live-fixture-team live-fixture-team-home">
        ${teamIdentityHtml(match.a, "compact", match.logoA || "")}
      </div>
      <div class="live-fixture-center">
        <small>${dateLabel}</small>
        <strong>${centerValue}</strong>
      </div>
      <div class="live-fixture-team live-fixture-team-away">
        ${teamIdentityHtml(match.b, "compact", match.logoB || "")}
      </div>
    </article>
  `;
}

function liveMatchCard(match) {
  const status = match.statusShort ? liveStatusLabel(match.statusShort, match.minute) : match.minute ? `الدقيقة ${match.minute}` : "بانتظار الربط";
  return `
    <article class="match-card live-result-card">
      <div class="match-top">
        <span class="badge">${status}</span>
        <span class="muted live-match-time">${match.kickoffLabel || formatUaeDate(match.kickoff)}</span>
      </div>
      <div class="live-score">
        ${teamIdentityHtml(match.a, "compact", match.logoA || "")}
        <span>${match.score || "—"}</span>
        ${teamIdentityHtml(match.b, "compact", match.logoB || "")}
      </div>
      ${matchRoundMetaHtml(match)}
    </article>
  `;
}

function openLiveStandingsModal(tournament, roundId) {
  const round = roundId || getSelectedLiveRound(tournament);
  const standingGroups = calculateLiveStandingsGroups(tournament, round);
  const roundLabel = getTournamentRounds(tournament).find((item) => item.id === round)?.label || "الدور الحالي";
  openModal(`
    <section class="card modal stack">
      <div class="modal-title-row">
        <h2 class="section-title">ترتيب الفرق</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      <p class="muted">${tournament.name} · ${roundLabel}</p>
      ${standingGroups.length ? standingGroups.map((group) => liveStandingsTableHtml(group)).join("") : `<p class="muted">لا توجد بيانات كافية لحساب الترتيب لهذا الدور حالياً.</p>`}
    </section>
  `);
  document.querySelector("#close-modal")?.addEventListener("click", closeModal);
}

function liveStandingsTableHtml(group) {
  return `
    <div class="live-standings-group">
      <h3>${group.label}</h3>
      <div class="live-standings-table-wrap">
        <table class="live-standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الفريق</th>
              <th>لعب</th>
              <th>ف</th>
              <th>ت</th>
              <th>خ</th>
              <th>+/-</th>
              <th>نقاط</th>
            </tr>
          </thead>
          <tbody>
            ${group.rows.map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${teamIdentityHtml(row.team, "compact", row.logo || "")}</td>
                <td>${row.played}</td>
                <td>${row.won}</td>
                <td>${row.drawn}</td>
                <td>${row.lost}</td>
                <td>${row.goalDifference}</td>
                <td>${row.points}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function calculateLiveStandingsGroups(tournament, round) {
  const matches = getTournamentMatches(tournament, round);
  const grouped = new Map();
  matches.forEach((match) => {
    const groupLabel = getMatchGroupLabel(match) || getTournamentRounds(tournament).find((item) => item.id === round)?.label || "الترتيب";
    if (!grouped.has(groupLabel)) grouped.set(groupLabel, []);
    grouped.get(groupLabel).push(match);
  });
  return [...grouped.entries()]
    .map(([label, groupMatches]) => ({ label, rows: calculateLiveStandingsFromMatches(groupMatches) }))
    .filter((group) => group.rows.length);
}

function calculateLiveStandings(tournament, round) {
  return calculateLiveStandingsFromMatches(getTournamentMatches(tournament, round));
}

function calculateLiveStandingsFromMatches(matches) {
  const rows = new Map();
  const ensureTeam = (name, logo = "") => {
    if (!rows.has(name)) {
      rows.set(name, { team: name, logo, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 });
    } else if (logo && !rows.get(name).logo) {
      rows.get(name).logo = logo;
    }
    return rows.get(name);
  };

  matches.forEach((match) => {
    const home = ensureTeam(match.a, match.logoA || "");
    const away = ensureTeam(match.b, match.logoB || "");
    const score = parseMatchScore(match.score);
    if (!score || (!isMatchFinal(match) && !isPastMatch(match))) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += score.home;
    home.goalsAgainst += score.away;
    away.goalsFor += score.away;
    away.goalsAgainst += score.home;
    if (score.home > score.away) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (score.home < score.away) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  return [...rows.values()].map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst
  })).sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.team.localeCompare(b.team)
  );
}

function parseMatchScore(score) {
  const match = String(score || "").match(/(-?\d+)\s*-\s*(-?\d+)/);
  if (!match) return null;
  const home = Number(match[1]);
  const away = Number(match[2]);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

function getTournamentPredictionMatches(tournament, round) {
  return getTournamentMatches(tournament, round)
    .filter(isPredictableFixtureMatch)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

function liveStatusLabel(status, elapsed = "") {
  const value = String(status || "").toUpperCase();
  if (value === "NS") return "لم تبدأ";
  if (value === "1H") return elapsed ? `الشوط الأول · ${elapsed}` : "الشوط الأول";
  if (value === "2H") return elapsed ? `الشوط الثاني · ${elapsed}` : "الشوط الثاني";
  if (value === "HT") return "نهاية الشوط الأول";
  if (value === "FT") return "نهاية المباراة";
  if (value === "AET") return "نهاية الأشواط الإضافية";
  if (value === "PEN") return "ركلات الترجيح";
  return value;
}

function renderChallenges(type) {
  const labels = {
    created: "التحديات المنشأة",
    joined: "التحديات المنضم إليها",
    drafts: "المسودات",
    history: "الأرشيف"
  };
  const filtered = state.tournaments.filter((item) => {
    if (type === "created") return (item.owner === "سالم" || item.owner === state.currentUser.name) && !item.cancelled;
    if (type === "joined") return item.joined && item.active && !item.cancelled && !item.draft;
    if (type === "drafts") return item.draft;
    if (type === "history") return (!item.active && !item.draft) || item.cancelled;
    return true;
  });

  app.innerHTML = `
    ${templateTopbar(labels[type] || "التحديات")}
    <section class="card panel stack">
      <h1 class="section-title">${labels[type] || "التحديات"}</h1>
      ${filtered.length ? filtered.map((item) => `
        ${type === "drafts" ? `
          <div class="draft-row draft-manage-row">
            <button class="draft-row-main" type="button" data-route="/create-tournament/new">
              <strong>${item.name}</strong>
              <span class="badge">مسودة</span>
            </button>
            <button class="draft-delete-btn" type="button" data-delete-draft="${item.id}" aria-label="حذف المسودة" title="حذف المسودة">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h14"></path>
                <path d="M10 11v6M14 11v6"></path>
                <path d="M8 7l1-3h6l1 3"></path>
                <path d="M7 7l1 13h8l1-13"></path>
              </svg>
            </button>
          </div>
        ` : `
          <button class="draft-row" data-route="${item.draft ? "/create-tournament/new" : `/tournament/${item.id}`}">
            <strong>${item.name}</strong>
            <span class="badge">${item.cancelled ? "ملغية" : item.draft ? "مسودة" : item.active ? "نشطة" : "منتهية"}</span>
          </button>
        `}
      `).join("") : `<p class="muted">لا توجد عناصر حالياً.</p>`}
    </section>
  `;

  if (type === "drafts") {
    document.querySelectorAll("[data-delete-draft]").forEach((button) => {
      button.addEventListener("click", () => confirmDeleteDraft(button.dataset.deleteDraft));
    });
  }
}

function confirmDeleteDraft(tournamentId) {
  const draft = state.tournaments.find((tournament) => tournament.id === tournamentId);
  if (!draft) return;
  openModal(`
    <section class="card modal stack">
      <div class="modal-title-row">
        <h2 class="section-title">حذف المسودة</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      <div class="danger-confirm-body">
        <span class="danger-icon">!</span>
        <div>
          <strong>${draft.name}</strong>
          <p>سيتم حذف هذه المسودة نهائياً من قائمة المسودات.</p>
        </div>
      </div>
      <div class="topbar">
        <button class="btn ghost" type="button" id="cancel-delete-draft">إلغاء</button>
        <button class="btn danger-btn" type="button" id="confirm-delete-draft">حذف المسودة</button>
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#cancel-delete-draft").addEventListener("click", closeModal);
  document.querySelector("#confirm-delete-draft").addEventListener("click", async () => {
    state.tournaments = state.tournaments.filter((tournament) => tournament.id !== tournamentId);
    try {
      localStorage.removeItem(tournamentBackupKey(tournamentId));
    } catch {
      // Ignore local cleanup failures.
    }
    saveLocalAppState();
    try {
      await deleteTournamentFromBackend(tournamentId);
    } catch (error) {
      state.backend.error = error.message || "تعذر حذف المسودة من قاعدة البيانات.";
    }
    closeModal();
    renderChallenges("drafts");
  });
}

function renderUser(username) {
  const user = state.users.find((item) => item.username === username);
  if (!user) return renderNotFoundPage("المستخدم غير موجود", "/search");
  const profile = publicProfileData(user);
  const publicTournaments = publicTournamentsForUser(user);
  app.innerHTML = `
    ${templateTopbar(user.name)}
    <section class="user-profile-stack">
      <section class="panel profile-header readonly-profile">
        <div class="profile-top-row">
          <div class="profile-identity">
            <div class="profile-avatar-ring" aria-label="Profile photo">
              ${avatarHtml(profile)}
            </div>
          </div>
          <div class="profile-summary">
            <div class="profile-bio">
              <h1 class="profile-name">${profile.name}</h1>
              <div class="muted">${profile.handle}</div>
              <div class="muted">${state.language === "en" ? "Favorite team" : "الفريق المفضل"}: ${profile.favoriteTeam || (state.language === "en" ? "Not set" : "غير محدد")}</div>
            </div>
          </div>
        </div>
        <div class="stats-row profile-stats-row">
          <div class="stat-column">
            <strong class="highlight">${profile.accuracy}%</strong>
            <span>Accuracy</span>
          </div>
          <div class="stat-column">
            <strong>${profile.followersCount}</strong>
            <span>Followers</span>
          </div>
          <div class="stat-column">
            <strong>${profile.followingCount}</strong>
            <span>Following</span>
          </div>
        </div>
        <button class="btn ${user.relation === "Unfollow" ? "ghost" : "accent"}" id="profile-follow-btn">
          ${user.relation === "Unfollow" ? "تتابعه" : "متابعة"}
        </button>
      </section>
      ${publicUserTournamentsHtml(publicTournaments)}
    </section>
  `;
  document.querySelector("#profile-follow-btn").addEventListener("click", () => {
    if (state.users.some((item) => item.username === user.username)) {
      toggleFollowUser(user.username, false);
    } else {
      updatePeopleRelation(user.name.split(" ")[0], user.relation === "Unfollow" ? "unfollow" : "follow-back");
    }
    renderUser(user.username);
  });
  document.querySelectorAll("[data-profile-join-tournament]").forEach((button) => {
    button.addEventListener("click", () => {
      joinTournament(button.dataset.profileJoinTournament);
      renderUser(user.username);
    });
  });
}

function publicTournamentsForUser(user) {
  return state.tournaments.filter((tournament) => {
    if (!tournament.public) return false;
    return tournament.ownerUsername === user.username || String(tournament.owner).toLowerCase() === user.name.split(" ")[0].toLowerCase();
  });
}

function publicUserTournamentsHtml(tournaments) {
  if (!tournaments.length) return "";
  return `
    <section class="panel public-profile-tournaments">
      <div class="section-row">
        <h2 class="section-title">البطولات العامة</h2>
        <span class="muted">${tournaments.length}</span>
      </div>
      <div class="list-grid">
        ${tournaments.map(publicProfileTournamentCard).join("")}
      </div>
    </section>
  `;
}

function publicProfileTournamentCard(tournament) {
  const hasStarted = tournament.active;
  const participants = tournament.participants || [];
  const leaderName = tournament.leaderName || leaderboardData(tournament)[0]?.name || "غير محدد";
  return `
    <article class="public-tournament-card">
      <button class="public-tournament-main" data-route="/tournament/${tournament.id}">
        <span>
          <strong>${tournament.name}</strong>
          <small>${tournament.publicCode || "PUBLIC"} · ${tournament.friends || participants.length || 0} مشارك</small>
        </span>
        <b class="badge">${hasStarted ? "بدأت" : "لم تبدأ"}</b>
      </button>
      <div class="public-tournament-meta">
        <span>المتصدر: <strong>${hasStarted ? leaderName : "يظهر بعد البداية"}</strong></span>
        <span>المشاركون: <strong>${participants.slice(0, 4).join("، ") || "بانتظار المشاركين"}</strong></span>
      </div>
      ${hasStarted ? `
        <button class="btn ghost compact-btn" data-route="/tournament/${tournament.id}">عرض التفاصيل</button>
      ` : `
        <button class="btn accent compact-btn" data-profile-join-tournament="${tournament.id}" ${tournament.joined ? "disabled" : ""}>
          ${tournament.joined ? "تم الانضمام" : "المشاركة"}
        </button>
      `}
    </article>
  `;
}

function publicProfileData(user) {
  return {
    ...user,
    avatar: user.avatar || user.name.charAt(0),
    avatarUrl: user.avatarUrl || "",
    accuracy: user.accuracy || 0,
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    favoriteTeam: user.favoriteTeam || ""
  };
}

function toDisplayName(username) {
  return username
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "User";
}

function renderNotFound() {
  app.innerHTML = `
    ${templateTopbar()}
    <section class="card panel stack">
      <h1 class="section-title">الصفحة غير موجودة</h1>
      <button class="btn accent" data-route="/">العودة للرئيسية</button>
    </section>
  `;
}

function renderNotFoundPage(title = "الصفحة غير موجودة", route = "/") {
  app.innerHTML = `
    ${templateTopbar()}
    <section class="card panel stack">
      <h1 class="section-title">${title}</h1>
      <p class="muted">لا توجد بيانات حقيقية مرتبطة بهذا الرابط حالياً.</p>
      <button class="btn accent" data-route="${route}">الانتقال للصفحة المناسبة</button>
    </section>
  `;
}

function peopleModal(kind) {
  const title = kind === "followers" ? tr("Followers") : tr("Following");
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">${title}</h2>
        ${modalCloseButton()}
      </div>
      <div class="people-list" id="people-list">
        ${peopleListHtml(kind)}
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#people-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-people-action]");
    if (!button) return;
    updatePeopleRelation(button.dataset.personName, button.dataset.peopleAction);
    document.querySelector("#people-list").innerHTML = peopleListHtml(kind);
    updateProfileCounters();
  });
}

function modalCloseButton() {
  return `<button class="btn ghost modal-close-btn" type="button" id="close-modal" aria-label="${tr("Close")}" title="${tr("Close")}">×</button>`;
}

function peopleListHtml(kind) {
  const people = kind === "followers" ? state.currentUser.followers : state.currentUser.following;
  if (!people.length) return `<p class="muted">${tr("لا توجد أسماء حالياً.")}</p>`;

  return people.map((name) => {
    const isFollowing = isFollowingPerson(name);
    const profile = getPersonProfile(name);
    const action = kind === "following" || isFollowing ? "unfollow" : "follow-back";
    const label = action === "unfollow" ? tr("Unfollow") : tr("Follow back");
    return `
      <div class="leader-row people-row">
        <button class="user-row-main" data-route="/user/${profile.username}">
          <span class="mini-avatar">${name[0]}</span>
          <span>
            <strong>${profile.name}</strong>
            <small>${profile.handle}</small>
          </span>
        </button>
        <button class="btn compact-btn ${action === "unfollow" ? "ghost" : "accent"}" data-people-action="${action}" data-person-name="${name}">
          ${label}
        </button>
      </div>
    `;
  }).join("");
}

function updatePeopleRelation(name, action) {
  if (action === "follow-back") {
    state.currentUser.following = [...new Set([...state.currentUser.following, name])];
    syncUserRelation(name, "Unfollow");
    saveLocalAppState();
    return;
  }

  state.currentUser.following = state.currentUser.following.filter((item) => item !== name);
  syncUserRelation(name, "Follow back");
  saveLocalAppState();
}

function isFollowingPerson(name) {
  return state.currentUser.following.includes(name);
}

function getPersonProfile(name) {
  const user = state.users.find((item) => item.name.split(" ")[0] === name || item.username === name.toLowerCase());
  return user || {
    name,
    username: name.toLowerCase(),
    handle: `@${name.toLowerCase()}`
  };
}

function syncUserRelation(name, relation) {
  const user = state.users.find((item) => item.name.split(" ")[0] === name || item.username === name.toLowerCase());
  if (user) user.relation = relation;
}

function updateProfileCounters() {
  const followerCount = document.querySelector("#followers-btn strong");
  const followingCount = document.querySelector("#following-btn strong");
  if (followerCount) followerCount.textContent = state.currentUser.followers.length;
  if (followingCount) followingCount.textContent = state.currentUser.following.length;
}

function editProfileModal() {
  const user = state.currentUser;
  let selectedAvatarUrl = user.avatarUrl || "";
  openModal(`
    <form class="card modal stack" id="edit-profile-form">
      <div class="topbar">
        <h2 class="section-title">${tr("Edit Profile")}</h2>
        ${modalCloseButton()}
      </div>
      <div class="profile-edit-preview">
        <label class="avatar-upload" for="profile-photo" aria-label="${tr("Choose image")}" title="${tr("Choose image")}">
          ${avatarHtml(user, "avatar-preview")}
          <span aria-hidden="true">+</span>
        </label>
        <input class="sr-only-file" id="profile-photo" type="file" accept="image/*">
        <div>
          <strong>${user.name}</strong>
          <div class="muted">${user.handle}</div>
        </div>
      </div>
      <div class="field">
        <label>الاسم الظاهر</label>
        <input class="input" id="profile-name" required value="${user.name}">
      </div>
      <div class="field">
        <label>اسم المستخدم</label>
        <input class="input" id="profile-handle" required value="${user.handle}">
      </div>
      <div class="field">
        <label>رقم الهاتف</label>
        <input class="input" id="profile-phone" type="tel" autocomplete="tel" inputmode="tel" required value="${user.phone || ""}">
      </div>
      <div class="field">
        <label>الدولة / التوقيت</label>
        ${timezoneSelectHtml("profile-timezone", user.timezone)}
      </div>
      <div class="field">
        <label>الفريق المفضل</label>
        <input class="input" id="profile-team" value="${user.favoriteTeam || ""}">
      </div>
      <div class="error-text" id="profile-error"></div>
      <div class="topbar">
        <button class="btn ghost" type="button" id="cancel-profile">${tr("Cancel")}</button>
        <button class="btn accent" type="submit">${tr("Save Changes")}</button>
      </div>
    </form>
  `);

  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#cancel-profile").addEventListener("click", closeModal);
  document.querySelector("#profile-photo").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      document.querySelector("#profile-error").textContent = tr("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      selectedAvatarUrl = String(reader.result || "");
      document.querySelector("#avatar-preview").innerHTML = `<img src="${selectedAvatarUrl}" alt="">`;
      document.querySelector("#profile-error").textContent = "";
    });
    reader.readAsDataURL(file);
  });
  document.querySelector("#edit-profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector("#profile-name").value.trim();
    let handle = document.querySelector("#profile-handle").value.trim();
    const phone = document.querySelector("#profile-phone").value.trim();
    const timezone = normalizeTimezone(document.querySelector("#profile-timezone").value);
    const favoriteTeam = document.querySelector("#profile-team").value.trim();

    if (!name || !handle || !phone) {
      document.querySelector("#profile-error").textContent = "الاسم واسم المستخدم ورقم الهاتف مطلوبة.";
      return;
    }
    if (!handle.startsWith("@")) handle = `@${handle}`;
    if (!/^@[A-Za-z0-9_]{3,20}$/.test(handle)) {
      document.querySelector("#profile-error").textContent = tr("Username must be 3-20 letters, numbers, or underscores.");
      return;
    }

    const nextUser = {
      ...state.currentUser,
      name,
      handle,
      phone,
      avatar: name[0],
      avatarUrl: selectedAvatarUrl,
      favoriteTeam,
      ...timezoneState(timezone)
    };
    try {
      if (isBackendReady()) {
        await state.backend.client.auth.updateUser({ data: { timezone } }).catch(() => {});
        const username = handle.replace("@", "");
        const payload = {
          username,
          display_name: name,
          phone_number: phone,
          avatar_url: selectedAvatarUrl,
          favorite_team: favoriteTeam,
          updated_at: new Date().toISOString()
        };
        let { error } = await state.backend.client
          .from("profiles")
          .update(payload)
          .eq("id", state.backend.session.user.id);
        if (isMissingPhoneColumnError(error)) {
          const { phone_number, ...fallbackPayload } = payload;
          const fallback = await state.backend.client
            .from("profiles")
            .update(fallbackPayload)
            .eq("id", state.backend.session.user.id);
          error = fallback.error;
        }
        if (error) throw error;
      }
      state.currentUser = nextUser;
      saveLocalAppState();
      closeModal();
      render();
    } catch (error) {
      document.querySelector("#profile-error").textContent = error.message || "تعذر حفظ الملف الشخصي.";
    }
  });
}

async function shareProfile() {
  const user = state.currentUser;
  const username = user.handle.replace("@", "");
  const baseUrl = window.location.href.split("#")[0];
  const profileUrl = `${baseUrl}#/user/${username}`;
  const shareText = `${user.name} on Pick A Side`;

  try {
    if (navigator.share) {
      await navigator.share({ title: shareText, text: shareText, url: profileUrl });
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(profileUrl);
      profileShareModal(profileUrl, tr("Profile link copied."));
      return;
    }
  } catch {
    // Fall back to showing the link below.
  }

  profileShareModal(profileUrl, tr("Copy this profile link."));
}

function profileShareModal(profileUrl, message) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">${tr("Share Profile")}</h2>
        ${modalCloseButton()}
      </div>
      <p class="muted">${message}</p>
      <input class="input" readonly value="${profileUrl}">
      <button class="btn accent" id="copy-profile-link">${tr("Copy Link")}</button>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#copy-profile-link").addEventListener("click", async () => {
    if (navigator.clipboard) await navigator.clipboard.writeText(profileUrl);
  });
}

function profileSettingsModal() {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">${tr("Profile Settings")}</h2>
        ${modalCloseButton()}
      </div>
      <div class="settings-list">
        <div class="settings-row language-settings-row">
          <span>${tr("Language")}</span>
          ${languageToggle()}
        </div>
        <div class="settings-row theme-settings-row">
          <span>${tr("Theme")}</span>
          ${themeToggle()}
        </div>
        <button class="settings-row" id="settings-notifications">
          <span>${tr("Notification Settings")}</span>
          <strong>›</strong>
        </button>
        <button class="settings-row" id="settings-edit-profile">
          <span>${tr("Edit profile details")}</span>
          <strong>›</strong>
        </button>
        <button class="settings-row" id="settings-share-profile">
          <span>${tr("Share profile")}</span>
          <strong>›</strong>
        </button>
        <button class="settings-row" id="settings-history">
          <span>${tr("History")}</span>
          <strong>›</strong>
        </button>
        <button class="settings-row danger-row" id="settings-logout">
          <span>${tr("Logout")}</span>
          <strong>›</strong>
        </button>
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#settings-notifications").addEventListener("click", notificationSettingsModal);
  document.querySelector("#settings-edit-profile").addEventListener("click", editProfileModal);
  document.querySelector("#settings-share-profile").addEventListener("click", shareProfile);
  document.querySelector("#settings-history").addEventListener("click", () => {
    closeModal();
    navigate("/challenges/history");
  });
  document.querySelector("#settings-logout").addEventListener("click", () => {
    closeModal();
    navigate("/login");
  });
}

function leaderboardRows(tournament, options = {}) {
  const rows = leaderboardData(tournament, options);
  const visibleRows = options.limit ? rows.slice(0, options.limit) : rows;
  return visibleRows.map((row, index) => `
    <div class="leader-row leaderboard-entry ${row.name === state.currentUser.name ? "current-user-row" : ""}">
      <div class="leader-main">
        <span class="leader-rank">#${index + 1}</span>
        <span class="leader-name">${row.name}</span>
      </div>
      <div class="leader-stats" aria-label="Prediction stats">
        <span class="total">${row.total} تصويت</span>
        <span class="correct">${row.correct} صحيح</span>
        <span class="wrong">${row.wrong} خاطئ</span>
        ${row.liveDelta ? `<span class="live-delta ${row.liveDelta > 0 ? "up" : "down"}">${row.liveDelta > 0 ? "+" : ""}${row.liveDelta}</span>` : ""}
        <strong>${row.points} نقطة</strong>
      </div>
    </div>
  `);
}

function leaderboardData(tournament, options = {}) {
  const settledRows = settleTournamentLeaderboard(tournament, options);
  const liveImpacts = options.live ? liveLeaderboardImpacts(tournament, options.round) : {};
  return settledRows.map((row, index) => {
    const liveDelta = liveImpacts[index] || 0;
    return { ...row, liveDelta, points: row.points + liveDelta, total: row.correct + row.wrong };
  }).sort((a, b) => b.points - a.points);
}

function settleTournamentLeaderboard(tournament) {
  const participants = getTournamentParticipants(tournament);
  const rows = participants.map((name, index) => ({
    id: participantId(name),
    name,
    seedIndex: index,
    points: 0,
    correct: 0,
    wrong: 0
  }));
  const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
  const tournamentRounds = getTournamentRounds(tournament);
  const rules = getTournamentPointRules(tournament);

  tournamentRounds.forEach((round, roundIndex) => {
    const rule = rules[round.id];
    const matches = getTournamentMatches(tournament, round.id).filter((match) => getMatchResultOutcome(match, round.id));
    if (!matches.length) return;
    if (roundIndex === 0 && rule.pointSource === "carry") rule.pointSource = "grant";
    if (rule.pointSource === "grant") {
      rows.forEach((row) => {
        row.points += Number(rule.budget || tournament.budget || 0);
      });
    } else if (rule.pointSource !== "league") {
      rows.forEach((row) => {
        if (row.points <= 0) row.points = Number(tournament.budget || rule.budget || 0);
      });
    }

    const roundStartBalances = Object.fromEntries(rows.map((row) => [row.id, row.points]));
    matches.forEach((match, matchIndex) => {
      const winner = getMatchResultOutcome(match, round.id);
      if (!winner) return;
      const predictions = rows.map((row) => simulatedParticipantPrediction(tournament, round.id, match, rule, row, matchIndex, matches.length, roundStartBalances[row.id]));
      settleMatchByRule(byId, predictions, winner, rule, match, matches.length, roundStartBalances);
    });
  });

  if (!tournamentRounds.some((round) => getTournamentMatches(tournament, round.id).some((match) => getMatchResultOutcome(match, round.id)))) {
    return rows.map((row) => ({
      ...row,
      points: Math.round(row.points)
    }));
  }

  return rows.map((row) => ({
    ...row,
    points: Math.round(row.points)
  }));
}

function participantId(name) {
  return normalizeName(name).replace(/\s+/g, "-") || "player";
}

function getMatchResultOutcome(match, round) {
  const score = parseMatchScore(match.score);
  if (!score) return "";
  const { home: homeGoals, away: awayGoals } = score;
  if (homeGoals === awayGoals) return isDrawAllowed(round) ? "draw" : "";
  return homeGoals > awayGoals ? match.a : match.b;
}

function simulatedParticipantPrediction(tournament, round, match, rule, row, matchIndex, matchCount, roundStartBalance) {
  const key = `${tournament.id}:${round}:${match.id}`;
  const actual = row.name === state.currentUser.name ? state.predictions[key] : null;
  const outcome = actual ? getPredictionOutcome(actual) : "";
  const points = actual ? getPredictionPoints(actual) : 0;
  return {
    userId: row.id,
    outcome,
    points: Math.max(0, Number(points) || 0),
    submitted: Boolean(outcome),
    joker: Boolean(actual?.joker)
  };
}

function getRuleStakeForOutcome(tournament, round, match, outcome, rule, matchCount, roundStartBalance) {
  if (rule.pointSource === "league") return 0;
  if (rule.nominationType === "points" && rule.pointsMode === "fixed") {
    if (outcome === "draw") return Math.round(getFixedMatchPointTotal(rule) / 2);
    return getFixedMatchWinnerPoints(rule);
  }
  const budget = getRoundBudgetForPlayer(tournament, round, rule, roundStartBalance);
  const perMatch = budget / Math.max(1, matchCount);
  if (rule.nominationType === "percent") {
    if (rule.percentMode === "fixed") {
      const pct = outcome === "draw" ? 50 : getFixedPercentWinnerShare(rule);
      return Math.round(perMatch * (pct / 100));
    }
    return Math.round(perMatch);
  }
  return Math.max(Number(rule.minPoints || tournament.minPoints || 1), Math.round(perMatch));
}

function settleMatchByRule(rowsById, predictions, winningOutcome, rule, match, matchCount, roundStartBalances) {
  if (rule.pointSource === "league") {
    predictions.forEach((prediction) => {
      const row = rowsById[prediction.userId];
      const correct = prediction.outcome === winningOutcome;
      row.points += correct ? Number(rule.correctPoints || 10) : Number(rule.wrongPoints || 0);
      if (correct) row.correct += 1;
      else row.wrong += 1;
    });
    return;
  }

  const winners = predictions.filter((prediction) => prediction.submitted && prediction.outcome === winningOutcome);
  const losers = predictions.filter((prediction) => !prediction.submitted || prediction.outcome !== winningOutcome);
  const noPickPool = predictions
    .filter((prediction) => !prediction.submitted)
    .reduce((sum, prediction) => sum + getNoPickForfeit(roundStartBalances[prediction.userId], matchCount), 0);
  const loserPool = losers.reduce((sum, prediction) => sum + (prediction.submitted ? prediction.points : 0), 0) + noPickPool;
  const winnerStake = winners.reduce((sum, prediction) => sum + prediction.points, 0);

  losers.forEach((prediction) => {
    const row = rowsById[prediction.userId];
    row.points -= prediction.submitted ? prediction.points : getNoPickForfeit(roundStartBalances[prediction.userId], matchCount);
    row.wrong += 1;
  });

  winners.forEach((prediction) => {
    const row = rowsById[prediction.userId];
    let share = 0;
    if (rule.settlement === "loser-pool-equal") {
      share = winners.length ? loserPool / winners.length : 0;
    } else if (rule.settlement === "loser-pool-ratio") {
      share = winnerStake ? (prediction.points / winnerStake) * loserPool : 0;
    }
    const jokerMultiplier = prediction.joker ? 2 : 1;
    row.points += share * jokerMultiplier;
    row.correct += 1;
  });
}

function getNoPickForfeit(roundStartBalance, matchCount) {
  return Math.round((Number(roundStartBalance) || 0) / Math.max(1, matchCount));
}

function exportLeaderboardPdf(tournament) {
  const rows = leaderboardData(tournament);
  const tournamentName = tournament.name || "Pick A Side";
  const generatedAt = new Date().toLocaleString("ar-AE", { hour12: false });
  const tableRows = rows.map((row, index) => `
    <tr>
      <td>#${index + 1}</td>
      <td>${escapePrintable(row.name)}</td>
      <td>${row.points}</td>
      <td>${row.correct}</td>
      <td>${row.wrong}</td>
      <td>${row.total}</td>
    </tr>
  `).join("");
  const printableHtml = `
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${escapePrintable(tournamentName)} - ترتيب المشاركين</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 32px; font-family: Arial, sans-serif; color: #111; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 0 0 22px; color: #555; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td { padding: 12px; border: 1px solid #ddd; text-align: center; }
          th { background: #f1f3f5; font-weight: 700; }
          td:nth-child(2) { text-align: start; font-weight: 700; }
          @media print { body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <h1>${escapePrintable(tournamentName)} - ترتيب المشاركين</h1>
        <p>تم إنشاء الجدول: ${generatedAt}</p>
        <table>
          <thead>
            <tr>
              <th>الترتيب</th>
              <th>المشارك</th>
              <th>النقاط</th>
              <th>صحيح</th>
              <th>خاطئ</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;
  const pdfWindow = window.open("", "_blank", "width=900,height=700");
  if (!pdfWindow) {
    openModal(`
      <section class="card modal stack">
        <div class="modal-title-row">
          <h2 class="section-title">تعذر فتح ملف PDF</h2>
          <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
        </div>
        <p class="muted">اسمح بفتح النوافذ المنبثقة من المتصفح ثم حاول مرة أخرى.</p>
      </section>
    `);
    document.querySelector("#close-modal").addEventListener("click", closeModal);
    return;
  }
  pdfWindow.document.write(printableHtml);
  pdfWindow.document.close();
  pdfWindow.focus();
  setTimeout(() => pdfWindow.print(), 250);
}

function escapePrintable(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function liveLeaderboardImpacts(tournament, round) {
  return {};
}

function leaderboardModal(tournament) {
  openModal(`
    <section class="card modal stack full-leaderboard-modal">
      <div class="modal-title-row">
        <h2 class="section-title">الجدول الكامل</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      <p class="muted">يعرض النقاط الحالية وعدد الترشيحات الصحيحة والخاطئة لكل مشارك.</p>
      <div class="leaderboard-list">
        ${leaderboardRows(tournament).join("")}
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
}

function calculateJackpot(predictions, winningTeam, participants = [], roundBudget = 0) {
  const submittedUserIds = new Set(predictions.map((prediction) => prediction.userId));
  const forfeitedParticipants = participants.filter((participant) => !submittedUserIds.has(participant.userId));
  const noPickForfeitPool = forfeitedParticipants.reduce((sum, participant) => sum + (participant.roundBudget ?? roundBudget), 0);
  const losersPool = predictions
    .filter((prediction) => prediction.team !== winningTeam)
    .reduce((sum, prediction) => sum + prediction.points, 0);
  const jackpotPool = losersPool + noPickForfeitPool;
  const winners = predictions.filter((prediction) => prediction.team === winningTeam);
  const winnerStake = winners.reduce((sum, prediction) => sum + prediction.points, 0);

  return {
    jackpotPool,
    noPickForfeitPool,
    winners: winners.map((winner) => {
      const jackpotShare = winnerStake ? Math.round((winner.points / winnerStake) * jackpotPool) : 0;
      return {
        userId: winner.userId,
        returnedStake: winner.points,
        jackpotShare,
        newPoints: winner.points + jackpotShare
      };
    }),
    forfeits: forfeitedParticipants.map((participant) => ({
      userId: participant.userId,
      lostPoints: participant.roundBudget ?? roundBudget,
      reason: "no_pick_before_lock"
    }))
  };
}

function openModal(html) {
  modalRoot.innerHTML = `<div class="modal-backdrop">${html}</div>`;
  applyTranslations(modalRoot);
  modalRoot.querySelector(".modal-backdrop").addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) closeModal();
  });
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function generateInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function formatDate(value) {
  return new Intl.DateTimeFormat(state.language === "en" ? "en-AE" : "ar-AE", {
    timeZone: normalizeTimezone(state.currentUser.timezone),
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function formatUaeDate(value, options = {}) {
  return new Intl.DateTimeFormat(state.language === "en" ? "en-AE" : "ar-AE", {
    timeZone: normalizeTimezone(state.currentUser.timezone),
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    ...options
  }).format(new Date(value));
}

loadLocalAppState();
applyAppPreferences();

if (["127.0.0.1", "localhost"].includes(window.location.hostname)) {
  cleanupLocalServiceWorker();
}

if ("serviceWorker" in navigator && window.location.protocol !== "file:" && !["127.0.0.1", "localhost"].includes(window.location.hostname)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Local file previews and restricted browsers can block service workers.
    });
  });
}

initializeBackend().finally(render);

function cleanupLocalServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if (navigator.serviceWorker.controller && !sessionStorage.getItem("sw-cleaned")) {
        sessionStorage.setItem("sw-cleaned", "true");
        window.location.reload();
      }
    } catch {
      // Local cleanup should never block the app.
    }
  });
}
