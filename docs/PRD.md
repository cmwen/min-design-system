# Forest & Fern — Product Requirements Document

**Status:** Implementation-ready MVP brief  
**Version:** 1.0 · 11 October 2026  
**Intended implementer:** Codex coding agent  
**Repository:** `forest-and-fern` (one GitHub repository)  
**Hosting:** GitHub Pages, with GitHub Actions deployment  
**Design reference:** [`reference.html`](./reference.html)

## 1. Product summary

Build and open-source **Forest & Fern**, a CSS-first, framework-agnostic **look-and-feel / theme system** for modern web applications. It should evoke softly organic, slightly imperfect geometry rather than conventional perfect rectangles. Forest green is the identity color; light and dark modes must both look intentional. Small, polished state transitions make surfaces feel alive without sacrificing interaction performance, accessibility, or legibility.

**The CSS theme is the product.** This is **not** a new component framework. Do not rebuild buttons, inputs, dialogs, selects, or application logic. Native HTML elements remain native HTML. Introduce Web Components _only in a later phase_, and only for novel functionality or components that genuinely require extra behavior/structure. Any eventual custom elements must be usable without React and have straightforward adapters for React/Vue/etc.

## 2. Goals, non-goals and audiences

### Goals (MVP)

1. Publish reusable, versionable CSS usable in vanilla HTML, Astro, React, Vue, and other web apps.
2. Supply consistent design tokens for colors, typography, spacing, geometry, states, and motion.
3. Implement dark-green **Forest & Fern** light and dark palettes, including semantic foreground, background, disabled, success, warning and error values with sufficient contrast.
4. Provide asymmetric corner geometry and **subtle, optionally wavy edges** for larger surfaces; preserve clean content and clipping safety.
5. Style standard HTML elements and simple opt-in classes (`.ff-button`, `.ff-card`, `.ff-input`, `.ff-radio`, `.ff-checkbox`, `.ff-switch`, `.ff-range`, etc.). Retain native semantics.
6. Build a visual **Playground** showing form states, dashboard surfaces, palettes, hover/focus/press/reduced-motion, and wave intensity.
7. Deploy Playground, docs and examples together to one GitHub Pages site; make built CSS files consumable by other apps.
8. Add reproducible visual regression and accessibility/performance smoke tests.

### Non-goals (MVP)

- Reimplementing shadcn/ui, Radix, Base UI or React components.
- A Web Components package, modal framework, state management or application backend.
- A Tailwind dependency, design-tool plugin, user accounts or cloud persistence.
- Always-on wave animation across every surface.
- Multi-repository architecture; a large monorepo build orchestrator; Storybook as a launch prerequisite.

### Users

- Developers of independent static or SPA web apps who want one consistent aesthetic.
- Developers who use plain HTML/CSS or multiple frameworks.
- Design-system contributors adjusting tokens and testing interaction/contrast.

## 3. Design language

### 3.1 Brand and colors

Use CSS custom properties (not hard-coded colors in controls). Seed tokens from the approved prototype:

| Semantic role         | Light     | Dark      |
| --------------------- | --------- | --------- |
| Page background       | `#F3F4EC` | `#101E19` |
| Main surface          | `#FDFDF8` | `#1B2D25` |
| Raised/subtle surface | `#E9EEE3` | `#253E31` |
| Primary green         | `#174E39` | `#79B88C` |
| Primary hover         | `#0F3C2B` | `#98CAA4` |
| Text                  | `#1B3026` | `#E7F2E5` |
| Muted text            | `#607568` | `#AAC2AD` |
| Border                | `#A0B3A3` | `#476956` |
| Soft green accent     | `#D9E9D9` | `#30543C` |
| Focus ring            | `#8ABF95` | `#B4E1B7` |

Use `--ff-*` prefix in public API, e.g. `--ff-color-bg`, `--ff-color-surface`, `--ff-color-primary`, `--ff-color-text`, `--ff-color-border`, `--ff-focus-ring`. Add semantic tokens for error, warning, success, selected, disabled; **check contrast and refine** wherever necessary. Respect `color-scheme` for platform widgets.

### 3.2 Typography

- Font: **Nunito**, open source under SIL OFL 1.1. Provide easy self-host instructions and an optional Google Fonts URL for the Playground; do not make the distributed CSS depend on third-party network access. Fall back to `system-ui, sans-serif`.
- Body weight 400–500; UI labels 600–700; headings/KPI 700–900 where visually appropriate.
- Define size, line-height and letter-spacing tokens. Respect user text resizing.

### 3.3 Organic geometry

- Cards and surfaces have **different horizontal and vertical radii at each corner** using elliptical CSS `border-radius` values.
- Provide reusable `soft`, `organic`, `expressive` presets and a neutral `none` option. Example API: `data-ff-shape="organic"` or `.ff-shape-organic`.
- Define wave intensity tokens: default soft ~2–4 px; 0 disables wave; a larger expressive preset allowed only for deliberate showcase surfaces.
- Distinguish _shape geometry_ from _wavy edge rendering_: elliptical radii alone do **not** generate waves along straight edges.
- The reference HTML uses an SVG turbulence/displacement filter on a **decorative pseudo-element**, never on real content. Treat it as **prototype-only exploration**, not a requirement to animate turbulence continuously.
- Prefer a performant path for production (precomputed SVG shape assets or shape/clip paths, with fallback to pure CSS asymmetric radius). Where using filters, scope effects to few visible surfaces, validate Safari/Firefox/Chromium, protect against clipping, and provide simple fallbacks.
- Avoid relying on positional selectors (`nth-child`) to imply public shape presets. Explicit classes/data attributes should be deterministic.

