# CLAUDE.md — mercure.exe / app

> Frontend context for Claude / AI coding agents working on this repo.
> Read this before writing components. Protocol-level context lives in the root `CLAUDE.md`.

---

## 1. The thesis: two surfaces, opposite rules

This repo ships **two things that must not look like each other**.

| | `/` — the site | `/tx/[id]` — the signing page |
|---|---|---|
| Job | make you believe this is serious | let you approve a transaction without doubt |
| Register | maximal, cinematic, dark, alive | clinical, still, legible, boring |
| Motion | parallax, scroll orchestration, WebGL | **none** |
| Type scale | huge display, wide tracking | one size up from body, that's it |
| Color | lime on black, high contrast | lime used once, as a state indicator |

**This is the single most important rule in the repo.** Nobody wants a parallax animation while they're approving a transaction with their money. Motion on a confirmation screen reads as a magic trick, and a magic trick is the exact wrong feeling. The site sells; the signing page reassures. Any component that crosses between them is a bug.

If you find yourself importing GSAP into anything under `/tx`, stop.

---

## 2. Brand tokens

Sampled from the master assets — use these exact values, don't eyeball new ones.

```css
--black:        #000000;  /* true black. not #0A0A0A, not #111. the assets are pure black */
--lime:         #A8D000;  /* primary. the blob body, sampled from the master render. wordmark, UI accent, links */
--lime-mid:     #8DB000;  /* hover/pressed, secondary fills */
--lime-deep:    #203000;  /* blob shadow. borders, dividers, inert surfaces */
--highlight:    #F0F8A0;  /* specular. use ONLY for focus rings and active glow */

--grey-90:      #0E0E0E;  /* signing page surface */
--grey-70:      #2A2A2A;  /* signing page borders */
--grey-40:      #6E6E6E;  /* secondary text */
--grey-10:      #E8E8E8;  /* signing page body text */
```

(Values re-sampled 2026-08-26 from `ChatGPT Image 20 août 2026, 18_03_21.png`; the accent is the blob body, not a neon.)

**Discipline:** `--lime` is loud. On the site it can carry a whole section. On the signing page it appears **once per screen, maximum** — the connect state, or the approve button, never both. A page where everything is lime is a page where nothing is.

The palette is deliberately only lime + black + a neutral ramp. **Do not add a second accent hue.** No purple gradient, no cyan for "info", no red for errors — errors are `--grey-10` text with a `--lime` marker. Resist this specifically; it's the most likely way this design gets diluted.

---

## 3. Typography

Three roles, and the display face is doing the heavy lifting.

- **Wordmark / display** — a pixel-grid monospace matching the `mercure.exe_` asset. Nearest free candidates: **Departure Mono**, **Monaspace Krypton**, or **BPdotsUnicase**. The rendered wordmark asset is the source of truth; if the webfont doesn't match, use the SVG and don't fake it.
- **Body / UI** — a neutral grotesk with real character in the lower weights. **Suisse Int'l** if licensed, otherwise **Inter Tight** or **Geist**. Not plain Inter — it's the tell.
- **Data / labels** — **IBM Plex Mono** for APYs, addresses, chain IDs, tx hashes. Anything a user might copy or verify is monospace. Non-negotiable: proportional digits in an address field is a legibility failure.

Scale — the jump between display and body should be violent, not gradual:

```
display  clamp(3.5rem, 9vw, 9rem)   / 0.92 lh / -0.03em tracking
h2       clamp(1.75rem, 3vw, 2.5rem) / 1.1  lh / -0.01em
body     1.0625rem                   / 1.55 lh /  0
mono     0.875rem                    / 1.4  lh /  0.02em  uppercase for labels
```

Never center a paragraph. Measure caps at ~68ch.

---

## 4. Stack

```
Next.js 15 (App Router) · TypeScript · Tailwind v4 (CSS-first @theme)
```

**Motion & scroll**
- **Lenis** — smooth scroll. The foundation; parallax without it feels wrong on trackpads.
- **GSAP + ScrollTrigger** — scroll orchestration, pinning, timeline scrubbing.
- **motion** (the package formerly Framer Motion) — component-level enter/exit and layout animation. Don't use it for scroll; that's GSAP's job. Two libraries, two clearly split responsibilities.
- **Tempus** — **read this one.** Lenis, GSAP, and R3F each want to own `requestAnimationFrame`. Three competing RAF loops is where the jank comes from, and it is the most common failure in sites that look like this. Tempus gives you one loop everything subscribes to. Wire it before you build anything.

**WebGL (the blob)**
- **@react-three/fiber** + **@react-three/drei**
- **@react-three/postprocessing** — selective bloom on the lime only. Bloom on everything is how this becomes a 2021 crypto site.
- **maath** — easing and damping helpers; use `maath/easing.damp3` for pointer-follow instead of hand-rolled lerps.

**Wallet (signing page only)**
- **wagmi** + **viem** + **Reown AppKit**. Robinhood Chain 4663 defined locally via `defineChain`.

**Utility**
- **satori** — OG images generated from JSX. Every `/tx/[id]` and every article gets one on brand automatically.
- **cva** + **tailwind-merge** for variants.

**Worth a look if the scroll sequence gets complex:** **Theatre.js** lets you art-direct a scroll timeline in a visual editor and export JSON, instead of tuning magic numbers in code for two days. Overkill for three sections; a real time-saver past five.

