"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked — the code is still selectable */
        }
      }}
      className="label text-faint transition-colors hover:text-accent"
      aria-label="Copy code to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
