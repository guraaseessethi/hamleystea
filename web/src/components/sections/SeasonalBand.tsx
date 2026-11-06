import Link from "next/link";
import { Accent } from "../Accent";
import { AddButton } from "../shop/AddButton";
import { priceLabel } from "@/lib/format";
import type { HomePage, Product } from "@/lib/types";

function kind(p: Product): string {
  if (p.type === "tea") {
    const price = priceLabel(p);
    return price.asked ? "Loose-leaf tea" : `Loose-leaf tea · ${price.text}`;
  }
  return p.category === "Seasonal" ? "Seasonal coffee" : `${p.category} coffee`;
}

export function SeasonalBand({ home, products }: { home: HomePage; products: Product[] }) {
  const items = products.filter((p) => p.seasonal && p.inStock).slice(0, 4);
  if (items.length === 0) return null;
  // tea first, like the design: the order in Sanity decides, tea leads when mixed
  const ordered = [...items].sort((a, b) => Number(b.type === "tea") - Number(a.type === "tea"));
  return (
    <section className="section dark" id="seasonal" aria-labelledby="seasonal-h">
      <div className="wrap">
        <div className="shophead" style={{ marginBottom: 0 }} data-reveal>
          <div>
            <p className="eyebrow">On the shelf this season</p>
            <h2 className="h2" id="seasonal-h">
              <Accent text={home.seasonalHeading} />
            </h2>
          </div>
          <p style={{ maxWidth: 380, margin: 0, color: "#cdbfae", fontSize: 16, lineHeight: 1.6 }}>{home.seasonalText}</p>
        </div>
        <div className="sgrid" data-reveal>
          {ordered.map((p, i) => (
            <article className="scard" key={p.slug}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>
                <Link href={`/shop/${p.slug}`}>{p.name}</Link>
              </h3>
              <p>{kind(p)}</p>
              <AddButton product={p} variant="light" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
