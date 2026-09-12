import type { Metadata } from "next";
import Link from "next/link";
import { allPosts, allTags } from "@/lib/content";
import { PageHeader, PostRow } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Long-form explainers on transformers, embeddings, diffusion and the maths underneath — written while learning them.",
};

export default function WritingIndex() {
  const tags = allTags();

  return (
    <>
      <PageHeader
        label="Writing"
        title="Explainers, written the long way"
        intro={
          <>
            One idea per piece, taken slowly enough to actually land. Each one is the explanation I
            wanted when I was stuck, including the questions I got stuck on and the bugs I shipped.
          </>
        }
      />

      <div className="page band-tight">
        <div className="with-rail">
          <aside className="rail">
            <p className="label text-faint">Topics</p>
            <ul className="mt-3 space-y-1.5">
              {tags.map((t) => (
                <li key={t.tag}>
                  <Link
                    href={`/topics/${t.tag}`}
                    className="flex items-baseline justify-between gap-2 font-mono text-[0.74rem] text-muted transition-colors hover:text-accent"
                  >
                    <span>{t.tag}</span>
                    <span className="text-faint">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            <p className="label mb-1 text-faint">
              {allPosts.length} {allPosts.length === 1 ? "piece" : "pieces"}
            </p>
            {allPosts.map((p) => (
              <PostRow key={p.meta.slug} meta={p.meta} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
