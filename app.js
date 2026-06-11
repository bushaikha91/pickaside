const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");

const state = {
  selectedChampionshipsTab: "mine",
  selectedPointRuleRound: "",
  currentUser: {
    name: "Salem Al Mansoori",
    handle: "@salem",
    avatar: "س",
    avatarUrl: "",
    favoriteTeam: "Al Ain",
    correctPredictions: 42,
    totalPredictions: 58,
    followers: ["Noura", "Ali", "Maryam", "Khaled"],
    following: ["Rashed", "Hind", "Fahad"]
  },
  users: [
    { name: "Noura Al Shamsi", username: "noura", handle: "@noura", relation: "Follow back" },
    { name: "Ali Al Ketbi", username: "ali", handle: "@ali", relation: "Unfollow" },
    { name: "Maryam Al Hashemi", username: "maryam", handle: "@maryam", relation: "Unfollow" },
    { name: "Khaled Al Suwaidi", username: "khaled", handle: "@khaled", relation: "Follow back" }
  ],
  tournaments: [
    {
      id: "uae-cup",
      name: "Champions League",
      public: true,
      publicCode: "CL2026",
      active: true,
      joined: true,
      owner: "Salem",
      rank: 2,
      friends: 14,
      points: 1180,
      correct: 8,
      wrong: 3,
      budget: 400,
      minPoints: 20,
      startingRound: "group",
      currentRound: "group",
      awardCategories: ["best-player", "top-scorer"]
    },
    {
      id: "world-night",
      name: "Weekend Derby",
      public: true,
      publicCode: "DERBY",
      active: true,
      joined: true,
      owner: "Ali",
      rank: 5,
      friends: 22,
      points: 940,
      correct: 6,
      wrong: 5,
      budget: 350,
      minPoints: 15,
      startingRound: "round16",
      currentRound: "quarter",
      awardCategories: []
    },
    {
      id: "ali-open-picks",
      name: "Ali Open Picks",
      public: true,
      publicCode: "ALI777",
      active: false,
      joined: false,
      owner: "Ali",
      ownerUsername: "ali",
      rank: null,
      friends: 11,
      participants: ["Ali", "Hind", "Fahad"],
      leaderName: "",
      leaderPoints: 0,
      points: 0,
      budget: 250,
      minPoints: 10,
      startingRound: "round16",
      currentRound: "round16",
      awardCategories: []
    },
    {
      id: "maryam-active-cup",
      name: "Maryam Active Cup",
      public: true,
      publicCode: "MARYAM",
      active: true,
      joined: false,
      owner: "Maryam",
      ownerUsername: "maryam",
      rank: null,
      friends: 19,
      participants: ["Maryam", "Noura", "Ali", "Khaled"],
      leaderName: "Noura",
      leaderPoints: 980,
      points: 0,
      budget: 350,
      minPoints: 15,
      startingRound: "group",
      currentRound: "group",
      awardCategories: ["top-scorer"]
    },
    {
      id: "noura-open-cup",
      name: "Noura Open Cup",
      public: true,
      publicCode: "NOURA",
      active: false,
      joined: false,
      owner: "Noura",
      ownerUsername: "noura",
      rank: null,
      friends: 18,
      participants: ["Noura", "Hind", "Fahad", "Rashed"],
      leaderName: "Hind",
      leaderPoints: 0,
      points: 0,
      budget: 300,
      minPoints: 10,
      startingRound: "round16",
      currentRound: "round16",
      awardCategories: []
    },
    {
      id: "noura-live-league",
      name: "Noura Live League",
      public: true,
      publicCode: "LIVE9",
      active: true,
      joined: false,
      owner: "Noura",
      ownerUsername: "noura",
      rank: null,
      friends: 26,
      participants: ["Noura", "Ali", "Maryam", "Khaled", "Salem"],
      leaderName: "Ali",
      leaderPoints: 1260,
      points: 0,
      budget: 400,
      minPoints: 20,
      startingRound: "group",
      currentRound: "group",
      awardCategories: ["champion-pick"]
    },
    {
      id: "draft-001",
      name: "Private Friends Cup",
      public: false,
      active: false,
      draft: true,
      joined: false,
      owner: "Salem",
      inviteCode: "K7M2QZ",
      awardCategories: []
    }
  ],
  matches: {
    group: [
      { id: "g1", kickoff: "2026-06-06T18:00:00+04:00", a: "العين", b: "النصر", score: "2 - 1" },
      { id: "g2", kickoff: "2026-06-06T20:00:00+04:00", a: "الهلال", b: "الوصل", score: "1 - 1" },
      { id: "g3", kickoff: "2026-06-07T18:30:00+04:00", a: "الاتحاد", b: "الشارقة", score: "0 - 2" },
      { id: "g4", kickoff: "2026-06-07T21:00:00+04:00", a: "الأهلي", b: "الوحدة", score: "3 - 2" }
    ],
    round16: [
      { id: "m1", kickoff: "2026-06-06T21:00:00+04:00", a: "الهلال", b: "النصر", score: "2 - 0" },
      { id: "m2", kickoff: "2026-06-06T23:00:00+04:00", a: "العين", b: "الوصل", score: "1 - 0" },
      { id: "m3", kickoff: "2026-06-07T20:00:00+04:00", a: "الاتحاد", b: "الأهلي", score: "2 - 3" },
      { id: "m4", kickoff: "2026-06-07T22:30:00+04:00", a: "الشارقة", b: "الوحدة", score: "1 - 2" }
    ],
    quarter: [
      { id: "q1", kickoff: "2026-06-10T21:00:00+04:00", a: "الفائز 1", b: "الفائز 2", score: null },
      { id: "q2", kickoff: "2026-06-10T23:00:00+04:00", a: "الفائز 3", b: "الفائز 4", score: null }
    ],
    semi: [],
    final: []
  },
  liveMatches: [
    { league: "AFC Champions", minute: "67", home: "الهلال", away: "العين", score: "2 - 1", impact: "+80 محتملة" },
    { league: "UAE Pro League", minute: "52", home: "الوصل", away: "النصر", score: "0 - 0", impact: "قيد الانتظار" },
    { league: "Club Cup", minute: "83", home: "الأهلي", away: "الاتحاد", score: "1 - 3", impact: "-45 حالياً" }
  ],
  predictions: {},
  quickPicks: {},
  predictionErrors: {},
  awardPicks: {},
  awardSearchQueries: {},
  notifications: [
    {
      id: "n-join-request",
      type: "join-request",
      title: "طلب انضمام",
      body: "راشد يريد دخول Private Friends Cup",
      time: "الآن",
      icon: "user",
      unread: true,
      route: "/challenges/created",
      requesterName: "Rashed",
      requesterHandle: "@rashed",
      tournamentId: "draft-001",
      tournamentName: "Private Friends Cup",
      status: "pending"
    },
    {
      id: "n-tournament-invite",
      type: "tournament-invite",
      title: "دعوة بطولة",
      body: "علي دعاك إلى Weekend Derby",
      time: "الآن",
      icon: "trophy",
      unread: true,
      route: "/tournament/world-night",
      inviterName: "Ali",
      tournamentId: "world-night",
      tournamentName: "Weekend Derby",
      status: "pending"
    },
    {
      id: "n-lock",
      title: "توقعاتك تقفل قريباً",
      body: "باقي وقت قصير على Champions League",
      time: "الآن",
      icon: "clock",
      unread: true,
      route: "/tournament/uae-cup"
    },
    {
      id: "n-round",
      title: "فتح الدور التالي",
      body: "ربع النهائي جاهز للتوقع",
      time: "قبل 12 د",
      icon: "trophy",
      unread: true,
      route: "/tournament/world-night"
    },
    {
      id: "n-follow",
      type: "follow",
      title: "نورة تابعتك",
      body: "",
      time: "اليوم",
      icon: "user",
      unread: false,
      route: "/user/noura",
      followerName: "Noura",
      followerUsername: "noura",
      status: "pending"
    }
  ],
  notificationPreferences: {
    invites: true,
    joinRequests: true,
    tournamentUpdates: true,
    social: true
  },
  selectedLiveTournamentId: "",
  competitionSearchQuery: "",
  selectedCompetitionId: "",
  liveApi: {
    endpoint: "https://v3.football.api-sports.io/odds/live",
    lastFetchAt: 0,
    lastStatus: "لم يتم الربط بعد",
    lastError: "",
    lastEvents: []
  },
  language: "ar",
  theme: "dark",
  route: getInitialRoute()
};

const rounds = [
  { id: "group", label: "دور المجموعات" },
  { id: "round16", label: "دور 16" },
  { id: "quarter", label: "ربع النهائي" },
  { id: "semi", label: "نصف النهائي" },
  { id: "final", label: "النهائي" }
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
    "راشد يريد دخول Private Friends Cup": "Rashed wants to join Private Friends Cup",
    "توقعاتك تقفل قريباً": "Predictions close soon",
    "باقي وقت قصير على Champions League": "Champions League closes soon",
    "فتح الدور التالي": "Next round unlocked",
    "ربع النهائي جاهز للتوقع": "Quarter final is ready",
    "نورة تابعتك": "Noura followed you",
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
    "علي دعاك إلى Weekend Derby": "Ali invited you to Weekend Derby",
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
    "بطولاتي": "My championships",
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
    "Rashed wants to join Private Friends Cup": "راشد يريد دخول Private Friends Cup",
    "Predictions close soon": "توقعاتك تقفل قريباً",
    "Champions League closes soon": "باقي وقت قصير على Champions League",
    "Next round unlocked": "فتح الدور التالي",
    "Quarter final is ready": "ربع النهائي جاهز للتوقع",
    "Noura followed you": "نورة تابعتك",
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
    "Ali invited you to Weekend Derby": "علي دعاك إلى Weekend Derby",
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
    "My championships": "بطولاتي",
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
    "Light": "فاتح"
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
    "Weekend Derby": "Weekend Derby",
    "Private Friends Cup": "Private Friends Cup",
    "AFC Champions League Elite": "AFC Champions League Elite",
    "UEFA Champions League": "UEFA Champions League",
    "UAE Pro League": "UAE Pro League",
    "Club World Championship": "Club World Championship",
    "Gulf Cup": "Gulf Cup",
    "Weekend Derby Series": "Weekend Derby Series"
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
    "Weekend Derby": "ديربي نهاية الأسبوع",
    "Private Friends Cup": "كأس الأصدقاء الخاصة",
    "AFC Champions League Elite": "دوري أبطال آسيا للنخبة",
    "UEFA Champions League": "دوري أبطال أوروبا",
    "UAE Pro League": "دوري أدنوك للمحترفين",
    "Club World Championship": "بطولة العالم للأندية",
    "Gulf Cup": "كأس الخليج",
    "Weekend Derby Series": "سلسلة ديربي نهاية الأسبوع"
  }
};

const awardOptions = [
  { id: "best-player", label: "أفضل لاعب في البطولة" },
  { id: "top-scorer", label: "هداف البطولة" },
  { id: "best-goalkeeper", label: "أفضل حارس مرمى" },
  { id: "best-young-player", label: "أفضل لاعب صاعد" },
  { id: "champion-pick", label: "ترشيح بطل البطولة الفعلي", target: "team" },
  { id: "runner-up-pick", label: "ترشيح وصيف البطولة الفعلي", target: "team" }
];

const officialCompetitions = [
  { id: "comp-afc", name: "AFC Champions League Elite", code: "AFCELITE", region: "Asia", season: "2026", defaultStart: "group" },
  { id: "comp-ucl", name: "UEFA Champions League", code: "UCL", region: "Europe", season: "2026", defaultStart: "group" },
  { id: "comp-uae", name: "UAE Pro League", code: "UAEPL", region: "UAE", season: "2026", defaultStart: "group" },
  { id: "comp-club", name: "Club World Championship", code: "CWC", region: "Global", season: "2026", defaultStart: "group" },
  { id: "comp-gulf", name: "Gulf Cup", code: "GULFCUP", region: "GCC", season: "2026", defaultStart: "round16" },
  { id: "comp-friendly", name: "Weekend Derby Series", code: "DERBY", region: "Private", season: "2026", defaultStart: "round16" }
];

const officialRosterPlayers = [
  { id: "p-omar", name: "عمر عبد الرحمن", team: "العين", position: "MID", age: 34 },
  { id: "p-khaled-eisa", name: "خالد عيسى", team: "العين", position: "GK", age: 36 },
  { id: "p-soufiane", name: "سفيان رحيمي", team: "العين", position: "FWD", age: 30 },
  { id: "p-laba", name: "لابا كودجو", team: "العين", position: "FWD", age: 33 },
  { id: "p-ali-mabkhout", name: "علي مبخوت", team: "الجزيرة", position: "FWD", age: 35 },
  { id: "p-hareb", name: "حارب عبدالله", team: "شباب الأهلي", position: "FWD", age: 23 },
  { id: "p-sultan", name: "سلطان عادل", team: "اتحاد كلباء", position: "FWD", age: 21 },
  { id: "p-ronaldo", name: "كريستيانو رونالدو", team: "النصر", position: "FWD", age: 41 },
  { id: "p-salem", name: "سالم الدوسري", team: "الهلال", position: "MID", age: 34 },
  { id: "p-alowais", name: "محمد العويس", team: "الهلال", position: "GK", age: 34 },
  { id: "p-benzema", name: "كريم بنزيما", team: "الاتحاد", position: "FWD", age: 38 },
  { id: "p-kante", name: "نغولو كانتي", team: "الاتحاد", position: "MID", age: 35 },
  { id: "p-crespo", name: "محمد عباس", team: "العين", position: "MID", age: 22 },
  { id: "p-ali-khasif", name: "علي خصيف", team: "الجزيرة", position: "GK", age: 39 },
  { id: "p-abdullah-idrees", name: "عبدالله إدريس", team: "الجزيرة", position: "DEF", age: 21 },
  { id: "p-maayouf", name: "عبدالله المعيوف", team: "الاتحاد", position: "GK", age: 39 }
];

