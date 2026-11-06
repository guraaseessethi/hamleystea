import type { Metadata } from "next";
import { Accent } from "@/components/Accent";
import { JsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/PageHead";
import { Photo } from "@/components/Photo";
import { HoursPanel } from "@/components/sections/HoursPanel";
import { MapCard } from "@/components/sections/MapCard";
import { localBusinessLd } from "@/lib/jsonld";
import { getHome, getSettings } from "@/lib/sanity/data";
import { publicSettings, SEO } from "@/lib/site";

export const metadata: Metadata = {
  title: SEO.visit.title,
  description: SEO.visit.description,
  alternates: { canonical: "/visit" },
};

export default async function VisitPage() {
  const [settings, home] = await Promise.all([getSettings(), getHome()]);
  const clientSettings = publicSettings(settings);
  return (
    <>
      <JsonLd data={localBusinessLd(settings)} />
      <PageHead
        eyebrow="Visit"
        title={home.visitHeading}
        lead={home.visitText}
        trail={[{ name: "Visit", path: "/visit" }]}
      />
      <section className="wrap" style={{ paddingBottom: 72 }}>
        <div className="visit" style={{ marginTop: 0 }} data-reveal>
          <HoursPanel settings={clientSettings} />
          <MapCard settings={clientSettings} />
        </div>
      </section>
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <div className="photoframe" data-reveal style={{ aspectRatio: "21 / 9" }}>
          <Photo image={home.visitImage} fallback="/images/stock/tea-shop-interior.webp" alt="Inside the tea shop" sizes="(max-width: 1240px) 100vw, 1240px" />
        </div>
        <p className="lead" style={{ maxWidth: 680 }}>
          <Accent text="Not sure what to pick? *Tell us how you brew* and we will find your cup." />
        </p>
      </section>
    </>
  );
}
