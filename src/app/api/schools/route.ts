import { NextRequest, NextResponse } from "next/server";
import {
  getSchoolById,
  updateSchool,
  getPublishedSchools,
} from "@/lib/store";

export async function GET() {
  const schools = getPublishedSchools();
  const publicList = schools.map((s) => {
    const { passwordHash: _, ownerEmail: __, ...rest } = s;
    return rest;
  });
  return NextResponse.json({ schools: publicList });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, id: _id, ownerEmail: _oe, passwordHash: _ph, createdAt: _ca, ...updates } = body;
    if (!schoolId)
      return NextResponse.json(
        { error: "schoolId required" },
        { status: 400 }
      );
    const updated = updateSchool(schoolId, updates);
    if (!updated)
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    const { passwordHash: _, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
