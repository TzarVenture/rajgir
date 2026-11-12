import { NextRequest, NextResponse } from "next/server";
import { saveSubmission, getDb } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    // Try sending to NestJS Backend if configured
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/influencers/register`;
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
              message: "Your influencer partnership proposal has been successfully submitted!",
              data: json,
            },
            { status: 201 }
          );
        }
      } catch (err) {
        console.warn("NestJS influencer registration failed, falling back to local storage:", err);
      }
    }

    // Direct Supabase Fallback
    try {
      if (formData.userId || formData.email) {
        const { data: dbUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .or(`id.eq.${formData.userId || "00000000-0000-0000-0000-000000000000"},supabase_auth_id.eq.${formData.userId || "00000000-0000-0000-0000-000000000000"},email.eq.${formData.email}`)
          .maybeSingle();

        let resolvedId = dbUser?.id || null;

        if (!resolvedId && formData.email) {
          const { data: created } = await supabaseAdmin
            .from("users")
            .upsert(
              {
                email: formData.email.toLowerCase().trim(),
                phone: formData.phone?.trim() || null,
                full_name: formData.fullName?.trim() || formData.email.split("@")[0],
                supabase_auth_id: formData.userId || null,
                role: "INFLUENCER",
                status: "PENDING_APPROVAL",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "email" }
            )
            .select("id")
            .single();

          resolvedId = created?.id || null;
        }

        await supabaseAdmin.from("influencers").insert({
          user_id: resolvedId || null,
          full_name: formData.fullName,
          stage_name: formData.stageName || null,
          email: formData.email,
          phone: formData.phone,
          city: formData.city || null,
          country: formData.country || "India",
          primary_platform: formData.primaryPlatform,
          profile_url: formData.profileUrl,
          follower_count: formData.followerCount,
          engagement_rate: formData.engagementRate || null,
          target_niche: formData.targetNiche,
          collaboration_deliverables: formData.collaborationDeliverables,
          status: "pending",
        });

        if (resolvedId) {
          await supabaseAdmin
            .from("users")
            .update({ role: "INFLUENCER", status: "PENDING_APPROVAL", updated_at: new Date().toISOString() })
            .eq("id", resolvedId);
        }
      }
    } catch (dbErr) {
      console.warn("Direct Supabase influencer insert warning:", dbErr);
    }

    // Save into simulated db.json fallback
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
    console.error("API Error in POST /api/register/influencer:", error);
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

