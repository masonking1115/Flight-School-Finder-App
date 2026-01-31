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

// Simple ZIP to lat/lon (US only, approximate). Add more as needed.
const ZIP_TO_COORDS: Record<string, [number, number]> = {
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
  "30341": [33.8756, -84.302],   // Atlanta (DeKalb-Peachtree / Chamblee)
  "30301": [33.749, -84.388],    // Downtown Atlanta
  "30144": [34.0234, -84.6155],  // Kennesaw (Cobb County Airport)
};

function geocode(zipOrCity: string): [number, number] | null {
  const trimmed = zipOrCity.replace(/\s+/g, "").slice(0, 5);
  if (ZIP_TO_COORDS[trimmed]) return ZIP_TO_COORDS[trimmed];
  // Fallback: hash to a point in US for demo
  let n = 0;
  for (let i = 0; i < trimmed.length; i++) n = (n * 31 + trimmed.charCodeAt(i)) >>> 0;
  const lat = 39 + (n % 10) - 5;
  const lon = -98 + (Math.floor(n / 10) % 20) - 10;
  return [lat, lon];
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
export function rankSchoolsForStudent(
  onboarding: StudentOnboarding,
  sort: "score" | "distance" | "price" = "score"
): Array<{ school: SchoolProfile; score: number; distanceMiles: number }> {
  const pub = getPublishedSchools();
  const loc = onboarding.location.zip || onboarding.location.city || "";
  const studentCoords = geocode(loc);
  const radiusMiles = onboarding.radiusMiles;
  const goals = onboarding.goals;
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
