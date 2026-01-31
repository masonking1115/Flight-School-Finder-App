// Phase 2 spec data models

export type PartPreference = "part_61" | "part_141" | "no_preference";
export type BudgetRange = "low" | "mid" | "high" | "";
export type Timeline =
  | "under_1_month"
  | "1_3_months"
  | "3_6_months"
  | "just_browsing"
  | "";

export interface StudentOnboarding {
  location: { zip?: string; city?: string; state?: string };
  radiusMiles: number;
  goals: string[];
  partPreference: PartPreference;
  budgetRange: BudgetRange;
  timeline: Timeline;
}

export interface StudentProfile {
  id: string;
  email: string;
  passwordHash?: string; // simplified: store plain for MVP demo only
  createdAt: string;
  onboarding?: StudentOnboarding;
}

export interface SchoolPricing {
  type: "range" | "contact_for_quote";
  min?: number;
  max?: number;
}

export interface SchoolProfile {
  id: string;
  ownerEmail: string;
  passwordHash?: string;
  name: string;
  address: string;
  phone: string;
  website?: string;
  photoUrl?: string;
  lat?: number;
  lon?: number;
  programs: string[];
  ratings: string[];
  aircraftTypes: string[];
  pricing: SchoolPricing;
  description: string;
  differentiators: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = "new" | "contacted" | "closed";

export interface Lead {
  id: string;
  schoolId: string;
  studentId: string;
  studentEmail?: string;
  studentPhone?: string;
  message?: string;
  studentGoals?: string[];
  studentLocation?: string;
  status: LeadStatus;
  createdAt: string;
}

export interface RankedSchool {
  school: SchoolProfile;
  score: number;
  distanceMiles?: number;
}

export const GOALS = [
  "Private Pilot",
  "Instrument",
  "Commercial",
  "CFI",
  "Other",
] as const;

export const RADIUS_OPTIONS = [25, 50, 75, 100] as const;

export const PART_OPTIONS: { value: PartPreference; label: string }[] = [
  { value: "no_preference", label: "No preference" },
  { value: "part_61", label: "Part 61" },
  { value: "part_141", label: "Part 141" },
];

export const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "", label: "No preference" },
  { value: "low", label: "Under $8k" },
  { value: "mid", label: "$8k – $12k" },
  { value: "high", label: "Over $12k" },
];

export const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "just_browsing", label: "Just browsing" },
  { value: "under_1_month", label: "Start in < 1 month" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "3_6_months", label: "3–6 months" },
];
