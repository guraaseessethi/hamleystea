import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap" style={{ padding: "120px 40px", textAlign: "center" }}>
      <p className="eyebrow">404</p>
      <h1 className="h2">We could not find <em>that page.</em></h1>
      <p className="lead" style={{ margin: "18px auto 32px" }}>
        It may have moved. The shop is easy to find, though.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link className="btn btn-dark" href="/">
          Back home
        </Link>
        <Link className="btn btn-ghost" href="/shop">
          Shop coffee and tea
        </Link>
      </div>
    </section>
  );
}
