import { NextRequest, NextResponse } from "next/server";
import { getStudentById, rankSchoolsForStudent } from "@/lib/store";
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
    if (!onboarding?.location || onboarding.radiusMiles == null || !onboarding.goals?.length)
      return NextResponse.json(
        { error: "onboarding with location, radiusMiles, and goals required" },
        { status: 400 }
      );
    const ranked = rankSchoolsForStudent(onboarding, sort || "score");
    return NextResponse.json({ results: ranked });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
