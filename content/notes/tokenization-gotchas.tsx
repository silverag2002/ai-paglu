import type { NoteMeta } from "@/content/types";
import { P, H2, Ul, Li, IC, B, Em, Callout, DataTable, CodeBlock } from "@/components/prose";

export const meta: NoteMeta = {
  slug: "tokenization-gotchas",
  title: "Tokenization gotchas",
  summary:
    "Most of the weird behaviour people blame on the model is actually the tokenizer. The specific list, with what each one looks like in practice.",
  tags: ["tokenization", "debugging", "llm"],
  updated: "2026-09-07",
  kind: "gotchas",
};

export default function Note() {
  return (
    <>
      <Callout kind="intuition" title="The framing">
        <P>
          The model never sees text. It sees integers produced by a compression algorithm that was
          fitted to a corpus you did not choose. A surprising share of &ldquo;the model is
          stupid&rdquo; moments are really &ldquo;the tokenizer made this hard&rdquo;.
        </P>
      </Callout>

      <H2>The classics</H2>

      <DataTable
        head={["Symptom", "What is happening"]}
        rows={[
          ["Cannot count letters in a word", "the word is 1–2 tokens; individual letters are not visible to it"],
          ["Arithmetic fails on long numbers", "digits group inconsistently — 1234 may be [123][4] or [1][234]"],
          ["Reversing a string fails", "same cause: characters are not the unit of representation"],
          ["Rhyming is unreliable", "phonetics are not in the input at all, only subword spelling"],
          ["Non-English costs 2–4× more", "the merge table was fitted mostly on English"],
          ["Trailing space changes the answer", "' the' and 'the' are different tokens with different embeddings"],
        ]}
      />

      <H2>Leading spaces are part of the token</H2>

      <P>
        In byte-pair encoding the space is attached to the <Em>front</Em> of the following word. So
        a prompt ending in a space leaves the model looking for a continuation of a token that
        cannot exist.
      </P>

      <CodeBlock
        lang="python"
        caption="Same five characters, entirely different token ids."
        code={`enc.encode("hello")     # [15339]
enc.encode(" hello")    # [24748]   <- different token, different vector
enc.encode("Hello")     # [9906]    <- capitalisation too

# so this prompt is quietly broken:
prompt = "The capital of France is "   # trailing space
# the model wants to emit " Paris", which now cannot follow`}
      />

      <Callout kind="gotcha">
        <P>
          <B>Never end a prompt with a trailing space.</B> It is the single most common silent
          prompt bug, and it costs measurable quality.
        </P>
      </Callout>

      <H2>Token budget reality</H2>

      <DataTable
        head={["Content", "Rough tokens"]}
        rows={[
          ["English prose", "~0.75 tokens per word"],
          ["Code", "~1.5× prose, whitespace is expensive"],
          ["JSON", "punctuation-heavy — budget 2× the same data as prose"],
          ["Hindi / Devanagari", "3–4× English for the same meaning"],
          ["Base64 or a hash", "~1 token per 2 characters — avoid putting these in context"],
        ]}
      />

      <H2>Practical rules</H2>

      <Ul>
        <Li>
          For character-level tasks, give the model the characters: <IC>s t r a w b e r r y</IC>{" "}
          spaced out works where the plain word does not.
        </Li>
        <Li>
          For arithmetic, ask for digit-by-digit working, or call a tool. Do not fight the tokenizer.
        </Li>
        <Li>
          Measure context cost with the real tokenizer, never with <IC>len(text) / 4</IC>, if any of
          your input is code, JSON, or non-English.
        </Li>
        <Li>
          When comparing two prompts that behave differently, encode both and diff the token ids
          before theorising about the model.
        </Li>
      </Ul>

      <Callout kind="recall">
        <P>
          Debugging order: <B>tokens first, prompt second, model last.</B> It is nearly free to
          check and it is right more often than it has any business being.
        </P>
      </Callout>
    </>
  );
}
