/**
 * Visitor guide content for the Tourism page.
 * PROVISIONAL: places are real Rajgir landmarks, but distances, prices and partner listings are placeholders
 * until tourism partners are onboarded (see /register/tourism). Replace with API data later.
 */

export interface Place {
  name: string;
  blurb: string;
  tag: string;
}

export const TEMPLES_AND_SIGHTS: Place[] = [
  { name: "Vishwa Shanti Stupa", blurb: "Gleaming white peace pagoda on Ratnagiri Hill; the marathon start and finish line.", tag: "Race venue" },
  { name: "Griddhakuta (Vulture Peak)", blurb: "Where the Buddha is said to have taught the Lotus Sutra. A short, scenic climb.", tag: "Buddhist heritage" },
  { name: "Cyclopean Wall", blurb: "Remains of a roughly 2,500-year-old fortification of ancient Magadha.", tag: "Ancient history" },
  { name: "Venu Vana and Karanda Tank", blurb: "Bamboo grove and pond associated with the Buddha's stay in Rajgir.", tag: "Buddhist heritage" },
  { name: "Brahma Kund hot springs", blurb: "Natural hot springs and temples, visited by pilgrims for centuries.", tag: "Pilgrimage" },
  { name: "Nalanda ruins", blurb: "UNESCO World Heritage site of the ancient university, about 12 km away.", tag: "UNESCO site" },
];

export const ADVENTURE: Place[] = [
  { name: "Rajgir ropeway", blurb: "Chairlift up to the Vishwa Shanti Stupa with valley views.", tag: "Easy" },
  { name: "Glass bridge and nature safari", blurb: "Zoo safari and the glass bridge in the forest reserve.", tag: "Family" },
  { name: "Hill trekking", blurb: "Trails across the five hills of Rajgir; best in the early morning.", tag: "Moderate" },
];

export interface Listing {
  name: string;
  category: string;
  distance: string;
  note: string;
}

export const HOTELS: Listing[] = [
  { name: "Heritage stay partners (to be announced)", category: "Hotel / Resort", distance: "Within 3 km of start", note: "Runner discount codes arrive with partner onboarding." },
  { name: "Budget lodges and guest houses", category: "Budget", distance: "Rajgir town", note: "Book early: race weekend is peak season." },
  { name: "Patna and Gaya hotels", category: "City hotels", distance: "~100 km", note: "Use the airport and station shuttles below." },
];

export const RESTAURANTS: Listing[] = [
  { name: "Litti chokha and Bihari thali", category: "Local cuisine", distance: "Rajgir market", note: "The classic pre-race carb meal is a lighter thali; save litti for after." },
  { name: "Race-eve pasta dinner", category: "Official event", distance: "Expo venue", note: "Available as an add-on at registration." },
  { name: "Tea and snack stalls", category: "Snacks", distance: "Near Kund Ground", note: "Open early on race morning." },
];

export interface Transport {
  mode: string;
  route: string;
  detail: string;
}

export const GETTING_HERE: Transport[] = [
  { mode: "Air", route: "Patna (PAT) or Gaya (GAY) airport", detail: "About 2 to 2.5 hours by road to Rajgir. Official AC shuttles run from both." },
  { mode: "Train", route: "Rajgir station, or Gaya / Patna Junction", detail: "Rajgir has a direct station; Patna Junction and Gaya Jn. are the main hubs." },
  { mode: "Road", route: "Patna - Bakhtiyarpur - Rajgir", detail: "Around 100 km by road. Buses and local taxis available." },
  { mode: "Local", route: "Auto, e-rickshaw and taxi", detail: "Fares are fixed per route at the stand; confirm before boarding." },
];

export const PACKAGES = [
  { name: "Runner weekend", nights: "2 nights", includes: ["Hotel stay", "Airport / station shuttle", "Pasta dinner", "Guided Stupa visit"], status: "Partner pricing coming soon" },
  { name: "Family and heritage", nights: "3 nights", includes: ["Hotel stay", "Nalanda and Rajgir tour guide", "Ropeway tickets", "Local taxi"], status: "Partner pricing coming soon" },
];

export const EMERGENCY = [
  { label: "National emergency", number: "112" },
  { label: "Ambulance", number: "108" },
  { label: "Police", number: "100" },
  { label: "Women helpline", number: "1091" },
];
