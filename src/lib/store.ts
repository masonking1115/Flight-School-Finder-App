import type {
  StudentProfile,
  SchoolProfile,
  Lead,
  StudentOnboarding,
} from "./types";

// In-memory store with seed data. Resets on server restart.
// In production, replace with a real DB.

let students: StudentProfile[] = [];
let schools: SchoolProfile[] = [];
let leads: Lead[] = [];

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// Major Georgia cities: name -> center coords and zip codes (all zips in that city are searchable)
const GEORGIA_CITIES: Record<string, { lat: number; lon: number; zips: string[] }> = {
  atlanta: {
    lat: 33.749,
    lon: -84.388,
    zips: [
      "30301", "30302", "30303", "30304", "30305", "30306", "30307", "30308", "30309", "30310",
      "30311", "30312", "30313", "30314", "30315", "30316", "30317", "30318", "30319", "30320",
      "30321", "30322", "30324", "30325", "30326", "30327", "30328", "30329", "30331", "30332",
      "30333", "30334", "30336", "30337", "30338", "30339", "30340", "30341", "30342", "30343",
      "30344", "30345", "30346", "30347", "30348", "30349", "30350", "30353", "30354", "30355",
      "30356", "30357", "30358", "30359", "30360", "30361", "30362", "30363", "30364", "30365",
      "30366", "30367", "30368", "30369", "30370", "30371", "30374", "30375", "30376", "30377",
      "30378", "30379", "30380", "30384", "30385", "30386", "30387", "30388", "30389", "30390",
      "30392", "30394", "30396", "30398", "30399",
    ],
  },
  savannah: {
    lat: 32.0809,
    lon: -81.0912,
    zips: ["31401", "31402", "31403", "31404", "31405", "31406", "31407", "31408", "31409", "31410", "31411", "31412", "31414", "31415", "31416", "31418", "31419", "31420", "31421"],
  },
  augusta: {
    lat: 33.4735,
    lon: -82.0105,
    zips: ["30901", "30903", "30904", "30905", "30906", "30907", "30909", "30912", "30914", "30916", "30917", "30919"],
  },
  columbus: {
    lat: 32.461,
    lon: -84.9877,
    zips: ["31901", "31902", "31903", "31904", "31905", "31906", "31907", "31908", "31909"],
  },
  macon: {
    lat: 32.8407,
    lon: -83.6324,
    zips: ["31201", "31202", "31203", "31204", "31205", "31206", "31207", "31208", "31209", "31210", "31211", "31213", "31216", "31217", "31220", "31221"],
  },
  athens: {
    lat: 33.9519,
    lon: -83.3576,
    zips: ["30601", "30602", "30603", "30604", "30605", "30606", "30607"],
  },
  marietta: {
    lat: 33.9526,
    lon: -84.5499,
    zips: ["30060", "30061", "30062", "30063", "30064", "30065", "30066", "30067", "30068"],
  },
  "sandy springs": {
    lat: 33.9304,
    lon: -84.3733,
    zips: ["30328", "30338", "30342", "30350"],
  },
  roswell: {
    lat: 34.0232,
    lon: -84.3616,
    zips: ["30075", "30076", "30077"],
  },
  alpharetta: {
    lat: 34.0754,
    lon: -84.2941,
    zips: ["30004", "30005", "30009", "30022"],
  },
  decatur: {
    lat: 33.775,
    lon: -84.2963,
    zips: ["30030", "30032", "30033"],
  },
  kennesaw: {
    lat: 34.0234,
    lon: -84.6155,
    zips: ["30144", "30152"],
  },
  smyrna: {
    lat: 33.8834,
    lon: -84.5144,
    zips: ["30080", "30082"],
  },
  "johns creek": {
    lat: 34.0289,
    lon: -84.1986,
    zips: ["30022", "30097"],
  },
  "warner robins": {
    lat: 32.613,
    lon: -83.6242,
    zips: ["31088", "31093", "31098"],
  },
  albany: {
    lat: 31.5785,
    lon: -84.1557,
    zips: ["31701", "31702", "31703", "31705", "31707", "31721"],
  },
  gainesville: {
    lat: 34.2979,
    lon: -83.8241,
    zips: ["30501", "30503", "30504", "30506", "30507"],
  },
  dalton: {
    lat: 34.7698,
    lon: -84.9702,
    zips: ["30720", "30721"],
  },
  rome: {
    lat: 34.257,
    lon: -85.1647,
    zips: ["30161", "30165"],
  },
  valdosta: {
    lat: 30.8327,
    lon: -83.2785,
    zips: ["31601", "31602", "31603", "31604", "31605", "31606"],
  },
  newnan: {
    lat: 33.3807,
    lon: -84.7996,
    zips: ["30263", "30265"],
  },
  statesboro: {
    lat: 32.4488,
    lon: -81.7832,
    zips: ["30458", "30459", "30460", "30461"],
  },
  "peachtree city": {
    lat: 33.3965,
    lon: -84.5958,
    zips: ["30269", "30270"],
  },
  brookhaven: {
    lat: 33.8584,
    lon: -84.3402,
    zips: ["30319", "30324", "30341"],
  },
  dunwoody: {
    lat: 33.9462,
    lon: -84.3346,
    zips: ["30338", "30360"],
  },
};