const sportsApiTeamDirectory = {
  "العين": { id: "api-team-al-ain", logoUrl: teamLogoDataUri("A", "#5b2cff", "#ffffff") },
  "النصر": { id: "api-team-al-nassr", logoUrl: teamLogoDataUri("N", "#ffd43b", "#173c8f") },
  "الهلال": { id: "api-team-al-hilal", logoUrl: teamLogoDataUri("H", "#1264ff", "#ffffff") },
  "الوصل": { id: "api-team-al-wasl", logoUrl: teamLogoDataUri("W", "#f4c430", "#151515") },
  "الاتحاد": { id: "api-team-al-ittihad", logoUrl: teamLogoDataUri("I", "#f3c400", "#111111") },
  "الشارقة": { id: "api-team-sharjah", logoUrl: teamLogoDataUri("S", "#e4363d", "#ffffff") },
  "الأهلي": { id: "api-team-al-ahli", logoUrl: teamLogoDataUri("Ah", "#d71920", "#ffffff") },
  "الوحدة": { id: "api-team-al-wahda", logoUrl: teamLogoDataUri("W", "#7b1113", "#ffffff") },
  "الجزيرة": { id: "api-team-al-jazira", logoUrl: teamLogoDataUri("J", "#d71920", "#ffffff") },
  "شباب الأهلي": { id: "api-team-shabab-al-ahli", logoUrl: teamLogoDataUri("SA", "#d71920", "#ffffff") },
  "اتحاد كلباء": { id: "api-team-kalba", logoUrl: teamLogoDataUri("K", "#f2c300", "#111111") }
};

function navigate(path) {
  state.route = path;
  window.location.hash = path;
  render();
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
  state.route = getInitialRoute();
  render();
});

document.body.addEventListener("click", (event) => {
  const backButton = closestElement(event.target, "[data-back]");
  if (backButton) {
    event.preventDefault();
    goBack();
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

  const awardPlayerButton = closestElement(event.target, "[data-award-player]");
  if (awardPlayerButton) {
    event.preventDefault();
    state.awardPicks[awardPlayerButton.dataset.awardKey] = awardPlayerButton.dataset.awardPlayer;
    state.awardSearchQueries[awardPlayerButton.dataset.awardKey] = "";
    render();
    return;
  }

  const awardTeamButton = closestElement(event.target, "[data-award-team]");
  if (awardTeamButton) {
    event.preventDefault();
    state.awardPicks[awardTeamButton.dataset.awardKey] = awardTeamButton.dataset.awardTeam;
    state.awardSearchQueries[awardTeamButton.dataset.awardKey] = "";
    render();
    return;
  }

  const competitionButton = closestElement(event.target, "[data-competition-id]");
  if (competitionButton) {
    event.preventDefault();
    selectOfficialCompetition(competitionButton.dataset.competitionId);
    return;
  }

  const routeButton = closestElement(event.target, "[data-route]");
  if (routeButton) {
    if (routeButton.tagName === "A" && routeButton.getAttribute("href")?.startsWith("#/")) return;
    event.preventDefault();
    navigate(routeButton.dataset.route);
  }
});

function closestElement(target, selector) {
  let node = target;
  while (node && node !== document) {
    if (node.matches && node.matches(selector)) return node;
    node = node.parentElement || node.parentNode;
  }
  return null;
}

function goBack() {
  if (window.history.length > 1 && window.location.protocol !== "file:") {
    window.history.back();
    return;
  }

  if (window.location.protocol === "file:" && window.location.hash && window.location.hash !== "#/") {
    navigate("/");
    return;
  }

  navigate("/");
}

function templateTopbar(title = "Pick A Side") {
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
      <div class="topbar-side"></div>
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
  notificationSettingsModal();
  updateNotificationBadges();
}

function openNotification(notificationId, route) {
  const notification = state.notifications.find((item) => item.id === notificationId);
  if (notification) notification.unread = false;
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
}

function followBackFromNotification(notification) {
  const user = state.users.find((item) => item.username === notification.followerUsername);
  const displayName = user ? user.name.split(" ")[0] : notification.followerName;
  state.currentUser.following = [...new Set([...state.currentUser.following, displayName])];
  if (user) user.relation = "Unfollow";
}

function unfollowFromNotification(notification) {
  const user = state.users.find((item) => item.username === notification.followerUsername);
  const displayName = user ? user.name.split(" ")[0] : notification.followerName;
  state.currentUser.following = state.currentUser.following.filter((name) => name !== displayName);
  if (user) user.relation = "Follow back";
}

function approveJoinRequest(notification) {
  const tournament = state.tournaments.find((item) => item.id === notification.tournamentId);
  if (tournament) {
    tournament.joinRequests = (tournament.joinRequests || []).filter((name) => name !== notification.requesterName);
    tournament.participants = [...new Set([...(tournament.participants || []), notification.requesterName])];
    tournament.friends = Math.max(tournament.friends || 0, tournament.participants.length + 1);
  }
}

function acceptTournamentInvite(notification) {
  const tournament = state.tournaments.find((item) => item.id === notification.tournamentId);
  if (!tournament) return;
  tournament.joined = true;
  tournament.active = true;
  tournament.friends = (tournament.friends || 0) + 1;
  tournament.rank = tournament.rank || tournament.friends;
  notification.route = `/tournament/${tournament.id}`;
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
  closeModal();
  const route = state.route;
  updateBottomNav(route);
  window.setTimeout(() => applyTranslations(app), 0);

  if (route === "/login" || route === "/signup") return renderAuth(route);
  if (route === "/" || route === "/home") return renderHome();
  if (route === "/search") return renderSearch();
  if (route === "/create-tournament") return renderChampionshipsPage();
  if (route === "/create-tournament/new") return renderCreateTournament();
  if (route === "/live") return renderLive();
  if (route.startsWith("/tournament/")) {
    const parts = route.split("/").filter(Boolean);
    if (parts[2] === "manage") return renderTournamentManage(parts[1], parts[3] || "");
    return renderTournament(parts[1]);
  }
  if (route.startsWith("/user/")) return renderUser(route.split("/").pop());
  if (route.startsWith("/challenges/")) return renderChallenges(route.split("/").pop());

  renderNotFound();
}

function updateBottomNav(route) {
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
  return window.location.pathname === "/index.html" ? "/" : window.location.pathname;
}

function renderAuth(route) {
  const isSignup = route === "/signup";
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
        <div class="field">
          <label>البريد الإلكتروني</label>
          <input class="input" type="email" required value="salem@example.com">
        </div>
        ${isSignup ? `
          <div class="field">
            <label>اسم المستخدم</label>
            <input class="input" type="text" required value="salem">
          </div>` : ""}
        <div class="field">
          <label>كلمة المرور</label>
          <input class="input" type="password" required value="password123">
        </div>
        <button class="btn accent" type="submit">${isSignup ? "إنشاء الحساب" : "دخول"}</button>
        <button class="btn ghost" type="button" data-route="${isSignup ? "/login" : "/signup"}">
          ${isSignup ? "لدي حساب" : "إنشاء حساب جديد"}
        </button>
      </form>
    </section>
  `;
  document.querySelector("#auth-form").addEventListener("submit", (event) => {
    event.preventDefault();
    navigate("/");
  });
}

function renderHome() {
  const user = state.currentUser;
  const efficiency = Math.round((user.correctPredictions / user.totalPredictions) * 100);
  const activeTournaments = state.tournaments.filter((item) => item.active && item.joined);
  app.innerHTML = `
    <section class="home-stack">
      <header class="home-header page-topbar">
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
            <div class="stats-row">
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
          </div>
        </div>
        <div class="profile-bio">
          <h1 class="profile-name">${user.name}</h1>
          <div class="muted">${user.handle}</div>
          <div class="muted">Favorite team: ${user.favoriteTeam || "Not set"}</div>
        </div>
        <div class="profile-actions">
          <button class="btn ghost compact-btn" id="edit-profile-btn">Edit Profile</button>
          <button class="btn ghost compact-btn" id="share-profile-btn">Share Profile</button>
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

      <section class="action-grid">
        <button class="action-tile" data-route="/challenges/created"><strong>Created Challenges</strong><span class="muted">Tournaments you founded</span></button>
        <button class="action-tile" data-route="/challenges/joined"><strong>Joined Challenges</strong><span class="muted">Active competitions</span></button>
        <button class="action-tile" data-route="/challenges/drafts"><strong>Draft</strong><span class="muted">Unpublished setups</span></button>
        <button class="action-tile" data-route="/challenges/history"><strong>History</strong><span class="muted">Settled tournaments</span></button>
      </section>
    </section>
  `;

  document.querySelector("#followers-btn").addEventListener("click", () => peopleModal("followers"));
  document.querySelector("#following-btn").addEventListener("click", () => peopleModal("following"));
  document.querySelector("#edit-profile-btn").addEventListener("click", editProfileModal);
  document.querySelector("#share-profile-btn").addEventListener("click", shareProfile);
  document.querySelector("#home-menu-btn").addEventListener("click", profileSettingsModal);
  setupCarouselDots();
}

function tournamentCard(tournament) {
  const rankLabel = state.language === "ar" ? "الترتيب" : "Rank";
  return `
    <button class="result-card" data-route="/tournament/${tournament.id}">
      <div class="result-card-head">
        <h3>${tournament.name}</h3>
        <span class="rank-badge">${rankLabel} #${tournament.rank || "-"}</span>
      </div>
      <div class="stat-line"><span class="muted">Points</span><strong>${tournament.points}</strong></div>
      <div class="prediction-counters">
        <span class="correct">● C: ${tournament.correct}</span>
        <span class="wrong">● W: ${tournament.wrong}</span>
      </div>
    </button>
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
  carousel.addEventListener("pointerup", () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove("dragging");
    suppressClick = moved;
    window.requestAnimationFrame(setActiveDot);
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  });
  carousel.addEventListener("pointercancel", () => {
    isDragging = false;
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
      return `<button class="search-result" data-route="/tournament/${item.id}"><strong>${item.name}</strong><div class="muted">Public championship</div></button>`;
    }).join("")
    : `<div class="search-result">No results found</div>`;
}

function renderSearch() {
  const query = state.searchQuery || "";
  const people = searchPeople(query);
  const tournaments = searchPublicTournaments(query);
  const showExplore = !query.trim();

  app.innerHTML = `
    ${templateTopbar("Search")}
    <section class="search-page">
      <div class="search-sticky panel">
        <input class="input search-page-input" id="search-page-input" value="${query}" placeholder="Search users, championships, or invite code">
      </div>

      ${showExplore ? `
        <section class="search-section">
          <div class="section-row">
            <h2 class="section-title">Public Championships</h2>
            <span class="muted">Explore open challenges</span>
          </div>
          <div class="explore-grid">
            ${tournaments.map(searchTournamentCard).join("")}
          </div>
        </section>
      ` : `
        <section class="search-section">
          <h2 class="section-title">People</h2>
          <div class="search-list">
            ${people.length ? people.map(searchUserRow).join("") : `<div class="muted empty-row">No users found</div>`}
          </div>
        </section>
        <section class="search-section">
          <h2 class="section-title">Championships</h2>
          <div class="search-list">
            ${tournaments.length ? tournaments.map(searchTournamentRow).join("") : `<div class="muted empty-row">No public championships found</div>`}
          </div>
        </section>
      `}
    </section>
  `;

  const input = document.querySelector("#search-page-input");
  input.addEventListener("input", () => {
    state.searchQuery = input.value;
    renderSearch();
  });
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  document.querySelectorAll("[data-follow-user]").forEach((button) => {
    button.addEventListener("click", () => toggleFollowUser(button.dataset.followUser));
  });
  document.querySelectorAll("[data-join-tournament]").forEach((button) => {
    button.addEventListener("click", () => joinTournament(button.dataset.joinTournament));
  });
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
  return `
    <article class="instagram-row">
      <button class="user-row-main" data-route="/tournament/${tournament.id}">
        <span class="mini-avatar trophy-avatar">P</span>
        <span>
          <strong>${tournament.name}</strong>
          <small>Code ${tournament.publicCode || "PUBLIC"} · ${tournament.friends || 0} players</small>
        </span>
      </button>
      <button class="btn compact-btn ${tournament.joined ? "ghost" : "accent"}" data-join-tournament="${tournament.id}">
        ${tournament.joined ? "Joined" : "Join"}
      </button>
    </article>
  `;
}

function searchTournamentCard(tournament) {
  return `
    <article class="explore-card">
      <button class="explore-card-main" data-route="/tournament/${tournament.id}">
        <span class="rank-badge">${tournament.publicCode || "PUBLIC"}</span>
        <h3>${tournament.name}</h3>
        <p>${tournament.friends || 0} players · ${tournament.budget || 0} point budget</p>
      </button>
      <button class="btn compact-btn ${tournament.joined ? "ghost" : "accent"}" data-join-tournament="${tournament.id}">
        ${tournament.joined ? "Joined" : "Join Championship"}
      </button>
    </article>
  `;
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
  if (rerenderSearch) renderSearch();
}

function joinTournament(tournamentId) {
  joinTournamentSilently(tournamentId);
  renderSearch();
}

function searchOfficialCompetitions(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return officialCompetitions.slice(0, 3);

  const competitions = officialCompetitions.filter((competition) => {
    return competition.name.toLowerCase().includes(normalized)
      || competition.code.toLowerCase().includes(normalized)
      || competition.region.toLowerCase().includes(normalized);
  });
  return competitions.slice(0, 6);
}

function getSelectedCompetition() {
  return officialCompetitions.find((competition) => competition.id === state.selectedCompetitionId);
}

