import { ImageResponse } from "next/og";
import { posts, getPost } from "@/lib/content";
import { site } from "@/lib/site";

export const alt = "Article preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.meta.slug }));
}

export default async function OG(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const meta = getPost(slug)?.meta;

  const title = meta?.title ?? site.name;
  const tags = meta?.tags ?? [];
  const mins = meta?.readMinutes;

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
          padding: "60px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 21, letterSpacing: 6, color: "#645c4e", textTransform: "uppercase" }}>
            {site.name}
          </div>
          <div style={{ width: 9, height: 9, background: "#c4451c" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: title.length > 44 ? 68 : 82,
              lineHeight: 1.07,
              color: "#17140f",
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          {meta?.summary && (
            <div style={{ fontSize: 26, color: "#645c4e", marginTop: 24, maxWidth: 900, lineHeight: 1.4 }}>
              {meta.summary.length > 150 ? `${meta.summary.slice(0, 147).replace(/[\s,;:—-]+\S*$/, "")}…` : meta.summary}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #e3dbcb",
            paddingTop: 22,
            fontSize: 21,
            color: "#948b7c",
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            {tags.slice(0, 3).map((t) => (
              <div key={t}>{`#${t}`}</div>
            ))}
          </div>
          {mins ? <div>{`${mins} min read`}</div> : <div />}
        </div>
      </div>
    ),
    size,
  );
}
