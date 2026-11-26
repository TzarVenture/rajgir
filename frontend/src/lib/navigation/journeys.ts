import type { AudienceId } from "./audiences";
import type { NavIconKey } from "./icons";
import type { NavPhase, NavStatus } from "./types";

/**
 * End-to-end flow per audience: what happens, in order, from first visit to the finished event.
 * One list powers the how-it-works pages, the dashboard journey tracker, the flow map and search.
 *
 * `completeWhen` ties a step to what we can know about the signed-in user without extra API calls:
 *  - account:    signed in
 *  - registered: finished the registration form (status is not PENDING_ONBOARDING)
 *  - approved:   account is ACTIVE (organizers approved it, or approval was instant)
 * Steps without it are in the future (event days, results...).
 */
export type JourneyCondition = "account" | "registered" | "approved";

export interface JourneyStep {
  title: string;
  description: string;
  icon: NavIconKey;
  href: string;
  status: NavStatus;
  phase?: NavPhase;
  completeWhen?: JourneyCondition;
}

export interface Journey {
  audience: AudienceId;
  headline: string;
  summary: string;
  steps: JourneyStep[];
}

const s = (
  title: string,
  description: string,
  icon: NavIconKey,
  href: string,
  status: NavStatus,
  completeWhen?: JourneyCondition,
  phase: NavPhase = "MVP"
): JourneyStep => ({ title, description, icon, href, status, completeWhen, phase });

