export type LogicMode = "Descending" | "Ascending";

export type AstrologyMeta = {
  sign: string | null;
  element: string | null;
  planet: string | null;
  governingSign: string | null;
  modality: string | null;
  planetRuler: string | null;
  decanRange: string | null;
  dates: string | null;
};

export type ThothCardMeta = {
  id: string;
  name: string;
  image: string;
  suit: string | null;
  rank: string | null;
  number: number | null;
  arcanaTitle: string | null;
  elementalAttribution: string | null;
  layer: 1 | 2 | 3 | 4 | 5 | 6;
  sephirah: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  hebrewLetter: string | null;
  treeOfLifePath: string | null;
  dayOfWeek: string | null;
  metal: string | null;
  astrology: AstrologyMeta;
  logic: LogicMode;
};

const SIGN_DECAN_DATA = {
  Aries: [
    { dates: "Mar 21-Mar 30", planet: "Mars" },
    { dates: "Mar 31-Apr 10", planet: "Sun" },
    { dates: "Apr 11-Apr 20", planet: "Venus" }
  ],
  Taurus: [
    { dates: "Apr 21-Apr 30", planet: "Mercury" },
    { dates: "May 01-May 10", planet: "Moon" },
    { dates: "May 11-May 20", planet: "Saturn" }
  ],
  Gemini: [
    { dates: "May 21-May 31", planet: "Jupiter" },
    { dates: "Jun 01-Jun 10", planet: "Mars" },
    { dates: "Jun 11-Jun 20", planet: "Sun" }
  ],
  Cancer: [
    { dates: "Jun 21-Jul 01", planet: "Venus" },
    { dates: "Jul 02-Jul 11", planet: "Mercury" },
    { dates: "Jul 12-Jul 21", planet: "Moon" }
  ],
  Leo: [
    { dates: "Jul 22-Aug 01", planet: "Saturn" },
    { dates: "Aug 02-Aug 11", planet: "Jupiter" },
    { dates: "Aug 12-Aug 22", planet: "Mars" }
  ],
  Virgo: [
    { dates: "Aug 23-Sep 01", planet: "Sun" },
    { dates: "Sep 02-Sep 11", planet: "Venus" },
    { dates: "Sep 12-Sep 22", planet: "Mercury" }
  ],
  Libra: [
    { dates: "Sep 23-Oct 02", planet: "Moon" },
    { dates: "Oct 03-Oct 12", planet: "Saturn" },
    { dates: "Oct 13-Oct 22", planet: "Jupiter" }
  ],
  Scorpio: [
    { dates: "Oct 23-Nov 01", planet: "Mars" },
    { dates: "Nov 02-Nov 11", planet: "Sun" },
    { dates: "Nov 12-Nov 22", planet: "Venus" }
  ],
  Sagittarius: [
    { dates: "Nov 23-Dec 02", planet: "Mercury" },
    { dates: "Dec 03-Dec 12", planet: "Moon" },
    { dates: "Dec 13-Dec 21", planet: "Saturn" }
  ],
  Capricorn: [
    { dates: "Dec 22-Dec 30", planet: "Jupiter" },
    { dates: "Dec 31-Jan 09", planet: "Mars" },
    { dates: "Jan 10-Jan 19", planet: "Sun" }
  ],
  Aquarius: [
    { dates: "Jan 20-Jan 29", planet: "Venus" },
    { dates: "Jan 30-Feb 08", planet: "Mercury" },
    { dates: "Feb 09-Feb 18", planet: "Moon" }
  ],
  Pisces: [
    { dates: "Feb 19-Feb 28", planet: "Saturn" },
    { dates: "Mar 01-Mar 10", planet: "Jupiter" },
    { dates: "Mar 11-Mar 20", planet: "Mars" }
  ]
} as const;

const SUIT_DATA = {
  wands: {
    title: "Wands",
    element: "Fire",
    signs: ["Aries", "Leo", "Sagittarius"]
  },
  cups: {
    title: "Cups",
    element: "Water",
    signs: ["Cancer", "Scorpio", "Pisces"]
  },
  swords: {
    title: "Swords",
    element: "Air",
    signs: ["Libra", "Aquarius", "Gemini"]
  },
  disks: {
    title: "Disks",
    element: "Earth",
    signs: ["Capricorn", "Taurus", "Virgo"]
  }
} as const;