### 3.4 Motion and states

- Define `rest`, `hover`, `focus-visible`, `active/pressed`, `checked/selected`, `disabled`, and `invalid` states.
- Motion presets: `subtle` (~120–180 ms), `organic` (~220–320 ms), `expressive` (~350–550 ms) with defined easings. Values are initial design suggestions, tune in Playground.
- Prefer `transform` and `opacity` for animation; color/border transitions only as needed. Do not animate `filter`/`feTurbulence` in an unbounded loop.
- On hover: slight lift (e.g. `translateY(-2px)`), color/outline transition and optional short decorative ripple/wobble; avoid unintended layout shift.
- Focus must be clearly visible on keyboard navigation, independent of hover state.
- Respect `prefers-reduced-motion: reduce` by removing decorative movement and shortening/removing transitions.
- Wave edge motion must have an explicit **low-cost fallback**, and a flag to turn it off. Prioritize predictable rendering over maximal effect.

## 4. Native control styling inventory

Demonstrate and document:

| Element / role                              | Required states and behaviors                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `button`, `.ff-button`                      | default, hover, focus-visible, active, disabled; primary/secondary/quiet                  |
| `input[type=text/email/search]`, `textarea` | empty, focus, placeholder, invalid, disabled                                              |
| `input[type=radio]`                         | checked, unchecked, keyboard focus, disabled; group semantics                             |
| `input[type=checkbox]`                      | checked, unchecked, indeterminate demo, focus, disabled                                   |
| checkbox styled as switch                   | checked, focus, disabled, native checkbox semantics (or `role=switch` where warranted)    |
| `input[type=range]`                         | thumb and track; keyboard adjustment, current value, disabled; WebKit and Firefox styling |
| `select`                                    | focus/disabled with native dropdown retained; progressive enhancement only                |
| cards/panels/links                          | resting, hover and focus where interactive; avoid clickable non-semantic cards            |

Use meaningful `<label>`, `<fieldset>`/`<legend>`, native attributes, `:focus-visible`, `:disabled`, `:checked`, `:invalid`. Do not force `appearance:none` where replacing behavior would harm accessibility. Do not suppress system selection, native keyboard behavior, or mobile usability.

## 5. Playground and docs

Build a static, responsive site with sections or routes:

1. **Overview** — brand, theme and principles, quick install example.
2. **Theme Lab** — Light/Dark toggle and side-by-side comparison; editable preview for core palette tokens.
3. **Shape Lab** — radius preset, wave on/off, wave strength, border thickness, sample size; reveal CSS used for current choices.
4. **Motion Lab** — hover/press/focus/selected samples, motion intensity, reduced-motion demo, explicit static fallback.
5. **Native Controls** — showcase all elements and states in Section 4.
6. **Dashboard Example** — visual reference based on the approved analytics/CRM wireframe: sidebar, search header, KPI row, chart, customer list, detail panel. Mock data only; layout works at mobile widths.
7. **Docs** — installation, CSS imports, variables, theme attribute, class/API reference, limitations, browser notes, licensing and contribution instructions.

Controls in the Playground must actually modify rendered styles, not merely display numbers. Prefer lightweight vanilla TypeScript or JavaScript. Persist developer preferences locally where appropriate; defaults must work without storage. Keep UI responsive at 320 px without page-level horizontal scrolling.

## 6. Architecture and packaging

**Initial setup:** one repository; Vite for dev and static build; plain CSS and minimal vanilla JS/TS; no Tailwind or React build requirement.

Suggested layout (Codex may adjust for clarity):

```text
forest-and-fern/
├── src/
│   ├── tokens.css
│   ├── themes.css
│   ├── typography.css
│   ├── shapes.css
│   ├── motion.css
│   ├── native-controls.css
│   └── index.css
├── playground/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── examples/
│   ├── dashboard.html
│   └── forms.html
├── docs/
├── tests/
├── reference/
│   └── prototype.html
├── .github/workflows/deploy.yml
├── package.json
├── vite.config.ts
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

**Public CSS API:**

```html
<link rel="stylesheet" href="/assets/forest-and-fern.css" />
<section data-ff-theme="dark">
  <article class="ff-card" data-ff-shape="organic">
    <h2>Analytics</h2>
    <label for="search">Search</label>
    <input id="search" class="ff-input" type="search" />
    <button class="ff-button">Explore</button>
  </article>
