import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getProductsBySlugs, getSettings } from "@/lib/sanity/data";
import { getWriteClient } from "@/lib/sanity/client";
import { formatPickup, isValidSlot, torontoToUtcISO } from "@/lib/hours";
import { sendOrderEmails, type OrderItem } from "@/lib/email";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rateLimit";
import { GRINDS } from "@/lib/types";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((p) => {
      const d = p.replace(/\D/g, "").length;
      return d === 10 || d === 11;
    }, "Please enter a phone number we can text."),
  email: z.union([z.literal(""), z.string().trim().email("That email does not look right.").max(120)]).optional(),
  notes: z.string().trim().max(300).optional(),
  /** honeypot: humans never fill this */
  website: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  minutes: z.number().int().min(0).max(1439),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        sizeLabel: z.string().max(40),
        grind: z.enum(GRINDS).optional(),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your bag is empty.")
    .max(30),
});

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limit = rateLimit(`pickup:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many orders from this connection. Please wait a few minutes or call the shop." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("That request could not be read.");
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form and try again.");
  const body = parsed.data;

  // Honeypot tripped: pretend it worked so bots learn nothing, save nothing.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, orderNumber: "H-0000" });
  }

  const settings = await getSettings({ fresh: true });
  if (!settings.pickupEnabled) return fail("Online pickup is paused right now. Please call the shop.", 409);

  if (!isValidSlot(settings, body.date, body.minutes)) {
    return fail("That pickup time is no longer available. Please pick another.", 409);
  }

  // Re-price from Sanity. Nothing about price or name is trusted from the browser.
  const products = await getProductsBySlugs([...new Set(body.items.map((i) => i.slug))]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items: (OrderItem & { _key: string; productRef?: string })[] = [];
  for (const line of body.items) {
    const p = bySlug.get(line.slug);
    if (!p) return fail("One of the items in your bag is no longer sold. Please remove it and try again.", 409);
    if (!p.inStock) return fail(`${p.name} is sold out right now. Please remove it from your bag.`, 409);
    const size = p.sizes.find((s) => s.label === line.sizeLabel) ?? (p.sizes.length === 0 && line.sizeLabel === "Standard" ? { label: "Standard", price: null } : null);
    if (!size) return fail(`${p.name} changed sizes. Please remove it and add it again.`, 409);
    items.push({
      _key: randomUUID().slice(0, 12),
      name: p.name,
      type: p.type,
      sizeLabel: size.label,
      grind: p.type === "coffee" ? (line.grind ?? "Whole bean") : undefined,
      qty: line.qty,
      unitPrice: typeof size.price === "number" && size.price > 0 ? size.price : null,
      productRef: p._id.startsWith("default-") ? undefined : p._id,
    });
  }

  const client = getWriteClient();
  if (!client) {
    console.error("SANITY_API_WRITE_TOKEN is not set. Cannot save pickup orders.");
    return fail("Online ordering is not switched on yet. Please call the shop.", 503);
  }

  // Short, friendly order number like H-2481 (checked for clashes).
  let orderNumber = "";
  for (let i = 0; i < 6; i++) {
    const candidate = `H-${1000 + Math.floor(Math.random() * 9000)}`;
    const taken = await client.fetch<number>(`count(*[_type == "pickupOrder" && orderNumber == $n])`, { n: candidate });
    if (!taken) {
      orderNumber = candidate;
      break;
    }
  }
  if (!orderNumber) orderNumber = `H-${Date.now().toString().slice(-6)}`;

  const id = `pickupOrder.${randomUUID()}`; // dotted id = private, not readable from the public dataset
  const pickupLabel = formatPickup(body.date, body.minutes);
  const totalPriced = items.reduce((n, i) => n + (i.unitPrice ? i.unitPrice * i.qty : 0), 0);

  try {
    await client.create({
      _id: id,
      _type: "pickupOrder",
      orderNumber,
      status: "new",
      customerName: body.name,
      customerPhone: body.phone,
      customerEmail: body.email || undefined,
      pickupAt: torontoToUtcISO(body.date, body.minutes),
      pickupLabel,
      notes: body.notes || undefined,
      createdAt: new Date().toISOString(),
      // names and prices are copied in, so editing or deleting a product never changes an old order
      items: items.map((i) => ({
        _key: i._key,
        _type: "orderItem",
        name: i.name,
        type: i.type,
        sizeLabel: i.sizeLabel,
        grind: i.grind,
        qty: i.qty,
        unitPrice: i.unitPrice ?? undefined,
        ...(i.productRef ? { product: { _type: "reference", _ref: i.productRef, _weak: true } } : {}),
      })),
      pricedTotal: totalPriced > 0 ? Number(totalPriced.toFixed(2)) : undefined,
    });
  } catch (err) {
    console.error("Saving pickup order failed:", err instanceof Error ? err.message : err);
    return fail("We could not save your order. Please try again or call the shop.", 500);
  }

  // Payment hook for later. Today this is "none": pay at the counter.
  await getPaymentProvider().createSession({ orderNumber, totalCents: totalPriced > 0 ? Math.round(totalPriced * 100) : null });

  await sendOrderEmails(
    {
      id,
      orderNumber,
      name: body.name,
      phone: body.phone,
      email: body.email || undefined,
      notes: body.notes || undefined,
      pickupLabel,
      items,
    },
    settings,
  );

  return NextResponse.json({ ok: true, orderNumber, pickupLabel });
}
