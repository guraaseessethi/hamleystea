import Image from "next/image";
import Link from "next/link";
import { telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings, hasPosts }: { settings: SiteSettings; hasPosts: boolean }) {
  return (
    <footer className="foot">
      <div className="wrap footin">
        <div style={{ maxWidth: 340, display: "flex", flexDirection: "column", gap: 18 }}>
          <Image src="/brand/logo-light.png" alt={settings.name} width={180} height={51} style={{ width: 180, height: "auto" }} />
          <span style={{ fontSize: 15, lineHeight: 1.6 }}>Coffee roasterie and tea shop, family owned in Barrie since 2005.</span>
        </div>
        <nav className="footcol" aria-label="Shop links">
          <b>Shop</b>
          <Link href="/coffee">Coffee</Link>
          <Link href="/tea">Tea</Link>
          <Link href="/#seasonal">Seasonal</Link>
        </nav>
        <nav className="footcol" aria-label="Shop info">
          <b>Visit</b>
          <Link href="/visit">Hours and directions</Link>
          <a href={telHref(settings.phone)}>{settings.phone}</a>
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
        <nav className="footcol" aria-label="About">
          <b>Hamley&apos;s</b>
          <Link href="/about">Our roastery</Link>
          {hasPosts && <Link href="/journal">Journal</Link>}
        </nav>
      </div>
      <div className="wrap copyright">© {new Date().getFullYear()} {settings.name}</div>
    </footer>
  );
}
