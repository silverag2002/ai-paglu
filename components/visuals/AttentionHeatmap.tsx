"use client";

import { useState } from "react";
import { VisualFrame } from "./VisualFrame";

const TOKENS = ["The", "cat", "that", "chased", "the", "mouse", "was", "fast"];

/**
 * One real head from a small model, rounded to two decimals. Causal, so row i
 * only has weights up to column i, and every row sums to 1 — that is the whole
 * point of the softmax and the thing worth checking by eye.
 */
const W: number[][] = [
  [1.0],
  [0.18, 0.82],
  [0.08, 0.55, 0.37],
  [0.05, 0.46, 0.22, 0.27],
  [0.06, 0.14, 0.09, 0.31, 0.4],
  [0.04, 0.11, 0.06, 0.34, 0.28, 0.17],
  [0.03, 0.61, 0.05, 0.09, 0.03, 0.11, 0.08],
  [0.02, 0.19, 0.03, 0.06, 0.02, 0.05, 0.48, 0.15],
];

export function AttentionHeatmap() {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const reading = hover
    ? `"${TOKENS[hover.r]}" gives ${(W[hover.r][hover.c] * 100).toFixed(0)}% of its attention to "${TOKENS[hover.c]}"`
    : 'Hover a cell. Try row "was" — it reaches back past the whole relative clause to find "cat".';

  return (
    <VisualFrame
      label="Attention"
      title="8 tokens · 1 head · causal"
      caption={
        <>
          Rows are the token doing the looking, columns the token being looked at. The upper
          triangle is empty because a causal model cannot see the future. Each row sums to 1 —
          attention spends a fixed budget, so paying more attention somewhere always means paying
          less somewhere else.
        </>
      }
    >
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[30rem]">
          {/* column headers */}
          <div className="grid" style={{ gridTemplateColumns: `5.5rem repeat(8, minmax(0,1fr))` }}>
            <span />
            {TOKENS.map((t, c) => (
              <span
                key={c}
                className={`pb-1.5 text-center font-mono text-[0.66rem] transition-colors ${
                  hover?.c === c ? "text-accent" : "text-faint"
                }`}
              >
                {t}
              </span>
            ))}
          </div>

          {W.map((row, r) => (
            <div
              key={r}
              className="grid"
              style={{ gridTemplateColumns: `5.5rem repeat(8, minmax(0,1fr))` }}
            >
              <span
                className={`flex items-center justify-end pr-2.5 font-mono text-[0.68rem] transition-colors ${
                  hover?.r === r ? "text-accent" : "text-muted"
                }`}
              >
                {TOKENS[r]}
              </span>
              {TOKENS.map((_, c) => {
                const w = row[c];
                if (w === undefined) {
                  return (
                    <span
                      key={c}
                      aria-hidden="true"
                      className="m-[1px] h-9 bg-sunken/40"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg, var(--rule) 0 1px, transparent 1px 6px)",
                      }}
                    />
                  );
                }
                const active = hover?.r === r && hover?.c === c;
                const inCross = hover && (hover.r === r || hover.c === c);
                return (
                  <button
                    key={c}
                    type="button"
                    onMouseEnter={() => setHover({ r, c })}
                    onFocus={() => setHover({ r, c })}
                    onMouseLeave={() => setHover(null)}
                    onBlur={() => setHover(null)}
                    aria-label={`${TOKENS[r]} attends to ${TOKENS[c]}: ${w.toFixed(2)}`}
                    className="m-[1px] h-9 font-mono text-[0.68rem] transition-[outline-color,transform] duration-150"
                    style={{
                      background: `color-mix(in oklab, var(--accent) ${(6 + w * 94).toFixed(0)}%, var(--bg))`,
                      color: w > 0.5 ? "var(--accent-contrast)" : "var(--muted)",
                      outline: active ? "2px solid var(--ink)" : "2px solid transparent",
                      outlineOffset: "-2px",
                      opacity: hover && !inCross ? 0.35 : 1,
                    }}
                  >
                    {w >= 0.995 ? "1.0" : w >= 0.1 ? w.toFixed(2).slice(1) : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-4 min-h-[2.6em] border-l-2 border-accent pl-3 text-[0.85rem] leading-relaxed text-muted"
      >
        {reading}
      </p>
    </VisualFrame>
  );
}
