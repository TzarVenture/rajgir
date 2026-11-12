"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { api } from "@/lib/api";

export interface RegisterResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper: Ensure user ID is the internal DB uuid
async function resolveDbUserId(userIdOrAuthId: string, email: string): Promise<string> {
  const cleanEmail = email.toLowerCase().trim();
  const { data } = await supabaseAdmin
    .from("users")
    .select("id")
    .or(`id.eq.${userIdOrAuthId},supabase_auth_id.eq.${userIdOrAuthId},email.eq.${cleanEmail}`)
    .maybeSingle();

  if (data?.id) return data.id;

  // Insert or upsert record if missing
  const { data: created } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        email: cleanEmail,
        full_name: cleanEmail.split("@")[0],
        supabase_auth_id: userIdOrAuthId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  return created?.id || userIdOrAuthId;
}

// 1. TEAM REGISTRATION
export async function submitTeamRegistration(payload: {
  userId: string;
  teamName: string;
  clubAffiliation?: string;
  city: string;
  estimatedMembers: number;
  notes?: string;
}): Promise<RegisterResult<{ teamJoinCode: string; profile: any }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please log in to register your team." };

    if (user.role && user.role !== "TEAM_CAPTAIN") {
      return {
        success: false,
        error: `Your account is already assigned to role ${user.role}. Accounts are strictly limited to one role.`,
      };
    }

    // 1. Try NestJS Backend
    try {
      const res = await api.registerTeam(payload);
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
    } catch (apiErr) {
      console.warn("NestJS api.registerTeam failed, proceeding with direct Supabase fallback:", apiErr);
    }

    // 2. Direct Supabase Fallback
    const dbUserId = await resolveDbUserId(payload.userId, user.email);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const teamJoinCode = `TEAM-${randomSuffix}`;

    const { data: profile, error } = await supabaseAdmin
      .from("team_profiles")
      .insert({
        user_id: dbUserId,
        team_name: payload.teamName.trim(),
        club_affiliation: payload.clubAffiliation?.trim() || null,
        city: payload.city.trim(),
        team_join_code: teamJoinCode,
        estimated_members: Number(payload.estimatedMembers),
        notes: payload.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase team_profiles insert error:", error);
      return { success: false, error: error.message || "Failed to register team profile." };
    }

    // Update user role to active
    await supabaseAdmin
      .from("users")
      .update({ role: "TEAM_CAPTAIN", status: "ACTIVE", updated_at: new Date().toISOString() })
      .eq("id", dbUserId);

    return {
      success: true,
      data: { teamJoinCode, profile },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit team registration." };
  }
}

// 2. CORPORATE REGISTRATION
export async function submitCorporateRegistration(payload: {
  userId: string;
  companyName: string;
  gstin?: string;
  officialEmailDomain: string;
  designation: string;
  estimatedPasses: number;
  csrFocus?: string;
  billingAddress?: string;
}): Promise<RegisterResult<{ profile: any }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please log in to submit corporate registration." };

    if (user.role && user.role !== "CORPORATE_MANAGER") {
      return {
        success: false,
        error: `Your account is already assigned to role ${user.role}. Accounts are strictly limited to one role.`,
      };
    }

    // 1. Try NestJS Backend
    try {
      const res = await api.registerCorporate(payload);
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
    } catch (apiErr) {
      console.warn("NestJS api.registerCorporate failed, proceeding with direct Supabase fallback:", apiErr);
    }

    // 2. Direct Supabase Fallback
    const dbUserId = await resolveDbUserId(payload.userId, user.email);

    const { data: profile, error } = await supabaseAdmin
      .from("corporate_profiles")
      .insert({
        user_id: dbUserId,
        company_name: payload.companyName.trim(),
        gstin: payload.gstin?.trim() || null,
        official_email_domain: payload.officialEmailDomain.trim(),
        designation: payload.designation.trim(),
        estimated_passes: Number(payload.estimatedPasses),
        csr_focus: payload.csrFocus?.trim() || null,
        billing_address: payload.billingAddress?.trim() || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase corporate_profiles insert error:", error);
      return { success: false, error: error.message || "Failed to submit corporate profile." };
    }

    await supabaseAdmin
      .from("users")
      .update({ role: "CORPORATE_MANAGER", status: "PENDING_APPROVAL", updated_at: new Date().toISOString() })
      .eq("id", dbUserId);

    return { success: true, data: { profile } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit corporate registration." };
  }
}

// 3. SCHOOL REGISTRATION
export async function submitSchoolRegistration(payload: {
  userId: string;
  schoolName: string;
  boardAffiliation: string;
  city: string;
  teacherInCharge: string;
  teacherDesignation: string;
  estimatedStudents: number;
  parentalConsentAgreed: boolean;
}): Promise<RegisterResult<{ profile: any }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please log in to submit school registration." };

    if (user.role && user.role !== "SCHOOL_COORDINATOR") {
      return {
        success: false,
        error: `Your account is already assigned to role ${user.role}. Accounts are strictly limited to one role.`,
      };
    }

    // 1. Try NestJS Backend
    try {
      const res = await api.registerSchool(payload);
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
    } catch (apiErr) {
      console.warn("NestJS api.registerSchool failed, proceeding with direct Supabase fallback:", apiErr);
    }

    // 2. Direct Supabase Fallback
    const dbUserId = await resolveDbUserId(payload.userId, user.email);

    const { data: profile, error } = await supabaseAdmin
      .from("school_profiles")
      .insert({
        user_id: dbUserId,
        school_name: payload.schoolName.trim(),
        board_affiliation: payload.boardAffiliation.trim(),
        city: payload.city.trim(),
        teacher_in_charge: payload.teacherInCharge.trim(),
        teacher_designation: payload.teacherDesignation.trim(),
        estimated_students: Number(payload.estimatedStudents),
        parental_consent_agreed: payload.parentalConsentAgreed,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase school_profiles insert error:", error);
      return { success: false, error: error.message || "Failed to submit school profile." };
    }

    await supabaseAdmin
      .from("users")
      .update({ role: "SCHOOL_COORDINATOR", status: "PENDING_APPROVAL", updated_at: new Date().toISOString() })
      .eq("id", dbUserId);

    return { success: true, data: { profile } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit school registration." };
  }
}

