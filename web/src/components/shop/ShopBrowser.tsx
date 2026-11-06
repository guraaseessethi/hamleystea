"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { COFFEE_CHIPS, TEA_CHIPS } from "@/lib/format";
import { LeafIcon } from "../Icons";
import type { Product, TeaCategory } from "@/lib/types";

type Tab = "coffee" | "tea";

interface Props {
  products: Product[];
  teaCategories: TeaCategory[];
  initialTab?: Tab;
  /** Home page preview: fewer cards and a link to the full shop. */
  limit?: number;
  /** Tabs render a heading above, so the segmented toggle can sit beside it. */
  headerSlot?: React.ReactNode;
  /** Hide the Coffee/Tea toggle on the dedicated /coffee and /tea pages. */
  hideToggle?: boolean;
}

export function ShopBrowser({ products, teaCategories, initialTab = "coffee", limit, headerSlot, hideToggle }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [chip, setChip] = useState("all");

  const chips = tab === "coffee" ? COFFEE_CHIPS : TEA_CHIPS;
  const active = chips.find((c) => c.key === chip) ?? chips[0];

  const list = useMemo(
    () => products.filter((p) => p.type === tab && active.match(p)),
    [products, tab, active],
  );
  const shown = limit ? list.slice(0, limit) : list;
  const teaCount = products.filter((p) => p.type === "tea").length;

  return (
    <div>
      {(headerSlot || !hideToggle) && (
        <div className="shophead">
          {headerSlot}
          {!hideToggle && (
            <div className="seg" role="group" aria-label="Shop coffee or tea">
              <button type="button" className={tab === "coffee" ? "on" : ""} aria-pressed={tab === "coffee"} onClick={() => { setTab("coffee"); setChip("all"); }}>
                Coffee
              </button>
              <button type="button" className={tab === "tea" ? "on" : ""} aria-pressed={tab === "tea"} onClick={() => { setTab("tea"); setChip("all"); }}>
                Tea
              </button>
            </div>
          )}
        </div>
      )}

      {(tab === "coffee" || teaCount > 3) && (
        <div className="chips" role="group" aria-label={tab === "coffee" ? "Coffee type" : "Tea type"}>
          {chips.map((c) => (
            <button type="button" key={c.key} className={`chipbtn${c.key === active.key ? " on" : ""}`} aria-pressed={c.key === active.key} onClick={() => setChip(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid4">
        {shown.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
        {tab === "tea" &&
          active.key === "all" &&
          teaCategories.map((t, i) => (
            <div className="tile" key={t.name} style={{ animationDelay: `${(i + 2) * 0.05}s` }}>
              <div className="leaf">
                <LeafIcon size={18} />
              </div>
              <div>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
              </div>
            </div>
          ))}
        {shown.length === 0 && tab === "coffee" && <p className="empty-state">Nothing here yet. Try another type.</p>}
      </div>

      {tab === "tea" && active.key === "all" && (
        <div className="teanote">
          <span>The wall holds 80+ loose-leaf teas. Come in, smell a few, and we&apos;ll scoop what you like.</span>
          <Link className="btn btn-ghost" href="/visit">
            Or smell them in store
          </Link>
        </div>
      )}

      {limit && list.length > limit && (
        <div style={{ marginTop: 28 }}>
          <Link className="btn btn-ghost" href={tab === "coffee" ? "/coffee" : "/tea"}>
            See all {tab === "coffee" ? "coffee" : "tea"}
          </Link>
        </div>
      )}
    </div>
  );
}
