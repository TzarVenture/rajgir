export interface SupportFaq {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answer: string;
}

export const RUNNER_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "expo", label: "Bib & Expo Kit" },
  { id: "timing", label: "RFID Timing" },
  { id: "course", label: "Course & Safety" },
  { id: "category", label: "Upgrades" },
  { id: "billing", label: "Billing & GST" },
  { id: "logistics", label: "Bag Drop & Corrals" },
] as const;

export const SUPPORT_TOPICS = [
  { id: "BIB_EXPO", label: "Bib & Kit Pickup at Expo" },
  { id: "CATEGORY_CHANGE", label: "Category Upgrade / Transfer" },
  { id: "MEDICAL_UPDATE", label: "Medical & Emergency Details" },
  { id: "BILLING_GST", label: "Billing, Receipt & GST Invoice" },
  { id: "RACE_DAY_LOGISTICS", label: "Race Morning, Corrals & Bag Drop" },
  { id: "OTHER", label: "Other General Enquiry" },
] as const;

export const RUNNER_SUPPORT_TOPICS = SUPPORT_TOPICS;

export const VOLUNTEER_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "shift", label: "Shifts & Reporting" },
  { id: "kit", label: "Badge & Uniform" },
  { id: "meals", label: "Meals & Transport" },
  { id: "safety", label: "Safety & First Aid" },
  { id: "cert", label: "Certificate & Hours" },
] as const;

export const VOLUNTEER_SUPPORT_TOPICS = [
  { id: "SHIFT_ALLOCATION", label: "Shift Timing & Station Allocation" },
  { id: "KIT_UNIFORM", label: "Crew T-Shirt & Kit Collection" },
  { id: "MEALS_TRANSPORT", label: "Duty Meals & Transport Assistance" },
  { id: "CERTIFICATE_ATTENDANCE", label: "Certificate & Service Hours Verification" },
  { id: "INCIDENT_ESCALATION", label: "Incident Desk & Field Coordination" },
  { id: "OTHER", label: "Other Crew Inquiries" },
] as const;

export const RUNNER_FAQS: SupportFaq[] = [
  {
    id: "faq-expo-docs",
    category: "expo",
    categoryLabel: "Bib & Kit Pickup",
    question: "What documents do I need to collect my race bib and kit?",
    answer:
      "To collect your kit at the Marathon Expo, bring your Digital Bib Pass with QR code (on your mobile device or printed) along with an original government-issued photo ID (Aadhaar, Passport, Voter ID, or Driving Licence).",
  },
  {
    id: "faq-expo-proxy",
    category: "expo",
    categoryLabel: "Bib & Kit Pickup",
    question: "Can someone else collect my race kit on my behalf?",
    answer:
      "Yes. An authorized representative may collect your kit provided they present: 1) A signed authorization letter from you, 2) A photocopy of your government photo ID, and 3) Their own original government photo ID.",
  },
  {
    id: "faq-expo-morning",
    category: "expo",
    categoryLabel: "Bib & Kit Pickup",
    question: "Can I collect my bib and kit on race morning?",
    answer:
      "Strictly no. There is no bib or kit distribution on race morning under any circumstances. All kits must be collected during the Marathon Expo days at the designated expo venue.",
  },
  {
    id: "faq-timing-rfid",
    category: "timing",
    categoryLabel: "Race Timing",
    question: "How does the RFID timing chip work?",
    answer:
      "For timed distances (Full Marathon, Half Marathon, 10K), an RFID timing chip is affixed behind your bib. Do not fold, bend, or pierce the chip. Net timing starts when you cross the start mat and stops when you cross the finish line.",
  },
  {
    id: "faq-course-hydration",
    category: "course",
    categoryLabel: "Course & Safety",
    question: "Where are water, electrolyte and medical stations situated?",
    answer:
      "Hydration and energy stations are positioned every 2.5 km along the course. FastAid medical booths with basic life support (BLS) and ambulances are stationed every 5 km and at the start/finish arena.",
  },
  {
    id: "faq-category-upgrade",
    category: "category",
    categoryLabel: "Category & Transfers",
    question: "Can I upgrade or downgrade my race distance?",
    answer:
      "Category changes are subject to slot availability. Submit a ticket under 'Category Upgrade / Transfer' at least 14 days prior to expo opening. Fee differences apply for upgrades.",
  },
  {
    id: "faq-billing-invoice",
    category: "billing",
    categoryLabel: "Billing & Invoices",
    question: "How do I get an official GST tax invoice for corporate reimbursement?",
    answer:
      "Navigate to the 'Invoice & Certificate' section in your runner dashboard to preview and click 'Print Invoice' for an official GST-compliant breakdown including SAC codes and tax percentages.",
  },
  {
    id: "faq-logistics-bagdrop",
    category: "logistics",
    categoryLabel: "Race Morning Logistics",
    question: "Is there a baggage counter / bag drop available at the venue?",
    answer:
      "Yes, a secure baggage counter is provided at the start arena. Affix your baggage baggage tag provided in your kit. Please avoid storing valuables, jewelry, or expensive electronics.",
  },
];

