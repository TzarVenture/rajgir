import { NextRequest, NextResponse } from "next/server";
import {
  PREVIEW_COOKIE,
  createPreviewToken,
  isPreviewConfigured,
  passwordMatches,
  previewCookieOptions,
} from "@/lib/previewAuth";

// Basic in-memory brute-force protection (per server instance).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const failures = new Map<string, { count: number; first: number }>();

function clientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function isLimited(key: string): boolean {
  const entry = failures.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failures.set(key, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isPreviewConfigured()) {
      return NextResponse.json(
        { success: false, message: "Preview access is not configured." },
        { status: 503 }
      );
    }

    const key = clientKey(request);
    if (isLimited(key)) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { password } = await request.json();
    if (!(await passwordMatches(password))) {
      recordFailure(key);
      return NextResponse.json({ success: false, message: "Invalid preview password" }, { status: 401 });
    }

    failures.delete(key);
    const response = NextResponse.json({ success: true, message: "Preview session granted" });
    response.cookies.set(PREVIEW_COOKIE, await createPreviewToken(), previewCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Preview session cleared" });
  response.cookies.delete(PREVIEW_COOKIE);
  return response;
}