function competitionResultsHtml(query) {
  const competitions = searchOfficialCompetitions(query);
  if (!competitions.length) {
    return `<div class="competition-empty">لا توجد بطولة مطابقة من المصدر الرسمي.</div>`;
  }

  return competitions.map((competition) => `
    <button class="competition-result" type="button" data-competition-id="${competition.id}">
      <span>
        <strong>${competition.name}</strong>
        <small>${competition.region} · موسم ${competition.season}</small>
      </span>
      <b>${competition.code}</b>
    </button>
  `).join("");
}

function selectedCompetitionSummary() {
  const competition = getSelectedCompetition();
  if (!competition) {
    return `<span class="muted">اختر بطولة من القائمة حتى يتم جلب مبارياتها، أدوارها، وقوائم اللاعبين من الربط الرياضي.</span>`;
  }

  const startRound = rounds.find((round) => round.id === competition.defaultStart)?.label || "حسب بيانات الربط";
  return `
    <div>
      <strong>${competition.name}</strong>
      <span>${competition.region} · موسم ${competition.season} · يبدأ افتراضياً من ${startRound}</span>
    </div>
    <span class="badge">${competition.code}</span>
  `;
}

function selectOfficialCompetition(competitionId) {
  const competition = officialCompetitions.find((item) => item.id === competitionId);
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
}

function validateCompetitionSelection() {
  if (state.selectedCompetitionId) return true;
  const error = document.querySelector("#create-error");
  if (error) error.textContent = "اختر بطولة رسمية من القائمة أولاً حتى يتم ربط المباريات وقوائم اللاعبين.";
  return false;
}

function renderChampionshipsPage() {
  const joinedTournaments = state.tournaments.filter((tournament) => tournament.joined && !tournament.draft);
  const followingTournaments = followedPublicTournaments();
  const activeTab = state.selectedChampionshipsTab === "following" ? "following" : "mine";
  const activeIndex = activeTab === "following" ? 1 : 0;
  app.innerHTML = `
    ${tournamentsTopbar()}
    <section class="grid championships-page">
      <div class="championship-segment" role="tablist" aria-label="Championship categories">
        <button class="championship-segment-btn ${activeTab === "mine" ? "active" : ""}" type="button" data-championship-tab="mine" role="tab" aria-selected="${activeTab === "mine"}">
          <strong>بطولاتي (${joinedTournaments.length})</strong>
        </button>
        <button class="championship-segment-btn ${activeTab === "following" ? "active" : ""}" type="button" data-championship-tab="following" role="tab" aria-selected="${activeTab === "following"}">
          <strong>بطولات من أتابعهم (${followingTournaments.length})</strong>
        </button>
      </div>

      <div class="card panel stack championships-switch-shell">
        <div class="championship-page-slider" id="championship-page-slider" style="--championship-index: ${activeIndex}">
          <div class="championship-page-track">
            <section class="championship-slide" aria-label="بطولاتي">
              <div class="list-grid championship-card-list">
                ${joinedTournaments.length ? joinedTournaments.map((tournament) => championshipLiveCard(tournament, "joined")).join("") : `<p class="muted">لا توجد بطولات هنا حالياً.</p>`}
              </div>
            </section>

            <section class="championship-slide" aria-label="بطولات من أتابعهم">
              <div class="list-grid championship-card-list">
                ${followingTournaments.length ? followingTournaments.map((tournament) => championshipLiveCard(tournament, "following")).join("") : `<p class="muted">لا توجد بطولات هنا حالياً.</p>`}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  `;

  document.querySelectorAll("[data-championship-tab]").forEach((button) => {
    button.addEventListener("click", () => setChampionshipsTab(button.dataset.championshipTab));
  });

  setupChampionshipsSwipe();

  document.querySelectorAll("[data-hub-join-tournament]").forEach((button) => {
    button.addEventListener("click", () => {
      joinTournamentSilently(button.dataset.hubJoinTournament);
      renderChampionshipsPage();
    });
  });
}

function setChampionshipsTab(tab) {
  state.selectedChampionshipsTab = tab === "following" ? "following" : "mine";
  renderChampionshipsPage();
}

function setupChampionshipsSwipe() {
  const slider = document.querySelector("#championship-page-slider");
  if (!slider) return;
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  slider.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a, input, textarea, select")) return;
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
    setChampionshipsTab(deltaX < 0 ? "following" : "mine");
  });

  slider.addEventListener("pointercancel", () => {
    isDragging = false;
  });
}

function tournamentsTopbar() {
  return `
    <header class="topbar page-topbar tournaments-topbar">
      <div class="topbar-side"></div>
      <button class="page-title-btn" data-route="/create-tournament">
        <span>البطولات</span>
      </button>
      <div class="topbar-side">
        <button class="create-plus-btn" type="button" data-route="/create-tournament/new" aria-label="Create Tournament" title="Create Tournament">+</button>
      </div>
    </header>
  `;
}

