/* ============================================================
   Shared content data — ported from design_handoff_mmc/website/data.jsx
   ============================================================ */

export type Meeting = {
  id: string;
  quarter: string;
  weekday: string;
  month: string;
  day: string;
  year: string;
  time: string;
  location: string;
  locationShort: string;
  article: string;
  articleCitation: string;
  rsvpOpen?: boolean;
};

export const NEXT_MEETING: Meeting = {
  id: "summer-2026",
  quarter: "Summer 2026",
  weekday: "Tuesday",
  month: "July",
  day: "21",
  year: "2026",
  time: "6:30 — 8:00 PM",
  location: "Danialle's Clubhouse\n235 Pierce Street, Birmingham, MI",
  locationShort: "Danialle's Clubhouse · Birmingham",
  article:
    "Long-term cardiovascular outcomes of menopausal hormone therapy in women under 60",
  articleCitation: "NEJM, March 2026 · 14 pp",
  rsvpOpen: true,
};

export const UPCOMING_MEETINGS: Meeting[] = [
  NEXT_MEETING,
  {
    id: "fall-2026",
    quarter: "Fall 2026",
    weekday: "Date TBD",
    month: "Sept",
    day: "—",
    year: "2026",
    time: "Evening",
    location: "TBD · pre-Menopause Society conference",
    locationShort: "Aligned with the Menopause Society annual conference",
    article: "Topic in development",
    articleCitation: "Watch this space",
    rsvpOpen: false,
  },
  {
    id: "winter-2027",
    quarter: "Winter 2027",
    weekday: "TBD",
    month: "Jan",
    day: "—",
    year: "2027",
    time: "6:30 — 8:00 PM",
    location: "TBD",
    locationShort: "Member host · location TBD",
    article:
      "Cognitive symptoms in perimenopause: distinguishing transition from pathology",
    articleCitation: "Working title · article TBD",
    rsvpOpen: false,
  },
];

export const PAST_MEETINGS: Meeting[] = [
  {
    id: "spring-2026",
    quarter: "Spring 2026",
    weekday: "Tuesday",
    month: "Apr",
    day: "08",
    year: "2026",
    time: "6:30 — 8:00 PM",
    location: "Founding meeting · Birmingham, MI",
    locationShort: "Founding meeting · Birmingham, MI",
    article:
      "Establishing the collaborative — scope, cadence and shared standards of care",
    articleCitation: "Inaugural session",
  },
];

export const RSVP_MEETING_OPTIONS = UPCOMING_MEETINGS.map((m) => ({
  id: m.id,
  label: `${m.quarter} — ${m.month} ${m.day}${m.year ? `, ${m.year}` : ""}`,
}));

export type Person = {
  role: string;
  name: string;
  credentials: string;
  practice: string;
  bio: string;
  photo?: string;
};

export const LEADERSHIP: Person[] = [
  {
    role: "President",
    name: "Dr. Carrie Leff",
    credentials: "DO · NCMP",
    practice: "Practice site",
    photo: "/assets/dr-leff.png",
    bio:
      "Founded the collaborative in 2026 to give southeast Michigan a peer venue " +
      "for the questions that don't fit cleanly into a 20-minute visit. Practices " +
      "midlife and reproductive health; certified by the Menopause Society.",
  },
  {
    role: "Vice President",
    name: "Name TBD",
    credentials: "MD · TBD",
    practice: "Practice site",
    bio:
      "The Vice President partners with the President on programming, helps shape " +
      "each meeting's article selection, and stands in for the chair when needed.",
  },
  {
    role: "Secretary",
    name: "Name TBD",
    credentials: "MD · TBD",
    practice: "Practice site",
    bio:
      "The Secretary keeps the member roll, records each meeting's discussion, " +
      "and stewards the resources archive between quarterly gatherings.",
  },
];

export type Member = {
  name: string;
  credentials: string;
  specialty: string;
  location: string;
  practice: string;
};

