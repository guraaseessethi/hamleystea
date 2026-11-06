import Link from "next/link";
import type { Metadata } from "next";
import { Accent } from "@/components/Accent";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ArrowIcon, BagIcon, BeanIcon, LeafIcon, StarIcon } from "@/components/Icons";
import { HoursPanel } from "@/components/sections/HoursPanel";
import { MapCard } from "@/components/sections/MapCard";
import { SeasonalBand } from "@/components/sections/SeasonalBand";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getHome, getProducts, getSettings, getTeaCategories } from "@/lib/sanity/data";
import { localBusinessLd } from "@/lib/jsonld";
import { publicSettings, SEO } from "@/lib/site";

export const metadata: Metadata = {
  title: SEO.home.title,
  description: SEO.home.description,
  alternates: { canonical: "/" },
};

const FACT_ICONS = [BeanIcon, LeafIcon, BagIcon];

export default async function HomePage() {
  const [settings, home, products, teaCategories] = await Promise.all([
    getSettings(),
    getHome(),
    getProducts(),
    getTeaCategories(),
  ]);
  const clientSettings = publicSettings(settings);

  return (
    <>
      <JsonLd data={localBusinessLd(settings)} />

      <section className="hero" aria-label="Welcome">
        <div className="heroimg">
          <Photo image={home.heroImage} fallback="/images/hero-roaster.webp" alt="The coffee roaster at work in Hamley's roastery" sizes="100vw" priority />
        </div>
        <div className="steam" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="wrap" style={{ width: "100%" }}>
          <div className="herotext">
            <div className="rating up d1">
              <StarIcon size={16} fill="#E2B27E" />
              <span>
                <b>{settings.googleRating}</b> on Google · {settings.googleReviewCount} reviews
              </span>
            </div>
            <h1 className="h1 up d2">
              <Accent text={home.heroHeadline} />
            </h1>
            <p className="lede up d3">{home.heroSubline}</p>
            <div className="up d4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-cream" href="/coffee">
                Shop coffee
                <ArrowIcon />
              </Link>
              <Link className="btn btn-line" href="/tea">
                Browse the tea wall
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap" style={{ padding: 0 }}>
        <div className="facts" data-reveal>
          {home.facts.slice(0, 3).map((f, i) => {
            const Icon = FACT_ICONS[i] ?? BeanIcon;
            return (
              <div className="fact" key={f.title}>
                <div className="ico">
                  <Icon />
                </div>
                <div>
                  <b>{f.title}</b>
                  <p>{f.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="section" id="shop" aria-labelledby="shop-h">
        <div className="wrap" data-reveal>
          <ShopBrowser
            products={products}
            teaCategories={teaCategories}
            limit={8}
            headerSlot={
              <div>
                <p className="eyebrow">The shop</p>
                <h2 className="h2" id="shop-h">
                  <Accent text={home.shopHeading} />
                </h2>
              </div>
            }
          />
        </div>
      </section>

      <SeasonalBand home={home} products={products} />

      <section className="section" id="story" aria-labelledby="story-h">
        <div className="wrap story" data-reveal>
          <div>
            <p className="eyebrow">Our roastery</p>
            <h2 className="h2" id="story-h">
              <Accent text={home.storyHeading} />
            </h2>
            <p>{home.storyText}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <Link className="btn btn-dark" href="/visit">
                Come by the shop
              </Link>
              <a className="btn btn-ghost" href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </div>
          </div>
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

      <section className="section bg-cream" id="reviews" aria-labelledby="reviews-h">
        <div className="wrap" data-reveal>
          <div className="revrow">
            <div>
              <p className="eyebrow">What people mention most</p>
              <h2 className="h2" id="reviews-h">
                <Accent text={home.reviewsHeading} />
              </h2>
            </div>
            <div className="score">
              <b className="serif">{settings.googleRating}</b>
              <div>
                <div style={{ display: "flex", gap: 3, color: "#8a4b16" }} role="img" aria-label={`${settings.googleRating} out of 5 stars`}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} size={18} />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>{settings.googleReviewCount} reviews on Google</span>
              </div>
            </div>
          </div>
          <ul className="themes" style={{ listStyle: "none", padding: 0 }} aria-label="What reviewers mention">
            {home.reviewThemes.map((t) => (
              <li key={t} className="theme">
                {t}
              </li>
            ))}
          </ul>
          <p style={{ margin: "34px 0 0", fontSize: 15, color: "var(--muted)" }}>
            <a href={settings.googleReviewsUrl} target="_blank" rel="noopener noreferrer">
              Read them on Google
            </a>
          </p>
        </div>
      </section>

      <section className="section" id="visit" aria-labelledby="visit-h">
        <div className="wrap" data-reveal>
          <p className="eyebrow">Visit</p>
          <h2 className="h2" id="visit-h">
            <Accent text={home.visitHeading} />
          </h2>
          <p className="lead">{home.visitText}</p>
          <div className="visit">
            <HoursPanel settings={clientSettings} />
            <MapCard settings={clientSettings} />
          </div>
        </div>
      </section>
    </>
  );
}
