const SESSION_KEY = "wc2026-live-session-v1";
const RANK_SNAPSHOT_KEY = "wc2026-rank-snapshot-v1";
const APP_TIME_ZONE = "Asia/Dubai";
const APP_TIME_OFFSET_MINUTES = 4 * 60;
const WINNER_POSTER_TEMPLATE = "assets/winner-poster-template.jpg";
let deferredInstallPrompt = null;

const rounds = [
  { id: "r32", name: "Ø¯ÙˆØ± Ø§Ù„Ù€ 32" },
  { id: "r16", name: "Ø¯ÙˆØ± Ø§Ù„Ù€ 16" },
  { id: "qf", name: "Ø±Ø¨Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ" },
  { id: "sf", name: "Ù†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ" },
  { id: "final", name: "Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ" }
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
  sf: 1
};

const fixedChampionTeams = [
  { name: "Ø§Ù„Ø¨Ø±Ø§Ø²ÙŠÙ„", image: "https://flagcdn.com/w160/br.png" },
  { name: "ÙØ±Ù†Ø³Ø§", image: "https://flagcdn.com/w160/fr.png" },
  { name: "Ø§Ø³Ø¨Ø§Ù†ÙŠØ§", image: "https://flagcdn.com/w160/es.png" },
  { name: "Ø§Ù„Ø§Ø±Ø¬Ù†ØªÙŠÙ†", image: "https://flagcdn.com/w160/ar.png" },
  { name: "Ø§Ù„Ø¨Ø±ØªØºØ§Ù„", image: "https://flagcdn.com/w160/pt.png" },
  { name: "Ù‡ÙˆÙ„Ù†Ø¯Ø§", image: "https://flagcdn.com/w160/nl.png" }
];
const fixedTopScorers = [
  { name: "ØªÙˆØ±ÙŠØ³", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ferran%20Torres%20Garc%C3%ADa.png" },
  { name: "Ù…ÙŠØ³ÙŠ", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lionel%20Messi%20in%202018.jpg" },
  { name: "Ù‡Ø§Ø±ÙŠ ÙƒÙŠÙ†", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Harry%20Kane%20in%20Russia%202.jpg" },
  { name: "Ø§ÙˆÙ„ÙŠØ³ÙŠ", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Michael%20Olise%20bayern%202025.jpg" },
  { name: "Ø¬ÙˆÙ„ÙŠØ§Ù†", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Juli%C3%A1n%20%C3%81lvarez%20(footballer)%202023.jpg" },
  { name: "Ø§Ù…Ø¨Ø§Ø¨ÙŠ", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kylian%20Mbapp%C3%A9.jpg" },
  { name: "Ø±Ø§ÙÙŠÙ†ÙŠØ§", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Raphinha.jpg" }
];

const laws = {
  r32: "ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© Ù‚ÙŠÙ…ØªÙ‡Ø§ 200 Ù†Ù‚Ø·Ø©: 150 Ù†Ù‚Ø·Ø© Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„ÙØ§Ø¦Ø² Ùˆ50 Ù†Ù‚Ø·Ø© Ù„Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„Ø£Ù‚Ù„. Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­ ÙŠØ³ØªØ±Ø¬Ø¹ 150 Ù†Ù‚Ø·Ø© ÙˆÙŠØ­ØµÙ„ Ø¹Ù„Ù‰ Ù†ØµÙŠØ¨Ù‡ Ù…Ù† Ù†Ù‚Ø§Ø· ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ø³Ø±ÙŠÙ†ØŒ ÙˆØ§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„Ø®Ø·Ø£ ÙŠØ³ØªØ±Ø¬Ø¹ 50 Ù†Ù‚Ø·Ø© ÙÙ‚Ø·.",
  r16: "ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© Ù‚ÙŠÙ…ØªÙ‡Ø§ 300 Ù†Ù‚Ø·Ø©: 250 Ù†Ù‚Ø·Ø© Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„ÙØ§Ø¦Ø² Ùˆ50 Ù†Ù‚Ø·Ø© Ù„Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„Ø£Ù‚Ù„. Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ø·Ø¦Ø© ØªØªØ¬Ù…Ø¹ ÙˆØªØªÙˆØ²Ø¹ Ø¨Ø§Ù„ØªØ³Ø§ÙˆÙŠ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­.",
  r8: "Ø±ØµÙŠØ¯ ÙƒÙ„ Ù…Ø´Ø§Ø±Ùƒ Ù‚Ø¨Ù„ Ø§Ù„Ø¯ÙˆØ± ÙŠÙ†Ù‚Ø³Ù… Ø¹Ù„Ù‰ 4 Ù…Ø¨Ø§Ø±ÙŠØ§Øª. ÙÙŠ ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© 90% Ù…Ù† Ø­ØµØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ù„Ù„ÙØ§Ø¦Ø² Ùˆ10% Ù„Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„Ø£Ù‚Ù„ØŒ ÙˆÙ†Ù‚Ø§Ø· Ø§Ù„Ø®Ø³Ø§Ø±Ø© ØªØªÙˆØ²Ø¹ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­.",
  qf: "Ø±Ø¨Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØ¹Ù…Ù„ Ø¨Ù†ÙØ³ Ù†Ø¸Ø§Ù… Ø¯ÙˆØ± Ø§Ù„Ù€ 8: Ø§Ù„Ø±ØµÙŠØ¯ ÙŠÙ†Ù‚Ø³Ù… Ø¹Ù„Ù‰ 4 Ù…Ø¨Ø§Ø±ÙŠØ§ØªØŒ 90% Ù„Ù„ÙØ§Ø¦Ø² Ùˆ10% Ù„Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„Ø£Ù‚Ù„ØŒ Ù…Ø¹ ØªÙˆØ²ÙŠØ¹ Ø®Ø³Ø§Ø¦Ø± Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ø·Ø¦Ø© Ø¹Ù„Ù‰ Ø§Ù„ÙØ§Ø¦Ø²ÙŠÙ†.",
  sf: "Ø±ØµÙŠØ¯ ÙƒÙ„ Ù…Ø´Ø§Ø±Ùƒ Ù‚Ø¨Ù„ Ù†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠÙ†Ù‚Ø³Ù… Ø¹Ù„Ù‰ Ù…Ø¨Ø§Ø±Ø§ØªÙŠÙ†. ÙÙŠ ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© 90% Ù„Ù„ÙØ§Ø¦Ø² Ùˆ10% Ù„Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„Ø£Ù‚Ù„ØŒ ÙˆØ®Ø³Ø§Ø¦Ø± Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ø·Ø¦Ø© ØªØªÙˆØ²Ø¹ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­.",
  final: "ÙÙŠ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØ°Ù‡Ø¨ ÙƒØ§Ù…Ù„ Ø±ØµÙŠØ¯ Ø§Ù„Ù…Ø´Ø§Ø±Ùƒ Ù„ØªØ±Ø´ÙŠØ­ Ø§Ù„ÙØ§Ø¦Ø². Ø¨Ø¹Ø¯ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ù†ØªÙŠØ¬Ø©ØŒ Ø£Ø±ØµØ¯Ø© Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„Ø®Ø§Ø·Ø¦ ØªØªÙˆØ²Ø¹ Ø¨Ø§Ù„ØªØ³Ø§ÙˆÙŠ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­ ÙˆÙŠØ­Ø¯Ø¯ Ø§Ù„Ø¨Ø·Ù„."
};

const displayLaws = {
  r32: "ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© Ù‚ÙŠÙ…ØªÙ‡Ø§ 200 Ù†Ù‚Ø·Ø©. Ø¹Ù†Ø¯ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙÙˆØ²Ù‡ ÙŠØªÙ… ÙˆØ¶Ø¹ 150 Ù†Ù‚Ø·Ø© Ø¹Ù„Ù‰ Ø§Ù„ÙØ§Ø¦Ø² Ùˆ50 Ù†Ù‚Ø·Ø© Ø¹Ù„Ù‰ Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¢Ø®Ø±. Ø¥Ø°Ø§ ÙƒØ§Ù† ØªÙˆÙ‚Ø¹Ùƒ ØµØ­ÙŠØ­Ø§Ù‹ ØªØ­ØµÙ„ Ø¹Ù„Ù‰ 150 Ù†Ù‚Ø·Ø©ØŒ ÙˆØªÙÙ„ØºÙ‰ Ø§Ù„Ù€ 50 Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§ØµØ© Ø¨ØªØ±Ø´ÙŠØ­ Ø§Ù„Ø®Ø³Ø§Ø±Ø© ÙˆÙ„Ø§ ØªØ¯Ø®Ù„ ÙÙŠ Ø¨ÙˆÙ„ Ø§Ù„Ø®Ø³Ø§Ø±Ø©. Ø¥Ø°Ø§ ÙƒØ§Ù† ØªÙˆÙ‚Ø¹Ùƒ Ø®Ø·Ø£ ØªØ­ØµÙ„ Ø¹Ù„Ù‰ 50 Ù†Ù‚Ø·Ø© ÙÙ‚Ø·ØŒ ÙˆØªØ°Ù‡Ø¨ Ø§Ù„Ù€ 150 Ù†Ù‚Ø·Ø© Ø¥Ù„Ù‰ Ù…Ø¬Ù…ÙˆØ¹ Ù†Ù‚Ø§Ø· Ø§Ù„Ø®Ø§Ø³Ø±ÙŠÙ† Ù„ØªÙˆØ²Ø¹ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­.",
  r16: "ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© Ù‚ÙŠÙ…ØªÙ‡Ø§ 300 Ù†Ù‚Ø·Ø©. Ø¹Ù†Ø¯ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙÙˆØ²Ù‡ ÙŠØªÙ… ÙˆØ¶Ø¹ 250 Ù†Ù‚Ø·Ø© Ø¹Ù„Ù‰ Ø§Ù„ÙØ§Ø¦Ø² Ùˆ50 Ù†Ù‚Ø·Ø© Ø¹Ù„Ù‰ Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¢Ø®Ø±. Ø¥Ø°Ø§ ÙƒØ§Ù† ØªÙˆÙ‚Ø¹Ùƒ ØµØ­ÙŠØ­Ø§Ù‹ ØªØ­ØµÙ„ Ø¹Ù„Ù‰ 250 Ù†Ù‚Ø·Ø©ØŒ ÙˆØªÙÙ„ØºÙ‰ Ø§Ù„Ù€ 50 Ù†Ù‚Ø·Ø© Ø§Ù„Ø®Ø§ØµØ© Ø¨ØªØ±Ø´ÙŠØ­ Ø§Ù„Ø®Ø³Ø§Ø±Ø© ÙˆÙ„Ø§ ØªØ¯Ø®Ù„ ÙÙŠ Ø¨ÙˆÙ„ Ø§Ù„Ø®Ø³Ø§Ø±Ø©. Ø¥Ø°Ø§ ÙƒØ§Ù† ØªÙˆÙ‚Ø¹Ùƒ Ø®Ø·Ø£ ØªØ­ØµÙ„ Ø¹Ù„Ù‰ 50 Ù†Ù‚Ø·Ø© ÙÙ‚Ø·ØŒ ÙˆØªØ°Ù‡Ø¨ Ø§Ù„Ù€ 250 Ù†Ù‚Ø·Ø© Ù„ØªÙˆØ²Ø¹ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­. Ø§Ù„Ø¬ÙˆÙƒØ± Ù…ØªØ§Ø­ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ø¯ÙˆØ± Ù„Ù…Ø¨Ø§Ø±Ø§ØªÙŠÙ† ÙÙ‚Ø·.",
  r8: "Ø±ØµÙŠØ¯ ÙƒÙ„ Ù…Ø´Ø§Ø±Ùƒ Ù‚Ø¨Ù„ Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø¯ÙˆØ± ÙŠÙ‚Ø³Ù… Ø¹Ù„Ù‰ 4 Ù…Ø¨Ø§Ø±ÙŠØ§Øª. ÙÙŠ ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© ÙŠØ°Ù‡Ø¨ 90% Ù…Ù† Ø­ØµØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ù„Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø°ÙŠ ØªØªÙˆÙ‚Ø¹ ÙÙˆØ²Ù‡ØŒ Ùˆ10% Ù„Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¢Ø®Ø±. Ø¥Ø°Ø§ ÙƒØ§Ù† ØªÙˆÙ‚Ø¹Ùƒ ØµØ­ÙŠØ­Ø§Ù‹ ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ø­ØµØ© Ø§Ù„Ù€ 90% ÙˆØªÙÙ„ØºÙ‰ Ø­ØµØ© Ø§Ù„Ù€ 10% ÙˆÙ„Ø§ ØªØ¯Ø®Ù„ ÙÙŠ Ø¨ÙˆÙ„ Ø§Ù„Ø®Ø³Ø§Ø±Ø©. Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ø·Ø¦Ø© ÙÙ‚Ø· ØªØ¬Ù…Ø¹ ÙˆØªÙˆØ²Ø¹ Ø¨Ø§Ù„ØªØ³Ø§ÙˆÙŠ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­ ÙÙŠ Ù†ÙØ³ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©.",
  qf: "Ø±Ø¨Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØ¹Ù…Ù„ Ø¨Ù†ÙØ³ Ù†Ø¸Ø§Ù… Ø¯ÙˆØ± Ø§Ù„Ù€ 8: Ø±ØµÙŠØ¯ Ø§Ù„Ù„Ø§Ø¹Ø¨ Ù‚Ø¨Ù„ Ø§Ù„Ø¯ÙˆØ± ÙŠÙ‚Ø³Ù… Ø¹Ù„Ù‰ 4 Ù…Ø¨Ø§Ø±ÙŠØ§ØªØŒ ÙˆØ¯Ø§Ø®Ù„ ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© 90% Ù„Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙÙˆØ²Ù‡ Ùˆ10% Ù„Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¢Ø®Ø±. Ø­ØµØ© Ø§Ù„Ø®Ø³Ø§Ø±Ø© Ù„Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­ ØªÙÙ„ØºÙ‰ØŒ ÙˆÙ†Ù‚Ø§Ø· Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ø·Ø¦Ø© ÙÙ‚Ø· ØªÙˆØ²Ø¹ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­ Ø¨Ø¹Ø¯ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†ØªÙŠØ¬Ø©.",
  sf: "Ø±ØµÙŠØ¯ ÙƒÙ„ Ù…Ø´Ø§Ø±Ùƒ Ù‚Ø¨Ù„ Ù†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠÙ‚Ø³Ù… Ø¹Ù„Ù‰ Ù…Ø¨Ø§Ø±Ø§ØªÙŠÙ†. ÙÙŠ ÙƒÙ„ Ù…Ø¨Ø§Ø±Ø§Ø© ÙŠØ°Ù‡Ø¨ 90% Ù…Ù† Ø­ØµØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ù„Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙÙˆØ²Ù‡ Ùˆ10% Ù„Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¢Ø®Ø±. Ø­ØµØ© Ø§Ù„Ø®Ø³Ø§Ø±Ø© Ù„Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­ ØªÙÙ„ØºÙ‰ØŒ ÙˆÙ†Ù‚Ø§Ø· Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ø·Ø¦Ø© ÙÙ‚Ø· ØªÙˆØ²Ø¹ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­. Ø§Ù„Ø¬ÙˆÙƒØ± Ù…ØªØ§Ø­ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ø¯ÙˆØ± Ù„Ù…Ø¨Ø§Ø±Ø§Ø© ÙˆØ§Ø­Ø¯Ø© ÙÙ‚Ø·.",
  final: "ÙÙŠ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© ÙŠØ¶Ø¹ ÙƒÙ„ Ù…Ø´Ø§Ø±Ùƒ ÙƒØ§Ù…Ù„ Ø±ØµÙŠØ¯Ù‡ Ø¹Ù„Ù‰ Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø°ÙŠ ÙŠØªÙˆÙ‚Ø¹ ÙÙˆØ²Ù‡. Ø¨Ø¹Ø¯ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†ØªÙŠØ¬Ø©ØŒ Ø£Ø±ØµØ¯Ø© Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„Ø®Ø§Ø·Ø¦ ØªÙˆØ²Ø¹ Ø¨Ø§Ù„ØªØ³Ø§ÙˆÙŠ Ø¹Ù„Ù‰ Ø£ØµØ­Ø§Ø¨ Ø§Ù„ØªÙˆÙ‚Ø¹ Ø§Ù„ØµØ­ÙŠØ­ØŒ ÙˆØ¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØªØ­Ø¯Ø¯ Ø¨Ø·Ù„ Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©."
};

const jokerLaw = "Ø§Ù„Ø¬ÙˆÙƒØ± Ù…ØªØ§Ø­ ÙÙŠ Ø¯ÙˆØ± Ø§Ù„Ù€ 16 ÙˆÙ†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙÙ‚Ø·. ÙÙŠ Ø¯ÙˆØ± Ø§Ù„Ù€ 16 ÙŠÙ…Ù„Ùƒ ÙƒÙ„ Ù…Ø´Ø§Ø±Ùƒ Ø¬ÙˆÙƒØ±ÙŠÙ† ÙŠÙ…ÙƒÙ† ØªÙØ¹ÙŠÙ„Ù‡Ù…Ø§ Ø¹Ù„Ù‰ Ù…Ø¨Ø§Ø±Ø§ØªÙŠÙ† Ù…Ø®ØªÙ„ÙØªÙŠÙ†ØŒ ÙˆÙÙŠ Ù†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠÙ…Ù„Ùƒ Ø¬ÙˆÙƒØ±Ø§Ù‹ ÙˆØ§Ø­Ø¯Ø§Ù‹ ÙÙ‚Ø·. ÙŠØ¬Ø¨ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¬ÙˆÙƒØ± Ù‚Ø¨Ù„ Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„ØªØµÙˆÙŠØª Ù„Ù„Ù…Ø¨Ø§Ø±Ø§Ø©. Ø¥Ø°Ø§ ÙƒØ§Ù† ØªÙˆÙ‚Ø¹ Ø§Ù„Ø¬ÙˆÙƒØ± ØµØ­ÙŠØ­Ø§Ù‹ØŒ ÙŠØªÙ… Ù…Ø¶Ø§Ø¹ÙØ© Ù†Ù‚Ø§Ø· Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ã—2. Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„ØªÙˆÙ‚Ø¹ Ø®Ø·Ø£ØŒ ØªØ¨Ù‚Ù‰ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ù†Ù‚Ø§Ø· Ø­Ø³Ø¨ Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ø¯ÙˆØ± ÙˆÙ„Ø§ ÙŠØ¹Ø·ÙŠ Ø§Ù„Ø¬ÙˆÙƒØ± Ù†Ù‚Ø§Ø·Ø§Ù‹ Ø¥Ø¶Ø§ÙÙŠØ©.";

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
  championListOpen: false,
  editModalMatch: null,
  resultModalMatch: null,
  posterRound: null,
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
  if (!response.ok) throw new Error(payload.error || "ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø³ÙŠØ±ÙØ±");
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
    state.championOptions = payload.championOptions || [];
    state.championPicks = payload.championPicks || [];
    state.participants = payload.participants || [];
    state.organizers = payload.organizers || [];
    if (payload.serverNow) state.serverNowOffsetMs = new Date(payload.serverNow).getTime() - Date.now();
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
        <div class="logo-tile"><img src="assets/worldcup-icon-192.png" alt="Ø´Ø¹Ø§Ø± ÙƒØ£Ø³ Ø§Ù„Ø¹Ø§Ù„Ù… 2026" /></div>
        <span class="pill">Ø¨Ø·ÙˆÙ„Ø© Ù…Ø¨Ø§Ø´Ø±Ø©</span>
      </div>
      <img class="hero-logo" src="assets/worldcup-logo-wide.jpg" alt="FIFA World Cup 2026" />
      <h1>ÙƒØ£Ø³ Ø§Ù„Ø¹Ø§Ù„Ù… 2026</h1>
      <p>ØªÙˆÙ‚Ø¹Ø§Øª ÙˆÙ†ØªØ§Ø¦Ø¬ ÙˆØªØ±ØªÙŠØ¨ Ù…Ø¨Ø§Ø´Ø± Ù…Ø­ÙÙˆØ¸ Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ±ÙØ± Ù„ÙƒÙ„ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†.</p>
    </section>
    <section class="content">
      <form class="panel" id="loginForm">
        <h2>Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©</h2>
        <p class="small" id="authHint">Ø§Ø¯Ø®Ù„ Ø¨Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±. Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø·Ù„ÙˆØ¨ Ø£ÙˆÙ„ Ù…Ø±Ø© ÙÙ‚Ø·.</p>
        <div id="loginError" class="notice danger-notice hidden"></div>
        <div class="field">
          <span>Ù†ÙˆØ¹ Ø§Ù„Ø¹Ù…Ù„ÙŠØ©</span>
          <div class="role-grid">
            <button class="role-option active" type="button" data-auth-mode="login">Ø¯Ø®ÙˆÙ„</button>
            <button class="role-option" type="button" data-auth-mode="create">Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨</button>
          </div>
        </div>
        <label class="field hidden" id="nameField">
          <span>Ø§Ù„Ø§Ø³Ù…</span>
          <input id="name" autocomplete="name" placeholder="Ù…Ø«Ø§Ù„: Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡" />
        </label>
        <label class="field">
          <span>Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…ØªØ­Ø±Ùƒ</span>
          <input id="phone" required inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" />
        </label>
        <label class="field">
          <span>ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</span>
          <input id="password" required type="password" autocomplete="current-password" placeholder="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±" />
        </label>
        <div class="field hidden" id="roleField">
          <span>Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©</span>
          <div class="role-grid">
            <button class="role-option active" type="button" data-role="participant">Ù…Ø´Ø§Ø±Ùƒ</button>
            <button class="role-option" type="button" data-role="organizer">Ù…Ù†Ø¸Ù…</button>
          </div>
        </div>
        <label class="field hidden" id="organizerCodeField">
          <span>ÙƒÙˆØ¯ Ø§Ù„Ù…Ù†Ø¸Ù…</span>
          <input id="organizerCode" autocomplete="one-time-code" placeholder="Ø§Ø¯Ø®Ù„ ÙƒÙˆØ¯ Ø§Ù„Ù…Ù†Ø¸Ù…" />
        </label>
        <input id="role" type="hidden" value="participant" />
        <input id="mode" type="hidden" value="login" />
        <button class="primary-btn" id="loginBtn" type="submit">Ø¯Ø®ÙˆÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚</button>
        <button class="forgot-link" id="forgotPasswordToggle" type="button">Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ</button>
      </form>

      <form class="panel password-reset-panel hidden" id="passwordResetForm">
        <h2>Ø¥Ø¹Ø§Ø¯Ø© Ø¶Ø¨Ø· ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</h2>
        <p class="small">Ø§Ø¯Ø®Ù„ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…Ø³Ø¬Ù„ØŒ ÙˆØ³ÙŠØ¸Ù‡Ø± Ø§Ù„Ø·Ù„Ø¨ Ø¹Ù†Ø¯ Ø§Ù„Ù…Ù†Ø¸Ù… Ù„ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø©.</p>
        <div id="passwordResetMessage" class="notice hidden"></div>
        <label class="field">
          <span>Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…ØªØ­Ø±Ùƒ</span>
          <input id="resetPhone" required inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" />
        </label>
        <button class="primary-btn" id="passwordResetBtn" type="submit">Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø¶Ø¨Ø·</button>
      </form>

      <section class="install-panel">
        <div>
          <h2>ØªÙ†Ø²ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚</h2>
          <p>Ø«Ø¨Ù‘Øª ØµÙØ­Ø© Ø§Ù„Ø¨Ø·ÙˆÙ„Ø© Ø¹Ù„Ù‰ Ø´Ø§Ø´Ø© Ø§Ù„Ù‡Ø§ØªÙ Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§ ÙƒØªØ·Ø¨ÙŠÙ‚ Ù…Ø³ØªÙ‚Ù„.</p>
        </div>
        <div class="install-actions">
          <button class="install-btn android-install" id="androidInstallBtn" type="button">ØªÙ†Ø²ÙŠÙ„ Ù„Ù„Ø£Ù†Ø¯Ø±ÙˆÙŠØ¯</button>
          <button class="install-btn ios-install" id="iosInstallBtn" type="button">ØªÙ†Ø²ÙŠÙ„ Ù„Ù„Ø¢ÙŠÙÙˆÙ†</button>
        </div>
        <div class="install-help" id="installHelp">
          Ø¹Ù„Ù‰ Ø§Ù„Ø¢ÙŠÙÙˆÙ†: Ø§ÙØªØ­ Ø§Ù„Ø±Ø§Ø¨Ø· Ù…Ù† SafariØŒ Ø§Ø¶ØºØ· Ø²Ø± Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©ØŒ Ø«Ù… Ø§Ø®ØªØ± Add to Home Screen.
        </div>
      </section>
    </section>
  `;
}

function appTemplate() {
  const roleTabs = state.currentUser.role === "organizer"
    ? `
      <button class="tab ${activeTab === "manage" ? "active" : ""}" data-tab="manage">Ø¥Ø¯Ø§Ø±Ø©</button>
      <button class="tab ${activeTab === "participants" ? "active" : ""}" data-tab="participants">Ø§Ù„Ø·Ù„Ø¨Ø§Øª</button>
      <button class="tab ${activeTab === "champions" ? "active" : ""}" data-tab="champions">ØªØ±Ø´ÙŠØ­Ø§Øª Ø§Ù„Ø¨Ø·Ù„</button>
    `
    : `<button class="tab ${activeTab === "matches" ? "active" : ""}" data-tab="matches">Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª</button>`;

  return `
    <header class="topbar">
      <button class="brand-row profile-trigger" id="profileOpenBtn" type="button">
        ${avatarTile(state.currentUser, "top-logo")}
        <div class="user-meta">
          <strong>${escapeHtml(state.currentUser.name)}</strong>
          <span>${state.currentUser.role === "organizer" ? "Ù…Ù†Ø¸Ù… Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©" : statusLabel(state.currentUser.participant_status)}</span>
        </div>
      </button>
      <button class="pill" id="logoutBtn">Ø®Ø±ÙˆØ¬</button>
    </header>
    <nav class="tabs ${state.currentUser.role === "organizer" ? "organizer-tabs" : ""}">
      ${roleTabs}
      <button class="tab ${activeTab === "standings" ? "active" : ""}" data-tab="standings">Ø§Ù„ØªØ±ØªÙŠØ¨</button>
      <button class="tab ${activeTab === "laws" ? "active" : ""}" data-tab="laws">Ø§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ†</button>
    </nav>
    <section class="content">
      ${noticeView()}
      ${state.loading ? loadingView() : state.error ? errorView(state.error) : currentView()}
    </section>
    ${state.profileOpen ? profileModal() : ""}
    ${state.voterModalMatch ? voterModal(state.voterModalMatch) : ""}
    ${state.voteResultsModalMatch ? voteResultsModal(state.voteResultsModalMatch) : ""}
    ${state.championListOpen ? championListModal() : ""}
    ${state.editModalMatch ? matchEditModal(state.editModalMatch) : ""}
    ${state.resultModalMatch ? resultModal(state.resultModalMatch) : ""}
    ${state.posterRound ? roundPosterModal(state.posterRound) : ""}
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
  if (activeTab === "champions" && state.currentUser.role === "organizer") return championPicksView();
  if (state.currentUser.role === "organizer") return manageView();
  return participantMatchesView();
}

function profileModal() {
  return `
    <div class="modal-backdrop" data-modal-close>
      <form class="modal-card stack profile-panel" id="profileForm">
        <div class="section-title">
          <h2>Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ</h2>
          <button class="icon-close" type="button" data-profile-close>Ã—</button>
        </div>
        <div class="profile-photo-row">
          ${avatarTile(state.currentUser, "avatar-large", "profileAvatarPreview")}
          <label class="field image-upload-field">
            <span>Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø©</span>
            <input id="profileAvatar" type="file" accept="image/*" />
          </label>
        </div>
        <div id="profileError" class="notice danger-notice hidden"></div>
        <label class="field">
          <span>Ø§Ù„Ø§Ø³Ù…</span>
          <input id="profileName" required autocomplete="name" value="${escapeHtml(state.currentUser.name)}" />
        </label>
        <button class="primary-btn" type="submit">Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„</button>
      </form>
    </div>
  `;
}

function participantStatusView() {
  const rejected = state.currentUser.participant_status === "rejected";
  return `
    <section class="panel waiting-panel">
      <span class="status-chip ${rejected ? "rejected" : ""}">${rejected ? "ØªÙ… Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨" : "Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„Ù…Ù†Ø¸Ù…"}</span>
      <h2>${rejected ? "Ù„Ù… ÙŠØªÙ… Ù‚Ø¨ÙˆÙ„ Ø¯Ø®ÙˆÙ„Ùƒ" : "Ø·Ù„Ø¨Ùƒ ÙˆØµÙ„ Ù„Ù„Ù…Ù†Ø¸Ù…"}</h2>
      <p class="small">${rejected ? "ÙŠÙ…ÙƒÙ†Ùƒ ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ Ø§Ù†Ø¶Ù…Ø§Ù… Ø¬Ø¯ÙŠØ¯ØŒ ÙˆØ³ÙŠØ¸Ù‡Ø± Ø§Ù„Ø·Ù„Ø¨ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø¹Ù†Ø¯ Ø§Ù„Ù…Ù†Ø¸Ù…." : "Ø¨Ø¹Ø¯ Ù‚Ø¨ÙˆÙ„Ùƒ Ø³ØªØ¸Ù‡Ø± Ù„Ùƒ Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª ÙˆØ§Ù„ØªÙˆÙ‚Ø¹Ø§Øª ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø¹Ù†Ø¯ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©."}</p>
      <button class="primary-btn" id="${rejected ? "reapplyBtn" : "retryBtn"}" type="button">${rejected ? "ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ Ø§Ù†Ø¶Ù…Ø§Ù…" : "ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø­Ø§Ù„Ø©"}</button>
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
      <h2>Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†</h2>
      <span class="small">${pending.length} Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©</span>
    </div>
    <div class="participant-list">
      ${pending.length ? pending.map(requestRow).join("") : emptyView("Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¬Ø¯ÙŠØ¯Ø©.")}
    </div>
    <div class="section-title" style="margin-top:18px">
      <h2>Ø¥Ø¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</h2>
      <span class="small">${passwordResetRequests.length} Ø·Ù„Ø¨</span>
    </div>
    <div class="participant-list">
      ${passwordResetRequests.length ? passwordResetRequests.map(passwordResetRow).join("") : emptyView("Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¥Ø¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ±.")}
    </div>
    <div class="section-title" style="margin-top:18px">
      <h2>Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙˆÙ†</h2>
      <span class="small">${approved.length} Ù…Ù‚Ø¨ÙˆÙ„</span>
    </div>
    <div class="participant-list">
      ${approved.length ? approved.map(participantRow).join("") : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙƒÙˆÙ† Ù…Ù‚Ø¨ÙˆÙ„ÙˆÙ† Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.")}
    </div>
    ${rejected.length ? `
      <div class="section-title" style="margin-top:18px">
        <h2>Ø§Ù„Ù…Ø±ÙÙˆØ¶ÙˆÙ†</h2>
        <span class="small">${rejected.length} Ù…Ø±ÙÙˆØ¶</span>
      </div>
      <div class="participant-list">
        ${rejected.map(rejectedRow).join("")}
      </div>
    ` : ""}
    <div class="section-title" style="margin-top:18px">
      <h2>Ø§Ù„Ù…Ù†Ø¸Ù…ÙˆÙ† Ø§Ù„Ù…Ø³Ø¬Ù„ÙˆÙ†</h2>
      <span class="small">${state.organizers.length} Ù…Ù†Ø¸Ù…</span>
    </div>
    <div class="participant-list">
      ${state.organizers.length ? state.organizers.map(organizerRow).join("") : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ù†Ø¸Ù…ÙˆÙ† Ù…Ø³Ø¬Ù„ÙˆÙ†.")}
    </div>
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
        <button class="mini-btn approve" data-participant-status="approved" data-participant-id="${user.id}">Ù‚Ø¨ÙˆÙ„</button>
        <button class="mini-btn reject" data-participant-status="rejected" data-participant-id="${user.id}">Ø±ÙØ¶</button>
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
        <h2>ØªØ±Ø´ÙŠØ­Ø§Øª Ø§Ù„Ø¨Ø·Ù„</h2>
        <span class="small">Ø£Ø¶Ù ÙƒÙ„ Ù…ØªØ³Ø§Ø¨Ù‚ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø© ÙÙ‚Ø·</span>
      </div>
    </div>
    ${availableParticipants.length ? `<button class="primary-btn champion-open-btn" id="championListsBtn" type="button">Ø¥Ø¶Ø§ÙØ© ØªØ±Ø´ÙŠØ­</button>` : `<div class="notice">ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© ØªØ±Ø´ÙŠØ­Ø§Øª Ù„ÙƒÙ„ Ø§Ù„Ù…ØªØ³Ø§Ø¨Ù‚ÙŠÙ† Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„ÙŠÙ†.</div>`}
    <div class="champion-picks-list">
      ${pickedParticipants.length ? pickedParticipants.map(user => championPickRow(user, picksByParticipant.get(user.id))).join("") : emptyView("Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ±Ø´ÙŠØ­Ø§Øª Ù…Ø¶Ø§ÙØ© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.")}
    </div>
  `;
}

function championAddForm(participants, teams, scorers) {
  return `
    <form class="champion-add-card" data-champion-add-pick>
      <label class="field compact-field">
        <span>Ø§Ù„Ù…ØªØ³Ø§Ø¨Ù‚</span>
        <select name="participantId" required>
          <option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…ØªØ³Ø§Ø¨Ù‚</option>
          ${participants.map(user => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)}</option>`).join("")}
        </select>
      </label>
      <label class="field compact-field">
        <span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…Ø±Ø´Ø­</span>
        <select name="championTeam" required>
          <option value="">Ø§Ø®ØªØ± Ø§Ù„ÙØ±ÙŠÙ‚</option>
          ${teams.map(team => `<option value="${escapeHtml(team.name)}">${escapeHtml(team.name)}</option>`).join("")}
        </select>
      </label>
      <label class="field compact-field">
        <span>Ù‡Ø¯Ø§Ù Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©</span>
        <select name="topScorer" required>
          <option value="">Ø§Ø®ØªØ± Ø§Ù„Ù‡Ø¯Ø§Ù</option>
          ${scorers.map(scorer => `<option value="${escapeHtml(scorer.name)}">${escapeHtml(scorer.name)}</option>`).join("")}
        </select>
      </label>
      <button class="primary-btn" type="submit">Ø¥Ø¶Ø§ÙØ© ØªØ±Ø´ÙŠØ­</button>
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
          <span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…Ø±Ø´Ø­</span>
          <strong>${escapeHtml(pick?.champion_team || "-")}</strong>
        </div>
      </div>
      <div class="champion-pick-values media">
        ${championMediaTile(scorer, "player")}
        <div>
          <span>Ù‡Ø¯Ø§Ù Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©</span>
          <strong>${escapeHtml(pick?.top_scorer || "-")}</strong>
        </div>
      </div>
    </article>
  `;
}

function championMediaTile(option, type) {
  if (!option?.image) return `<span class="champion-media ${type}">${type === "flag" ? "?" : "Ù‡Ù€"}</span>`;
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
          <h2>Ø¥Ø¶Ø§ÙØ© ØªØ±Ø´ÙŠØ­</h2>
          <button class="icon-close" type="button" data-champion-list-x>Ã—</button>
        </div>
        ${participants.length ? championAddForm(participants, teams, scorers) : `<div class="notice">ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© ØªØ±Ø´ÙŠØ­Ø§Øª Ù„ÙƒÙ„ Ø§Ù„Ù…ØªØ³Ø§Ø¨Ù‚ÙŠÙ† Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„ÙŠÙ†.</div>`}
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
        <span>Ø·Ù„Ø¨ Ø¥Ø¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</span>
      </div>
      <span class="status-chip pending">Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„ØªØ¹ÙŠÙŠÙ†</span>
      <div class="participant-actions password-reset-actions">
        <input name="password" required minlength="4" type="text" autocomplete="new-password" placeholder="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©" />
        <button class="mini-btn approve" type="submit">Ø­ÙØ¸ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</button>
      </div>
    </form>
  `;
}

function participantRow(user) {
  return `
    <article class="swipe-row" data-swipe-row>
      <button class="swipe-delete" data-participant-delete="${user.id}" data-participant-name="${escapeHtml(user.name)}">Ø­Ø°Ù</button>
      <div class="participant-row swipe-content" data-swipe-content>
        ${avatarTile(user, "avatar-small")}
        <div>
          <strong>${escapeHtml(user.name)}</strong>
        </div>
        <span class="status-chip approved">Ù…Ù‚Ø¨ÙˆÙ„</span>
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
      <span class="status-chip rejected">Ù…Ø±ÙÙˆØ¶</span>
    </article>
  `;
}

function organizerRow(user) {
  const isCurrentUser = user.id === state.currentUser?.id;
  return `
    <article class="participant-row organizer-row">
      ${avatarTile(user, "avatar-small")}
      <div>
        <strong>${escapeHtml(user.name)}</strong>
        <span>${isCurrentUser ? "Ø£Ù†Øª" : "Ù…Ù†Ø¸Ù…"}</span>
      </div>
      <span class="status-chip approved">Ù…Ù†Ø¸Ù…</span>
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
  const matches = sortMatches(state.matches.filter(match => roundMatchesActiveTab(match, activeRound)));
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
  const matches = sortMatches(state.matches.filter(match => roundMatchesActiveTab(match, activeRound)));
  const roundLimit = roundMatchLimits[normalizeRoundId(activeRound)] || Infinity;
  const roundIsFull = matches.length >= roundLimit;
  const posterReady = roundPosterReady(activeRound, matches, roundLimit);
  return `
    <div class="section-title">
      <h2>Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª</h2>
      <span class="small">ØªÙ†Ø¹ÙƒØ³ Ø¹Ù„Ù‰ ÙƒÙ„ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†</span>
    </div>
    ${roundTabs()}
    <button class="add-match-toggle" id="addMatchToggle" type="button" ${roundIsFull ? "disabled" : ""}>
      ${roundIsFull ? `Ø§ÙƒØªÙ…Ù„ Ø¹Ø¯Ø¯ Ù…Ø¨Ø§Ø±ÙŠØ§Øª ${roundName(activeRound)} (${roundLimit}/${roundLimit})` : `Ø¥Ø¶Ø§ÙØ© Ù…Ø¨Ø§Ø±Ø§Ø© ÙÙŠ ${roundName(activeRound)} (${matches.length}/${roundLimit})`}
    </button>
    ${posterReady ? `<button class="poster-create-btn" data-round-poster type="button">${normalizeRoundId(activeRound) === "final" ? "Ø¥Ù†Ø´Ø§Ø¡ Ø¨ÙˆØ³ØªØ± Ø§Ù„Ø¨Ø·Ù„" : "Ø¥Ù†Ø´Ø§Ø¡ Ø¨ÙˆØ³ØªØ± Ø§Ù„Ù…ØªØµØ¯Ø±"}</button>` : ""}
    <div class="match-list">
      ${matches.length ? matches.map(managerMatchCardV2).join("") : emptyView("Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¨Ø§Ø±ÙŠØ§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ø¯ÙˆØ± Ø­Ø§Ù„ÙŠØ§Ù‹.")}
    </div>
  `;
}

function matchFormModal() {
  return `
    <div class="modal-backdrop">
      <section class="modal-card stack add-match-modal">
        <div class="section-title">
          <h2>Ø¥Ø¶Ø§ÙØ© Ù…Ø¨Ø§Ø±Ø§Ø©</h2>
          <button class="icon-close" type="button" data-add-match-close>Ã—</button>
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
        <label class="field"><span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø£ÙˆÙ„</span><input id="teamA" required placeholder="Ø§Ø³Ù… Ø§Ù„ÙØ±ÙŠÙ‚" /></label>
        <label class="field"><span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø«Ø§Ù†ÙŠ</span><input id="teamB" required placeholder="Ø§Ø³Ù… Ø§Ù„ÙØ±ÙŠÙ‚" /></label>
      </div>
      <label class="field"><span>ÙˆÙ‚Øª Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</span><input id="startsAt" required type="datetime-local" /></label>
      <label class="field"><span>ÙˆÙ‚Øª Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„ØªØµÙˆÙŠØª</span><input id="voteEndsAt" required type="datetime-local" /></label>
      <button class="primary-btn" type="submit">Ø­ÙØ¸ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</button>
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
      <h2>ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†</h2>
      <span class="small">Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„ÙˆÙ† ÙÙ‚Ø·</span>
    </div>
    <div class="leader-list">
      ${state.standings.length ? state.standings.map((row, index) => `
        <div class="leader-row ${row.id === state.currentUser.id ? "current" : ""}">
          <div class="rank">${index + 1}</div>
          ${avatarTile(row, "avatar-small")}
          <div class="leader-name">
            <strong>${escapeHtml(row.name)}</strong>
            <span class="small">ØµØ­ÙŠØ­: ${row.correct_predictions} | Ø®Ø·Ø£: ${row.wrong_predictions}</span>
          </div>
          <div class="points">${row.points}</div>
        </div>
      `).join("") : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙƒÙˆÙ† Ù…Ù‚Ø¨ÙˆÙ„ÙˆÙ† Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.")}
    </div>
  `;
}

function organizerStandingsMatrixView() {
  const settledMatches = sortMatches(state.matches.filter(match => match.winner));
  return `
    ${state.standings.length ? `
      <div class="standings-board" role="region" aria-label="Ø¬Ø¯ÙˆÙ„ ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†">
        <div class="standings-total-col">
          <div class="matrix-cell matrix-head total-head">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù†Ù‚Ø§Ø·</div>
          ${state.standings.map((row, index) => `<div class="matrix-cell total-cell ${index < 3 ? "podium-cell" : ""}">${row.points}</div>`).join("")}
        </div>
        <div class="standings-middle-scroll">
          <div class="standings-scroll-table">
            <div class="standings-middle-row matrix-head-row">
              ${settledMatches.map(match => `
                <div class="match-score-group">
                  <div class="matrix-cell match-team-head">${escapeHtml(match.team_a)}</div>
                  <div class="matrix-cell match-team-head">${escapeHtml(match.team_b)}</div>
                  <div class="matrix-cell match-round-head">Ù†Ù‚Ø§Ø· Ø§Ù„Ø¬ÙˆÙ„Ø©</div>
                </div>
              `).join("")}
              <div class="match-score-group summary-group">
                <div class="matrix-cell summary-head">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØµØ­ÙŠØ­</div>
                <div class="matrix-cell summary-head">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø®Ø·Ø£</div>
                <div class="matrix-cell summary-head">Ù†Ø³Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­</div>
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
            <div class="matrix-cell player-head">Ø§Ù„Ù…ØªØ³Ø§Ø¨Ù‚</div>
            <div class="matrix-cell rank-head">Ø§Ù„ØªØ±ØªÙŠØ¨</div>
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
    ` : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙƒÙˆÙ† Ù…Ù‚Ø¨ÙˆÙ„ÙˆÙ† Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.")}
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
  return `<span class="rank-trend ${movement > 0 ? "up" : "down"}">${movement > 0 ? "â–²" : "â–¼"}</span>`;
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
      ? "Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù†ØªÙŠØ¬Ø©"
      : points
        ? `${points.correct ? "ØµØ­ÙŠØ­" : "Ø®Ø·Ø£"} - ${points.points} Ù†Ù‚Ø·Ø©${points.is_joker ? " Ã—2" : ""}`
        : "Ù„Ù… ÙŠØ¯Ø®Ù„ ÙÙŠ Ø§Ù„Ø­Ø³Ø¨Ø©";
    return `
      <article class="detail-match-row">
        <div>
          <strong>${escapeHtml(match.team_a)} Ø¶Ø¯ ${escapeHtml(match.team_b)}</strong>
          <span>${roundName(match.round_id)} | ${formatAdminMatchDate(match.starts_at)}</span>
        </div>
        <div class="detail-pick">
          <span>${prediction ? `ØªÙˆÙ‚Ø¹: ${escapeHtml(prediction.winner)}${prediction.is_joker ? " | Ø¬ÙˆÙƒØ±" : ""}` : "Ù„Ù… ÙŠØµÙˆØª"}</span>
          <em class="${points?.correct ? "ok" : match.winner ? "bad" : ""}">${status}</em>
        </div>
      </article>
    `;
  }).join("");

  return `
    <div class="modal-backdrop" data-detail-modal-close>
      <section class="modal-card stack participant-detail-modal">
        <div class="section-title">
          <h2>ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø´Ø§Ø±Ùƒ</h2>
          <button class="icon-close" type="button" data-detail-close>Ã—</button>
        </div>
        <div class="participant-detail-head">
          ${avatarTile(participant, "avatar-small")}
          <div>
            <strong>${escapeHtml(participant.name)}</strong>
            <span class="small">Ø§Ù„Ù†Ù‚Ø§Ø·: ${participant.points || 0} | ØµØ­ÙŠØ­: ${participant.correct_predictions || 0} | Ø®Ø·Ø£: ${participant.wrong_predictions || 0}</span>
          </div>
        </div>
        <div class="detail-match-list">
          ${rows || emptyView("Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¨Ø§Ø±ÙŠØ§Øª Ù„Ø¹Ø±Ø¶Ù‡Ø§.")}
        </div>
      </section>
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
      <article class="law-card joker-law-card">
        <h3>Ø§Ù„Ø¬ÙˆÙƒØ±</h3>
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
      <div class="summary-card"><span class="small">Ø§Ù„Ù†Ù‚Ø§Ø·</span><strong>${mine.points}</strong></div>
      <div class="summary-card"><span class="small">ØµØ­ÙŠØ­</span><strong>${mine.correct_predictions}</strong></div>
      <div class="summary-card"><span class="small">Ø®Ø·Ø£</span><strong>${mine.wrong_predictions}</strong></div>
    </div>
  `;
}

function matchCard(match, prediction) {
  const locked = isVoteClosed(match);
  const selected = prediction?.winner || prediction || "";
  const isJoker = !!prediction?.is_joker;
  const points = state.matchPoints[match.id];
  const canUseJoker = shouldShowJokerButton(match, isJoker);
  const status = participantMatchStatus(match, selected, points, locked);
  return `
    <article class="match-card participant-match-card ${locked ? "locked-card" : ""}">
      <div class="participant-match-top">
        <span>${formatAdminMatchDate(match.starts_at)}</span>
        <span class="participant-countdown ${locked ? "expired" : ""}" ${!match.winner && !locked ? countdownAttrs(match.vote_ends_at, "Ø¨Ø§Ù‚ÙŠ Ù„Ù„ØªØµÙˆÙŠØª: ") : ""}>${match.winner ? "Ù…ØºÙ„Ù‚" : locked ? "Ø§Ù†ØªÙ‡Ù‰ Ø§Ù„ØªØµÙˆÙŠØª" : `Ø¨Ø§Ù‚ÙŠ Ù„Ù„ØªØµÙˆÙŠØª: ${countdownText(match.vote_ends_at)}`}</span>
      </div>
      <div class="participant-choice-grid">
        ${participantChoiceButton(match, match.team_a, match.team_a_flag, selected, locked, isJoker)}
        ${participantChoiceButton(match, match.team_b, match.team_b_flag, selected, locked, isJoker)}
      </div>
      ${canUseJoker ? `
        <button class="joker-toggle participant-joker ${isJoker ? "active" : ""}" ${locked ? "disabled" : ""} data-joker="${match.id}" type="button">
          ${isJoker ? "Ø§Ù„Ø¬ÙˆÙƒØ± Ù…ÙØ¹Ù„ Ã—2" : "ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¬ÙˆÙƒØ± Ã—2"}
        </button>
      ` : ""}
      <div class="participant-match-footer">
        ${status}
        <span class="saved-pick">${selected ? `ØªÙ… Ø­ÙØ¸ ØªÙˆÙ‚Ø¹Ùƒ: ${escapeHtml(selected)}` : "Ø§Ø®ØªØ± Ø§Ù„ÙØ§Ø¦Ø² Ù„Ø­ÙØ¸ ØªÙˆÙ‚Ø¹Ùƒ"}</span>
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

function shouldShowJokerButton(match, isJoker) {
  const roundId = normalizeRoundId(match.round_id);
  const limit = jokerLimits[roundId] || 0;
  if (!limit) return false;
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
    return `<span class="participant-status ${points.correct ? "correct" : "wrong"}"><span></span>${points.correct ? "ØªÙˆÙ‚Ø¹ ØµØ­ÙŠØ­" : "ØªÙˆÙ‚Ø¹ Ø®Ø§Ø·Ø¦"}: ${points.points} Ù†Ù‚Ø·Ø©${points.is_joker ? " Ã—2" : ""}</span>`;
  }
  if (locked) return `<span class="participant-status pending"><span></span>Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†ØªØ§Ø¦Ø¬</span>`;
  if (selected) return `<span class="participant-status saved"><span></span>ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªÙˆÙ‚Ø¹</span>`;
  return `<span class="participant-status open"><span></span>Ù„Ù… ÙŠØªÙ… Ø§Ù„ØªØµÙˆÙŠØª</span>`;
}

function managerMatchCard(match) {
  const teamsView = `<div class="teams team-row">${teamBadge(match.team_a, match.team_a_flag)}<span class="versus">Ø¶Ø¯</span>${teamBadge(match.team_b, match.team_b_flag)}</div>`;
  return `
    <article class="match-card">
      <div class="match-head">
        <span class="round-badge">${roundName(match.round_id)}</span>
        <span class="status-chip ${match.winner ? "done" : ""}">${match.winner ? "ØªÙ… Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ù†ØªÙŠØ¬Ø©" : "Ø¨Ø¯ÙˆÙ† Ù†ØªÙŠØ¬Ø©"}</span>
      </div>
      <div class="teams">${escapeHtml(match.team_a)} Ø¶Ø¯ ${escapeHtml(match.team_b)}</div>
      <div class="deadline">ÙˆÙ‚Øª Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©: ${formatDate(match.starts_at)}<br>Ù†Ù‡Ø§ÙŠØ© Ø§Ù„ØªØµÙˆÙŠØª: ${formatDate(match.vote_ends_at)}</div>
      ${teamsView}
      <button class="vote-count-btn" data-voters="${match.id}" type="button">
        Ø§Ù„ØªØµÙˆÙŠØª: ${match.vote_count || 0} Ù…Ù† ${match.eligible_count || 0}
      </button>
      <div class="result-row">
        <button class="choice ${match.winner === match.team_a ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_a)}">${escapeHtml(match.team_a)}</button>
        <button class="choice ${match.winner === match.team_b ? "active" : ""}" data-result="${match.id}" data-team="${escapeHtml(match.team_b)}">${escapeHtml(match.team_b)}</button>
      </div>
      <button class="ghost-btn" style="margin-top:8px" data-clear="${match.id}">Ù…Ø³Ø­ Ø§Ù„Ù†ØªÙŠØ¬Ø©</button>
    </article>
  `;
}

function managerMatchCardV2(match) {
  const scoreA = Number.isInteger(match.score_a) ? match.score_a : "";
  const scoreB = Number.isInteger(match.score_b) ? match.score_b : "";
  return `
    <article class="admin-match-card">
      <div class="admin-match-top">
        <button class="text-link" data-match-edit-open="${match.id}" type="button">ØªØ¹Ø¯ÙŠÙ„</button>
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
        <button class="text-link result-link" data-result-open="${match.id}" type="button">${match.winner ? "ØªØ¹Ø¯ÙŠÙ„ Ù†ØªÙŠØ¬Ø© Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©" : "Ø¥Ø¶Ø§ÙØ© Ù†ØªÙŠØ¬Ø© Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©"}</button>
        <div class="admin-match-actions">
          <button class="vote-results-link" data-vote-results="${match.id}" type="button">Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØµÙˆÙŠØª</button>
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
          <h2>ØªØ¹Ø¯ÙŠÙ„ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</h2>
          <button class="icon-close" type="button" data-edit-close>Ã—</button>
        </div>
        <div id="editError" class="notice danger-notice hidden"></div>
        <form class="stack manager-match-form" data-match-edit="${match.id}">
          <div class="form-grid">
            <label class="field"><span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø£ÙˆÙ„</span><input name="teamA" required value="${escapeHtml(match.team_a)}" /></label>
            <label class="field"><span>Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø«Ø§Ù†ÙŠ</span><input name="teamB" required value="${escapeHtml(match.team_b)}" /></label>
          </div>
          <div class="form-grid">
            <label class="field image-field">
              <span>Ø¹Ù„Ù… Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø£ÙˆÙ„</span>
              <div class="image-input-row">
                <span class="flag-tile preview-tile" data-flag-preview="teamA-${match.id}">${match.team_a_flag ? `<img src="${escapeHtml(match.team_a_flag)}" alt="" />` : "A"}</span>
                <input name="teamAFlagFile" data-edit-flag="teamA-${match.id}" type="file" accept="image/*" />
                <input name="teamAFlag" type="hidden" value="${escapeHtml(match.team_a_flag || "")}" />
              </div>
            </label>
            <label class="field image-field">
              <span>Ø¹Ù„Ù… Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø«Ø§Ù†ÙŠ</span>
              <div class="image-input-row">
                <span class="flag-tile preview-tile" data-flag-preview="teamB-${match.id}">${match.team_b_flag ? `<img src="${escapeHtml(match.team_b_flag)}" alt="" />` : "B"}</span>
                <input name="teamBFlagFile" data-edit-flag="teamB-${match.id}" type="file" accept="image/*" />
                <input name="teamBFlag" type="hidden" value="${escapeHtml(match.team_b_flag || "")}" />
              </div>
            </label>
          </div>
          <label class="field"><span>ÙˆÙ‚Øª Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</span><input name="startsAt" required type="datetime-local" value="${datetimeLocalValue(match.starts_at)}" /></label>
          <label class="field"><span>ÙˆÙ‚Øª Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„ØªØµÙˆÙŠØª</span><input name="voteEndsAt" required type="datetime-local" value="${datetimeLocalValue(match.vote_ends_at)}" /></label>
          <button class="primary-btn" type="submit">Ø­ÙØ¸ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</button>
        </form>
        <button class="danger-btn" data-match-delete="${match.id}" data-match-name="${escapeHtml(`${match.team_a} Ø¶Ø¯ ${match.team_b}`)}" type="button">Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</button>
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
          <h2>${match.winner ? "ØªØ¹Ø¯ÙŠÙ„ Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©" : "Ø¥Ø¶Ø§ÙØ© Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©"}</h2>
          <button class="icon-close" type="button" data-result-close>Ã—</button>
        </div>
        <div class="teams team-row">${teamBadge(match.team_a, match.team_a_flag)}<span class="versus">Ø¶Ø¯</span>${teamBadge(match.team_b, match.team_b_flag)}</div>
        <div id="resultError" class="notice danger-notice hidden"></div>
        <form class="manager-result-form" data-result-form="${match.id}">
          <div class="score-grid">
            <label class="field"><span>Ø£Ù‡Ø¯Ø§Ù ${escapeHtml(match.team_a)}</span><input name="scoreA" required min="0" step="1" type="number" value="${scoreA}" /></label>
            <label class="field"><span>Ø£Ù‡Ø¯Ø§Ù ${escapeHtml(match.team_b)}</span><input name="scoreB" required min="0" step="1" type="number" value="${scoreB}" /></label>
          </div>
          <button class="primary-btn" type="submit">${match.winner ? "Ø­ÙØ¸ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù†ØªÙŠØ¬Ø©" : "Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†ØªÙŠØ¬Ø©"}</button>
        </form>
        ${match.winner ? `<button class="ghost-btn" data-clear="${match.id}" type="button">Ù…Ø³Ø­ Ø§Ù„Ù†ØªÙŠØ¬Ø©</button>` : ""}
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
          <h2>${data.isFinal ? "Ø¨ÙˆØ³ØªØ± Ø§Ù„Ø¨Ø·Ù„" : "Ø¨ÙˆØ³ØªØ± Ø§Ù„Ù…ØªØµØ¯Ø±"}</h2>
          <button class="icon-close" type="button" data-poster-close>Ã—</button>
        </div>
        <canvas id="roundPosterCanvas" class="round-poster-canvas" width="1080" height="1920"></canvas>
        <div class="poster-actions">
          <button class="primary-btn" id="savePosterBtn" type="button">Ø­ÙØ¸ Ø§Ù„Ø¨ÙˆØ³ØªØ±</button>
          <button class="ghost-btn" id="sharePosterBtn" type="button">Ù…Ø´Ø§Ø±ÙƒØ© Ø§Ù„ØµÙˆØ±Ø©</button>
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
    title: normalizedRoundId === "final" ? "Ø¨Ø·Ù„ Ø¨Ø·ÙˆÙ„Ø© Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª" : `Ø¨Ø·Ù„ ${posterRoundLabel(normalizedRoundId)}`,
    subtitle: normalizedRoundId === "final" ? "Ø¨Ø·ÙˆÙ„Ø© ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø¹Ø§Ù„Ù… 2026" : `Ù…ØªØµØ¯Ø± ${posterRoundLabel(normalizedRoundId)} ÙÙŠ Ø¨Ø·ÙˆÙ„Ø© ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø¹Ø§Ù„Ù… 2026`,
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
    .map(row => ({ ...row, points: roundPoints(row.points) }))
    .sort((a, b) => b.points - a.points || b.correct - a.correct || a.wrong - b.wrong)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function posterRoundLabel(roundId) {
  return ({
    r32: "Ø¯ÙˆØ± Ø§Ù„Ù€ 32",
    r16: "Ø¯ÙˆØ± Ø§Ù„Ù€ 16",
    qf: "Ø±Ø¨Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ",
    sf: "Ù†ØµÙ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ",
    final: "Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ"
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
  const shared = await sharePosterImage(canvas, data, "Ø§Ø­ÙØ¸ Ø§Ù„ØµÙˆØ±Ø© Ù…Ù† Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©");
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
  const palette = data.palette;
  context.clearRect(0, 0, width, height);
  const template = await loadPosterImage(WINNER_POSTER_TEMPLATE);
  if (template) {
    drawImageCover(context, template, 0, 0, width, height);
  } else {
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, palette.a);
    background.addColorStop(0.55, palette.c);
    background.addColorStop(1, "#02091f");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }
  await drawPosterLogo(context, width);

  drawCenteredText(context, "ØªÙ‡Ø§Ù†ÙŠÙ†Ø§ Ù„Ù„ÙØ§Ø¦Ø²", width / 2, 345, 62, "#fff", 900);
  drawCenteredText(context, data.subtitle, width / 2, 410, 31, "rgba(255,255,255,.86)", 700);
  drawLaurelFrame(context, width / 2, 720, 235, palette);
  await drawWinnerAvatar(context, data, width / 2, 690, 220);

  drawRibbon(context, width / 2, 885, data.isFinal ? "Ø§Ù„Ø¨Ø·Ù„" : "Ø§Ù„Ù…ØªØµØ¯Ø±", palette);
  drawCenteredText(context, data.name, width / 2, 1025, 64, "#fff", 900);
  drawCenteredText(context, posterNumber(data.points), width / 2, 1180, 70, "#28d17c", 900);
  drawPosterStatValues(context, data, width);
  drawCenteredText(context, data.title, width / 2, 1660, 44, "#fff", 900);
  drawCenteredText(context, "Ø´ÙƒØ±Ø§Ù‹ Ù„Ù…Ø´Ø§Ø±ÙƒØªÙƒ ÙˆØªÙˆÙ‚Ø¹Ø§ØªÙƒ ÙÙŠ Ø¨Ø·ÙˆÙ„Ø© Ø§Ù„Ø¹Ø§Ù„Ù… 2026", width / 2, 1670, 29, "rgba(255,255,255,.8)", 700);
}

function drawPosterStatValues(context, data, width) {
  const y = 1498;
  drawCenteredText(context, `${data.accuracy}%`, width * 0.2, y, 43, "#28d17c", 900);
  drawCenteredText(context, data.correctLabel, width * 0.5, y, 43, "#28d17c", 900);
  drawCenteredText(context, String(data.rank), width * 0.8, y, 43, "#28d17c", 900);
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
    { icon: "â—Ž", value: `${data.accuracy}%`, label: "Ø¯Ù‚Ø© Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª" },
    { icon: "â™•", value: data.correctLabel, label: "Ø¬ÙˆÙ„Ø§Øª ØµØ­ÙŠØ­Ø©" },
    { icon: "â†—", value: String(data.rank), label: data.isFinal ? "Ø§Ù„ØªØ±ØªÙŠØ¨ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ" : "ØªØ±ØªÙŠØ¨ Ø§Ù„Ø¯ÙˆØ±" }
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
          <h2>Ø­Ø§Ù„Ø© Ø§Ù„ØªØµÙˆÙŠØª</h2>
          <button class="icon-close" type="button" data-voters-close>Ã—</button>
        </div>
        <div class="vote-summary">Ø§ÙƒØªÙ…Ù„ ${match.vote_count || 0} Ù…Ù† ${match.eligible_count || 0}</div>
        <h3 class="modal-subtitle">Ø§Ù†ØªÙ‡ÙˆØ§ Ù…Ù† Ø§Ù„ØªØµÙˆÙŠØª</h3>
        <div class="voter-list">
          ${voted.length ? voted.map(voterRow).join("") : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…ØµÙˆØªÙˆÙ† Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.")}
        </div>
        <h3 class="modal-subtitle">Ù„Ù… ÙŠÙ†ØªÙ‡ÙˆØ§ Ù…Ù† Ø§Ù„ØªØµÙˆÙŠØª</h3>
        <div class="voter-list">
          ${missing.length ? missing.map(voterRow).join("") : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù„Ø§Ø¹Ø¨ÙˆÙ† Ù…ØªØ¨Ù‚ÙˆÙ†.")}
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
          <h2>Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØµÙˆÙŠØª</h2>
          <button class="icon-close" type="button" data-vote-results-close>Ã—</button>
        </div>
        <div class="vote-result-match">
          <strong>${escapeHtml(match.team_a)} Ø¶Ø¯ ${escapeHtml(match.team_b)}</strong>
          <div class="vote-result-teams">
            ${voteResultTeamView(match.team_a, match.team_a_flag)}
            <span class="vote-result-vs">Ø¶Ø¯</span>
            ${voteResultTeamView(match.team_b, match.team_b_flag)}
          </div>
          <span class="vote-result-date">${formatAdminMatchDate(match.starts_at)}</span>
        </div>
        <div class="vote-result-summary">
          <span>${escapeHtml(match.team_a)}: ${teamACount}</span>
          <span>${escapeHtml(match.team_b)}: ${teamBCount}</span>
          <span>Ù„Ù… ÙŠØµÙˆØªÙˆØ§: ${missingCount}</span>
        </div>
        <div class="vote-result-table">
          <div class="vote-result-head">
            <span>Ø§Ù„Ù…Ø´Ø§Ø±Ùƒ</span>
            <span>Ø§Ù„ØªØ±Ø´ÙŠØ­</span>
            <span>Ø¬ÙˆÙƒØ±</span>
          </div>
          ${rows.length ? rows.map(row => voteResultRow(row, match)).join("") : emptyView("Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙƒÙˆÙ† Ù…Ù‚Ø¨ÙˆÙ„ÙˆÙ†.")}
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
  const picked = row.prediction?.winner || "Ù„Ù… ÙŠØµÙˆØª";
  const pickedClass = row.prediction
    ? row.prediction.winner === match.team_a ? "team-a" : "team-b"
    : "missing";
  return `
    <div class="vote-result-row">
      <span class="vote-result-player">${avatarTile(row.user, "vote-avatar")}<strong>${escapeHtml(row.user.name)}</strong></span>
      <span class="vote-result-pick ${pickedClass}">${escapeHtml(picked)}</span>
      <span class="vote-result-joker">${row.prediction?.is_joker ? "Ã—2" : "-"}</span>
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
    return `<span class="status-chip ${points.correct ? "done" : "wrong"}">${points.correct ? "ØªÙˆÙ‚Ø¹ ØµØ­ÙŠØ­" : "ØªÙˆÙ‚Ø¹ Ø®Ø§Ø·Ø¦"}: ${points.points} Ù†Ù‚Ø·Ø©${points.is_joker ? " Ã—2" : ""}</span>`;
  }
  if (locked) return `<span class="status-chip pending">Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†ØªØ§Ø¦Ø¬</span>`;
  if (selected) return `<span class="status-chip done">ØªÙ… Ø§Ù„ØªØµÙˆÙŠØª</span>`;
  return `<span class="status-chip">Ù…ÙØªÙˆØ­ Ù„Ù„ØªØµÙˆÙŠØª</span>`;
}

function countdownText(value) {
  const diff = Math.max(0, new Date(value).getTime() - serverNowMs());
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
    const isExpired = new Date(deadline).getTime() <= serverNowMs();
    element.textContent = isExpired ? "Ù…ØºÙ„Ù‚" : `${prefix}${countdownText(deadline)}`;
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
    loginBtn.textContent = isCreate ? "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨" : "Ø¯Ø®ÙˆÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚";
    authHint.textContent = isCreate
      ? "Ø£Ù†Ø´Ø¦ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø£ÙˆÙ„ Ù…Ø±Ø© Ø¨Ø§Ù„Ø§Ø³Ù… ÙˆØ±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±."
      : "Ø§Ø¯Ø®Ù„ Ø¨Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙÙ‚Ø·.";
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
    resetButton.textContent = "Ø¬Ø§Ø±ÙŠ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨...";
    try {
      await api("password-reset-request", {
        method: "POST",
        body: JSON.stringify({ phone: document.querySelector("#resetPhone").value.trim() })
      });
      messageBox.textContent = "ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨. Ø±Ø§Ø¬Ø¹ Ø§Ù„Ù…Ù†Ø¸Ù… Ù„ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø©.";
      messageBox.className = "notice";
      resetForm.reset();
    } catch (error) {
      messageBox.textContent = error.message || "ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø¶Ø¨Ø·";
      messageBox.className = "notice danger-notice";
    } finally {
      resetButton.disabled = false;
      resetButton.textContent = "Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø¶Ø¨Ø·";
    }
  });

  document.querySelector("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const errorBox = document.querySelector("#loginError");
    errorBox.classList.add("hidden");
    loginBtn.disabled = true;
    loginBtn.textContent = selectedMode === "create" ? "Ø¬Ø§Ø±ÙŠ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨..." : "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¯Ø®ÙˆÙ„...";

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
      errorBox.textContent = error.message || "ØªØ¹Ø°Ø± Ø§Ù„Ø¯Ø®ÙˆÙ„";
      errorBox.classList.remove("hidden");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = selectedMode === "create" ? "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨" : "Ø¯Ø®ÙˆÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚";
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
    help.textContent = "Ø¥Ø°Ø§ Ù„Ù… ØªØ¸Ù‡Ø± Ù†Ø§ÙØ°Ø© Ø§Ù„ØªØ«Ø¨ÙŠØªØŒ Ø§ÙØªØ­ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙÙŠ Chrome ÙˆØ§Ø®ØªØ± Install app Ø£Ùˆ Add to Home screen.";
    help.classList.add("show");
  });

  document.querySelector("#iosInstallBtn")?.addEventListener("click", () => {
    const help = document.querySelector("#installHelp");
    help.textContent = "Ø¹Ù„Ù‰ Ø§Ù„Ø¢ÙŠÙÙˆÙ†: Ø§ÙØªØ­ Ø§Ù„Ø±Ø§Ø¨Ø· Ù…Ù† SafariØŒ Ø§Ø¶ØºØ· Ø²Ø± Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©ØŒ Ø«Ù… Ø§Ø®ØªØ± Add to Home Screen.";
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
      state.notice = "ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù… Ù…Ù† Ø¬Ø¯ÙŠØ¯.";
      await loadData({ silent: true });
    } catch (error) {
      state.error = error.message || "ØªØ¹Ø°Ø± ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù…";
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

  document.querySelector("[data-voters-close]")?.addEventListener("click", () => {
    state.voterModalMatch = null;
    render();
  });

  document.querySelector("[data-vote-results-close]")?.addEventListener("click", () => {
    state.voteResultsModalMatch = null;
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

  document.querySelector("[data-champion-list-close]")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) {
      state.championListOpen = false;
      render();
    }
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
        state.notice = form.dataset.championOption === "team" ? "ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„ÙØ±ÙŠÙ‚." : "ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù‡Ø¯Ø§Ù.";
        await loadData({ silent: true });
        state.championListOpen = true;
      } catch (error) {
        state.error = error.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©";
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
      button.textContent = "Ø¬Ø§Ø±Ù";
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
        state.notice = "ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„ØªØ±Ø´ÙŠØ­.";
        await loadData({ silent: true });
        state.championListOpen = false;
      } catch (error) {
        state.error = error.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„ØªØ±Ø´ÙŠØ­";
        render();
      } finally {
        button.disabled = false;
        button.textContent = "Ø¥Ø¶Ø§ÙØ© ØªØ±Ø´ÙŠØ­";
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
      button.textContent = "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸...";
      try {
        await api("password-reset-complete", {
          method: "POST",
          body: JSON.stringify({
            userId: state.currentUser.id,
            participantId: form.dataset.passwordReset,
            password: form.elements.password.value.trim()
          })
        });
        state.notice = "ØªÙ… ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©.";
        await loadData({ silent: true });
      } catch (error) {
        state.error = error.message || "ØªØ¹Ø°Ø± ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±";
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
        state.notice = button.dataset.participantStatus === "approved" ? "ØªÙ… Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ù…Ø´Ø§Ø±Ùƒ." : "ØªÙ… Ø±ÙØ¶ Ø§Ù„Ù…Ø´Ø§Ø±Ùƒ.";
        await loadData({ silent: true });
      } catch (error) {
        state.error = error.message || "ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø·Ù„Ø¨ Ø§Ù„Ù…Ø´Ø§Ø±Ùƒ";
        render();
      }
    });
  });

  bindSwipeRows();

  document.querySelectorAll("[data-participant-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      const participantName = button.dataset.participantName || "Ù‡Ø°Ø§ Ø§Ù„Ù„Ø§Ø¹Ø¨";
      const confirmed = confirm(`Ø³ÙŠØªÙ… Ø­Ø°Ù ${participantName} Ù…Ù† Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©ØŒ ÙˆØ­Ø°Ù ØªÙˆÙ‚Ø¹Ø§ØªÙ‡ ÙˆØ³Ø­Ø¨ Ù†Ù‚Ø§Ø·Ù‡ Ù…Ù† ÙƒÙ„ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ† Ø«Ù… Ø¥Ø¹Ø§Ø¯Ø© ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ù†Ù‚Ø§Ø· ÙƒØ£Ù†Ù‡ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯. Ù‡Ù„ ØªØ±ÙŠØ¯ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©ØŸ`);
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
        state.notice = "ØªÙ… Ø­Ø°Ù Ø§Ù„Ù„Ø§Ø¹Ø¨ Ù…Ù† Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©.";
        closeSwipeRows();
        await loadData({ silent: true });
      } catch (error) {
        closeSwipeRows();
        state.error = error.message || "ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ù„Ø§Ø¹Ø¨";
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
        state.notice = "ØªÙ… Ø­ÙØ¸ ØªÙˆÙ‚Ø¹Ùƒ ÙÙŠ Ø§Ù„Ø³ÙŠØ±ÙØ±.";
        render();
      } catch (error) {
        if (requestSeq === predictionSaveSeq) restorePrediction(matchId, previous);
        state.error = error.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„ØªÙˆÙ‚Ø¹";
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
        state.notice = "Ø§Ø®ØªØ± Ø§Ù„ÙØ§Ø¦Ø² Ø£ÙˆÙ„Ø§Ù‹ Ø«Ù… ÙØ¹Ù‘Ù„ Ø§Ù„Ø¬ÙˆÙƒØ±.";
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
        state.notice = prediction?.is_joker ? "ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø¬ÙˆÙƒØ±." : "ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¬ÙˆÙƒØ±.";
        await loadData({ silent: true });
      } catch (error) {
        if (requestSeq === predictionSaveSeq) restorePrediction(matchId, previous);
        state.error = error.message || "ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¬ÙˆÙƒØ±";
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
        showInlineError(errorBox, "Ø£Ø¯Ø®Ù„ Ø£Ù‡Ø¯Ø§Ù Ø§Ù„ÙØ±ÙŠÙ‚ÙŠÙ† Ø¨Ø´ÙƒÙ„ ØµØ­ÙŠØ­");
        return;
      }
      if (scoreA === scoreB) {
        showInlineError(errorBox, "Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ø¹ØªÙ…Ø§Ø¯ ØªØ¹Ø§Ø¯Ù„ ÙÙŠ Ø£Ø¯ÙˆØ§Ø± Ø®Ø±ÙˆØ¬ Ø§Ù„Ù…ØºÙ„ÙˆØ¨. Ø¹Ø¯Ù„ Ø§Ù„Ø£Ù‡Ø¯Ø§Ù Ø­Ø³Ø¨ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©.");
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
      const matchName = button.dataset.matchName || "Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©";
      const confirmed = confirm(`Ø³ÙŠØªÙ… Ø­Ø°Ù ${matchName} Ù…Ø¹ Ù†ØªÙŠØ¬ØªÙ‡Ø§ ÙˆÙƒÙ„ ØªÙˆÙ‚Ø¹Ø§ØªÙ‡Ø§ØŒ ÙˆØ³ÙŠØ¹Ø§Ø¯ ØªØ±ØªÙŠØ¨ Ø§Ù„Ù†Ù‚Ø§Ø· ÙƒØ£Ù† Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©. Ù‡Ù„ ØªØ±ÙŠØ¯ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©ØŸ`);
      if (!confirmed) return;
      try {
        await api("match-delete", {
          method: "POST",
          body: JSON.stringify({ userId: state.currentUser.id, matchId: button.dataset.matchDelete })
        });
        state.notice = "ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„ØªØ±ØªÙŠØ¨.";
        state.editModalMatch = null;
        state.resultModalMatch = null;
        await loadData({ silent: true });
      } catch (error) {
        state.error = error.message || "ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©";
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
      state.notice = "ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© ÙÙŠ Ø§Ù„Ø³ÙŠØ±ÙØ±.";
      await loadData({ silent: true });
    } catch (error) {
      state.error = error.message || "ØªØ¹Ø°Ø± Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©";
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
        errorBox.textContent = error.message || "ØªØ¹Ø°Ø± ØªØ¬Ù‡ÙŠØ² Ø§Ù„ØµÙˆØ±Ø©";
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
      saveButton.textContent = "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸...";
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
      state.notice = "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ.";
      await loadData({ silent: true });
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ";
        errorBox.classList.remove("hidden");
      }
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„";
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
      <span>Ø¹Ù„Ù… Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø£ÙˆÙ„</span>
      <div class="image-input-row">
        <span class="flag-tile preview-tile" id="teamAFlagPreview">A</span>
        <input id="teamAFlag" type="file" accept="image/*" />
      </div>
    </label>
    <label class="field image-field">
      <span>Ø¹Ù„Ù… Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø«Ø§Ù†ÙŠ</span>
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
      state.error = error.message || "ØªØ¹Ø°Ø± ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø¹Ù„Ù…";
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
        state.error = error.message || "ØªØ¹Ø°Ø± ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø¹Ù„Ù…";
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
    state.notice = "ØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©.";
    state.editModalMatch = null;
    await loadData({ silent: true });
  } catch (error) {
    showInlineError(errorBox, error.message || "ØªØ¹Ø°Ø± ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©");
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
  return !!(state.profileOpen || state.voterModalMatch || state.voteResultsModalMatch || state.editModalMatch || state.resultModalMatch || state.posterRound || state.detailParticipantId || state.addMatchOpen);
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
    state.notice = winner ? "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙˆØ§Ù„ØªØ±ØªÙŠØ¨." : "ØªÙ… Ù…Ø³Ø­ Ø§Ù„Ù†ØªÙŠØ¬Ø©.";
    state.resultModalMatch = null;
    await loadData({ silent: true });
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
  if (status === "approved") return "Ù…Ù‚Ø¨ÙˆÙ„";
  if (status === "rejected") return "Ù…Ø±ÙÙˆØ¶";
  return "Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©";
}

function roundName(id) {
  return rounds.find(round => round.id === normalizeRoundId(id))?.name || id;
}

function normalizeRoundId(id) {
  return id === "r8" ? "qf" : id;
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
  return (words[0]?.[0] || "ØŸ") + (words[1]?.[0] || "");
}

function imageFileToDataUrl(file, size = 320) {
  return new Promise((resolve, reject) => {
    if (file.type && !file.type.startsWith("image/")) {
      reject(new Error("Ø§Ø®ØªØ± Ù…Ù„Ù ØµÙˆØ±Ø© ÙÙ‚Ø·"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØµÙˆØ±Ø©"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("ØªØ¹Ø°Ø± ÙØªØ­ Ø§Ù„ØµÙˆØ±Ø©"));
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
  if (!value) return "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
  return new Intl.DateTimeFormat("ar-AE", { dateStyle: "medium", timeStyle: "short", timeZone: APP_TIME_ZONE }).format(new Date(value));
}

function formatAdminMatchDate(value) {
  if (!value) return "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
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
