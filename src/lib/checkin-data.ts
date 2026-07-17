// Check-in / RSVP roster for the physical meeting check-in table.
// Fully separate from the public Members directory (src/lib/data.ts) — this is
// Dr. Leff's private working roster (email/phone/notes) for running check-in at
// the door, keyed by the real Meeting.id values from getMeetings().

export type RsvpValue = true | false | 'maybe';
export type CheckinStatus = 'in' | 'noshow';

export type CheckinMember = {
  id: string;
  prefix: string;
  first: string;
  last: string;
  cred: string;
  mscp: string;
  ptype: string;
  spec: string;
  practice: string;
  email: string;
  phone: string;
  notes: string;
  consent: string;
  photo?: string;
  seasons: Record<string, CheckinStatus>;
  rsvp: Record<string, RsvpValue>;
  edited: boolean;
};

export const CHECKIN_SEED: CheckinMember[] = [
  {
    "prefix": "Dr.",
    "first": "Anastasia",
    "last": "Arab",
    "cred": "DO MSCP",
    "mscp": "Certified",
    "ptype": "Physician",
    "spec": "OB/GYN",
    "practice": "Henry Ford West Bloomfield",
    "email": "dr.anastasia.arab@icloud.com",
    "phone": "(313) 623-5039",
    "seasons": {},
    "id": "m0",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Guest: Dr. Jennifer Burgess",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Jamie",
    "last": "Baines",
    "cred": "DO",
    "mscp": "",
    "ptype": "",
    "spec": "Family Med",
    "practice": "Kite Dream Care",
    "email": "hello@kitedreamcare.com",
    "phone": "(248) 981-3399",
    "seasons": {},
    "id": "m1",
    "rsvp": {
      "summer-2026": "maybe"
    },
    "notes": "RSVP'd maybe — not confirmed yet. Not MSCP certified but sees a lot of menopause patients. Expects Alissa Citron to attend.",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Michelle",
    "last": "Belke",
    "cred": "LMSW, CST",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Michelle Belke, LMSW, LLC",
    "email": "belketherapy@gmail.com",
    "phone": "(248) 872-1781",
    "seasons": {},
    "id": "m2",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Karen",
    "last": "Berris",
    "cred": "MD MSCP",
    "mscp": "",
    "ptype": "",
    "spec": "Endocrine",
    "practice": "Associated Endocrinologists",
    "email": "kkoenig1975@gmail.com",
    "phone": "(248) 563-3918",
    "seasons": {
      "spring-2026": "in"
    },
    "id": "m3",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Guest: Dr. Laura Gruskin, MD (Dr. Kristen Wuckert was invited but later cancelled)",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Julie",
    "last": "Braciszewksi",
    "cred": "PhD, LP",
    "mscp": "",
    "ptype": "",
    "spec": "PhD Therapist",
    "practice": "Monarch Behavioral Health",
    "email": "drb@mbh-mi.com",
    "phone": "(248) 250-3606",
    "seasons": {},
    "id": "m4",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "May bring CBT/somatic-therapy colleagues — TBD",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Amy",
    "last": "Brode",
    "cred": "DO, FACOS",
    "mscp": "",
    "ptype": "",
    "spec": "Urology",
    "practice": "The Balance Point: Inclusive Wellness",
    "email": "DrAmy@TheBalancePointWellness.com",
    "phone": "(248) 212-4041",
    "seasons": {},
    "id": "m5",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Deborah",
    "last": "Charfoos",
    "cred": "MD",
    "mscp": "",
    "ptype": "Physician",
    "spec": "OB/GYN",
    "practice": "Retired OB/GYN",
    "email": "dcharfoos@gmail.com",
    "phone": "(248) 408-5058",
    "seasons": {},
    "id": "m6",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Lisa",
    "last": "Chism",
    "cred": "DNP APRN BC MSCP CSC CBCN ASBrS APP-C, TICP, FAAN, FAANP",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Oakland Macomb OB GYN",
    "email": "lchism@oamaobgyn.com",
    "phone": "(734) 323-0443",
    "seasons": {},
    "id": "m7",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Alissa",
    "last": "Citron",
    "cred": "DO MPH",
    "mscp": "Certified",
    "ptype": "Physician",
    "spec": "Family Med",
    "practice": "Kite Dream Care",
    "email": "Dr.Citron@kitedreamcare.com",
    "phone": "(248) 736-6578",
    "seasons": {},
    "id": "m8",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Dietary: vegetarian/fish",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Julie",
    "last": "Feldman",
    "cred": "MPH RDN",
    "mscp": "",
    "ptype": "Nutritionist",
    "spec": "Nutrition",
    "practice": "Thrive Nutrition and Wellness LLc",
    "email": "julie@thrivenutritioncounseling.com",
    "phone": "(248) 464-0076",
    "seasons": {},
    "id": "m9",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Angela",
    "last": "Fleming",
    "cred": "DO",
    "mscp": "",
    "ptype": "Physician",
    "spec": "",
    "practice": "Corewell Health OB GYN Novi",
    "email": "angela.fleming@corewellhealth.org",
    "phone": "(248) 321-2465",
    "seasons": {},
    "id": "m10",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Tricia",
    "last": "Goymerac",
    "cred": "DO",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Oakland Macomb OB GYN",
    "email": "triciagoymerac@gmail.com",
    "phone": "(248) 930-8146",
    "seasons": {},
    "id": "m11",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Amy",
    "last": "Heeringa",
    "cred": "MD",
    "mscp": "Certified",
    "ptype": "Physician",
    "spec": "OB/GYN",
    "practice": "Oakland Macomb OB/Gyn",
    "email": "amyheeringamd@gmail.com",
    "phone": "(248) 495-3853",
    "seasons": {
      "spring-2026": "in"
    },
    "id": "m12",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Guest: Dr. Jennifer Peng",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Sonali",
    "last": "Hemachandra",
    "cred": "MD",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Sonali Hemachandra, MD/ Obesity Medicine",
    "email": "hello@mdhealthstylecoaching.com",
    "phone": "(973) 592-7449",
    "seasons": {},
    "id": "m13",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Jenny",
    "last": "Jeshurun",
    "cred": "PT, DPT",
    "mscp": "",
    "ptype": "",
    "spec": "PT",
    "practice": "The Nest Wellness Collective",
    "email": "dr.jenny@thenestwellnessco.com",
    "phone": "(248) 763-3653",
    "seasons": {},
    "id": "m14",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Bridget",
    "last": "Kane",
    "cred": "LMSW",
    "mscp": "",
    "ptype": "Physical Therapist",
    "spec": "PT",
    "practice": "Resilient Root Physical Therapy",
    "email": "bridget@resilientrootphysicaltherapy.com",
    "phone": "7342243874",
    "seasons": {},
    "id": "m15",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Brandy",
    "last": "Kennedy",
    "cred": "CNM",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Oakland Macomb OBGYN",
    "email": "brandyb715@gmail.com",
    "phone": "(586) 295-3807",
    "seasons": {},
    "id": "m16",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Laurie",
    "last": "Kohen",
    "cred": "DO, MPH, MSCP",
    "mscp": "Certified",
    "ptype": "Physician",
    "spec": "Derm",
    "practice": "Henry Ford Detroit",
    "email": "lkohen1@hfhs.org",
    "phone": "(313) 916-2151",
    "seasons": {},
    "id": "m17",
    "rsvp": {},
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Carrie",
    "last": "Leff",
    "cred": "DO",
    "mscp": "Certified",
    "ptype": "Physician",
    "spec": "Internal Medicine",
    "practice": "Dr Carrie leff",
    "email": "doccarrie@me.com",
    "phone": "(248) 766-5583",
    "seasons": {
      "spring-2026": "in"
    },
    "id": "m18",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "DR.",
    "first": "Amy",
    "last": "Loree",
    "cred": "PhD, LP, PMH-C",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Monarch Behavioral Health",
    "email": "DrAmyLoree@mbh-mi.com",
    "phone": "",
    "seasons": {},
    "id": "m19",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Dietary: vegetarian",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Lara",
    "last": "Miller",
    "cred": "",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "",
    "email": "khouryla@gmail.com",
    "phone": "(248) 470-7770",
    "seasons": {},
    "id": "m20",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Bringing 1 guest (name not provided)",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Megan",
    "last": "Nelson",
    "cred": "CNM",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Oakland macomb OBGYN",
    "email": "nelsonmeg77@gmail.com",
    "phone": "(586) 713-9060",
    "seasons": {},
    "id": "m21",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Colleen",
    "last": "Newlin",
    "cred": "NP-C, CNM",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Corewell OBGYN Clarkston",
    "email": "colleendean@gmail.com",
    "phone": "(810) 986-7272",
    "seasons": {},
    "id": "m22",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Sarah",
    "last": "Newman",
    "cred": "FNP-BC",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Integrative primary care",
    "email": "sdufoor@gmail.com",
    "phone": "(586) 337-4168",
    "seasons": {},
    "id": "m23",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Dietary: no pork",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Rachel",
    "last": "O’Keefe",
    "cred": "DO",
    "mscp": "Certified",
    "ptype": "Physician",
    "spec": "OB GYN",
    "practice": "Walnut Lake",
    "email": "rwiseman.do@gmail.com",
    "phone": "(248) 736-1914",
    "seasons": {},
    "id": "m24",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Elizabeth",
    "last": "Paluga",
    "cred": "MD",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Enhanced Internal Medicine",
    "email": "epaluga@enhancedinternalmed.com",
    "phone": "(248) 609-1440",
    "seasons": {},
    "id": "m25",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Mary",
    "last": "Reid",
    "cred": "MD",
    "mscp": "",
    "ptype": "Physician",
    "spec": "OBGYN",
    "practice": "DMC",
    "email": "reid.maryk@gmail.com",
    "phone": "(248) 231-9870",
    "seasons": {
      "spring-2026": "in"
    },
    "id": "m26",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Gayle",
    "last": "Shotkin",
    "cred": "LMSW, CST",
    "mscp": "",
    "ptype": "",
    "spec": "Therapist/Sexual Health",
    "practice": "Sexual Health and Counseling Services LLC",
    "email": "gshotkin@gmail.com",
    "phone": "(248) 330-0070",
    "seasons": {},
    "id": "m27",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Emily",
    "last": "Soto",
    "cred": "PT, DPT",
    "mscp": "",
    "ptype": "",
    "spec": "PT",
    "practice": "Refine Physical Therapy and Wellness, LLC",
    "email": "emily@refineptwellness.com",
    "phone": "",
    "seasons": {},
    "id": "m28",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Monique",
    "last": "Steel",
    "cred": "WHNP-BC",
    "mscp": "Certified",
    "ptype": "",
    "spec": "",
    "practice": "University of Michigan, University Heath & Counseling",
    "email": "steelmon@med.umich.edu",
    "phone": "8103947335",
    "seasons": {},
    "id": "m29",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Teri",
    "last": "Sweet",
    "cred": "WHNP-BC",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "Trinity/IHA Southeast MI",
    "email": "sweettlrn@gmail.com",
    "phone": "",
    "seasons": {},
    "id": "m30",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Elizabeth",
    "last": "Swenor",
    "cred": "DO",
    "mscp": "",
    "ptype": "",
    "spec": "Functional Medicine",
    "practice": "HFH",
    "email": "meswenor@gmail.com",
    "phone": "2318813059",
    "seasons": {},
    "id": "m31",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Dietary: vegan",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "",
    "first": "Valerie",
    "last": "Wood",
    "cred": "LMSW, AASECT Certified Sex Therapist",
    "mscp": "",
    "ptype": "",
    "spec": "Therapist/Sexual Health",
    "practice": "Valerie Wood, LMSW (self employed)",
    "email": "valeriewoodlmsw@gmail.com",
    "phone": "(734) 489-9148",
    "seasons": {},
    "id": "m32",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "New attendee — colleague of Dr. Lisa Chism; sex therapist/psychotherapist (not a medical provider), invited to join for the July meeting.",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Mary",
    "last": "Cornelius",
    "cred": "DO",
    "mscp": "Certified",
    "ptype": "Physician",
    "spec": "Gyne",
    "practice": "DMC Ob/Gyn Bloomfield Hills",
    "email": "sportogordo@hotmail.com",
    "phone": "2485143539",
    "seasons": {
      "spring-2026": "in"
    },
    "id": "m33",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Eva",
    "last": "Alsheik",
    "cred": "MD",
    "mscp": "",
    "ptype": "Physician",
    "spec": "GI",
    "practice": "Henry Ford Health",
    "email": "ealsheik@gmail.com",
    "phone": "3125044203",
    "seasons": {
      "spring-2026": "in"
    },
    "id": "m34",
    "rsvp": {
      "summer-2026": true
    },
    "notes": "",
    "consent": "",
    "edited": false
  },
  {
    "prefix": "Dr.",
    "first": "Jennifer",
    "last": "Peng",
    "cred": "",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "",
    "email": "",
    "phone": "",
    "seasons": {},
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Guest of Dr. Amy Heeringa",
    "edited": true,
    "id": "g1",
    "consent": ""
  },
  {
    "prefix": "Dr.",
    "first": "Jennifer",
    "last": "Burgess",
    "cred": "",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "",
    "email": "",
    "phone": "",
    "seasons": {},
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Guest of Dr. Anastasia Arab",
    "edited": true,
    "id": "g2",
    "consent": ""
  },
  {
    "prefix": "",
    "first": "Laura",
    "last": "Gruskin",
    "cred": "MD",
    "mscp": "",
    "ptype": "",
    "spec": "",
    "practice": "",
    "email": "",
    "phone": "",
    "seasons": {},
    "rsvp": {
      "summer-2026": true
    },
    "notes": "Guest of Dr. Karen Berris",
    "edited": true,
    "id": "g3",
    "consent": ""
  }
];
