"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBag } from "../bag/BagProvider";
import { BagIcon } from "../Icons";

export function navLinks(hasPosts: boolean) {
  const links = [
    { href: "/coffee", label: "Coffee" },
    { href: "/tea", label: "Tea" },
    { href: "/#seasonal", label: "Seasonal" },
    { href: "/about", label: "Our roastery" },
    { href: "/visit", label: "Visit" },
  ];
  if (hasPosts) links.splice(4, 0, { href: "/journal", label: "Journal" });
  return links;
}

export function Header() {
  const { count, openBag, hasPosts, settings } = useBag();
  const path = usePathname();
  return (
    <header className="nav">
      <div className="wrap navin">
        <Link href="/" aria-label={`${settings.name} home`}>
          <Image src="/brand/logo-dark.png" alt={settings.name} width={150} height={43} priority style={{ width: 150, height: "auto", display: "block" }} />
        </Link>
        <nav className="navlinks" aria-label="Main">
          {navLinks(hasPosts).map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="button" className="btn btn-ghost bagbtn" onClick={openBag}>
            <BagIcon />
            <span>Bag</span>
            <span className="badge">{count}</span>
            <span className="sr-only">{count === 1 ? "item in your pickup bag" : "items in your pickup bag"}</span>
          </button>
          <Link className="btn btn-dark navcta" href="/shop">
            Order for pickup
          </Link>
        </div>
      </div>
    </header>
  );
}
