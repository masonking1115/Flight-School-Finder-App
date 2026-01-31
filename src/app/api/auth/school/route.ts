import { NextRequest, NextResponse } from "next/server";
import {
  createSchool,
  authSchool,
  getSchoolByOwnerEmail,
} from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body;
    if (!email || !password)
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    if (action === "signup") {
      if (getSchoolByOwnerEmail(email))
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      if (password.length < 8)
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      const profile = createSchool(email, password);
      const { passwordHash: _, ...safe } = profile;
      return NextResponse.json({ user: safe });
    }
    const profile = authSchool(email, password);
    if (!profile)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    const { passwordHash: _, ...safe } = profile;
    return NextResponse.json({ user: safe });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
