# Forest & Fern

A CSS-first, framework-agnostic look and feel for native HTML. Warm paper and deep forest greens, softly asymmetric corners, optional static wave edges, and small, accessible state transitions.

The CSS is the product. No React, Tailwind, Web Components, or runtime dependency in the CSS package. Optional vanilla tab and seeded geometry helpers are exported separately. The Vite site uses small vanilla JavaScript modules to demonstrate the CSS.

## Run locally

Requires Node 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173/forest-and-fern/`. The site includes the interactive Theme, Shape, and Motion Labs; native control inventory; common component collection; dashboard; project form; documentation; and a 50-surface performance fixture. Preferences survive reload when local storage is available. Blocked storage falls back gracefully.

```sh
npm run check                       # JS/CSS lint, token tests, production build
npx playwright install --with-deps   # One-time browser/system dependency setup
npm run test:browser                 # Chromium, Firefox, WebKit + mobile emulations
npm run benchmark                   # 50-surface waves off/on main-thread smoke
npm run test:visual:update           # Deliberately regenerate Chromium baselines
npm run preview                     # Serve the production build
npm run storybook                   # HTML/Vite component workshop on port 6006
npm run build-storybook             # Build workshop into dist/storybook after site build
npm run test:storybook              # Story accessibility/mobile/interaction checks
npm run test:package                # Install and build an isolated Vite consumer
```

`dist/` is the deployable static site. The reusable artifact is `dist/assets/forest-and-fern.css`; original modular CSS is copied to `dist/css/`. Dev mode serves the same bundle at `assets/forest-and-fern.css`. Vite provides source mapping in development; production site JavaScript includes source maps. The stable CSS artifact is readable, concatenated source for straightforward debugging.

## Install in your other apps

Run `npm pack` to create `cmwen-min-design-system-0.3.0.tgz`, then `npm install ./vendor/cmwen-min-design-system-0.3.0.tgz` in your other app. Import `@cmwen/min-design-system` for modular CSS or `@cmwen/min-design-system/forest-and-fern.css` for the standalone bundle. See [the complete installation guide](docs/INSTALL.md) for theme boundaries, native recipes, optional tabs, framework integration and versioning. The [release guide](docs/RELEASE.md) covers GitHub Pages and npm trusted publishing. Install registry releases with `npm install @cmwen/min-design-system`.

## Use in plain HTML

Copy the built CSS into your own app:

```html
<link rel="stylesheet" href="/assets/forest-and-fern.css" />
<section class="ff-theme" data-ff-theme="light">
  <article class="ff-card" data-ff-shape="organic">
    <h2 class="ff-heading">Your workspace</h2>
    <label for="search">Search</label>
    <input class="ff-input" id="search" type="search" />
    <button class="ff-button" type="button">Explore</button>
  </article>
</section>
```

All custom properties use `--ff-*`. Tokens have global light defaults; **element styling is opt-in**. `.ff-theme` applies container type/color/background. Use classes on individual controls, or explicitly opt into automatic button/input/select/textarea/link styling inside `.ff-native`. No global reset is shipped.

## Use in React, Vue, Astro, or another framework

Import the exact same stylesheet; keep native HTML and your framework’s own application behavior. React example:

```jsx
import './assets/forest-and-fern.css';

