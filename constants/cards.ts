export type LogicMode = "Descending" | "Ascending";

export type AstrologyMeta = {
  sign: string | null;
  element: string | null;
  planet: string | null;
  /** Minor arcana: planet of the card number (Book of Thoth). Non-planets like Zodiac/Earth are null. */
  numberPlanet: string | null;
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
  /** Ecliptic representative angle (0–360°). Null for planetary majors (no fixed zodiac longitude). */
  midAngle: number | null;
  hebrewLetter: string | null;
  treeOfLifePath: string | null;
  dayOfWeek: string | null;
  metal: string | null;
  astrology: AstrologyMeta;
  logic: LogicMode;
};

/** Canonical ecliptic midpoints — must match ATHANOR reference data. */
const MID_ANGLE_BY_ID: Record<string, number> = {
  "2-wands": 5,
  "3-wands": 15,
  "4-wands": 25,
  "5-disks": 35,
  "6-disks": 45,
  "7-disks": 55,
  "8-swords": 65,
  "9-swords": 75,
  "10-swords": 85,
  "2-cups": 95,
  "3-cups": 105,
  "4-cups": 115,
  "5-wands": 125,
  "6-wands": 135,
  "7-wands": 145,
  "8-disks": 155,
  "9-disks": 165,
  "10-disks": 175,
  "2-swords": 185,
  "3-swords": 195,
  "4-swords": 205,
  "5-cups": 215,
  "6-cups": 225,
  "7-cups": 235,
  "8-wands": 245,
  "9-wands": 255,
  "10-wands": 265,
  "2-disks": 275,
  "3-disks": 285,
  "4-disks": 295,
  "5-swords": 305,
  "6-swords": 315,
  "7-swords": 325,
  "8-cups": 335,
  "9-cups": 345,
  "10-cups": 355,
  "aries-emperor": 15,
  "taurus-hierophant": 45,
  "gemini-lovers": 75,
  "cancer-chariot": 105,
  "leo-lust": 135,
  "virgo-hermit": 165,
  "libra-adjustment": 195,
  "scorpio-death": 225,
  "sagittarius-art": 255,
  "capricorn-devil": 285,
  "aquarius-star": 315,
  "pisces-moon": 345,
  "queen-wands": 5,
  "prince-disks": 35,
  "knight-swords": 65,
  "queen-cups": 95,
  "prince-wands": 125,
  "knight-disks": 155,
  "queen-swords": 185,
  "prince-cups": 215,
  "knight-wands": 245,
  "queen-disks": 275,
  "prince-swords": 305,
  "knight-cups": 335,
  "princess-disks": 45,
  "princess-wands": 135,
  "princess-cups": 225,
  "princess-swords": 315,
  "ace-wands": 45,
  "ace-cups": 135,
  "ace-disks": 225,
  "ace-swords": 315
};

const PLANETARY_MAJOR_IDS = new Set([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto"
]);

/** Book of Thoth number-planet attributions for minor arcana (non-planet values omitted). */
const NUMBER_PLANET_BY_ID: Record<string, string> = {
  "3-wands": "Saturn",
  "4-wands": "Jupiter",
  "5-disks": "Mars",
  "6-disks": "Sun",
  "7-disks": "Venus",
  "8-swords": "Mercury",
  "9-swords": "Moon",
  "10-swords": "Earth",
  "3-cups": "Saturn",
  "4-cups": "Jupiter",
  "5-wands": "Mars",
  "6-wands": "Sun",
  "7-wands": "Venus",
  "8-disks": "Mercury",
  "9-disks": "Moon",
  "10-disks": "Earth",
  "3-swords": "Saturn",
  "4-swords": "Jupiter",
  "5-cups": "Mars",
  "6-cups": "Sun",
  "7-cups": "Venus",
  "8-wands": "Mercury",
  "9-wands": "Moon",
  "10-wands": "Earth",
  "3-disks": "Saturn",
  "4-disks": "Jupiter",
  "5-swords": "Mars",
  "6-swords": "Sun",
  "7-swords": "Venus",
  "8-cups": "Mercury",
  "9-cups": "Moon",
  "10-cups": "Earth"
};