// Build ZIP -> coords from Georgia cities (so every GA zip is searchable) plus other US zips
function buildZipToCoords(): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {
    "10001": [40.7506, -73.9971],
    "90210": [34.0901, -118.4065],
    "60601": [41.8853, -87.6222],
    "75201": [32.7814, -96.7967],
    "85001": [33.4484, -112.074],
    "98101": [47.6062, -122.3321],
    "02101": [42.3601, -71.0589],
    "19102": [39.9526, -75.1652],
    "32801": [28.5383, -81.3792],
    "77001": [29.7604, -95.3698],
  };
  for (const city of Object.values(GEORGIA_CITIES)) {
    for (const zip of city.zips) {
      out[zip] = [city.lat, city.lon];
    }
  }
  return out;
}

const ZIP_TO_COORDS = buildZipToCoords();

// Simple string similarity (0–1). Used for fuzzy city matching.
function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const sa = a.toLowerCase();
  const sb = b.toLowerCase();
  if (sa === sb) return 1;
  if (sa.startsWith(sb) || sb.startsWith(sa)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  let matches = 0;
  const maxLen = Math.max(sa.length, sb.length);
  for (let i = 0; i < Math.min(sa.length, sb.length); i++) {
    if (sa[i] === sb[i]) matches++;
  }
  return matches / maxLen;
}

export type GeocodeResult = {
  coords: [number, number] | null;
  matchedName?: string;
  suggestions?: string[];
};

export function geocodeWithSuggestions(zipOrCity: string): GeocodeResult {
  const raw = zipOrCity.trim().replace(/\s+/g, " ");
  const zipOnly = raw.replace(/\D/g, "").slice(0, 5);
  if (zipOnly.length === 5 && ZIP_TO_COORDS[zipOnly]) {
    const cityForZip = Object.entries(GEORGIA_CITIES).find(([, c]) => c.zips.includes(zipOnly));
    const matchedName = cityForZip ? cityForZip[0].replace(/\b\w/g, (ch) => ch.toUpperCase()) : undefined;
    return { coords: ZIP_TO_COORDS[zipOnly], matchedName };
  }
  const cityKey = raw
    .toLowerCase()
    .replace(/,?\s*(ga|georgia)\s*$/i, "")
    .trim()
    .replace(/\s+/g, " ");
  if (GEORGIA_CITIES[cityKey]) {
    const c = GEORGIA_CITIES[cityKey];
    const displayName = cityKey.replace(/\b\w/g, (ch) => ch.toUpperCase());
    return { coords: [c.lat, c.lon], matchedName: displayName };
  }
  for (const [name, data] of Object.entries(GEORGIA_CITIES)) {
    if (cityKey.includes(name) || name.includes(cityKey)) {
      const displayName = name.replace(/\b\w/g, (ch) => ch.toUpperCase());
      return { coords: [data.lat, data.lon], matchedName: displayName };
    }
  }
  const scored = Object.keys(GEORGIA_CITIES)
    .map((name) => ({ name, score: stringSimilarity(cityKey, name) }))
    .filter((x) => x.score >= 0.4)
    .sort((a, b) => b.score - a.score);
  if (scored.length > 0) {
    const best = scored[0];
    const c = GEORGIA_CITIES[best.name];
    const matchedName = best.name.replace(/\b\w/g, (ch) => ch.toUpperCase());
    const suggestions = scored.slice(0, 5).map((s) => s.name.replace(/\b\w/g, (ch) => ch.toUpperCase()));
    return { coords: [c.lat, c.lon], matchedName, suggestions };
  }
  let n = 0;
  for (let i = 0; i < raw.length; i++) n = (n * 31 + raw.charCodeAt(i)) >>> 0;
  const lat = 39 + (n % 10) - 5;
  const lon = -98 + (Math.floor(n / 10) % 20) - 10;
  const fallbackSuggestions = Object.keys(GEORGIA_CITIES).slice(0, 5).map((n) => n.replace(/\b\w/g, (ch) => ch.toUpperCase()));
  return { coords: [lat, lon], suggestions: fallbackSuggestions };
}

