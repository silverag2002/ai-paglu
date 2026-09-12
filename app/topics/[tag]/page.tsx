import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allTags, byTag } from "@/lib/content";
import { PageHeader, PostRow, NoteCard, VisualCard, TagPill } from "@/components/site/ui";

export function generateStaticParams() {
  return allTags().map((t) => ({ tag: t.tag }));
}

export async function generateMetadata(props: PageProps<"/topics/[tag]">): Promise<Metadata> {
  const { tag } = await props.params;
  return {
    title: `#${tag}`,
    description: `Everything on ${tag} — articles, revision notes and interactive diagrams.`,
    alternates: { canonical: `/topics/${tag}` },
  };
}

export default async function TopicPage(props: PageProps<"/topics/[tag]">) {
  const { tag } = await props.params;
  const tags = allTags();
  if (!tags.some((t) => t.tag === tag)) notFound();

  const { posts, notes, visuals } = byTag(tag);
  const total = posts.length + notes.length + visuals.length;

  return (
    <>
      <PageHeader
        label="Topic"
        title={`#${tag}`}
        intro={
          <>
            {total} {total === 1 ? "piece" : "pieces"} across writing, notes and visuals. Topics cut
            across the sections on purpose — the explainer, the cheatsheet and the diagram for one
            idea belong together.
          </>
        }
        aside={
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <TagPill key={t.tag} tag={t.tag} active={t.tag === tag} />
            ))}
          </div>
        }
      />

      <div className="page band-tight space-y-12">
        {posts.length > 0 && (
          <section>
            <h2 className="display border-b border-rule pb-3 text-[1.5rem]">Writing</h2>
            <div className="mt-1">
              {posts.map((m) => (
                <PostRow key={m.slug} meta={m} />
              ))}
            </div>
          </section>
        )}

        {notes.length > 0 && (
          <section>
            <h2 className="display border-b border-rule pb-3 text-[1.5rem]">Notes</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((m) => (
                <NoteCard key={m.slug} meta={m} />
              ))}
            </div>
          </section>
        )}

        {visuals.length > 0 && (
          <section>
            <h2 className="display border-b border-rule pb-3 text-[1.5rem]">Visuals</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visuals.map((m) => (
                <VisualCard key={m.slug} meta={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
