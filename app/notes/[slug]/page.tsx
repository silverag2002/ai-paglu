import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { notes, getNote, formatDate } from "@/lib/content";
import { TagRow } from "@/components/site/ui";

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.meta.slug }));
}

export async function generateMetadata(props: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = getNote(slug);
  if (!entry) return {};
  return {
    title: entry.meta.title,
    description: entry.meta.summary,
    alternates: { canonical: `/notes/${slug}` },
    openGraph: { type: "article", title: entry.meta.title, description: entry.meta.summary },
    twitter: { card: "summary_large_image", title: entry.meta.title, description: entry.meta.summary },
  };
}

export default async function NotePage(props: PageProps<"/notes/[slug]">) {
  const { slug } = await props.params;
  const entry = getNote(slug);
  if (!entry) notFound();

  const { meta, Component } = entry;

  return (
    <article>
      <header className="border-b border-rule">
        <div className="page band-tight">
          <Link href="/notes" className="label text-muted transition-colors hover:text-accent">
            ← Notes
          </Link>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="label text-accent">{meta.kind}</span>
            <span className="font-mono text-[0.72rem] text-faint">
              updated {formatDate(meta.updated)}
            </span>
          </div>
          <h1 className="display mt-3 max-w-3xl text-[2.1rem] sm:text-[2.7rem]">{meta.title}</h1>
          <p className="prose-col mt-4 text-[1rem] leading-relaxed text-muted">{meta.summary}</p>
          <div className="mt-5">
            <TagRow tags={meta.tags} />
          </div>
        </div>
      </header>

      <div className="page band-tight">
        <div className="prose-body prose-col">
          <Component />
        </div>
      </div>
    </article>
  );
}
