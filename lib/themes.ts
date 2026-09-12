/**
 * Registry for the palette / layout switcher. The actual colours live in
 * app/globals.css — these swatches are only what the picker draws, so adding a
 * palette means: a block in globals.css + one entry here.
 */
export type PaletteKey = "ink" | "moss" | "dusk" | "slate";
export type ThemeMode = "light" | "dark";
export type LayoutKey = "editorial" | "atlas";

export type PaletteDef = {
  key: PaletteKey;
  name: string;
  note: string;
  /** [ground, accent, second accent] — drawn as the picker swatch. */
  light: [string, string, string];
  dark: [string, string, string];
};

export const palettes: PaletteDef[] = [
  {
    key: "ink",
    name: "Ink & Oxide",
    note: "Warm paper, vermilion",
    light: ["#faf7f1", "#c4451c", "#1f6f63"],
    dark: ["#14120e", "#ff7043", "#54c8b3"],
  },
  {
    key: "moss",
    name: "Moss & Clay",
    note: "Sage, terracotta",
    light: ["#f5f4ee", "#b0512e", "#3b7551"],
    dark: ["#0f120e", "#e68a5c", "#6fc490"],
  },
  {
    key: "dusk",
    name: "Indigo Dusk",
    note: "Indigo, saffron, teal",
    light: ["#f7f5f0", "#a9680a", "#16776c"],
    dark: ["#0e1230", "#f2ab43", "#45c4b3"],
  },
  {
    key: "slate",
    name: "Slate & Cyan",
    note: "Cool grey, deep cyan",
    light: ["#f6f8f8", "#0a6a73", "#b54415"],
    dark: ["#0a0f12", "#35d6c4", "#fb9350"],
  },
];

export const layouts: { key: LayoutKey; name: string; note: string }[] = [
  { key: "editorial", name: "Editorial", note: "One reading column, roomy" },
  { key: "atlas", name: "Atlas", note: "Topic rail, denser rows" },
];

export const STORAGE = {
  palette: "ap-palette",
  theme: "ap-theme",
  layout: "ap-layout",
} as const;
