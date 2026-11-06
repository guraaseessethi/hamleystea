"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBag } from "../bag/BagProvider";
import { navLinks } from "./Header";
import { telHref } from "@/lib/format";
import { ArrowIcon, BagIcon, CupIcon, HomeIcon, MenuIcon, PinIcon } from "../Icons";

export function TabBar() {
  const { count, openBag, openMenu } = useBag();
  const path = usePathname();
  const shopActive = path.startsWith("/shop") || path.startsWith("/coffee") || path.startsWith("/tea");
  return (
    <nav className="tabbar" aria-label="Quick menu">
      <Link className="tab" href="/" aria-current={path === "/" ? "page" : undefined}>
        <HomeIcon />
        Home
      </Link>
      <Link className="tab" href="/shop" aria-current={shopActive ? "page" : undefined}>
        <CupIcon />
        Shop
      </Link>
      <button type="button" className="tab" onClick={openBag}>
        <BagIcon size={22} />
        Bag
        {count > 0 && (
          <span className="badge">{count}</span>
        )}
      </button>
      <Link className="tab" href="/visit" aria-current={path === "/visit" ? "page" : undefined}>
        <PinIcon />
        Visit
      </Link>
      <button type="button" className="tab" onClick={openMenu}>
        <MenuIcon />
        Menu
      </button>
    </nav>
  );
}

export function MenuSheet() {
  const { panel, closePanel, hasPosts, settings } = useBag();
  const open = panel === "menu";
  const links = navLinks(hasPosts);
  return (
    <aside className={`sheet${open ? " open" : ""}`} aria-label="Menu" aria-hidden={!open} role="dialog" aria-modal={open}>
      <div className="grab" />
      {links.map((l) => (
        <Link key={l.href} className="sl" href={l.href} onClick={closePanel} tabIndex={open ? 0 : -1}>
          {l.label}
          <ArrowIcon />
        </Link>
      ))}
      <a className="btn btn-dark" href={telHref(settings.phone)} style={{ width: "100%", marginTop: 20 }} tabIndex={open ? 0 : -1}>
        Call the shop
      </a>
    </aside>
  );
}
