import { NextRequest, NextResponse } from "next/server";
import { updateStudentPassword } from "@/lib/store";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentPassword, newPassword } = body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword)
      return NextResponse.json(
        { error: "Current password and new password required" },
        { status: 400 }
      );
    if (newPassword.length < 8)
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    const ok = updateStudentPassword(id, currentPassword, newPassword);
    if (!ok)
      return NextResponse.json(
        { error: "Invalid current password or student not found" },
        { status: 400 }
      );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
