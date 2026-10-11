# Validation record

Validated on **11 October 2026 (Australia/Sydney)** in this workspace. The approved reference was inspected in a browser, followed by rendered playground, shape, dashboard, mobile, and dark-theme screenshots.

## Completed checks

| Check                        | Result                                                                                                                                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`                | Successful; lockfile provided, no runtime dependencies                                                                                                                                                                                 |
| `npm run dev`                | Working Vite playground; theme/shape interactions and stable CSS download verified with no page errors                                                                                                                                 |
| `npm run lint`               | ESLint and Biome CSS lint pass                                                                                                                                                                                                         |
| `npm run format:check`       | Pass                                                                                                                                                                                                                                   |
| `npm test`                   | 62 pass: 56 semantic contrast pairs, 3 CSS/package checks and 3 release checks                                                                                                                                                         |
| `npm run build`              | All 6 pages, stable CSS artifact, modular CSS source, font license, and site assets emitted                                                                                                                                            |
| `npm run test:visual:update` | 8 light/dark playground/dashboard/component/modal PNG baselines generated and reviewed                                                                                                                                                 |
| `npm run test:browser`       | 216 pass, 19 intentional skips, 0 failures across 5 browser projects                                                                                                                                                                   |
| Accessibility                | axe WCAG 2/2.1/2.2 AA scans pass for playground, dashboard, forms, docs, components and open overlays in both themes across all 5 projects                                                                                             |
| Responsive layout            | No viewport overflow on those 5 pages at 320, 768, 1440 CSS px; 640px viewport verifies desktop 200% zoom-equivalent reflow                                                                                                            |
| Native interaction           | Keyboard radio, checkbox, range, select, switch and button behavior; form validation/submit/reset; dashboard search/details; table sorting/filtering, charts, modal validation/focus, popup dismissal/actions; accordions, tabs, pills |
| Themes/scoping               | Nested theme boundaries, persisted preference, blocked-storage fallback, standalone CSS use without styling plain host buttons                                                                                                         |
| Shape/motion                 | Radius changes, wave zero/off, masks and border/size controls, local static/reduced-motion overrides and system preference                                                                                                             |
| Forced colors                | Chromium desktop/mobile emulation verifies native switch fallback and removal of mask decoration                                                                                                                                       |
| Dependency audit             | Final dependency installation reports 0 vulnerabilities                                                                                                                                                                                |

Playwright projects are desktop Chromium, Firefox, WebKit, Pixel 7 Chromium emulation, and iPhone 13 WebKit emulation. Three forced-color checks are skipped where emulation is unavailable. Sixteen duplicate visual tests are skipped because baselines deliberately use desktop Chromium/Linux. These skips are explicit, not failed or unrun coverage presented as passing.

A final regression check asserts foreground and background colors change in the same computed-style update. It protects against the transient contrast loss found when button backgrounds previously transitioned independently during a theme switch. The CSS now animates geometry on hover/press, with immediate palette changes.

The expanded component collection adds 90 interaction, layout, fallback, and accessibility checks across five projects, plus two Chromium visual checks producing four additional screenshots. Coverage includes native accordion keyboard behavior, tab focus/selection and disposal, toggle pills, wave edges on cards/overlays, responsive layout, ambient pause/resume, and system/local reduced motion. Mobile WebKit wave dialog and tab surfaces were also inspected visually.

`npm run build-storybook` passes with 20 isolated HTML/Vite stories and generated foundation/component guides. `npm run test:storybook` covers 23 Chromium checks: every story runs its named play steps and receives WCAG scans in both themes at 320px; tabs and native overlays receive trusted keyboard checks; manager controls, global theme/wave choices, documentation, live Actions payloads and Interactions replay are verified. Play failures and incomplete runs fail browser CI. Design-token stories show resolved CSS values, and primitive stories cover buttons, inputs, layouts and shape variants. External axe scans set Storybook’s `a11y.manual` boolean for the test visit to avoid simultaneous scans; the workshop’s automatic accessibility checks remain enabled for normal use.

`npm run test:package` successfully packs 20 allowed files, installs into an isolated Vite consumer, and builds modular CSS, standalone CSS, and optional tab imports with no runtime dependencies. The package excludes Storybook, demo branding, playground code, and fonts. The public version `0.1.0` is available from npm and was installed into a fresh consumer directly from the registry. The GitHub release workflow is registered as an npm trusted publisher.

The wave/motion follow-up maps soft to strength 1 and expressive to strength 3 (the former soft silhouette). Ambient branding now uses a 12-second perspective rotation. Targeted browser, accessibility and visual checks passed: 14 checks across five browser projects, with 16 intentional duplicate visual skips. They verify a computed 3D transform, perspective, pause/resume and system/local reduced motion. The 23 Storybook checks and 62 unit checks also passed; site/Storybook builds and lint passed. The local tarball was refreshed with the new CSS.

## Performance

`npm run benchmark` measures 50 surfaces with waves off and at soft strength. It alternates five samples per condition, using Chromium DevTools main-thread task, style, and layout durations across 20 scripted scroll frames. The JSON report is saved in `test-results/performance.json`; a committed copy records the measured release candidate.

The final isolated run used Chromium **156.0.8078.4**, at 1440×1000. Means across five samples:

| 50-surface condition | Main-thread task time per sample | Style time | Layout time |
| -------------------- | -------------------------------- | ---------- | ----------- |
| Waves off            | 15.91 ms                         | 0.54 ms    | 0 ms        |
| Soft waves           | 20.29 ms                         | 1.80 ms    | 0 ms        |

The CSS artifact is **43,134 bytes raw / 10,340 bytes gzip** (about 10.1 KiB gzip). See [the measured JSON](performance-results.json) for all samples and limitations. These timings describe this machine and workload, not a cross-device budget. The complete CSS is below the automated **16 KiB gzip guardrail**. The normal site uses no wave masks on dashboard cards; only the Shape Lab opts in by default.

This smoke test does **not** measure GPU raster/paint, hardware battery use, real-device touch latency, or Core Web Vitals. It cannot certify an FPS target. Static masks add render work, so production keeps waves off and offers explicit local fallback. Use `examples/performance.html` in browser devtools on target devices for a full paint/scroll profile before enabling waves broadly.

## PRD acceptance mapping

- [x] Installation/dev and production build work locally.
- [x] Reusable, opt-in CSS bundle and modular source are available.
- [x] Light/dark themes switch immediately without reload; nested themes remain distinct.
- [x] Shape presets, wave strength/zero/off, border thickness, and sample size alter real rendering.
- [x] Hover/press/focus/selected/disabled demos and native controls work.
- [x] System and local reduced-motion/static fallback remove nonessential movement.
- [x] Playground, dashboard, forms, components, and docs reflow at required widths.
- [x] Automated core contrast checks and documented decorative-border exception.
- [x] Playwright interaction/a11y smoke checks and light/dark visual baselines.
- [x] One Vite site and HTML/Vite Storybook artifact, deployed by the default-branch Pages workflow with repository permissions only.
- [x] HTML/React CSS usage, version pinning guidance, licensing, limitations, browser and contributor docs.
- [x] Live GitHub Actions/Pages deployment verified remotely.
- [ ] Current stable Safari/iOS/Android hardware and manual screen-reader verification completed.
- [x] Public npm package `@cmwen/min-design-system@0.1.0` published and registry installation verified.
- [x] Tagged release using npm OIDC verified end to end.

## Remaining release checks

The public repository [cmwen/min-design-system](https://github.com/cmwen/min-design-system) has been created and the source pushed using a temporary checkout because this workspace has a read-only `.git` placeholder. Pages is configured for GitHub Actions with HTTPS and inherits `cmwen.dev`. The first CI run exposed incomplete optional dependencies in the lockfile; a clean lockfile was generated and verified with npm 12. [Actions run 38113547489](https://github.com/cmwen/min-design-system/actions/runs/38113547489) passed all quality gates: 62 unit checks, 216 browser checks (19 intentional skips), 23 Storybook checks, package-consumer validation and benchmark. Pages deployment succeeded. The live playground, components, docs and rendered Storybook story returned HTTP 200 with no JavaScript page errors in Chromium at `https://cmwen.dev/min-design-system/`. npm registry installation of `0.1.0` succeeded. The trusted publisher is configured for `publish.yml` and environment `npm`. The approved `v0.1.1` release completed through [trusted-publishing run 38114183506](https://github.com/cmwen/min-design-system/actions/runs/38114183506), including all quality gates and a signed npm provenance statement. [Pages run 38114177046](https://github.com/cmwen/min-design-system/actions/runs/38114177046) succeeded; the live CSS banner identifies version `0.1.1`. The initial attempt exposed npm 12’s changed pack JSON format. The consumer harness now supports both npm 11 and 12; the release workflow pins compatible npm 11.6.2 and supports retries of an existing immutable tag from the default branch. The version tag and tagged package source were preserved.

Before release, check actual stable Safari and iOS Safari, Android Chrome, keyboard-only operation, VoiceOver/NVDA labels and announcements, real 200% browser zoom, and forced colors on supported hardware. The automated browser engines and emulations are useful evidence, not substitutes for those checks.

## 0.3.0 release validation — 12 October 2026

The seeded geometry release passes lint, 80 unit checks, production and Storybook builds,
241 browser checks across Chromium, Firefox, WebKit and mobile emulations (19 intentional
visual/forced-color skips), 24 Storybook checks, isolated package installation, and the
50-surface benchmark. The consumer check imports CSS, tabs, and the optional seeded-theme
helper from the packed 0.3.0 package. The tarball contains 21 files and has no runtime dependencies.

Seeded coverage verifies repeatability, independent edge counts, zero/straight edges,
saved settings, randomization, palette-independent geometry, and downloaded CSS matching
the live preview. The default four waves per edge preserve the previous v1 silhouette.
Playground light/dark screenshot baselines include the new controls.

Remote npm publication and Pages deployment are verified after publishing the tagged release.
