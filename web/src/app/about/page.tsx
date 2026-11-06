import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { Photo } from "@/components/Photo";
import { getHome } from "@/lib/sanity/data";
import { SEO } from "@/lib/site";

export const metadata: Metadata = {
  title: SEO.about.title,
  description: SEO.about.description,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const home = await getHome();
  const paragraphs = home.aboutStory.split(/\n\s*\n/).filter(Boolean);
  return (
    <>
      <PageHead
        eyebrow="Our roastery"
        title="Family run on Minet's Point *for two decades.*"
        trail={[{ name: "Our roastery", path: "/about" }]}
      />
      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div className="story" style={{ alignItems: "start" }}>
          <div className="prose" data-reveal>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <Link className="btn btn-dark" href="/visit">
                Come by the shop
              </Link>
              <Link className="btn btn-ghost" href="/shop">
                Order for pickup
              </Link>
            </div>
          </div>
          <div className="photoframe" data-reveal style={{ aspectRatio: "4 / 5" }}>
            <Photo
              image={home.aboutImage}
              fallback="/images/stock/coffee-roaster-scoop.webp"
              alt="Beans being scooped from the roaster"
              sizes="(max-width: 1023px) 100vw, 560px"
              priority
            />
          </div>
        </div>
      </section>
      <section className="section bg-cream" aria-label="The shop in numbers">
        <div className="wrap" data-reveal>
          <div className="stats">
            {home.stats.slice(0, 3).map((s) => (
              <div className="stat" key={s.value}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
            <div className="gear">
              <span style={{ fontSize: 16 }}>{home.gearLine}</span>
              <Link className="btn btn-dark" href="/visit" style={{ minHeight: 44 }}>
                See it in store
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="wrap" style={{ padding: "96px 40px" }}>
        <div className="photoframe" data-reveal style={{ aspectRatio: "21 / 9" }}>
          <Photo image={home.storyImage} fallback="/images/stock/tea-shop-shelves.webp" alt="Shelves of loose-leaf tea tins" sizes="(max-width: 1240px) 100vw, 1240px" />
        </div>
      </section>
    </>
  );
}
