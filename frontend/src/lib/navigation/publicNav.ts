import { AUDIENCES } from "./audiences";
import type { NavIconKey } from "./icons";
import type { NavNode, NavPhase, NavStatus } from "./types";

/**
 * Public site map, following PRD section 3 (Information Architecture) and the modules behind each entry
 * (sections 8-11, 12, 14, 18, 19 and 9). Single source of truth for the header, footer, breadcrumbs,
 * placeholder pages and the /wip platform map.
 *
 * To turn a placeholder into a real page: create the page file at the same path (static routes win over
 * the generated placeholder), then set `existing: true` and `status: "live" | "partial"` here.
 */

type Row = [slug: string, title: string, description: string, icon: NavIconKey, status?: NavStatus, phase?: NavPhase, extra?: Partial<NavNode>];

function kids(base: string, rows: Row[]): NavNode[] {
  return rows.map(([slug, title, description, icon, status = "planned", phase = "MVP", extra]) => ({
    path: `${base}/${slug}`,
    title,
    description,
    icon,
    status,
    phase,
    ...extra,
  }));
}

export const PUBLIC_NAV: NavNode[] = [
  {
    path: "/",
    title: "Home",
    description: "Hero banner, race countdown, upcoming events, statistics and featured sections.",
    icon: "home",
    status: "partial",
    existing: true,
    features: ["Hero banner", "Event video", "Register CTA", "Countdown", "Event highlights", "Statistics", "Featured sections: Tourism, Hotels, Sponsors, News, Gallery, Testimonials"],
  },
  {
    path: "/about",
    title: "About",
    description: "The story of the Rajgir Marathon, the organizers, the heritage course and the partners behind the event.",
    icon: "info",
    status: "planned",
    children: kids("/about", [
      ["the-event", "The Event", "History, vision and what makes Rajgir Marathon special.", "flag"],
      ["organizers", "Organizers & Team", "The people and organisations running the marathon.", "users"],
      ["course", "Course & Route", "Route map, elevation, km markers and aid stations.", "map"],
      ["rules", "Rules & Policies", "Race rules, refund policy, cut-off times and terms.", "scroll"],
    ]),
  },
  {
    path: "/how-it-works",
    title: "How it works",
    description: "A step-by-step flow for every kind of participant: runner, volunteer, team, company, school, sponsor, vendor, tourism partner, creator, media and visitor.",
    icon: "flow",
    status: "live",
    existing: true,
    children: AUDIENCES.map((a) => ({
      path: `/how-it-works/${a.id}`,
      title: `${a.title} journey`,
      description: a.tagline,
      icon: a.icon,
      status: "live" as const,
      existing: true,
    })),
  },
  {
    path: "/race-day",
    title: "Race Day",
    description: "Everything for race weekend: schedule, kit collection, parking and road closures, spectator guide and weather.",
    icon: "flag",
    status: "planned",
    features: ["Timeline from expo to finish", "Start waves and gun times", "Kit collection", "Parking and road closures", "Spectator viewing points", "Weather and heat advisories"],
    children: kids("/race-day", [
      ["schedule", "Schedule & Start Times", "Expo hours, briefing and start waves per distance.", "shift"],
      ["kit-collection", "Kit Collection", "Where, when and what to bring (QR + photo ID).", "shirt"],
      ["parking", "Parking & Road Closures", "Shuttles, parking and closed roads on race morning.", "parking"],
      ["spectators", "Spectator Guide", "Best viewing points and how to follow runners.", "users"],
      ["weather", "Weather & Conditions", "Forecast and heat advisories for race weekend.", "weather"],
    ]),
  },
  {
    path: "/race-categories",
    title: "Race Categories",
    description: "Marathon, Half Marathon, 10K, 5K and Kids Run with fees, age limits and start times.",
    icon: "flag",
    status: "partial",
    href: "/#categories",
    features: ["Marathon", "Half Marathon", "10K", "5K", "Kids Run"],
  },
  {
    path: "/register",
    title: "Register",
    description: "Choose how you want to take part and complete the registration journey.",
    icon: "registration",
    status: "live",
    existing: true,
    children: [
      { path: "/register/runner", title: "Runner", description: "Individual race registration with bib and QR pass.", icon: "activity", status: "live", href: "/register/runner" },
      { path: "/register/team", title: "Team / Running Club", description: "Group registrations for clubs and teams.", icon: "users", status: "live", href: "/register/team" },
      { path: "/register/corporate", title: "Corporate", description: "Employee registrations in bulk with GST invoices.", icon: "building", status: "live", href: "/register/corporate" },
      { path: "/register/school", title: "School", description: "Student contingent registrations.", icon: "school", status: "live", href: "/register/school" },
      { path: "/register/volunteer", title: "Volunteer", description: "Join the race-day crew.", icon: "heart", status: "live", href: "/register/volunteer" },
      { path: "/register/sponsor", title: "Sponsor", description: "Sponsorship enquiries and registration.", icon: "handshake", status: "live", href: "/register/sponsor" },
      { path: "/register/vendor", title: "Expo / Food Vendor", description: "Book a stall at the expo.", icon: "store", status: "live", href: "/register/vendor" },
      { path: "/register/tourism", title: "Tourism Partner", description: "Hotels, transport and guides.", icon: "hotel", status: "live", href: "/register/tourism" },
      { path: "/register/influencer", title: "Influencer / Creator", description: "Campaign creators and media partners.", icon: "camera", status: "live", href: "/register/influencer" },
    ],
  },
  {
    path: "/training",
    title: "Training",
    description: "Training plans, nutrition, hydration, calculators and videos to get race-ready.",
    icon: "training",
    status: "partial",
    existing: true,
    features: ["AI Coach", "Training Plans", "Nutrition", "Hydration", "BMI Calculator", "Pace Calculator", "Training Videos", "Stretching Guide"],
    children: kids("/training", [
      ["ai-coach", "AI Coach", "Personalised guidance that adapts to your progress.", "brain", "planned", "Phase 2"],
      ["plans", "Training Plans", "Beginner to advanced plans for every distance.", "calendar", "partial", "MVP", { href: "/training" }],
      ["nutrition", "Nutrition", "Race-week and daily fuelling guidance.", "food", "partial", "MVP", { href: "/training" }],
      ["hydration", "Hydration", "Hydration plans for training and race day.", "hydration", "partial", "MVP", { href: "/training" }],
      ["bmi-calculator", "BMI Calculator", "Check BMI and healthy range.", "calculator", "partial", "MVP", { href: "/training" }],
      ["pace-calculator", "Pace Calculator", "Convert goal time to pace and splits.", "calculator", "partial", "MVP", { href: "/training" }],
      ["videos", "Training Videos", "Coaching, form and strength videos.", "video", "planned"],
      ["stretching-guide", "Stretching Guide", "Warm-up and recovery routines.", "dumbbell", "partial", "MVP", { href: "/training" }],
    ]),
  },
  {
    path: "/community",
    title: "Community",
    description: "Running clubs, challenges, leaderboards and conversations around the Rajgir Marathon.",
    icon: "community",
    status: "planned",
    phase: "Phase 2",
    features: ["Running Clubs", "Follow Users", "Messaging", "Discussion Forum", "Events", "Challenges", "Leaderboards", "Comments", "Likes", "Achievements", "Badges", "Referral Program"],
    children: [
      ...kids("/community", [
        ["clubs", "Running Clubs", "Find and join clubs, or manage yours.", "users", "planned", "Phase 2"],
        ["members", "Runners & Follows", "Discover runners and follow friends.", "heart", "planned", "Phase 2"],
        ["forum", "Discussion Forum", "Topics, questions and race stories.", "chat", "planned", "Phase 2"],
        ["events", "Community Events", "Group runs, meetups and shake-out runs.", "calendar", "planned", "Phase 2"],
        ["challenges", "Challenges", "Distance and streak challenges.", "target", "planned", "Phase 2"],
        ["leaderboards", "Leaderboards", "Club and challenge rankings.", "trophy", "planned", "Phase 2"],
        ["achievements", "Achievements & Badges", "Milestones, badges and rewards.", "star", "planned", "Phase 2"],
        ["referral", "Referral Program", "Invite friends and earn rewards.", "gift", "planned", "MVP"],
      ]),
      { path: "/join", title: "Join the community", description: "Community and partners hub.", icon: "community", status: "live", href: "/join" },
    ],
  },
  {
    path: "/tourism",
    title: "Tourism",
    description: "Plan your Rajgir trip: hotels, transport, packages, guides, food and heritage sites.",
    icon: "compass",
    status: "partial",
    existing: true,
    features: ["Hotels", "Transport", "Flight Booking", "Train Booking", "Bus Booking", "Local Taxi", "Packages", "Tour Guide", "Restaurants", "Emergency Services", "Temple Visits", "Adventure Activities"],
    children: kids("/tourism", [
      ["hotels", "Hotels", "Where to stay, with booking for runners.", "hotel", "partial", "MVP", { href: "/tourism#hotels" }],
      ["transport", "Transport", "Getting to and around Rajgir, shuttles from Patna and Gaya.", "train", "partial", "MVP", { href: "/tourism#travel" }],
      ["flights", "Flight Booking", "Flights to Patna and Gaya.", "plane", "planned", "Phase 2"],
      ["trains", "Train Booking", "Trains to Rajgir and nearby stations.", "train", "planned", "Phase 2"],
      ["buses", "Bus Booking", "Bus services to Rajgir.", "bus", "planned", "Phase 2"],
      ["taxi", "Local Taxi", "Book local cabs and auto services.", "taxi", "planned"],
      ["packages", "Packages", "Race-weekend travel packages.", "package", "partial", "MVP", { href: "/tourism#packages" }],
      ["guides", "Tour Guides", "Certified heritage guides.", "users", "planned"],
      ["restaurants", "Restaurants", "Local food and eating options.", "food", "partial", "MVP", { href: "/tourism#food" }],
      ["emergency", "Emergency Services", "Hospitals, police and helplines.", "sos", "partial", "MVP", { href: "/tourism#emergency" }],
      ["temples", "Temple Visits", "Temples and Buddhist heritage sites.", "landmark", "partial", "MVP", { href: "/tourism#sights" }],
      ["adventure", "Adventure Activities", "Ropeway, glass bridge, trekking and more.", "mountain", "partial", "MVP", { href: "/tourism#adventure" }],
    ]),
  },
  {
    path: "/expo",
    title: "Expo",
    description: "The marathon expo: vendors, booths, product launches, schedule and venue map.",
    icon: "store",
    status: "planned",
    features: ["Vendor Directory", "Booth Booking", "Product Launch", "Schedule", "Maps", "QR Check-in", "Orders"],
    children: kids("/expo", [
      ["vendors", "Vendor Directory", "Exhibitors and food stalls at the expo.", "store"],
      ["booths", "Booth Booking", "Book a booth or stall.", "boxes"],
      ["product-launch", "Product Launch", "Launch your product at the expo.", "brand", "planned", "MVP"],
      ["schedule", "Expo Schedule", "Timings, talks and activities.", "calendar"],
      ["map", "Venue Map", "Floor plan and directions.", "map"],
      ["check-in", "QR Check-in", "Entry and kit collection check-in.", "qr"],
      ["orders", "Orders", "Pre-orders and expo purchases.", "orders"],
    ]),
  },
  {
    path: "/sponsors",
    title: "Sponsors",
    description: "Meet our sponsors and partner with the Rajgir Marathon.",
    icon: "handshake",
    status: "planned",
    features: ["Sponsor Registration", "Proposal Request", "Packages"],
    children: [
      ...kids("/sponsors", [
        ["partners", "Our Sponsors", "Title, hydration, recovery and apparel partners.", "star"],
        ["packages", "Sponsorship Packages", "Tiers, benefits and visibility.", "package"],
        ["proposal", "Request a Proposal", "Get a tailored sponsorship proposal.", "document"],
      ]),
      { path: "/sponsors/become-a-sponsor", title: "Become a sponsor", description: "Register as a sponsor.", icon: "handshake", status: "live", href: "/register/sponsor" },
    ],
  },
  {
    path: "/volunteer",
    title: "Volunteer",
    description: "Join the race-day crew: roles, requirements, training and how to apply.",
    icon: "heart",
    status: "planned",
    features: ["Volunteer Registration", "Verification", "Training", "Attendance", "Task Assignment", "Live Chat", "Emergency Alerts", "Certificates", "Ratings"],
    children: [
      ...kids("/volunteer", [
        ["roles", "Roles & Tasks", "Hydration, marshalling, medical and logistics roles.", "checklist"],
        ["training", "Volunteer Training", "Briefings and field SOPs.", "sop"],
        ["faq", "Volunteer FAQ", "Eligibility, shifts and certificates.", "faq"],
      ]),
      { path: "/volunteer/apply", title: "Apply to volunteer", description: "Volunteer application.", icon: "heart", status: "live", href: "/register/volunteer" },
    ],
  },
  {
    path: "/media",
    title: "Media",
    description: "Press releases, downloads, photos, videos, live streaming and media accreditation.",
    icon: "media",
    status: "planned",
    features: ["Press Releases", "Downloads", "Photos", "Videos", "Live Streaming", "Media Registration"],
    children: kids("/media", [
      ["press-releases", "Press Releases", "Official announcements.", "news"],
      ["downloads", "Press Kit & Downloads", "Logos, fact sheets and brand assets.", "download"],
      ["photos", "Photos", "Official event photography.", "photos"],
      ["videos", "Videos", "Highlights and promotional videos.", "video"],
      ["live-stream", "Live Streaming", "Watch the race live.", "radio", "planned", "Phase 2"],
      ["register", "Media Registration", "Apply for press accreditation.", "pass"],
    ]),
  },
  {
    path: "/results",
    title: "Results",
    description: "Live timing, split times, leaderboards, certificates, photos and personal records.",
    icon: "trophy",
    status: "planned",
    features: ["Live Timing", "Split Timing", "Leaderboards", "Certificates", "Photos", "Videos", "Personal Records"],
    children: kids("/results", [
      ["live", "Live Timing", "Follow runners in real time.", "radio"],
      ["splits", "Split Timing", "Checkpoint and split times.", "splits"],
      ["leaderboards", "Leaderboards", "Overall, gender and age-group rankings.", "trophy"],
      ["certificates", "Certificates", "Download your finisher certificate.", "certificate"],
      ["photos", "Race Photos", "Find your photos by bib number.", "photos"],
      ["videos", "Race Videos", "Finish-line and highlight videos.", "video"],
      ["records", "Personal Records", "Your history and best times.", "target"],
    ]),
  },
  {
    path: "/blog",
    title: "Blog",
    description: "News, race stories, training tips and updates from the organizers.",
    icon: "news",
    status: "planned",
  },
  {
    path: "/support",
    title: "Support",
    description: "Help centre, contact the organizers and track your support tickets.",
    icon: "help",
    status: "partial",
    children: [
      { path: "/support/contact", title: "Contact Organizers", description: "Email and contact form.", icon: "mail", status: "live", href: "/contact" },
      ...kids("/support", [
        ["faq", "FAQ", "Answers to common questions.", "faq"],
        ["tickets", "My Support Tickets", "Raise and track tickets.", "ticket"],
      ]),
    ],
  },
  {
    path: "/legal",
    title: "Legal",
    description: "Terms, privacy, refund policy and the participant waiver.",
    icon: "scroll",
    status: "planned",
    children: kids("/legal", [
      ["terms", "Terms & Conditions", "Terms of using the platform and registering.", "scroll"],
      ["privacy", "Privacy Policy", "How personal and medical data is handled (GDPR / DPDP).", "shield"],
      ["refund-policy", "Refund & Transfer Policy", "Cancellations, refunds, bib transfers and deferrals.", "payment"],
      ["waiver", "Participant Waiver", "Indemnity and medical fitness declaration.", "document"],
    ]),
  },
  {
    path: "/login",
    title: "Login",
    description: "Sign in to your Rajgir Marathon account.",
    icon: "key",
    status: "live",
    existing: true,
  },
];

