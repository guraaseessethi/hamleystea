import { GEO, siteUrl } from "./site";
import { DAY_KEYS, type Product, type SiteSettings } from "./types";

const SCHEMA_DAY: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export function localBusinessLd(s: SiteSettings, imageUrl?: string) {
  const digits = s.phone.replace(/\D/g, "");
  const parts = s.address.split(",").map((p) => p.trim());
  const [street, city, regionPostal] = [parts[0], parts[1], parts[2] ?? ""];
  const [region, ...postal] = regionPostal.split(" ");
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${siteUrl()}/#business`,
    name: s.name,
    url: siteUrl(),
    image: imageUrl ?? `${siteUrl()}/opengraph-image.jpg`,
    telephone: `+1${digits}`,
    servesCuisine: "Coffee, Tea",
    priceRange: "$",
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: city,
      addressRegion: region,
      postalCode: postal.join(" "),
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: GEO.lat, longitude: GEO.lng },
    openingHoursSpecification: DAY_KEYS.flatMap((d) => {
      const h = s.hours.find((x) => x.day === d);
      if (!h || h.closed || !h.open || !h.close) return [];
      return [{ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAY[d], opens: h.open, closes: h.close }];
    }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(s.googleRating),
      reviewCount: String(s.googleReviewCount),
      bestRating: "5",
    },
    sameAs: [s.instagramUrl],
    paymentAccepted: s.payments.join(", "),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl()}${it.path}`,
    })),
  };
}

export function productLd(p: Product, imageUrl?: string) {
  const priced = p.sizes.filter((s) => typeof s.price === "number" && s.price > 0);
  const offers = priced.map((s) => ({
    "@type": "Offer",
    url: `${siteUrl()}/shop/${p.slug}`,
    priceCurrency: "CAD",
    price: (s.price as number).toFixed(2),
    name: s.label,
    availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    seller: { "@type": "Organization", name: "Hamley's Tea & Coffee Co." },
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || `${p.name}, ${p.type === "tea" ? "loose-leaf tea" : "fresh roasted coffee"} from Hamley's in Barrie.`,
    category: p.category,
    brand: { "@type": "Brand", name: "Hamley's Tea & Coffee Co." },
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
  };
}
