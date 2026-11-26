import type { AudienceId } from "./audiences";
import type { Journey } from "./journeys";

/** The slice of the signed-in user the tracker can read without calling the API. */
export interface ProgressUser {
  role?: string | null;
  status?: string;
}

const ROLE_AUDIENCE: Record<string, AudienceId> = {
  RUNNER: "runner",
  VOLUNTEER: "volunteer",
  INFLUENCER: "influencer",
  TEAM_CAPTAIN: "team",
  CORPORATE_MANAGER: "corporate",
  SCHOOL_COORDINATOR: "school",
  SPONSOR: "sponsor",
  VENDOR: "vendor",
  TOURISM_PARTNER: "tourism",
};

export const audienceForRole = (role?: string | null): AudienceId | undefined => (role ? ROLE_AUDIENCE[role] : undefined);

export interface JourneyProgress {
  /** Number of leading steps that are complete. */
  done: number;
  total: number;
  /** Index of the step to do next (the last step once everything is done). */
  currentIndex: number;
  percent: number;
}

/**
 * How far along the journey a user is, from what the account itself tells us.
 * Steps count as complete from the start of the journey until the first one that is not satisfied.
 */
export function journeyProgress(journey: Journey, user: ProgressUser | null): JourneyProgress {
  const state = {
    account: Boolean(user),
    registered: Boolean(user?.role) && user?.status !== "PENDING_ONBOARDING",
    approved: user?.status === "ACTIVE",
  };
  let done = 0;
  for (const step of journey.steps) {
    if (step.completeWhen && state[step.completeWhen]) done += 1;
    else break;
  }
  const total = journey.steps.length;
  return { done, total, currentIndex: Math.min(done, total - 1), percent: Math.round((done / total) * 100) };
}
