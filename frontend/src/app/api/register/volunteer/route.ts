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
      "tShirtSize",
      "emergencyContactName",
      "emergencyContactPhone",
      "rolePreference",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(formData.availability) || formData.availability.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select at least one availability slot.",
        },
        { status: 400 }
      );
    }

    if (!formData.waiverAgreed) {
      return NextResponse.json(
        {
          success: false,
          error: "You must accept the volunteer liability waiver and terms.",
        },
        { status: 400 }
      );
    }

    // Try sending to NestJS Backend if configured
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/volunteers/register`;
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const json = await res.json();
          return NextResponse.json(
            {
              success: true,
              message: "Your volunteer registration has been successfully submitted!",
              data: json,
            },
            { status: 201 }
          );
        }
      } catch (err) {
        console.warn("NestJS volunteer registration failed, falling back to local storage:", err);
      }
    }

    // Save into simulated db.json fallback
    const savedRecord = await saveSubmission("volunteer", formData);

    return NextResponse.json(
      {
        success: true,
        message: "Your volunteer registration has been successfully submitted!",
        data: savedRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error in POST /api/register/volunteer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing volunteer registration.",
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
      total: db.volunteers.length,
      volunteers: db.volunteers,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve volunteers." },
      { status: 500 }
    );
  }
}

