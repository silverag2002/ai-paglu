"use client";

import { useState } from "react";
import { VisualFrame, Legend } from "./VisualFrame";

type Pt = { w: string; x: number; y: number; g: 0 | 1 | 2 };

/** A flattened, hand-placed projection — real embeddings live in 512+ dimensions
 *  and any 2D picture of them is a lie you agree to for a minute. */
const PTS: Pt[] = [
  { w: "man", x: 62, y: 74, g: 0 },
  { w: "woman", x: 62, y: 58, g: 0 },
  { w: "king", x: 80, y: 74, g: 0 },
  { w: "queen", x: 80, y: 58, g: 0 },
  { w: "prince", x: 88, y: 81, g: 0 },
  { w: "princess", x: 88, y: 51, g: 0 },
  { w: "cat", x: 20, y: 26, g: 1 },
  { w: "dog", x: 27, y: 21, g: 1 },
  { w: "horse", x: 14, y: 34, g: 1 },
  { w: "mouse", x: 25, y: 33, g: 1 },
  { w: "kitten", x: 15, y: 19, g: 1 },
  { w: "paris", x: 18, y: 78, g: 2 },
  { w: "tokyo", x: 27, y: 86, g: 2 },
  { w: "london", x: 11, y: 70, g: 2 },
  { w: "delhi", x: 30, y: 73, g: 2 },
];

const GROUPS = [
  { label: "people & royalty", color: "var(--series-1)" },
  { label: "animals", color: "var(--series-2)" },
  { label: "cities", color: "var(--series-4)" },
];

const W = 620;
const H = 380;
const px = (x: number) => 34 + (x / 100) * (W - 70);
const py = (y: number) => 26 + ((100 - y) / 100) * (H - 60);

const at = (w: string) => PTS.find((p) => p.w === w)!;

export function EmbeddingSpace() {
  const [hover, setHover] = useState<string | null>(null);
  const [showAnalogy, setShowAnalogy] = useState(true);

  const hp = hover ? at(hover) : null;

  return (
    <VisualFrame
      label="Embeddings"
      title="15 words · flattened to 2D"
      caption={
        <>
          The axes are deliberately unlabelled — no single dimension of a real embedding means
          anything on its own. What means something is <em>direction</em>: the arrow from{" "}
          <span className="font-mono text-[0.9em]">man</span> to{" "}
          <span className="font-mono text-[0.9em]">king</span> and the arrow from{" "}
          <span className="font-mono text-[0.9em]">woman</span> to{" "}
          <span className="font-mono text-[0.9em]">queen</span> are the same arrow. That shared
          arrow is the closest thing the model has to a concept of royalty.
        </>
      }
    >
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[26rem]"
          role="img"
          aria-label="Scatter plot of 15 word embeddings flattened to two dimensions, clustered into people and royalty, animals, and cities. Arrows from man to king and from woman to queen are parallel and the same length."
        >
          <defs>
            <marker id="es-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0 0 L7 3.5 L0 7 z" fill="var(--accent)" />
            </marker>
            <pattern id="es-grid" width="31" height="31" patternUnits="userSpaceOnUse">
              <path d="M31 0 L0 0 0 31" fill="none" stroke="var(--rule)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="0" y="0" width={W} height={H} fill="url(#es-grid)" opacity="0.5" />

          {showAnalogy && (
            <g>
              {[
                ["man", "king"],
                ["woman", "queen"],
              ].map(([a, b]) => (
                <line
                  key={a}
                  x1={px(at(a).x) + 13}
                  y1={py(at(a).y)}
                  x2={px(at(b).x) - 13}
                  y2={py(at(b).y)}
                  stroke="var(--accent)"
                  strokeWidth="2"
                  markerEnd="url(#es-arrow)"
                />
              ))}
              <text
                x={(px(at("man").x) + px(at("king").x)) / 2}
                y={py(at("man").y) - 12}
                textAnchor="middle"
                className="font-mono"
                fontSize="11"
                fill="var(--muted)"
              >
                + royalty
              </text>
              <text
                x={(px(at("woman").x) + px(at("queen").x)) / 2}
                y={py(at("woman").y) + 22}
                textAnchor="middle"
                className="font-mono"
                fontSize="11"
                fill="var(--muted)"
              >
                + royalty
              </text>
            </g>
          )}

          {PTS.map((p) => {
            const dim = hover !== null && hover !== p.w && hp?.g !== p.g;
            return (
              <g
                key={p.w}
                opacity={dim ? 0.28 : 1}
                onMouseEnter={() => setHover(p.w)}
                onMouseLeave={() => setHover(null)}
                className="cursor-default transition-opacity"
              >
                <circle
                  cx={px(p.x)}
                  cy={py(p.y)}
                  r={hover === p.w ? 7 : 5}
                  fill={GROUPS[p.g].color}
                  stroke="var(--raised)"
                  strokeWidth="2"
                />
                <text
                  x={px(p.x) + 11}
                  y={py(p.y) + 4}
                  className="font-mono"
                  fontSize="11.5"
                  fill={hover === p.w ? "var(--ink)" : "var(--muted)"}
                >
                  {p.w}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-3">
        <Legend items={GROUPS.map((g) => ({ color: g.color, label: g.label }))} />
        <button
          type="button"
          onClick={() => setShowAnalogy((v) => !v)}
          aria-pressed={showAnalogy}
          className={`label border px-2.5 py-1.5 transition-colors ${
            showAnalogy
              ? "border-accent bg-accent-soft text-accent"
              : "border-rule text-muted hover:border-accent/60"
          }`}
        >
          king − man + woman
        </button>
      </div>
    </VisualFrame>
  );
}
