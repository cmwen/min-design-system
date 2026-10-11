# Implementation decisions

## CSS is the reusable package

The library consists of nine CSS modules (including the entry point), with one stable concatenated distribution file. Tokens are globally available with light defaults, and styling uses explicit classes. `.ff-native` offers deliberate subtree element styling; the global site reset is separate. No runtime JS, framework, Web Component, or custom form-control implementation is required.

The site uses handwritten HTML and small vanilla JavaScript modules. Native controls own keyboard, focus, validation, selection, and form behavior. Only the switch’s visual track and slider’s native thumb/track use appearance overrides; high contrast restores the switch’s original checkbox appearance.

## Static waves are optional decoration

The reference’s SVG turbulence filter conveys visual intent but is not shipped. Reproducible, precomputed SVG masks decorate two card pseudo-elements. Text/chart/content and keyboard outlines remain outside the mask. Four explicit CSS radius presets provide the geometry, with normal corners as the mask fallback.

Waves are off by default in the library and dashboard, with strength 3 enabled only in the shape showcase. Strength 0 and local off overrides remove masking entirely. Integer strengths 1–12 choose stable authored silhouettes; values scale with panel dimensions. This avoids cross-browser filter behavior and ongoing per-frame work, at the cost of relative amplitude and suppressed shadows on masked layers. Narrow surfaces should use the pure CSS fallback.

## Accessibility refines the seed palette

The seed’s light muted text and focus ring are insufficient for all raised-surface combinations. Keep the approved background/surface/identity palette, refine light muted to `#53695b` and focus to `#3e7850`, and introduce dedicated control borders (`#6b8070` light, `#85a78d` dark). Decorative borders retain the approved colors. State colors have dedicated semantic tokens and core-pair tests. Inactive text also passes 4.5:1.

State transitions use button/surface transforms. Palette changes are immediate: a browser test exposed transient contrast loss when a background interpolated while its foreground switched themes. No palette color is animated. Switches animate left position only inside a single 58px control; reducing motion removes the transition. There is no wave animation, layout animation across panels, or persistent frame loop. Hover effects require a hover-capable fine pointer. System reduced motion overrides local expressive settings.

## Typography and packaging

The library declares Nunito without downloading it. The site self-hosts the Latin variable font and includes its OFL license. No third-party font request is required, and screenshots use a fixed font artifact. Other Unicode glyphs fall back to system fonts.

The public package is `@cmwen/min-design-system`, published from `cmwen/min-design-system` with zero runtime dependencies. Consumers can install from npm or vendor the MIT CSS from a fixed commit/tag or release artifact. Mutable Pages CSS is convenient for exploration, not a version pinning strategy. The build emits `assets/forest-and-fern.css` and a modular `css/` directory; dev serves the same bundle.

## One Vite project and Pages workflow

The site uses static multi-page routes so deep links work on GitHub Pages. A configurable explicit base defaults to `/forest-and-fern/`; CI derives the repository name. All pages and CSS artifacts deploy together from the default branch after lint, build, contrast, browser/a11y/visual checks. No additional repository or hosting backend is introduced.

## Verification boundaries

Playwright Chromium/Firefox/WebKit and emulated mobile engines provide reproducible coverage. Real stable Safari and mobile hardware, manual assistive-technology use, and a live deployment require release validation outside this workspace. Performance smoke compares 50 surfaces with masks on/off using browser main-thread metrics; GPU raster/paint and real-device input response require devtools/device measurement. No broad performance guarantee is inferred.

Reference for Pages base handling: [Vite static deployment](https://vite.dev/guide/static-deploy.html). Mask fallback: [MDN mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image).

## Common components remain native recipes

Tables, charts, modals, and contextual popups are the first component collection. Shared styling lives in `src/components.css`; the playground demonstrates application-owned sorting/filtering, SVG line/bar rendering, native dialog forms, and native auto popovers. No new custom elements, framework, charting dependency, or modal framework is introduced. Native dialogs supply modal focus/inert/Escape semantics. Contextual actions remain buttons, not ARIA menus with incomplete keyboard handling. Popovers use viewport-clamped demo positioning and fall back to inline content when unsupported. Opt-in `.ff-wave-surface` masks only an overlay’s decorative pseudo-elements; native top-layer positioning and focus remain intact.

## Component expansion and workshop

Native details/summary provides accordions. A separate optional `src/tabs.js` helper progressively enhances anchors and visible panels with ARIA tab semantics, keyboard navigation, and a cleanup function; frameworks may own the same behavior instead. Cards, tags/pills, and layout primitives remain CSS only. Short opacity/transform entrances add feedback on disclosure, chart updates, and overlays without animating layout or palette. One explicit ambient branding loop is now allowed at the user’s request; the demo provides pause/resume, hidden-document pausing, and system/local reduced-motion overrides. The brand uses a 12-second perspective rotation of its SVG plane, with a small tilt and float; only transforms animate. Wave masks remain static. Named soft/expressive wave presets map to numeric strengths 1/3; the full numeric range remains available.

Storybook 10.6.1 uses the HTML/Vite renderer. Its manager/docs dependencies are development tools, not CSS runtime dependencies. It builds into `dist/storybook` after the site build so a single Pages artifact hosts both. A local npm tarball exposes modular CSS, a standalone CSS path, and the optional tab helper; an isolated Vite consumer verifies package contents and exports. Registry publication was explicitly authorized; `private: false` and public access are now configured. Later GitHub releases use npm trusted publishing through the `npm` environment.
