import type { NavIconKey } from "./icons";

/**
 * The "I am a…" list: who uses the platform (PRD section 2 roles, plus the public visitor).
 * Drives the Participate mega menu, the mobile drawer, the how-it-works hub and the flow map.
 */
export type AudienceId =
  | "runner"
  | "team"
  | "corporate"
  | "school"
  | "volunteer"
  | "influencer"
  | "media"
  | "sponsor"
  | "vendor"
  | "tourism"
  | "visitor";

export interface Audience {
  id: AudienceId;
  title: string;
  /** One line that says what this person does on the platform. */
  tagline: string;
  icon: NavIconKey;
  /** Where "get started" goes (registration or the first useful page). */
  startHref: string;
  startLabel: string;
  /** PRD role(s) this audience maps to. */
  prdRoles: string[];
  /** Group in the Participate menu. */
  group: "Take part" | "Organisations" | "Partners" | "Follow & visit";
  /** Key pages for this audience (shown in menus and search). */
  links: { title: string; href: string }[];
}

export const AUDIENCES: Audience[] = [
  {
    id: "runner",
    title: "Runner",
    tagline: "Run the 42.2K, 21.1K, 10K, 5K or Kids Run.",
    icon: "activity",
    startHref: "/register/runner",
    startLabel: "Register to run",
    prdRoles: ["Runner"],
    group: "Take part",
    links: [
      { title: "Race categories", href: "/#categories" },
      { title: "Training plans", href: "/training" },
      { title: "Digital bib pass", href: "/dashboard/runner/bib" },
      { title: "Results & certificates", href: "/results" },
    ],
  },
  {
    id: "volunteer",
    title: "Volunteer",
    tagline: "Join the race-day crew.",
    icon: "heart",
    startHref: "/register/volunteer",
    startLabel: "Apply to volunteer",
    prdRoles: ["Volunteer"],
    group: "Take part",
    links: [
      { title: "Roles & tasks", href: "/volunteer/roles" },
      { title: "Volunteer training", href: "/volunteer/training" },
      { title: "Volunteer FAQ", href: "/volunteer/faq" },
    ],
  },
  {
    id: "influencer",
    title: "Influencer / Creator",
    tagline: "Cover and promote the race with campaigns.",
    icon: "camera",
    startHref: "/register/influencer",
    startLabel: "Apply as a creator",
    prdRoles: ["Influencer"],
    group: "Take part",
    links: [
      { title: "Media downloads", href: "/media/downloads" },
      { title: "Campaign dashboard", href: "/dashboard/influencer" },
    ],
  },
  {
    id: "team",
    title: "Team / Running Club",
    tagline: "Register your club or group together.",
    icon: "users",
    startHref: "/register/team",
    startLabel: "Register a team",
    prdRoles: ["Team Captain", "Running Club"],
    group: "Organisations",
    links: [
      { title: "Community clubs", href: "/community/clubs" },
      { title: "Challenges", href: "/community/challenges" },
    ],
  },
  {
    id: "corporate",
    title: "Company",
    tagline: "Register employees in bulk with GST invoicing and CSR.",
    icon: "building",
    startHref: "/register/corporate",
    startLabel: "Register a company",
    prdRoles: ["Corporate"],
    group: "Organisations",
    links: [
      { title: "Bulk registration", href: "/dashboard/corporate/bulk-registration" },
      { title: "Reports", href: "/dashboard/corporate/reports" },
    ],
  },
  {
    id: "school",
    title: "School / College",
    tagline: "Register a student contingent with teacher oversight.",
    icon: "school",
    startHref: "/register/school",
    startLabel: "Register a school",
    prdRoles: ["School"],
    group: "Organisations",
    links: [
      { title: "Student upload", href: "/dashboard/school/students" },
      { title: "Teacher dashboard", href: "/dashboard/school/teachers" },
    ],
  },
  {
    id: "sponsor",
    title: "Sponsor",
    tagline: "Partner with the marathon and measure brand visibility.",
    icon: "handshake",
    startHref: "/register/sponsor",
    startLabel: "Become a sponsor",
    prdRoles: ["Sponsor"],
    group: "Partners",
    links: [
      { title: "Sponsorship packages", href: "/sponsors/packages" },
      { title: "Request a proposal", href: "/sponsors/proposal" },
    ],
  },
  {
    id: "vendor",
    title: "Expo / Food Vendor",
    tagline: "Book a stall and sell at the expo.",
    icon: "store",
    startHref: "/register/vendor",
    startLabel: "Book a stall",
    prdRoles: ["Vendor"],
    group: "Partners",
    links: [
      { title: "Expo overview", href: "/expo" },
      { title: "Booth booking", href: "/expo/booths" },
    ],
  },
  {
    id: "tourism",
    title: "Hotel & Tourism Partner",
    tagline: "List hotels, transport and guides for visiting runners.",
    icon: "hotel",
    startHref: "/register/tourism",
    startLabel: "Become a partner",
    prdRoles: ["Tourism Partner"],
    group: "Partners",
    links: [
      { title: "Tourism guide", href: "/tourism" },
      { title: "Packages", href: "/tourism#packages" },
    ],
  },
  {
    id: "media",
    title: "Media & Press",
    tagline: "Get accredited, download the press kit and cover race day.",
    icon: "media",
    startHref: "/media/register",
    startLabel: "Apply for accreditation",
    prdRoles: ["Media"],
    group: "Follow & visit",
    links: [
      { title: "Press releases", href: "/media/press-releases" },
      { title: "Press kit", href: "/media/downloads" },
      { title: "Live stream", href: "/media/live-stream" },
    ],
  },
  {
    id: "visitor",
    title: "Visitor / Supporter",
    tagline: "Explore Rajgir, plan your trip and follow the race live.",
    icon: "compass",
    startHref: "/tourism",
    startLabel: "Plan your visit",
    prdRoles: ["Guest"],
    group: "Follow & visit",
    links: [
      { title: "Tourism guide", href: "/tourism" },
      { title: "Spectator guide", href: "/race-day/spectators" },
      { title: "Live timing", href: "/results/live" },
    ],
  },
];

export const AUDIENCE_GROUPS: Audience["group"][] = ["Take part", "Organisations", "Partners", "Follow & visit"];

export const findAudience = (id: string): Audience | undefined => AUDIENCES.find((a) => a.id === id);
