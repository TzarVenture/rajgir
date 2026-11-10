import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface VolunteerFormData {
  fullName: string;
  email: string;
  phone: string;
  tShirtSize: "S" | "M" | "L" | "XL" | "XXL";
  emergencyContactName: string;
  emergencyContactPhone: string;
  availability: string[];
  rolePreference: string;
  languagesSpoken?: string;
  dietaryRestrictions?: string;
  medicalCertification: boolean;
  waiverAgreed: boolean;
}

export interface InfluencerFormData {
  fullName: string;
  stageName?: string;
  email: string;
  phone: string;
  city?: string;
  country: string;
  primaryPlatform: "Instagram" | "TikTok" | "YouTube" | "Strava" | "Blog";
  profileUrl: string;
  followerCount: string;
  engagementRate?: string;
  targetNiche: string;
  collaborationDeliverables: string;
}

export type VolunteerRecord = VolunteerFormData & {
  id: string;
  formType: "volunteer";
  submittedAt: string;
};

export type InfluencerRecord = InfluencerFormData & {
  id: string;
  formType: "influencer";
  submittedAt: string;
};

export interface LocalDatabase {
  volunteers: VolunteerRecord[];
  influencers: InfluencerRecord[];
}

const DB_PATH = path.join(process.cwd(), "db.json");

/**
 * Reads the local db.json file.
 * Creates the file with default collections if it doesn't exist yet.
 */
export async function getDb(): Promise<LocalDatabase> {
  try {
    const rawData = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(rawData);
    return {
      volunteers: Array.isArray(parsed.volunteers) ? parsed.volunteers : [],
      influencers: Array.isArray(parsed.influencers) ? parsed.influencers : [],
    };
  } catch (error: any) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) {
      const initialDb: LocalDatabase = { volunteers: [], influencers: [] };
      await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    console.error("Failed to read simulated db.json:", error);
    return { volunteers: [], influencers: [] };
  }
}

/**
 * Appends a new form submission to db.json with a unique ID and timestamp.
 */
export async function saveSubmission(
  formType: "volunteer" | "influencer",
  formData: Record<string, any>
): Promise<VolunteerRecord | InfluencerRecord> {
  const currentDb = await getDb();
  const id = `sub_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const submittedAt = new Date().toISOString();

  const record = {
    id,
    formType,
    submittedAt,
    ...formData,
  };

  if (formType === "volunteer") {
    currentDb.volunteers.push(record as VolunteerRecord);
  } else {
    currentDb.influencers.push(record as InfluencerRecord);
  }

  await fs.writeFile(DB_PATH, JSON.stringify(currentDb, null, 2), "utf-8");
  return record as VolunteerRecord | InfluencerRecord;
}

