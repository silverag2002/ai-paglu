import type { RoadmapItem } from "@/content/types";

/**
 * Written in public on purpose. Anything marked shipped has a page; anything
 * queued is fair game to reorder if someone asks for it.
 */
export const roadmap: RoadmapItem[] = [
  {
    title: "Self-attention, one matrix at a time",
    status: "shipped",
    note: "The weighted-average framing, and why Q, K and V have to be three different things.",
    tags: ["transformers"],
    href: "/writing/self-attention-from-scratch",
  },
  {
    title: "Embeddings are directions, not addresses",
    status: "shipped",
    note: "Cosine vs distance, superposition, and what the famous analogy actually shows.",
    tags: ["embeddings"],
    href: "/writing/embeddings-are-directions",
  },
  {
    title: "From diffusion to video",
    status: "shipped",
    note: "Why a second frame changes the shape of the problem.",
    tags: ["diffusion", "video"],
    href: "/writing/diffusion-to-video",
  },
  {
    title: "The maths you actually need",
    status: "shipped",
    note: "Four ideas, and an honest list of what I studied and never used.",
    tags: ["math"],
    href: "/writing/math-you-actually-need",
  },

  {
    title: "Positional encodings, sinusoidal to RoPE",
    status: "building",
    note: "Attention is order-blind by construction. Three generations of fixes, and why rotary won.",
    tags: ["transformers", "positions"],
  },
  {
    title: "KV caching, drawn",
    status: "building",
    note: "Why generation gets slower per token without it, and exactly what is being cached. Wants an animated diagram.",
    tags: ["inference", "transformers"],
  },
  {
    title: "Building a tokenizer from scratch",
    status: "building",
    note: "BPE in about eighty lines, then merging a real vocabulary and watching where it fails.",
    tags: ["tokenization"],
  },

  {
    title: "LayerNorm vs RMSNorm",
    status: "queued",
    note: "What the mean subtraction was doing, and why most new models dropped it.",
    tags: ["transformers", "training"],
  },
  {
    title: "Why attention is quadratic, and the escape attempts",
    status: "queued",
    note: "Flash attention, sliding windows, linear attention — what each actually gives up.",
    tags: ["transformers", "efficiency"],
  },
  {
    title: "Mixture of experts, without the hype",
    status: "queued",
    note: "Routing, load balancing, and why parameter counts stopped meaning what they used to.",
    tags: ["architecture"],
  },
  {
    title: "Latent space, and what the VAE is really for",
    status: "queued",
    note: "The compression step that makes image and video diffusion affordable at all.",
    tags: ["diffusion", "video"],
  },
  {
    title: "Temporal consistency techniques, compared",
    status: "queued",
    note: "The follow-up to the video piece — shared noise, temporal attention, optical flow guidance.",
    tags: ["video"],
  },
  {
    title: "Fine-tuning: LoRA, and when full fine-tuning is still right",
    status: "queued",
    note: "Rank, which layers to target, and the memory arithmetic.",
    tags: ["training", "fine-tuning"],
  },
  {
    title: "Evaluating generative models honestly",
    status: "queued",
    note: "FID, CLIP score, human preference — what each measures and how each is gamed.",
    tags: ["evaluation"],
  },
];
