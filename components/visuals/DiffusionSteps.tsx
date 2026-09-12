"use client";

import { useId, useState } from "react";
import { VisualFrame } from "./VisualFrame";

const STEPS = 10;

/** The thing being denoised. Deliberately simple — the point is the noise. */
function Scene({ filter }: { filter?: string }) {
  return (
    <g filter={filter}>
      <rect x="0" y="0" width="120" height="90" fill="var(--sunken)" />
      <circle cx="84" cy="26" r="13" fill="var(--accent)" />
      <path d="M0 90 L34 46 L64 90 Z" fill="var(--series-2)" />
      <path d="M40 90 L78 54 L120 90 Z" fill="var(--series-4)" opacity="0.9" />
      <rect x="0" y="82" width="120" height="8" fill="var(--ink)" opacity="0.16" />
    </g>
  );
}

function Frame({
  step,
  seed,
  label,
}: {
  step: number;
  seed: number;
  label: string;
}) {
  const uid = useId().replace(/:/g, "");
  const t = step / STEPS; // 0 = pure noise, 1 = clean
  const noise = Math.max(0, 1 - t);

  return (
    <figure className="min-w-0 flex-1">
      <svg viewBox="0 0 120 90" className="w-full border border-rule" aria-hidden="true">
        <defs>
          <filter id={`d-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.09"
              numOctaves="3"
              seed={seed}
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={noise * 46} />
          </filter>
          <filter id={`g-${uid}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="2"
              seed={seed}
              result="g"
            />
            <feColorMatrix
              in="g"
              type="matrix"
              values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1 0"
            />
          </filter>
        </defs>

        <Scene filter={`url(#d-${uid})`} />
        <rect
          x="0"
          y="0"
          width="120"
          height="90"
          filter={`url(#g-${uid})`}
          opacity={noise * 0.85}
          style={{ mixBlendMode: "overlay" }}
        />
      </svg>
      <figcaption className="mt-1.5 text-center font-mono text-[0.66rem] text-faint">{label}</figcaption>
    </figure>
  );
}

export function DiffusionSteps() {
  const [step, setStep] = useState(3);
  const [linked, setLinked] = useState(false);

  return (
    <VisualFrame
      label="Diffusion"
      title="denoise, then do it again 24 times a second"
      caption={
        <>
          A diffusion model never draws. It starts from noise and repeatedly predicts what to
          subtract. For one image that is enough. For video it is not: run the same process on each
          frame independently and every frame lands on a slightly different picture — the flicker in
          the bottom row. Locking the starting noise across frames removes most of it, and is
          roughly where every video model begins.
        </>
      }
    >
      <Frame step={step} seed={7} label={`step ${step} of ${STEPS}`} />

      <div className="mt-4">
        <label htmlFor="diffusion-step" className="label text-faint">
          Denoising step
        </label>
        <input
          id="diffusion-step"
          type="range"
          min={0}
          max={STEPS}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between font-mono text-[0.66rem] text-faint">
          <span>pure noise</span>
          <span>clean image</span>
        </div>
      </div>

      <div className="mt-7 border-t border-rule pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label text-faint">Three consecutive video frames</p>
          <button
            type="button"
            onClick={() => setLinked((v) => !v)}
            aria-pressed={linked}
            className={`label border px-2.5 py-1.5 transition-colors ${
              linked
                ? "border-accent bg-accent-soft text-accent"
                : "border-rule text-muted hover:border-accent/60"
            }`}
          >
            {linked ? "noise is shared" : "share the noise"}
          </button>
        </div>

        <div className="mt-3 flex gap-2.5">
          {[0, 1, 2].map((f) => (
            <Frame
              key={f}
              step={step}
              seed={linked ? 7 : 7 + f * 31}
              label={`frame ${f + 1}`}
            />
          ))}
        </div>

        <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
          {linked
            ? "Same starting noise, same result. The frames agree — now the hard part is making them agree while still moving."
            : "Independent noise per frame. Every frame is a plausible image and no two of them are the same image. This is what temporal consistency work exists to fix."}
        </p>
      </div>
    </VisualFrame>
  );
}
