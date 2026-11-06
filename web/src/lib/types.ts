export type DayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export const DAY_KEYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export interface HoursDay {
  day: DayKey;
  closed?: boolean;
  /** "09:00" */
  open?: string;
  /** "18:00" */
  close?: string;
}

export interface SanityImage {
  asset?: { _id?: string; url?: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } };
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
}

export interface SiteSettings {
  name: string;
  phone: string;
  address: string;
  mapLink: string;
  hours: HoursDay[];
  /** YYYY-MM-DD */
  holidays: string[];
  pickupEnabled: boolean;
  notificationEmail?: string;
  googleRating: number;
  googleReviewCount: number;
  googleReviewsUrl: string;
  instagramUrl: string;
  tickerLines: string[];
  payments: string[];
}

export interface Fact {
  title: string;
  text: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface HomePage {
  heroHeadline: string;
  heroSubline: string;
  heroImage?: SanityImage;
  facts: Fact[];
  shopHeading: string;
  seasonalHeading: string;
  seasonalText: string;
  storyHeading: string;
  storyText: string;
  storyImage?: SanityImage;
  aboutStory: string;
  aboutImage?: SanityImage;
  stats: Stat[];
  gearLine: string;
  reviewsHeading: string;
  reviewThemes: string[];
  visitHeading: string;
  visitText: string;
  visitImage?: SanityImage;
}

export interface TeaCategory {
  _id?: string;
  name: string;
  description: string;
}

export type ProductType = "coffee" | "tea" | "gear";

export interface Size {
  label: string;
  price?: number | null;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  type: ProductType;
  category: string;
  photo?: SanityImage | null;
  description?: string;
  sizes: Size[];
  seasonal: boolean;
  inStock: boolean;
  featured: boolean;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  cover?: SanityImage | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[];
}

export const GRINDS = ["Whole bean", "Drip", "Espresso", "French press", "Pour over"] as const;
export type Grind = (typeof GRINDS)[number];

export interface BagLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  type: ProductType;
  category: string;
  sizeLabel: string;
  /** display only, the server always re-prices from Sanity */
  unitPrice: number | null;
  grind?: Grind;
  qty: number;
}
