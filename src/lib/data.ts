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
    credentials: "DO · MSCP",
    practice: "Practice site",
    photo: "/assets/dr-leff.png",
    bio:
      "Founded the collaborative in 2026 to give southeast Michigan a peer venue " +
      "for the questions that don't fit cleanly into a 20-minute visit. Practices " +
      "midlife and reproductive health; certified by the Menopause Society.",
  },
  {
    role: "Vice President",
    name: "Dr. Amy Heeringa",
    credentials: "MD",
    practice: "Practice site",
    photo: "/assets/dr-heeringa.png",
    bio:
      "Partners with the President on programming, helps shape each meeting's " +
      "topic and case selection, and stands in for the chair when needed.",
  },
];

export type FoundingMember = {
  name: string;
  url: string;
};

export const FOUNDING_MEMBERS: FoundingMember[] = [
  { name: "Mary Cornelius",  url: "https://www.dmc.org/provider/1730190679" },
  { name: "Leanne Roberts",  url: "https://www.henryford.com/physician-directory/r/roberts-leanne" },
  { name: "Karen Berris",    url: "https://www.endocrinemds.com/karen-berris-m-d/" },
  { name: "Sindhu Koshy",    url: "https://www.cardiovascularconsultantspc.com/medical-team/sindhu-koshy-m-d-f-c-c/" },
];

export type Member = {
  name: string;
  credentials: string;
  specialty: string;
  location: string;
  practice: string;
};

export const MEMBERS: Member[] = [
  { name: "Dr. A. Whitfield",   credentials: "MD · MSCP",   specialty: "Obstetrics & Gynecology",  location: "Birmingham",       practice: "whitfieldwomen.com" },
  { name: "Dr. R. Nair",        credentials: "MD · FACE",   specialty: "Endocrinology",            location: "Royal Oak",        practice: "nair-endo.com" },
  { name: "Dr. M. Castellanos", credentials: "MD · MPH",    specialty: "Family Medicine",          location: "Ann Arbor",        practice: "castellanosmd.com" },
  { name: "Dr. E. Park",        credentials: "MD · MSCP",   specialty: "Internal Medicine",        location: "Bloomfield Hills", practice: "park-internal.com" },
  { name: "Dr. L. Brennan",     credentials: "DO · IFMCP",  specialty: "Integrative Medicine",     location: "Northville",       practice: "brennan-integrative.com" },
  { name: "Dr. K. Ojo",         credentials: "MD · FACS",   specialty: "Breast Surgery",           location: "Detroit",          practice: "ojobreastcare.com" },
  { name: "Dr. S. Hartwell",    credentials: "MD",          specialty: "Psychiatry",               location: "Grosse Pointe",    practice: "hartwellpsych.com" },
  { name: "Dr. J. Mahmoud",     credentials: "MD · MSCP",   specialty: "Urogynecology",            location: "Troy",             practice: "mahmoudwomenshealth.com" },
  { name: "Dr. P. Iverson",     credentials: "DPT · WHC",   specialty: "Pelvic-floor PT",          location: "Ferndale",         practice: "iversonpelvic.com" },
  { name: "Dr. T. Greco",       credentials: "MD · FACC",   specialty: "Preventive Cardiology",    location: "Royal Oak",        practice: "grecocardio.com" },
  { name: "Dr. N. Kowalski",    credentials: "MD · FAAD",   specialty: "Dermatology",              location: "Birmingham",       practice: "kowalskidermatology.com" },
  { name: "Dr. R. Albright",    credentials: "MD",          specialty: "Sleep Medicine",           location: "Beverly Hills",    practice: "albrightsleep.com" },
  { name: "Dr. D. Marwick",     credentials: "RDN · CDCES", specialty: "Nutrition & Metabolism",   location: "Bloomfield",       practice: "marwicknutrition.com" },
  { name: "Dr. C. Achebe",      credentials: "MD · MSCP",   specialty: "Gynecologic Oncology",     location: "Detroit",          practice: "achebegynonc.com" },
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
    type: "Meeting notes",
    title: "Summer 2026 meeting — case discussion summary",
    citation: "July 21, 2026 · Danialle's Clubhouse, Birmingham",
    status: "current",
  },
  {
    quarter: "Spring 2026",
    type: "Meeting notes",
    title: "Spring 2026 founding meeting — discussion summary",
    citation: "April 8, 2026 · Birmingham, MI",
    status: "archive",
  },
];

export const QUARTERLY_CADENCE = [
  { season: "Spring", month: "April", note: "Founding-anniversary meeting", aside: "Annual programming reset" },
  { season: "Summer", month: "July",  note: "Pre-conference primer",        aside: "Reading list for the Society conference" },
  { season: "Fall",   month: "Sept",  note: "Pre-Menopause Society",        aside: "Aligned with the annual conference" },
  { season: "Winter", month: "Jan",   note: "Practice-of-the-year review",  aside: "Cases that defined the year" },
];

export const CONTACT_EMAIL = "drleff@drcarrieleff.com";
export const SITE_URL = "michiganmenopause.com";
export const SITE_ORIGIN = "https://michiganmenopause.com";
