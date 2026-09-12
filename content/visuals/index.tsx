import type { VisualMeta, Entry } from "@/content/types";
import { P, IC, B, Em } from "@/components/prose";
import { AttentionHeatmap } from "@/components/visuals/AttentionHeatmap";
import { TensorShapeFlow } from "@/components/visuals/TensorShapeFlow";
import { LossCurve } from "@/components/visuals/LossCurve";
import { EmbeddingSpace } from "@/components/visuals/EmbeddingSpace";
import { DiffusionSteps } from "@/components/visuals/DiffusionSteps";

type VisualEntry = Entry<VisualMeta> & { About: React.ComponentType };

export const visuals: VisualEntry[] = [
  {
    meta: {
      slug: "attention-heatmap",
      title: "Attention heatmap",
      summary:
        "One head, eight tokens, causal. Shows a verb reaching back past a whole relative clause to find its real subject.",
      tags: ["transformers", "attention"],
      interaction: "Hover any cell to trace a row and column",
    },
    Component: AttentionHeatmap,
    About: () => (
      <>
        <P>
          The sentence was picked because it contains a trap. In{" "}
          <Em>&ldquo;The cat that chased the mouse was fast&rdquo;</Em>, the noun nearest to{" "}
          <IC>was</IC> is <IC>mouse</IC> — but the subject is <IC>cat</IC>. A model scoring on
          proximity gets this wrong. This head does not.
        </P>
        <P>
          Two structural facts are visible before you read any number. The upper triangle is
          hatched out, because a causal model cannot attend to tokens it has not produced yet. And
          every row sums to exactly 1, because the softmax hands each token a fixed budget of
          attention to spend.
        </P>
        <P>
          <B>Worth noticing:</B> the diagonal is not always the brightest cell. A token attending
          mostly to itself is a token that found nothing useful in its context — which happens, and
          is informative when it does.
        </P>
      </>
    ),
  },
  {
    meta: {
      slug: "tensor-shapes",
      title: "Tensor shapes through a block",
      summary:
        "Step through one attention block and watch the shape change at each stage — including the one that squares the context length.",
      tags: ["transformers", "debugging"],
      interaction: "Step forward and back through seven stages",
    },
    Component: TensorShapeFlow,
    About: () => (
      <>
        <P>
          Almost every transformer bug I have written was a shape bug, and they are miserable to
          debug because the code runs fine and the loss merely looks slightly wrong.
        </P>
        <P>
          The stage to dwell on is <IC>scores = Q · Kᵀ</IC>, at <IC>(8, 8, 256, 256)</IC>. It is the
          only point where context length appears twice, and therefore the only point that is
          quadratic. Doubling the context to 512 does not double that tensor — it quadruples it.
          Essentially every efficient-attention paper you will read is an attempt to avoid ever
          writing it down.
        </P>
        <P>
          The final stage matters for a quieter reason: the block outputs exactly the shape it took
          in. That is the whole reason you can stack thirty-two of them.
        </P>
      </>
    ),
  },
  {
    meta: {
      slug: "loss-curves",
      title: "Reading a training run",
      summary:
        "Train and validation loss over 24 epochs, with the exact point where more training stops helping.",
      tags: ["training", "math"],
      interaction: "Hover to read both losses at any epoch",
    },
    Component: LossCurve,
    About: () => (
      <>
        <P>
          Training loss falling is not evidence of anything. Given enough capacity it will always
          fall — a large enough model can memorise the training set outright and drive it to zero.
        </P>
        <P>
          The signal is the <B>gap</B>. Up to epoch 13 both curves fall together and the model is
          learning the task. After epoch 13 training loss keeps falling while validation loss
          climbs: the model is now learning this particular dataset. No amount of additional
          training reverses that.
        </P>
        <P>
          Which is why the checkpoint you ship is the one at the validation minimum, not the one at
          the end of the run. Keeping only the final weights is a mistake that is invisible until
          you evaluate.
        </P>
      </>
    ),
  },
  {
    meta: {
      slug: "embedding-space",
      title: "Embedding space, flattened",
      summary:
        "Fifteen words in two dimensions, with the king − man + woman offset drawn as the same arrow twice.",
      tags: ["embeddings", "intuition"],
      interaction: "Hover a word to isolate its cluster; toggle the analogy",
    },
    Component: EmbeddingSpace,
    About: () => (
      <>
        <P>
          Read this one carefully, because it is a useful picture and a dishonest one. Real
          embeddings live in hundreds of dimensions; projecting them to two throws away almost
          everything. Nothing here should be taken as a map of where words actually sit.
        </P>
        <P>
          What survives the projection is the relationship: the arrow from <IC>man</IC> to{" "}
          <IC>king</IC> and the arrow from <IC>woman</IC> to <IC>queen</IC> are the same arrow. The
          model has arranged its space so that a single consistent offset means &ldquo;add
          royalty&rdquo;, and that offset applies to words it was never explicitly taught to relate.
        </P>
        <P>
          <B>The honest caveat:</B> the result of the arithmetic is never exactly <IC>queen</IC>. It
          is a point whose nearest neighbour is queen — usually after excluding the three input
          words, which otherwise win.
        </P>
      </>
    ),
  },
  {
    meta: {
      slug: "diffusion-steps",
      title: "Denoising, and why video is harder",
      summary:
        "Scrub a single image out of noise, then watch three consecutive frames disagree with each other.",
      tags: ["diffusion", "video"],
      interaction: "Scrub the denoising step; link the noise across frames",
    },
    Component: DiffusionSteps,
    About: () => (
      <>
        <P>
          The top panel is one image being denoised. At step 0 it is pure noise; each step is a
          small, confident correction rather than one impossible leap. That decomposition is the
          core trick of diffusion — asking &ldquo;which way is slightly less noisy?&rdquo; has a
          sharp answer where &ldquo;what is the image?&rdquo; does not.
        </P>
        <P>
          The bottom row is the problem. Three consecutive frames, generated independently, are
          three plausible images that are not the same scene. Play them in sequence and it reads as
          flicker rather than motion.
        </P>
        <P>
          Toggling the noise link removes most of it, which is why every real system shares noise
          across frames. But notice what the shared-noise state actually gives you: frames that
          agree because <Em>nothing moved</Em>. The real requirement is harder — frames that differ
          in exactly the ways the motion demands and in no other way.
        </P>
      </>
    ),
  },
];
