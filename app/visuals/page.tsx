import type { Metadata } from "next";
import { visuals } from "@/lib/content";
import { PageHeader, VisualCard } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Visuals",
  description:
    "Hand-built, interactive diagrams: attention heatmaps, tensor shapes, loss curves, embedding space, diffusion steps.",
};

export default function VisualsIndex() {
  return (
    <>
      <PageHeader
        label="Visuals"
        title="Diagrams you can interrogate"
        intro={
          <>
            Every diagram here is built from real numbers and responds to being poked at. A static
            picture of attention tells you it exists; a heatmap you can hover tells you what it
            chose, and why that was surprising.
          </>
        }
      />

      <div className="page band-tight">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visuals.map((v) => (
            <VisualCard key={v.meta.slug} meta={v.meta} />
          ))}
        </div>
      </div>
    </>
  );
}
