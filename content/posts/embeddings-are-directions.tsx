import type { PostMeta } from "@/content/types";
import {
  Lead, P, H2, Ul, Li, IC, B, Em, Callout, TLDR, KeyTakeaways, CodeBlock,
  Formula, Divider, DataTable,
} from "@/components/prose";
import { EmbeddingSpace } from "@/components/visuals/EmbeddingSpace";

export const meta: PostMeta = {
  slug: "embeddings-are-directions",
  title: "Embeddings are directions, not addresses",
  summary:
    "Why cosine similarity and not distance, why no single dimension means anything, and why the famous king − man + woman analogy is both real and oversold.",
  tags: ["embeddings", "intuition", "retrieval"],
  published: "2026-08-31",
  readMinutes: 9,
  level: "intuition",
};

export default function Article() {
  return (
    <>
      <Lead>
        The word &ldquo;embedding&rdquo; sounds like a filing system — as if each word were assigned
        a slot and the model looked it up. That picture is wrong in a way that quietly breaks your
        intuition for everything downstream, retrieval most of all.
      </Lead>

      <TLDR>
        <P>
          An embedding is a direction in a few hundred dimensions. Meaning lives in the angles
          between directions, not in the coordinates. This is why similarity is measured with cosine
          rather than distance, why you cannot read off what dimension 214 means, and why a vector
          database that ignores normalisation quietly returns bad neighbours.
        </P>
      </TLDR>

      <H2>Start with what it replaces</H2>

      <P>
        One-hot encoding gives every word its own axis. With a 50,000-word vocabulary that is a
        50,000-dimensional vector with a single 1 in it. It has exactly one useful property — words
        are distinguishable — and one fatal flaw: <IC>cat</IC> and <IC>kitten</IC> are precisely as
        far apart as <IC>cat</IC> and <IC>bureaucracy</IC>. Every pair is equidistant. The
        representation contains no information beyond identity.
      </P>

      <P>
        An embedding compresses those 50,000 axes into, say, 512, and in doing so it is{" "}
        <Em>forced</Em> to put similar things near each other. There is not enough room to keep
        everything apart, so the training objective decides what gets to be far from what. Meaning
        is a side effect of a compression constraint.
      </P>

      <Callout kind="intuition" title="The compression is the point">
        <P>
          Nobody tells the model that <IC>cat</IC> and <IC>kitten</IC> are related. It is told to
          predict surrounding words, discovers the two appear in near-identical contexts, and — with
          only 512 dimensions to spend — finds it cheaper to give them nearly the same vector than
          to keep them separate. Similarity falls out of the squeeze.
        </P>
      </Callout>

      <H2>Why nobody can tell you what dimension 214 means</H2>

      <P>
        A reasonable hope: maybe dimension 3 encodes formality, dimension 91 animacy. It is not how
        they come out. Concepts are spread across many dimensions at once, and a single dimension
        participates in many concepts.
      </P>

      <P>
        There is a real reason for this. A model with 512 dimensions needs to represent far more
        than 512 distinguishable concepts. It cannot give each one its own axis, so it packs them as
        directions that are merely <Em>nearly</Em> orthogonal — and in high dimensions you can fit
        exponentially more nearly-orthogonal directions than truly orthogonal ones. This is called
        superposition, and it is why interpretability is hard: the features are real, but they do
        not line up with the coordinate system.
      </P>

      <Callout kind="gotcha">
        <P>
          This is also why the 2D pictures of embedding spaces you have seen — including the one
          below — are a convenience, not evidence. Flattening 512 dimensions to 2 destroys almost
          everything. Read those plots for the <Em>relationships</Em> they illustrate, never as a
          map of where things actually are.
        </P>
      </Callout>

      <H2>Direction, not position</H2>

      <P>
        If coordinates carry no individual meaning, what does? The angle between vectors. Two
        embeddings pointing the same way mean similar things, however long they happen to be.
      </P>

      <Formula note="cosine similarity — length divides out, only the angle survives">
        cos(a, b) = (a · b) / (‖a‖ ‖b‖)
      </Formula>

      <P>
        Length does carry <Em>something</Em> — it tends to track word frequency and how confidently
        the model has placed the token — but it is not what you want when asking &ldquo;are these
        about the same thing?&rdquo;. Euclidean distance mixes the two signals together, which is
        why a rare word can come out far from an extremely similar common word.
      </P>

      <DataTable
        head={["Measure", "Sensitive to", "Use it when"]}
        rows={[
          ["Cosine", "angle only", "semantic similarity — the default for text"],
          ["Dot product", "angle and length", "vectors already normalised, or length is meaningful"],
          ["Euclidean", "angle and length", "the space is genuinely metric, e.g. coordinates"],
        ]}
      />

      <Callout kind="recall" title="The practical version">
        <P>
          Normalise your vectors to unit length once, at write time. After that, dot product and
          cosine are the same number, and the fast approximate-nearest-neighbour index in your
          vector database is finally measuring what you meant.
        </P>
      </Callout>

      <CodeBlock
        lang="python"
        caption="The one-liner that fixes most 'my retrieval returns nonsense' bugs."
        code={`import numpy as np

def normalise(v, eps=1e-8):
    # (n, d) -> unit length rows, so dot product == cosine
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + eps)

docs = normalise(doc_embeddings)   # do this once, at index time
q = normalise(query_embedding)

scores = docs @ q                  # (n,) — already cosine
top = np.argsort(-scores)[:10]`}
      />

      <H2>The analogy everyone quotes</H2>

      <P>
        <IC>king − man + woman ≈ queen</IC> is the most repeated fact about embeddings, and it is
        genuinely remarkable: subtracting one vector from another produces a <Em>direction</Em>{" "}
        — here, roughly &ldquo;add royalty&rdquo; — that can be added to unrelated words and still
        land somewhere sensible.
      </P>

      <EmbeddingSpace />

      <P>
        It deserves the fuss, and it also gets oversold. Three things are usually left out:
      </P>

      <Ul>
        <Li>
          <B>The result is never exactly queen.</B> It is a point in space whose nearest neighbour
          is queen. The gap is often large.
        </Li>
        <Li>
          <B>The three input words are usually excluded from the search.</B> Without that exclusion
          the nearest neighbour of <IC>king − man + woman</IC> is frequently just <IC>king</IC>.
        </Li>
        <Li>
          <B>It works for well-attested relations and falls apart elsewhere.</B> Capital-of and
          gender behave; superlatives and rare relations mostly do not.
        </Li>
      </Ul>

      <P>
        The durable lesson is not the party trick. It is that <B>differences between embeddings are
        themselves meaningful directions</B>, and that the model has arranged its space so
        consistently that the same offset applies across many pairs.
      </P>

      <Divider />

      <H2>Static vectors versus what transformers actually use</H2>

      <P>
        Everything so far describes a fixed table: one vector per token, the same every time. That
        is word2vec and GloVe, and it has a hard ceiling — <IC>bank</IC> gets one vector that must
        serve both the river and the money.
      </P>

      <P>
        A transformer starts from exactly such a table, then rewrites it. After the first attention
        block the vector at position <IC>i</IC> is no longer the vector for that token — it is that
        token <Em>in this sentence</Em>. By the final layer, the two senses of <IC>bank</IC> are far
        apart, because their contexts pulled them apart.
      </P>

      <Callout kind="intuition">
        <P>
          The embedding table is the starting guess. Attention is what turns a guess about a word
          into a representation of a word-in-context. That is the entire relationship between this
          article and the attention one.
        </P>
      </Callout>

      <KeyTakeaways
        items={[
          "Embeddings encode meaning as direction; individual coordinates mean nothing on their own.",
          "Similarity is cosine because length tracks frequency and confidence, not topic.",
          "Normalise at index time — then dot product is cosine, and your ANN index measures what you intended.",
          "Superposition — features as nearly-orthogonal directions, not axes — is why interpretability is hard.",
          "Static embeddings give one vector per token; a transformer's job is to make that vector context-dependent.",
        ]}
      />
    </>
  );
}
