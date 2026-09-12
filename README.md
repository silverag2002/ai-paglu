# AI Paglu

A learning-in-public site for AI/ML notes: long-form explainers, revision
cheatsheets, and hand-built interactive diagrams.

```bash
npm run dev     # http://localhost:3000
npm run build   # everything prerenders statically
npm run lint
```

## Before deploying

Set the real domain in `lib/site.ts` — it drives canonical URLs, the sitemap and
OG image URLs. Social links left empty are simply not rendered.

## Adding a topic

Content is TSX modules: each piece is a React component plus a `meta` export, so
prose, diagrams and interactive components live in one file with full type
checking. Two steps, always.

### An article

1. Create `content/posts/<slug>.tsx`:

   ```tsx
   import type { PostMeta } from "@/content/types";
   import { Lead, P, H2, Callout, CodeBlock, KeyTakeaways } from "@/components/prose";

   export const meta: PostMeta = {
     slug: "rotary-embeddings",
     title: "Rotary position embeddings",
     summary: "One or two sentences — used on the index, in search results and in link previews.",
     tags: ["transformers", "positions"],
     published: "2026-09-20",
     readMinutes: 8,
     level: "working", // intuition | working | deep
   };

   export default function Article() {
     return (
       <>
         <Lead>The opening line that makes someone keep reading.</Lead>
         <H2>First section</H2>
         <P>…</P>
       </>
     );
   }
   ```

2. Add one line to `content/posts/index.ts`.

The index, topic pages, sitemap, prev/next links and OG image all pick it up
automatically. `slug` must match the filename.

### A note or a visual

Identical shape — `content/notes/<slug>.tsx` + `content/notes/index.ts`, or an
entry in `content/visuals/index.tsx` pointing at a component in
`components/visuals/`.

## Writing vocabulary

Import from `@/components/prose` rather than writing raw HTML, so every piece
stays consistent and restyling happens in one file:

`Lead` `P` `H2` `H3` `Ul`/`Li` `Ol`/`Step` `IC` (inline code) `B` `Em`
`Callout` (`intuition` | `gotcha` | `aside` | `recall`) `TLDR` `KeyTakeaways`
`CodeBlock` `Formula`/`Sub`/`Sup` `Figure` `DataTable` `Divider`

`H2` generates its own id, and the table of contents reads the rendered page —
nothing to declare twice.

## Themes

Four palettes (`ink`, `moss`, `dusk`, `slate`), each with a real light and dark
mode, plus two layouts (`editorial`, `atlas`). Readers switch from the header;
the choice is stored in their browser only.

Link a specific look directly: `/?palette=dusk&theme=dark&layout=atlas`.

- Colours: `app/globals.css`, one block per palette. Components only ever use
  semantic tokens (`bg-raised`, `text-muted`, `border-rule`, `text-accent`), so a
  new palette needs no component changes.
- Picker entries: `lib/themes.ts`.
- Chart series (`--series-1…5`) are shared across palettes on purpose — a series
  colour identifies the data, not the theme. Both sets are validated for
  colour-blind separation and contrast against every surface.

To lock one look in as the default: change the fallbacks in the boot script in
`app/layout.tsx` and the `data-*` attributes on `<html>` beside it.