const ZODIAC_DESTINY = [
  {
    id: "aries-emperor",
    sign: "Aries",
    title: "The Emperor",
    atu: "IV",
    image: "/images/the-emperor.png",
    element: "Fire",
    modality: "Cardinal",
    hebrewLetter: "צ (Tzaddi)",
    treeOfLifePath: "7. Netzach - 9. Yesod"
  },
  {
    id: "taurus-hierophant",
    sign: "Taurus",
    title: "The Hierophant",
    atu: "V",
    image: "/images/the-hierophant.png",
    element: "Earth",
    modality: "Fixed",
    hebrewLetter: "ו (Vav)",
    treeOfLifePath: "2. Chokmah - 4. Chesed"
  },
  {
    id: "gemini-lovers",
    sign: "Gemini",
    title: "The Lovers",
    atu: "VI",
    image: "/images/the-lovers.png",
    element: "Air",
    modality: "Mutable",
    hebrewLetter: "ז (Zain)",
    treeOfLifePath: "3. Binah - 6. Tiphareth"
  },
  {
    id: "cancer-chariot",
    sign: "Cancer",
    title: "The Chariot",
    atu: "VII",
    image: "/images/the-chariot.png",
    element: "Water",
    modality: "Cardinal",
    hebrewLetter: "ח (Cheth)",
    treeOfLifePath: "3. Binah - 5. Geburah"
  },
  {
    id: "leo-lust",
    sign: "Leo",
    title: "Lust",
    atu: "XI",
    image: "/images/lust.png",
    element: "Fire",
    modality: "Fixed",
    hebrewLetter: "ט (Teth)",
    treeOfLifePath: "4. Chesed - 5. Geburah"
  },
  {
    id: "virgo-hermit",
    sign: "Virgo",
    title: "The Hermit",
    atu: "IX",
    image: "/images/the-hermit.png",
    element: "Earth",
    modality: "Mutable",
    hebrewLetter: "י (Yod)",
    treeOfLifePath: "4. Chesed - 6. Tiphareth"
  },
  {
    id: "libra-adjustment",
    sign: "Libra",
    title: "Adjustment",
    atu: "VIII",
    image: "/images/adjustment.png",
    element: "Air",
    modality: "Cardinal",
    hebrewLetter: "ל (Lamed)",
    treeOfLifePath: "5. Geburah - 6. Tiphareth"
  },
  {
    id: "scorpio-death",
    sign: "Scorpio",
    title: "Death",
    atu: "XIII",
    image: "/images/death.png",
    element: "Water",
    modality: "Fixed",
    hebrewLetter: "נ (Nun)",
    treeOfLifePath: "6. Tiphareth - 7. Netzach"
  },
  {
    id: "sagittarius-art",
    sign: "Sagittarius",
    title: "Art",
    atu: "XIV",
    image: "/images/art.png",
    element: "Fire",
    modality: "Mutable",
    hebrewLetter: "ס (Samekh)",
    treeOfLifePath: "6. Tiphareth - 9. Yesod"
  },
  {
    id: "capricorn-devil",
    sign: "Capricorn",
    title: "The Devil",
    atu: "XV",
    image: "/images/the-devil.png",
    element: "Earth",
    modality: "Cardinal",
    hebrewLetter: "ע (Ayin)",
    treeOfLifePath: "6. Tiphareth - 8. Hod"
  },
  {
    id: "aquarius-star",
    sign: "Aquarius",
    title: "The Star",
    atu: "XVII",
    image: "/images/the-star.png",
    element: "Air",
    modality: "Fixed",
    hebrewLetter: "ה (Heh)",
    treeOfLifePath: "2. Chokmah - 6. Tiphareth"
  },
  {
    id: "pisces-moon",
    sign: "Pisces",
    title: "The Moon",
    atu: "XVIII",
    image: "/images/the-moon.png",
    element: "Water",
    modality: "Mutable",
    hebrewLetter: "ק (Qoph)",
    treeOfLifePath: "7. Netzach - 10. Malkuth"
  }
] as const;

const ZODIAC_RULER: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter"
};

