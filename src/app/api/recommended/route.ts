import { NextRequest, NextResponse } from "next/server";
import { getStudentById, getRecommendedSchools } from "@/lib/store";
import type { RecommendedSchool } from "@/lib/store";
import type { StudentOnboarding } from "@/lib/types";

function toPublicSchool(item: RecommendedSchool) {
  const { passwordHash: _, ownerEmail: __, ...rest } = item.school;
  return {
    school: rest,
    distanceMiles: item.distanceMiles,
  };
}

const defaultOnboarding: StudentOnboarding = {
  location: {},
  radiusMiles: 50,
  goals: [],
  partPreference: "no_preference",
  budgetRange: "",
  timeline: "just_browsing",
};

function normalizeOnboarding(body: unknown): StudentOnboarding {
  if (body && typeof body === "object" && "onboarding" in body) {
    const ob = (body as { onboarding?: unknown }).onboarding;
    if (ob && typeof ob === "object") {
      const o = ob as Record<string, unknown>;
      return {
        location: (o.location as StudentOnboarding["location"]) ?? {},
        radiusMiles: typeof o.radiusMiles === "number" ? o.radiusMiles : 50,
        goals: Array.isArray(o.goals) ? (o.goals as string[]) : [],
        partPreference: (o.partPreference as StudentOnboarding["partPreference"]) ?? "no_preference",
        budgetRange: (o.budgetRange as StudentOnboarding["budgetRange"]) ?? "",
        timeline: (o.timeline as StudentOnboarding["timeline"]) ?? "just_browsing",
      };
    }
  }
  return defaultOnboarding;
}

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!studentId)
      return NextResponse.json(
        { error: "studentId required" },
        { status: 400 }
      );
    const student = getStudentById(studentId);
    const onboarding = student?.onboarding ?? defaultOnboarding;
    const schools = getRecommendedSchools(onboarding);
    const publicList = schools.map(toPublicSchool);
    return NextResponse.json({ schools: publicList });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/** POST with body { studentId?, onboarding? } — uses provided onboarding so recommendations update by location. */
export async function POST(request: NextRequest) {
  try {
    let onboarding: StudentOnboarding = defaultOnboarding;
    const body = await request.json().catch(() => ({}));
    const studentId = (body?.studentId as string) || request.nextUrl.searchParams.get("studentId");
    if (body?.onboarding) {
      onboarding = normalizeOnboarding(body);
    } else if (studentId) {
      const student = getStudentById(studentId);
      onboarding = student?.onboarding ?? defaultOnboarding;
    }
    const schools = getRecommendedSchools(onboarding);
    const publicList = schools.map(toPublicSchool);
    return NextResponse.json({ schools: publicList });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
