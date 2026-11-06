import Image from "next/image";
import Link from "next/link";
import { Photo } from "../Photo";
import { AddButton } from "./AddButton";
import { bagTone, categoryTag, priceLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

/** The styled coffee bag shown when a product has no photo yet. */
export function Pouch({ product }: { product: Pick<Product, "type" | "category"> }) {
  const label = product.type === "tea" ? "Loose leaf" : product.category === "Single origin" ? "Single origin" : product.category;
  return (
    <div className={`pouch p-${bagTone(product)}`} aria-hidden="true">
      <Image src="/brand/logo-light.png" alt="" width={68} height={19} />
      <small>{label}</small>
    </div>
  );
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const price = priceLabel(product);
  const href = `/shop/${product.slug}`;
  return (
    <article className="card" style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}>
      <Link href={href} className={`art${product.type === "tea" ? " tea" : ""}`} tabIndex={-1} aria-hidden="true">
        {product.photo ? (
          <span className="photo">
            <Photo image={product.photo} alt="" sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 280px" />
          </span>
        ) : (
          <Pouch product={product} />
        )}
      </Link>
      <div className="cbody">
        <span className="ctag">{categoryTag(product)}</span>
        <Link href={href} className="cname">
          {product.name}
        </Link>
      </div>
      <div className="cfoot">
        <span className={`price${price.asked ? " ph" : ""}`}>{price.text}</span>
        <AddButton product={product} />
      </div>
    </article>
  );
}
