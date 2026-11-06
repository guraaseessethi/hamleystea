import type { MetadataRoute } from "next";
import { getPosts, getProducts } from "@/lib/sanity/data";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, posts] = await Promise.all([getProducts(), getPosts()]);
  const now = new Date();
  const fixed = ["", "/coffee", "/tea", "/shop", "/about", "/visit"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? ("weekly" as const) : ("monthly" as const),
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...(posts.length ? [{ url: `${base}/journal`, lastModified: now, priority: 0.5 }] : []),
    ...posts.map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: new Date(p.date), priority: 0.4 })),
  ];
}