function followedPublicTournaments() {
  return state.tournaments.filter((tournament) => {
    if (!tournament.public || tournament.draft) return false;
    if (tournament.joined) return false;
    if (tournament.owner === state.currentUser.name || tournament.owner === "Salem") return false;
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
  const participants = tournament.participants || [];
  const participantCount = tournament.friends || participants.length || 0;
  const canJoin = source === "following" && !hasStarted && !tournament.joined;
  const ownerUsername = getTournamentOwnerUsername(tournament);
  return `
    <article class="live-tournament-tab championship-live-card">
      <div class="championship-live-head">
        <strong>${tournament.name}</strong>
        <span class="championship-status-text">${hasStarted ? "بدأت" : "لم تبدأ"}</span>
      </div>
      <span>${tournament.publicCode || "PUBLIC"} · ${participantCount} مشارك</span>
      <span>المنشئ: <button class="inline-profile-link" type="button" data-route="/user/${ownerUsername}">@${ownerUsername}</button></span>
      <span>المتصدر: ${hasStarted ? leader : "يظهر بعد البداية"}</span>
      <div class="championship-live-actions">
        ${canJoin ? `
          <button class="btn accent compact-btn" type="button" data-hub-join-tournament="${tournament.id}">المشاركة</button>
        ` : `
          <button class="btn ghost compact-btn" type="button" data-route="/tournament/${tournament.id}">عرض التفاصيل</button>
        `}
      </div>
    </article>
  `;
}

function getTournamentOwnerUsername(tournament) {
  if (tournament.ownerUsername) return tournament.ownerUsername;
  const ownerName = String(tournament.owner || "").trim();
  if (!ownerName || ownerName === state.currentUser.name || ownerName === "Salem") return state.currentUser.handle.replace("@", "");
  const ownerFirstName = ownerName.split(" ")[0].toLowerCase();
  const matchingUser = state.users.find((user) => {
    const firstName = user.name.split(" ")[0].toLowerCase();
    return user.username === ownerFirstName || firstName === ownerFirstName;
  });
  return matchingUser?.username || ownerFirstName || "profile";
}

function getTournamentLeaderName(tournament) {
  if (tournament.leaderName) return tournament.leaderName;
  const base = [
    { name: state.currentUser.name, points: tournament.points || 0 },
    { name: "نورة الشامسي", points: (tournament.points || 0) - 40 },
    { name: "علي الكتبي", points: (tournament.points || 0) + 90 },
    { name: "مريم الهاشمي", points: (tournament.points || 0) - 160 }
  ];
  return base.sort((a, b) => b.points - a.points)[0].name;
}

function joinTournamentSilently(tournamentId) {
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament || tournament.joined) return;
  tournament.joined = true;
  tournament.friends = (tournament.friends || 0) + 1;
  tournament.rank = tournament.friends;
}

function renderCreateTournament() {
  const invite = generateInviteCode();
  const selectedCompetition = getSelectedCompetition();
  const initialRoundId = selectedCompetition?.defaultStart || "group";
  const initialRoundLabel = rounds.find((round) => round.id === initialRoundId)?.label || "دور المجموعات";
  const today = new Date().toISOString().slice(0, 10);
  app.innerHTML = `
    ${templateTopbar("بطولة جديدة")}
    <form class="card panel stack" id="create-form">
      <div>
        <h1 class="section-title">بطولة جديدة</h1>
        <p class="muted">أدخل البيانات الأساسية فقط. القوانين، الجوائز وقواعد النقاط تستكمل من إدارة البطولة.</p>
      </div>
      <div class="grid form-grid">
        <div class="field wide official-competition-picker">
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
          <input class="input" id="tournament-name" required maxlength="40" value="${selectedCompetition?.name || ""}" placeholder="مثال: بطولة الأصدقاء">
        </div>
        <div class="field">
          <label>الشعار</label>
          <input class="input" id="tournament-logo" type="file" accept="image/*">
        </div>
        <div class="toggle-row wide">
          <div>
            <strong>بطولة خاصة</strong>
            <div class="muted">عند التفعيل يتم توليد كود دعوة تلقائي.</div>
          </div>
          <button type="button" class="switch" id="privacy-switch" aria-pressed="false"><span></span></button>
        </div>
        <div class="field" id="invite-field" hidden>
          <label>كود الدعوة</label>
          <input class="input" id="invite-code" readonly value="${invite}">
        </div>
        <div class="field">
          <label>الحد الأقصى للمشاركين</label>
          <input class="input" id="max-players" type="number" min="2" value="16">
        </div>
        <div class="field">
          <label>نقطة الانطلاق</label>
          <select class="select" id="starting-round">
            ${rounds.map((round) => `<option value="${round.id}" ${round.id === initialRoundId ? "selected" : ""}>${round.label}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>تاريخ بداية البطولة</label>
          <input class="input" id="tournament-start-date" type="date" min="${today}" value="${today}" required>
        </div>
        <div class="toggle-row wide">
          <div>
            <strong>هل البطولة فيها جوائز؟</strong>
            <div class="muted">إذا نعم، تضيف تفاصيل الجوائز لاحقاً من إدارة البطولة.</div>
          </div>
          <button type="button" class="switch" id="prizes-switch" aria-pressed="false"><span></span></button>
        </div>
      </div>
      <div class="notice" id="api-preview">مرحلة البداية: سيتم جلب مباريات ${initialRoundLabel}، وبعد اعتماد نتائجها تفتح المرحلة التالية تلقائياً.</div>
      <div class="error-text" id="create-error"></div>
      <div class="topbar">
        <button class="btn warn" type="button" id="save-draft">حفظ كمسودة</button>
        <button class="btn accent" type="submit">إنشاء البطولة</button>
      </div>
    </form>
  `;

  const privacy = document.querySelector("#privacy-switch");
  const prizesSwitch = document.querySelector("#prizes-switch");
  document.querySelector("#competition-search").addEventListener("input", (event) => {
    state.competitionSearchQuery = event.target.value;
    state.selectedCompetitionId = "";
    document.querySelector("#competition-id").value = "";
    document.querySelector("#selected-competition").innerHTML = selectedCompetitionSummary();
    document.querySelector("#competition-results").innerHTML = competitionResultsHtml(event.target.value);
    document.querySelector("#create-error").textContent = "";
  });
  privacy.addEventListener("click", () => {
    const isOn = !privacy.classList.contains("on");
    privacy.classList.toggle("on", isOn);
    privacy.setAttribute("aria-pressed", String(isOn));
    document.querySelector("#invite-field").hidden = !isOn;
  });
  prizesSwitch.addEventListener("click", () => {
    const isOn = !prizesSwitch.classList.contains("on");
    prizesSwitch.classList.toggle("on", isOn);
    prizesSwitch.setAttribute("aria-pressed", String(isOn));
  });
  document.querySelector("#starting-round").addEventListener("change", (event) => {
    const label = rounds.find((round) => round.id === event.target.value).label;
    document.querySelector("#api-preview").textContent = `مرحلة البداية: سيتم جلب مباريات ${label}، وبعد اعتماد نتائجها تفتح المرحلة التالية تلقائياً.`;
  });
  document.querySelector("#save-draft").addEventListener("click", () => {
    const id = saveTournament(true);
    if (id) navigate("/challenges/drafts");
  });
  document.querySelector("#create-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = saveTournament(false);
    if (id) navigate(`/tournament/${id}/manage`);
  });
}

function saveTournament(draft = false) {
  if (!validateCompetitionSelection()) return "";
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
  const id = `t-${Date.now()}`;
  const selectedCompetition = getSelectedCompetition();
  const isPrivate = document.querySelector("#privacy-switch").classList.contains("on");
  const hasPrizes = document.querySelector("#prizes-switch").classList.contains("on");
  const logoInput = document.querySelector("#tournament-logo");
  state.tournaments.unshift({
    id,
    name: tournamentName,
    officialCompetitionId: selectedCompetition.id,
    officialCompetitionCode: selectedCompetition.code,
    officialCompetitionName: selectedCompetition.name,
    logoFileName: logoInput?.files?.[0]?.name || "",
    public: !isPrivate,
    publicCode: isPrivate ? "" : selectedCompetition.code,
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
    points: 400,
    correct: 0,
    wrong: 0,
    budget: 400,
    minPoints: 20,
    startingRound: document.querySelector("#starting-round").value,
    currentRound: document.querySelector("#starting-round").value,
    inviteCode: isPrivate ? document.querySelector("#invite-code").value : null,
    awardCategories: [],
    prizes: [],
    joinRequests: []
  });
  return id;
}

function renderTournament(id) {
  const tournament = getTournamentById(id);
  if (isTournamentOwner(tournament)) return renderOwnerTournament(tournament);
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const tournamentRounds = getTournamentRounds(tournament);
  const selectedRound = tournamentRounds.some((round) => round.id === state.selectedRound) ? state.selectedRound : activeRound;
  const selectedRoundIndex = rounds.findIndex((round) => round.id === selectedRound);
  const activeRoundIndex = rounds.findIndex((round) => round.id === activeRound);
  const isLocked = selectedRoundIndex > activeRoundIndex;
  const matches = isLocked ? [] : (state.matches[selectedRound] || []);
  const used = getUsedBudget(tournament.id, selectedRound);
  const pct = Math.min(100, Math.round((used / tournament.budget) * 100));
  const nextRound = getNextRound(tournament);

  app.innerHTML = `
    ${templateTopbar(tournament.name)}
    <section class="grid">
      <div class="card panel stack">
        <div class="topbar">
          <div>
            <h1 class="section-title">${tournament.name}</h1>
            <p class="muted">ميزانية الجولة: ${tournament.budget} نقطة · الحد الأدنى للفريق: ${tournament.minPoints} · ${tournament.public ? "بطولة عامة" : `بطولة خاصة ${tournament.inviteCode || ""}`}</p>
          </div>
        </div>
        <div class="tabs">
          ${tournamentRounds.map((round) => {
            const roundIndex = rounds.findIndex((item) => item.id === round.id);
            const locked = roundIndex > activeRoundIndex;
            return `
            <button class="btn tab ${round.id === selectedRound ? "active" : ""} ${locked ? "locked" : ""}" data-round="${round.id}" ${locked ? "disabled" : ""}>
              ${locked ? "🔒 " : ""}${round.label}
            </button>
          `}).join("")}
        </div>
        <div>
          <div class="stat-line"><span>المستخدم من ميزانية الجولة</span><strong>${used} / ${tournament.budget}</strong></div>
          <div class="budget-bar" style="--pct: ${pct}%"><span></span></div>
        </div>
        <div class="round-lifecycle">
          <div>
            <strong>الدور الحالي: ${rounds.find((round) => round.id === activeRound).label}</strong>
            <p class="muted">${nextRound ? `الدور التالي يفتح بعد اعتماد نتائج ${rounds.find((round) => round.id === activeRound).label} من الـ API.` : "هذه آخر مرحلة في البطولة."}</p>
          </div>
          ${nextRound ? `<button class="btn warn" data-advance-round="${tournament.id}">محاكاة اعتماد نتائج الدور</button>` : ""}
        </div>
        ${isPredictionLocked(matches) ? `<div class="notice danger-notice">تم قفل توقعات هذا الدور. اللاعبون بدون توقعات مكتملة يعتبرون خاسرين لنقاط الجولة عند التسوية.</div>` : ""}
      </div>
      ${matches.length ? "" : `<div class="card panel">هذا الدور مغلق حتى يؤكد الـ API الفرق المتأهلة من الدور السابق.</div>`}
      ${pickBoardWorkflow(tournament, selectedRound, matches)}
      ${awardNominationWorkflow(tournament)}
      <div class="card panel leaderboard-card" data-live-leaderboard="${tournament.id}" data-live-round="${selectedRound}">
        <div class="section-head compact-section-head">
          <div>
            <h2 class="section-title">المتصدرون</h2>
            <p class="muted live-leaderboard-note">يتحدث عند وصول نتيجة أو نهاية شوط من API</p>
          </div>
          <span class="live-pill">مباشر</span>
          <button class="btn ghost compact-btn" type="button" data-full-leaderboard="${tournament.id}">عرض الكل</button>
        </div>
        ${isDeveloperMode() ? `<div class="live-api-bar">
          <span>${liveApiStatusText()}</span>
          <div class="live-api-actions">
            <button class="btn ghost compact-btn" type="button" data-live-api-key>مفتاح API</button>
            <button class="btn warn compact-btn" type="button" data-live-api-refresh="${tournament.id}" data-live-api-round="${selectedRound}">تحديث النتائج</button>
          </div>
        </div>` : ""}
        <div class="leaderboard-list" data-leaderboard-list>
          ${leaderboardRows(tournament, { limit: 3, live: true, round: selectedRound }).join("")}
        </div>
      </div>
    </section>
  `;

  document.querySelectorAll("[data-round]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRound = button.dataset.round;
      renderTournament(tournament.id);
    });
  });
  document.querySelectorAll("[data-predict]").forEach((button) => {
    button.addEventListener("click", () => predictionModal(tournament, selectedRound, button.dataset.predict));
  });
  document.querySelectorAll("[data-inline-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      const key = `${tournament.id}:${selectedRound}:${button.dataset.inlinePick}`;
      state.quickPicks[key] = button.dataset.outcome;
      delete state.predictionErrors[key];
      renderTournament(tournament.id);
    });
  });
  document.querySelectorAll("[data-inline-confirm]").forEach((button) => {
    button.addEventListener("click", () => confirmInlinePrediction(tournament, selectedRound, button.dataset.inlineConfirm));
  });
  document.querySelectorAll("[data-quick-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.quickPicks[button.dataset.quickPick] = button.dataset.outcome;
      renderTournament(tournament.id);
    });
  });
  document.querySelectorAll("[data-advance-round]").forEach((button) => {
    button.addEventListener("click", () => {
      advanceTournamentRound(button.dataset.advanceRound);
    });
  });
  document.querySelectorAll("[data-full-leaderboard]").forEach((button) => {
    button.addEventListener("click", () => leaderboardModal(getTournamentById(button.dataset.fullLeaderboard)));
  });
  document.querySelectorAll("[data-live-api-key]").forEach((button) => {
    button.addEventListener("click", liveApiKeyModal);
  });
  document.querySelectorAll("[data-live-api-refresh]").forEach((button) => {
    button.addEventListener("click", () => refreshLiveApiResults(getTournamentById(button.dataset.liveApiRefresh), button.dataset.liveApiRound));
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

function isDeveloperMode() {
  return new URLSearchParams(window.location.search).has("dev");
}

function isTournamentOwner(tournament) {
  const currentUsername = state.currentUser.handle.replace("@", "");
  return tournament.owner === state.currentUser.name
    || tournament.owner === "Salem"
    || tournament.ownerUsername === currentUsername;
}

function renderOwnerTournament(tournament) {
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const matches = state.matches[activeRound] || [];
  const participants = tournament.participants || [state.currentUser.name, "نورة الشامسي", "علي الكتبي", "مريم الهاشمي"].slice(0, Math.max(1, tournament.friends || 1));
  const captainUsername = getTournamentOwnerUsername(tournament);
  const aboutLabel = tournament.public ? "بطولة عامة" : "بطولة خاصة";
  const prizesLabel = tournament.hasPrizes || (tournament.awardCategories || []).length || getTournamentPrizes(tournament).length ? "جوائز متاحة" : "بدون جوائز";
  const requestCount = getJoinRequestCount(tournament);
  const participantCount = tournament.friends || participants.length || 1;
  const currentStageTitle = tournament.active && !tournament.setupIncomplete
    ? (rounds.find((round) => round.id === activeRound)?.label || "الدور الحالي")
    : "مرحلة إدخال تفاصيل البطولة";
  app.innerHTML = `
    ${ownerTournamentTopbar(tournament)}
    <section class="owner-tournament-page">
      <section class="owner-tournament-hero">
        <div class="owner-cover">
          <img class="owner-tournament-logo" src="${currentLogoSrc()}" alt="">
        </div>
        <div class="owner-title-block">
          <div class="owner-group-avatar">${tournament.name.slice(0, 1)}</div>
          <div class="owner-title-content">
            <div class="owner-title-row">
              <div>
                <h1>${tournament.name}</h1>
                <p>${tournament.publicCode || tournament.inviteCode || "PRIVATE"} · ${rounds.find((round) => round.id === activeRound)?.label || "الدور الحالي"}</p>
              </div>
              <button class="owner-share-btn" type="button" data-share-tournament="${tournament.id}" aria-label="مشاركة البطولة" title="مشاركة البطولة">
                ${ownerTournamentIcon("share")}
              </button>
            </div>
            <div class="owner-priority-actions">
              <button type="button" data-route="/tournament/${tournament.id}/manage/requests">
                <strong>${requestCount}</strong>
                <span>طلبات الدخول</span>
              </button>
              <button type="button" data-route="/tournament/${tournament.id}/manage/players">
                <strong>${participantCount}</strong>
                <span>المشاركون</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="owner-summary-card">
        <div><span>المرحلة الحالية</span><strong>${currentStageTitle}</strong></div>
        <div><span>القائد</span><strong><button class="inline-profile-link" type="button" data-route="/user/${captainUsername}">@${captainUsername}</button></strong></div>
        <div><span>حالة البطولة</span><strong>${aboutLabel}</strong></div>
        <div><span>المنظمون</span><strong>${getTournamentOrganizers(tournament).join("، ")}</strong></div>
        <div><span>الرعاة</span><strong>${getTournamentSponsors(tournament).join("، ") || "لم يحدد"}</strong></div>
        <div><span>الجوائز</span><strong>${prizesLabel}</strong></div>
      </section>

      <section class="owner-action-list">
        ${ownerTournamentActionRow("voting", "حالة التصويت", "check", `/tournament/${tournament.id}/manage/voting`)}
        ${ownerTournamentActionRow("results", "نتائج المباريات", "ball", `/tournament/${tournament.id}/manage/results`)}
        ${ownerTournamentActionRow("prediction-results", "نتائج التوقعات", "bars", `/tournament/${tournament.id}/manage/prediction-results`)}
        ${ownerTournamentActionRow("leaderboard", "ترتيب المشاركين", "trophy", `/tournament/${tournament.id}/manage/leaderboard`)}
        ${ownerTournamentActionRow("rules", "قوانين البطولة", "ball", `/tournament/${tournament.id}/manage/rules`)}
        ${ownerTournamentActionRow("prizes", "إدارة الجوائز", "trophy", `/tournament/${tournament.id}/manage/prizes`)}
        ${ownerTournamentActionRow("notify", "الإشعارات", "chat", `/tournament/${tournament.id}/manage/notify`)}
        ${ownerTournamentActionRow("danger", "منطقة الخطر", "gear", `/tournament/${tournament.id}/manage/danger`)}
        ${ownerTournamentActionRow("admin-team", "إدارة البطولة", "gear", `/tournament/${tournament.id}/manage/admin-team`)}
      </section>
    </section>
  `;

  document.querySelectorAll("[data-owner-tournament-action]").forEach((button) => {
    button.addEventListener("click", () => ownerTournamentModal(tournament, button.dataset.ownerTournamentAction, matches));
  });
  document.querySelectorAll("[data-share-tournament]").forEach((button) => {
    button.addEventListener("click", () => shareTournamentInvite(getTournamentById(button.dataset.shareTournament)));
  });
}

function ownerTournamentTopbar(tournament) {
  return `
    <header class="topbar page-topbar owner-tournament-topbar">
      <div class="topbar-side">
        <button class="btn ghost back-btn" data-back="true" aria-label="Back" title="Back">←</button>
      </div>
      <button class="page-title-btn" data-route="/create-tournament">
        <span>${tournament.name}</span>
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
  return state.tournaments.find((item) => item.id === id) || state.tournaments[0];
}

function ownerTournamentActionRow(action, label, icon, route = "") {
  const actionAttribute = route ? `data-route="${route}"` : `data-owner-tournament-action="${action}"`;
  return `
    <button class="owner-action-row" type="button" ${actionAttribute}>
      <span class="owner-action-icon">${ownerTournamentIcon(icon)}</span>
      <strong>${label}</strong>
      <span class="owner-action-arrow">›</span>
    </button>
  `;
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

  updateNotificationBadge();
  if (status) {
    status.textContent = "تم إرسال الإشعار للأعضاء.";
    status.classList.remove("form-error-inline");
    status.classList.add("form-success-inline");
  }
  document.querySelector("#owner-notification-body").value = "";
}

function renderTournamentManage(id, section) {
  const tournament = getTournamentById(id);
  if (!isTournamentOwner(tournament)) return renderTournament(tournament.id);
  if (section) return renderTournamentManageSection(tournament, section);

  app.innerHTML = `
    ${templateTopbar("إدارة البطولة")}
    <section class="owner-manage-page">
      <section class="card panel stack manage-intro-card">
        <div>
          <h1 class="section-title">${tournament.name}</h1>
          <p class="muted">${tournament.active ? "البطولة مفعلة وتظهر للمشاركين." : "استكمل بيانات البطولة ثم فعّلها لتظهر للجميع."}</p>
        </div>
        <span class="championship-status-text">${tournament.active ? "نشطة" : "لم تبدأ"}</span>
        ${!tournament.active ? ownerActivationPanel(tournament) : ""}
      </section>

      <section class="owner-action-list">
        ${ownerManageRow(tournament, "voting", "حالة التصويت", "check", getVotingSummary(tournament))}
        ${ownerManageRow(tournament, "results", "نتائج المباريات", "ball", tournament.currentRound || tournament.startingRound || "-")}
        ${ownerManageRow(tournament, "prediction-results", "نتائج التوقعات", "bars", `${tournament.correct || 0}/${tournament.wrong || 0}`)}
        ${ownerManageRow(tournament, "leaderboard", "ترتيب المشاركين", "trophy", tournament.friends || 1)}
        ${ownerManageRow(tournament, "rules", "قوانين البطولة", "ball", `${tournament.budget}/${tournament.minPoints}`)}
        ${ownerManageRow(tournament, "prizes", "إدارة الجوائز", "trophy", getTournamentPrizes(tournament).length)}
        ${ownerManageRow(tournament, "notify", "الإشعارات", "chat", "إرسال")}
        ${ownerManageRow(tournament, "danger", "منطقة الخطر", "gear", "حساس")}
        ${ownerManageRow(tournament, "admin-team", "إدارة البطولة", "gear", getTournamentOrganizers(tournament).length)}
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
      <button class="btn accent compact-btn" type="button" data-activate-tournament="${tournament.id}" ${readiness.ready ? "" : "disabled"}>تفعيل البطولة</button>
    </div>
  `;
}

function getTournamentReadiness(tournament) {
  const missing = [];
  if (!tournament.name) missing.push("اسم البطولة");
  if (!tournament.officialCompetitionId) missing.push("البطولة الرسمية");
  if (!tournament.startDate) missing.push("تاريخ البداية");
  if (!tournament.startingRound) missing.push("نقطة الانطلاق");
  if (!tournament.maxPlayers) missing.push("عدد المشاركين");
  return { ready: missing.length === 0, missing };
}

function activateTournament(tournamentId) {
  const tournament = getTournamentById(tournamentId);
  const readiness = getTournamentReadiness(tournament);
  if (!readiness.ready) return;
  tournament.active = true;
  tournament.draft = false;
  tournament.setupIncomplete = false;
  tournament.activationReady = true;
  renderTournamentManage(tournament.id, "");
}

function ownerManageRow(tournament, section, label, icon, meta) {
  return `
    <button class="owner-action-row manage-action-row" type="button" data-route="/tournament/${tournament.id}/manage/${section}">
      <span class="owner-action-icon">${ownerTournamentIcon(icon)}</span>
      <strong>${label}</strong>
      <span class="manage-row-meta">${meta}</span>
      <span class="owner-action-arrow">›</span>
    </button>
  `;
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
    "admin-team": "إدارة البطولة"
  };
  const title = titles[section] || "إدارة البطولة";
  app.innerHTML = `
    ${templateTopbar(title)}
    <section class="owner-manage-page">
      ${ownerManageSectionContent(tournament, section)}
    </section>
  `;

  document.querySelectorAll("[data-request-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".request-row");
      const action = button.dataset.requestAction;
      row.innerHTML = `<strong>${action === "accept" ? "تم قبول الطلب" : "تم رفض الطلب"}</strong><span class="muted">تم تحديث حالة الطلب محلياً للمعاينة.</span>`;
    });
  });
  document.querySelectorAll("[data-remove-player]").forEach((button) => {
    button.addEventListener("click", () => confirmRemoveTournamentPlayer(tournament, button.dataset.removePlayer));
  });
  const addPrizeButton = document.querySelector("#add-tournament-prize");
  if (addPrizeButton) {
    addPrizeButton.addEventListener("click", () => addTournamentPrize(tournament));
  }
  const saveSettingsButton = document.querySelector("#save-tournament-settings");
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener("click", () => saveTournamentSettings(tournament));
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
  const joinWindowButton = document.querySelector("#toggle-join-window");
  if (joinWindowButton) {
    joinWindowButton.addEventListener("click", () => toggleJoinWindow(tournament));
  }
  const saveAdminTeamButton = document.querySelector("#save-admin-team");
  if (saveAdminTeamButton) {
    saveAdminTeamButton.addEventListener("click", () => saveAdminTeam(tournament));
  }
  const saveAwardsButton = document.querySelector("#save-award-categories");
  if (saveAwardsButton) {
    saveAwardsButton.addEventListener("click", () => {
      tournament.awardCategories = [...document.querySelectorAll("[data-award-category]:checked")].map((input) => input.value);
      tournament.hasPrizes = tournament.hasPrizes || tournament.awardCategories.length > 0;
      renderTournamentManageSection(tournament, "awards");
    });
  }
  document.querySelectorAll("[data-remove-prize]").forEach((button) => {
    button.addEventListener("click", () => {
      tournament.prizes = getTournamentPrizes(tournament).filter((prize) => prize.id !== button.dataset.removePrize);
      renderTournamentManageSection(tournament, "prizes");
    });
  });
  document.querySelectorAll("[data-point-rule-round-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPointRuleRound = button.dataset.pointRuleRoundTab;
      renderTournamentManageSection(tournament, "points");
    });
  });
  document.querySelectorAll("[data-point-rule-type]").forEach((input) => {
    input.addEventListener("change", () => {
      updateTournamentPointRule(tournament, input.dataset.pointRuleRound, { type: input.value });
      renderTournamentManageSection(tournament, "points");
    });
  });
  document.querySelectorAll("[data-point-rule-field]").forEach((input) => {
    const eventName = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(eventName, () => {
      if (isPointRuleRoundLocked(tournament, input.dataset.pointRuleRound)) return;
      const field = input.dataset.pointRuleField;
      const stringFields = ["pointSource", "nominationType", "percentMode", "pointsMode", "settlement"];
      const rawValue = stringFields.includes(field) ? input.value : field === "jokerEnabled" ? input.value === "true" : Number(input.value) || 0;
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
      if (stringFields.includes(field) || field === "jokerEnabled") renderTournamentManageSection(tournament, "points");
    });
  });
  document.querySelectorAll("[data-voting-player]").forEach((button) => {
    button.addEventListener("click", () => votingPlayerDetailsModal(tournament, button.dataset.votingRound, button.dataset.votingPlayer, button.dataset.votingStatus));
  });
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
    "admin-team": ownerAdminTeamPage(tournament)
  };
  return content[section] || ownerSettingsPage(tournament);
}

