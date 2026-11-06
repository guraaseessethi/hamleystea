import Image from "next/image";
import { telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

export function MapCard({ settings }: { settings: SiteSettings }) {
  const [street, ...rest] = settings.address.split(",");
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`;
  return (
    <div className="mapcard">
      <Image src="/brand/logo-light.png" alt={settings.name} width={170} height={49} style={{ width: 170, height: "auto" }} />
      <address style={{ fontSize: 18, lineHeight: 1.6, fontStyle: "normal" }}>
        {street}
        <br />
        {rest.join(",").trim()}
      </address>
      <a className="tel" href={telHref(settings.phone)}>
        {settings.phone}
      </a>
      <iframe
        className="mapframe"
        title={`Map of ${settings.name}`}
        src={embed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "#cdbfae" }}>We take</span>
        <div className="pay">
          {settings.payments.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
        <a className="btn btn-cream" href={settings.mapLink} style={{ alignSelf: "flex-start" }} target="_blank" rel="noopener noreferrer">
          Get directions
        </a>
      </div>
    </div>
  );
}
