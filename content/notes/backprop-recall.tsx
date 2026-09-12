import type { NoteMeta } from "@/content/types";
import { P, H2, Ul, Li, IC, B, Em, Callout, DataTable, Formula, Sub } from "@/components/prose";

export const meta: NoteMeta = {
  slug: "backprop-recall",
  title: "Backprop recall card",
  summary:
    "The local gradients worth knowing by heart, and the four techniques that all exist to keep a product of many numbers near one.",
  tags: ["math", "training"],
  updated: "2026-08-28",
  kind: "recall",
};

export default function Note() {
  return (
    <>
      <Callout kind="recall" title="The one sentence">
        <P>
          Backprop is the chain rule run backwards, and gradients <B>multiply</B> along the path.
          Every training pathology and every fix for one follows from that verb.
        </P>
      </Callout>

      <H2>Local gradients worth memorising</H2>

      <DataTable
        head={["Forward", "Local gradient", "In words"]}
        rows={[
          ["y = x + b", "1", "addition copies the gradient to both inputs"],
          ["y = a · x", "a", "scaling scales the gradient by the same factor"],
          ["y = x @ W", "gradₓ = grad_y @ Wᵀ", "the transpose is the whole trick"],
          ["y = relu(x)", "1 if x > 0 else 0", "a gate — dead units pass nothing back"],
          ["y = x²", "2x", "gradient grows with input"],
          ["y = softmax(x)", "y(1 − y) on the diagonal", "vanishes when any output saturates"],
          ["y = max(a, b)", "1 to the winner, 0 to the loser", "routing, not blending"],
        ]}
      />

      <H2>Why depth is dangerous</H2>

      <Formula note="the gradient reaching layer 1 of an L-layer network">
        ∂L/∂x<Sub>1</Sub> = Π<Sub>i=1..L</Sub> (local gradient at layer i)
      </Formula>

      <Ul>
        <Li>
          Each factor 0.5, 20 layers → <IC>0.5²⁰ ≈ 1e-6</IC>. The early layers never move.
        </Li>
        <Li>
          Each factor 1.5, 20 layers → <IC>1.5²⁰ ≈ 3325</IC>. Loss becomes <IC>NaN</IC>.
        </Li>
        <Li>The healthy target is every factor near 1. All four fixes below aim at exactly that.</Li>
      </Ul>

      <H2>The four fixes, and what each one really does</H2>

      <DataTable
        head={["Technique", "Mechanism"]}
        rows={[
          ["Residual x + f(x)", "adds a path whose local gradient is exactly 1, so depth cannot starve the early layers"],
          ["LayerNorm", "rescales activations per token so the next layer's factor stays near 1"],
          ["Gradient clipping", "caps the global norm — survives one pathological batch instead of dying to it"],
          ["Init (Xavier / He)", "sets the starting variance so factors begin near 1 rather than drifting there"],
        ]}
      />

      <Callout kind="gotcha" title="Pre-norm vs post-norm">
        <P>
          <IC>x + f(norm(x))</IC> (pre-norm) keeps a clean identity path and trains deep models
          without a warmup schedule. <IC>norm(x + f(x))</IC> (post-norm) is the original paper and
          needs careful warmup past about 12 layers. If a deep model will not train, check which one
          you built.
        </P>
      </Callout>

      <H2>Reading a bad run</H2>

      <DataTable
        head={["Symptom", "Most likely cause"]}
        rows={[
          ["loss flat from step 0", "learning rate far too low, or gradients not flowing — check for a detach"],
          ["loss → NaN suddenly", "exploding gradients, or a log/div of zero; clip and check the loss function"],
          ["loss drops then plateaus high", "learning rate too high — bouncing around the basin"],
          ["train falls, val rises", "overfitting; stop at the val minimum, do not keep the last checkpoint"],
          ["loss exactly constant", "no gradient reaches the parameters at all — usually a missing requires_grad"],
        ]}
      />

      <P>
        <Em>
          The first thing to check is always whether the gradient is arriving. Print the norm of one
          early-layer gradient; if it is zero, nothing else on this list matters.
        </Em>
      </P>
    </>
  );
}
