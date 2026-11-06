"use client";

import { useState } from "react";
import { useBag } from "../bag/BagProvider";
import { money } from "@/lib/format";
import { GRINDS, type Grind, type Product } from "@/lib/types";

/** Size chips, grind picker (coffee) and Add to bag for the product page. */
export function ProductPurchase({ product }: { product: Product }) {
  const { add, qtyOf, openBag } = useBag();
  const sizes = product.sizes.length ? product.sizes : [{ label: "Standard", price: null }];
  const [sizeLabel, setSizeLabel] = useState(sizes[0].label);
  const [grind, setGrind] = useState<Grind>(GRINDS[0]);
  const size = sizes.find((s) => s.label === sizeLabel) ?? sizes[0];
  const inBag = qtyOf(product.slug);

  return (
    <div>
      <p className="pdp-price">{typeof size.price === "number" && size.price > 0 ? money(size.price) : "Ask in store"}</p>
      {!(typeof size.price === "number" && size.price > 0) && (
        <p className="note" style={{ margin: "6px 0 0" }}>
          This one is priced at pickup. You still order now and pay at the counter.
        </p>
      )}

      {sizes.length > 1 && (
        <fieldset className="optgroup field">
          <legend className="optlabel">Size</legend>
          <div className="slots">
            {sizes.map((s) => (
              <button
                type="button"
                key={s.label}
                className={`slot${s.label === sizeLabel ? " on" : ""}`}
                aria-pressed={s.label === sizeLabel}
                onClick={() => setSizeLabel(s.label)}
              >
                {s.label}
                {typeof s.price === "number" && s.price > 0 ? ` · ${money(s.price)}` : ""}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {sizes.length === 1 && (
        <p className="note" style={{ margin: "14px 0 0" }}>
          Size: {size.label}
        </p>
      )}

      {product.type === "coffee" && (
        <fieldset className="optgroup field">
          <legend className="optlabel">Grind</legend>
          <div className="slots">
            {GRINDS.map((g) => (
              <button type="button" key={g} className={`slot${g === grind ? " on" : ""}`} aria-pressed={g === grind} onClick={() => setGrind(g)}>
                {g}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
        <button
          type="button"
          className="btn btn-dark"
          disabled={!product.inStock}
          onClick={() => add(product, { sizeLabel, grind: product.type === "coffee" ? grind : undefined })}
        >
          {product.inStock ? "Add to bag" : "Sold out"}
        </button>
        {inBag > 0 && (
          <button type="button" className="btn btn-ghost" onClick={openBag}>
            In bag · {inBag}. View bag
          </button>
        )}
      </div>
    </div>
  );
}