function getJoinRequestCount(tournament) {
  return tournament.active ? 2 : 4;
}

function ownerRequestsPage(tournament) {
  const requests = [
    { name: "حمد المنصوري", handle: "@hamad" },
    { name: "راشد المزروعي", handle: "@rashed" },
    { name: "هند الكعبي", handle: "@hind" }
  ].slice(0, getJoinRequestCount(tournament));
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">راجع طلبات المشاركة قبل دخول اللاعبين للبطولة.</p>
      <div class="request-list">
        ${requests.map((request) => `
          <div class="request-row">
            <div>
              <strong>${request.name}</strong>
              <span>${request.handle}</span>
            </div>
            <button class="btn accent compact-btn" type="button" data-request-action="accept">قبول</button>
            <button class="btn ghost compact-btn" type="button" data-request-action="reject">رفض</button>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function ownerPlayersPage(tournament) {
  const players = tournament.participants || [state.currentUser.name, "نورة الشامسي", "علي الكتبي", "مريم الهاشمي"];
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">قائمة المشاركين. خيار حذف اللاعب يظهر لصاحب البطولة فقط.</p>
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
  const matches = state.matches[round] || [];
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
  const round = tournament.currentRound || tournament.startingRound || "round16";
  const matches = state.matches[round] || [];
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">ملخص توقعات المشاركين حسب مباريات الدور الحالي.</p>
      ${matches.map((match) => {
        const key = `${tournament.id}:${round}:${match.id}`;
        const prediction = state.predictions[key] || {};
        const outcome = getPredictionOutcome(prediction);
        return `
          <div class="leader-row">
            <span>${teamIdentityHtml(match.a)} ضد ${teamIdentityHtml(match.b)}</span>
            <strong>${outcome ? outcomeText(outcome, match) : "بانتظار التوقعات"}</strong>
          </div>
        `;
      }).join("") || `<p class="muted">لا توجد توقعات معروضة بعد.</p>`}
    </section>
  `;
}

function ownerLeaderboardPage(tournament) {
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">ترتيب المشاركين حسب النقاط الحالية وعدد الترشيحات.</p>
      <div class="leaderboard-list">${leaderboardRows(tournament).join("")}</div>
    </section>
  `;
}

function ownerRulesPage(tournament) {
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">القوانين التي تظهر للمشاركين داخل البطولة.</p>
      <div class="leader-row"><span>نقطة الانطلاق</span><strong>${rounds.find((round) => round.id === tournament.startingRound)?.label || "-"}</strong></div>
      <div class="leader-row"><span>ميزانية النقاط</span><strong>${tournament.budget || 0}</strong></div>
      <div class="leader-row"><span>الحد الأدنى للفريق</span><strong>${tournament.minPoints || 0}</strong></div>
      <button class="btn accent" type="button" data-route="/tournament/${tournament.id}/manage/points">تعديل قواعد النقاط</button>
      <button class="btn ghost" type="button" data-route="/tournament/${tournament.id}/manage/awards">تعديل الترشيحات والجوائز</button>
    </section>
  `;
}

function getTournamentParticipants(tournament) {
  return tournament.participants || [state.currentUser.name, "نورة الشامسي", "علي الكتبي", "مريم الهاشمي"];
}

function getVotingSummary(tournament) {
  const activeRound = tournament.currentRound || tournament.startingRound || "round16";
  const status = getVotingStatusForRound(tournament, activeRound);
  return `${status.completed.length}/${status.total}`;
}

function getVotingStatusForRound(tournament, roundId) {
  const players = getTournamentParticipants(tournament);
  const matches = state.matches[roundId] || [];
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
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">تابع من أنهى التصويت ومن لم يصوت في كل جولة. اللاعبون الذين لا يصوتون قبل القفل يخسرون نقاط الجولة حسب قواعد البطولة.</p>
      <div class="voting-round-list">
        ${tournamentRounds.map((round) => ownerVotingRoundCard(tournament, round)).join("")}
      </div>
    </section>
  `;
}

function ownerVotingRoundCard(tournament, round) {
  const status = getVotingStatusForRound(tournament, round.id);
  return `
    <article class="voting-round-card">
      <div class="voting-round-head">
        <div>
          <strong>${round.label}</strong>
          <span>${status.matchesCount} مباريات · ${status.completed.length}/${status.total} مكتمل</span>
        </div>
        <span class="championship-status-text">${status.locked ? "مغلقة حالياً" : "متابعة مباشرة"}</span>
      </div>
      <div class="voting-progress" style="--pct: ${status.total ? Math.round((status.completed.length / status.total) * 100) : 0}%"><span></span></div>
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

function votingPlayerDetailsModal(tournament, roundId, playerName, status) {
  const round = rounds.find((item) => item.id === roundId);
  const matches = state.matches[roundId] || [];
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
  const currentPlayers = tournament.participants || [state.currentUser.name, "نورة الشامسي", "علي الكتبي", "مريم الهاشمي"];
  tournament.participants = currentPlayers.filter((player) => player !== playerName);
  tournament.friends = Math.max(1, (tournament.friends || currentPlayers.length) - 1);
  Object.keys(state.quickPicks).forEach((key) => {
    if (key.startsWith(`${tournament.id}:`) && key.includes(playerName)) delete state.quickPicks[key];
  });
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
      <label class="settings-control"><span>اسم البطولة</span><input class="input" id="settings-tournament-name" value="${tournament.name}"></label>
      <label class="settings-control"><span>الخصوصية</span><select class="select" id="settings-privacy"><option value="public" ${tournament.public ? "selected" : ""}>عام</option><option value="private" ${!tournament.public ? "selected" : ""}>خاص</option></select></label>
      <label class="settings-control"><span>الحد الأقصى للمشاركين</span><input class="input" id="settings-max-players" type="number" min="2" value="${tournament.maxPlayers || Math.max(tournament.friends || 1, 16)}"></label>
      <label class="settings-control"><span>تاريخ بدء البطولة</span><input class="input" id="settings-start-date" type="date" min="${today}" value="${tournament.startDate || today}"></label>
      <label class="settings-control"><span>صورة البوست</span><input class="input" id="settings-post-image" type="file" accept="image/*"></label>
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
  const postImage = document.querySelector("#settings-post-image")?.files?.[0]?.name || "";
  if (postImage) tournament.postImageFileName = postImage;
  if (!tournament.public && !tournament.inviteCode) tournament.inviteCode = generateInviteCode();
  tournament.publicCode = tournament.public ? (tournament.publicCode || tournament.officialCompetitionCode || "PUBLIC") : "";
  renderTournamentManageSection(tournament, "settings");
}

function getTournamentPrizes(tournament) {
  if (Array.isArray(tournament.prizes)) return tournament.prizes;
  tournament.prizes = [
    { id: "p-1", rank: "المركز الأول", title: "جائزة بطل التوقعات", value: "درع البطولة", note: "تمنح لصاحب أعلى رصيد بعد نهاية البطولة." },
    { id: "p-2", rank: "المركز الثاني", title: "جائزة الوصيف", value: "ميدالية", note: "تمنح لصاحب ثاني أعلى رصيد." }
  ];
  return tournament.prizes;
}

function ownerPrizesPage(tournament) {
  const prizes = getTournamentPrizes(tournament);
  const selectedAwards = awardOptions.filter((award) => (tournament.awardCategories || []).includes(award.id));
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">أضف الجوائز الفعلية التي سيعلنها صاحب البطولة للفائزين في مسابقة التوقعات.</p>
      <div class="prize-list">
        ${prizes.length ? prizes.map(tournamentPrizeCard).join("") : `<p class="muted">لا توجد جوائز مضافة حتى الآن.</p>`}
      </div>
    </section>

    <section class="card panel stack manage-detail-card">
      <h2 class="section-title">جوائز حسب النوع</h2>
      <p class="muted">اختياري: لكل نوع ترشيح مفعّل يمكنك تحديد جائزة خاصة أو تركه بدون جائزة.</p>
      <div class="prize-list">
        ${selectedAwards.length ? selectedAwards.map((award) => awardPrizeRow(tournament, award)).join("") : `<p class="muted">لا توجد أنواع ترشيحات مفعلة. فعّل الأنواع من صفحة الجوائز والترشيحات أولاً.</p>`}
      </div>
    </section>

    <section class="card panel stack manage-detail-card">
      <h2 class="section-title">إضافة جائزة</h2>
      <div class="prize-form-grid">
        <label class="settings-control"><span>نوع الجائزة</span><select class="select" id="prize-rank"><option>المركز الأول</option><option>المركز الثاني</option><option>المركز الثالث</option><option>جائزة خاصة</option>${selectedAwards.map((award) => `<option value="${award.id}">${award.label}</option>`).join("")}</select></label>
        <label class="settings-control"><span>اسم الجائزة</span><input class="input" id="prize-title" placeholder="مثال: جائزة بطل التوقعات"></label>
        <label class="settings-control"><span>القيمة أو الوصف المختصر</span><input class="input" id="prize-value" placeholder="مثال: 500 درهم / كأس / قميص"></label>
        <label class="settings-control"><span>رقم التواصل</span><input class="input" id="prize-contact" placeholder="مثال: 0500000000"></label>
        <label class="settings-control"><span>آلية التسليم</span><input class="input" id="prize-delivery" placeholder="مثال: تواصل واتساب بعد نهاية البطولة"></label>
        <label class="settings-control wide"><span>ملاحظات</span><textarea class="textarea" id="prize-note" placeholder="شروط استلام الجائزة أو تفاصيل إضافية"></textarea></label>
      </div>
      <button class="btn accent" type="button" id="add-tournament-prize">إضافة الجائزة</button>
    </section>
  `;
}

function awardPrizeRow(tournament, award) {
  const prize = getPrizeForAward(tournament, award.id);
  return `
    <article class="prize-card award-prize-card">
      <div class="prize-rank">${prize ? "محدد" : "اختياري"}</div>
      <div>
        <strong>${award.label}</strong>
        ${prize ? `<span>${prize.title} · ${prize.value}</span>${prize.note ? `<p>${prize.note}</p>` : ""}` : `<span>لا توجد جائزة محددة لهذا النوع حالياً.</span>`}
      </div>
      ${prize ? `<button class="btn ghost compact-btn" type="button" data-remove-prize="${prize.id}">حذف</button>` : `<span class="muted">يمكن إضافتها من النموذج أدناه</span>`}
    </article>
  `;
}

function getPrizeForAward(tournament, awardId) {
  return getTournamentPrizes(tournament).find((prize) => prize.awardId === awardId || prize.rank === awardId);
}

function tournamentPrizeCard(prize) {
  return `
    <article class="prize-card">
      <div class="prize-rank">${prize.rank}</div>
      <div>
        <strong>${prize.title}</strong>
        <span>${prize.value}</span>
        ${prize.contact ? `<p>التواصل: ${prize.contact}</p>` : ""}
        ${prize.delivery ? `<p>التسليم: ${prize.delivery}</p>` : ""}
        ${prize.note ? `<p>${prize.note}</p>` : ""}
      </div>
      <button class="btn ghost compact-btn" type="button" data-remove-prize="${prize.id}">حذف</button>
    </article>
  `;
}

function addTournamentPrize(tournament) {
  const title = document.querySelector("#prize-title")?.value.trim();
  const value = document.querySelector("#prize-value")?.value.trim();
  const rank = document.querySelector("#prize-rank")?.value || "جائزة خاصة";
  const note = document.querySelector("#prize-note")?.value.trim() || "";
  const contact = document.querySelector("#prize-contact")?.value.trim() || "";
  const delivery = document.querySelector("#prize-delivery")?.value.trim() || "";
  const award = awardOptions.find((item) => item.id === rank);
  if (!title || !value) {
    openModal(`
      <section class="card modal stack">
        <div class="topbar">
          <h2 class="section-title">بيانات ناقصة</h2>
          ${modalCloseButton()}
        </div>
        <p class="muted">اكتب اسم الجائزة وقيمتها قبل الإضافة.</p>
      </section>
    `);
    document.querySelector("#close-modal").addEventListener("click", closeModal);
    return;
  }
  getTournamentPrizes(tournament).push({
    id: `p-${Date.now()}`,
    rank: award ? award.label : rank,
    awardId: award?.id || "",
    title,
    value,
    note,
    contact,
    delivery
  });
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
    <section class="card panel stack manage-detail-card">
      <h2 class="section-title">آخر الإشعارات</h2>
      ${state.notifications
        .filter((notification) => notification.tournamentId === tournament.id || notification.route === `/tournament/${tournament.id}`)
        .slice(0, 5)
        .map((notification) => `<div class="leader-row"><span>${notification.title}</span><strong>${notification.time}</strong></div>`)
        .join("") || `<p class="muted">لا توجد إشعارات مرسلة لهذه البطولة بعد.</p>`}
    </section>
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
        <label class="settings-control"><span>اسم المساعد</span><input class="input" id="admin-helper-name" placeholder="مثال: علي الكتبي"></label>
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
  renderTournamentManageSection(tournament, "admin-team");
}

function ownerPointsPage(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const selectedRoundId = tournamentRounds.some((round) => round.id === state.selectedPointRuleRound)
    ? state.selectedPointRuleRound
    : tournamentRounds[0]?.id;
  state.selectedPointRuleRound = selectedRoundId || "";
  const selectedRound = tournamentRounds.find((round) => round.id === selectedRoundId) || tournamentRounds[0];
  return `
    <section class="card panel stack manage-detail-card">
      <p class="muted">اختر قانون النقاط لكل دور من الأدوار التي ستبدأ منها البطولة.</p>
      <div class="notice">التوقعات تقفل قبل ${PREDICTION_LOCK_MINUTES} دقيقة من بداية أول مباراة في الدور.</div>
      <div class="notice danger-notice">قاعدة عامة: أي لاعب يصل رصيده إلى أقل من الحد الأدنى للتصويت لكل فريق يتم إقصاؤه من البطولة تلقائياً.</div>
    </section>
    <section class="point-rules-tabs" role="tablist" aria-label="أدوار قواعد النقاط">
      ${tournamentRounds.map((round) => pointRuleRoundTab(tournament, round, round.id === selectedRoundId)).join("")}
    </section>
    <section class="point-rules-list">
      ${selectedRound ? pointRuleCard(tournament, selectedRound) : ""}
    </section>
    <section class="card panel stack manage-detail-card">
      <button class="btn accent" type="button">حفظ قواعد النقاط</button>
    </section>
  `;
}

function pointRuleRoundTab(tournament, round, isActive) {
  const rule = getTournamentPointRules(tournament)[round.id];
  const locked = isPointRuleRoundLocked(tournament, round.id);
  return `
    <button class="point-rule-tab ${isActive ? "active" : ""} ${locked ? "locked" : ""}" type="button" role="tab" aria-selected="${isActive}" data-point-rule-round-tab="${round.id}">
      <strong>${round.label}</strong>
      <span>${locked ? "مقفل" : pointRuleTypeLabel(rule)}</span>
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
  if (roundIndex === 0 && rule.pointSource === "carry") rule.pointSource = "grant";
  rule.__locked = locked;
  const fieldsHtml = pointRuleFields(round.id, rule, roundIndex);
  delete rule.__locked;
  return `
    <article class="card panel point-rule-card ${locked ? "locked" : ""}">
      <div class="point-rule-head">
        <div>
          <h2 class="section-title">${round.label}</h2>
          <p class="muted">${pointRuleDescription(rule)}</p>
        </div>
        <span class="championship-status-text">${locked ? "التعديل مقفل" : pointRuleTypeLabel(rule)}</span>
      </div>
      ${locked ? `<div class="notice danger-notice">بدأت هذه الجولة أو تم فتحها فعلياً، لذلك لا يمكن تعديل قواعد النقاط الخاصة بها. القواعد التالية للقراءة فقط.</div>` : ""}
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
  if (!rule.__locked) return html;
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
    <div class="point-rule-example"><strong>طريقة ظهور التوقع للاعب</strong><span>النظام يعرض فوز أو خسارة فقط في الأدوار الإقصائية، ويضيف التعادل تلقائياً في الدوريات أو دور المجموعات.</span></div>
  `;
}

function percentNominationFields(roundId, rule) {
  const loserPercent = getFixedPercentLoserShare(rule);
  return `
    <label class="settings-control"><span>إعداد النسب</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="percentMode">
      <option value="fixed" ${rule.percentMode !== "minimum" ? "selected" : ""}>نسب ثابتة لكل مباراة</option>
      <option value="minimum" ${rule.percentMode === "minimum" ? "selected" : ""}>حد أدنى للفريق</option>
    </select></label>
    ${rule.percentMode === "minimum" ? `
      <label class="settings-control"><span>أقل نسبة مسموحة لأي طرف</span><input class="input" type="number" min="1" max="49" data-point-rule-round="${roundId}" data-point-rule-field="minPercent" value="${rule.minPercent}"></label>
      <div class="point-rule-example">${variablePercentRuleExample(rule)}</div>
    ` : `
      <label class="settings-control"><span>نسبة الفريق المرشح للفوز</span><input class="input" type="number" min="1" max="99" data-point-rule-round="${roundId}" data-point-rule-field="winnerPercent" value="${getFixedPercentWinnerShare(rule)}"></label>
      <div class="point-rule-example"><strong>نسبة الفريق الآخر</strong><span>${loserPercent}% محسوبة تلقائياً لأن مجموع النسب يجب أن يساوي 100%.</span></div>
      <div class="point-rule-example">${fixedPercentRuleExample(rule)}</div>
    `}
  `;
}

function pointsNominationFields(roundId, rule) {
  const totalPoints = getFixedMatchPointTotal(rule);
  const winnerPoints = getFixedMatchWinnerPoints(rule);
  const loserPoints = getFixedMatchLoserPoints(rule);
  return `
    <label class="settings-control"><span>إعداد النقاط</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="pointsMode">
      <option value="fixed" ${rule.pointsMode === "fixed" ? "selected" : ""}>نقاط ثابتة للترشيح لكل فريق</option>
      <option value="minimum" ${rule.pointsMode !== "fixed" ? "selected" : ""}>حد أدنى للنقاط لكل فريق</option>
    </select></label>
    ${rule.pointsMode === "fixed" ? `
      <label class="settings-control"><span>إجمالي نقاط المباراة</span><input class="input" type="number" min="2" data-point-rule-round="${roundId}" data-point-rule-field="matchPointsTotal" value="${totalPoints}"></label>
      <label class="settings-control"><span>نقاط الفريق المرشح للفوز</span><input class="input" type="number" min="1" max="${Math.max(1, totalPoints - 1)}" data-point-rule-round="${roundId}" data-point-rule-field="winnerPoints" value="${winnerPoints}"></label>
      <div class="point-rule-example"><strong>نقاط الفريق الآخر</strong><span>${loserPoints} نقطة محسوبة تلقائياً من إجمالي نقاط المباراة.</span></div>
      <div class="point-rule-example"><strong>نقاط ثابتة</strong><span>الأدمن يحدد إجمالي نقاط المباراة ونقاط الترشيح الأعلى، والنظام يضع باقي النقاط للطرف الآخر.</span></div>
    ` : `
      <label class="settings-control"><span>الحد الأدنى للنقاط لكل فريق</span><input class="input" type="number" data-point-rule-round="${roundId}" data-point-rule-field="minPoints" value="${rule.minPoints}"></label>
      <div class="point-rule-example"><strong>توزيع نقاط</strong><span>النظام يقسم نقاط الدور على المباريات، واللاعب يوزع النقاط بشرط ألا يقل أي فريق عن الحد الأدنى.</span></div>
    `}
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
    <label class="settings-control"><span>الجوكر</span><select class="select" data-point-rule-round="${roundId}" data-point-rule-field="jokerEnabled">
      <option value="false" ${rule.jokerEnabled ? "" : "selected"}>غير مفعل</option>
      <option value="true" ${rule.jokerEnabled ? "selected" : ""}>مفعل</option>
    </select></label>
    ${rule.jokerEnabled ? `<label class="settings-control"><span>عدد مباريات الجوكر في الجولة</span><input class="input" type="number" min="1" data-point-rule-round="${roundId}" data-point-rule-field="jokerUses" value="${rule.jokerUses || 1}"></label>` : ""}
    ${rule.jokerEnabled ? `<div class="point-rule-example"><strong>آلية الجوكر</strong><span>إذا استخدم اللاعب الجوكر على توقع صحيح، تتضاعف النقاط التي حصل عليها من هذا التوقع.</span></div>` : ""}
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
  return `
    <section class="card panel stack manage-detail-card">
      <div class="notice danger-notice">هذه الخيارات تؤثر على البطولة والمشاركين. تستخدم فقط عند الحاجة.</div>
      <button class="btn warn" type="button" id="toggle-join-window">${tournament.joinClosed ? "إعادة فتح استقبال المشاركين" : "إيقاف استقبال المشاركين"}</button>
      <label class="settings-control wide"><span>سبب إلغاء البطولة</span><textarea class="textarea" id="cancel-tournament-reason" placeholder="اكتب سبب الإلغاء ليظهر في سجل الإدارة والتنبيهات.">${tournament.cancelReason || ""}</textarea></label>
      <button class="btn danger-btn" type="button" id="cancel-tournament-button">إلغاء البطولة</button>
      <p class="muted" id="danger-action-status">${tournament.cancelReason ? `آخر سبب: ${tournament.cancelReason}` : ""}</p>
    </section>
  `;
}

function toggleJoinWindow(tournament) {
  tournament.joinClosed = !tournament.joinClosed;
  renderTournamentManageSection(tournament, "danger");
}

function cancelTournamentWithReason(tournament) {
  const reason = document.querySelector("#cancel-tournament-reason")?.value.trim();
  const status = document.querySelector("#danger-action-status");
  if (!reason) {
    if (status) {
      status.textContent = "اكتب سبب الإلغاء قبل تنفيذ الإجراء.";
      status.classList.add("form-error-inline");
    }
    return;
  }
  tournament.active = false;
  tournament.cancelled = true;
  tournament.cancelReason = reason;
  state.notifications.unshift({
    id: `n-cancel-${Date.now()}`,
    type: "tournament-update",
    title: `تم إلغاء ${tournament.name}`,
    body: reason,
    time: "الآن",
    icon: "trophy",
    unread: true,
    route: `/tournament/${tournament.id}`,
    tournamentId: tournament.id
  });
  renderTournamentManageSection(tournament, "danger");
}

function getTournamentRounds(tournament) {
  const startIndex = Math.max(0, rounds.findIndex((round) => round.id === (tournament.startingRound || "round16")));
  return rounds.slice(startIndex);
}

function getNextRound(tournament) {
  const tournamentRounds = getTournamentRounds(tournament);
  const currentIndex = tournamentRounds.findIndex((round) => round.id === tournament.currentRound);
  return currentIndex >= 0 ? tournamentRounds[currentIndex + 1] : null;
}

function advanceTournamentRound(tournamentId) {
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) return;
  const nextRound = getNextRound(tournament);
  if (!nextRound) return;
  tournament.currentRound = nextRound.id;
  state.selectedRound = nextRound.id;
  renderTournament(tournament.id);
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
  const teams = searchOfficialTeams(query).slice(0, 6);
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

function searchOfficialTeams(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  const teams = [...new Set(Object.values(state.matches).flat().flatMap((match) => [match.a, match.b]))]
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

function getTeamIdentity(teamName) {
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
  if (apiTeam?.logoUrl) return { type: "logo", mark: crestLabels[teamName] || teamName.trim().charAt(0) || "•", logoUrl: apiTeam.logoUrl };
  if (flags[teamName]) return { type: "flag", mark: flags[teamName] };
  return { type: "crest", mark: crestLabels[teamName] || teamName.trim().charAt(0) || "•" };
}

function teamIdentityHtml(teamName, className = "") {
  const identity = getTeamIdentity(teamName);
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
      ${teamIdentityHtml(match.a)}
      <span class="match-versus">VS</span>
      ${teamIdentityHtml(match.b)}
    </span>
  `;
}

function pickBoardWorkflow(tournament, round, matches) {
  if (!matches.length) return "";
  const sortedMatches = sortPredictionMatches(tournament.id, round, matches);
  const pickedCount = matches.filter((match) => isPredictionComplete(tournament.id, round, match.id)).length;
  const locked = isPredictionLocked(matches);
  const roundLabel = rounds.find((item) => item.id === round)?.label || "الجولة الحالية";
  const hasDraw = predictionOutcomes(round, matches[0]).some((outcome) => outcome.value === "draw");
  const totalBudget = tournament.budget || 0;
  const minPoints = tournament.minPoints || 0;
  const firstKickoff = Math.min(...matches.map((match) => new Date(match.kickoff).getTime()));
  const roundLockAt = getRoundPredictionLockAt(round);
  const rule = getTournamentPointRules(tournament)[round] || {};
  const playerGuide = pointRulePlayerGuide(rule, { hasDraw, totalBudget, minPoints, matchCount: matches.length });

  return `
    <section class="panel pick-board-shell">
      <div class="pick-board-hero">
        <div>
          <div class="pick-board-title-line">
            <h2 class="section-title">توقع النتائج - ${roundLabel}</h2>
            <span class="prediction-progress-chip">${pickedCount}/${matches.length} ${locked ? "مقفلة" : "مكتملة"}</span>
          </div>
          <p class="muted">${playerGuide.summary}</p>
        </div>
      </div>

      <div class="prediction-guide">
        ${playerGuide.items.map((item) => `<span>${item}</span>`).join("")}
      </div>

      <div class="match-countdown round-vote-countdown" data-match-countdown data-countdown-mode="round" data-kickoff="${new Date(firstKickoff).toISOString()}" data-lock-at="${roundLockAt}">
        <span data-countdown-label>يتم حساب وقت قفل الجولة</span>
        <strong data-countdown-value>--:--:--</strong>
        <small data-countdown-lock>قفل التصويت قبل أول مباراة في الجولة بـ ${PREDICTION_LOCK_MINUTES} دقيقة</small>
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
      <h3 class="prediction-time-title">${formatDate(kickoff)}</h3>
      <div class="prediction-time-list">
        ${groupMatches.map((match) => pickBoardCard(tournament, round, match, locked)).join("")}
      </div>
    </section>
  `).join("");
}

function pickBoardCard(tournament, round, match, locked) {
  const key = `${tournament.id}:${round}:${match.id}`;
  const picked = state.quickPicks[key];
  const prediction = state.predictions[key] || {};
  const rule = getPointRuleForRound(tournament, round);
  const manualPoints = requiresManualPredictionPoints(rule);
  const inlinePick = supportsInlinePrediction(rule);
  const allocated = getPredictionPoints(prediction);
  const completed = isPredictionComplete(tournament.id, round, match.id);
  const missed = !completed && locked;
  const statusText = completed ? "مكتمل" : missed ? "لم يتم التصويت" : "بانتظار التصويت";
  const statusClass = completed ? "done" : missed ? "missed" : "todo";
  const selectedOutcome = picked || getPredictionOutcome(prediction);
  const selectedLabel = selectedOutcome ? outcomeText(selectedOutcome, match) : "لم يتم الاختيار";
  const actionLabel = locked ? "مقفل" : completed ? "تعديل" : "تصويت";
  const errorText = state.predictionErrors[key] || "";

  return `
    <article class="prediction-row-card ${completed ? "completed" : "pending"} ${inlinePick ? "inline-pick" : "manual-points"}">
      <div class="prediction-controls">
        <button class="btn accent compact-btn prediction-confirm-btn" ${inlinePick ? `data-inline-confirm="${match.id}"` : `data-predict="${match.id}"`} ${locked ? "disabled" : ""}>${actionLabel}</button>
      </div>
      <div class="prediction-row-main">
        <div class="prediction-teams">
          ${predictionTeamButton(tournament, round, match, match.a, selectedOutcome, locked, inlinePick)}
          ${isDrawAllowed(round) && inlinePick ? predictionDrawButton(tournament, round, match, selectedOutcome, locked) : `<b>VS</b>`}
          ${predictionTeamButton(tournament, round, match, match.b, selectedOutcome, locked, inlinePick)}
        </div>
        <div class="prediction-row-info">
          <span class="prediction-status ${statusClass}">${statusText}</span>
          ${selectedOutcome ? `<span>التوقع: <strong>${selectedLabel}</strong></span>` : ""}
          ${allocated ? `<span>النقاط: <strong>${allocated}</strong></span>` : ""}
        </div>
      </div>
      ${errorText ? `<div class="prediction-inline-error">${errorText}</div>` : ""}
    </article>
  `;
}

function supportsInlinePrediction(rule) {
  if (rule.pointSource === "league") return false;
  if (rule.nominationType === "points") return rule.pointsMode === "fixed";
  return rule.percentMode === "fixed";
}

function predictionTeamButton(tournament, round, match, team, selectedOutcome, locked, inlinePick) {
  if (!inlinePick) return `<span>${teamIdentityHtml(team)}</span>`;
  const selected = selectedOutcome === team ? "selected" : "";
  return `
    <button class="prediction-team-pick ${selected}" type="button" data-inline-pick="${match.id}" data-outcome="${team}" ${locked ? "disabled" : ""}>
      ${teamIdentityHtml(team)}
    </button>
  `;
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
  const match = state.matches[round].find((item) => item.id === matchId);
  if (!match || isPredictionLocked(state.matches[round] || [])) return;
  const rule = getPointRuleForRound(tournament, round);
  if (!supportsInlinePrediction(rule)) {
    predictionModal(tournament, round, matchId);
    return;
  }
  const key = `${tournament.id}:${round}:${match.id}`;
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
  delete state.predictionErrors[key];
  renderTournament(tournament.id);
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

function predictionOutcomeCompactHtml(outcome, match) {
  if (outcome.value === "draw") return `<span><b>تعادل</b><small>نقطة وسط</small></span>`;
  const teamName = outcome.value === match.a ? match.a : match.b;
  return `<span><b>فوز</b><small>${teamName}</small></span>`;
}

function matchTemplate(tournament, round, match) {
  const locked = isPredictionLocked(state.matches[round] || [match]);
  const existing = state.predictions[`${tournament.id}:${round}:${match.id}`] || {};
  const pickedOutcome = getPredictionOutcome(existing);
  const points = getPredictionPoints(existing);
  const lockAt = getRoundPredictionLockAt(round);
  return `
    <article class="match-card">
      <div class="match-top">
        <strong>${matchIdentityHtml(match)}</strong>
        <span class="muted">${formatDate(match.kickoff)}</span>
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
  const match = state.matches[round].find((item) => item.id === matchId);
  if (isPredictionLocked(state.matches[round] || [])) return;
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

function getAutoPredictionPoints(tournament, round, match, outcome, rule) {
  if (rule.pointSource === "league") return Math.max(1, Number(rule.correctPoints) || 10);
  if (rule.nominationType === "points" && rule.pointsMode === "fixed") {
    if (outcome && outcome !== "draw") return getFixedMatchWinnerPoints(rule);
    return Math.max(1, Math.round(getFixedMatchPointTotal(rule) / 2));
  }

  const matches = state.matches[round] || [];
  const matchCount = Math.max(1, matches.length);
  const roundBudget = rule.pointSource === "grant" ? Number(rule.budget || tournament.budget || 0) : Number(tournament.points || tournament.budget || rule.budget || 0);
  const perMatch = roundBudget / matchCount;

  if (rule.nominationType === "percent") {
    if (rule.percentMode === "fixed") {
      const share = outcome === "draw" ? 50 : getFixedPercentWinnerShare(rule);
      return Math.max(1, Math.round(perMatch * (share / 100)));
    }
    return Math.max(1, Math.round(perMatch));
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
  const quota = getApiSportsQuota();
  const time = state.liveApi.lastFetchAt ? ` · آخر تحديث ${formatDate(new Date(state.liveApi.lastFetchAt).toISOString())}` : "";
  const error = state.liveApi.lastError ? ` · ${state.liveApi.lastError}` : "";
  return `${state.liveApi.lastStatus}${time} · ${quota.count}/100 طلب اليوم${error}`;
}

function liveApiKeyModal() {
  openModal(`
    <form class="card modal stack" id="live-api-key-form">
      <div class="modal-title-row">
        <h2 class="section-title">ربط API النتائج</h2>
        <button class="icon-btn" type="button" id="close-modal" aria-label="إغلاق">×</button>
      </div>
      <p class="muted">ضع مفتاح API-Sports للاختبار. سيتم حفظه في هذا المتصفح فقط، وليس مناسباً للنشر الرسمي بدون Backend Proxy.</p>
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
  const key = getApiSportsKey();
  if (!key) {
    state.liveApi.lastError = "أدخل مفتاح API أولاً";
    liveApiKeyModal();
    return;
  }
  const quota = getApiSportsQuota();
  if (quota.count >= 100) {
    state.liveApi.lastStatus = "تم إيقاف التحديث";
    state.liveApi.lastError = "وصلت إلى 100 طلب اليوم";
    renderTournament(tournament.id);
    return;
  }

  state.liveApi.lastStatus = "جاري تحديث النتائج";
  state.liveApi.lastError = "";
  renderTournament(tournament.id);

  try {
    const response = await fetch(state.liveApi.endpoint, {
      headers: {
        "x-apisports-key": key
      }
    });
    incrementApiSportsQuota();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const events = normalizeApiSportsLivePayload(payload);
    const applied = applyLiveResultEvents(tournament, round, events);
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
  }
  renderTournament(tournament.id);
}

function normalizeApiSportsLivePayload(payload) {
  const list = Array.isArray(payload?.response) ? payload.response : [];
  return list.map((item) => {
    const fixture = item.fixture || item;
    const teams = item.teams || fixture.teams || {};
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
      score: homeGoals !== undefined && awayGoals !== undefined ? `${homeGoals} - ${awayGoals}` : "",
      statusShort: status.short || item.statusShort || "",
      statusLong: status.long || item.statusLong || "",
      elapsed: status.elapsed || item.elapsed || "",
      raw: item
    };
  }).filter((event) => event.homeName || event.awayName || event.score || event.statusShort);
}

function applyLiveResultEvents(tournament, round, events) {
  const matches = state.matches[round] || [];
  let applied = 0;
  events.forEach((event) => {
    if (!isRelevantResultEvent(event)) return;
    const match = matches.find((item) => isSameFixture(item, event));
    if (!match) return;
    const nextScore = event.score || match.score;
    const nextStatus = event.statusShort || event.statusLong || "";
    if (nextScore && nextScore !== match.score) {
      match.score = nextScore;
      applied += 1;
    }
    if (nextStatus && nextStatus !== match.statusShort) {
      match.statusShort = nextStatus;
      match.minute = event.elapsed || match.minute || "";
      applied += 1;
    }
  });
  return applied;
}

function isRelevantResultEvent(event) {
  const status = String(event.statusShort || "").toUpperCase();
  return Boolean(event.score) || ["HT", "FT", "AET", "PEN"].includes(status);
}

function isSameFixture(match, event) {
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
  if (manualPoints && total > tournament.budget) {
    return `مجموع النقاط ${total} يتخطى الميزانية ${tournament.budget}.`;
  }
  return "";
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
  const firstKickoff = Math.min(...matches.map((match) => new Date(match.kickoff).getTime()));
  return Date.now() >= firstKickoff - PREDICTION_LOCK_MINUTES * 60 * 1000;
}

function getRoundPredictionLockAt(round) {
  const matches = state.matches[round] || [];
  if (!matches.length) return "";
  const firstKickoff = Math.min(...matches.map((match) => new Date(match.kickoff).getTime()));
  return String(firstKickoff - PREDICTION_LOCK_MINUTES * 60 * 1000);
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
    box.classList.toggle("live", mode !== "round" && now >= kickoff && now < resultAt);
    box.classList.toggle("finished", mode !== "round" && now >= resultAt);

    if (now < lockAt) {
      label.textContent = mode === "round" ? "ينتهي تصويت الجولة بعد" : "ينتهي التصويت بعد";
      value.textContent = formatCountdown(lockAt - now);
      lock.textContent = mode === "round"
        ? `قفل الجولة قبل أول مباراة بـ ${PREDICTION_LOCK_MINUTES} دقيقة`
        : `قفل الجولة قبل أول مباراة. هذه المباراة تبدأ بعد ${formatCountdown(kickoff - now)}`;
      return;
    }

    if (mode === "round") {
      label.textContent = "تصويت الجولة مقفل";
      value.textContent = "مغلق";
      lock.textContent = "لا يمكن تعديل توقعات أي مباراة في هذه الجولة بعد القفل.";
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
  const joinedTournaments = state.tournaments.filter((tournament) => tournament.joined && tournament.active);
  const selectedTournament = joinedTournaments.find((tournament) => tournament.id === state.selectedLiveTournamentId) || joinedTournaments[0] || null;
  if (selectedTournament && state.selectedLiveTournamentId !== selectedTournament.id) {
    state.selectedLiveTournamentId = selectedTournament.id;
  }
  const liveMatches = selectedTournament ? getTournamentLiveMatches(selectedTournament) : [];

  app.innerHTML = `
    ${templateTopbar("المباريات الحية")}
    <section class="grid">
      <div class="card panel">
        <h1 class="section-title">المباشر</h1>
        <p class="muted">تظهر هنا فقط البطولات التي أنت مشارك فيها. اختر بطولة لعرض نتائجها الحية وتأثيرها على رصيدك.</p>
      </div>
      ${joinedTournaments.length ? `
        <div class="live-tournament-list">
          ${joinedTournaments.map((tournament) => `
            <button class="live-tournament-tab ${selectedTournament && selectedTournament.id === tournament.id ? "active" : ""}" data-live-tournament="${tournament.id}">
              <strong>${tournament.name}</strong>
              <span>${tournament.points} pts · Rank #${tournament.rank || "-"}</span>
            </button>
          `).join("")}
        </div>
        <div class="card panel">
          <div class="topbar">
            <div>
              <h2 class="section-title">${selectedTournament.name}</h2>
              <p class="muted">Live results from this championship only.</p>
            </div>
            <span class="badge">${selectedTournament.publicCode || "JOINED"}</span>
          </div>
          <div class="live-grid">
            ${liveMatches.map(liveMatchCard).join("")}
          </div>
        </div>
      ` : `
        <div class="card panel">
          <p class="muted">أنت غير مشارك في أي بطولة نشطة حالياً. انضم إلى بطولة Public من صفحة Search.</p>
          <button class="btn accent" data-route="/search">Go to Search</button>
        </div>
      `}
    </section>
  `;

  document.querySelectorAll("[data-live-tournament]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLiveTournamentId = button.dataset.liveTournament;
      render();
    });
  });
}