// 4. SPONSOR REGISTRATION
export async function submitSponsorRegistration(payload: {
  userId: string;
  brandName: string;
  industry: string;
  tierInterest: string;
  budgetBand: string;
  brandWebsite?: string;
  proposalDeliverables?: string;
}): Promise<RegisterResult<{ profile: any }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please log in to submit sponsor registration." };

    if (user.role && user.role !== "SPONSOR") {
      return {
        success: false,
        error: `Your account is already assigned to role ${user.role}. Accounts are strictly limited to one role.`,
      };
    }

    // 1. Try NestJS Backend
    try {
      const res = await api.registerSponsor(payload);
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
    } catch (apiErr) {
      console.warn("NestJS api.registerSponsor failed, proceeding with direct Supabase fallback:", apiErr);
    }

    // 2. Direct Supabase Fallback
    const dbUserId = await resolveDbUserId(payload.userId, user.email);

    const { data: profile, error } = await supabaseAdmin
      .from("sponsor_profiles")
      .insert({
        user_id: dbUserId,
        brand_name: payload.brandName.trim(),
        industry: payload.industry.trim(),
        tier_interest: payload.tierInterest.trim(),
        budget_band: payload.budgetBand.trim(),
        brand_website: payload.brandWebsite?.trim() || null,
        proposal_deliverables: payload.proposalDeliverables?.trim() || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase sponsor_profiles insert error:", error);
      return { success: false, error: error.message || "Failed to submit sponsor profile." };
    }

    await supabaseAdmin
      .from("users")
      .update({ role: "SPONSOR", status: "PENDING_APPROVAL", updated_at: new Date().toISOString() })
      .eq("id", dbUserId);

    return { success: true, data: { profile } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit sponsor registration." };
  }
}

// 5. VENDOR REGISTRATION
export async function submitVendorRegistration(payload: {
  userId: string;
  businessName: string;
  stallCategory: string;
  stallSize: string;
  fssaiNumber?: string;
  electricPowerRequired: boolean;
}): Promise<RegisterResult<{ profile: any }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please log in to submit vendor registration." };

    if (user.role && user.role !== "VENDOR") {
      return {
        success: false,
        error: `Your account is already assigned to role ${user.role}. Accounts are strictly limited to one role.`,
      };
    }

    // 1. Try NestJS Backend
    try {
      const res = await api.registerVendor(payload);
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
    } catch (apiErr) {
      console.warn("NestJS api.registerVendor failed, proceeding with direct Supabase fallback:", apiErr);
    }

    // 2. Direct Supabase Fallback
    const dbUserId = await resolveDbUserId(payload.userId, user.email);

    const { data: profile, error } = await supabaseAdmin
      .from("vendor_profiles")
      .insert({
        user_id: dbUserId,
        business_name: payload.businessName.trim(),
        stall_category: payload.stallCategory.trim(),
        stall_size: payload.stallSize.trim(),
        fssai_number: payload.fssaiNumber?.trim() || null,
        electric_power_required: payload.electricPowerRequired,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase vendor_profiles insert error:", error);
      return { success: false, error: error.message || "Failed to submit vendor profile." };
    }

    await supabaseAdmin
      .from("users")
      .update({ role: "VENDOR", status: "PENDING_APPROVAL", updated_at: new Date().toISOString() })
      .eq("id", dbUserId);

    return { success: true, data: { profile } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit vendor registration." };
  }
}

// 6. TOURISM REGISTRATION
export async function submitTourismRegistration(payload: {
  userId: string;
  businessName: string;
  serviceType: string;
  location: string;
  distanceFromStartLine?: string;
  inventoryCapacity: string;
  discountOffering?: string;
}): Promise<RegisterResult<{ profile: any }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please log in to submit tourism registration." };

    if (user.role && user.role !== "TOURISM_PARTNER") {
      return {
        success: false,
        error: `Your account is already assigned to role ${user.role}. Accounts are strictly limited to one role.`,
      };
    }

    // 1. Try NestJS Backend
    try {
      const res = await api.registerTourism(payload);
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
    } catch (apiErr) {
      console.warn("NestJS api.registerTourism failed, proceeding with direct Supabase fallback:", apiErr);
    }

    // 2. Direct Supabase Fallback
    const dbUserId = await resolveDbUserId(payload.userId, user.email);

    const { data: profile, error } = await supabaseAdmin
      .from("tourism_profiles")
      .insert({
        user_id: dbUserId,
        business_name: payload.businessName.trim(),
        service_type: payload.serviceType.trim(),
        location: payload.location.trim(),
        distance_from_start_line: payload.distanceFromStartLine?.trim() || null,
        inventory_capacity: payload.inventoryCapacity.trim(),
        discount_offering: payload.discountOffering?.trim() || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase tourism_profiles insert error:", error);
      return { success: false, error: error.message || "Failed to submit tourism profile." };
    }

    await supabaseAdmin
      .from("users")
      .update({ role: "TOURISM_PARTNER", status: "PENDING_APPROVAL", updated_at: new Date().toISOString() })
      .eq("id", dbUserId);

    return { success: true, data: { profile } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit tourism registration." };
  }
}

