import Link from "next/link";
import type { ReactNode } from "react";
import type { PostMeta, NoteMeta, VisualMeta } from "@/content/types";
import { formatDate } from "@/lib/content";

export function TagPill({ tag, active = false }: { tag: string; active?: boolean }) {
  return (
    <Link
      href={`/topics/${tag}`}
      className={`label border px-2 py-1 transition-colors ${
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-rule text-faint hover:border-accent hover:text-accent"
      }`}
    >
      {tag}
    </Link>
  );
}

export function TagRow({ tags, active }: { tags: string[]; active?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <TagPill key={t} tag={t} active={t === active} />
      ))}
    </div>
  );
}

const LEVEL_NOTE: Record<string, string> = {
  intuition: "no prerequisites",
  working: "assumes the basics",
  deep: "assumes comfort with the maths",
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className="label text-faint" title={LEVEL_NOTE[level]}>
      {level}
    </span>
  );
}

/** The banner every index page opens with. */
export function PageHeader({
  label,
  title,
  intro,
  aside,
}: {
  label: string;
  title: string;
  intro: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-rule">
      <div aria-hidden="true" className="grid-ground absolute inset-0" />
      <div className="page relative band-tight">
        <p className="label text-accent">{label}</p>
        <h1 className="display mt-3 max-w-3xl text-[2.4rem] sm:text-[3.2rem]">{title}</h1>
        <div className="prose-col mt-5 text-[1.02rem] leading-relaxed text-muted">{intro}</div>
        {aside && <div className="mt-7">{aside}</div>}
      </div>
    </header>
  );
}

export function PostRow({ meta }: { meta: PostMeta }) {
  return (
    <article className="border-b border-rule last:border-0">
      <Link href={`/writing/${meta.slug}`} className="group block">
        {/* editorial: stacked, room to breathe */}
        <div className="only-editorial py-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[0.72rem] text-faint">{formatDate(meta.published)}</span>
            <span aria-hidden="true" className="text-faint">·</span>
            <span className="font-mono text-[0.72rem] text-faint">{meta.readMinutes} min</span>
            <span aria-hidden="true" className="text-faint">·</span>
            <LevelBadge level={meta.level} />
          </div>
          <h2 className="display mt-2 max-w-2xl text-[1.75rem] sm:text-[2.05rem]">
            <span className="link-underline">{meta.title}</span>
          </h2>
          <p className="prose-col mt-2.5 text-[1rem] leading-relaxed text-muted">{meta.summary}</p>
          <p className="mt-3 flex flex-wrap gap-x-3 font-mono text-[0.7rem] text-faint">
            {meta.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </p>
        </div>

        {/* atlas: one scannable line */}
        <div className="only-atlas grid grid-cols-[7rem_minmax(0,1fr)_auto] items-baseline gap-5 py-3.5">
          <span className="font-mono text-[0.72rem] text-faint">{formatDate(meta.published)}</span>
          <span className="min-w-0">
            <span className="display link-underline text-[1.05rem]">{meta.title}</span>
            <span className="ml-3 hidden font-mono text-[0.7rem] text-faint lg:inline">
              {meta.tags.map((t) => `#${t}`).join(" ")}
            </span>
          </span>
          <span className="font-mono text-[0.72rem] text-faint">{meta.readMinutes}m</span>
        </div>
      </Link>
    </article>
  );
}

export function NoteCard({ meta }: { meta: NoteMeta }) {
  return (
    <Link
      href={`/notes/${meta.slug}`}
      className="group flex flex-col border border-rule bg-raised p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="label text-accent">{meta.kind}</span>
        <span className="font-mono text-[0.68rem] text-faint">{formatDate(meta.updated)}</span>
      </div>
      <h3 className="display mt-3 text-[1.25rem]">
        <span className="link-underline">{meta.title}</span>
      </h3>
      <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-muted">{meta.summary}</p>
      <p className="mt-4 flex flex-wrap gap-x-2.5 font-mono text-[0.68rem] text-faint">
        {meta.tags.map((t) => (
          <span key={t}>#{t}</span>
        ))}
      </p>
    </Link>
  );
}

export function VisualCard({ meta }: { meta: VisualMeta }) {
  return (
    <Link
      href={`/visuals/${meta.slug}`}
      className="group flex flex-col border border-rule bg-raised p-5 transition-colors hover:border-accent"
    >
      <h3 className="display text-[1.25rem]">
        <span className="link-underline">{meta.title}</span>
      </h3>
      <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-muted">{meta.summary}</p>
      <p className="mt-4 border-t border-rule pt-3 font-mono text-[0.7rem] text-accent">
        {meta.interaction}
      </p>
    </Link>
  );
}

/** Section heading used between bands on the home page. */
export function SectionHead({
  label,
  title,
  href,
  cta,
}: {
  label: string;
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-rule pb-3">
      <div>
        <p className="label text-accent">{label}</p>
        <h2 className="display mt-1.5 text-[1.6rem] sm:text-[1.85rem]">{title}</h2>
      </div>
      {href && cta && (
        <Link href={href} className="label text-muted transition-colors hover:text-accent">
          {cta} →
        </Link>
      )}
    </div>
  );
}