/** Footer columns (5, like the header journey stages). Links are plain hrefs so the footer never shows a dead entry. */
export const FOOTER_GROUPS: { title: string; links: { title: string; href: string }[] }[] = [
  {
    title: "Participate",
    links: [
      { title: "Register as a runner", href: "/register/runner" },
      { title: "Team / running club", href: "/register/team" },
      { title: "Company registration", href: "/register/corporate" },
      { title: "School registration", href: "/register/school" },
      { title: "Volunteer with us", href: "/register/volunteer" },
      { title: "Creator programme", href: "/register/influencer" },
      { title: "How it works", href: "/how-it-works" },
    ],
  },
  {
    title: "Race & Train",
    links: [
      { title: "Race categories", href: "/#categories" },
      { title: "Race-day guide", href: "/race-day" },
      { title: "Kit collection", href: "/race-day/kit-collection" },
      { title: "Training plans", href: "/training" },
      { title: "Results", href: "/results" },
      { title: "Live timing", href: "/results/live" },
    ],
  },
  {
    title: "Plan Your Trip",
    links: [
      { title: "Tourism guide", href: "/tourism" },
      { title: "Hotels", href: "/tourism#hotels" },
      { title: "Getting here", href: "/tourism#travel" },
      { title: "Packages", href: "/tourism#packages" },
      { title: "Temples & heritage", href: "/tourism#sights" },
      { title: "Emergency services", href: "/tourism#emergency" },
    ],
  },
  {
    title: "Partners & Media",
    links: [
      { title: "Become a sponsor", href: "/register/sponsor" },
      { title: "Sponsorship packages", href: "/sponsors/packages" },
      { title: "Expo & vendors", href: "/expo" },
      { title: "Book a stall", href: "/register/vendor" },
      { title: "Tourism partners", href: "/register/tourism" },
      { title: "Press & media", href: "/media" },
    ],
  },
  {
    title: "Help & Legal",
    links: [
      { title: "Support", href: "/support" },
      { title: "FAQ", href: "/support/faq" },
      { title: "Contact organizers", href: "/contact" },
      { title: "Terms & conditions", href: "/legal/terms" },
      { title: "Privacy policy", href: "/legal/privacy" },
      { title: "Refund policy", href: "/legal/refund-policy" },
    ],
  },
];

export function flattenPublic(nodes: NavNode[] = PUBLIC_NAV): NavNode[] {
  return nodes.flatMap((n) => [n, ...flattenPublic(n.children ?? [])]);
}

export function findPublicNode(path: string): NavNode | undefined {
  return flattenPublic().find((n) => n.path === path);
}

/** Ancestors (including the node itself) from the top-level module down. */
export function publicTrail(path: string, nodes: NavNode[] = PUBLIC_NAV, acc: NavNode[] = []): NavNode[] | null {
  for (const n of nodes) {
    const next = [...acc, n];
    if (n.path === path) return next;
    if (n.children) {
      const found = publicTrail(path, n.children, next);
      if (found) return found;
    }
  }
  return null;
}
