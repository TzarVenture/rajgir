import { NextRequest, NextResponse } from "next/server";
import { saveSubmission, getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formType, formData } = body;

    if (!formType || (formType !== "volunteer" && formType !== "influencer")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing formType. Must be 'volunteer' or 'influencer'.",
        },
        { status: 400 }
      );
    }

    if (!formData || typeof formData !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid formData payload." },
        { status: 400 }
      );
    }

    // Validation for Volunteer Form
    if (formType === "volunteer") {
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
    }

    // Validation for Influencer / Ambassador Form
    if (formType === "influencer") {
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

      // Security check: Strictly strip any running background fields if inadvertently passed
      delete formData.runningExperience;
      delete formData.pastMarathons;
      delete formData.runningCategory;
    }

    // Save entry into local db.json
    const savedRecord = await saveSubmission(formType, formData);

    return NextResponse.json(
      {
        success: true,
        message: `Your ${formType} application has been successfully submitted!`,
        data: savedRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API error in POST /api/forms:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while processing your submission.",
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
      summary: {
        totalVolunteers: db.volunteers.length,
        totalInfluencers: db.influencers.length,
      },
      data: {
        volunteers: db.volunteers,
        influencers: db.influencers,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve form submissions." },
      { status: 500 }
    );
  }
}

