import { NextRequest, NextResponse } from "next/server";
import { getSchoolById } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const school = getSchoolById(id);
    if (!school)
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    const { passwordHash: _, ownerEmail: __, ...publicProfile } = school;
    return NextResponse.json(publicProfile);
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
