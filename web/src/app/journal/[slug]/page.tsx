import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { PageHead } from "@/components/PageHead";
import { Photo } from "@/components/Photo";
import { getPost, getPosts } from "@/lib/sanity/data";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found | Hamley's" };
  return {
    title: `${post.title} | Hamley's Tea & Coffee Barrie`,
    description: post.excerpt || "News from the roastery on Minet's Point Road, Barrie.",
    alternates: { canonical: `/journal/${post.slug}` },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <>
      <PageHead
        eyebrow={new Date(`${post.date}T12:00:00Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}
        title={post.title}
        trail={[
          { name: "Journal", path: "/journal" },
          { name: post.title, path: `/journal/${post.slug}` },
        ]}
      />
      <article className="wrap" style={{ paddingBottom: 112 }}>
        {post.cover && (
          <div className="photoframe" style={{ aspectRatio: "21 / 9", marginBottom: 48 }}>
            <Photo image={post.cover} alt="" sizes="(max-width: 1240px) 100vw, 1240px" priority />
          </div>
        )}
        <div className="prose">{post.body && <PortableText value={post.body} />}</div>
      </article>
    </>
  );
}
