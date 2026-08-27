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

## Route links

A route is not stored anywhere — the id *is* the route. `encodeRouteId()` packs the intent
(kind, market key, amount, issue time) into a url-safe token with a checksum; `getRoute()`
unpacks it and rebuilds the transaction. So whatever mints the link needs no shared database
with the site, and the link carries its own ten-minute expiry.

```ts
import { encodeRouteId } from '@/lib/routes'

const id = encodeRouteId({ kind: 'deposit', marketKey: 'morpho-usdg-weth', amount: '5000' })
// -> /tx/MXxkfG1vcnBoby11c2RnLXdldGh8NTAwMHx0a2ZuOXo.1cvoosn
```

`/tx/<id>` 404s when the token is malformed, truncated, tampered with, or names a market that
is not `open`. It renders the expired state once `issuedAt + 10min` has passed. The checksum
guards against bad copy/paste — it is not a signature, and route ids are not secrets: the id
only describes a transaction the wallet shows in full before it is signed.

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
lib/routes.ts       routing engine — encodeRouteId / getRoute / listMarkets / describeRoute
lib/tokens.css      brand tokens
```

## The blob on the site

One fixed canvas for the whole page (`BlobStage`, site layout), choreographed by scroll:
`blob/pose.ts` holds a pose per section (`x`/`y` in viewport units, `scale`, `spread` = how far
the four droplets detach to their slots, `calm` = surface stops moving, `rot`); `blob/director.ts`
scrubs the shared target from the previous section's pose to the next as each `data-blob-pose`
section enters; `blob/scene.ts` damps toward the target every frame. Poses keep the body in the
margins — only droplets sit among the type. Mobile / coarse pointer / reduced motion get the
still (`public/blob-still.webp`, the master render) in the hero and no canvas.

Sections: Hero → Ticker (one sentence per open market) → Stats (figures read off the markets) →
How it works → The sentence (pinned) → Markets → Manifesto → The signing page → Footer.

## The blob budget

`CLAUDE-app.md` §6 caps the blob at 180 KB gzipped beyond the base bundle. The R3F + drei +
postprocessing stack it suggests measured **354 KB gz** (R3F imports all of three). The blob is
therefore written in raw three with named imports, a PMREM'd studio of emissive panels for the
lime-tinted environment, and a three-pass bright/blur/composite bloom on HDR hotspots only.
It measures **~141 KB gz** (`next build`, sum of the dynamic chunks in
`.next/react-loadable-manifest.json` for `BlobSwitch -> ./Blob`). Re-measure before adding to it.

The blob loads only on `(min-width: 768px) and (pointer: fine)` without `prefers-reduced-motion`.
Everything else gets `public/blob-still.webp`, which is always in the DOM for first paint.

## Before deploying

- Set `NEXT_PUBLIC_SITE_URL` to the real origin — OG images, `robots.txt` and the sitemap are
  absolute and will otherwise point at localhost.
- Set `NEXT_PUBLIC_REOWN_PROJECT_ID` if you want WalletConnect; without it the signing page
  offers the injected (extension) connector only.
- `lib/chain.ts` — confirm the RPC and explorer URLs for Robinhood Chain (4663); override the
  RPC with `NEXT_PUBLIC_RH_RPC_URL`.
- `lib/routes.ts` — market ids, rates and `buildTx()` still come from the constants in that
  file rather than from the chain. See the note at the top of the module.
- `components/ui/Wordmark.tsx` — renders `mercure.exe_` in Departure Mono; swap for the
  wordmark SVG when it lands.

## Fonts

Self-hosted, Latin subset, `font-display: swap`, in `app/fonts/`: Departure Mono (OFL, display),
Inter Tight 300/400/500 (body), IBM Plex Mono 400/500 (data). `assets/og/` holds OTF/WOFF copies for satori.
