import { NextRequest, NextResponse } from "next/server";
import { createLead, getLeadsBySchoolId } from "@/lib/store";
import { getSchoolById } from "@/lib/store";

export async function GET(request: NextRequest) {
  const schoolId = request.nextUrl.searchParams.get("schoolId");
  if (!schoolId)
    return NextResponse.json(
      { error: "schoolId required" },
      { status: 400 }
    );
  const leads = getLeadsBySchoolId(schoolId);
  return NextResponse.json({ leads });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      schoolId,
      studentId,
      studentEmail,
      studentPhone,
      message,
      studentGoals,
      studentLocation,
    } = body;
    if (!schoolId || !studentId)
      return NextResponse.json(
        { error: "schoolId and studentId required" },
        { status: 400 }
      );
    if (!studentEmail && !studentPhone)
      return NextResponse.json(
        { error: "Please provide an email or phone number." },
        { status: 400 }
      );
    const school = getSchoolById(schoolId);
    if (!school)
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    const lead = createLead({
      schoolId,
      studentId,
      studentEmail: studentEmail || undefined,
      studentPhone: studentPhone || undefined,
      message: message?.slice(0, 500),
      studentGoals,
      studentLocation,
      status: "new",
    });
    return NextResponse.json({ lead });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
