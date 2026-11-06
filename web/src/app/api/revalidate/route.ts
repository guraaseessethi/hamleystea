import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { TAGS } from "@/lib/sanity/data";

export const dynamic = "force-dynamic";

const KNOWN = new Set<string>(Object.values(TAGS));

/**
 * Sanity webhook target. Configure in sanity.io/manage > API > Webhooks:
 * URL https://<site>/api/revalidate, secret = SANITY_REVALIDATE_SECRET,
 * projection {_type}, trigger on create, update and delete.
 */
export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "Revalidation is not configured" }, { status: 500 });

  const raw = await req.text();
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);
  const manual = req.headers.get("x-revalidate-secret") === secret;
  if (!manual && !(signature && (await isValidSignature(raw, signature, secret)))) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let type: string | undefined;
  try {
    type = (JSON.parse(raw) as { _type?: string })._type;
  } catch {
    /* an empty body just refreshes everything */
  }

  const tags = type && KNOWN.has(type) ? [type] : [...KNOWN];
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, revalidated: tags });
}
