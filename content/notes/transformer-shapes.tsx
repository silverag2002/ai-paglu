import type { NoteMeta } from "@/content/types";
import { P, H2, Ul, Li, IC, B, Em, Callout, DataTable, CodeBlock } from "@/components/prose";

export const meta: NoteMeta = {
  slug: "transformer-shapes",
  title: "Transformer tensor shapes",
  summary:
    "Every shape in a decoder block, in order, with the three that I get wrong most often marked.",
  tags: ["transformers", "debugging"],
  updated: "2026-09-02",
  kind: "shapes",
};

export default function Note() {
  return (
    <>
      <P>
        Notation: <IC>B</IC> batch, <IC>T</IC> context length, <IC>C</IC> model width,{" "}
        <IC>h</IC> heads, <IC>d = C/h</IC> head dimension, <IC>V</IC> vocabulary.
      </P>

      <H2>One decoder block, top to bottom</H2>

      <DataTable
        head={["Step", "Shape out", "Note"]}
        rows={[
          ["input ids", "(B, T)", "int64, not float"],
          ["token embedding", "(B, T, C)", "a lookup, not a matmul"],
          ["+ positional", "(B, T, C)", "added, not concatenated"],
          ["LayerNorm", "(B, T, C)", "normalises over C, the last axis only"],
          ["q, k, v = x @ W", "3 × (B, T, C)", "one fused matmul in most code"],
          ["split heads", "3 × (B, h, T, d)", "reshape then transpose — order matters"],
          ["q @ kᵀ / √d", "(B, h, T, T)", "the quadratic one"],
          ["causal mask", "(B, h, T, T)", "fill upper triangle with −inf"],
          ["softmax(dim=-1)", "(B, h, T, T)", "rows sum to 1"],
          ["attn @ v", "(B, h, T, d)", "back down from T²"],
          ["merge heads", "(B, T, C)", "transpose then reshape — this order"],
          ["output proj", "(B, T, C)", "mixes information across heads"],
          ["MLP up", "(B, T, 4C)", "expansion factor is conventionally 4"],
          ["MLP down", "(B, T, C)", "back to width"],
          ["final → logits", "(B, T, V)", "often ties weights with the embedding"],
        ]}
      />

      <H2>The three I get wrong</H2>

      <Ul>
        <Li>
          <B>Softmax axis.</B> It is <IC>dim=-1</IC>, over keys. Take it over queries and the model
          trains to a mediocre loss and never tells you why.
        </Li>
        <Li>
          <B>Merge order.</B> <IC>transpose(1, 2)</IC> then <IC>reshape</IC>. Reshaping first
          interleaves the heads and scrambles every channel.
        </Li>
        <Li>
          <B>LayerNorm axis.</B> Over <IC>C</IC>, per token. Not over the batch, and not over{" "}
          <IC>T</IC> — normalising across time leaks information between positions.
        </Li>
      </Ul>

      <CodeBlock
        lang="python"
        caption="Split and merge, written out. These four lines are the ones to copy exactly."
        code={`# split: (B, T, C) -> (B, h, T, d)
x = x.view(B, T, h, d).transpose(1, 2)

# merge: (B, h, T, d) -> (B, T, C)
x = x.transpose(1, 2).contiguous().view(B, T, C)`}
      />

      <Callout kind="recall" title="Fastest debugging trick I know">
        <P>
          Set <IC>B=2, T=4, C=8, h=2</IC> and print <IC>.shape</IC> after every line. Four tokens is
          small enough to check the causal mask by eye, and every shape bug shows up in under a
          minute instead of after a training run.
        </P>
      </Callout>

      <H2>Parameter count, per block</H2>

      <DataTable
        head={["Part", "Parameters"]}
        rows={[
          ["attention (q, k, v, out)", "4C²"],
          ["MLP (up + down)", "8C²"],
          ["two LayerNorms", "4C — negligible"],
          ["total per block", "≈ 12C²"],
        ]}
      />

      <P>
        <Em>
          So a 12-layer model at C=768 is about 12 × 12 × 768² ≈ 85M parameters before embeddings —
          which is roughly GPT-2 small, and a useful sanity check when a config looks wrong.
        </Em>
      </P>
    </>
  );
}
