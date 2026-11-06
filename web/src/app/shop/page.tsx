import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getProducts, getTeaCategories } from "@/lib/sanity/data";
import { SEO } from "@/lib/site";

export const metadata: Metadata = {
  title: SEO.shop.title,
  description: SEO.shop.description,
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, teaCategories] = await Promise.all([getProducts(), getTeaCategories()]);
  return (
    <>
      <PageHead
        eyebrow="The shop"
        title="Pick it here, *grab it* on your way."
        lead="Choose your beans and grind, or a scoop of loose-leaf tea. No card needed, pay at the counter when you pick up."
        trail={[{ name: "Shop", path: "/shop" }]}
      />
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <ShopBrowser products={products} teaCategories={teaCategories} />
      </section>
    </>
  );
}
