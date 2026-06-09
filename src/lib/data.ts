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
  showKarmanos?: boolean;
  // Topic & article
  topic?: string;
  topicPresenter?: string;
  speakerPhoto?: string;
  articleTitle?: string;
  articleUrl?: string;
  articleThumb?: string;
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
  topic: "Gastrointestinal disorders in midlife women",
  topicPresenter: "Dr. Eva Alsheik",
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
  link?: { label: string; url: string };
};

export const LEADERSHIP: Person[] = [
  {
    role: "President",
    name: "Dr. Carrie Leff",
    credentials: "DO · MSCP",
    practice: "Practice site",
    photo: "/assets/dr-leff.png",
    link: { label: "DrCarrieLeff.com", url: "https://drcarrieleff.com" },
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
    link: { label: "Oakland Macomb OB/GYN", url: "https://www.oaklandmacombobgyn.com/provider/amy-heeringa-m-d" },
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
  { name: "Dr. Mary Cornelius",  url: "https://www.dmc.org/provider/1730190679" },
  { name: "Dr. Leanne Roberts",  url: "https://www.henryford.com/physician-directory/r/roberts-leanne" },
  { name: "Dr. Karen Berris",    url: "https://www.endocrinemds.com/karen-berris-m-d/" },
  { name: "Dr. Sindhu Koshy",    url: "https://www.cardiovascularconsultantspc.com/medical-team/sindhu-koshy-m-d-f-c-c/" },
  { name: "Dr. Lisa Chism",      url: "https://www.oaklandmacombobgyn.com/provider/lisa-chism-dnp-aprn-bc-csc-ncmp-faanp" },
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
  url?: string;
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

export type SiteContent = {
  // Home
  home_hero_eyebrow: string;
  home_hero_lede: string;
  home_hero_tagline: string;
  home_mission_lede: string;
  home_membership_text: string;
  // Meetings
  meetings_header_lede: string;
  meetings_past_note: string;
  // Cadence
  cadence_spring_note: string;
  cadence_spring_aside: string;
  cadence_summer_note: string;
  cadence_summer_aside: string;
  cadence_fall_note: string;
  cadence_fall_aside: string;
  cadence_winter_note: string;
  cadence_winter_aside: string;
  // Resources
  resources_header_lede: string;
  // Members
  members_header_lede: string;
  members_optin_note: string;
  // Leadership
  leadership_header_lede: string;
  leadership_governance: string;
  leadership_cta_label: string;
  leadership_cta_url: string;
  // Submit a Case
  submit_header_lede: string;
  submit_what_to_include: string;
  submit_what_happens_next: string;
  submit_membership_reminder: string;
};

export const DEFAULT_CONTENT: SiteContent = {
  home_hero_eyebrow: 'Est. 2026 · Southeast Michigan · A peer society',
  home_hero_lede: 'The Michigan Menopause Collaborative is a multidisciplinary network for clinicians caring for women in midlife. Four meetings a year. One focused topic. One article. A real case discussion. A collaborative space to learn, connect, and strengthen the care of our patients.',
  home_hero_tagline: 'Midlife women\'s care, improved together.',
  home_mission_lede: 'A multidisciplinary community of clinicians dedicated to improving care for women in midlife. Meeting in person four times a year for focused discussion, networking, and collaborative case-based learning.',
  home_membership_text: 'Open to licensed medical practitioners caring for midlife women in southeast Michigan. No fees while we operate informally; 501(c)(3) status is in development.',
  meetings_header_lede: 'We meet in person across the four seasons — fall, winter, spring, summer. Each meeting orbits a member-submitted case. Two hours. No vendors. Off the record.',
  meetings_past_note: 'Members may request notes from past meetings via the Resources page.',
  cadence_spring_note: 'Founding-anniversary meeting',
  cadence_spring_aside: 'Annual programming reset',
  cadence_summer_note: 'Pre-conference primer',
  cadence_summer_aside: 'Reading list for the Society conference',
  cadence_fall_note: 'Pre-Menopause Society',
  cadence_fall_aside: 'Aligned with the annual conference',
  cadence_winter_note: 'Practice-of-the-year review',
  cadence_winter_aside: 'Cases that defined the year',
  resources_header_lede: 'Clinical references, meeting notes, and shared documents for collaborative members. Materials are posted here after each meeting.',
  members_header_lede: 'A multidisciplinary list of members who have opted to be publicly visible. Inclusion is not a referral or endorsement — it is a statement that this physician shares our standard of care.',
  members_optin_note: 'Membership in the collaborative is open to licensed medical practitioners. Inclusion in this public directory is at each member\'s discretion — some members participate without listing publicly.',
  leadership_header_lede: 'An informal board oversees programming, member admissions, and the planned transition to 501(c)(3) status. Additional officers join as the collaborative grows.',
  leadership_governance: 'The collaborative operates informally in 2026. As we transition to 501(c)(3) status, the board will expand to include a treasurer and two at-large director seats elected by the membership. Interested in standing?',
  leadership_cta_label: 'Reach out to Dr. Leff',
  leadership_cta_url: `mailto:${CONTACT_EMAIL}`,
  submit_header_lede: 'Submit a de-identified case for consideration at an upcoming meeting. Selected cases are presented by the submitter — typically 10 minutes, followed by group discussion.',
  submit_what_to_include: 'The clinical question that keeps the case interesting\nA high-level history — no PHI, no chart screenshots\nWhat has and hasn\'t worked so far\nWhere the literature has felt thin or contradictory',
  submit_what_happens_next: 'Dr. Leff and the board review submissions quarterly.\nSelected submitters present their case in person — 10 minutes.\nThe room discusses for 30 minutes; a written summary is archived.',
  submit_membership_reminder: 'Case submission is open to all licensed medical practitioners — you do not need to be a current member to submit, but presenters are typically members or invited guests.',
};
