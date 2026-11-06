import type { Product, Size } from "./types";

export function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function firstPriced(sizes: Size[]): Size | undefined {
  return sizes.find((s) => typeof s.price === "number" && s.price > 0);
}

/** "$5.85 / 75g" or "Ask in store". */
export function priceLabel(p: Pick<Product, "sizes">): { text: string; asked: boolean } {
  const s = firstPriced(p.sizes);
  if (!s) return { text: "Ask in store", asked: true };
  return { text: `${money(s.price as number)} / ${s.label}`, asked: false };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? "1" : ""}${digits}`;
}

export function smsHref(phone: string, body: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = `+${digits.length === 10 ? "1" : ""}${digits}`;
  return `sms:${num}?&body=${encodeURIComponent(body)}`;
}

/** Coffee category labels shown on chips and tags. */
export const COFFEE_CHIPS: { key: string; label: string; match: (p: Product) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "seasonal", label: "Seasonal", match: (p) => p.category === "Seasonal" || p.seasonal },
  { key: "single", label: "Single origin", match: (p) => p.category === "Single origin" },
  { key: "blends", label: "Blends", match: (p) => p.category === "Blend" },
  { key: "flavoured", label: "Flavoured", match: (p) => p.category === "Flavoured" },
  { key: "decaf", label: "Decaf", match: (p) => p.category === "Decaf" },
];

export const TEA_CHIPS: { key: string; label: string; match: (p: Product) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "seasonal", label: "Seasonal", match: (p) => p.category === "Seasonal" || p.seasonal },
  { key: "black", label: "Black", match: (p) => p.category === "Black" },
  { key: "earl", label: "Earl Grey", match: (p) => p.category === "Earl Grey" },
  { key: "green", label: "Green", match: (p) => p.category === "Green" },
  { key: "oolong", label: "Oolong", match: (p) => p.category === "Oolong" },
  { key: "chai", label: "Chai", match: (p) => p.category === "Chai" },
  { key: "rooibos", label: "Rooibos", match: (p) => p.category === "Rooibos" },
  { key: "fruit", label: "Fruit", match: (p) => p.category === "Fruit" },
  { key: "iced", label: "Iced", match: (p) => p.category === "Iced" },
];

/** Colour class suffix for the coffee-bag art. */
export function bagTone(p: Pick<Product, "type" | "category">): string {
  if (p.type === "tea") return "Tea";
  switch (p.category) {
    case "Seasonal":
      return "Seasonal";
    case "Single origin":
      return "Single";
    case "Blend":
      return "Blends";
    case "Flavoured":
      return "Flavoured";
    case "Decaf":
      return "Decaf";
    default:
      return "Single";
  }
}

export function categoryTag(p: Pick<Product, "type" | "category" | "seasonal">): string {
  if (p.type === "tea") return p.category === "Seasonal" ? "Seasonal · loose leaf" : `${p.category} · loose leaf`;
  if (p.category === "Seasonal") return "Rotating lot";
  if (p.category === "Blend") return "House blend";
  return p.category;
}
