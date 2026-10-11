# Contributing

Use Node 24 and `npm ci`. Start with `docs/PRD.md`, the approved `docs/reference.html`, and `docs/DECISIONS.md`.

Keep public CSS tokens/classes prefixed `ff`. Preserve native HTML semantics, keyboard behavior, and opt-in host-app styling. Do not introduce React, Tailwind, a global reset, continuously animated filters, or premature Web Components.

Before submitting a change:

1. Run `npm run check`.
2. Install Playwright browsers and run `npm run test:browser`.
3. For wave/motion changes, run `npm run benchmark` and profile `examples/performance.html` in browser devtools. Explain changed cost and fallback behavior.
4. Review light/dark screenshots. Run `npm run test:visual:update` only for an intentional visual change, and include the changed baselines.
5. Check real Safari/iOS and Android Chrome where available, keyboard-only interaction, screen-reader labels, reduced motion, forced colors, and 200% zoom.

Generate wave silhouettes deterministically with `node scripts/generate-waves.mjs`; commit the generated `src/waves.css`. Do not hand-edit the encoded SVGs. The generator runs only during authoring, never per frame.

Document API changes in the site and README. Keep core contrast pair tests current; custom palettes are consumer-owned. CSS geometry may improve, but clipping text or focus outlines is a regression. Avoid speculative wrappers and tests that merely repeat implementation details.

Keep font licenses with redistributed binaries. Code contributions are MIT licensed. npm publication, tags, and Pages publication are maintainer release actions; package metadata stays private until its identity is configured with `npm run release:configure`. See [the release guide](docs/RELEASE.md) for Pages, npm and trusted publishing.
