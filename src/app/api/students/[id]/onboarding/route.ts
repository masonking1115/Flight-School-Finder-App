import { NextRequest, NextResponse } from "next/server";
import { updateStudentOnboarding } from "@/lib/store";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateStudentOnboarding(id, body);
    if (!updated)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    const { passwordHash: _, ...safe } = updated;
    return NextResponse.json({ user: safe });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
