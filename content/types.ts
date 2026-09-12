export type Level = "intuition" | "working" | "deep";

export type PostMeta = {
  slug: string;
  title: string;
  /** One or two sentences. Used on the index, in <meta description> and in link previews. */
  summary: string;
  tags: string[];
  /** ISO date, YYYY-MM-DD. */
  published: string;
  updated?: string;
  readMinutes: number;
  level: Level;
  /** Pulled out on the index and the home page. At most one post should set this. */
  featured?: boolean;
};

export type NoteMeta = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  updated: string;
  /** Short label for the card corner, e.g. "shapes", "checklist". */
  kind: string;
};

export type VisualMeta = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** What the reader should be able to do with it, in a few words. */
  interaction: string;
};

export type RoadmapStatus = "shipped" | "building" | "queued";

export type RoadmapItem = {
  title: string;
  status: RoadmapStatus;
  note: string;
  tags: string[];
  /** Slug of the piece that shipped, if any. */
  href?: string;
};

export type Entry<M> = { meta: M; Component: React.ComponentType };
