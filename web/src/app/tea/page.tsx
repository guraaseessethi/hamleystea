import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getProducts, getTeaCategories } from "@/lib/sanity/data";
import { SEO } from "@/lib/site";

export const metadata: Metadata = {
  title: SEO.tea.title,
  description: SEO.tea.description,
  alternates: { canonical: "/tea" },
};

export default async function TeaPage() {
  const [products, teaCategories] = await Promise.all([getProducts(), getTeaCategories()]);
  return (
    <>
      <PageHead
        eyebrow="Tea"
        title="Loose-leaf tea, *steeped by the scoop.*"
        lead="A wall of 80+ loose-leaf teas in the shop: black, green, oolong, chai, rooibos, fruit and the seasonal ones. Come in and smell a few."
        trail={[{ name: "Tea", path: "/tea" }]}
      />
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <ShopBrowser products={products} teaCategories={teaCategories} initialTab="tea" hideToggle />
      </section>
    </>
  );
}
