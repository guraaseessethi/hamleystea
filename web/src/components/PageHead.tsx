import Link from "next/link";
import { Accent } from "./Accent";
import { JsonLd } from "./JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";

/** Page title block with visible breadcrumbs and BreadcrumbList JSON-LD. */
export function PageHead({
  eyebrow,
  title,
  lead,
  trail,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  trail: { name: string; path: string }[];
}) {
  const all = [{ name: "Home", path: "/" }, ...trail];
  return (
    <header className="pagehead">
      <JsonLd data={breadcrumbLd(all)} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          {all.map((c, i) => (
            <span key={c.path}>
              {i > 0 && " / "}
              {i < all.length - 1 ? <Link href={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
            </span>
          ))}
        </nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h2">
          <Accent text={title} />
        </h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </header>
  );
}
