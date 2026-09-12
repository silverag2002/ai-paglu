"use client";

import { useState } from "react";
import { VisualFrame } from "./VisualFrame";

type Stage = {
  op: string;
  shape: (string | number)[];
  dims: string[];
  note: string;
  cost?: string;
};

/** One attention block, batch 8, context 256, model width 512, 8 heads. */
const STAGES: Stage[] = [
  {
    op: "token ids",
    shape: [8, 256],
    dims: ["batch", "context"],
    note: "Integers. Token 4021 is not 'bigger' than token 17 — at this point the numbers carry no meaning at all, they are just row numbers into a table.",
  },
  {
    op: "embedding lookup",
    shape: [8, 256, 512],
    dims: ["batch", "context", "width"],
    note: "Every id is swapped for its learned 512-number vector. This is a table lookup, not a matrix multiply — and it is where meaning first enters the model.",
  },
  {
    op: "project to Q, K, V",
    shape: [8, 8, 256, 64],
    dims: ["batch", "heads", "context", "head dim"],
    note: "Three separate linear maps, then 512 is split across 8 heads of 64. Nothing is duplicated — each head only ever sees its own slice, which is why heads can specialise.",
  },
  {
    op: "scores = Q · Kᵀ",
    shape: [8, 8, 256, 256],
    dims: ["batch", "heads", "query", "key"],
    note: "Every token scores every other token. This is the only place the context length appears twice, and it is the reason long context is expensive.",
    cost: "memory grows with context², not context",
  },
  {
    op: "mask, scale, softmax",
    shape: [8, 8, 256, 256],
    dims: ["batch", "heads", "query", "key"],
    note: "Divide by √64 so the scores do not saturate the softmax, blank out the future with −∞, then normalise. Afterwards every query row sums to exactly 1.",
  },
  {
    op: "weights · V",
    shape: [8, 8, 256, 64],
    dims: ["batch", "heads", "context", "head dim"],
    note: "The context² matrix collapses back down. Each token walks away with a weighted average of the value vectors it chose to look at.",
  },
  {
    op: "merge heads, project out",
    shape: [8, 256, 512],
    dims: ["batch", "context", "width"],
    note: "Heads are concatenated back to 512 and mixed by one more linear map. Same shape we started with after embedding — which is exactly why you can stack these blocks 32 deep.",
  },
];

export function TensorShapeFlow() {
  const [i, setI] = useState(0);
  const s = STAGES[i];

  return (
    <VisualFrame
      label="Shapes"
      title="one attention block · B=8 T=256 C=512 H=8"
      caption={
        <>
          Nearly every transformer bug I have written was a shape bug. Stepping the shapes by hand
          once is faster than debugging them five times.
        </>
      }
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          aria-label="Previous stage"
          className="grid h-8 w-8 shrink-0 place-items-center border border-rule text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-rule disabled:hover:text-muted"
        >
          ←
        </button>

        <ol className="flex flex-1 items-center gap-1" aria-label="Stages">
          {STAGES.map((st, n) => (
            <li key={st.op} className="flex-1">
              <button
                type="button"
                onClick={() => setI(n)}
                aria-current={n === i ? "step" : undefined}
                aria-label={`Stage ${n + 1}: ${st.op}`}
                className="block h-1.5 w-full transition-colors"
                style={{
                  background: n === i ? "var(--accent)" : n < i ? "var(--accent-soft)" : "var(--rule)",
                }}
              />
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => setI((v) => Math.min(STAGES.length - 1, v + 1))}
          disabled={i === STAGES.length - 1}
          aria-label="Next stage"
          className="grid h-8 w-8 shrink-0 place-items-center border border-rule text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-rule disabled:hover:text-muted"
        >
          →
        </button>
      </div>

      <p className="mt-5 font-mono text-[0.72rem] text-faint">
        {String(i + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
      </p>
      <h4 className="display mt-1 text-[1.35rem]">{s.op}</h4>

      <div className="mt-4 flex flex-wrap items-stretch gap-1.5" aria-label={`Shape ${s.shape.join(" by ")}`}>
        {s.shape.map((d, n) => (
          <div
            key={`${i}-${n}`}
            className="rise min-w-[4.5rem] flex-1 border border-rule bg-sunken/50 px-3 py-2.5"
            style={{ animationDelay: `${n * 55}ms` }}
          >
            <span className="block font-mono text-[1.05rem] text-accent">{d}</span>
            <span className="mt-0.5 block font-mono text-[0.65rem] leading-tight text-faint">
              {s.dims[n]}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[0.9rem] leading-relaxed text-muted">{s.note}</p>

      {s.cost && (
        <p className="mt-3 border-l-2 border-accent pl-3 font-mono text-[0.74rem] leading-relaxed text-accent">
          {s.cost}
        </p>
      )}
    </VisualFrame>
  );
}
