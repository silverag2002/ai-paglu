import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visuals, getVisual } from "@/lib/content";
import { TagRow } from "@/components/site/ui";

export function generateStaticParams() {
  return visuals.map((v) => ({ slug: v.meta.slug }));
}

export async function generateMetadata(props: PageProps<"/visuals/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = getVisual(slug);
  if (!entry) return {};
  return {
    title: entry.meta.title,
    description: entry.meta.summary,
    alternates: { canonical: `/visuals/${slug}` },
    openGraph: { title: entry.meta.title, description: entry.meta.summary },
    twitter: { card: "summary_large_image", title: entry.meta.title, description: entry.meta.summary },
  };
}

export default async function VisualPage(props: PageProps<"/visuals/[slug]">) {
  const { slug } = await props.params;
  const entry = getVisual(slug);
  if (!entry) notFound();

  const { meta, Component, About } = entry;

  return (
    <article>
      <header className="border-b border-rule">
        <div className="page band-tight">
          <Link href="/visuals" className="label text-muted transition-colors hover:text-accent">
            ← Visuals
          </Link>
          <h1 className="display mt-5 max-w-3xl text-[2.1rem] sm:text-[2.7rem]">{meta.title}</h1>
          <p className="prose-col mt-4 text-[1rem] leading-relaxed text-muted">{meta.summary}</p>
          <p className="mt-4 font-mono text-[0.74rem] text-accent">{meta.interaction}</p>
          <div className="mt-5">
            <TagRow tags={meta.tags} />
          </div>
        </div>
      </header>

      <div className="page band-tight">
        <Component />
        <div className="prose-body prose-col mt-10">
          <About />
        </div>
      </div>
    </article>
  );
}
