import type { ReactNode } from "react";
import { highlight, type Lang } from "@/lib/highlight";
import { CopyButton } from "./CopyButton";

export { CopyButton };

/** Slugify heading text so the table of contents and deep links agree. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

/* ---------------------------------------------------------------- text ---- */

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-[1.3rem] leading-[1.5] text-ink sm:text-[1.45rem]">
      {children}
    </p>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  const id = slugify(textOf(children));
  return (
    <h2 id={id} className="display scroll-mt-28 pt-2 text-[1.7rem] sm:text-[2rem]">
      <a href={`#${id}`} className="no-prose-link group inline-flex items-baseline gap-2">
        {children}
        <span
          aria-hidden="true"
          className="font-mono text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100"
        >
          #
        </span>
      </a>
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  const id = slugify(textOf(children));
  return (
    <h3 id={id} className="display scroll-mt-28 text-[1.2rem] sm:text-[1.32rem]">
      {children}
    </h3>
  );
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="ml-1 space-y-2.5">{children}</ul>;
}

export function Ol({ children }: { children: ReactNode }) {
  return <ol className="ml-1 space-y-2.5 [counter-reset:step]">{children}</ol>;
}

export function Li({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-6 before:absolute before:left-0 before:top-[0.72em] before:h-[5px] before:w-[5px] before:bg-accent before:content-['']">
      {children}
    </li>
  );
}

/** Numbered list item, for procedures where the order is the point. */
export function Step({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-9 [counter-increment:step] before:absolute before:left-0 before:top-[0.15em] before:grid before:h-6 before:w-6 before:place-items-center before:border before:border-rule before:font-mono before:text-[0.7rem] before:text-accent before:content-[counter(step)]">
      {children}
    </li>
  );
}

export function IC({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[2px] bg-code px-[0.35em] py-[0.12em] font-mono text-[0.82em] text-ink">
      {children}
    </code>
  );
}

export function Em({ children }: { children: ReactNode }) {
  return <em className="italic">{children}</em>;
}

export function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>;
}

/* ------------------------------------------------------------- callouts ---- */

const CALLOUT = {
  intuition: { label: "Intuition", rail: "var(--accent)" },
  gotcha: { label: "Gotcha", rail: "var(--series-5)" },
  aside: { label: "Aside", rail: "var(--faint)" },
  recall: { label: "Worth memorising", rail: "var(--accent-2)" },
} as const;

export function Callout({
  kind = "intuition",
  title,
  children,
}: {
  kind?: keyof typeof CALLOUT;
  title?: string;
  children: ReactNode;
}) {
  const c = CALLOUT[kind];
  return (
    <aside
      className="bg-sunken/60 py-4 pl-5 pr-4 [&>*+*]:mt-3"
      style={{ borderLeft: `2px solid ${c.rail}` }}
    >
      <p className="label" style={{ color: c.rail }}>
        {title ?? c.label}
      </p>
      <div className="text-[0.97em] leading-relaxed text-muted [&>*+*]:mt-3">{children}</div>
    </aside>
  );
}

export function TLDR({ children }: { children: ReactNode }) {
  return (
    <div className="border border-rule bg-raised px-5 py-4">
      <p className="label text-accent">The short version</p>
      <div className="mt-2 text-[0.97em] leading-relaxed text-muted [&>*+*]:mt-2.5">{children}</div>
    </div>
  );
}

export function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div className="rule-t rule-b py-6">
      <p className="label text-faint">What to carry away</p>
      <ul className="mt-4 space-y-3">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3.5">
            <span className="mt-[0.45em] font-mono text-[0.7rem] leading-none text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[0.97em] leading-relaxed text-muted">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------- code ---- */

export function CodeBlock({
  code,
  lang = "python",
  caption,
}: {
  code: string;
  lang?: Lang;
  caption?: string;
}) {
  const body = code.replace(/^\n/, "").replace(/\s+$/, "");
  return (
    <figure className="not-prose">
      <div className="border border-rule bg-code">
        <div className="flex items-center justify-between border-b border-rule px-4 py-2">
          <span className="label text-faint">{lang}</span>
          <CopyButton text={body} />
        </div>
        <pre className="overflow-x-auto px-4 py-4">
          <code className="font-mono text-[0.8rem] leading-[1.75]">{highlight(body, lang)}</code>
        </pre>
      </div>
      {caption && <figcaption className="mt-2 font-mono text-[0.72rem] text-faint">{caption}</figcaption>}
    </figure>
  );
}

/* ------------------------------------------------------------- formulae ---- */

/**
 * Formulae are typeset, not rendered by a maths engine. For the level of
 * notation these pieces use — sums, subscripts, fractions of one term — that
 * is enough, and it keeps the page free of a 300 KB dependency.
 */
export function Formula({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <figure className="my-2 border-y border-rule py-5 text-center">
      <div className="overflow-x-auto px-2 font-display text-[1.15rem] italic tracking-wide text-ink sm:text-[1.3rem]">
        {children}
      </div>
      {note && <figcaption className="mt-3 font-mono text-[0.72rem] text-faint">{note}</figcaption>}
    </figure>
  );
}

/** Subscript / superscript that keep the serif italic maths look. */
export function Sub({ children }: { children: ReactNode }) {
  return <sub className="text-[0.7em] not-italic">{children}</sub>;
}
export function Sup({ children }: { children: ReactNode }) {
  return <sup className="text-[0.7em] not-italic">{children}</sup>;
}

/* -------------------------------------------------------------- figures ---- */

export function Figure({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="not-prose my-2">
      {children}
      {caption && (
        <figcaption className="mt-3 border-t border-rule pt-2.5 font-mono text-[0.72rem] leading-relaxed text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Divider() {
  return (
    <div className="flex justify-center py-4" aria-hidden="true">
      <span className="font-mono text-sm tracking-[0.6em] text-faint">···</span>
    </div>
  );
}

/** A small two-column reference table. */
export function DataTable({
  head,
  rows,
}: {
  head: string[];
  rows: (ReactNode[])[];
}) {
  return (
    <div className="not-prose overflow-x-auto border border-rule">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-rule bg-sunken/60">
            {head.map((h) => (
              <th key={h} className="label px-4 py-2.5 text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-rule last:border-0">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 align-top text-[0.85rem] leading-relaxed ${
                    j === 0 ? "font-mono text-ink" : "text-muted"
                  }`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