function getTournamentLiveMatches(tournament) {
  const round = tournament.currentRound || tournament.startingRound || "round16";
  const matches = state.matches[round] || [];
  return matches.slice(0, 3).map((match, index) => {
    const score = match.score || (index === 0 ? "2 - 1" : index === 1 ? "0 - 0" : "1 - 1");
    const minute = index === 0 ? "67" : index === 1 ? "52" : "83";
    const prediction = state.quickPicks[`${tournament.id}:${round}:${match.id}`];
    const impact = prediction
      ? prediction === match.a ? "+80 محتملة" : "-45 حالياً"
      : "لا يوجد توقع";
    return {
      ...match,
      tournamentName: tournament.name,
      minute: match.minute || minute,
      statusShort: match.statusShort || "",
      score,
      impact
    };
  });
}

function liveMatchCard(match) {
  return `
    <article class="match-card">
      <div class="match-top">
        <span class="badge">${match.statusShort ? liveStatusLabel(match.statusShort) : `الدقيقة ${match.minute}`}</span>
        <span class="muted">${match.tournamentName}</span>
      </div>
      <div class="live-score">
        ${teamIdentityHtml(match.a, "compact")}
        <span>${match.score}</span>
        ${teamIdentityHtml(match.b, "compact")}
      </div>
      <div class="stat-line"><span>أثرها على رصيدك</span><strong>${match.impact}</strong></div>
    </article>
  `;
}