export const JOURNEYS: Record<AudienceId, Journey> = {
  runner: {
    audience: "runner",
    headline: "From first look to finisher certificate",
    summary: "Pick a distance, register, pay, get your digital bib, collect your kit, run, then download your result and certificate.",
    steps: [
      s("Discover the race", "See the five distances, fees, age limits and the heritage course.", "flag", "/#categories", "partial", "account"),
      s("Create your account", "Sign up with email and verify it. One account, one role.", "key", "/signup", "live", "account"),
      s("Register & choose your race", "Category, T-shirt size, add-ons (hoodie, shuttle, pasta dinner) and coupon code.", "registration", "/register/runner", "live", "registered"),
      s("Medical & emergency details", "Blood group, medical notes and emergency contact for race-day safety.", "medical", "/dashboard/runner/medical", "live", "registered"),
      s("Pay securely", "UPI, cards and net banking with a GST receipt. Online gateway is being integrated.", "payment", "/register/runner", "partial", "registered"),
      s("Get your digital bib & QR pass", "Bib number and QR code for kit collection and check-in.", "bib", "/dashboard/runner/bib", "live", "registered"),
      s("Collect your race kit", "Show your QR at the expo kit-collection counter (slot booking planned).", "shirt", "/race-day/kit-collection", "planned"),
      s("Race day", "Start waves, route, aid stations, weather and what to carry.", "flag", "/race-day", "planned"),
      s("Results & certificate", "Live timing, splits, leaderboards, photos and your finisher certificate.", "certificate", "/results", "planned"),
    ],
  },
  volunteer: {
    audience: "volunteer",
    headline: "From application to volunteer certificate",
    summary: "Apply, get approved, train on the field SOPs, check in for your shift and log incidents on race day.",
    steps: [
      s("See the roles", "Hydration, marshalling, medical support, logistics and more.", "checklist", "/volunteer/roles", "planned", "account"),
      s("Create your account", "Sign up with email and verify it.", "key", "/signup", "live", "account"),
      s("Apply to volunteer", "Tell us your availability, skills and T-shirt size.", "registration", "/register/volunteer", "live", "registered"),
      s("Wait for approval", "Organizers review applications and assign your station.", "check", "/dashboard/volunteer/application", "live", "approved"),
      s("Train with the field SOPs", "Read the field manual and complete the briefing.", "sop", "/dashboard/volunteer/sop", "live"),
      s("Shift check-in & checklist", "Check in with your badge, follow the station checklist.", "shift", "/dashboard/volunteer/shift", "live"),
      s("Incident desk & SOS", "Log incidents and raise emergency alerts from your station.", "incidents", "/dashboard/volunteer/incidents", "live"),
      s("Volunteer certificate", "Certificate after verified attendance hours.", "certificate", "/dashboard/volunteer/certificates", "planned"),
    ],
  },
  influencer: {
    audience: "influencer",
    headline: "From application to performance report",
    summary: "Apply as a creator, get your media pass and brand kit, deliver content and track performance.",
    steps: [
      s("Download media assets", "Logos, photos and brand guidelines.", "download", "/media/downloads", "planned", "account"),
      s("Create your account", "Sign up with email and verify it.", "key", "/signup", "live", "account"),
      s("Apply as a creator", "Share your channels, audience and ideas.", "registration", "/register/influencer", "live", "registered"),
      s("Approval", "Organizers review the application.", "check", "/dashboard/influencer/application", "live", "approved"),
      s("Media accreditation pass", "QR pass for expo and race-day media zones.", "pass", "/dashboard/influencer/pass", "live"),
      s("Brand kit & promo code", "Assets and your referral code for followers.", "brand", "/dashboard/influencer/brand-kit", "live"),
      s("Deliver campaign content", "Submit posts and reels against the deliverables list.", "deliverables", "/dashboard/influencer/deliverables", "live"),
      s("Performance & payments", "Clicks, signups, reports and payouts.", "chart", "/dashboard/influencer/reports", "planned", undefined, "Phase 2"),
    ],
  },
  team: {
    audience: "team",
    headline: "From team sign-up to team leaderboard",
    summary: "Captains register the club, add members, pay once and follow the team on race day.",
    steps: [
      s("Explore clubs & challenges", "See what other clubs are doing.", "community", "/community/clubs", "planned", "account", "Phase 2"),
      s("Create the captain account", "Sign up with email and verify it.", "key", "/signup", "live", "account"),
      s("Register your team", "Team name, size and captain details.", "registration", "/register/team", "live", "registered"),
      s("Add members & invitations", "Invite members or add them directly.", "users", "/dashboard/team/members", "planned", "registered"),
      s("Group registration & payment", "Register all members and pay together with one invoice.", "payment", "/dashboard/team/bulk-registration", "planned"),
      s("Bibs & kits for members", "Every member gets a bib and QR pass.", "bib", "/dashboard/team/invoices", "planned"),
      s("Race day", "Start waves, route and meeting point.", "flag", "/race-day", "planned"),
      s("Team leaderboard", "Team and member rankings.", "trophy", "/dashboard/team/leaderboard", "planned"),
    ],
  },
  corporate: {
    audience: "corporate",
    headline: "From company sign-up to CSR report",
    summary: "HR registers the company, uploads employees, pays with GST invoice and receives participation and CSR reports.",
    steps: [
      s("Explore corporate options", "Packages, GST invoicing, CSR and employee challenges.", "building", "/register/corporate", "live", "account"),
      s("Create the HR account", "Sign up with email and verify it.", "key", "/signup", "live", "account"),
      s("Register your company", "Company, GSTIN and contact person.", "registration", "/register/corporate", "live", "registered"),
      s("Approval", "Organizers verify the company.", "check", "/dashboard", "live", "approved"),
      s("Upload employees", "CSV upload with validation report.", "download", "/dashboard/corporate/employees", "planned"),
      s("Bulk registration & GST invoice", "One order, one invoice, employee annexure.", "payment", "/dashboard/corporate/bulk-registration", "planned"),
      s("Race day", "Employees run with bibs and QR passes.", "flag", "/race-day", "planned"),
      s("Reports, certificates & CSR", "Participation reports and employee certificates.", "spreadsheet", "/dashboard/corporate/reports", "planned"),
    ],
  },
  school: {
    audience: "school",
    headline: "From school sign-up to student certificates",
    summary: "Coordinators register the school, upload students with guardian consent, and teachers track the contingent.",
    steps: [
      s("Explore school participation", "Categories for students and Kids Run.", "school", "/register/school", "live", "account"),
      s("Create the coordinator account", "Sign up with email and verify it.", "key", "/signup", "live", "account"),
      s("Register your school", "Institution and coordinator details.", "registration", "/register/school", "live", "registered"),
      s("Approval", "Organizers verify the institution.", "check", "/dashboard", "live", "approved"),
      s("Upload students & consent", "Student list with guardian consent.", "download", "/dashboard/school/students", "planned"),
      s("Teacher dashboard", "Class-wise roster, consent and payment status.", "school", "/dashboard/school/teachers", "planned"),
      s("Race day", "Kids Run and 5K with teacher supervision.", "flag", "/race-day", "planned"),
      s("Certificates & reports", "Student certificates and school report.", "certificate", "/dashboard/school/certificates", "planned"),
    ],
  },
  sponsor: {
    audience: "sponsor",
    headline: "From enquiry to brand visibility report",
    summary: "Explore packages, request a proposal, register, pay, activate on site and review visibility reports.",
    steps: [
      s("Explore sponsorship", "Who sponsors the marathon and what they get.", "star", "/sponsors", "planned", "account"),
      s("Choose a package", "Title, hydration, recovery, apparel and more.", "package", "/sponsors/packages", "planned", "account"),
      s("Request a proposal", "Tell us your goals and budget.", "document", "/sponsors/proposal", "planned", "account"),
      s("Register as a sponsor", "Brand and contact details.", "registration", "/register/sponsor", "live", "registered"),
      s("Approval", "Organizers review and confirm.", "check", "/dashboard", "live", "approved"),
      s("Contract & payment", "Invoice and payment.", "payment", "/dashboard/sponsor/payments", "planned"),
      s("Activations & campaigns", "Banners, coupons, lead collection and campaigns.", "media", "/dashboard/sponsor/campaigns", "planned"),
      s("Visibility & analytics reports", "Impressions, leads and post-event report.", "chart", "/dashboard/sponsor/visibility", "planned"),
    ],
  },
  vendor: {
    audience: "vendor",
    headline: "From stall booking to settlement",
    summary: "Register, get verified, book a stall, prepare inventory and track sales during the expo.",
    steps: [
      s("Explore the expo", "Vendor directory, schedule and venue map.", "store", "/expo", "planned", "account"),
      s("Register as a vendor", "Business, licences and stall type.", "registration", "/register/vendor", "live", "registered"),
      s("Verification", "FSSAI/GST/PAN document review.", "shield", "/dashboard/vendor/verification", "planned", "approved"),
      s("Book your stall", "Choose a booth and pay.", "boxes", "/dashboard/vendor/stall-booking", "planned"),
      s("Inventory & setup", "Stock list and move-in day.", "package", "/dashboard/vendor/inventory", "planned"),
      s("Expo days: orders & sales", "Orders from runners and daily sales.", "orders", "/dashboard/vendor/sales", "planned"),
      s("Invoices & settlement", "Invoices and settlement.", "invoice", "/dashboard/vendor/invoices", "planned"),
    ],
  },
  tourism: {
    audience: "tourism",
    headline: "From partner sign-up to booking payouts",
    summary: "Register hotels, transport or guides, list rates for race weekend and receive bookings from runners.",
    steps: [
      s("Explore the tourism guide", "How runners find stays, travel and activities.", "compass", "/tourism", "partial", "account"),
      s("Register as a partner", "Business and service details.", "registration", "/register/tourism", "live", "registered"),
      s("Approval", "Organizers review the partner.", "check", "/dashboard", "live", "approved"),
      s("List your services", "Hotels, transport, guides, packages.", "hotel", "/dashboard/tourism/listings", "planned"),
      s("Rates & availability", "Race-weekend rates and room inventory.", "calendar", "/dashboard/tourism/inventory", "planned"),
      s("Receive bookings", "Bookings made during runner registration or on the tourism page.", "bookings", "/dashboard/tourism/bookings", "planned"),
      s("Payouts & invoices", "Settlements from bookings.", "payment", "/dashboard/tourism/payouts", "planned"),
    ],
  },
  media: {
    audience: "media",
    headline: "From accreditation to live coverage",
    summary: "Apply for press accreditation, use the press kit and cover the race with live stream, photos and releases.",
    steps: [
      s("Apply for accreditation", "Outlet, role and equipment.", "pass", "/media/register", "planned"),
      s("Press kit & downloads", "Logos, fact sheets and photos.", "download", "/media/downloads", "planned"),
      s("Press releases", "Official announcements.", "news", "/media/press-releases", "planned"),
      s("Race-day press pass", "QR pass for media zones.", "qr", "/race-day", "planned"),
      s("Live stream & photos", "Live streaming and official photo/video library.", "radio", "/media/live-stream", "planned", undefined, "Phase 2"),
    ],
  },
  visitor: {
    audience: "visitor",
    headline: "Explore, plan your trip and follow the race",
    summary: "No account needed: discover the event, plan your Rajgir visit, find a vantage point and follow results live.",
    steps: [
      s("Explore the event", "What the Rajgir Marathon is and why Rajgir.", "info", "/about", "planned"),
      s("Plan your trip", "Getting to Rajgir, temples, food and adventure.", "compass", "/tourism", "partial"),
      s("Where to stay", "Hotels and race-weekend packages.", "hotel", "/tourism#hotels", "partial"),
      s("Spectator guide", "Best viewing points, parking and road closures.", "map", "/race-day/spectators", "planned"),
      s("Follow runners live", "Live timing by bib number.", "radio", "/results/live", "planned"),
      s("Celebrate results", "Leaderboards, photos and videos.", "trophy", "/results", "planned"),
    ],
  },
};

export const journeyFor = (id: string): Journey | undefined => (JOURNEYS as Record<string, Journey>)[id];

/** Every step href, for tests and search. */
export const allJourneySteps = (): { audience: AudienceId; step: JourneyStep }[] =>
  (Object.values(JOURNEYS) as Journey[]).flatMap((j) => j.steps.map((step) => ({ audience: j.audience, step })));
