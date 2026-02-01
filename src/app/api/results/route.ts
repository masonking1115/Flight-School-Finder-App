import { NextRequest, NextResponse } from "next/server";
import { getStudentById, rankSchoolsForStudent, rankSchoolsForStudentWithMeta } from "@/lib/store";
import type { StudentOnboarding } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const sort = (searchParams.get("sort") as "score" | "distance" | "price") || "score";
    if (!studentId)
      return NextResponse.json(
        { error: "studentId required" },
        { status: 400 }
      );
    const student = getStudentById(studentId);
    if (!student?.onboarding)
      return NextResponse.json(
        { error: "Student or onboarding not found" },
        { status: 404 }
      );
    const ranked = rankSchoolsForStudent(student.onboarding, sort);
    return NextResponse.json({ results: ranked });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { onboarding, sort } = body as {
      onboarding: StudentOnboarding;
      sort?: "score" | "distance" | "price";
    };
    const loc = onboarding?.location?.zip || onboarding?.location?.city || "";
    if (!onboarding?.location || onboarding.radiusMiles == null)
      return NextResponse.json(
        { error: "Location and radius are required" },
        { status: 400 }
      );
    if (!loc.trim())
      return NextResponse.json(
        { error: "Enter a ZIP code or city name" },
        { status: 400 }
      );
    const goals = onboarding.goals || [];
    const payload: StudentOnboarding = {
      ...onboarding,
      goals,
      partPreference: onboarding.partPreference ?? "no_preference",
      budgetRange: onboarding.budgetRange ?? "",
      timeline: onboarding.timeline ?? "just_browsing",
    };
    const { results, matchedLocation, locationSuggestions } = rankSchoolsForStudentWithMeta(
      payload,
      sort || "score"
    );
    return NextResponse.json({
      results,
      ...(matchedLocation && { matchedLocation }),
      ...(locationSuggestions && locationSuggestions.length > 0 && { locationSuggestions }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
