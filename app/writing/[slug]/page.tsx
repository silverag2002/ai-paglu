import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost, neighbours, formatDate } from "@/lib/content";
import { site } from "@/lib/site";
import { TagRow, LevelBadge } from "@/components/site/ui";
import { TableOfContents } from "@/components/site/TableOfContents";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.meta.slug }));
}

export async function generateMetadata(
  props: PageProps<"/writing/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = getPost(slug);
  if (!entry) return {};
  const { title, summary, published, tags } = entry.meta;
  return {
    title,
    description: summary,
    alternates: { canonical: `/writing/${slug}` },
    openGraph: {
      type: "article",
      title,
      description: summary,
      publishedTime: published,
      tags: [...tags],
      url: `/writing/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description: summary },
  };
}

export default async function PostPage(props: PageProps<"/writing/[slug]">) {
  const { slug } = await props.params;
  const entry = getPost(slug);
  if (!entry) notFound();

  const { meta, Component } = entry;
  const { newer, older } = neighbours(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.summary,
    datePublished: meta.published,
    dateModified: meta.updated ?? meta.published,
    keywords: meta.tags.join(", "),
    url: `${site.url}/writing/${slug}`,
    isPartOf: { "@type": "Blog", name: site.name, url: site.url },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="relative overflow-hidden border-b border-rule">
        <div aria-hidden="true" className="grid-ground absolute inset-0" />
        <div className="page relative band-tight">
          <Link href="/writing" className="label text-muted transition-colors hover:text-accent">
            ← Writing
          </Link>
          <h1 className="display mt-5 max-w-4xl text-[2.3rem] sm:text-[3.1rem]">{meta.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[0.74rem] text-faint">{formatDate(meta.published)}</span>
            <span aria-hidden="true" className="text-faint">·</span>
            <span className="font-mono text-[0.74rem] text-faint">{meta.readMinutes} min read</span>
            <span aria-hidden="true" className="text-faint">·</span>
            <LevelBadge level={meta.level} />
          </div>
          <div className="mt-5">
            <TagRow tags={meta.tags} />
          </div>
        </div>
      </header>

      <div className="page band-tight">
        <div className="gap-14 xl:grid xl:grid-cols-[minmax(0,1fr)_14rem]">
          <div id="article" className="prose-body prose-col">
            <Component />
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-24">
              <TableOfContents containerId="article" />
            </div>
          </div>
        </div>
      </div>

      {(newer || older) && (
        <nav aria-label="More writing" className="page band-tight">
          <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
            {[
              { m: older, dir: "Older" },
              { m: newer, dir: "Newer" },
            ].map(({ m, dir }) =>
              m ? (
                <Link key={dir} href={`/writing/${m.slug}`} className="group bg-raised p-6">
                  <span className="label text-faint">{dir}</span>
                  <p className="display mt-2 text-[1.25rem] leading-snug">
                    <span className="link-underline">{m.title}</span>
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{m.summary}</p>
                </Link>
              ) : (
                <div key={dir} className="bg-raised p-6">
                  <span className="label text-faint">{dir}</span>
                  <p className="mt-2 font-mono text-[0.8rem] text-faint">Nothing here yet.</p>
                </div>
              ),
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
