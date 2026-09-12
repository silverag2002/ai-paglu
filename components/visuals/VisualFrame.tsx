import type { ReactNode } from "react";

/**
 * Shared chrome so every diagram on the site frames itself the same way:
 * a label, the thing, and a caption that says what to look at.
 */
export function VisualFrame({
  label,
  title,
  caption,
  children,
}: {
  label: string;
  title?: string;
  caption?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="not-prose min-w-0 border border-rule bg-raised">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule px-4 py-2.5 sm:px-5">
        <span className="label text-accent">{label}</span>
        {title && <span className="font-mono text-[0.72rem] text-faint">{title}</span>}
      </div>
      <div className="px-4 py-5 sm:px-5">{children}</div>
      {caption && (
        <figcaption className="border-t border-rule px-4 py-3 text-[0.82rem] leading-relaxed text-muted sm:px-5">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Legend row. Identity is never carried by colour alone — every swatch is named. */
export function Legend({ items }: { items: { color: string; label: string; dash?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="block h-0.5 w-5 shrink-0"
            style={
              it.dash
                ? { backgroundImage: `repeating-linear-gradient(to right, ${it.color} 0 5px, transparent 5px 9px)` }
                : { background: it.color }
            }
          />
          <span className="font-mono text-[0.72rem] text-muted">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
