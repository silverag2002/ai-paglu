import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { allPosts, allNotes, visuals, allTags } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string) => `${site.url}${path}`;
  const now = new Date();

  return [
    { url: u("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: u("/writing"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: u("/notes"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: u("/visuals"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: u("/roadmap"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...allPosts.map((p) => ({
      url: u(`/writing/${p.meta.slug}`),
      lastModified: new Date(p.meta.updated ?? p.meta.published),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...allNotes.map((n) => ({
      url: u(`/notes/${n.meta.slug}`),
      lastModified: new Date(n.meta.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...visuals.map((v) => ({
      url: u(`/visuals/${v.meta.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...allTags().map((t) => ({
      url: u(`/topics/${t.tag}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
