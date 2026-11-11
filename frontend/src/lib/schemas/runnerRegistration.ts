import { z } from "zod";

export const raceCategories = [
  {
    distance: "42.2 KM",
    title: "Full Heritage Marathon",
    badge: "Flagship AIMS Timed",
    fee: 1999,
    minAge: 18,
    cutoff: "6 Hours",
    elevation: "Rolling Hills & Valley",
    inclusions: [
      "RFID Timing Chip on Bib",
      "Official Dry-Fit Race Jersey",
      "Heavy Finisher Alloy Medal",
      "Post-Race Hot Recovery Buffet",
      "Verified Digital E-Certificate",
      "On-Route Hydration & Energy Fruits",
    ],
  },
  {
    distance: "21.1 KM",
    title: "Half Marathon",
    badge: "Popular Timed",
    fee: 1499,
    minAge: 18,
    cutoff: "3.5 Hours",
    elevation: "Moderate Scenic Incline",
    inclusions: [
      "RFID Timing Chip on Bib",
      "Official Dry-Fit Race Jersey",
      "Heavy Finisher Alloy Medal",
      "Energy Stations & Electrolytes",
      "Verified Digital E-Certificate",
      "Post-Race Breakfast",
    ],
  },
  {
    distance: "10 KM",
    title: "Rajgir Hill Challenge",
    badge: "Speed Timed Run",
    fee: 999,
    minAge: 15,
    cutoff: "100 Mins",
    elevation: "Forested Heritage Trail",
    inclusions: [
      "RFID Electronic Timing Bib",
      "Official Technical Running Tee",
      "Finisher Souvenir Medal",
      "Post-Race Refreshments",
      "Digital Certificate",
    ],
  },
  {
    distance: "5 KM",
    title: "Heritage Dream Run",
    badge: "Non-Timed / Community",
    fee: 699,
    minAge: 10,
    cutoff: "60 Mins",
    elevation: "Flat Valley Route",
    inclusions: [
      "Official Event T-Shirt",
      "Finisher Souvenir Medal",
      "Participation E-Certificate",
      "Heritage Refreshments",
    ],
  },
  {
    distance: "3 KM",
    title: "Family & Kids Fun Run",
    badge: "Open for All Ages",
    fee: 499,
    minAge: 5,
    cutoff: "45 Mins",
    elevation: "Flat Scenic Circuit",
    inclusions: [
      "Event Participation Tee",
      "Fun Run Medal",
      "Heritage Breakfast Box",
      "Digital Certificate",
    ],
  },
] as const;

export const availableAddons = [
  {
    id: "hoodie",
    title: "Official Rajgir Marathon Finisher Hoodie",
    description: "Premium fleece hoodie with embroidered 2027 heritage crest.",
    price: 899,
  },
  {
    id: "transit_patna",
    title: "Patna Junction AC Shuttle (Round-Trip)",
    description: "Patna Jn. <-> Rajgir Race Village scheduled air-conditioned coach.",
    price: 350,
  },
  {
    id: "transit_gaya",
    title: "Gaya Airport/Jn. AC Shuttle (Round-Trip)",
    description: "Gaya <-> Rajgir Race Village scheduled air-conditioned coach.",
    price: 300,
  },
  {
    id: "pasta_party",
    title: "Carb-Load Pasta Dinner Buffet (Race Eve)",
    description: "Athlete nutritionist-approved pasta & carb buffet on race eve.",
    price: 450,
  },
] as const;

export const runnerRegistrationSchema = z.object({
  // Category
  distance: z.enum(["42.2 KM", "21.1 KM", "10 KM", "5 KM", "3 KM"], {
    errorMap: () => ({ message: "Please select a valid race category" }),
  }),
  raceTitle: z.string().min(1),
  baseFee: z.number().positive(),

  // Personal
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address (e.g. runner@example.com)"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date of birth (YYYY-MM-DD)"),
  ageOnRaceDay: z.number().int().min(5, "Minimum age for the run is 5 years"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Select your gender" }),
  }),

  // Bib & Apparel
  bibName: z
    .string()
    .trim()
    .min(2, "Bib name must be at least 2 characters")
    .max(16, "Bib name cannot exceed 16 characters")
    .regex(/^[A-Za-z0-9 ]+$/, "Only letters, numbers, and spaces allowed on Bib"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    errorMap: () => ({ message: "Select your blood group" }),
  }),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL", "XXL", "3XL"], {
    errorMap: () => ({ message: "Select your T-shirt size" }),
  }),

  // Emergency Contact
  emergencyName: z
    .string()
    .trim()
    .min(2, "Emergency contact name is required"),
  emergencyRelation: z
    .string()
    .trim()
    .min(2, "Emergency contact relation is required"),
  emergencyPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Emergency contact phone must be 10 digits"),
  medicalNotes: z.string().max(500).optional(),

  // Address
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  country: z.string().default("India"),
  runningClub: z.string().max(100).optional(),

  // Addons & Financials
  selectedAddons: z.array(z.string()).default([]),
  grossAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  netAmount: z.number().positive(),
  couponCode: z.string().optional(),

  // Waiver
  waiverAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must accept the event waiver to register" }),
  }),
});

export type RunnerRegistrationInput = z.infer<typeof runnerRegistrationSchema>;

