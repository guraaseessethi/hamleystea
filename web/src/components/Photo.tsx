import Image from "next/image";
import { hotspotPosition, imageSrc } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/types";

interface Props {
  image?: SanityImage | null;
  /** Local file in /public used when nothing is set in Sanity. Keeps every image swappable. */
  fallback?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Fills its (relatively positioned) parent. Prefers the Sanity image, falls back to a bundled one. */
export function Photo({ image, fallback, alt, sizes, priority, className }: Props) {
  const src = image ? imageSrc(image, 1600) : null;
  const finalSrc = src ?? fallback;
  if (!finalSrc) return null;
  const blur = image?.asset?.metadata?.lqip;
  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      className={className}
      style={src && image ? { objectPosition: hotspotPosition(image) } : undefined}
      {...(blur && src ? { placeholder: "blur" as const, blurDataURL: blur } : {})}
    />
  );
}
