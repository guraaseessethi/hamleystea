import "server-only";
import { readClient } from "./client";
import {
  DEFAULT_HOME,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  DEFAULT_TEA_CATEGORIES,
} from "../defaults";
import type { HomePage, Post, Product, SiteSettings, TeaCategory } from "../types";

/** Every read is tagged by document type so /api/revalidate can refresh the right pages. */
export const TAGS = {
  settings: "siteSettings",
  home: "homePage",
  product: "product",
  tea: "teaCategory",
  post: "post",
} as const;

async function sanityFetch<T>(
  query: string,
  tag: string,
  params: Record<string, unknown> = {},
  fresh = false,
): Promise<T | null> {
  try {
    // `next` is the Next.js fetch cache option, passed through by @sanity/client.
    // `fresh` skips the cache: the order API must never price from stale data.
    return await readClient.fetch<T>(query, params, fresh ? undefined : ({ next: { tags: [tag], revalidate: 3600 } } as never));
  } catch (err) {
    console.error(`Sanity fetch failed (${tag})`, err instanceof Error ? err.message : err);
    return null;
  }
}

const IMG = `{..., asset->{_id, url, metadata{lqip, dimensions}}}`;

/** Drops null/undefined so defaults fill any field the owner left empty. */
function clean<T extends object>(obj: T | null | undefined): Partial<T> {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)),
  ) as Partial<T>;
}

export async function getSettings(opts: { fresh?: boolean } = {}): Promise<SiteSettings> {
  const doc = await sanityFetch<SiteSettings>(
    `*[_id == "siteSettings"][0]{name, phone, address, mapLink, hours, holidays, pickupEnabled, notificationEmail, googleRating, googleReviewCount, googleReviewsUrl, instagramUrl, tickerLines, payments}`,
    TAGS.settings,
    {},
    opts.fresh,
  );
  const merged = { ...DEFAULT_SETTINGS, ...clean(doc) };
  if (doc && doc.pickupEnabled === false) merged.pickupEnabled = false;
  return merged;
}

export async function getHome(): Promise<HomePage> {
  const doc = await sanityFetch<HomePage>(
    `*[_id == "homePage"][0]{heroHeadline, heroSubline, heroImage${IMG}, facts, shopHeading, seasonalHeading, seasonalText, storyHeading, storyText, storyImage${IMG}, aboutStory, aboutImage${IMG}, stats, gearLine, reviewsHeading, reviewThemes, visitHeading, visitText, visitImage${IMG}}`,
    TAGS.home,
  );
  return { ...DEFAULT_HOME, ...clean(doc) };
}

const PRODUCT_PROJECTION = `{
  _id, name, "slug": slug.current, type,
  "category": coalesce(coffeeCategory, teaCategory, ""),
  "photo": photo${IMG},
  "description": shortDescription,
  "sizes": coalesce(sizes[]{label, price}, []),
  "seasonal": coalesce(seasonal, false),
  "inStock": coalesce(inStock, true),
  "featured": coalesce(featured, false)
}`;

export async function getProducts(): Promise<Product[]> {
  const docs = await sanityFetch<Product[]>(
    `*[_type == "product" && defined(slug.current)] | order(orderRank asc, _createdAt asc) ${PRODUCT_PROJECTION}`,
    TAGS.product,
  );
  if (!docs || docs.length === 0) return DEFAULT_PRODUCTS;
  return docs;
}

/** Uncached lookup used by the order API to re-price items. Falls back to defaults only if Sanity has no products yet. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const docs = await sanityFetch<Product[]>(
    `*[_type == "product" && slug.current in $slugs] ${PRODUCT_PROJECTION}`,
    TAGS.product,
    { slugs },
    true,
  );
  if (docs && docs.length > 0) return docs;
  return DEFAULT_PRODUCTS.filter((p) => slugs.includes(p.slug));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getTeaCategories(): Promise<TeaCategory[]> {
  const docs = await sanityFetch<TeaCategory[]>(
    `*[_type == "teaCategory"] | order(order asc, _createdAt asc){_id, name, "description": coalesce(description, "")}`,
    TAGS.tea,
  );
  if (!docs || docs.length === 0) return DEFAULT_TEA_CATEGORIES;
  return docs;
}

export async function getPosts(): Promise<Post[]> {
  const docs = await sanityFetch<Post[]>(
    `*[_type == "post" && defined(slug.current)] | order(date desc){_id, title, "slug": slug.current, date, excerpt, "cover": cover${IMG}}`,
    TAGS.post,
  );
  return docs ?? [];
}

export async function getPost(slug: string): Promise<Post | null> {
  const doc = await sanityFetch<Post>(
    `*[_type == "post" && slug.current == $slug][0]{_id, title, "slug": slug.current, date, excerpt, "cover": cover${IMG}, body}`,
    TAGS.post,
    { slug },
  );
  return doc;
}
