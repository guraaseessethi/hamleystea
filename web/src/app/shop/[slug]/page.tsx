import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/PageHead";
import { Photo } from "@/components/Photo";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { Pouch } from "@/components/shop/ProductCard";
import { categoryTag } from "@/lib/format";
import { productLd } from "@/lib/jsonld";
import { getProduct, getProducts } from "@/lib/sanity/data";
import { imageSrc } from "@/lib/sanity/image";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Not found | Hamley's" };
  const kind = p.type === "tea" ? "Loose Leaf Tea" : "Fresh Roasted Coffee";
  const photo = p.photo ? imageSrc(p.photo, 1200) : null;
  return {
    title: `${p.name} ${kind} in Barrie | Hamley's`,
    description:
      p.description ||
      `${p.name}, ${p.type === "tea" ? "loose-leaf tea" : "fresh roasted coffee"} from Hamley's on Minet's Point Rd, Barrie. Order ahead and pick up.`,
    alternates: { canonical: `/shop/${p.slug}` },
    ...(photo ? { openGraph: { images: [photo] } } : {}),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const section = product.type === "tea" ? { name: "Tea", path: "/tea" } : { name: "Coffee", path: "/coffee" };
  const photo = product.photo ? imageSrc(product.photo, 1200) : undefined;

  return (
    <>
      <JsonLd data={productLd(product, photo ?? undefined)} />
      <PageHead
        eyebrow={categoryTag(product)}
        title={product.name}
        trail={[section, { name: product.name, path: `/shop/${product.slug}` }]}
      />
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <div className="pdp">
          <div className={`pdp-art${product.type === "tea" ? " tea" : ""}`}>
            {product.photo ? (
              <span className="photo">
                <Photo image={product.photo} alt={`${product.name}`} sizes="(max-width: 1023px) 100vw, 560px" priority />
              </span>
            ) : (
              <Pouch product={product} />
            )}
          </div>
          <div>
            {product.description && <p className="lead" style={{ marginTop: 0 }}>{product.description}</p>}
            <ProductPurchase product={product} />
            <p className="note" style={{ marginTop: 28 }}>
              No card needed now. Pay at the counter with cash, debit, Visa or Mastercard.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
