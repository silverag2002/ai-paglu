import type { Metadata } from "next";
import Link from "next/link";
import { roadmap } from "@/lib/content";
import type { RoadmapStatus } from "@/content/types";
import { PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What has been written, what is being written now, and what is queued next.",
};

const GROUPS: { status: RoadmapStatus; title: string; blurb: string }[] = [
  { status: "building", title: "Being written now", blurb: "Drafted or half-drawn. These land next." },
  { status: "queued", title: "Queued", blurb: "On the list, in roughly this order. Reorderable on request." },
  { status: "shipped", title: "Shipped", blurb: "Published and linked." },
];

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        label="Roadmap"
        title="What is coming, in the open"
        intro={
          <>
            A public backlog, kept honest. Publishing the queue means I cannot quietly skip the
            topics that are hard to explain — which are usually the ones worth explaining.
          </>
        }
        aside={
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {GROUPS.map((g) => {
              const n = roadmap.filter((r) => r.status === g.status).length;
              return (
                <p key={g.status} className="font-mono text-[0.78rem] text-faint">
                  <span className="text-accent">{String(n).padStart(2, "0")}</span> {g.status}
                </p>
              );
            })}
          </div>
        }
      />

      <div className="page band-tight space-y-14">
        {GROUPS.map((g) => {
          const items = roadmap.filter((r) => r.status === g.status);
          if (!items.length) return null;
          return (
            <section key={g.status}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule pb-3">
                <h2 className="display text-[1.6rem]">{g.title}</h2>
                <p className="font-mono text-[0.74rem] text-faint">{g.blurb}</p>
              </div>

              <ul className="mt-1">
                {items.map((r) => {
                  const body = (
                    <>
                      <span
                        aria-hidden="true"
                        className="mt-[0.62em] h-1.5 w-1.5 shrink-0"
                        style={{
                          background: r.status === "queued" ? "var(--rule)" : "var(--accent)",
                          outline: r.status === "building" ? "3px solid var(--accent-soft)" : "none",
                        }}
                      />
                      <span className="min-w-0">
                        <span className="display block text-[1.18rem] leading-snug">
                          {r.href ? <span className="link-underline">{r.title}</span> : r.title}
                        </span>
                        <span className="mt-1.5 block text-[0.93rem] leading-relaxed text-muted">
                          {r.note}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-x-2.5 font-mono text-[0.68rem] text-faint">
                          {r.tags.map((t) => (
                            <span key={t}>#{t}</span>
                          ))}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={r.title} className="border-b border-rule last:border-0">
                      {r.href ? (
                        <Link href={r.href} className="group flex gap-4 py-5">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex gap-4 py-5">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
