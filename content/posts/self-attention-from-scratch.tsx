import type { PostMeta } from "@/content/types";
import {
  Lead, P, H2, H3, Ol, Step, IC, B, Em, Callout, TLDR, KeyTakeaways,
  CodeBlock, Formula, Sub, Divider, DataTable,
} from "@/components/prose";
import { AttentionHeatmap } from "@/components/visuals/AttentionHeatmap";
import { TensorShapeFlow } from "@/components/visuals/TensorShapeFlow";

export const meta: PostMeta = {
  slug: "self-attention-from-scratch",
  title: "Self-attention, one matrix at a time",
  summary:
    "Attention is a weighted average where the weights are learned. Everything else — queries, keys, values, the √d, the mask — is bookkeeping around that one idea.",
  tags: ["transformers", "attention", "from-scratch"],
  published: "2026-08-24",
  readMinutes: 11,
  level: "working",
  featured: true,
};

export default function Article() {
  return (
    <>
      <Lead>
        Every explanation of attention I read started with queries, keys and values, and every one
        of them lost me in the first paragraph. The database metaphor is fine once you already
        understand the thing. It is useless before.
      </Lead>

      <P>
        So here is the order that finally worked for me: start from the one line of maths that
        matters, then add the machinery back piece by piece and watch what each piece buys.
      </P>

      <TLDR>
        <P>
          Self-attention computes, for every token, a weighted average of every other token&apos;s
          vector. The weights come from how well each pair matches. That is the whole idea. Queries,
          keys and values are three learned lenses that let the model choose <Em>what</Em> counts as
          a match; the scaling and the mask stop it from breaking.
        </P>
      </TLDR>

      <H2>The one line that matters</H2>

      <P>
        Take a sentence of <IC>T</IC> tokens, each already turned into a vector. A token wants to
        update itself using context. The simplest possible way: average all the other vectors.
      </P>

      <Formula note="the useless version — every token gets the same answer">
        out<Sub>i</Sub> = (1/T) · Σ<Sub>j</Sub> x<Sub>j</Sub>
      </Formula>

      <P>
        This is useless, and instructively so. Every token gets the same output, because every token
        computed the same average. The information about <Em>which</Em> token is doing the looking
        has been thrown away.
      </P>

      <P>
        Fix it with one change: let the weights differ per token. Give token <IC>i</IC> its own set
        of weights <IC>a</IC><Sub>ij</Sub> over all <IC>j</IC>.
      </P>

      <Formula note="attention — the weights now depend on who is asking">
        out<Sub>i</Sub> = Σ<Sub>j</Sub> a<Sub>ij</Sub> · x<Sub>j</Sub>
      </Formula>

      <Callout kind="intuition">
        <P>
          That is it. Attention is a weighted average where the weights are learned instead of
          fixed. Every remaining piece of the mechanism exists to answer one question:{" "}
          <B>where do the a</B>
          <Sub>ij</Sub> <B>come from?</B>
        </P>
      </Callout>

      <H2>Where the weights come from</H2>

      <P>
        The weights should be high when token <IC>i</IC> and token <IC>j</IC> are relevant to each
        other. The cheapest measure of &ldquo;relevant&rdquo; between two vectors is the dot
        product: large when they point the same way, near zero when they are unrelated.
      </P>

      <P>
        So we could use <IC>x_i · x_j</IC> directly. Models did this early on and it works badly,
        for a reason that is worth sitting with: a token&apos;s vector has to serve three different
        jobs at once — describing what it is looking for, describing what it offers to others, and
        carrying the content it passes along. Those are different jobs, and one vector doing all
        three is a compromise at all of them.
      </P>

      <P>
        The fix is to learn three projections of the same vector, one per job:
      </P>

      <DataTable
        head={["Name", "What it answers", "Used as"]}
        rows={[
          ["Q — query", "What am I looking for?", "the left side of the match"],
          ["K — key", "What do I advertise about myself?", "the right side of the match"],
          ["V — value", "What do I pass on if chosen?", "the thing actually averaged"],
        ]}
      />

      <P>
        Each is just a matrix multiply: <IC>Q = xW_q</IC>, <IC>K = xW_k</IC>, <IC>V = xW_v</IC>.
        Three learned weight matrices, nothing more exotic. Now the score between token{" "}
        <IC>i</IC> and token <IC>j</IC> is <IC>q_i · k_j</IC>, and the model can learn that the
        <Em> query</Em> side of a verb should match the <Em>key</Em> side of a noun — which it could
        not express when both came from the same vector.
      </P>

      <Callout kind="gotcha" title="The question I got stuck on">
        <P>
          Why does V exist at all — why not average the original <IC>x</IC>? Because what a token is
          worth <Em>as context for someone else</Em> is not the same as what it is in itself. V is
          the model&apos;s chance to say &ldquo;when someone attends to me, hand them this
          instead.&rdquo; Remove V and quality drops measurably; it is not decoration.
        </P>
      </Callout>

      <H2>Two corrections that keep it working</H2>

      <H3>Divide by √d</H3>

      <P>
        A dot product of two <IC>d</IC>-dimensional vectors of roughly unit-scale components has
        variance proportional to <IC>d</IC>. At <IC>d = 64</IC> the raw scores routinely land in the
        ±8 range; push those through a softmax and you get something almost one-hot — one weight at
        0.99, the rest at nothing.
      </P>

      <P>
        A near-one-hot softmax has a vanishing gradient almost everywhere, so the model stops
        learning early and stays stuck attending to whatever it happened to prefer at
        initialisation. Dividing by <IC>√d</IC> puts the variance back near 1 and the softmax back
        in its useful range.
      </P>

      <Callout kind="recall">
        <P>
          The <IC>√d</IC> is not a tuning constant someone found by sweeping. It falls straight out
          of the variance of a dot product, and it is always the head dimension — 64 — never the
          model width.
        </P>
      </Callout>

      <H3>Mask the future</H3>

      <P>
        A model trained to predict the next token must not be allowed to look at it. Before the
        softmax, set every score where <IC>j &gt; i</IC> to <IC>-inf</IC>; after the softmax those
        become exactly zero.
      </P>

      <P>
        Use <IC>-inf</IC>, not a large negative number, and not zero. Zero is a perfectly ordinary
        score that survives the softmax as a real weight — masking with zero silently leaks the
        future and produces a model with suspiciously excellent training loss and useless generated
        text. I have shipped this bug.
      </P>

      <Divider />

      <H2>The whole thing, in code</H2>

      <CodeBlock
        lang="python"
        caption="One causal head. Every line above appears exactly once here."
        code={`import torch
import torch.nn.functional as F

def attention_head(x, Wq, Wk, Wv):
    # x: (B, T, C) — batch, context length, model width
    q = x @ Wq                      # (B, T, d) what each token is looking for
    k = x @ Wk                      # (B, T, d) what each token advertises
    v = x @ Wv                      # (B, T, d) what each token hands over

    d = q.size(-1)
    scores = q @ k.transpose(-2, -1) / d ** 0.5   # (B, T, T)

    # no peeking: upper triangle (j > i) is the future
    T = x.size(1)
    causal = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
    scores = scores.masked_fill(causal, float("-inf"))

    weights = F.softmax(scores, dim=-1)           # rows now sum to 1
    return weights @ v                            # (B, T, d)`}
      />

      <P>
        Nine lines. The parameter count is entirely in the three projection matrices; the attention
        operation itself has no parameters at all.
      </P>

      <H2>What it looks like when it works</H2>

      <P>
        Below is one head from a small model, on a sentence chosen because it has a trap in it. Look
        at the row for <IC>was</IC>. The nearest noun is <IC>mouse</IC>, and a model matching on
        proximity would pick it. This head reaches back over the entire relative clause to{" "}
        <IC>cat</IC>, which is the actual subject.
      </P>

      <AttentionHeatmap />

      <P>
        Nobody wrote a grammar rule. That row is the output of gradient descent deciding, over many
        steps, that matching verbs to their real subjects reduces prediction loss.
      </P>

      <H2>Multiple heads, and the shapes</H2>

      <P>
        One head learns one kind of relationship. Rather than make it wider, split the width into{" "}
        <IC>h</IC> independent heads of <IC>C/h</IC> each and run them in parallel. Same parameter
        count, several specialisations: in practice you find heads that track syntax, heads that
        copy rare tokens, heads that mostly attend to the first token and do nothing much at all.
      </P>

      <P>
        The shapes are where this gets slippery, so here is the whole block, one stage at a time:
      </P>

      <TensorShapeFlow />

      <P>
        The important line is the fourth: <IC>(B, h, T, T)</IC>. Attention cost grows with the{" "}
        <Em>square</Em> of context length, which is why doubling context more than doubles the bill,
        and why so much research energy goes into avoiding ever materialising that matrix.
      </P>

      <H2>How to actually check you understand it</H2>

      <Ol>
        <Step>
          Write the nine lines above from memory. Not copied — from the idea. If you stall, you have
          found the part you do not have yet.
        </Step>
        <Step>
          Delete the <IC>/ d ** 0.5</IC> and train a tiny model. Watch the loss curve flatten early.
        </Step>
        <Step>
          Replace <IC>float(&quot;-inf&quot;)</IC> with <IC>0</IC>. Training loss will look great.
          Generate a sample and see what a model that can read the future produces.
        </Step>
        <Step>
          Print one attention row and check it sums to 1. When a shape bug appears — and it will —
          this is the fastest way to find which axis the softmax went down.
        </Step>
      </Ol>

      <KeyTakeaways
        items={[
          "Attention is a weighted average where the weights are learned. Everything else is support structure.",
          "Q, K and V exist because one vector cannot simultaneously describe what a token wants, what it offers, and what it passes on.",
          "The √d comes from the variance of a dot product, and it is the head dimension, not the model width.",
          "Mask with −inf, never 0. Masking with 0 leaks the future and looks like success during training.",
          "The (B, h, T, T) score matrix is the quadratic term — it is the single line that makes long context expensive.",
        ]}
      />
    </>
  );
}
