import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Set session cookie
export async function POST(request: NextRequest) {
  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours (matches backend session duration)
    path: "/",
  });

  return NextResponse.json({ success: true });
}

// Clear session cookie
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sessionId");

  return NextResponse.json({ success: true });
}

// Get session cookie
export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  return NextResponse.json({ sessionId: sessionId || null });
}
