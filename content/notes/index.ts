import type { NoteMeta, Entry } from "@/content/types";

import Shapes, { meta as shapes } from "./transformer-shapes";
import Backprop, { meta as backprop } from "./backprop-recall";
import Tokens, { meta as tokens } from "./tokenization-gotchas";
import Stability, { meta as stability } from "./training-stability";

/** Add a note: create the .tsx next to this file, then add one line here. */
export const notes: Entry<NoteMeta>[] = [
  { meta: shapes, Component: Shapes },
  { meta: backprop, Component: Backprop },
  { meta: tokens, Component: Tokens },
  { meta: stability, Component: Stability },
];
