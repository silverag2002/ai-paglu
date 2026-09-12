import { posts } from "@/content/posts";
import { notes } from "@/content/notes";
import { visuals } from "@/content/visuals";
import { roadmap } from "@/content/roadmap";

export { posts, notes, visuals, roadmap };

/** Newest first. */
export const allPosts = [...posts].sort((a, b) =>
  b.meta.published.localeCompare(a.meta.published),
);

export const allNotes = [...notes].sort((a, b) => b.meta.updated.localeCompare(a.meta.updated));

export const featuredPost = allPosts.find((p) => p.meta.featured) ?? allPosts[0];

export const getPost = (slug: string) => posts.find((p) => p.meta.slug === slug);
export const getNote = (slug: string) => notes.find((n) => n.meta.slug === slug);
export const getVisual = (slug: string) => visuals.find((v) => v.meta.slug === slug);

/** Previous / next within the chronological index, for the end of an article. */
export function neighbours(slug: string) {
  const i = allPosts.findIndex((p) => p.meta.slug === slug);
  return {
    newer: i > 0 ? allPosts[i - 1].meta : undefined,
    older: i >= 0 && i < allPosts.length - 1 ? allPosts[i + 1].meta : undefined,
  };
}

export type TagCount = { tag: string; count: number };

/** Every tag used anywhere, most-used first, then alphabetical. */
export function allTags(): TagCount[] {
  const counts = new Map<string, number>();
  const bump = (t: string) => counts.set(t, (counts.get(t) ?? 0) + 1);
  posts.forEach((p) => p.meta.tags.forEach(bump));
  notes.forEach((n) => n.meta.tags.forEach(bump));
  visuals.forEach((v) => v.meta.tags.forEach(bump));
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function byTag(tag: string) {
  return {
    posts: allPosts.filter((p) => p.meta.tags.includes(tag)).map((p) => p.meta),
    notes: allNotes.filter((n) => n.meta.tags.includes(tag)).map((n) => n.meta),
    visuals: visuals.filter((v) => v.meta.tags.includes(tag)).map((v) => v.meta),
  };
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
