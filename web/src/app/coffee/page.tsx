import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getProducts, getTeaCategories } from "@/lib/sanity/data";
import { SEO } from "@/lib/site";

export const metadata: Metadata = {
  title: SEO.coffee.title,
  description: SEO.coffee.description,
  alternates: { canonical: "/coffee" },
};

export default async function CoffeePage() {
  const [products, teaCategories] = await Promise.all([getProducts(), getTeaCategories()]);
  return (
    <>
      <PageHead
        eyebrow="Coffee"
        title="Fresh roasted coffee, *ground to your brewer.*"
        lead="Single origin, blends, flavoured and decaf, roasted in house on Minet's Point Road in Barrie. Pick your grind, then pick it up."
        trail={[{ name: "Coffee", path: "/coffee" }]}
      />
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <ShopBrowser products={products} teaCategories={teaCategories} initialTab="coffee" hideToggle />
      </section>
    </>
  );
}
