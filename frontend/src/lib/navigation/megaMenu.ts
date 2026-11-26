import type { NavIconKey } from "./icons";
import type { NavStatus } from "./types";

/**
 * Header mega menus (main bar, row 2). Together they cover the whole project by journey stage:
 * Race > Participate > Training > Plan Your Trip > Community > Partners > Results & Media.
 * "Participate" is rendered from AUDIENCES ("I am a...") instead of columns.
 */
export interface MegaLink {
  title: string;
  description: string;
  href: string;
  icon: NavIconKey;
  status: NavStatus;
}

export interface MegaColumn {
  title: string;
  links: MegaLink[];
}

export interface MegaMenu {
  id: string;
  label: string;
  icon: NavIconKey;
  /** One line under the menu title: what this stage of the journey is about. */
  blurb: string;
  /** Render the "I am a..." audience grid instead of link columns. */
  audiences?: boolean;
  columns: MegaColumn[];
  featured: { title: string; description: string; href: string; cta: string };
}

const l = (title: string, href: string, icon: NavIconKey, description: string, status: NavStatus = "planned"): MegaLink => ({ title, href, icon, description, status });

export const MEGA_MENUS: MegaMenu[] = [
  {
    id: "race",
    label: "Race",
    icon: "flag",
    blurb: "Distances, course and everything about race day.",
    columns: [
      {
        title: "The race",
        links: [
          l("Race categories", "/#categories", "flag", "42.2K, 21.1K, 10K, 5K and Kids Run with fees.", "partial"),
          l("Course & route", "/about/course", "map", "Route map, elevation and aid stations."),
          l("Race-day guide", "/race-day", "calendar", "Timeline from kit collection to finish."),
          l("Schedule & start times", "/race-day/schedule", "shift", "Start waves and expo hours."),
          l("Kit collection", "/race-day/kit-collection", "shirt", "Where and when to collect your bib kit."),
        ],
      },
      {
        title: "Know before you go",
        links: [
          l("Rules & policies", "/about/rules", "scroll", "Cut-offs, refunds and race rules."),
          l("Weather & conditions", "/race-day/weather", "weather", "Forecast and heat advisories."),
          l("Parking & road closures", "/race-day/parking", "parking", "Reach the start without stress."),
          l("Spectator guide", "/race-day/spectators", "users", "Best places to cheer."),
          l("FAQ", "/support/faq", "faq", "Answers to common questions."),
        ],
      },
    ],
    featured: { title: "Ready to run?", description: "Pick your distance and register in minutes.", href: "/register/runner", cta: "Register as a runner" },
  },
  {
    id: "participate",
    label: "Participate",
    icon: "users",
    blurb: "Tell us who you are and we will show you the way.",
    audiences: true,
    columns: [],
    featured: { title: "New here? See how it works", description: "A step-by-step flow for every kind of participant.", href: "/how-it-works", cta: "How it works" },
  },
  {
    id: "train",
    label: "Training",
    icon: "training",
    blurb: "Plans, tools and guidance to get race-ready.",
    columns: [
      {
        title: "Plans & coaching",
        links: [
          l("Training plans", "/training", "calendar", "Beginner to advanced plans for every distance.", "partial"),
          l("AI coach", "/training/ai-coach", "brain", "Personalised guidance that adapts to you."),
          l("Training videos", "/training/videos", "video", "Form, strength and recovery videos."),
          l("Stretching guide", "/training", "dumbbell", "Warm-up and recovery routines.", "partial"),
        ],
      },
      {
        title: "Tools & nutrition",
        links: [
          l("Pace calculator", "/training", "calculator", "Goal time to pace and splits.", "partial"),
          l("BMI calculator", "/training", "calculator", "Check your healthy range.", "partial"),
          l("Nutrition", "/training", "food", "Daily and race-week fuelling.", "partial"),
          l("Hydration", "/training", "hydration", "Hydration plans for training and race day.", "partial"),
        ],
      },
    ],
    featured: { title: "Your race, your plan", description: "Sign in to follow a plan on your runner dashboard.", href: "/dashboard/runner/training", cta: "Open my training plan" },
  },
  {
    id: "trip",
    label: "Plan Your Trip",
    icon: "compass",
    blurb: "Stay, travel and explore Rajgir around race weekend.",
    columns: [
      {
        title: "Stay & travel",
        links: [
          l("Hotels", "/tourism#hotels", "hotel", "Where to stay near the start line.", "partial"),
          l("Getting here", "/tourism#travel", "train", "Airport, station and shuttle options.", "partial"),
          l("Flights, trains & buses", "/tourism/flights", "plane", "Book travel to Patna, Gaya and Rajgir."),
          l("Local taxi", "/tourism/taxi", "taxi", "Cabs and autos around Rajgir."),
          l("Race-weekend packages", "/tourism#packages", "package", "Stay + transfer + sightseeing bundles.", "partial"),
        ],
      },
      {
        title: "Explore Rajgir",
        links: [
          l("Temples & heritage", "/tourism#sights", "landmark", "Ancient Buddhist and Jain sites.", "partial"),
          l("Adventure activities", "/tourism#adventure", "mountain", "Ropeway, glass bridge, trekking.", "partial"),
          l("Restaurants & local food", "/tourism#food", "food", "Where to eat in Rajgir.", "partial"),
          l("Tour guides", "/tourism/guides", "users", "Certified heritage guides."),
          l("Emergency services", "/tourism#emergency", "sos", "Hospitals, police and helplines.", "partial"),
        ],
      },
    ],
    featured: { title: "Make it a trip", description: "Hotels, transport and temple visits in one place.", href: "/tourism", cta: "Open the tourism guide" },
  },
  {
    id: "experience",
    label: "Community",
    icon: "community",
    blurb: "Community, expo and stories around the marathon.",
    columns: [
      {
        title: "Community",
        links: [
          l("Running clubs", "/community/clubs", "users", "Find or manage a club."),
          l("Discussion forum", "/community/forum", "chat", "Questions, stories and tips."),
          l("Community events", "/community/events", "calendar", "Group runs and meetups."),
          l("Challenges & leaderboards", "/community/challenges", "target", "Streaks, distance and club rankings."),
          l("Referral programme", "/community/referral", "gift", "Invite friends and earn rewards."),
        ],
      },
      {
        title: "Expo & stories",
        links: [
          l("Expo overview", "/expo", "store", "Exhibitors, launches and activities."),
          l("Vendor directory", "/expo/vendors", "boxes", "Who is exhibiting."),
          l("Expo schedule & map", "/expo/schedule", "map", "Timings and floor plan."),
          l("Blog & news", "/blog", "news", "Updates and race stories."),
          l("Community & partners hub", "/join", "community", "Join the community.", "live"),
        ],
      },
    ],
    featured: { title: "Run with others", description: "Clubs, challenges and the expo make race week.", href: "/community", cta: "Explore the community" },
  },
  {
    id: "partners",
    label: "Partners",
    icon: "handshake",
    blurb: "Sponsors, vendors, tourism partners and media.",
    columns: [
      {
        title: "Sponsors",
        links: [
          l("Our sponsors", "/sponsors/partners", "star", "Brands behind the marathon."),
          l("Sponsorship packages", "/sponsors/packages", "package", "Tiers, benefits and visibility."),
          l("Request a proposal", "/sponsors/proposal", "document", "Get a tailored proposal."),
          l("Become a sponsor", "/register/sponsor", "handshake", "Register your brand.", "live"),
        ],
      },
      {
        title: "Expo & tourism partners",
        links: [
          l("Book a stall", "/register/vendor", "store", "Expo and food-stall registration.", "live"),
          l("Booth booking", "/expo/booths", "boxes", "Choose a booth and pay."),
          l("Product launch", "/expo/product-launch", "brand", "Launch at the expo."),
          l("Become a tourism partner", "/register/tourism", "hotel", "Hotels, transport and guides.", "live"),
        ],
      },
      {
        title: "Media & creators",
        links: [
          l("Press accreditation", "/media/register", "pass", "Apply for a press pass."),
          l("Press releases", "/media/press-releases", "news", "Official announcements."),
          l("Press kit & downloads", "/media/downloads", "download", "Logos, fact sheets and photos."),
          l("Creator programme", "/register/influencer", "camera", "Campaigns for influencers.", "live"),
        ],
      },
    ],
    featured: { title: "Partner with Rajgir", description: "Reach thousands of runners, families and visitors.", href: "/sponsors", cta: "Explore partnerships" },
  },
  {
    id: "results",
    label: "Results & Media",
    icon: "trophy",
    blurb: "Live timing, certificates, photos and press.",
    columns: [
      {
        title: "Results",
        links: [
          l("Live timing", "/results/live", "radio", "Follow runners in real time."),
          l("Split timing", "/results/splits", "splits", "Checkpoint and split times."),
          l("Leaderboards", "/results/leaderboards", "trophy", "Overall, gender and age group."),
          l("Certificates", "/results/certificates", "certificate", "Download your finisher certificate."),
          l("Personal records", "/results/records", "target", "Your history and best times."),
        ],
      },
      {
        title: "Photos, video & press",
        links: [
          l("Race photos", "/results/photos", "photos", "Find yourself by bib number."),
          l("Race videos", "/results/videos", "video", "Finish-line and highlight videos."),
          l("Live stream", "/media/live-stream", "radio", "Watch the race live."),
          l("Press releases", "/media/press-releases", "news", "Official announcements."),
          l("Media downloads", "/media/downloads", "download", "Press kit and assets."),
        ],
      },
    ],
    featured: { title: "Find your result", description: "Search by bib number once the race is finished.", href: "/results", cta: "Open results" },
  },
];

/** Links that stay visible in the utility bar. */
export const UTILITY_LINKS: { title: string; href: string }[] = [
  { title: "How it works", href: "/how-it-works" },
  { title: "FAQ", href: "/support/faq" },
  { title: "Support", href: "/contact" },
];
