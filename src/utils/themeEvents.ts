export interface ThemeConfig {
  id: string;
  name: string;
  category: "occasion" | "classic";
  dateDisplay?: string;
  badge?: string;
  badgeIcon?: string;
  effect?: "snow" | "confetti" | "bats" | "petals" | "gulal" | "stars" | "sparkles" | "bangla-letters" | "none";
  bg: string;
  accent: string;
  faviconSvg?: string;
  description: string;
}

// Inline SVGs for event favicons
const FAVICONS = {
  victoryDay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#043927" stroke="#10b981" stroke-width="2"/>
    <circle cx="28" cy="32" r="14" fill="#e63946"/>
    <path d="M42 22 L45 32 L51 32 L46 36 L48 45 L42 39 L36 45 L38 36 L33 32 L39 32 Z" fill="#ffd166" opacity="0.9"/>
  </svg>`,

  christmas: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#0a1612"/>
    <!-- Christmas Tree -->
    <polygon points="32,10 40,24 35,24 45,38 38,38 48,50 16,50 26,38 19,38 29,24 24,24" fill="#15803d"/>
    <rect x="29" y="50" width="6" height="8" fill="#92400e" rx="1"/>
    <!-- Top Star -->
    <polygon points="32,5 34,11 40,11 35,15 37,21 32,17 27,21 29,15 24,11 30,11" fill="#facc15"/>
    <!-- Baubles / Lights -->
    <circle cx="32" cy="27" r="2" fill="#ef4444"/>
    <circle cx="27" cy="36" r="2" fill="#38bdf8"/>
    <circle cx="37" cy="36" r="2" fill="#facc15"/>
    <circle cx="24" cy="46" r="2.2" fill="#e11d48"/>
    <circle cx="34" cy="45" r="2.2" fill="#f43f5e"/>
    <circle cx="41" cy="47" r="2.2" fill="#67e8f9"/>
    <!-- Snowflakes -->
    <circle cx="12" cy="14" r="1.5" fill="#ffffff" opacity="0.8"/>
    <circle cx="52" cy="18" r="1.5" fill="#ffffff" opacity="0.8"/>
    <circle cx="50" cy="40" r="1.2" fill="#ffffff" opacity="0.6"/>
    <circle cx="14" cy="42" r="1.2" fill="#ffffff" opacity="0.6"/>
  </svg>`,

  newYear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#09090f"/>
    <!-- Fireworks burst / Starburst -->
    <circle cx="32" cy="30" r="3" fill="#fde047"/>
    <line x1="32" y1="12" x2="32" y2="20" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="32" y1="40" x2="32" y2="48" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="14" y1="30" x2="22" y2="30" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="42" y1="30" x2="50" y2="30" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="19" y1="17" x2="25" y2="23" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
    <line x1="39" y1="37" x2="45" y2="43" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <line x1="45" y1="17" x2="39" y2="23" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
    <line x1="25" y1="37" x2="19" y2="43" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>
    <!-- Sparkles -->
    <circle cx="14" cy="48" r="2" fill="#fbbf24"/>
    <circle cx="50" cy="14" r="2" fill="#fbbf24"/>
    <!-- Confetti ribbon -->
    <path d="M12 56 Q 32 46 52 56" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  halloween: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#0c0910"/>
    <!-- Pumpkin Body -->
    <ellipse cx="32" cy="36" rx="22" ry="18" fill="#f97316"/>
    <ellipse cx="32" cy="36" rx="14" ry="18" fill="#ea580c"/>
    <ellipse cx="32" cy="36" rx="6" ry="18" fill="#c2410c"/>
    <!-- Stem -->
    <path d="M30 18 C30 12, 36 10, 38 8 C36 12, 34 16, 33 18 Z" fill="#65a30d"/>
    <!-- Carved Eyes -->
    <polygon points="22,29 27,33 21,35" fill="#181324"/>
    <polygon points="42,29 37,33 43,35" fill="#181324"/>
    <!-- Carved Nose -->
    <polygon points="32,34 30,38 34,38" fill="#181324"/>
    <!-- Carved Smile -->
    <path d="M20 42 Q 32 50 44 42 Q 40 47 36 44 Q 32 48 28 44 Q 24 47 20 42 Z" fill="#181324"/>
  </svg>`,

  languageDay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#0f0f12"/>
    <!-- Red Memorial Sun -->
    <circle cx="32" cy="27" r="15" fill="#dc2626"/>
    <!-- Shaheed Minar Pillars in White/Steel -->
    <!-- Base -->
    <rect x="12" y="52" width="40" height="4" fill="#9ca3af" rx="1"/>
    <!-- Center bent pillar -->
    <rect x="29" y="16" width="6" height="36" fill="#f3f4f6"/>
    <path d="M29 16 C29 12, 35 12, 35 16 Z" fill="#f3f4f6"/>
    <!-- Left vertical pillars -->
    <rect x="22" y="24" width="4" height="28" fill="#d1d5db"/>
    <rect x="16" y="32" width="3.5" height="20" fill="#9ca3af"/>
    <!-- Right vertical pillars -->
    <rect x="38" y="24" width="4" height="28" fill="#d1d5db"/>
    <rect x="44.5" y="32" width="3.5" height="20" fill="#9ca3af"/>
    <!-- Bangla Letter অ symbol overlay subtly -->
    <text x="32" y="58" font-size="8" font-weight="bold" fill="#f87171" text-anchor="middle" font-family="sans-serif">২১</text>
  </svg>`,

  falgun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#171007"/>
    <!-- Marigold / Palash Blooming Flower -->
    <g transform="translate(32,32)">
      <!-- Petals 8-direction -->
      <ellipse cx="0" cy="-16" rx="6" ry="11" fill="#f59e0b"/>
      <ellipse cx="11.3" cy="-11.3" rx="6" ry="11" transform="rotate(45 11.3 -11.3)" fill="#f97316"/>
      <ellipse cx="16" cy="0" rx="6" ry="11" transform="rotate(90 16 0)" fill="#f59e0b"/>
      <ellipse cx="11.3" cy="11.3" rx="6" ry="11" transform="rotate(135 11.3 11.3)" fill="#ef4444"/>
      <ellipse cx="0" cy="16" rx="6" ry="11" fill="#f59e0b"/>
      <ellipse cx="-11.3" cy="11.3" rx="6" ry="11" transform="rotate(225 -11.3 11.3)" fill="#f97316"/>
      <ellipse cx="-16" cy="0" rx="6" ry="11" transform="rotate(270 -16 0)" fill="#f59e0b"/>
      <ellipse cx="-11.3" cy="-11.3" rx="6" ry="11" transform="rotate(315 -11.3 -11.3)" fill="#ef4444"/>
      <!-- Inner Flower Center -->
      <circle cx="0" cy="0" r="8" fill="#fbbf24"/>
      <circle cx="0" cy="0" r="5" fill="#b45309"/>
    </g>
  </svg>`,

  independenceDay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#041f15"/>
    <!-- Red Sun of Independence -->
    <circle cx="32" cy="28" r="14" fill="#e11d48"/>
    <!-- National Memorial (Jatiyo Smriti Soudho) Pyramid Silhouette -->
    <polygon points="32,10 24,54 40,54" fill="#f0fdf4"/>
    <polygon points="32,10 20,54 24,54" fill="#86efac"/>
    <polygon points="32,10 40,54 44,54" fill="#86efac"/>
    <polygon points="32,18 16,54 20,54" fill="#34d399"/>
    <polygon points="32,18 44,54 48,54" fill="#34d399"/>
    <!-- Base line -->
    <rect x="12" y="54" width="40" height="3" fill="#10b981" rx="1"/>
  </svg>`,

  boishakh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#180b0c"/>
    <!-- Pohela Boishakh Sun / Mangal Shobhajatra Motif -->
    <circle cx="32" cy="32" r="16" fill="#e11d48" stroke="#fef2f2" stroke-width="2"/>
    <!-- Sun Rays / Alpana -->
    <g stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round">
      <line x1="32" y1="8" x2="32" y2="12"/>
      <line x1="32" y1="52" x2="32" y2="56"/>
      <line x1="8" y1="32" x2="12" y2="32"/>
      <line x1="52" y1="32" x2="56" y2="32"/>
      <line x1="15" y1="15" x2="18" y2="18"/>
      <line x1="46" y1="46" x2="49" y2="49"/>
      <line x1="15" y1="49" x2="18" y2="46"/>
      <line x1="46" y1="18" x2="49" y2="15"/>
    </g>
    <!-- Center Bengali Mask smile / Alpana eye -->
    <path d="M24 30 Q 32 38 40 30" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="26" cy="25" r="2" fill="#ffffff"/>
    <circle cx="38" cy="25" r="2" fill="#ffffff"/>
    <circle cx="32" cy="22" r="2" fill="#fbbf24"/>
  </svg>`,

  holi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#0c0817"/>
    <!-- Color Splashes -->
    <circle cx="26" cy="24" r="12" fill="#ec4899" opacity="0.9"/>
    <circle cx="40" cy="26" r="11" fill="#06b6d4" opacity="0.85"/>
    <circle cx="32" cy="40" r="13" fill="#eab308" opacity="0.9"/>
    <circle cx="22" cy="38" r="8" fill="#a855f7" opacity="0.85"/>
    <circle cx="42" cy="38" r="8" fill="#10b981" opacity="0.85"/>
    <!-- Small splatter dots -->
    <circle cx="14" cy="18" r="3" fill="#ec4899"/>
    <circle cx="48" cy="14" r="3.5" fill="#06b6d4"/>
    <circle cx="52" cy="48" r="3" fill="#eab308"/>
    <circle cx="16" cy="48" r="2.5" fill="#10b981"/>
    <circle cx="32" cy="12" r="2" fill="#a855f7"/>
  </svg>`,

  durgaPuja: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#150a11"/>
    <!-- Third Eye (Trinetra) & Sindoor Bindi -->
    <!-- Red Sindoor Crescent & Bindi -->
    <circle cx="32" cy="18" r="4" fill="#e11d48"/>
    <!-- Trinetra vertical eye -->
    <path d="M32 24 C28 29 28 35 32 40 C36 35 36 29 32 24 Z" fill="#f59e0b" stroke="#e11d48" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="2" fill="#78350f"/>
    <!-- Left Eye curved -->
    <path d="M14 34 Q 22 28 28 35 Q 22 40 14 34 Z" fill="#ffffff" stroke="#e11d48" stroke-width="1.5"/>
    <circle cx="21" cy="34" r="2.5" fill="#150a11"/>
    <!-- Right Eye curved -->
    <path d="M50 34 Q 42 28 36 35 Q 42 40 50 34 Z" fill="#ffffff" stroke="#e11d48" stroke-width="1.5"/>
    <circle cx="43" cy="34" r="2.5" fill="#150a11"/>
    <!-- Golden Diya flame below -->
    <path d="M26 48 Q 32 44 38 48 Q 32 54 26 48 Z" fill="#f59e0b"/>
    <ellipse cx="32" cy="45" rx="2" ry="4" fill="#ef4444"/>
  </svg>`,

  eid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#041612"/>
    <!-- Golden Crescent Moon -->
    <path d="M38 12 C24 14 16 26 18 40 C20 50 30 56 42 52 C32 52 24 44 26 32 C27 22 34 14 38 12 Z" fill="#fbbf24"/>
    <!-- Glowing Star -->
    <polygon points="44,22 46,27 51,27 47,30 49,35 44,32 39,35 41,30 37,27 42,27" fill="#fef08a"/>
    <!-- Small twinkle stars -->
    <circle cx="48" cy="44" r="1.5" fill="#fef08a"/>
    <circle cx="24" cy="18" r="1.2" fill="#34d399"/>
    <circle cx="52" cy="14" r="1.2" fill="#fef08a"/>
  </svg>`,

  default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#0d1b2a"/>
    <path d="M16 24 C20 16, 28 14, 34 20 C40 14, 48 16, 52 24 C56 34, 46 44, 34 52 C22 44, 12 34, 16 24 Z" fill="none" stroke="#778da9" stroke-width="3"/>
    <circle cx="34" cy="32" r="5" fill="#415a77"/>
  </svg>`
};

export const OCCASIONS: ThemeConfig[] = [
  {
    id: "victory-day",
    name: "Victory Day (16 Dec)",
    category: "occasion",
    dateDisplay: "Dec 15 - 16",
    badge: "🇧🇩 16 Dec • Victory Day",
    badgeIcon: "🇧🇩",
    effect: "sparkles",
    bg: "#041c14",
    accent: "#e63946",
    faviconSvg: FAVICONS.victoryDay,
    description: "Honoring the glorious Victory Day of Bangladesh with patriotic deep emerald & red sun.",
  },
  {
    id: "christmas",
    name: "Christmas & Eve",
    category: "occasion",
    dateDisplay: "Dec 24 - 26",
    badge: "🎄 Merry Christmas & Eve",
    badgeIcon: "🎄",
    effect: "snow",
    bg: "#0a1612",
    accent: "#ef4444",
    faviconSvg: FAVICONS.christmas,
    description: "Festive winter evergreen, snowy night, warm Santa crimson and falling snowflakes.",
  },
  {
    id: "new-year",
    name: "New Year & Eve",
    category: "occasion",
    dateDisplay: "Dec 31 - Jan 2",
    badge: "🎆 Happy New Year!",
    badgeIcon: "🎆",
    effect: "confetti",
    bg: "#09090f",
    accent: "#eab308",
    faviconSvg: FAVICONS.newYear,
    description: "Celebratory champagne gold & midnight noir with joyful confetti celebrations.",
  },
  {
    id: "halloween",
    name: "Halloween",
    category: "occasion",
    dateDisplay: "Oct 30 - 31",
    badge: "🎃 Spooky Halloween",
    badgeIcon: "🎃",
    effect: "bats",
    bg: "#0b0910",
    accent: "#f97316",
    faviconSvg: FAVICONS.halloween,
    description: "Eerie haunted purple, pumpkin orange, glowing embers and nocturnal bats.",
  },
  {
    id: "language-day",
    name: "Mother Language Day",
    category: "occasion",
    dateDisplay: "Feb 20 - 21",
    badge: "🕊️ 21 Feb • Mother Language Day",
    badgeIcon: "🕊️",
    effect: "bangla-letters",
    bg: "#0f0f12",
    accent: "#dc2626",
    faviconSvg: FAVICONS.languageDay,
    description: "Solemn tribute to language martyrs with monument monochrome and subtle floating Bangla letters.",
  },
  {
    id: "falgun",
    name: "Pohela Falgun & Valentine",
    category: "occasion",
    dateDisplay: "Feb 13 - 15",
    badge: "🌸 Pohela Falgun • Shubho Basanta",
    badgeIcon: "🌸",
    effect: "petals",
    bg: "#171007",
    accent: "#f59e0b",
    faviconSvg: FAVICONS.falgun,
    description: "Welcoming the Bengali Spring with Basanti saffron, marigold petals and warm sunshine.",
  },
  {
    id: "independence-day",
    name: "Independence Day (26 Mar)",
    category: "occasion",
    dateDisplay: "Mar 25 - 26",
    badge: "🇧🇩 26 Mar • Independence Day",
    badgeIcon: "🇧🇩",
    effect: "sparkles",
    bg: "#051b12",
    accent: "#e11d48",
    faviconSvg: FAVICONS.independenceDay,
    description: "Celebrating Bangladesh Independence Day with emerald green and radiant red.",
  },
  {
    id: "boishakh",
    name: "Pohela Boishakh (Bengali New Year)",
    category: "occasion",
    dateDisplay: "Apr 13 - 15",
    badge: "🎉 Shubho Noboborsho • Pohela Boishakh",
    badgeIcon: "🎉",
    effect: "confetti",
    bg: "#180b0c",
    accent: "#e11d48",
    faviconSvg: FAVICONS.boishakh,
    description: "Traditional Bengali New Year celebration in vibrant Shada-Lal with festive folk motifs.",
  },
  {
    id: "eid",
    name: "Eid & Chand Raat",
    category: "occasion",
    dateDisplay: "Lunar (Fitr / Adha)",
    badge: "🌙 Eid Mubarak!",
    badgeIcon: "🌙",
    effect: "stars",
    bg: "#041612",
    accent: "#10b981",
    faviconSvg: FAVICONS.eid,
    description: "Festive celestial emerald, shimmering golden crescent moon and twinkling night stars.",
  },
  {
    id: "holi",
    name: "Holi (Festival of Colors)",
    category: "occasion",
    dateDisplay: "March (Phalguna Purnima)",
    badge: "🎨 Happy Holi • Festival of Colors",
    badgeIcon: "🎨",
    effect: "gulal",
    bg: "#0c0817",
    accent: "#d946ef",
    faviconSvg: FAVICONS.holi,
    description: "Joyful explosion of vivid gulal powders (pink, cyan, yellow) and colorful particle bursts.",
  },
  {
    id: "durga-puja",
    name: "Durga Puja (Sharodotsav)",
    category: "occasion",
    dateDisplay: "Autumn (Sep - Oct)",
    badge: "🪔 Shubho Sharodiya • Durga Puja",
    badgeIcon: "🪔",
    effect: "sparkles",
    bg: "#150a11",
    accent: "#f59e0b",
    faviconSvg: FAVICONS.durgaPuja,
    description: "Autumn celebration with divine crimson, golden diya radiance and autumnal Kashful.",
  },
];

export const CLASSIC_THEMES: ThemeConfig[] = [
  {
    id: "prussian",
    name: "Prussian Twilight",
    category: "classic",
    bg: "#0d1b2a",
    accent: "#778da9",
    effect: "none",
    faviconSvg: FAVICONS.default,
    description: "Default classic deep navy and prussian slate.",
  },
  {
    id: "violet",
    name: "Nebula Violet",
    category: "classic",
    bg: "#0c0a12",
    accent: "#a855f7",
    effect: "none",
    faviconSvg: FAVICONS.default,
    description: "Cosmic purple nebula with electric violet accents.",
  },
  {
    id: "emerald",
    name: "Emerald Cyber",
    category: "classic",
    bg: "#06120d",
    accent: "#10b981",
    effect: "none",
    faviconSvg: FAVICONS.default,
    description: "Cyberpunk deep forest and neon emerald highlights.",
  },
  {
    id: "nord",
    name: "Nordic Aurora",
    category: "classic",
    bg: "#091118",
    accent: "#06b6d4",
    effect: "none",
    faviconSvg: FAVICONS.default,
    description: "Cool arctic chill with cyan aurora borealis glow.",
  },
  {
    id: "amber",
    name: "Retro Amber",
    category: "classic",
    bg: "#140f09",
    accent: "#f59e0b",
    effect: "none",
    faviconSvg: FAVICONS.default,
    description: "Warm vintage terminal glow in rich amber.",
  },
];

export const ALL_THEMES: ThemeConfig[] = [...OCCASIONS, ...CLASSIC_THEMES];

export const getThemeById = (id: string): ThemeConfig => {
  return ALL_THEMES.find((t) => t.id === id) || CLASSIC_THEMES[0];
};

/**
 * Calendar Matching Logic (Including Eves & Multi-year Lunar tables)
 */
interface DateRange {
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
}

// Lunar event tables spanning 2024 to 2030 (Month is 1-12)
const LUNAR_EVENTS: Record<string, Record<number, DateRange[]>> = {
  // Holi (Phalguna Purnima + Eve)
  holi: {
    2024: [{ startMonth: 3, startDay: 24, endMonth: 3, endDay: 25 }],
    2025: [{ startMonth: 3, startDay: 13, endMonth: 3, endDay: 14 }],
    2026: [{ startMonth: 3, startDay: 2, endMonth: 3, endDay: 4 }],
    2027: [{ startMonth: 3, startDay: 21, endMonth: 3, endDay: 23 }],
    2028: [{ startMonth: 3, startDay: 9, endMonth: 3, endDay: 11 }],
    2029: [{ startMonth: 3, startDay: 28, endMonth: 3, endDay: 30 }],
    2030: [{ startMonth: 3, startDay: 17, endMonth: 3, endDay: 19 }],
  },
  // Durga Puja (Sasthi through Dashami + Eve)
  "durga-puja": {
    2024: [{ startMonth: 10, startDay: 7, endMonth: 10, endDay: 13 }],
    2025: [{ startMonth: 9, startDay: 27, endMonth: 10, endDay: 2 }],
    2026: [{ startMonth: 10, startDay: 15, endMonth: 10, endDay: 21 }],
    2027: [{ startMonth: 10, startDay: 4, endMonth: 10, endDay: 10 }],
    2028: [{ startMonth: 9, startDay: 23, endMonth: 9, endDay: 29 }],
    2029: [{ startMonth: 10, startDay: 12, endMonth: 10, endDay: 18 }],
    2030: [{ startMonth: 10, startDay: 1, endMonth: 10, endDay: 7 }],
  },
  // Eid (Fitr and Adha, including Chand Raat / Eve)
  eid: {
    2024: [
      { startMonth: 4, startDay: 9, endMonth: 4, endDay: 12 }, // Eid-ul-Fitr
      { startMonth: 6, startDay: 15, endMonth: 6, endDay: 18 }, // Eid-ul-Adha
    ],
    2025: [
      { startMonth: 3, startDay: 29, endMonth: 4, endDay: 2 },
      { startMonth: 6, startDay: 5, endMonth: 6, endDay: 8 },
    ],
    2026: [
      { startMonth: 3, startDay: 18, endMonth: 3, endDay: 22 },
      { startMonth: 5, startDay: 25, endMonth: 5, endDay: 29 },
    ],
    2027: [
      { startMonth: 3, startDay: 8, endMonth: 3, endDay: 12 },
      { startMonth: 5, startDay: 15, endMonth: 5, endDay: 19 },
    ],
    2028: [
      { startMonth: 2, startDay: 25, endMonth: 2, endDay: 29 },
      { startMonth: 5, startDay: 3, endMonth: 5, endDay: 7 },
    ],
    2029: [
      { startMonth: 2, startDay: 13, endMonth: 2, endDay: 17 },
      { startMonth: 4, startDay: 22, endMonth: 4, endDay: 26 },
    ],
    2030: [
      { startMonth: 2, startDay: 2, endMonth: 2, endDay: 6 },
      { startMonth: 4, startDay: 11, endMonth: 4, endDay: 15 },
    ],
  },
};

function isDateInRange(
  year: number,
  month: number,
  day: number,
  range: DateRange
): boolean {
  const current = new Date(year, month - 1, day).getTime();
  const start = new Date(year, range.startMonth - 1, range.startDay).getTime();
  const end = new Date(year, range.endMonth - 1, range.endDay, 23, 59, 59).getTime();
  return current >= start && current <= end;
}

/**
 * Detects if the given date matches any calendar occasion / eve.
 * Returns the matching ThemeConfig, or null if it's a regular day.
 */
export function detectCurrentOccasion(date: Date = new Date()): ThemeConfig | null {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // 1. Victory Day (BD): Dec 15 (eve) to Dec 16
  if (month === 12 && (day === 15 || day === 16)) {
    return getThemeById("victory-day");
  }

  // 2. Christmas: Dec 24 (Christmas Eve) to Dec 26
  if (month === 12 && day >= 24 && day <= 26) {
    return getThemeById("christmas");
  }

  // 3. New Year's Eve & New Year: Dec 31 to Jan 2
  if ((month === 12 && day === 31) || (month === 1 && day <= 2)) {
    return getThemeById("new-year");
  }

  // 4. Halloween: Oct 30 (eve) to Oct 31
  if (month === 10 && (day === 30 || day === 31)) {
    return getThemeById("halloween");
  }

  // 5. International Mother Language Day: Feb 20 (eve) to Feb 21
  if (month === 2 && (day === 20 || day === 21)) {
    return getThemeById("language-day");
  }

  // 6. Pohela Falgun (Spring) & Valentine: Feb 13 to Feb 15
  if (month === 2 && day >= 13 && day <= 15) {
    return getThemeById("falgun");
  }

  // 7. Independence Day (BD): Mar 25 (eve) to Mar 26
  if (month === 3 && (day === 25 || day === 26)) {
    return getThemeById("independence-day");
  }

  // 8. Pohela Boishakh (Bengali New Year): Apr 13 (Chaitra Sankranti) to Apr 15
  if (month === 4 && day >= 13 && day <= 15) {
    return getThemeById("boishakh");
  }

  // Check lunar events with multi-year lookup
  // 9. Holi
  const holiRanges = LUNAR_EVENTS.holi[year];
  if (holiRanges && holiRanges.some((r) => isDateInRange(year, month, day, r))) {
    return getThemeById("holi");
  }

  // 10. Durga Puja
  const pujaRanges = LUNAR_EVENTS["durga-puja"][year];
  if (pujaRanges && pujaRanges.some((r) => isDateInRange(year, month, day, r))) {
    return getThemeById("durga-puja");
  }

  // 11. Eid
  const eidRanges = LUNAR_EVENTS.eid[year];
  if (eidRanges && eidRanges.some((r) => isDateInRange(year, month, day, r))) {
    return getThemeById("eid");
  }

  return null;
}

/**
 * Encodes an SVG string into an inline Data URI for dynamic favicon switching
 */
export function generateFaviconDataUri(svg: string): string {
  // Clean whitespace and encode
  const cleanSvg = svg.trim().replace(/\s+/g, " ");
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
}