function midAngleFor(id: string): number | null {
  if (PLANETARY_MAJOR_IDS.has(id)) return null;
  return MID_ANGLE_BY_ID[id] ?? null;
}

function numberPlanetForMinorId(id: string): string | null {
  const raw = NUMBER_PLANET_BY_ID[id];
  if (!raw || raw === "Zodiac" || raw === "Earth") return null;
  return raw;
}

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

/** The twelve zodiac major arcana; each one’s Hebrew path follows Thoth. AL II:76: Tzaddi is not the Star. */
const ZODIAC_DESTINY = [
  {
    id: "aries-emperor",
    sign: "Aries",
    title: "The Emperor",
    atu: "IV",
    image: "/images/the-emperor.png",
    element: "Fire",
    modality: "Cardinal",
    /** Tzaddi → Emperor (Liber AL; 777 path 28, 7–9). */
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
    /** Heh → The Star; Tzaddi is the Emperor (Liber AL). Path 15, 2–6. */
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
  Scorpio: "Pluto",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Uranus",
  Pisces: "Neptune"
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
    treeOfLifePath: "8. Hod - 9. Yesod"
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
    treeOfLifePath: "7. Netzach - 8. Hod"
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
    treeOfLifePath: "5. Geburah - 8. Hod"
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

// 3母字の大アルカナは惑星帰属だが、母字由来の元素を持つ(Aleph=Air, Mem=Water, Shin=Fire)。
// 元素センサスに正しく数えさせるため element を補う。他の惑星 major は元素を持たない。
const MOTHER_LETTER_ELEMENT: Record<string, string> = {
  uranus: "Air",
  neptune: "Water",
  pluto: "Fire"
};

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
    midAngle: midAngleFor(`ace-${suitKey}`),
    hebrewLetter: null,
    treeOfLifePath: null,
    dayOfWeek: null,
    metal: null,
    astrology: {
      sign: null,
      element: suit.element,
      planet: null,
      numberPlanet: null,
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
    midAngle: midAngleFor(`princess-${suitKey}`),
    hebrewLetter: null,
    treeOfLifePath: null,
    dayOfWeek: null,
    metal: null,
    astrology: {
      sign: null,
      element: suit.element,
      planet: "Earth",
      numberPlanet: null,
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
      midAngle: midAngleFor(`${rank}-${suitKey}`),
      hebrewLetter: null,
      treeOfLifePath: null,
      dayOfWeek: null,
      metal: null,
      astrology: {
        sign: courtSpan.sign,
        element: suit.element,
        planet: null,
        numberPlanet: null,
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

    const minorId = `${number}-${suitKey}`;
    cards.push({
      id: minorId,
      name: `${number} of ${suit.title}`,
      image: `/images/${number}-of-${suitKey}.png`,
      suit: suit.title,
      rank: String(number),
      number,
      arcanaTitle: null,
      elementalAttribution: suit.element,
      layer: 5,
      sephirah: number as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      midAngle: midAngleFor(minorId),
      hebrewLetter: null,
      treeOfLifePath: null,
      dayOfWeek: null,
      metal: null,
      astrology: {
        sign,
        element: suit.element,
        planet: signDecan.planet,
        numberPlanet: numberPlanetForMinorId(minorId),
        governingSign: null,
        modality,
        planetRuler: signDecan.planet,
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
    midAngle: midAngleFor(major.id),
    hebrewLetter: major.hebrewLetter,
    treeOfLifePath: major.treeOfLifePath,
    dayOfWeek: null,
    metal: null,
    astrology: {
      sign: major.sign,
      element: major.element,
      planet: ZODIAC_RULER[major.sign],
      numberPlanet: null,
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
    midAngle: midAngleFor(major.id),
    hebrewLetter: major.hebrewLetter,
    treeOfLifePath: major.treeOfLifePath,
    dayOfWeek: major.dayOfWeek,
    metal: major.metal,
    astrology: {
      sign: null,
      element: MOTHER_LETTER_ELEMENT[major.id] ?? null,
      planet: major.planet,
      numberPlanet: null,
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