export function Actions() {
  return (
    <section className="ff-theme" data-ff-theme="dark">
      <button className="ff-button">Explore</button>
    </section>
  );
}
```

This example does not add React to the package. Alternatively vendor the `src/` directory at the **v0.3.0** release/tag or a recorded commit, and import `src/index.css` through your bundler. Prefer versioned artifacts over mutable Pages/main URLs. The package is configured as `@cmwen/min-design-system`, with public releases built from `cmwen/min-design-system` on GitHub. Follow [the release guide](docs/RELEASE.md).

## Themes, geometry, and motion

- `data-ff-theme="light|dark"` sets the palette and platform `color-scheme` on any boundary, including the document root. Nested boundaries reset every palette token.
- `data-ff-shape="none|soft|organic|expressive"` or `.ff-shape-*` chooses deterministic elliptical corner geometry.
- Waves are **off by default**. Opt in with `data-ff-wave="soft|expressive"` or `data-ff-wave-strength="1"` through `"12"` on a surface/container. Soft uses strength 1 for a quieter edge; expressive uses strength 3, the previous soft silhouette. Use one wave attribute per boundary. `"0"`, `data-ff-wave="off"`, or `.ff-no-wave` removes the mask.
- `data-ff-motion="subtle|organic|expressive|none"` chooses 160/280/440 ms or a static fallback. `data-ff-reduced-motion="true"` previews reduced motion; the system preference always takes priority.
- `.ff-card` is a decorative surface. `.ff-interactive` adds motion only where you deliberately apply it to a semantic interactive element.

The wave engine uses precomputed SVG silhouettes on decorative pseudo-elements. **No filters on content, no turbulence, no continuous animation.** Radius presets still affect the panel corners. Mask support is progressive enhancement; unsupported browsers retain pure asymmetric radii. Strength scales with panel dimensions rather than representing exact pixels. Wave masks suppress the normal shadow and can exaggerate waves on very narrow or long surfaces. Use pure radii there.

The range is native, with separate WebKit/Firefox thumb and track rules. Radio and checkbox glyphs use native rendering and `accent-color`; selects retain the platform popup and arrow. The styled switch remains a checkbox. Forced colors restores its platform rendering. Use real labels, fieldsets/legends, disabled attributes, and described validation messages.

See [the complete API documentation](docs/index.html) and [architecture decisions](docs/DECISIONS.md).

## Seeded shapes

The Shape Lab includes Seed, Variation, per-edge wave counts, Randomize, and Export CSS controls. Settings persist
when browser storage is available. Randomize creates a new seed; the same seed and settings
reproduce the same corners and static waves. Variation 0 retains the original preset geometry.
Light/dark colors are independent of the seed.

Download the generated CSS, load it after the library stylesheet, and add `ff-seeded-theme`
to a `.ff-theme` boundary or individual card. Its tokens are inherited by cards and controls;
explicit shape/wave presets on descendants override inherited values. A single exported
stylesheet requires no JavaScript. Sample width only affects the playground.

For runtime or build-time generation, use the optional helper:

```js
import '@cmwen/min-design-system';
import { createTheme } from '@cmwen/min-design-system/theme';

