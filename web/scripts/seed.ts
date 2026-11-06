/**
 * ONE-OFF seed. Delete this file after it has run.
 *
 *   cd web && npx tsx --env-file=.env.local scripts/seed.ts
 *
 * Needs SANITY_API_WRITE_TOKEN in .env.local. Safe to re-run: it only creates
 * documents that do not exist yet, so it never overwrites the owner's edits.
 */
import { createClient } from "@sanity/client";
import { LexoRank } from "lexorank";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import path from "node:path";
import { DEFAULT_HOME, DEFAULT_SETTINGS, DEFAULT_TEA_CATEGORIES, SEED_PRODUCTS } from "../src/lib/defaults";
import { slugify } from "../src/lib/format";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error("SANITY_API_WRITE_TOKEN is missing from web/.env.local");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "a5yzz6tx",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

const key = () => randomUUID().slice(0, 12);
const withKeys = <T extends object>(items: T[], type?: string) => items.map((i) => ({ _key: key(), ...(type ? { _type: type } : {}), ...i }));

async function uploadImage(file: string, alt: string) {
  const asset = await client.assets.upload("image", createReadStream(path.resolve(import.meta.dirname, "../public/images/stock", file)), {
    filename: file,
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt };
}

async function main() {
  const { holidays: _h, ...settingsRest } = DEFAULT_SETTINGS;
  void _h;
  await client.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    ...settingsRest,
    hours: withKeys(DEFAULT_SETTINGS.hours, "dayHours"),
    tickerLines: DEFAULT_SETTINGS.tickerLines,
    payments: DEFAULT_SETTINGS.payments,
  });
  console.log("settings ok");

  await client.createIfNotExists({
    _id: "homePage",
    _type: "homePage",
    ...DEFAULT_HOME,
    facts: withKeys(DEFAULT_HOME.facts, "fact"),
    stats: withKeys(DEFAULT_HOME.stats, "stat"),
  });
  console.log("home page ok");

  for (const [i, c] of DEFAULT_TEA_CATEGORIES.entries()) {
    await client.createIfNotExists({ _id: `teaCategory-${slugify(c.name)}`, _type: "teaCategory", name: c.name, description: c.description, order: i + 1 });
  }
  console.log("tea categories ok");

  let rank = LexoRank.min();
  for (const p of SEED_PRODUCTS) {
    rank = rank.genNext().genNext();
    const slug = slugify(p.name);
    const id = `product-${slug}`;
    const existing = await client.fetch<number>(`count(*[_id == $id])`, { id });
    if (existing) {
      console.log("skip (exists)", p.name);
      continue;
    }
    const photo = p.seedPhoto ? await uploadImage(p.seedPhoto, p.name) : undefined;
    const doc: { _id: string; _type: string; [k: string]: unknown } = {
      _id: id,
      _type: "product",
      orderRank: rank.toString(),
      name: p.name,
      slug: { _type: "slug", current: slug },
      type: p.type,
      ...(p.type === "coffee" ? { coffeeCategory: p.category } : { teaCategory: p.category }),
      ...(photo ? { photo } : {}),
      shortDescription: p.description,
      sizes: p.sizes.map((s) => ({ _key: key(), _type: "size", label: s.label, ...(s.price ? { price: s.price } : {}) })),
      seasonal: !!p.seasonal,
      inStock: true,
      featured: false,
    };
    await client.create(doc);
    console.log("created", p.name);
  }
  console.log("Done. Now delete scripts/seed.ts.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
