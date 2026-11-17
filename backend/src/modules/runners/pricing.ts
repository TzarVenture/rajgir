/**
 * Authoritative race categories, add-ons and coupons.
 * The server computes every price; amounts sent by the browser are never trusted.
 * (The web app keeps a display copy in frontend/src/lib/schemas/runnerRegistration.ts. Keep both in sync.)
 */
export interface RaceCategory {
  distance: string;
  title: string;
  fee: number;
  minAge: number;
}

export const RACE_CATEGORIES: RaceCategory[] = [
  { distance: '42.2 KM', title: 'Full Heritage Marathon', fee: 1999, minAge: 18 },
  { distance: '21.1 KM', title: 'Half Marathon', fee: 1499, minAge: 18 },
  { distance: '10 KM', title: 'Rajgir Hill Challenge', fee: 999, minAge: 15 },
  { distance: '5 KM', title: 'Heritage Dream Run', fee: 699, minAge: 10 },
  { distance: '3 KM', title: 'Family & Kids Fun Run', fee: 499, minAge: 5 },
];

export interface Addon {
  id: string;
  title: string;
  price: number;
}

export const ADDONS: Addon[] = [
  { id: 'hoodie', title: 'Official Rajgir Marathon Finisher Hoodie', price: 899 },
  { id: 'transit_patna', title: 'Patna Junction AC Shuttle (Round-Trip)', price: 350 },
  { id: 'transit_gaya', title: 'Gaya Airport/Jn. AC Shuttle (Round-Trip)', price: 300 },
  { id: 'pasta_party', title: 'Carb-Load Pasta Dinner Buffet (Race Eve)', price: 450 },
];

export interface PriceQuote {
  category: RaceCategory;
  addons: Addon[];
  gross: number;
  discount: number;
  net: number;
  coupon: string | null;
}

export function quotePrice(distance: string, addonIds: string[] = [], couponInput?: string): PriceQuote | null {
  const category = RACE_CATEGORIES.find((c) => c.distance === distance);
  if (!category) return null;

  const addons = [...new Set(addonIds)]
    .map((id) => ADDONS.find((a) => a.id === id))
    .filter((a): a is Addon => Boolean(a));

  const gross = category.fee + addons.reduce((sum, a) => sum + a.price, 0);

  const coupon = (couponInput ?? '').trim().toUpperCase();
  let discount = 0;
  if (coupon === 'RAJGIR100') discount = Math.round(gross * 0.1);
  else if (coupon === 'EARLYBIRD') discount = 200;

  return {
    category,
    addons,
    gross,
    discount,
    net: Math.max(1, gross - discount),
    coupon: discount > 0 ? coupon : null,
  };
}