const PLANET_FOCUS = [
  {
    id: "sun",
    planet: "☉ Sun",
    atu: "XIX",
    title: "The Sun",
    image: "/images/the-sun.png",
    governingSign: "Leo",
    dayOfWeek: "Sunday",
    metal: "Gold",
    hebrewLetter: "ר (Resh)",
    treeOfLifePath: "8. Hod - 6. Tiphareth"
  },
  {
    id: "moon",
    planet: "☾ Moon",
    atu: "II",
    title: "The High Priestess",
    image: "/images/the-priestess.png",
    governingSign: "Cancer",
    dayOfWeek: "Monday",
    metal: "Silver",
    hebrewLetter: "ג (Gimel)",
    treeOfLifePath: "1. Kether - 6. Tiphareth"
  },
  {
    id: "mercury",
    planet: "☿ Mercury",
    atu: "I",
    title: "The Magus",
    image: "/images/the-magus.png",
    governingSign: "Gemini / Virgo",
    dayOfWeek: "Wednesday",
    metal: "Quicksilver",
    hebrewLetter: "ב (Beth)",
    treeOfLifePath: "1. Kether - 3. Binah"
  },
  {
    id: "venus",
    planet: "♀ Venus",
    atu: "III",
    title: "The Empress",
    image: "/images/the-empress.png",
    governingSign: "Taurus / Libra",
    dayOfWeek: "Friday",
    metal: "Copper",
    hebrewLetter: "ד (Daleth)",
    treeOfLifePath: "2. Chokmah - 3. Binah"
  },
  {
    id: "mars",
    planet: "♂ Mars",
    atu: "XVI",
    title: "The Tower",
    image: "/images/the-tower.png",
    governingSign: "Aries / Scorpio",
    dayOfWeek: "Tuesday",
    metal: "Iron",
    hebrewLetter: "פ (Peh)",
    treeOfLifePath: "5. Geburah - 8. Hod"
  },
  {
    id: "jupiter",
    planet: "♃ Jupiter",
    atu: "X",
    title: "Fortune",
    image: "/images/fortune.png",
    governingSign: "Sagittarius / Pisces",
    dayOfWeek: "Thursday",
    metal: "Tin",
    hebrewLetter: "כ (Kaph)",
    treeOfLifePath: "4. Chesed - 7. Netzach"
  },
  {
    id: "saturn",
    planet: "♄ Saturn",
    atu: "XXI",
    title: "The Universe",
    image: "/images/the-universe.png",
    governingSign: "Capricorn / Aquarius",
    dayOfWeek: "Saturday",
    metal: "Lead",
    hebrewLetter: "ת (Tav)",
    treeOfLifePath: "9. Yesod - 10. Malkuth"
  },
  {
    id: "uranus",
    planet: "♅ Uranus",
    atu: "0",
    title: "The Fool",
    image: "/images/the-fool.png",
    governingSign: "Aquarius",
    dayOfWeek: "Saturday",
    metal: "Uranium",
    hebrewLetter: "א (Aleph)",
    treeOfLifePath: "1. Kether - 2. Chokmah"
  },
  {
    id: "neptune",
    planet: "♆ Neptune",
    atu: "XII",
    title: "The Hanged Man",
    image: "/images/the-hanged-man.png",
    governingSign: "Pisces",
    dayOfWeek: "Thursday",
    metal: "Neptunium",
    hebrewLetter: "מ (Mem)",
    treeOfLifePath: "3. Binah - 5. Geburah"
  },
  {
    id: "pluto",
    planet: "♇ Pluto",
    atu: "XX",
    title: "The Aeon",
    image: "/images/the-aeon.png",
    governingSign: "Scorpio",
    dayOfWeek: "Tuesday",
    metal: "Plutonium",
    hebrewLetter: "ש (Shin)",
    treeOfLifePath: "8. Hod - 10. Malkuth"
  }
] as const;

