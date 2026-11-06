import { slugify } from "./format";
import type { HomePage, Product, SiteSettings, TeaCategory } from "./types";

/**
 * Starting content. The seed script writes this into Sanity once. The site also
 * falls back to it if Sanity has nothing yet, so a fresh deploy is never blank.
 * Once content exists in Sanity, Sanity always wins.
 */

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "Hamley's Tea & Coffee Co.",
  phone: "(705) 719-1008",
  address: "190 Minet's Point Rd, Barrie, ON L4N 8J8",
  mapLink: "https://www.google.com/maps/dir/?api=1&destination=190+Minet%27s+Point+Rd+Barrie+ON",
  hours: [
    { day: "monday", open: "09:00", close: "18:00" },
    { day: "tuesday", open: "09:00", close: "18:00" },
    { day: "wednesday", open: "09:00", close: "18:00" },
    { day: "thursday", open: "09:00", close: "18:00" },
    { day: "friday", open: "09:00", close: "18:00" },
    { day: "saturday", open: "09:00", close: "16:00" },
    { day: "sunday", closed: true },
  ],
  holidays: [],
  pickupEnabled: true,
  googleRating: 4.9,
  googleReviewCount: 150,
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=Hamley%27s+Tea+%26+Coffee+Barrie",
  instagramUrl: "https://www.instagram.com/hamleys_tea_and_coffee/",
  tickerLines: [
    "Roasted in Barrie since 2005",
    "80+ loose-leaf teas",
    "Order ahead, pick up on Minet's Point",
    "{status}",
    "Fresh ground to your brewer",
  ],
  payments: ["Cash", "Debit", "Visa", "Mastercard", "Gift cards"],
};

export const DEFAULT_HOME: HomePage = {
  heroHeadline: "Roasted down the street. *Steeped by the scoop.*",
  heroSubline:
    "Barrie's coffee roasterie on Minet's Point Road. Small-batch beans, 80+ loose-leaf teas and the gear to brew them, ready for pickup when you are.",
  facts: [
    { title: "Roasted right here", text: "Beans roasted in house, so the bag you take home is fresh." },
    { title: "A wall of 80+ teas", text: "Black, green, oolong, rooibos, chai, fruit and the seasonal ones." },
    { title: "Order ahead, pick up", text: "Pick your beans and grind online, pay when you grab it." },
  ],
  shopHeading: "Pick it here, *grab it* on your way.",
  seasonalHeading: "Fall, *by the cup.*",
  seasonalText: "The rotating lots and seasonal blends. Here while they last.",
  storyHeading: "Family run on Minet's Point *for two decades.*",
  storyText:
    "Hamley's has been roasting coffee and blending tea in south Barrie since 2005. Walk in and the first thing you notice is the smell, then the wall of tins, then someone who can tell you exactly which one you'll like.",
  aboutStory:
    "Hamley's has been roasting coffee and blending tea in south Barrie since 2005. Walk in and the first thing you notice is the smell, then the wall of tins, then someone who can tell you exactly which one you'll like.\n\nWe roast our beans in house on Minet's Point Road, so the bag you take home is fresh. Pick a bean, tell us how you brew, and we grind it to match.\n\nThe tea wall holds more than 80 loose-leaf teas: black, green, oolong, rooibos, chai, fruit and the seasonal ones. Ask for a scoop of whatever sounds good and we will bag it up.\n\nWe are a family run shop, and we like to know what you are making at home. Come in and say hello.",
  stats: [
    { value: "2005", label: "Roasting in Barrie since" },
    { value: "80+", label: "Loose-leaf teas on the wall" },
    { value: "4.9", label: "Stars across 150 Google reviews" },
  ],
  gearLine: "Brewing gear too. Bodum presses and pour-over kits, ground to match.",
  reviewsHeading: "The reviews say it *for us.*",
  reviewThemes: [
    "the smell when you walk in",
    "a huge tea selection",
    "friendly, knows her stuff",
    "fresh roasted beans",
    "family owned",
    "brewing gear to match",
  ],
  visitHeading: "190 Minet's Point Rd, *south Barrie.*",
  visitText: "Come in and smell the tea wall. We'll help you find your cup.",
};

export const DEFAULT_TEA_CATEGORIES: TeaCategory[] = [
  { name: "Black", description: "Bold breakfast cups" },
  { name: "Earl Greys", description: "Bergamot classics" },
  { name: "Green", description: "Light and grassy" },
  { name: "Oolong", description: "Between green and black" },
  { name: "Chai", description: "Spiced and milky" },
  { name: "Rooibos", description: "Caffeine free red bush" },
  { name: "Fruit", description: "Caffeine free, bright" },
  { name: "Iced teas", description: "Made to brew cold" },
];

type SeedProduct = {
  name: string;
  type: "coffee" | "tea";
  category: string;
  seasonal?: boolean;
  sizes: { label: string; price?: number }[];
  description: string;
  /** file in public/images/stock used as the photo when seeding */
  seedPhoto?: string;
};

const COFFEE_DESC = "Roasted in house on Minet's Point Road and ground to your brewer on request.";
const coffee = (name: string, category: string, extra: Partial<SeedProduct> = {}): SeedProduct => ({
  name,
  type: "coffee",
  category,
  sizes: [{ label: "1 lb" }],
  description: category === "Seasonal" ? `${COFFEE_DESC} A rotating lot, here while it lasts.` : COFFEE_DESC,
  ...extra,
});

export const SEED_PRODUCTS: SeedProduct[] = [
  coffee("Cuban Peaberry", "Seasonal"),
  coffee("Nepal Mount Everest", "Seasonal"),
  coffee("Nicaragua Peaberry", "Seasonal"),
  coffee("Kenya Tembo AA", "Seasonal"),
  coffee("Brazilian Peaberry", "Seasonal", { seasonal: true }),
  coffee("Peru Organic Fair Trade", "Single origin"),
  coffee("Monsoon Malabar", "Single origin"),
  coffee("Guatemala Antigua", "Single origin"),
  coffee("Brazil", "Single origin"),
  coffee("Cottage Blend", "Blend"),
  coffee("Galapagos Blend", "Blend"),
  coffee("French Roast", "Blend"),
  coffee("Italian Roast", "Blend"),
  coffee("Holiday Grog", "Flavoured", { seasonal: true }),
  coffee("Toffee", "Flavoured"),
  coffee("Swiss Water Decaf", "Decaf"),
  {
    name: "Pumpkin Spice",
    type: "tea",
    category: "Seasonal",
    seasonal: true,
    sizes: [{ label: "75g", price: 5.85 }],
    description: "A seasonal loose-leaf tea. Scooped and weighed at the counter, 75g at a time.",
    seedPhoto: "seasonal-pumpkin-tea.webp",
  },
  {
    name: "Maple Butter Tart",
    type: "tea",
    category: "Seasonal",
    seasonal: true,
    sizes: [{ label: "75g", price: 5.85 }],
    description: "A seasonal loose-leaf tea. Scooped and weighed at the counter, 75g at a time.",
    seedPhoto: "seasonal-autumn-tea.webp",
  },
];

/** Same data as the seed, shaped like what the site reads from Sanity. */
export const DEFAULT_PRODUCTS: Product[] = SEED_PRODUCTS.map((p) => ({
  _id: `default-${slugify(p.name)}`,
  name: p.name,
  slug: slugify(p.name),
  type: p.type,
  category: p.category,
  photo: null,
  description: p.description,
  sizes: p.sizes.map((s) => ({ label: s.label, price: s.price ?? null })),
  seasonal: !!p.seasonal,
  inStock: true,
  featured: false,
}));
