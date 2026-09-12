import Link from "next/link";
import { allPosts, allNotes, visuals, roadmap, featuredPost, allTags, formatDate } from "@/lib/content";
import { PostRow, NoteCard, SectionHead, TagPill, LevelBadge } from "@/components/site/ui";
import { AttentionHeatmap } from "@/components/visuals/AttentionHeatmap";

export default function Home() {
  const f = featuredPost.meta;
  const rest = allPosts.filter((p) => p.meta.slug !== f.slug);
  const building = roadmap.filter((r) => r.status === "building");
  const tags = allTags().slice(0, 8);

  return (
    <>
      {/* ----------------------------------------------------------- hero -- */}
      <section className="relative overflow-hidden border-b border-rule">
        <div aria-hidden="true" className="grid-ground absolute inset-0" />
        <div className="page relative band">
          <p className="label rise text-accent">Learning in public</p>
          <h1 className="display display-hero rise mt-4 max-w-[16ch]" style={{ animationDelay: "80ms" }}>
            Hard ideas, explained until they stop being hard.
          </h1>
          <p
            className="prose-col rise mt-7 text-[1.1rem] leading-relaxed text-muted sm:text-[1.2rem]"
            style={{ animationDelay: "160ms" }}
          >
            Transformers, embeddings, diffusion, video models. Written while learning them — because
            writing an explanation is the only reliable way I have found to discover whether I
            actually understood something, or just recognised it.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "240ms" }}>
            <Link
              href={`/writing/${f.slug}`}
              className="label border border-accent bg-accent px-4 py-2.5 text-accent-contrast transition-opacity hover:opacity-85"
            >
              Start with attention →
            </Link>
            <Link href="/notes" className="label text-muted transition-colors hover:text-accent">
              Or skim the revision notes
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- featured -- */}
      <section className="page band-tight">
        <SectionHead label="Start here" title="The one to read first" href="/writing" cta="All writing" />
        <Link href={`/writing/${f.slug}`} className="group mt-7 block">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-[0.72rem] text-faint">{formatDate(f.published)}</span>
                <span aria-hidden="true" className="text-faint">·</span>
                <span className="font-mono text-[0.72rem] text-faint">{f.readMinutes} min</span>
                <span aria-hidden="true" className="text-faint">·</span>
                <LevelBadge level={f.level} />
              </div>
              <h3 className="display mt-3 text-[2rem] sm:text-[2.5rem]">
                <span className="link-underline">{f.title}</span>
              </h3>
            </div>
            <p className="self-end text-[1.02rem] leading-relaxed text-muted">{f.summary}</p>
          </div>
        </Link>
      </section>

      {/* --------------------------------------------------------- visual -- */}
      <section className="page band-tight">
        <SectionHead
          label="Visuals"
          title="Poke at the thing, not the prose"
          href="/visuals"
          cta="All visuals"
        />
        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
          <div className="min-w-0">
            <AttentionHeatmap />
          </div>
          <div className="lg:pt-2">
            <p className="text-[0.98rem] leading-relaxed text-muted">
              Diagrams here are built by hand rather than screenshotted from a paper, so they can be
              interrogated — hover a cell, step a shape, scrub a denoising run. Understanding
              usually arrives from the poking, not the reading.
            </p>
            <ul className="mt-5 space-y-2.5 border-t border-rule pt-4">
              {visuals.slice(1).map((v) => (
                <li key={v.meta.slug}>
                  <Link
                    href={`/visuals/${v.meta.slug}`}
                    className="font-mono text-[0.76rem] text-muted transition-colors hover:text-accent"
                  >
                    {v.meta.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- writing -- */}
      <section className="page band-tight">
        <SectionHead label="Writing" title="Everything else so far" href="/writing" cta="All writing" />
        <div className="mt-2">
          {rest.map((p) => (
            <PostRow key={p.meta.slug} meta={p.meta} />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- notes -- */}
      <section className="page band-tight">
        <SectionHead
          label="Notes"
          title="For when you knew this last month"
          href="/notes"
          cta="All notes"
        />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {allNotes.map((n) => (
            <NoteCard key={n.meta.slug} meta={n.meta} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- roadmap -- */}
      <section className="page band-tight">
        <SectionHead label="Roadmap" title="Being written now" href="/roadmap" cta="Full roadmap" />
        <ul className="mt-7 grid gap-px border border-rule bg-rule sm:grid-cols-3">
          {building.map((r) => (
            <li key={r.title} className="bg-raised p-5">
              <span className="label text-accent">in progress</span>
              <p className="display mt-2.5 text-[1.15rem] leading-snug">{r.title}</p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{r.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------- topics -- */}
      <section className="page band-tight">
        <SectionHead label="Topics" title="By subject" />
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <TagPill key={t.tag} tag={t.tag} />
          ))}
        </div>
      </section>
    </>
  );
}