export const VOLUNTEER_FAQS: SupportFaq[] = [
  {
    id: "v-faq-shift-reporting",
    category: "shift",
    categoryLabel: "Shifts & Reporting",
    question: "When and where should I report for my volunteer shift?",
    answer:
      "Report to your assigned station (or the Volunteer Central Desk at the Rajgir International Convention Centre) 45 minutes prior to your shift start time. Your Sector Supervisor will conduct attendance muster, distribute radios, and hand over your station deployment pack.",
  },
  {
    id: "v-faq-kit-briefing",
    category: "kit",
    categoryLabel: "Badge & Uniform",
    question: "When and where do I collect my crew accreditation badge and volunteer kit?",
    answer:
      "All volunteer crew passes, official event T-shirts, reflective high-visibility vests, and ID lanyards are issued during the mandatory Volunteer Briefing session at RICC. Carry a government photo ID and your digital volunteer pass on your phone.",
  },
  {
    id: "v-faq-checkin-process",
    category: "shift",
    categoryLabel: "Shifts & Reporting",
    question: "How do I check in and check out of my volunteer shift?",
    answer:
      "Open your volunteer dashboard on your phone and go to 'Duty & Shift Control'. Tap 'Check In for Shift' when you reach your station. When your relief crew arrives and your shift concludes, tap 'Check Out' to record your verified service hours.",
  },
  {
    id: "v-faq-meals-transport",
    category: "meals",
    categoryLabel: "Meals & Transport",
    question: "Are meals, drinking water, and transport provided during duty?",
    answer:
      "Yes. Packed breakfast/meal packets and continuous hydration supplies are delivered directly to every course and stadium station. Official crew shuttle buses depart starting from 04:00 AM on race day from Rajgir Railway Station and Central Bus Stand.",
  },
  {
    id: "v-faq-medical-emergency",
    category: "safety",
    categoryLabel: "Safety & First Aid",
    question: "What is the emergency protocol if a runner collapses or needs urgent medical attention?",
    answer:
      "Stay calm and immediately contact the Medical SOS line (+91 94310 99999) or signal the nearest FastAid mobile motorcycle marshal. Protect the runner from course traffic, do not attempt to move someone with suspected spinal injury, and log the dispatch under the 'Incident Desk' tab.",
  },
  {
    id: "v-faq-cert-download",
    category: "cert",
    categoryLabel: "Certificate & Hours",
    question: "How and when do I download my official Certificate of Appreciation?",
    answer:
      "Your Certificate of Appreciation with recorded service hours is automatically generated and downloadable under the 'Accreditation Pass' section once race day operations conclude and your shift checkout is verified by the coordinator.",
  },
  {
    id: "v-faq-station-change",
    category: "shift",
    categoryLabel: "Shifts & Reporting",
    question: "Can I request a change in my assigned duty station or role?",
    answer:
      "Station deployments are engineered around runner safety and medical coverage. If you have mobility limitations or urgent family constraints, please submit a ticket under 'Shift Timing & Station Allocation' at least 5 days prior to race day.",
  },
  {
    id: "v-faq-supervisor-contact",
    category: "safety",
    categoryLabel: "Safety & First Aid",
    question: "Who is my direct point of contact on race day?",
    answer:
      "Your assigned Sector Supervisor's name and mobile number are displayed on your 'Duty & Shift Control' dashboard and digital crew pass. In case of lost contact, the Central Race Control desk can be reached at +91 94310 12345.",
  },
];

export const INFLUENCER_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "pass", label: "Media Pass & Access" },
  { id: "deliverables", label: "Deliverables & Clearance" },
  { id: "promo", label: "Promo Codes & Tracking" },
  { id: "equipment", label: "Drones & Camera Gear" },
  { id: "interviews", label: "Interviews & Press Conf" },
] as const;

