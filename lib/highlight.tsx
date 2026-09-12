import type { ReactNode } from "react";

/**
 * A deliberately small syntax highlighter. It covers the five things that
 * actually matter for reading ML snippets — comments, strings, numbers,
 * keywords, call names — and nothing else. Colours come from palette tokens,
 * so code recolours with the rest of the site instead of fighting it.
 */

export type Lang = "python" | "ts" | "bash" | "text";

const KEYWORDS: Record<Exclude<Lang, "text">, string[]> = {
  python: [
    "def", "class", "return", "import", "from", "as", "if", "elif", "else", "for", "while",
    "in", "not", "and", "or", "is", "None", "True", "False", "with", "lambda", "yield",
    "try", "except", "finally", "raise", "assert", "pass", "break", "continue", "global",
    "self", "async", "await",
  ],
  ts: [
    "const", "let", "var", "function", "return", "import", "from", "export", "default",
    "if", "else", "for", "while", "of", "in", "new", "class", "extends", "type",
    "interface", "async", "await", "true", "false", "null", "undefined", "this", "as",
  ],
  bash: ["cd", "ls", "echo", "export", "npm", "npx", "pnpm", "git", "python", "pip", "uv"],
};

const CLASS = {
  comment: "text-faint italic",
  string: "text-series-2",
  number: "text-series-3",
  keyword: "text-accent",
  fn: "text-series-4",
} as const;

function build(lang: Exclude<Lang, "text">): RegExp {
  const kw = KEYWORDS[lang].join("|");
  const comment = lang === "ts" ? String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/` : String.raw`#[^\n]*`;
  const string = String.raw`"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\`(?:[^\`\\]|\\.)*\``;
  return new RegExp(
    `(${comment})|(${string})|\\b(\\d+\\.?\\d*(?:e-?\\d+)?)\\b|\\b(${kw})\\b|\\b([A-Za-z_]\\w*)(?=\\()`,
    "g",
  );
}

export function highlight(code: string, lang: Lang): ReactNode {
  if (lang === "text") return code;

  const re = build(lang);
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(code)) !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [full, comment, str, num, kw] = m;
    const cls = comment
      ? CLASS.comment
      : str
        ? CLASS.string
        : num
          ? CLASS.number
          : kw
            ? CLASS.keyword
            : CLASS.fn; // the only remaining alternative is the call-name group
    out.push(
      <span key={i++} className={cls}>
        {full}
      </span>,
    );
    last = m.index + full.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