const COURT_SPAN_DATA = {
  "knight-wands": {
    sign: "Sagittarius",
    modality: "Mutable",
    ruler: "Sagittarius",
    span: "Scorpio 21° - Sagittarius 20°",
    dates: "Nov 13-Dec 12"
  },
  "knight-cups": {
    sign: "Pisces",
    modality: "Mutable",
    ruler: "Pisces",
    span: "Aquarius 21° - Pisces 20°",
    dates: "Feb 09-Mar 10"
  },
  "knight-swords": {
    sign: "Gemini",
    modality: "Mutable",
    ruler: "Gemini",
    span: "Taurus 21° - Gemini 20°",
    dates: "May 11-Jun 10"
  },
  "knight-disks": {
    sign: "Virgo",
    modality: "Mutable",
    ruler: "Virgo",
    span: "Leo 21° - Virgo 20°",
    dates: "Aug 12-Sep 22"
  },
  "queen-wands": {
    sign: "Aries",
    modality: "Cardinal",
    ruler: "Aries",
    span: "Pisces 21° - Aries 20°",
    dates: "Mar 11-Apr 20"
  },
  "queen-cups": {
    sign: "Cancer",
    modality: "Cardinal",
    ruler: "Cancer",
    span: "Gemini 21° - Cancer 20°",
    dates: "Jun 11-Jul 21"
  },
  "queen-swords": {
    sign: "Libra",
    modality: "Cardinal",
    ruler: "Libra",
    span: "Virgo 21° - Libra 20°",
    dates: "Sep 12-Oct 22"
  },
  "queen-disks": {
    sign: "Capricorn",
    modality: "Cardinal",
    ruler: "Capricorn",
    span: "Sagittarius 21° - Capricorn 20°",
    dates: "Dec 13-Jan 19"
  },
  "prince-wands": {
    sign: "Leo",
    modality: "Fixed",
    ruler: "Leo",
    span: "Cancer 21° - Leo 20°",
    dates: "Jul 22-Aug 11"
  },
  "prince-cups": {
    sign: "Scorpio",
    modality: "Fixed",
    ruler: "Scorpio",
    span: "Libra 21° - Scorpio 20°",
    dates: "Oct 23-Nov 12"
  },
  "prince-swords": {
    sign: "Aquarius",
    modality: "Fixed",
    ruler: "Aquarius",
    span: "Capricorn 21° - Aquarius 20°",
    dates: "Jan 20-Feb 08"
  },
  "prince-disks": {
    sign: "Taurus",
    modality: "Fixed",
    ruler: "Taurus",
    span: "Aries 21° - Taurus 20°",
    dates: "Apr 21-May 10"
  }
} as const;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const cards: ThothCardMeta[] = [];

