import { NextRequest, NextResponse } from "next/server";
import { saveSubmission, getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    if (!formData || typeof formData !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid form payload." },
        { status: 400 }
      );
    }

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "country",
      "primaryPlatform",
      "profileUrl",
      "followerCount",
      "targetNiche",
      "collaborationDeliverables",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Security: Strict removal of any running-related data fields
    delete (formData as any).runningExperience;
    delete (formData as any).pastMarathons;
    delete (formData as any).runningCategory;

    // Save into simulated db.json
    const savedRecord = await saveSubmission("influencer", formData);

    return NextResponse.json(
      {
        success: true,
        message: "Your influencer partnership proposal has been successfully submitted!",
        data: savedRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error in POST /api/influencer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing influencer proposal.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json({
      success: true,
      total: db.influencers.length,
      influencers: db.influencers,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve influencer submissions." },
      { status: 500 }
    );
  }
}

