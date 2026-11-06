"use client";

import { useBag } from "../bag/BagProvider";
import type { Product } from "@/lib/types";

/** Shows "+ Add", then "In bag · 2" once added. */
export function AddButton({ product, variant = "card" }: { product: Product; variant?: "card" | "light" }) {
  const { add, qtyOf } = useBag();
  const n = qtyOf(product.slug);
  const base = variant === "light" ? "addl" : "addb";
  if (!product.inStock) {
    return (
      <button type="button" className={base} disabled>
        Sold out
      </button>
    );
  }
  return (
    <button
      type="button"
      className={n > 0 ? `${base} in` : base}
      onClick={() => add(product)}
    >
      {n > 0 ? `In bag · ${n}` : "+ Add"}
      <span className="sr-only"> {product.name}</span>
    </button>
  );
}
