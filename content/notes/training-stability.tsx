import type { NoteMeta } from "@/content/types";
import { P, H2, Ul, Li, IC, B, Em, Callout, DataTable } from "@/components/prose";

export const meta: NoteMeta = {
  slug: "training-stability",
  title: "Training stability checklist",
  summary:
    "What to check before a run, what to watch during one, and the fixed order to work through when the loss does something stupid.",
  tags: ["training", "debugging", "checklist"],
  updated: "2026-09-10",
  kind: "checklist",
};

export default function Note() {
  return (
    <>
      <H2>Before you start a long run</H2>

      <Ul>
        <Li>
          <B>Overfit 8 examples first.</B> If the model cannot drive loss to near zero on a batch it
          has seen a hundred times, the bug is in the code, not the data or the schedule. This one
          check has saved me more hours than everything else here combined.
        </Li>
        <Li>
          <B>Check the loss at initialisation.</B> For <IC>V</IC> classes it should be about{" "}
          <IC>ln(V)</IC> — 10.8 for a 50k vocabulary. Anything else means the output layer or the
          loss is wired wrong.
        </Li>
        <Li>
          <B>Look at one real batch after collation.</B> Decode it back to text. Padding in the
          wrong place and off-by-one label shifts are both invisible until you look.
        </Li>
        <Li>
          <B>Confirm the LR schedule by plotting it,</B> not by reading the config. Warmup that
          never ends is a common and expensive typo.
        </Li>
      </Ul>

      <H2>What to watch while it runs</H2>

      <DataTable
        head={["Signal", "Healthy", "Worry when"]}
        rows={[
          ["grad norm", "stable, same order of magnitude throughout", "spikes 10× — clip, or find the bad batch"],
          ["loss", "noisy but trending down", "flat, or stepwise jumps upward"],
          ["val vs train gap", "widens slowly", "val turns upward — stop, keep that checkpoint"],
          ["LR", "follows the intended curve", "still warming up at 20% of the run"],
          ["activation scale", "roughly constant across layers", "growing with depth — a norm is missing or misplaced"],
        ]}
      />

      <H2>When it breaks, in this order</H2>

      <Ul>
        <Li>
          <B>1. Is a gradient arriving?</B> Print the norm of an early-layer gradient. Zero means a
          detached tensor, a frozen parameter, or a loss that does not depend on the output.
        </Li>
        <Li>
          <B>2. Lower the learning rate 10×.</B> If it stabilises, the problem was the schedule, not
          the architecture. Cheap to test, rules out a lot.
        </Li>
        <Li>
          <B>3. Clip gradients to norm 1.0.</B> If NaNs stop, one rare batch was blowing things up —
          go find it rather than leaving clipping to hide it.
        </Li>
        <Li>
          <B>4. Check for log(0) and division by zero.</B> Any custom loss with a <IC>log</IC>{" "}
          needs an epsilon.
        </Li>
        <Li>
          <B>5. Disable mixed precision.</B> If NaNs vanish in fp32, it is an overflow in fp16 —
          switch to bf16 if the hardware allows, since it has the same exponent range as fp32.
        </Li>
        <Li>
          <B>6. Only now change the architecture.</B> It is almost never the architecture.
        </Li>
      </Ul>

      <Callout kind="recall" title="Defaults that are hard to beat">
        <P>
          AdamW, <IC>betas=(0.9, 0.95)</IC>, weight decay 0.1 on weights and 0 on norms and biases,
          gradient clip 1.0, linear warmup over the first 1–2% of steps, then cosine decay to 10% of
          peak. Start here; change one thing at a time and only with a reason.
        </P>
      </Callout>

      <P>
        <Em>
          The general rule: a training bug is a code bug until proven otherwise, and the proof is
          that you could overfit eight examples.
        </Em>
      </P>
    </>
  );
}
