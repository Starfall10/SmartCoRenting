import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Set session cookie after login
export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create session data
    const sessionData = {
      uid,
      email,
      displayName: displayName || "",
      createdAt: new Date().toISOString(),
    };

    // Set session cookie (expires in 7 days)
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true, session: sessionData });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}

// Get current session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json({ session: null });
    }

    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json({ session });
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json({ session: null });
  }
}

// Delete session (logout)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}
