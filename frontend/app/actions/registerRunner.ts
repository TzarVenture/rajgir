"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { runnerRegistrationSchema, raceCategories, availableAddons } from "@/lib/schemas/runnerRegistration";

export interface RegisterRunnerResult {
  success: boolean;
  registrationNumber?: string;
  qrToken?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitRunnerRegistration(
  rawData: unknown
): Promise<RegisterRunnerResult> {
  try {
    // 1. Zod validation
    const parsed = runnerRegistrationSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please correct the highlighted errors in the form.",
        fieldErrors,
      };
    }

    const data = parsed.data;

    // 2. Cross-verify race distance and age eligibility
    const category = raceCategories.find((c) => c.distance === data.distance);
    if (!category) {
      return { success: false, error: "Invalid race category selected." };
    }

    if (data.ageOnRaceDay < category.minAge) {
      return {
        success: false,
        error: `Participants for ${data.distance} must be at least ${category.minAge} years old on race day.`,
      };
    }

    // 3. Recalculate price server-side to prevent tampering
    let calculatedGross = category.fee;
    const resolvedAddons: Array<{ id: string; title: string; price: number }> = [];

    for (const addonId of data.selectedAddons) {
      const addon = availableAddons.find((a) => a.id === addonId);
      if (addon) {
        calculatedGross += addon.price;
        resolvedAddons.push({
          id: addon.id,
          title: addon.title,
          price: addon.price,
        });
      }
    }

    let calculatedDiscount = 0;
    const cleanCoupon = (data.couponCode || "").trim().toUpperCase();
    if (cleanCoupon === "RAJGIR100") {
      calculatedDiscount = Math.round(calculatedGross * 0.1); // 10% off
    } else if (cleanCoupon === "EARLYBIRD") {
      calculatedDiscount = 200; // Flat 200 off
    }

    const calculatedNet = Math.max(1, calculatedGross - calculatedDiscount);

    // 4. Try sending to NestJS Backend API if configured
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/runners/register`;
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryDistance: data.distance,
            categoryTitle: category.title,
            registrationFee: category.fee,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            tshirtSize: data.tshirtSize,
            bibName: data.bibName,
            emergencyName: data.emergencyName,
            emergencyRelation: data.emergencyRelation,
            emergencyPhone: data.emergencyPhone,
            medicalNotes: data.medicalNotes || undefined,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: data.country || "India",
            runningClub: data.runningClub || undefined,
            selectedAddons: data.selectedAddons || [],
            couponCode: cleanCoupon || undefined,
            waiverAgreed: data.waiverAgreed,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.registrationNumber) {
            return {
              success: true,
              registrationNumber: json.registrationNumber,
            };
          }
        }
      } catch (backendError) {
        console.warn("NestJS API call skipped/failed, proceeding with direct Supabase insert:", backendError);
      }
    }

    // 5. Generate Unique Official Registration Number (Direct Supabase fallback)
    // Prefix mapping: 42.2 KM -> 42K, 21.1 KM -> 21K, 10 KM -> 10K, 5 KM -> 05K, 3 KM -> 03K
    const prefixMap: Record<string, string> = {
      "42.2 KM": "42K",
      "21.1 KM": "21K",
      "10 KM": "10K",
      "5 KM": "05K",
      "3 KM": "03K",
    };
    const prefix = prefixMap[data.distance] || "RUN";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNo = `RJG-2027-${prefix}-${randomSuffix}`;

    // 5. Insert directly into Supabase runner_registrations table
    const { data: inserted, error: dbError } = await supabaseAdmin
      .from("runner_registrations")
      .insert({
        registration_number: regNo,
        distance: data.distance,
        race_title: category.title,
        base_fee: category.fee,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        age_on_race_day: data.ageOnRaceDay,
        gender: data.gender,
        bib_name: data.bibName.toUpperCase(),
        blood_group: data.bloodGroup,
        tshirt_size: data.tshirtSize,
        emergency_name: data.emergencyName,
        emergency_relation: data.emergencyRelation,
        emergency_phone: data.emergencyPhone,
        medical_notes: data.medicalNotes || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country || "India",
        running_club: data.runningClub || null,
        selected_addons: resolvedAddons,
        gross_amount: calculatedGross,
        discount_amount: calculatedDiscount,
        net_amount: calculatedNet,
        coupon_code: cleanCoupon || null,
        payment_status: "CONFIRMED", // Pre-launch instant registration confirmation
        waiver_agreed: true,
      })
      .select("id, registration_number, qr_code_token")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return {
        success: false,
        error: `Database registration error: ${dbError.message || "Failed to save registration"}`,
      };
    }

    return {
      success: true,
      registrationNumber: inserted.registration_number,
      qrToken: inserted.qr_code_token,
    };
  } catch (err: unknown) {
    console.error("submitRunnerRegistration error:", err);
    const message = err instanceof Error ? err.message : "Unexpected registration failure";
    return { success: false, error: message };
  }
}

export async function getRegistrationDetails(regNo: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("runner_registrations")
      .select("*")
      .eq("registration_number", regNo)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

