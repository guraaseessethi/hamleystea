import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImage } from "../types";

const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "a5yzz6tx",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
});

/** A Sanity image URL cropped to the editor's crop and sized for next/image to refine. */
export function imageSrc(img: SanityImage, width = 1200): string | null {
  if (!img?.asset?._id && !img?.asset?.url) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return builder.image(img as any).width(width).auto("format").fit("max").url();
}

/** CSS object-position from the editor's hotspot so the subject stays in frame. */
export function hotspotPosition(img: SanityImage): string | undefined {
  const h = img?.hotspot;
  if (!h) return undefined;
  return `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%`;
}
