import type { PostMeta, Entry } from "@/content/types";

import SelfAttention, { meta as selfAttention } from "./self-attention-from-scratch";
import Embeddings, { meta as embeddings } from "./embeddings-are-directions";
import Video, { meta as video } from "./diffusion-to-video";
import Math, { meta as math } from "./math-you-actually-need";

/** Add a post: create the .tsx next to this file, then add one line here. */
export const posts: Entry<PostMeta>[] = [
  { meta: selfAttention, Component: SelfAttention },
  { meta: embeddings, Component: Embeddings },
  { meta: video, Component: Video },
  { meta: math, Component: Math },
];
