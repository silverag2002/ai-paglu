import type { PostMeta } from "@/content/types";
import {
  Lead, P, H2, H3, Ol, Step, IC, B, Em, Callout, TLDR, KeyTakeaways,
  CodeBlock, Formula, Sub, Divider, DataTable,
} from "@/components/prose";
import { DiffusionSteps } from "@/components/visuals/DiffusionSteps";

export const meta: PostMeta = {
  slug: "diffusion-to-video",
  title: "From diffusion to video: time is the hard part",
  summary:
    "Image diffusion is well understood. Video is not image diffusion run 24 times — the moment you add a second frame, the problem changes shape.",
  tags: ["diffusion", "video", "generative"],
  published: "2026-09-05",
  readMinutes: 12,
  level: "working",
};

export default function Article() {
  return (
    <>
      <Lead>
        I assumed video generation was image generation in a loop. It is not, and the reason why is
        the most interesting thing I have learned this month.
      </Lead>

      <TLDR>
        <P>
          A diffusion model turns noise into an image by repeatedly predicting the noise and
          subtracting a little of it. Run that independently per frame and you get 24 unrelated
          plausible images per second — flicker, not motion. Video models fix this with shared
          noise, attention across time, and compression in a latent space where a frame costs almost
          nothing to store.
        </P>
      </TLDR>

      <H2>How a single image gets made</H2>

      <P>
        Training is the part that surprised me: the hard direction is never learned. You take a real
        image, add a known amount of Gaussian noise, and ask the network one question —{" "}
        <B>what noise did I just add?</B> That is a supervised problem with a perfect label, because
        you generated the noise yourself.
      </P>

      <Formula note="the entire training objective, minus the scheduling details">
        L = ‖ ε − ε<Sub>θ</Sub>(x<Sub>t</Sub>, t) ‖²
      </Formula>

      <P>
        A noisy image goes in along with the timestep <IC>t</IC>; a prediction of the noise comes
        out; you penalise the difference. The model never sees a clean image as a target and is
        never asked to draw anything.
      </P>

      <P>
        Generation then runs the process backwards. Start from pure noise, ask the model what noise
        it sees, subtract a fraction of it, repeat twenty to fifty times. Each step is a small,
        confident correction rather than one enormous leap — which is exactly why it works where a
        single-shot generator struggles.
      </P>

      <Callout kind="intuition" title="Why many small steps">
        <P>
          Asking &ldquo;what is the image?&rdquo; from pure noise has a hopeless answer: the average
          of all possible images, which is grey mush. Asking &ldquo;which way is slightly less
          noisy?&rdquo; has a sharp answer. Diffusion replaces one impossible question with fifty
          easy ones.
        </P>
      </Callout>

      <H2>Now add a second frame</H2>

      <P>
        Run that process twice with different starting noise and you get two perfectly good images
        that are not the same scene. Slightly different lighting, a slightly different face, a
        shirt that changed colour. Play them in sequence and it reads as a hallucination, not a
        shot.
      </P>

      <P>
        Scrub the step slider, then toggle the noise link on the frame row underneath. The
        difference between those two states is essentially the entire problem statement of video
        generation:
      </P>

      <DiffusionSteps />

      <P>
        Sharing the starting noise buys a lot of stability for free, and every practical system does
        it. But it is not sufficient — a shared seed gives you frames that agree because nothing
        moved. The actual requirement is harder: <B>frames must differ in exactly the ways the
        motion demands, and in no other way.</B>
      </P>

      <Callout kind="gotcha" title="Consistency and motion pull against each other">
        <P>
          Push for consistency and you get a near-still image with a slight wobble. Push for motion
          and you get flicker, morphing faces, objects that change identity between frames. Most of
          the visible quality difference between video models is where they sit on this trade-off.
        </P>
      </Callout>

      <H2>The three things that actually fix it</H2>

      <H3>1. Attention across time</H3>

      <P>
        The strongest fix is the familiar one. Let each patch of each frame attend to the same
        region in neighbouring frames, so frame 7 is generated knowing what frames 6 and 8 are
        doing.
      </P>

      <P>
        The cost is brutal if done naively. Spatial attention over one frame is already quadratic in
        the number of patches; full spatio-temporal attention is quadratic in patches{" "}
        <Em>times</Em> frames. So implementations factorise it — attend within a frame, then attend
        across time at the same spatial position:
      </P>

      <CodeBlock
        lang="python"
        caption="Factorised attention: two cheap passes instead of one unaffordable one."
        code={`# x: (B, F, N, C) — batch, frames, patches per frame, channels

# 1) spatial: each frame attends to itself
x = rearrange(x, "b f n c -> (b f) n c")
x = x + spatial_attn(norm1(x))

# 2) temporal: each patch position attends across frames
x = rearrange(x, "(b f) n c -> (b n) f c", f=F)
x = x + temporal_attn(norm2(x))

x = rearrange(x, "(b n) f c -> b f n c", n=N)

# full joint attention costs (F*N)^2; this costs N^2 + F^2 per token`}
      />

      <H3>2. Generate in latent space, not pixel space</H3>

      <P>
        A second of 512×512 video is about 6 million numbers. Diffusing that directly is
        unaffordable. So an autoencoder is trained first to compress each frame roughly 8× in each
        spatial direction — a 64× reduction — and diffusion happens entirely inside that compressed
        space. Only at the very end does the decoder turn latents back into pixels.
      </P>

      <DataTable
        head={["Space", "Numbers per 512×512 frame", "Diffusion cost"]}
        rows={[
          ["Pixels", "786,432", "prohibitive"],
          ["Latent (8× downsample)", "12,288", "tractable"],
          ["Latent + temporal compression", "~4,096 effective", "what video models actually do"],
        ]}
      />

      <P>
        Video models push further and compress along time as well, since adjacent frames are
        enormously redundant. This is quietly one of the biggest wins available: the cheapest frame
        is the one you never had to represent separately.
      </P>

      <H3>3. Train on video, not on images</H3>

      <P>
        A model trained only on stills has no idea what motion looks like. It does not know that
        water falls, that a walk cycle has a rhythm, that a cup knocked off a table keeps going.
        Those priors come only from video data, and they are the difference between a moving picture
        and a plausible event.
      </P>

      <Divider />

      <H2>What to watch for when judging a clip</H2>

      <Ol>
        <Step>
          <B>Identity drift.</B> Pause at the start and the end and compare a face or a logo. Slow
          drift is the classic failure of weak temporal attention.
        </Step>
        <Step>
          <B>Texture crawl.</B> Fine detail — grass, hair, fabric — that shimmers without the object
          moving. Insufficient latent temporal compression.
        </Step>
        <Step>
          <B>Physics that only works locally.</B> Motion that is right frame-to-frame but wrong over
          a second, like a limb that passes through itself. The temporal window is too short.
        </Step>
        <Step>
          <B>The still-image tell.</B> A suspiciously static camera on a suspiciously static scene
          is a model buying consistency by refusing to move.
        </Step>
      </Ol>

      <Callout kind="recall">
        <P>
          The compact version to carry around: <B>image diffusion is a denoising problem; video
          diffusion is a denoising problem with a consistency constraint.</B> Every architectural
          choice in a video model is paying for that constraint.
        </P>
      </Callout>

      <KeyTakeaways
        items={[
          "Diffusion models are trained to predict the noise that was added, which makes an impossible generation task into an easy supervised one.",
          "Generating each frame independently produces flicker — 24 plausible but unrelated images per second.",
          "Sharing the starting noise across frames is the cheapest large improvement, and it is not sufficient on its own.",
          "Factorised spatial-then-temporal attention makes cross-frame context affordable; full joint attention is not.",
          "Latent-space diffusion, compressed along time as well as space, is what makes video generation tractable at all.",
        ]}
      />
    </>
  );
}