</section>
```

- Document root-level theme choice and nested theme boundaries. Theme styling should be scoped to `[data-ff-theme]` while retaining a sensible default.
- Decide and document whether tokens are globally available, and how to avoid styling unrelated host apps. **Opt-in class styling by default**; if offering automatic element styling, make it explicitly opt-in via a scope container (e.g. `.ff-native`).
- Deliver one downloadable CSS bundle plus modular CSS source; include source maps in development and a stable distribution filename.
- Configure GitHub Pages for repo subpath (e.g. `/forest-and-fern/`), and ensure CSS asset URLs are correct. Prefer an explicit `base` setting in Vite.
- Include a versioned usage recommendation (`npm` or release-tagged artifact/CDN), since pointing all apps at mutable `main`/Pages CSS can cause unplanned regressions.
- Publish MIT-licensed project code unless maintainers choose otherwise. Nunito font retains its separate OFL license; do not bundle font binaries without proper license inclusion.

## 7. Accessibility, compatibility and performance acceptance

### Accessibility

- Target WCAG 2.2 AA for foreground/background contrast and keyboard interaction; do not treat decorative non-text outlines as the sole indication of state.
- Focus visible on all controls, readable labels, 44x44 px touch targets where practical, no content obstruction at 200% zoom.
- Verify reduced-motion setting, forced-colors / high-contrast fallback where feasible, and `color-scheme` handling.
- Verify radio/checkbox/range/select with keyboard only and screen-reader-accessible native semantics.

### Browser support

- Test current stable Chromium, Firefox, Safari, and mobile Chrome/Safari. Features without reliable support must degrade to elliptical `border-radius` and readable controls.
- Avoid making cutting-edge `clip-path: shape()` or customizable select features mandatory; treat them as optional progressive enhancements.

### Performance

- No continuous per-card SVG turbulence animation. No filter applied to text, charts or the whole dashboard.
- On a dashboard with ~50 surfaces, compare wave enabled/disabled in browser performance tools; document cost and choose a safe default.
- Animation should not trigger broad layout thrashing. Treat Core Web Vitals and input responsiveness as guardrails, not arbitrary promises.
- Provide a `no-wave` or data-attribute override for low-power devices or developer preference.

## 8. Acceptance criteria / definition of done

- [ ] `npm install` and `npm run dev` open the fully functional Playground.
- [ ] `npm run build` creates a deployable static site and consumable CSS artifact.
- [ ] Light/Dark display intentionally distinct Forest palettes, maintain legible text, and toggle instantly without reload.
- [ ] Shape preset changes really change the corner geometry; wave strength 0 removes waves; other values visibly alter the decorative border without distorting text.
- [ ] Hover/press/focus/checked/disabled demonstrations work with keyboard and touch where relevant.
- [ ] Native radio, checkbox, range, select and text fields preserve expected form behavior.
- [ ] Reduced-motion setting prevents nonessential movement; static fallback remains polished.
- [ ] At 320, 768 and 1440 CSS px, examples remain usable; no inadvertent viewport overflow.
- [ ] Automated contrast checks for core semantic color pairs; document any intentional exceptions.
- [ ] Minimal Playwright smoke tests for theme toggle, controls, shape settings and navigation, plus baseline screenshots for light/dark.
- [ ] Site deploys from default branch through GitHub Actions to GitHub Pages without secrets beyond repository-provided permissions.
- [ ] README explains installing the CSS in vanilla HTML and React **without** requiring Tailwind or a component framework.
- [ ] Licensing, browser fallback and filter performance limitations documented.

## 9. Suggested delivery order

**Phase 1 — Foundation:** repo/Vite, CSS API, tokens, light/dark, typography, basic cards and buttons, GitHub Pages CI.  
**Phase 2 — Shape/Motion:** explicit organic presets, optional wave engine with fallback, state/motion tokens, reduced motion.  
**Phase 3 — Native controls:** radio/checkbox/switch/range/text/select, semantics and focus behavior.  
**Phase 4 — Playground/Examples:** interactive Labs, dashboard reference, docs and consumable CSS build.  
**Phase 5 — Quality/Release:** browser matrix, visual/a11y/performance testing, versioned release and contributor docs.

## 10. Instructions to Codex

1. Read this PRD and open `reference.html` first. The reference establishes **visual intent**, not production architecture or a bug-free implementation.
2. Keep the design CSS-first and framework-agnostic; reject premature Web Component or React abstractions.
3. Preserve the approved palette, Nunito typography and softly asymmetric/wavy surfaces; improve fidelity to the reference only when consistent with usability/performance.
4. Refactor any prototype inline CSS and DOM scripts into maintainable modules with explicit public naming and token contracts.
5. Implement and validate each phase; run lint, build and smoke tests. Never claim unrun tests passed.
6. If SVG filter is expensive or visually inconsistent across browsers, provide an explicit fallback and record the trade-off in docs.
7. Prefer making reasonable implementation choices over pausing for style/tooling questions. Record decisions in README or a short ADR.

## 11. Future ideas (not MVP)

- Publish CSS as an npm package with semver and changelog automation.
- Optional Storybook component-state gallery if the native-control inventory expands.
- Optional Astro/Starlight docs if handwritten docs grow unwieldy.
- Optional Web Components **only** for new genuinely behavioral UI patterns, with framework adapters as needed.
- Design-token JSON export and automated theme generation.
