# mercure.exe

Two surfaces that must not look like each other. See `CLAUDE-app.md` for the design contract.

| Route | What | Register |
|---|---|---|
| `/` | the site | cinematic, dark, alive — Lenis + GSAP + WebGL blob |
| `/tx/[id]` | the signing page | clinical, still, no motion, no WebGL |
| `/api/og` | OG images | satori via `next/og`; `?tx=<id>` for a route, `?title=` for an article |

## Run

```bash
pnpm install
cp .env.example .env.local   # fill NEXT_PUBLIC_REOWN_PROJECT_ID for WalletConnect; optional
pnpm dev
```

Demo routes: `/tx/demo`, `/tx/demo-withdraw`, `/tx/demo-wbtc`, `/tx/expired`, `/tx/anything-else` (404).

`pnpm lint` enforces the surface boundary (ESLint `boundaries/dependencies`): nothing under
`components/ui`, `components/sign` or `app/tx` may import `lib/motion.ts`, GSAP, Lenis, Tempus,
motion, three or maath; the site never imports the signing components and vice versa.

## Layout

```
app/(site)          landing (Hero, HowItWorks, Markets, SigningSpecimen)
app/tx/[id]         signing page — server-rendered, force-dynamic (expiry is wall-clock)
app/api/og          OG image route
components/site     motion + WebGL. SmoothScroll boots Tempus→Lenis→GSAP; Blob is raw three
components/sign     TxSentence, TxNumbers, RiskFlags, SignerAddress, ApproveFlow, ConnectButton
components/ui       Button (cva), Label, Wordmark, cn — safe on both surfaces
lib/chain.ts        defineChain(4663) — the only place the chain is defined
lib/motion.ts       one RAF loop (Tempus); Lenis, GSAP, blob subscribe in order
lib/routes.ts       routing engine (MOCK) — getRoute / listMarkets / describeRoute
lib/tokens.css      brand tokens
```

## The blob budget

`CLAUDE-app.md` §6 caps the blob at 180 KB gzipped beyond the base bundle. The R3F + drei +
postprocessing stack it suggests measured **354 KB gz** (R3F imports all of three). The blob is
therefore written in raw three with named imports, a PMREM'd studio of emissive panels for the
lime-tinted environment, and a three-pass bright/blur/composite bloom on HDR hotspots only.
It measures **~141 KB gz** (`next build`, sum of the dynamic chunks in
`.next/react-loadable-manifest.json` for `BlobSwitch -> ./Blob`). Re-measure before adding to it.

The blob loads only on `(min-width: 768px) and (pointer: fine)` without `prefers-reduced-motion`.
Everything else gets `public/blob-still.svg`, which is always in the DOM for first paint.

## Placeholders to replace

- `public/blob-still.svg` — generated placeholder; drop in the pre-rendered still from the master assets.
- `components/ui/Wordmark.tsx` — renders `mercure.exe_` in Departure Mono; swap for the wordmark SVG when it lands.
- `lib/routes.ts` — mock routing engine. Keep the types, replace the bodies.
- `lib/chain.ts` — RPC / explorer URLs for Robinhood Chain (4663) are best guesses; override with `NEXT_PUBLIC_RH_RPC_URL`.

## Fonts

Self-hosted, Latin subset, `font-display: swap`, in `app/fonts/`: Departure Mono (OFL, display),
Inter Tight 300/400/500 (body), IBM Plex Mono 400/500 (data). `assets/og/` holds OTF/WOFF copies for satori.
