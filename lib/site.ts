/**
 * Single place to edit site-wide identity. Nothing else should hardcode these.
 */
export const site = {
  name: "AI Paglu",
  /** Shown under the wordmark and in link previews. */
  tagline: "Working notes on how AI actually works",
  description:
    "Long-form explainers, revision notes and hand-built diagrams for transformers, embeddings, diffusion and video models — written while learning them, for anyone learning them.",
  /** Set this to the real domain before deploying: it drives OG images, sitemap and canonical URLs. */
  url: "https://aipaglu.com",
  /** Leave a value empty and the link is not rendered. */
  socials: {
    x: "",
    linkedin: "",
    github: "",
  },
} as const;

export const nav = [
  { href: "/writing", label: "Writing", blurb: "Long-form explainers" },
  { href: "/notes", label: "Notes", blurb: "Revision cheatsheets" },
  { href: "/visuals", label: "Visuals", blurb: "Diagrams you can poke at" },
  { href: "/roadmap", label: "Roadmap", blurb: "What is coming next" },
] as const;
