import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf7f1",
          borderLeft: "14px solid #c4451c",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: "#645c4e",
              textTransform: "uppercase",
            }}
          >
            {site.name}
          </div>
          <div style={{ width: 9, height: 9, background: "#c4451c" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.08,
              color: "#17140f",
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Hard ideas, explained until they stop being hard.
          </div>
          <div style={{ fontSize: 28, color: "#645c4e", marginTop: 26, maxWidth: 880 }}>
            Transformers, embeddings, diffusion, video — written while learning them.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 26,
            fontSize: 21,
            color: "#948b7c",
            borderTop: "1px solid #e3dbcb",
            paddingTop: 22,
          }}
        >
          <div>writing</div>
          <div>·</div>
          <div>notes</div>
          <div>·</div>
          <div>visuals</div>
          <div>·</div>
          <div>roadmap</div>
        </div>
      </div>
    ),
    size,
  );
}