function geocode(zipOrCity: string): [number, number] | null {
  const r = geocodeWithSuggestions(zipOrCity);
  return r.coords;
}

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function seed() {
  const now = new Date().toISOString();
  const demoPassword = "demo1234";
  schools = [
    {
      id: "sch_1",
      ownerEmail: "school1@example.com",
      passwordHash: demoPassword,
      name: "Skyline Aviation",
      address: "123 Airport Rd, Anytown, NY 10001",
      phone: "+1-555-0100",
      website: "https://skylineaviation.com",
      photoUrl: "/school-1.jpg",
      lat: 40.75,
      lon: -74.0,
      programs: ["Part 61", "Part 141"],
      ratings: ["Private", "Instrument", "Commercial"],
      aircraftTypes: ["C172", "PA-28"],
      pricing: { type: "range", min: 8000, max: 12000 },
      description:
        "Full-service Part 61 and 141 school. Flexible scheduling and experienced instructors.",
      differentiators: ["Flexible scheduling", "New fleet"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sch_2",
      ownerEmail: "school2@example.com",
      name: "Cloud Nine Flight Academy",
      address: "456 Runway Dr, Somewhere, CA 90210",
      phone: "+1-555-0200",
      website: "https://cloudnine.com",
      lat: 34.09,
      lon: -118.41,
      programs: ["Part 61"],
      ratings: ["Private", "Instrument"],
      aircraftTypes: ["C172"],
      pricing: { type: "range", min: 7000, max: 10000 },
      description: "Part 61 focus with personalized training and competitive rates.",
      differentiators: ["Small class size", "Owner-operated"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sch_3",
      ownerEmail: "school3@example.com",
      passwordHash: demoPassword,
      name: "Metro Flyers",
      address: "789 Aviation Way, Chicago, IL 60601",
      phone: "+1-555-0300",
      lat: 41.89,
      lon: -87.62,
      programs: ["Part 61", "Part 141"],
      ratings: ["Private", "Instrument", "Commercial", "CFI"],
      aircraftTypes: ["C172", "PA-28", "DA40"],
      pricing: { type: "contact_for_quote" },
      description:
        "Career-focused programs. Part 141 approved with accelerated options.",
      differentiators: ["Career track", "Job placement"],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sch_aero_atlanta",
      ownerEmail: "info@aeroatlanta.com",
      name: "Aero Atlanta Flight Center",
      address: "1954 Airport Rd, Ste. 66, Atlanta, GA 30341",
      phone: "(770) 422-2376",
      website: "https://aeroatlanta.com/",
      lat: 33.8756,
      lon: -84.302,
      programs: ["Part 61", "Part 141"],
      ratings: ["Private", "Instrument", "Commercial", "CFI"],
      aircraftTypes: ["Cirrus", "C172", "High-performance"],
      pricing: { type: "contact_for_quote" },
      description:
        "Atlanta's premier flight training center since 1989. Full-service Part 61 and Part 141 programs at DeKalb-Peachtree (KPDK) and Cobb County (KRYY). Private Pilot Certification, Cirrus training, aircraft rental, and aircraft management. World's largest Cirrus rental fleet; factory-level Cirrus Standardized Instructor Pilots. Client-focused training with top-notch facilities and dedication to safety.",
      differentiators: [
        "First-class facilities & service",
        "World's largest Cirrus rental fleet",
        "Unmatched dedication to safety",
        "Platinum Cirrus Training Center",
        "Two locations: KPDK & KRYY",
      ],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sch_centennial",
      ownerEmail: "info@centennialaviationacademy.com",
      passwordHash: demoPassword,
      name: "Centennial Aviation Academy",
      address: "Atlanta, GA",
      phone: "",
      website: "https://www.centennialaviationacademy.com/",
      lat: 33.88,
      lon: -84.30,
      programs: ["Part 61", "Part 141"],
      ratings: ["Private", "Instrument", "Commercial", "CFI"],
      aircraftTypes: ["C172", "PA-28"],
      pricing: { type: "contact_for_quote" },
      description:
        "Atlanta's premier flight academy for adults and young aviators. Centennial Aviation Academy is ranked as one of the top 10 flight schools in the nation and was recognized by AOPA as a Distinguished Flight School in 2021-2022. With courses designed for both young aviators and adult students, we offer an open and inclusive environment. Students and renters have 24/7 access to our well-maintained fleet, complimentary access to CAA gatherings, reasonable and competitive pricing, and student leadership opportunities.",
      differentiators: [
        "Top 10 flight school in the nation",
        "AOPA Distinguished Flight School 2021-2022",
        "Youth Pilot Academy & Summer Camps",
        "Adult Flight Training & Add-On Ratings",
        "Introductory Flights & TSA Requirements",
      ],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sch_skybound",
      ownerEmail: "info@skybnd.com",
      passwordHash: demoPassword,
      name: "Skybound Aviation",
      address: "2000 Airport Rd, Ste. 125, Atlanta, GA 30341",
      phone: "(678) 691-3283",
      website: "https://www.skybnd.com/",
      lat: 33.8756,
      lon: -84.302,
      programs: ["Part 61", "Part 141"],
      ratings: ["Private", "Instrument", "Commercial", "CFI"],
      aircraftTypes: ["C172", "PA-28"],
      pricing: { type: "contact_for_quote" },
      description:
        "Learn to fly in Atlanta with Skybound Aviation at DeKalb-Peachtree Airport (PDK). We offer FAA-approved Part 61 and Part 141 flight training for every level—from Private Pilot License to Instrument and Commercial. Experienced instructors provide personalized training so you can learn at your own pace. Affordable, flexible pilot training with discovery flights, aircraft rental, and maintenance. AOPA Flight School Honor Roll 2013, 2014, 2016, and Honor Roll of Excellence 2018.",
      differentiators: [
        "Convenient location at PDK in Metro Atlanta",
        "Cessna and Piper fleet",
        "Competitive pricing and financing options",
        "One-on-one instruction for Private, Instrument, CFI",
        "AOPA Flight Training Excellence Award",
      ],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sch_faithful_guardian",
      ownerEmail: "info@faithfulguardianaviation.com",
      passwordHash: demoPassword,
      name: "Faithful Guardian Aviation",
      address: "3956 Aviation Circle, Atlanta, GA 30336",
      phone: "(770) 462-0049",
      website: "https://faithfulguardianaviation.com/",
      lat: 33.7791,
      lon: -84.5214,
      programs: ["Part 61", "Part 141"],
      ratings: ["Private", "Instrument", "Commercial", "CFI"],
      aircraftTypes: ["C172", "C182", "C310", "C421", "PA-28", "PA-32"],
      pricing: { type: "contact_for_quote" },
      description:
        "Let your dreams take flight at Faithful Guardian Aviation. Located at Fulton County Airport (FTY), we offer VA-approved airplane and helicopter training, SEVP-approved M1 visa programs for international students, and accelerated paths from zero to Commercial Multi-Engine. Our CFIs have more than 100,000 combined hours. We operate a large fleet including Cessna 172N, 182, 310, 421, Piper Warrior, Cherokee 6, and state-of-the-art simulators. Flexible scheduling for flight attendants and career changers.",
      differentiators: [
        "VA Approved airplane and helicopter training",
        "International students – SEVP M1 visa approved",
        "Accelerated path to airline; job placement support",
        "Large fleet and two simulators",
        "Flight attendant–friendly scheduling",
      ],
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
  students = [];
  leads = [];
}

// Run seed on load
seed();

// ——— Students ———
export function getStudentByEmail(email: string): StudentProfile | undefined {
  return students.find((s) => s.email.toLowerCase() === email.toLowerCase());
}

export function getStudentById(id: string): StudentProfile | undefined {
  return students.find((s) => s.id === id);
}

export function createStudent(
  email: string,
  password: string
): StudentProfile {
  const existing = getStudentByEmail(email);
  if (existing) throw new Error("Email already registered");
  const profile: StudentProfile = {
    id: id("stu"),
    email,
    passwordHash: password, // MVP: store plain; in prod use bcrypt
    createdAt: new Date().toISOString(),
  };
  students.push(profile);
  return profile;
}

export function updateStudentOnboarding(
  studentId: string,
  onboarding: StudentOnboarding
): StudentProfile | undefined {
  const s = students.find((x) => x.id === studentId);
  if (!s) return undefined;
  s.onboarding = onboarding;
  return s;
}

export function authStudent(
  email: string,
  password: string
): StudentProfile | undefined {
  const s = getStudentByEmail(email);
  if (!s || s.passwordHash !== password) return undefined;
  return s;
}

export function updateStudentPassword(
  studentId: string,
  currentPassword: string,
  newPassword: string
): boolean {
  const s = students.find((x) => x.id === studentId);
  if (!s || s.passwordHash !== currentPassword) return false;
  s.passwordHash = newPassword;
  return true;
}

// ——— Schools ———
export function getSchoolById(id: string): SchoolProfile | undefined {
  return schools.find((s) => s.id === id);
}

export function getSchoolByOwnerEmail(email: string): SchoolProfile | undefined {
  return schools.find(
    (s) => s.ownerEmail.toLowerCase() === email.toLowerCase()
  );
}

export function getPublishedSchools(): SchoolProfile[] {
  return schools.filter((s) => s.published);
}

export function getAllSchools(): SchoolProfile[] {
  return [...schools];
}

export function createSchool(
  ownerEmail: string,
  password: string
): SchoolProfile {
  const existing = getSchoolByOwnerEmail(ownerEmail);
  if (existing) throw new Error("Email already registered");
  const now = new Date().toISOString();
  const profile: SchoolProfile = {
    id: id("sch"),
    ownerEmail,
    passwordHash: password,
    name: "",
    address: "",
    phone: "",
    programs: [],
    ratings: [],
    aircraftTypes: [],
    pricing: { type: "contact_for_quote" },
    description: "",
    differentiators: [],
    published: false,
    createdAt: now,
    updatedAt: now,
  };
  schools.push(profile);
  return profile;
}

export function updateSchool(
  schoolId: string,
  updates: Partial<SchoolProfile>
): SchoolProfile | undefined {
  const s = schools.find((x) => x.id === schoolId);
  if (!s) return undefined;
  Object.assign(s, updates, { updatedAt: new Date().toISOString() });
  return s;
}

export function authSchool(
  email: string,
  password: string
): SchoolProfile | undefined {
  const s = getSchoolByOwnerEmail(email);
  if (!s || s.passwordHash !== password) return undefined;
  return s;
}

export function updateSchoolPassword(
  schoolId: string,
  currentPassword: string,
  newPassword: string
): boolean {
  const s = schools.find((x) => x.id === schoolId);
  if (!s || s.passwordHash !== currentPassword) return false;
  Object.assign(s, { passwordHash: newPassword, updatedAt: new Date().toISOString() });
  return true;
}

// ——— Leads ———
export function getLeadsBySchoolId(schoolId: string): Lead[] {
  return leads.filter((l) => l.schoolId === schoolId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLeadById(leadId: string): Lead | undefined {
  return leads.find((l) => l.id === leadId);
}

export function createLead(lead: Omit<Lead, "id" | "createdAt">): Lead {
  const newLead: Lead = {
    ...lead,
    id: id("lead"),
    createdAt: new Date().toISOString(),
  };
  leads.push(newLead);
  return newLead;
}

export function updateLeadStatus(
  leadId: string,
  status: Lead["status"]
): Lead | undefined {
  const l = leads.find((x) => x.id === leadId);
  if (!l) return undefined;
  l.status = status;
  return l;
}

// ——— Matching / ranking ———
function rankSchoolsWithCoords(
  onboarding: StudentOnboarding,
  sort: "score" | "distance" | "price",
  studentCoords: [number, number] | null
): Array<{ school: SchoolProfile; score: number; distanceMiles: number }> {
  const pub = getPublishedSchools();
  const radiusMiles = onboarding.radiusMiles;
  const goals = onboarding.goals || [];
  const partPref = onboarding.partPreference;
  const budgetRange = onboarding.budgetRange;

  const results: Array<{
    school: SchoolProfile;
    score: number;
    distanceMiles: number;
  }> = [];

  for (const school of pub) {
    const schoolLat = school.lat ?? 39;
    const schoolLon = school.lon ?? -98;
    const distanceMiles = studentCoords
      ? haversineMiles(
          studentCoords[0],
          studentCoords[1],
          schoolLat,
          schoolLon
        )
      : 0;

    // Hard filters
    if (distanceMiles > radiusMiles) continue;
    const schoolPrograms = school.programs;
    // Match when goal equals/contains rating or rating contains goal (e.g. "Private Pilot" matches "Private")
    const hasGoal = goals.some(
      (g) =>
        school.ratings.some((r) => {
          const rg = g.toLowerCase();
          const rr = r.toLowerCase();
          return rr.includes(rg) || rg.includes(rr) || rg.split(" ")[0] === rr;
        }) ||
        schoolPrograms.some((p) => p.toLowerCase().includes(g.toLowerCase()))
    );
    if (!hasGoal && goals.length > 0) continue;
    if (partPref === "part_61" && !schoolPrograms.includes("Part 61")) continue;
    if (partPref === "part_141" && !schoolPrograms.includes("Part 141"))
      continue;

    // Score 0–100
    const distScore =
      radiusMiles <= 0
        ? 100
        : Math.max(0, 100 - (distanceMiles / radiusMiles) * 40);
    const goalScore =
      goals.length === 0
        ? 100
        : (goals.filter((g) =>
            school.ratings.some((r) =>
              r.toLowerCase().includes(g.toLowerCase().split(" ")[0])
            )
          ).length /
            goals.length) *
          100;
    const partScore =
      partPref === "no_preference" ? 50 : 100;
    let budgetScore = 50;
    if (budgetRange && school.pricing.type === "range" && school.pricing.min != null && school.pricing.max != null) {
      const mid = (school.pricing.min + school.pricing.max) / 2;
      if (budgetRange === "low" && mid < 8000) budgetScore = 100;
      else if (budgetRange === "mid" && mid >= 8000 && mid <= 12000) budgetScore = 100;
      else if (budgetRange === "high" && mid > 12000) budgetScore = 100;
      else budgetScore = 50;
    }
    const score =
      distScore * 0.4 + goalScore * 0.3 + partScore * 0.15 + budgetScore * 0.15;

    results.push({ school, score: Math.round(score), distanceMiles });
  }

  if (sort === "distance") results.sort((a, b) => a.distanceMiles - b.distanceMiles);
  else if (sort === "price")
    results.sort((a, b) => {
      const pa = a.school.pricing.type === "range" ? a.school.pricing.min ?? 999999 : 999999;
      const pb = b.school.pricing.type === "range" ? b.school.pricing.min ?? 999999 : 999999;
      return pa - pb;
    });
  else results.sort((a, b) => b.score - a.score);

  return results;
}

export function rankSchoolsForStudent(
  onboarding: StudentOnboarding,
  sort: "score" | "distance" | "price" = "score"
): Array<{ school: SchoolProfile; score: number; distanceMiles: number }> {
  const loc = onboarding.location.zip || onboarding.location.city || "";
  const coords = geocode(loc);
  return rankSchoolsWithCoords(onboarding, sort, coords);
}

export type ResultsWithMeta = {
  results: Array<{ school: SchoolProfile; score: number; distanceMiles: number }>;
  matchedLocation?: string;
  locationSuggestions?: string[];
};

export function rankSchoolsForStudentWithMeta(
  onboarding: StudentOnboarding,
  sort: "score" | "distance" | "price" = "score"
): ResultsWithMeta {
  const loc = (onboarding.location.zip || onboarding.location.city || "").trim();
  const geo = geocodeWithSuggestions(loc);
  const results = rankSchoolsWithCoords(onboarding, sort, geo.coords);
  return {
    results,
    ...(geo.matchedName && { matchedLocation: geo.matchedName }),
    ...(geo.suggestions && geo.suggestions.length > 0 && { locationSuggestions: geo.suggestions }),
  };
}

/** Extract state abbreviation from US-style address (e.g. "City, ST 12345" -> "ST"). */
function stateFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1] ?? "";
  const stateMatch = last.match(/^([A-Za-z]{2})\s+\d/);
  return stateMatch ? stateMatch[1].toUpperCase() : last;
}

export type RecommendedSchool = { school: SchoolProfile; distanceMiles?: number };

/** Recommended schools: by distance from preferred location if set, else by state then name. */
export function getRecommendedSchools(
  onboarding: StudentOnboarding
): RecommendedSchool[] {
  const loc = (onboarding.location?.zip || onboarding.location?.city || "").trim();
  if (loc) {
    const ranked = rankSchoolsForStudent(onboarding, "distance");
    return ranked.map(({ school, distanceMiles }) => ({ school, distanceMiles }));
  }
  const pub = getPublishedSchools();
  const withState = pub.map((school) => ({
    school,
    state: stateFromAddress(school.address),
  }));
  withState.sort((a, b) => {
    const stateCmp = a.state.localeCompare(b.state);
    return stateCmp !== 0 ? stateCmp : a.school.name.localeCompare(b.school.name);
  });
  return withState.map(({ school }) => ({ school }));
}