(["wands", "cups", "swords", "disks"] as const).forEach((suitKey) => {
  const suit = SUIT_DATA[suitKey];

  cards.push({
    id: `ace-${suitKey}`,
    name: `Ace of ${suit.title}`,
    image: `/images/ace-of-${suitKey}.png`,
    suit: suit.title,
    rank: "Ace",
    number: 1,
    arcanaTitle: null,
    elementalAttribution: suit.element,
    layer: 1,
    sephirah: 1,
    hebrewLetter: null,
    treeOfLifePath: null,
    dayOfWeek: null,
    metal: null,
    astrology: {
      sign: null,
      element: suit.element,
      planet: null,
      governingSign: null,
      modality: null,
      planetRuler: null,
      decanRange: null,
      dates: null
    },
    logic: "Descending"
  });

  cards.push({
    id: `princess-${suitKey}`,
    name: `Princess of ${suit.title}`,
    image: `/images/princess-of-${suitKey}.png`,
    suit: suit.title,
    rank: "Princess",
    number: null,
    arcanaTitle: null,
    elementalAttribution: `Earth of ${suit.element}`,
    layer: 2,
    sephirah: 10,
    hebrewLetter: null,
    treeOfLifePath: null,
    dayOfWeek: null,
    metal: null,
    astrology: {
      sign: null,
      element: suit.element,
      planet: "Earth",
      governingSign: null,
      modality: null,
      planetRuler: null,
      decanRange: null,
      dates: null
    },
    logic: "Descending"
  });

  (["knight", "queen", "prince"] as const).forEach((rank) => {
    const sephirahByRank: Record<typeof rank, 2 | 3 | 6> = {
      knight: 2,
      queen: 3,
      prince: 6
    };
    const elementByRank: Record<typeof rank, string> = {
      knight: "Fire",
      queen: "Water",
      prince: "Air"
    };
    const courtKey = `${rank}-${suitKey}` as keyof typeof COURT_SPAN_DATA;
    const courtSpan = COURT_SPAN_DATA[courtKey];

    cards.push({
      id: `${rank}-${suitKey}`,
      name: `${capitalize(rank)} of ${suit.title}`,
      image: `/images/${rank}-of-${suitKey}.png`,
      suit: suit.title,
      rank: capitalize(rank),
      number: null,
      arcanaTitle: null,
      elementalAttribution: `${elementByRank[rank]} of ${suit.element}`,
      layer: 3,
      sephirah: sephirahByRank[rank],
      hebrewLetter: null,
      treeOfLifePath: null,
      dayOfWeek: null,
      metal: null,
      astrology: {
        sign: courtSpan.sign,
        element: suit.element,
        planet: null,
        governingSign: null,
        modality: courtSpan.modality,
        planetRuler: ZODIAC_RULER[courtSpan.ruler],
        decanRange: courtSpan.span,
        dates: courtSpan.dates
      },
      logic: "Descending"
    });
  });

  for (let number = 2; number <= 10; number += 1) {
    const decanIndex = number - 2;
    const sign = suit.signs[Math.floor(decanIndex / 3)] as keyof typeof SIGN_DECAN_DATA;
    const subDecan = decanIndex % 3;
    const rangeStart = subDecan * 10;
    const rangeEnd = rangeStart + 10;
    const signDecan = SIGN_DECAN_DATA[sign][subDecan];
    const modality =
      sign === "Aries" ||
      sign === "Cancer" ||
      sign === "Libra" ||
      sign === "Capricorn"
        ? "Cardinal"
        : sign === "Taurus" ||
            sign === "Leo" ||
            sign === "Scorpio" ||
            sign === "Aquarius"
          ? "Fixed"
          : "Mutable";

    cards.push({
      id: `${number}-${suitKey}`,
      name: `${number} of ${suit.title}`,
      image: `/images/${number}-of-${suitKey}.png`,
      suit: suit.title,
      rank: String(number),
      number,
      arcanaTitle: null,
      elementalAttribution: suit.element,
      layer: 5,
      sephirah: number as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      hebrewLetter: null,
      treeOfLifePath: null,
      dayOfWeek: null,
      metal: null,
      astrology: {
        sign,
        element: suit.element,
        planet: signDecan.planet,
        governingSign: null,
        modality,
        planetRuler: ZODIAC_RULER[sign],
        decanRange: `${rangeStart}°-${rangeEnd}°`,
        dates: signDecan.dates
      },
      logic: "Ascending"
    });
  }
});

ZODIAC_DESTINY.forEach((major) => {
  cards.push({
    id: major.id,
    name: `${major.sign} · ${major.atu} · ${major.title}`,
    image: major.image,
    suit: "Major Arcana (Zodiac)",
    rank: major.atu,
    number: null,
    arcanaTitle: major.title,
    elementalAttribution: null,
    layer: 4,
    sephirah: 6,
    hebrewLetter: major.hebrewLetter,
    treeOfLifePath: major.treeOfLifePath,
    dayOfWeek: null,
    metal: null,
    astrology: {
      sign: major.sign,
      element: major.element,
        planet: ZODIAC_RULER[major.sign],
      governingSign: null,
      modality: major.modality,
      planetRuler: ZODIAC_RULER[major.sign],
      decanRange: null,
      dates: null
    },
    logic: "Descending"
  });
});

PLANET_FOCUS.forEach((major) => {
  cards.push({
    id: major.id,
    name: `${major.planet} · ${major.atu} · ${major.title}`,
    image: major.image,
    suit: "Major Arcana (Planetary)",
    rank: major.atu,
    number: null,
    arcanaTitle: major.title,
    elementalAttribution: null,
    layer: 6,
    sephirah: 10,
    hebrewLetter: major.hebrewLetter,
    treeOfLifePath: major.treeOfLifePath,
    dayOfWeek: major.dayOfWeek,
    metal: major.metal,
    astrology: {
      sign: null,
      element: null,
      planet: major.planet,
      governingSign: major.governingSign,
      modality: null,
      planetRuler: major.planet,
      decanRange: null,
      dates: null
    },
    logic: "Ascending"
  });
});

export const ALL_CARDS: ThothCardMeta[] = cards;
export const CARD_INDEX: Record<string, ThothCardMeta> = Object.fromEntries(cards.map((card) => [card.id, card]));
