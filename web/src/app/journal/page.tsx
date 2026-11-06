import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { Photo } from "@/components/Photo";
import { getPosts } from "@/lib/sanity/data";
import { SEO } from "@/lib/site";

export const metadata: Metadata = {
  title: SEO.journal.title,
  description: SEO.journal.description,
  alternates: { canonical: "/journal" },
};

function fmt(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function JournalPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHead eyebrow="Journal" title="News from *the roastery.*" trail={[{ name: "Journal", path: "/journal" }]} />
      <section className="wrap" style={{ paddingBottom: 112 }}>
        {posts.length === 0 ? (
          <p className="lead" style={{ marginTop: 0 }}>
            Nothing posted yet. Check back when the next seasonal tea or coffee arrives.
          </p>
        ) : (
          <div className="postgrid">
            {posts.map((p) => (
              <Link key={p.slug} href={`/journal/${p.slug}`} className="postcard">
                <div className="cover">
                  <Photo image={p.cover} fallback="/images/stock/seasonal-autumn-tea.webp" alt="" sizes="(max-width: 767px) 100vw, 400px" />
                </div>
                <div className="pbody">
                  <span className="ctag">{fmt(p.date)}</span>
                  <span className="cname">{p.title}</span>
                  {p.excerpt && <span style={{ color: "var(--muted)", fontSize: 15 }}>{p.excerpt}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
