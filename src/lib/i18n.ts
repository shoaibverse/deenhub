/**
 * NoorHub bilingual interface strings.
 *
 * The product is designed in English first, with the established Arabic/Urdu
 * term attached where a Muslim would naturally use the original word (e.g.
 * prayer names, navigation, technical concepts). This keeps religious
 * terminology accurate while making the rest of the interface accessible to
 * non-Arabic-readers.
 *
 * These are interface labels only. Religious text (Quran, hadith, duas) is
 * never written here — it always comes from the attributed sources.
 */
export type Bilingual = { en: string; ar?: string };

const bil = (english: string, arabic?: string): Bilingual =>
  arabic === undefined ? { en: english } : { en: english, ar: arabic };

export const ur = {
  brandTagline: "Reconnect With Your Deen",
  brandTaglineUr: "اپنے دین سے دوبارہ جڑیں",
  brandSubline: "Faith, reflection and knowledge — in one peaceful place.",

  nav: {
    quran: bil("Quran", "قرآن"),
    hadith: bil("Hadith", "حدیث"),
    duas: bil("Duas", "دعا"),
    prayer: bil("Prayer", "نماز"),
    tools: bil("Tools", "اوزار"),
    home: bil("Home"),
    more: bil("More"),
    search: bil("Search"),
    close: bil("Close"),
    menu: bil("Menu"),
    theme: bil("Theme"),
  },

  tools: {
    qibla: bil("Qibla", "قبلہ"),
    calendar: bil("Calendar", "کیلنڈر"),
    tasbeeh: bil("Tasbeeh", "تسبیح"),
    zakat: bil("Zakat calculator"),
    bookmarks: bil("Bookmarks"),
  },

  footer: {
    read: bil("Read"),
    daily: bil("Daily"),
    tools: bil("Tools"),
    about: bil("About"),
    aboutPage: bil("About NoorHub"),
    contact: bil("Contact"),
    privacy: bil("Privacy"),
    terms: bil("Terms"),
    disclaimer: bil("Disclaimer"),
    sources: bil("Content sources"),
    note:
      "Religious content is provided for educational and informational purposes. Verify matters of religious ruling with qualified scholars.",
  },

  home: {
    greeting: bil("Assalamu Alaikum", "السلام علیکم"),
    heading: "Reconnect With Your Deen",
    headingUr: "اپنے دین سے دوبارہ جڑیں",
    description:
      "Read the Quran, reflect on authentic teachings, remember Allah, and keep your daily Islamic resources close.",
    descriptionUr:
      "قرآن پڑھیں، مستند تعلیمات پر غور کریں، اللہ کو یاد کریں اور اپنے روزمرہ اسلامی وسائل اپنے قریب رکھیں۔",
    exploreQuran: bil("Explore Quran", "قرآن کھولیں"),
    todaysDuas: bil("Today’s Duas", "آج کی دعا"),
    todayHeading: "Today at a glance",
    todaysDate: "Today’s date",
    nextPrayer: "Next prayer",
    quranProgress: "Quran progress",
    prayerTimes: "Prayer times",
    duaOfDay: "Dua of the day",
    duaOfDayTitle: "A supplication for today",
    browseAll: "Browse all duas",
    library: "The library",
    libraryTitle: "Three collections, in one place",
    libraryDescription:
      "Every text is loaded from an attributed source. Where a source is unavailable, NoorHub says so instead of showing something else.",
    openQuran: "Open the Quran",
    enterLibrary: "Enter the library",
    browseDuas: "Browse duas",
    dailyTools: "Daily tools",
    dailyToolsTitle: "Quiet, practical tools",
    dailyToolsDescription:
      "Calculations run locally where possible. Location is only used after you give permission, and it never leaves your device.",
    quranCard:
      "All surahs in Uthmani script with a choice of translation, audio recitation, adjustable Arabic type size and bookmarks.",
    hadithCard:
      "The six canonical collections arranged by their own book sections, with Arabic text and Urdu and English translations from the source.",
    duasCard: "Arabic, transliteration, translation and recitation audio.",
    categories: "categories",
  },

  prayer: {
    location: bil("Location", "مقام"),
    setLocation: "Set your location",
    useMyLocation: "Use my location",
    chooseCity: "Choose a city…",
    requesting: "Requesting…",
    method: "Calculation method",
    asr: "Asr calculation",
    standard: "Standard",
    hanafi: "Hanafi",
    nightPortions: "Night portions",
    middleOfTheNight: "Middle of the night",
    lastThird: "Last third of the night",
    noLocation: "No location selected",
    noLocationHelp:
      "Prayer times are calculated from your coordinates. Choose a city above or allow location access.",
    retry: "Try again",
    notAPrayer: "(not a prayer)",
  },

  quran: {
    read: bil("Quran", "قرآن"),
    title: "Read at your own pace",
    filter: "Filter by name or number",
    all: "All",
    meccan: bil("Meccan", "مکی"),
    medinan: bil("Medinan", "مدنی"),
    surah: bil("Surah", "سورۃ"),
    juz: bil("Juz", "پارہ"),
    ayahs: "ayahs",
    translation: "Translation",
    reciter: "Reciter",
    listen: "Listen",
    bookmark: "Bookmark",
    copy: "Copy",
    share: "Share",
    lastRead: "You last read up to",
    setLastRead: "Set as last read",
    markRead: "Mark surah as read",
    searchTitle: "Find a surah, a word or a passage",
    search: "Search",
  },

  duas: {
    title: "Remembrance for the moments of the day",
    searchPlaceholder: "Search by meaning, e.g. forgiveness, travel, anxiety",
    all: "All",
    morning: "Morning",
    evening: "Evening",
    sleep: "Before sleeping",
    afterPrayer: "After prayer",
    travel: "Travel",
    food: "Food",
    forgiveness: "Forgiveness",
    protection: "Protection",
    difficulty: "Difficulty",
    family: "Home and family",
    knowledge: "Knowledge",
    ramadan: "Fasting and Ramadan",
    save: "Save",
    saved: "Saved",
    listen: "Listen",
    noResults: "No duas found",
    previous: "Previous",
    next: "Next",
  },

  hadith: {
    title: "Hadith library",
    browseThemes: "Browse by theme",
  },

  calendar: {
    title: "Hijri and Gregorian, together",
    today: "Today",
    notableDates: "Notable dates",
  },

  tasbeeh: {
    title: "Keep count, quietly",
    count: "Count",
    target: "Target",
    phrase: "Phrase",
    reset: "Reset",
    remaining: "remaining",
    sessions: "Recent sessions",
    noSessions: "No sessions saved yet.",
  },

  zakat: {
    title: "Estimate your zakat",
    assets: "Assets",
    cash: "Cash in hand and bank",
    gold: "Gold",
    silver: "Silver",
    grams: "grams",
    investments: "Investments",
    business: "Business assets",
    receivables: "Money owed to you",
    liabilities: "Debts and immediate obligations",
    total: "Total assets",
    eligible: "Eligible wealth",
    nisab: "Nisab",
    estimate: "Estimate",
    belowNisab: "Below nisab",
    clear: "Clear the form",
  },

  states: {
    loading: "Loading…",
    retry: "Try again",
    empty: "Nothing yet",
  },
};