export const INFLUENCER_SUPPORT_TOPICS = [
  { id: "PRESS_PASS", label: "Media Pass & VIP Zone Clearance" },
  { id: "DRONE_EQUIPMENT", label: "Drone & Camera Equipment Clearance" },
  { id: "DELIVERABLES_CONTENT", label: "Campaign Deliverables & Clearance" },
  { id: "PROMO_AFFILIATE", label: "Custom Creator Promo Code" },
  { id: "ATHLETE_INTERVIEWS", label: "Elite Runner / VIP Interview Request" },
  { id: "OTHER", label: "Other PR & Media Inquiry" },
] as const;

export const INFLUENCER_FAQS: SupportFaq[] = [
  {
    id: "inf-faq-pass-pickup",
    category: "pass",
    categoryLabel: "Media Pass & Access",
    question: "When and where do I collect my official Media Accreditation Pass?",
    answer:
      "Official Media Passes, VIP lanyards, and creator welcome kits can be collected from the Press Registration Desk at the Rajgir International Convention Centre (RICC) during the Marathon Expo (Friday & Saturday, 10:00 AM – 06:00 PM). Please present your digital creator pass QR code and valid photo ID.",
  },
  {
    id: "inf-faq-filming-zones",
    category: "pass",
    categoryLabel: "Media Pass & Access",
    question: "What filming zones am I authorized to access on race morning?",
    answer:
      "Accredited creators have access to: 1) Media Lounge at Start/Finish Arena, 2) Elevated Finish Line Photo Gantry, 3) Mixed Media Zone for runner interviews, and 4) Dedicated press trucks along the course route (first-come reservation basis).",
  },
  {
    id: "inf-faq-drone-permit",
    category: "equipment",
    categoryLabel: "Drones & Camera Gear",
    question: "Can I fly a drone or use heavy cinema camera rigs along the course?",
    answer:
      "Drone flights require prior DGCA clearance and local administration permits. If you intend to operate a drone, submit a ticket under 'Drone & Camera Equipment Clearance' at least 10 days before race day with your UIN and remote pilot certificate.",
  },
  {
    id: "inf-faq-promo-code",
    category: "promo",
    categoryLabel: "Promo Codes & Tracking",
    question: "How does my creator promo code work and how do I track usage?",
    answer:
      "Your exclusive code gives your followers 10% off registration fees across all timed categories. Live registration usage and referral milestones can be monitored directly in the 'Brand Kit & Promo Code' section of your creator dashboard.",
  },
  {
    id: "inf-faq-mandatory-tags",
    category: "deliverables",
    categoryLabel: "Deliverables & Clearance",
    question: "What are the mandatory hashtags and account tags for race coverage?",
    answer:
      "All sponsored posts and reels must include: #RajgirMarathon2027 #RunThroughHistory #ExploreBihar and tag official handles @rajgirmarathon and @bihartourism. Paid partnership labels must be enabled on Instagram and YouTube as per standard ASA/ASCI guidelines.",
  },
  {
    id: "inf-faq-deliverables-submission",
    category: "deliverables",
    categoryLabel: "Deliverables & Clearance",
    question: "How do I submit my published content links for campaign clearance?",
    answer:
      "Navigate to the 'Campaign Deliverables' tab on your dashboard. Click 'Submit Post Link' next to the corresponding milestone (Course Preview, Unboxing, Race Day Story, or Recap) and paste your public video URL for immediate PR verification.",
  },
  {
    id: "inf-faq-athlete-interviews",
    category: "interviews",
    categoryLabel: "Interviews & Press Conf",
    question: "Can I schedule exclusive 1-on-1 interviews with elite international athletes?",
    answer:
      "Yes. A limited number of 10-minute media slots are scheduled post-race at the RICC Press Room. Submit an interview request via the PR helpdesk with your channel reach and question themes by race week Wednesday.",
  },
  {
    id: "inf-faq-media-lounge",
    category: "pass",
    categoryLabel: "Media Pass & Access",
    question: "What amenities are provided in the Race Day Media Lounge?",
    answer:
      "The Creator & Media Lounge features high-speed Wi-Fi, camera charging stations, lockable gear cubbies, hot coffee, refreshments, and direct live feed feeds from course timing checkpoints.",
  },
];
