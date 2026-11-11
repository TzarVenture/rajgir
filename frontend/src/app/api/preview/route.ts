import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.PREVIEW_PASSWORD || "rajgir@preview2027";

    if (!password || password !== correctPassword) {
      return NextResponse.json({ success: false, message: "Invalid preview password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Preview session granted" });

    // Set preview session cookie for 7 days
    response.cookies.set("rajgir_preview_auth", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Preview session cleared" });
  response.cookies.delete("rajgir_preview_auth");
  return response;
}

