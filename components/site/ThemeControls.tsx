"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  palettes,
  layouts,
  STORAGE,
  type PaletteKey,
  type ThemeMode,
  type LayoutKey,
} from "@/lib/themes";

/**
 * The <html> attributes are the source of truth — the boot script sets them
 * before React exists, and this control edits them. So they are read as
 * external state rather than mirrored into component state, which keeps the
 * control and the page from ever disagreeing on the first paint.
 */
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const snapshot = (attr: string, fallback: string) => () =>
  document.documentElement.getAttribute(attr) ?? fallback;
const serverSnapshot = (fallback: string) => () => fallback;

function useHtmlAttr<T extends string>(attr: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    snapshot(attr, fallback),
    serverSnapshot(fallback),
  ) as T;
}

export function ThemeControls() {
  const palette = useHtmlAttr<PaletteKey>("data-palette", "ink");
  const theme = useHtmlAttr<ThemeMode>("data-theme", "light");
  const layout = useHtmlAttr<LayoutKey>("data-layout", "editorial");
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function apply(attr: string, storageKey: string, value: string) {
    document.documentElement.setAttribute(attr, value);
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      /* private mode — the choice just won't persist */
    }
    listeners.forEach((fn) => fn());
  }

  const current = palettes.find((p) => p.key === palette) ?? palettes[0];
  const swatch = theme === "dark" ? current.dark : current.light;

  return (
    <div className="flex items-center gap-1.5">
      {/* Light / dark */}
      <button
        type="button"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Light mode" : "Dark mode"}
        onClick={() => {
          apply("data-theme", STORAGE.theme, theme === "dark" ? "light" : "dark");
        }}
        className="grid h-8 w-8 place-items-center border border-rule text-muted transition-colors hover:border-accent hover:text-accent"
      >
        {theme === "dark" ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line
                key={a}
                x1="12"
                y1="2.6"
                x2="12"
                y2="5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                transform={`rotate(${a} 12 12)`}
              />
            ))}
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Palette + layout popover */}
      <div className="relative" ref={popRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Change palette and layout"
          title="Palette and layout"
          onClick={() => setOpen((o) => !o)}
          className="flex h-8 items-center gap-1.5 border border-rule px-2 text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <span className="flex" aria-hidden="true">
            {swatch.map((c, i) => (
              <span
                key={i}
                className="h-3.5 w-2 border border-rule"
                style={{ background: c, marginLeft: i ? -1 : 0 }}
              />
            ))}
          </span>
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 3.2 5 7l4-3.8" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-64 border border-rule bg-raised p-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]"
          >
            <p className="label text-faint">Palette</p>
            <div className="mt-2 space-y-0.5">
              {palettes.map((p) => {
                const sw = theme === "dark" ? p.dark : p.light;
                const active = p.key === palette;
                return (
                  <button
                    key={p.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      apply("data-palette", STORAGE.palette, p.key);
                    }}
                    className={`flex w-full items-center gap-2.5 px-2 py-1.5 text-left transition-colors ${
                      active ? "bg-accent-soft" : "hover:bg-sunken"
                    }`}
                  >
                    <span className="flex shrink-0" aria-hidden="true">
                      {sw.map((c, i) => (
                        <span
                          key={i}
                          className="h-4 w-2.5 border border-rule"
                          style={{ background: c, marginLeft: i ? -1 : 0 }}
                        />
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block truncate font-mono text-[0.78rem] ${
                          active ? "text-accent" : "text-ink"
                        }`}
                      >
                        {p.name}
                      </span>
                      <span className="block truncate font-mono text-[0.68rem] text-faint">
                        {p.note}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="label mt-4 text-faint">Layout</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {layouts.map((l) => {
                const active = l.key === layout;
                return (
                  <button
                    key={l.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    title={l.note}
                    onClick={() => {
                      apply("data-layout", STORAGE.layout, l.key);
                    }}
                    className={`border px-2 py-2 text-left transition-colors ${
                      active
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-rule text-muted hover:border-accent/60"
                    }`}
                  >
                    <svg width="34" height="18" viewBox="0 0 34 18" aria-hidden="true" fill="none">
                      {l.key === "editorial" ? (
                        <>
                          <rect x="9" y="2" width="16" height="3" fill="currentColor" opacity=".85" />
                          <rect x="9" y="7.5" width="16" height="1.6" fill="currentColor" opacity=".4" />
                          <rect x="9" y="11" width="16" height="1.6" fill="currentColor" opacity=".4" />
                          <rect x="9" y="14.5" width="11" height="1.6" fill="currentColor" opacity=".4" />
                        </>
                      ) : (
                        <>
                          <rect x="1" y="2" width="7" height="1.8" fill="currentColor" opacity=".6" />
                          <rect x="1" y="5.5" width="7" height="1.8" fill="currentColor" opacity=".35" />
                          <rect x="1" y="9" width="7" height="1.8" fill="currentColor" opacity=".35" />
                          <rect x="12" y="2" width="21" height="2.6" fill="currentColor" opacity=".85" />
                          <rect x="12" y="6.6" width="21" height="1.5" fill="currentColor" opacity=".4" />
                          <rect x="12" y="10" width="21" height="1.5" fill="currentColor" opacity=".4" />
                          <rect x="12" y="13.4" width="14" height="1.5" fill="currentColor" opacity=".4" />
                        </>
                      )}
                    </svg>
                    <span className="mt-1 block font-mono text-[0.72rem]">{l.name}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 font-mono text-[0.66rem] leading-relaxed text-faint">
              Saved in this browser. Nothing is sent anywhere.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}