---

## 5. Motion system

**Parallax is depth, not decoration.** Layers move at different rates because they're at different distances. Pick a z-model and hold it everywhere:

```
z-far    blob / ambient        0.15× scroll
z-mid    section imagery       0.55×
z-near   type, UI              1.0×  (never parallaxed)
```

**Text does not parallax.** Reading something that drifts relative to its container is unpleasant, and it's the single fastest way to make a site feel AI-generated. Type gets reveal animations; it doesn't get displacement.

Timing:

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* reveals, entrances */
--ease-io:  cubic-bezier(0.65, 0, 0.35, 1);  /* transforms, pins */
--dur-fast: 240ms;   --dur-base: 520ms;   --dur-slow: 900ms;
```

Reveals fire once, at 20% viewport entry, and never replay on scroll-up. Stagger siblings at 60ms — enough to read as a sequence, short enough not to wait.

**One orchestrated moment, not scattered effects.** The page-load sequence — wordmark types in, blob resolves from black — is where the boldness goes. Everything after it is quiet.

`prefers-reduced-motion: reduce` kills Lenis, all ScrollTriggers, and the blob's idle rotation. It does **not** kill the site: the layout must be fully readable and complete as a static document. Test it by disabling JS entirely.

---

## 6. The blob

The liquid-chrome lime form is the signature element. It carries the identity, so it has to be good, and it has to not cost 40MB.

**Approach — desktop:** R3F, an `<Icosahedron>` with high subdivision and a custom vertex displacement shader (simplex noise, low frequency, slow drift), material = `MeshStandardMaterial` with `metalness: 1`, `roughness: 0.08`, and a lime-tinted studio HDRI. The lime comes from the environment map and `envMapIntensity`, **not** from `color` — tinting the base color gives you flat plastic, not metal. Add selective bloom on the specular hotspots only.

**Approach — mobile:** don't ship WebGL. Use the pre-rendered still. A 60fps shader on a mid-range Android costs more than it returns, and the blob's job on mobile is to be recognized, not to move.

Pointer interaction: the blob leans toward the cursor with heavy damping (`damp3`, lambda ≈ 2.5). Slow and reluctant, like something viscous. If it tracks the cursor tightly it reads as a toy.

**Budget:** the blob route is under 180KB gzipped of JS beyond the base bundle, or it gets replaced by the still. Measure before you defend it.

---

## 7. The signing page

Written last here, most important in practice. This is the screen where trust is won or lost.

**Structure, top to bottom, nothing else:**

1. What this does, in **one plain sentence**. `Deposit 5,000 USDG into Morpho USDG/wETH. Current net APY 8.4%.` Not calldata. Not a hex blob. A sentence a person reads once and understands.
2. The numbers, in mono, aligned: amount, protocol, market, net APY, estimated fee.
3. Risk flags, if any, as plain text — no icon-only warnings, no yellow triangles.
4. The address you're signing from, full, monospace, selectable.
5. One button: **Approve in wallet**. Verb, present tense, matches what the wallet will show.
6. Expiry countdown, understated.

**Rules:**
- No motion. No fade-ins. The page is complete on first paint.
- No dark-pattern hierarchy — "Cancel" is the same visual weight as "Approve".
- Never render a number you didn't compute yourself. If the routing engine didn't return it, it doesn't appear.
- Expired means expired: the page states it plainly and offers to re-run the route, not a stale button.
- Works at 320px. Works with a screen reader. Works without WebGL, without smooth scroll, without anything from section 5.

If a route can't be described in the sentence at step 1, the protocol doesn't offer that route. That constraint lives in the root spec and it is enforced here, visually.

---

## 8. Quality floor

- LCP < 1.8s on 4G, CLS < 0.05, no long tasks over 200ms on the site route.
- Fonts self-hosted, `font-display: swap`, subset to Latin.
- Keyboard focus visible everywhere, using `--highlight`. Never `outline: none` without a replacement.
- Contrast: `--lime` on `--black` passes AA at body size. `--lime-mid` on black **does not** — use it for fills and borders, never for text.
- Every route renders server-side and is readable with JS off.

---

## 9. Structure

```
/app
  /(site)          landing — motion, WebGL, the loud one
  /tx/[id]         signing page — no motion, no WebGL, no exceptions
  /api/og          satori OG generation
/components
  /site            parallax sections, reveals, blob
  /sign            tx summary, risk flags, approve flow
  /ui              shared primitives — must work in both contexts
/lib
  chain.ts         defineChain(4663) — single source of truth
  motion.ts        Tempus wiring, Lenis+GSAP+R3F on one RAF
  tokens.css       the values in section 2
```

Anything in `/components/ui` is imported by both surfaces, so it may not depend on GSAP, Lenis, or three. Enforce it with an ESLint boundary rule rather than discipline.

---

## 10. Non-negotiables

- **The signing page never animates.**
- **One accent color.** Lime. If a second hue appears, delete it.
- **Text never parallaxes.**
- **The blob is optional.** Every page is complete and correct without it.
- **Monospace for anything verifiable** — addresses, hashes, APYs, chain IDs.
- **Reduced motion is a real mode**, tested, not a media query someone added at the end.
- **One RAF loop.** Tempus, wired first.

---

*mercure.exe — the messenger runs onchain.*