function liveStatusLabel(status) {
  const value = String(status || "").toUpperCase();
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
    if (type === "created") return item.owner === "سالم" || item.owner === state.currentUser.name;
    if (type === "joined") return item.joined;
    if (type === "drafts") return item.draft;
    if (type === "history") return !item.active && !item.draft;
    return true;
  });

  app.innerHTML = `
    ${templateTopbar(labels[type] || "التحديات")}
    <section class="card panel stack">
      <h1 class="section-title">${labels[type] || "التحديات"}</h1>
      ${filtered.length ? filtered.map((item) => `
        <button class="draft-row" data-route="${item.draft ? "/create-tournament/new" : `/tournament/${item.id}`}">
          <strong>${item.name}</strong>
          <span class="badge">${item.draft ? "مسودة" : item.active ? "نشطة" : "منتهية"}</span>
        </button>
      `).join("") : `<p class="muted">لا توجد عناصر حالياً.</p>`}
    </section>
  `;
}

function renderUser(username) {
  const user = state.users.find((item) => item.username === username) || {
    name: toDisplayName(username),
    username,
    handle: `@${username}`,
    relation: isFollowingPerson(toDisplayName(username).split(" ")[0]) ? "Unfollow" : "Follow back"
  };
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
            <div class="stats-row">
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
          </div>
        </div>
        <div class="profile-bio">
          <h1 class="profile-name">${profile.name}</h1>
          <div class="muted">${profile.handle}</div>
          <div class="muted">${state.language === "en" ? "Favorite team" : "الفريق المفضل"}: ${profile.favoriteTeam || (state.language === "en" ? "Not set" : "غير محدد")}</div>
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
  const samples = {
    noura: { accuracy: 91, followersCount: 128, followingCount: 84, favoriteTeam: "الهلال", avatar: "ن" },
    ali: { accuracy: 86, followersCount: 97, followingCount: 65, favoriteTeam: "النصر", avatar: "ع" },
    maryam: { accuracy: 88, followersCount: 112, followingCount: 71, favoriteTeam: "العين", avatar: "م" },
    khaled: { accuracy: 82, followersCount: 74, followingCount: 58, favoriteTeam: "الوصل", avatar: "خ" }
  };
  const fallback = samples[user.username] || {};
  return {
    ...user,
    avatar: user.avatar || fallback.avatar || user.name.charAt(0),
    avatarUrl: user.avatarUrl || "",
    accuracy: user.accuracy || fallback.accuracy || 78,
    followersCount: user.followersCount || fallback.followersCount || 0,
    followingCount: user.followingCount || fallback.followingCount || 0,
    favoriteTeam: user.favoriteTeam || fallback.favoriteTeam || ""
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

function peopleModal(kind) {
  const title = kind === "followers" ? "Followers" : "Following";
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
  return `<button class="btn ghost modal-close-btn" type="button" id="close-modal" aria-label="Close" title="Close">×</button>`;
}

function peopleListHtml(kind) {
  const people = kind === "followers" ? state.currentUser.followers : state.currentUser.following;
  if (!people.length) return `<p class="muted">لا توجد أسماء حالياً.</p>`;

  return people.map((name) => {
    const isFollowing = isFollowingPerson(name);
    const profile = getPersonProfile(name);
    const action = kind === "following" || isFollowing ? "unfollow" : "follow-back";
    const label = action === "unfollow" ? "Unfollow" : "Follow back";
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
    return;
  }

  state.currentUser.following = state.currentUser.following.filter((item) => item !== name);
  syncUserRelation(name, "Follow back");
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
        <h2 class="section-title">Edit Profile</h2>
        ${modalCloseButton()}
      </div>
      <div class="profile-edit-preview">
        <label class="avatar-upload" for="profile-photo" aria-label="Change profile photo" title="Change profile photo">
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
        <label>الفريق المفضل</label>
        <input class="input" id="profile-team" value="${user.favoriteTeam || ""}">
      </div>
      <div class="error-text" id="profile-error"></div>
      <div class="topbar">
        <button class="btn ghost" type="button" id="cancel-profile">Cancel</button>
        <button class="btn accent" type="submit">Save Changes</button>
      </div>
    </form>
  `);

  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#cancel-profile").addEventListener("click", closeModal);
  document.querySelector("#profile-photo").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      document.querySelector("#profile-error").textContent = "يرجى اختيار ملف صورة.";
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
  document.querySelector("#edit-profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#profile-name").value.trim();
    let handle = document.querySelector("#profile-handle").value.trim();
    const favoriteTeam = document.querySelector("#profile-team").value.trim();

    if (!name || !handle) {
      document.querySelector("#profile-error").textContent = "الاسم واسم المستخدم مطلوبان.";
      return;
    }
    if (!handle.startsWith("@")) handle = `@${handle}`;
    if (!/^@[A-Za-z0-9_]{3,20}$/.test(handle)) {
      document.querySelector("#profile-error").textContent = "اسم المستخدم يجب أن يكون 3-20 حرفاً أو رقماً أو شرطة سفلية.";
      return;
    }

    state.currentUser = {
      ...state.currentUser,
      name,
      handle,
      avatar: name[0],
      avatarUrl: selectedAvatarUrl,
      favoriteTeam
    };
    closeModal();
    render();
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
      profileShareModal(profileUrl, "Profile link copied.");
      return;
    }
  } catch {
    // Fall back to showing the link below.
  }

  profileShareModal(profileUrl, "Copy this profile link.");
}

function profileShareModal(profileUrl, message) {
  openModal(`
    <section class="card modal stack">
      <div class="topbar">
        <h2 class="section-title">Share Profile</h2>
        ${modalCloseButton()}
      </div>
      <p class="muted">${message}</p>
      <input class="input" readonly value="${profileUrl}">
      <button class="btn accent" id="copy-profile-link">Copy Link</button>
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
        <h2 class="section-title">Profile Settings</h2>
        ${modalCloseButton()}
      </div>
      <div class="settings-list">
        <div class="settings-row language-settings-row">
          <span>Language</span>
          ${languageToggle()}
        </div>
        <div class="settings-row theme-settings-row">
          <span>المظهر</span>
          ${themeToggle()}
        </div>
        <button class="settings-row" id="settings-notifications">
          <span>لوحة التنبيهات</span>
          <strong>›</strong>
        </button>
        <button class="settings-row" id="settings-edit-profile">
          <span>Edit profile details</span>
          <strong>›</strong>
        </button>
        <button class="settings-row" id="settings-share-profile">
          <span>Share profile</span>
          <strong>›</strong>
        </button>
        <button class="settings-row danger-row" id="settings-logout">
          <span>تسجيل الخروج</span>
          <strong>›</strong>
        </button>
      </div>
    </section>
  `);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
  document.querySelector("#settings-notifications").addEventListener("click", notificationSettingsModal);
  document.querySelector("#settings-edit-profile").addEventListener("click", editProfileModal);
  document.querySelector("#settings-share-profile").addEventListener("click", shareProfile);
  document.querySelector("#settings-logout").addEventListener("click", () => {
    closeModal();
    navigate("/login");
  });
}

function leaderboardRows(tournament, options = {}) {
  const rows = leaderboardData(tournament, options);
  const visibleRows = options.limit ? rows.slice(0, options.limit) : rows;
  return visibleRows.map((row, index) => `
    <div class="leader-row leaderboard-entry">
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
  const basePoints = Number(tournament.points) || Number(tournament.budget) || 0;
  const currentCorrect = Number(tournament.correct) || 0;
  const currentWrong = Number(tournament.wrong) || 0;
  const liveImpacts = options.live ? liveLeaderboardImpacts(tournament, options.round) : {};
  return [
    { name: state.currentUser.name, points: basePoints, correct: currentCorrect, wrong: currentWrong },
    { name: "نورة الشامسي", points: basePoints - 40, correct: Math.max(0, currentCorrect + 1), wrong: currentWrong + 1 },
    { name: "علي الكتبي", points: basePoints + 90, correct: currentCorrect + 3, wrong: Math.max(0, currentWrong) },
    { name: "مريم الهاشمي", points: basePoints - 160, correct: Math.max(0, currentCorrect - 1), wrong: currentWrong + 3 },
    { name: "سالم المنصوري", points: basePoints - 210, correct: Math.max(0, currentCorrect - 2), wrong: currentWrong + 4 }
  ].map((row, index) => {
    const liveDelta = liveImpacts[index] || 0;
    return { ...row, liveDelta, points: row.points + liveDelta, total: row.correct + row.wrong };
  }).sort((a, b) => b.points - a.points);
}

function liveLeaderboardImpacts(tournament, round) {
  const matches = state.matches[round || tournament.currentRound] || [];
  if (!tournament.active || !matches.length) return {};
  const activeMatches = matches.filter((match) => match.score || ["HT", "FT", "AET", "PEN"].includes(String(match.statusShort || "").toUpperCase())).slice(0, 2);
  const impacts = {};

  activeMatches.forEach((match, matchIndex) => {
    const [homeGoals, awayGoals] = parseMatchScore(match.score);
    if (homeGoals === null || awayGoals === null) return;
    const leader = homeGoals === awayGoals ? "draw" : homeGoals > awayGoals ? match.a : match.b;
    const simulatedPicks = [
      getPredictionOutcome(state.predictions[`${tournament.id}:${round}:${match.id}`] || {}) || match.a,
      match.b,
      match.a,
      matchIndex % 2 ? match.a : match.b,
      matchIndex % 2 ? match.b : match.a
    ];

    simulatedPicks.forEach((pick, index) => {
      const correctNow = pick === leader;
      const swing = correctNow ? 18 + (matchIndex * 6) : -10 - (matchIndex * 4);
      impacts[index] = (impacts[index] || 0) + swing;
    });
  });

  return impacts;
}

function parseMatchScore(score) {
  const match = String(score || "").match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) return [null, null];
  return [Number(match[1]), Number(match[2])];
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
  return new Intl.DateTimeFormat("ar-AE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

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

render();

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
