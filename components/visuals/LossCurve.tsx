"use client";

import { useRef, useState } from "react";
import { VisualFrame, Legend } from "./VisualFrame";

const TRAIN = [
  2.41, 1.98, 1.72, 1.53, 1.39, 1.28, 1.19, 1.11, 1.04, 0.98, 0.92, 0.87, 0.82, 0.77, 0.73, 0.69,
  0.65, 0.61, 0.58, 0.55, 0.52, 0.49, 0.47, 0.44,
];
const VAL = [
  2.44, 2.05, 1.81, 1.64, 1.52, 1.44, 1.38, 1.34, 1.31, 1.29, 1.28, 1.27, 1.26, 1.28, 1.31, 1.35,
  1.4, 1.46, 1.53, 1.6, 1.68, 1.76, 1.85, 1.94,
];

const W = 760;
const H = 300;
const PAD = { t: 18, r: 78, b: 34, l: 44 };
const Y_MIN = 0.2;
const Y_MAX = 2.6;

const x = (i: number) => PAD.l + (i / (TRAIN.length - 1)) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);
const path = (d: number[]) => d.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");

const BEST = VAL.indexOf(Math.min(...VAL));

export function LossCurve() {
  const [hi, setHi] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);

  function locate(clientX: number) {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((clientX - box.left) / box.width) * W;
    const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (TRAIN.length - 1));
    setHi(Math.max(0, Math.min(TRAIN.length - 1, i)));
  }

  return (
    <VisualFrame
      label="Training run"
      title="24 epochs · 12M params"
      caption={
        <>
          The gap after epoch 13 is the whole story: training loss keeps falling while validation
          loss climbs. The model is still learning — it is just learning the training set rather
          than the task. The checkpoint you ship is the marked one, not the last one.
        </>
      }
    >
      <div className="relative">
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none"
          role="img"
          aria-label="Line chart of training and validation loss across 24 epochs. Training loss falls from 2.41 to 0.44. Validation loss falls to a minimum of 1.26 at epoch 13, then rises to 1.94."
          onPointerMove={(e) => locate(e.clientX)}
          onPointerLeave={() => setHi(null)}
        >
          {/* grid — recessive, never competes with the data */}
          {[0.5, 1.0, 1.5, 2.0, 2.5].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--rule)" strokeWidth="1" />
              <text
                x={PAD.l - 9}
                y={y(v) + 4}
                textAnchor="end"
                className="font-mono"
                fontSize="11"
                fill="var(--faint)"
              >
                {v.toFixed(1)}
              </text>
            </g>
          ))}

          {/* x axis */}
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--rule)" strokeWidth="1" />
          {[0, 5, 11, 17, 23].map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - PAD.b + 17}
              textAnchor="middle"
              className="font-mono"
              fontSize="11"
              fill="var(--faint)"
            >
              {i + 1}
            </text>
          ))}
          <text
            x={PAD.l}
            y={H - 4}
            className="font-mono"
            fontSize="10"
            fill="var(--faint)"
            letterSpacing="1.2"
          >
            EPOCH
          </text>

          {/* best-checkpoint annotation, drawn under the lines */}
          <line
            x1={x(BEST)}
            x2={x(BEST)}
            y1={PAD.t}
            y2={H - PAD.b}
            stroke="var(--faint)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <text
            x={x(BEST) + 7}
            y={PAD.t + 11}
            className="font-mono"
            fontSize="10.5"
            fill="var(--muted)"
          >
            best checkpoint
          </text>

          <path d={path(TRAIN)} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinecap="round" />
          <path
            d={path(VAL)}
            fill="none"
            stroke="var(--series-2)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="7 5"
          />

          {/* direct labels — the legend below repeats them, so identity never rests on colour */}
          <text x={x(23) + 10} y={y(TRAIN[23]) + 4} className="font-mono" fontSize="11.5" fill="var(--muted)">
            train
          </text>
          <text x={x(23) + 10} y={y(VAL[23]) + 4} className="font-mono" fontSize="11.5" fill="var(--muted)">
            val
          </text>

          {hi !== null && (
            <g>
              <line
                x1={x(hi)}
                x2={x(hi)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke="var(--ink)"
                strokeWidth="1"
                opacity="0.45"
              />
              {[
                { v: TRAIN[hi], c: "var(--series-1)" },
                { v: VAL[hi], c: "var(--series-2)" },
              ].map((p, i) => (
                <circle
                  key={i}
                  cx={x(hi)}
                  cy={y(p.v)}
                  r="4.5"
                  fill={p.c}
                  stroke="var(--raised)"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}
        </svg>

        {hi !== null && (
          <div
            className="pointer-events-none absolute top-1 border border-rule bg-raised px-3 py-2 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]"
            style={{
              left: `${(x(hi) / W) * 100}%`,
              transform: hi > TRAIN.length / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
            }}
          >
            <p className="label text-faint">Epoch {hi + 1}</p>
            <dl className="mt-1.5 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-3.5" style={{ background: "var(--series-1)" }} />
                <dt className="font-mono text-[0.7rem] text-muted">train</dt>
                <dd className="ml-auto font-mono text-[0.75rem] text-ink">{TRAIN[hi].toFixed(2)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-0.5 w-3.5"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to right, var(--series-2) 0 5px, transparent 5px 9px)",
                  }}
                />
                <dt className="font-mono text-[0.7rem] text-muted">val</dt>
                <dd className="ml-auto font-mono text-[0.75rem] text-ink">{VAL[hi].toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3">
        <Legend
          items={[
            { color: "var(--series-1)", label: "training loss" },
            { color: "var(--series-2)", label: "validation loss", dash: true },
          ]}
        />
        <p className="font-mono text-[0.7rem] text-faint">min val {VAL[BEST].toFixed(2)} @ epoch {BEST + 1}</p>
      </div>
    </VisualFrame>
  );
}