const theme = createTheme({
  seed: 'my-company', // nonempty string, up to 200 characters
  shape: 'organic', // none | soft | organic | expressive
  variation: 0.6, // 0–1
  waveStrength: 3, // integer 0–12; default 0 (off)
  waveCounts: { top: 4, right: 2, bottom: 4, left: 2 }, // each 0–12; default 4 per edge
});
theme.apply(document.querySelector('.ff-theme'));
// Or write theme.toCSS() to a file; its selector is .ff-seeded-theme.
```

`theme.tokens` contains the three generated CSS custom properties. `theme.version` is 1;
record the generator/package version with saved seeds, or export CSS to freeze the appearance.
For per-card variation, derive a seed from a stable ID, such as `my-company:project-123`.
The helper generates geometry without accessing the DOM until `apply()` is called.
Each wave is a crest and a trough. Set an edge count to 0 for a straight edge;
all four counts at 0 remove the mask. Changing one edge's count leaves the other
edges' curves unchanged. Corners use CSS elliptical border radii, and waves use
generated static SVG paths embedded in CSS masks. Exported CSS needs no runtime JavaScript.

## Typography

The CSS declares Nunito with `system-ui, sans-serif` fallback and makes no font/network request. The playground self-hosts Nunito’s Latin variable subset from `@fontsource-variable/nunito` (5.3.0) in `public/fonts/`, with its [SIL OFL 1.1 license](public/fonts/OFL.txt). A system font supplies glyphs outside that subset.

To self-host Nunito in another app, copy the font and license and add your own `@font-face` declaration with `font-display: swap`. For other scripts, obtain the appropriate subset or full font. An optional Google Fonts URL is documented on the site; no third-party font service is required.

## Accessibility and compatibility

Core text/state pairs meet 4.5:1 and focus/control borders meet 3:1 in both themes. Decorative surface borders are intentionally subtle and are not state indicators. Textual error messages, native checked glyphs, and focus rings provide independent cues. Disabled text is tested for readability even though inactive controls are exempt under WCAG.

Automated coverage includes keyboard radio/checkbox/range/switch/button interaction, native select/form behavior, reduced motion, forced colors, nested themes, axe WCAG AA scans, layout at 320/768/1440 CSS px, and 200% zoom-equivalent reflow. Chromium light/dark screenshots cover the playground, dashboard, component collection, and open modal. WebKit/mobile emulation is **not a claim of real Safari/iOS/Android certification**; real-device and screen-reader checks remain a release checklist item.

[Validation results and remaining release checks](docs/VALIDATION.md) document the tested matrix and measured performance. The benchmark reports headless Chromium main-thread task/style/layout cost; it does not measure GPU raster cost, real-device battery use, or promise Core Web Vitals. Keep waves limited to showcase surfaces and off on low-power layouts.

## One repository, GitHub Pages

Vite builds all pages together. Default base: `/forest-and-fern/`. Set `FF_BASE=/your-repo/` or `/` for a custom domain/user site:

```sh
FF_BASE=/your-repo/ npm run build
```

The [Actions workflow](.github/workflows/deploy.yml) runs checks and browser tests, records the benchmark, uploads reports, and deploys only the repository’s default branch. It derives the base from the actual repository name. Enable **Settings → Pages → Source: GitHub Actions** once. Deployment uses only the repository’s `pages: write` and `id-token: write` permissions. For a dedicated custom domain served at its root, set repository variable `FF_BASE` to `/`. This project inherits `cmwen.dev` and retains `/min-design-system/`.

The public source repository is [cmwen/min-design-system](https://github.com/cmwen/min-design-system). The configured Pages site is [cmwen.dev/min-design-system](https://cmwen.dev/min-design-system/), with [Storybook](https://cmwen.dev/min-design-system/storybook/) alongside the playground. Deployment verification is recorded in [VALIDATION.md](docs/VALIDATION.md).

## Delivery phases

1. Foundation: modular CSS, scoped API, themes, Vite, Pages workflow.
2. Shape/motion: explicit presets, static opt-in masks, state transitions, reduced motion.
3. Native controls: all requested fields/controls and semantics.
4. Playground/examples: working labs, dashboard search/details, native project form, documentation and stable bundle.
5. Quality/release: contrast/package tests, cross-browser smoke, axe scans, responsive checks, screenshot baselines, performance fixture and contributor guidance. Remote publication and real-device certification are listed separately in the validation record.

Project code: [MIT](LICENSE). Nunito: [SIL OFL 1.1](public/fonts/OFL.txt). Contributions: [CONTRIBUTING.md](CONTRIBUTING.md). Future Web Components are reserved for genuinely novel behavior; there are none in this MVP.

## Common component patterns

Open `examples/components.html` for sortable/filterable native tables, line/bar SVG charts with an equivalent data table, modal dialogs, contextual popovers, accordions, tabs, cards, pills/tags, responsive layouts, and ambient branding. `src/components.css` is included in the CSS bundle and can also be imported as a module. These are CSS/HTML recipes, not Web Components or a JavaScript framework. Demo data/interaction logic is separate in `playground/components.js`.

Use `.ff-table-region` around `.ff-table` for bounded horizontal scrolling on mobile; give the region a label and `tabindex="0"` for keyboard scrolling. Sorting is application behavior: put buttons inside native column headers and set `aria-sort` on the active header. Use `.ff-chart` and its grid/line/area/bar/point classes on your own SVG, including an accessible title, description and exact data table. Charts do not encode data using color alone.

Style a real `<dialog>` with `.ff-dialog`, open it with `showModal()`, and close using a `method="dialog"` form or `close()`. Native focus containment, Escape dismissal, and focus restoration remain intact. Use `.ff-popover` with `popover="auto"` and a `popovertarget` button for non-modal popups; regular actions remain normal buttons, not an ARIA menu. Optional demo positioning clamps the popup to the viewport without requiring CSS anchor positioning. Unsupported popovers remain readable inline; the demo also shows a plain inline form if modal dialogs are unavailable, rather than imitating modal semantics.

The component playground lets you change wave edges, corners, and motion across the collection. Overlays can opt into `.ff-wave-surface` decoration without masking content. Accordions use native details/summary. `initTabs` from `@cmwen/min-design-system/tabs` is an optional enhancement with keyboard support and cleanup. Layout uses `.ff-stack`, `.ff-cluster`, `.ff-grid`, `.ff-sidebar-layout`, and `.ff-container`. Short entrance motion respects system/local reduced motion; the only ambient loop is explicitly enabled on `.ff-brand-mark`, with visible pause/resume and hidden-tab pausing in the demo. The temporary [cmwen.dev icon](https://cmwen.dev/favicon.svg) is a demo-only asset, excluded from the package; see [asset provenance](docs/ASSETS.md).

The [Storybook HTML/Vite](https://storybook.js.org/docs/builders/vite) workshop has 21 isolated foundation and component stories, live Actions, replayable interaction tests, controls, documentation, and accessibility tooling. See the [workshop guide](docs/STORYBOOK.md) for token inspection, event payloads, test replay and CI. Theme, wave, and motion toolbar settings apply to every story. Storybook development dependencies stay outside the installable CSS package.

## Application integration recipes

[Integration examples](examples/integration.html) cover inherited compact density, small/large controls, semantic badges and alerts, icon/destructive actions, selectable cards and rows, field feedback, busy/empty states, and responsive sidebar/bottom navigation. See the [integration API and native markup](docs/INSTALL.md#integrating-dense-application-screens) and Storybook’s **Components / App integration**. These additions preserve the CSS-only package and application-owned behavior.