export const MEMBERS: Member[] = [
  { name: "Dr. A. Whitfield",   credentials: "MD · NCMP",   specialty: "Obstetrics & Gynecology",  location: "Birmingham",       practice: "whitfieldwomen.com" },
  { name: "Dr. R. Nair",        credentials: "MD · FACE",   specialty: "Endocrinology",            location: "Royal Oak",        practice: "nair-endo.com" },
  { name: "Dr. M. Castellanos", credentials: "MD · MPH",    specialty: "Family Medicine",          location: "Ann Arbor",        practice: "castellanosmd.com" },
  { name: "Dr. E. Park",        credentials: "MD · NCMP",   specialty: "Internal Medicine",        location: "Bloomfield Hills", practice: "park-internal.com" },
  { name: "Dr. L. Brennan",     credentials: "DO · IFMCP",  specialty: "Integrative Medicine",     location: "Northville",       practice: "brennan-integrative.com" },
  { name: "Dr. K. Ojo",         credentials: "MD · FACS",   specialty: "Breast Surgery",           location: "Detroit",          practice: "ojobreastcare.com" },
  { name: "Dr. S. Hartwell",    credentials: "MD",          specialty: "Psychiatry",               location: "Grosse Pointe",    practice: "hartwellpsych.com" },
  { name: "Dr. J. Mahmoud",     credentials: "MD · NCMP",   specialty: "Urogynecology",            location: "Troy",             practice: "mahmoudwomenshealth.com" },
  { name: "Dr. P. Iverson",     credentials: "DPT · WHC",   specialty: "Pelvic-floor PT",          location: "Ferndale",         practice: "iversonpelvic.com" },
  { name: "Dr. T. Greco",       credentials: "MD · FACC",   specialty: "Preventive Cardiology",    location: "Royal Oak",        practice: "grecocardio.com" },
  { name: "Dr. N. Kowalski",    credentials: "MD · FAAD",   specialty: "Dermatology",              location: "Birmingham",       practice: "kowalskidermatology.com" },
  { name: "Dr. R. Albright",    credentials: "MD",          specialty: "Sleep Medicine",           location: "Beverly Hills",    practice: "albrightsleep.com" },
  { name: "Dr. D. Marwick",     credentials: "RDN · CDCES", specialty: "Nutrition & Metabolism",   location: "Bloomfield",       practice: "marwicknutrition.com" },
  { name: "Dr. C. Achebe",      credentials: "MD · NCMP",   specialty: "Gynecologic Oncology",     location: "Detroit",          practice: "achebegynonc.com" },
];

export const SPECIALTIES = [
  "All specialties",
  "Obstetrics & Gynecology",
  "Endocrinology",
  "Family Medicine",
  "Internal Medicine",
  "Integrative Medicine",
  "Breast Surgery",
  "Psychiatry",
  "Urogynecology",
  "Pelvic-floor PT",
  "Preventive Cardiology",
  "Dermatology",
  "Sleep Medicine",
  "Nutrition & Metabolism",
  "Gynecologic Oncology",
];

export type Resource = {
  quarter: string;
  type: string;
  title: string;
  citation: string;
  status: "current" | "archive";
};

export const RESOURCES: Resource[] = [
  {
    quarter: "Summer 2026",
    type: "Article of the month",
    title:
      "Long-term cardiovascular outcomes of menopausal hormone therapy in women under 60",
    citation: "NEJM, March 2026 · 14 pp",
    status: "current",
  },
  {
    quarter: "Spring 2026",
    type: "Article of the month",
    title: "Reframing the timing hypothesis: a fifteen-year follow-up",
    citation: "JAMA Internal Medicine, January 2026 · 9 pp",
    status: "archive",
  },
  {
    quarter: "Spring 2026",
    type: "Case study",
    title:
      "Refractory vasomotor symptoms in a patient with a prior thromboembolic event",
    citation: "Presented by member · 6 pp summary",
    status: "archive",
  },
];

export const QUARTERLY_CADENCE = [
  { season: "Spring", month: "April", note: "Founding-anniversary meeting", aside: "Annual programming reset" },
  { season: "Summer", month: "July",  note: "Pre-conference primer",        aside: "Reading list for the Society conference" },
  { season: "Fall",   month: "Sept",  note: "Pre-Menopause Society",        aside: "Aligned with the annual conference" },
  { season: "Winter", month: "Jan",   note: "Practice-of-the-year review",  aside: "Cases that defined the year" },
];

export const CONTACT_EMAIL = "hello@michiganmenopause.com";
export const SITE_URL = "michiganmenopause.com";
export const SITE_ORIGIN = "https://michiganmenopause.com";
