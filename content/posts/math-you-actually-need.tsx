import type { PostMeta } from "@/content/types";
import {
  Lead, P, H2, Ul, Li, IC, B, Em, Callout, TLDR, KeyTakeaways, CodeBlock,
  Formula, Sub, Divider, DataTable,
} from "@/components/prose";
import { LossCurve } from "@/components/visuals/LossCurve";

export const meta: PostMeta = {
  slug: "math-you-actually-need",
  title: "The maths you actually need before transformers",
  summary:
    "Not a linear algebra course. The specific handful of ideas that, once they clicked, made every paper readable — and the ones I wasted months on that I did not need.",
  tags: ["math", "foundations", "study-plan"],
  published: "2026-09-09",
  readMinutes: 10,
  level: "intuition",
};

export default function Article() {
  return (
    <>
      <Lead>
        I spent two months on a linear algebra course before touching a model, convinced I needed
        the whole thing first. Most of it I have never used. A much smaller set of ideas turned out
        to do all the work.
      </Lead>

      <P>
        This is that smaller set — written as the note I wish someone had handed me, not as a
        curriculum.
      </P>

      <TLDR>
        <P>
          Four things: a matrix multiply is a batch of dot products; a dot product measures
          alignment; softmax turns scores into a budget that sums to one; the chain rule is why any
          of it trains. Everything else can be learned on demand, when a paper forces you to.
        </P>
      </TLDR>

      <H2>1. A matrix multiply is a batch of dot products</H2>

      <P>
        Not &ldquo;a linear transformation of a vector space&rdquo; — true, and not the useful
        picture when reading code. The useful picture: entry <IC>(i, j)</IC> of <IC>A @ B</IC> is
        row <IC>i</IC> of A dotted with column <IC>j</IC> of B. That is the only rule, applied many
        times.
      </P>

      <P>
        Once you hold that, the shape rule stops being something to memorise. <IC>(n, k) @ (k, m)</IC>{" "}
        works because the dot products need equal-length vectors, and the result is <IC>(n, m)</IC>{" "}
        because that is how many pairs there are.
      </P>

      <Callout kind="recall" title="Read shapes, not names">
        <P>
          When a paper writes <IC>QKᵀ</IC> and you are unsure what it produces, do not reach for the
          definition — reach for the shapes. <IC>(T, d) @ (d, T) → (T, T)</IC>. A square matrix of
          every token against every token. The shape told you what the operation means.
        </P>
      </Callout>

      <H2>2. A dot product measures alignment</H2>

      <Formula note="the geometric reading — this is the one to keep">
        a · b = ‖a‖ ‖b‖ cos θ
      </Formula>

      <P>
        Large and positive when two vectors point the same way, zero when perpendicular, negative
        when opposed. That single sentence is the entire reason attention uses dot products to score
        relevance, and the entire reason cosine similarity is the default retrieval metric.
      </P>

      <P>
        One consequence worth internalising early, because it explains a constant in every
        transformer: the dot product of two random <IC>d</IC>-dimensional vectors with unit-variance
        components has variance <IC>d</IC>. Bigger vectors give bigger scores purely because there
        are more terms in the sum. That is why attention divides by <IC>√d</IC> — it is variance
        control, not a hyperparameter.
      </P>

      <H2>3. Softmax turns scores into a budget</H2>

      <Formula note="exponentiate, then normalise">
        softmax(z)<Sub>i</Sub> = e^z<Sub>i</Sub> / Σ<Sub>j</Sub> e^z<Sub>j</Sub>
      </Formula>

      <P>
        It converts arbitrary real numbers into positive numbers that sum to 1. Two properties
        matter far more than the formula:
      </P>

      <Ul>
        <Li>
          <B>It is a budget, not a scaling.</B> Because the outputs sum to 1, raising one weight
          necessarily lowers others. Attention is zero-sum by construction — paying more attention
          here means paying less there.
        </Li>
        <Li>
          <B>It is exponential, so it is sharp.</B> A score 2 higher does not get twice the weight,
          it gets <IC>e²</IC> ≈ 7.4 times the weight. Small score differences become large weight
          differences, which is why input scale matters so much.
        </Li>
      </Ul>

      <Callout kind="gotcha" title="The implementation detail you will meet">
        <P>
          <IC>e^z</IC> overflows for <IC>z</IC> around 89 in float32. Every real implementation
          subtracts the row maximum first. It changes nothing mathematically — the constant cancels
          top and bottom — and it is the difference between working code and a tensor full of{" "}
          <IC>NaN</IC>.
        </P>
      </Callout>

      <CodeBlock
        lang="python"
        caption="Both lines are correct maths. Only one of them survives contact with real logits."
        code={`import numpy as np

def softmax_naive(z):
    e = np.exp(z)                 # inf as soon as z > ~89
    return e / e.sum(-1, keepdims=True)

def softmax(z):
    z = z - z.max(-1, keepdims=True)   # largest becomes 0, rest negative
    e = np.exp(z)
    return e / e.sum(-1, keepdims=True)`}
      />

      <H2>4. The chain rule is why any of it trains</H2>

      <P>
        You will almost never differentiate anything by hand. But you do need one fact:
        backpropagation is the chain rule applied backwards through the network, and gradients{" "}
        <B>multiply</B> along the way.
      </P>

      <P>
        Multiplication is the whole story of training pathologies. Twenty layers each contributing a
        factor of 0.5 leaves you with <IC>0.5²⁰ ≈ 0.000001</IC> — the early layers receive nothing
        and never learn. Each contributing 1.5 gives <IC>1.5²⁰ ≈ 3325</IC> and the loss goes to{" "}
        <IC>NaN</IC>.
      </P>

      <DataTable
        head={["Technique", "What it actually does"]}
        rows={[
          ["Residual connections", "give the gradient a path that multiplies by 1"],
          ["Layer normalisation", "keeps activation scale — and so gradient scale — stable per layer"],
          ["Gradient clipping", "hard ceiling on the product, so one bad batch cannot blow up the run"],
          ["Careful initialisation", "starts every layer's factor near 1 instead of hoping"],
        ]}
      />

      <P>
        Those four appear in every architecture diagram you will read. They are all answers to the
        same question: <Em>how do we stop a product of twenty numbers from going to zero or
        infinity?</Em>
      </P>

      <Divider />

      <H2>What this buys you: reading a loss curve</H2>

      <P>
        Here is where the abstract ideas cash out. A training run is a picture of the optimisation
        working and then, at a specific point, stopping working:
      </P>

      <LossCurve />

      <P>
        Training loss falls throughout — it always will, given enough capacity. Validation loss stops
        improving at epoch 13 and then climbs. After that point the model is still reducing its
        objective, just not in a way that generalises. No amount of further training fixes it; the
        only useful action is to stop, and to have kept the checkpoint from where the val curve
        turned.
      </P>

      <Callout kind="intuition">
        <P>
          This is the most valuable plot in machine learning and it takes ten seconds to read. Two
          curves, one question: <B>are they still falling together?</B>
        </P>
      </Callout>

      <H2>What I did not need (yet)</H2>

      <P>
        Written down honestly, because the opportunity cost was real:
      </P>

      <Ul>
        <Li>
          <B>Eigenvalues and eigenvectors.</B> Beautiful, central to PCA, and I have not needed them
          to read a transformer paper. They matter when you get to optimisation theory.
        </Li>
        <Li>
          <B>Determinants, matrix inverses, Cramer&apos;s rule.</B> Essentially absent from deep
          learning practice. Nothing at this scale inverts a matrix.
        </Li>
        <Li>
          <B>Measure-theoretic probability.</B> Needed to prove things about diffusion models, not to
          understand or use them.
        </Li>
        <Li>
          <B>Manual backpropagation through deep networks.</B> Do it once for a two-layer network to
          make it real, then let autograd do it forever.
        </Li>
      </Ul>

      <Callout kind="recall" title="The honest ordering">
        <P>
          Learn the four ideas above properly. Then read papers and let them tell you what is
          missing. Learning maths on demand, with a concrete thing you are trying to understand, is
          several times more efficient than learning it in advance in case you need it.
        </P>
      </Callout>

      <KeyTakeaways
        items={[
          "A matrix multiply is a grid of dot products — read shapes before you read definitions.",
          "A dot product measures alignment, and its variance grows with dimension. That single fact explains the √d in attention.",
          "Softmax is a fixed budget summing to 1, and it is exponential, so small score gaps become large weight gaps.",
          "Gradients multiply through depth; residuals, normalisation, clipping and initialisation all exist to keep that product near 1.",
          "Reading a train/val loss curve is the highest-value ten seconds in the whole workflow.",
        ]}
      />
    </>
  );
}
