import type { SiteSettings } from "./types";

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is live. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Settings safe to send to the browser. The notification email stays on the server. */
export function publicSettings(s: SiteSettings): SiteSettings {
  const rest = { ...s };
  delete rest.notificationEmail;
  return rest;
}

export const GEO = { lat: 44.3704851, lng: -79.6690343 };

export const SEO = {
  home: {
    title: "Hamley's Tea & Coffee | Coffee Roastery in Barrie, ON",
    description:
      "Fresh roasted coffee and 80+ loose-leaf teas on Minet's Point Rd, Barrie. Family owned since 2005. Order ahead for pickup.",
  },
  coffee: {
    title: "Fresh Roasted Coffee Beans in Barrie | Hamley's",
    description:
      "Single origin, blends, flavoured and decaf coffee roasted in Barrie. Ground to order and ready for pickup.",
  },
  tea: {
    title: "Loose Leaf Tea Shop in Barrie | Hamley's",
    description:
      "Over 80 loose-leaf teas: black, green, oolong, chai, rooibos, fruit and seasonal blends. Shop in store or order for pickup.",
  },
  visit: {
    title: "Hours & Directions | Hamley's Tea & Coffee Barrie",
    description: "190 Minet's Point Rd, Barrie. Open Mon to Fri 9 to 6, Sat 9 to 4. Call (705) 719-1008.",
  },
  shop: {
    title: "Shop Coffee and Loose Leaf Tea in Barrie | Hamley's",
    description:
      "Pick your beans and grind, or a scoop of loose-leaf tea, and grab it on your way. Coffee roaster and tea shop on Minet's Point Rd, Barrie.",
  },
  about: {
    title: "Our Roastery | Family Run Coffee Roaster in Barrie | Hamley's",
    description:
      "Hamley's has been roasting coffee and blending tea in south Barrie since 2005. Meet the family run roastery on Minet's Point Road.",
  },
  journal: {
    title: "Journal | Hamley's Tea & Coffee Barrie",
    description: "Seasonal launches and news from the roastery on Minet's Point Road, Barrie.",
  },
};
