/**
 * Event-wide settings used by the API.
 * The web app keeps a display copy in frontend/src/lib/event.ts. Keep both in sync.
 */

/** Race day (YYYY-MM-DD, IST). Override with RACE_DATE. */
export function raceDate(): string {
  return (process.env.RACE_DATE ?? '2027-11-21').trim();
}

/** Age on race day, used for the minimum-age rule and age categories. */
export function ageOnRaceDay(dob: Date): number {
  const [y, m, d] = raceDate().split('-').map(Number);
  let age = y - dob.getUTCFullYear();
  const monthDiff = m - 1 - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && d < dob.getUTCDate())) age--;
  return Math.max(0, age);
}

/** Categories with chip timing, official results and start-wave seeding. */
export const TIMED_DISTANCES = ['42.2 KM', '21.1 KM', '10 KM'];

export function isTimedDistance(distance: string): boolean {
  return TIMED_DISTANCES.includes(distance);
}

/**
 * Volunteer check-in is open from 3 days before race day until the day after (IST),
 * covering expo, setup, race day and teardown. VOLUNTEER_CHECKIN_ALWAYS_OPEN=true opens it for testing.
 */
export function isVolunteerCheckInOpen(now = new Date()): boolean {
  if ((process.env.VOLUNTEER_CHECKIN_ALWAYS_OPEN ?? '').trim().toLowerCase() === 'true') return true;
  const raceDayStart = new Date(`${raceDate()}T00:00:00+05:30`).getTime();
  const day = 24 * 60 * 60 * 1000;
  const t = now.getTime();
  return t >= raceDayStart - 3 * day && t < raceDayStart + 2 * day;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const INCIDENT_TYPES = ['MEDICAL', 'SECURITY', 'LOST_PERSON', 'COURSE_HAZARD', 'HYDRATION', 'CROWD', 'OTHER'];
export const INCIDENT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const INCIDENT_STATUSES = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'];
export const DUTY_STATUSES = ['OFF_DUTY', 'ON_DUTY', 'ON_BREAK'];
export const RESULT_STATUSES = ['FINISHED', 'DNF', 'DNS', 'DSQ'];
