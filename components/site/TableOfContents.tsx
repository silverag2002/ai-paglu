"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Reads the headings out of the rendered article rather than asking every post
 * to declare them twice. The DOM is the source, so it is subscribed to as
 * external state; no JS means no table of contents, which is fine.
 */
const listeners = new Set<() => void>();
let cached = "";

function subscribe(fn: () => void) {
  listeners.add(fn);
  if (listeners.size === 1) {
    const mo = new MutationObserver(() => listeners.forEach((l) => l()));
    mo.observe(document.body, { childList: true, subtree: true });
    observer = mo;
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

let observer: MutationObserver | null = null;

function makeSnapshot(containerId: string) {
  return () => {
    const root = document.getElementById(containerId);
    const hs = root ? Array.from(root.querySelectorAll<HTMLHeadingElement>("h2[id]")) : [];
    const next = hs
      .map((h) => `${h.id}\t${h.textContent?.replace(/#$/, "").trim() ?? ""}`)
      .join("\n");
    // Return a stable string so React can compare snapshots by value.
    if (next !== cached) cached = next;
    return cached;
  };
}

const serverSnapshot = () => "";

export function TableOfContents({ containerId }: { containerId: string }) {
  const serialised = useSyncExternalStore(subscribe, makeSnapshot(containerId), serverSnapshot);
  const [active, setActive] = useState("");

  const items = serialised
    ? serialised.split("\n").map((row) => {
        const [id, text] = row.split("\t");
        return { id, text };
      })
    : [];

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const hs = Array.from(root.querySelectorAll<HTMLHeadingElement>("h2[id]"));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    hs.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [containerId, serialised]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className="border-l border-rule pl-4">
      <p className="label text-faint">On this page</p>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "location" : undefined}
              className={`block font-mono text-[0.72rem] leading-snug transition-colors ${
                active === it.id ? "text-accent" : "text-faint hover:text-ink"
              }`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
