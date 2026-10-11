# Install Forest & Fern in another app

The package ships plain CSS and one optional vanilla JavaScript tab helper. It has **no runtime dependencies**. Storybook and its internal UI dependencies are development tooling and are excluded from the package.

## 1. Create a versioned local package

From this repository, with Node 22.12+:

```sh
npm ci
npm run check
npm pack
```

`npm pack` runs the production build through `prepack` and writes `cmwen-min-design-system-0.3.0.tgz`. It includes modular CSS, the standalone bundle, the optional tab and seeded-theme helpers, the MIT license, and these instructions. It excludes the playground, Storybook, demo brand icon, fonts, and development dependencies. Nothing is published to npm.

Copy that file to your other app and install it:

```sh
npm install ./vendor/cmwen-min-design-system-0.3.0.tgz
```

Commit the tarball (if using a local vendor path) and your lockfile so CI can reproduce the installation. Increment the version before distributing a changed package; replace the tarball and reinstall deliberately rather than reusing a mutable URL.

## 2. Import the CSS

In Vite, Astro, Vue, Svelte, React, or another bundler:

```js
import '@cmwen/min-design-system';
// Or the complete, readable distribution artifact:
// import '@cmwen/min-design-system/forest-and-fern.css';
```

Individual modules are exported, for example `@cmwen/min-design-system/components.css`. When selecting modules, load `tokens.css` and `themes.css` first; cards need `shapes.css`, and optional wave edges need `waves.css`. The complete import is the easiest starting point.

Without a bundler, copy `dist/assets/forest-and-fern.css` to your app's assets and load it with a stylesheet link. The CSS makes no external requests. Nunito is optional; the system-font fallback works immediately. Self-host your own licensed font if desired.

## 3. Add a theme boundary and native HTML

```html
<section class="ff-theme" data-ff-theme="light" data-ff-motion="organic">
  <div class="ff-grid">
    <article class="ff-card" data-ff-wave="soft">
      <h2 class="ff-heading">A growing workspace</h2>
      <span class="ff-tag">Active</span>
      <button class="ff-button" type="button">Explore</button>
    </article>
  </div>
</section>
```

Change `data-ff-theme` to `dark` when your app's theme changes. Theme persistence belongs to your app. Nested boundaries work; element styling is opt-in and no global reset is shipped.

Use `--ff-gap`, `--ff-grid-min`, and `--ff-container-max` to tune layout. Waves stay off by default. Put wave attributes on the card or ancestor (soft uses strength 1; expressive uses strength 3); use `.ff-no-wave` for local exceptions. Add `.ff-wave-surface` alongside `.ff-dialog` or `.ff-popover` to give an overlay a decorative edge. The native control/content itself is never masked.

## 4. Add only the behavior you need

Accordions are native `<details class="ff-accordion">` with `<summary>` and an optional `.ff-accordion-content` wrapper. Native dialogs use `showModal()` and `close()`; native popovers use `popover="auto"` and `popovertarget`. Tables, charts, and toggle pills keep your app's own data and event handlers.

Tabs can use the optional helper:

```html
<div data-ff-tabs="Project details">
  <div class="ff-tab-list">
    <a class="ff-tab" id="tab-one" href="#panel-one" aria-controls="panel-one">Overview</a>
    <a class="ff-tab" id="tab-two" href="#panel-two" aria-controls="panel-two">Notes</a>
  </div>
  <section class="ff-tab-panel" id="panel-one">Project overview</section>
  <section class="ff-tab-panel" id="panel-two">Project notes</section>
</div>
```

```js
import { initTabs } from '@cmwen/min-design-system/tabs';
const dispose = initTabs(document.querySelector('#your-app'));
// Call dispose() when the view is removed, before remounting it.
```

Use unique IDs, and keep each panel inside its group. The helper adds tab roles, selection, focus order, Left/Right/Home/End keyboard navigation, and Enter/Space activation. Selection follows arrow-key focus. Before enhancement, ordinary anchors link to visible panels. You can implement the same semantics in your framework instead; do not run two controllers on the same group.

Motion is optional: `data-ff-motion="none"` disables component entrances and ambient movement. The system reduced-motion preference always wins. Ambient branding requires `.ff-brand-mark[data-ff-ambient="true"]` with your own inline SVG for a slow 12-second 3D turn, plus a visible pause/resume control that sets `data-ff-paused="true"`. Pause on `visibilitychange` while the document is hidden. The demo icon is not included in the installable package.

## 5. Explore and verify

```sh
npm run storybook        # Interactive workshop at http://localhost:6006
npm run build-storybook # Static workshop in dist/storybook
npm run test:storybook  # Runs story interactions and browser/a11y checks
npm run test:package    # Packs and installs into an isolated Vite consumer
```

The HTML/Vite Storybook offers design tokens and primitives, live Actions, replayable interaction tests, controls, documentation, an accessibility panel, and global theme/wave/motion choices. It builds under the same GitHub Pages site at `storybook/`. Run `npm run build` before `npm run build-storybook` because the site build clears `dist`.

See [the Storybook guide](STORYBOOK.md) for event logging, test replay and CI.

Try the components at your actual container widths and with keyboard/reduced motion. Keep chart data tables, table captions/header scopes, input labels, and native dialog/popover semantics when adapting the recipes.

## Publish on GitHub Pages and npm

Follow [RELEASE.md](RELEASE.md) to configure the repository and npm package name, enable GitHub Pages, publish the first version, and configure OIDC trusted publishing for subsequent GitHub Releases. The package is configured as `@cmwen/min-design-system` in the public repository `cmwen/min-design-system`. See [VALIDATION.md](VALIDATION.md) for remote publication and deployment verification.

Install registry releases with `npm install @cmwen/min-design-system` and use the same imports shown above.

## Integrating dense application screens

The [app integration example](../examples/integration.html) and Storybook’s **Components / App integration** show these recipes together. All behavior remains in your app; no JavaScript is required for styling.

Set `data-ff-density="compact"` on a theme boundary or section. It reduces control padding, card padding, and layout gaps. Nest `data-ff-density="comfortable"` to restore the defaults. Buttons, inputs, selects, and textareas accept `data-ff-size="sm|lg"`; omit it for the density default. Compact controls retain a 44px minimum when any coarse pointer is available. Checkbox/radio targets should use a padded label, as in the native control recipes.

Override `--ff-card-padding`, `--ff-layout-gap`, `--ff-control-min-height`, `--ff-button-min-height`, `--ff-control-padding-block`, `--ff-control-padding-inline`, and `--ff-button-padding-inline` for app-specific spacing. Existing `--ff-gap` overrides layout gaps. On a square icon button, only the minimum height controls its dimensions; it stays at least 44px.

```html
<section class="ff-theme ff-stack" data-ff-density="compact">
  <button
    class="ff-button ff-button-icon ff-button-secondary"
    type="button"
    aria-label="Refresh connections"
  >
    <svg aria-hidden="true" viewBox="0 0 24 24"><!-- your icon --></svg>
  </button>
  <button class="ff-button ff-button-danger" type="button">Revoke access</button>
  <span class="ff-tag" data-ff-tone="success">Connected</span>
</section>
```

Use `data-ff-tone="neutral|info|success|warning|danger"` on `.ff-tag`, `.ff-pill`, or `.ff-alert`. Both themes provide `--ff-tone-{tone}-fg`, `--ff-tone-{tone}-bg`, and `--ff-tone-{tone}-border`. Map your app’s statuses onto these tones and always include meaningful text. Destructive buttons use `--ff-color-danger`, `--ff-color-danger-hover`, and `--ff-color-on-danger`, with hover, active, focus, and native disabled states. Give icon buttons an accessible name and hide decorative icons from assistive technology.

Use a real button with `.ff-selectable` and `aria-pressed` for independent card selection. Add `.ff-list-row` for a horizontal wrapping row and `.ff-metadata` for secondary text. The recipe supplies hover, focus, selected, and native disabled states. Keep actions outside the selection button; nested interactive controls are invalid. For single-choice selection, use native radios and their labels instead of adding radio roles to this toggle recipe.

```html
<button class="ff-selectable ff-list-row" type="button" aria-pressed="true">
  <strong>Design workspace</strong>
  <span class="ff-metadata">Selected · Updated today</span>
</button>
<div class="ff-field">
  <label class="ff-field-label" for="connection">Connection name</label>
  <input
    class="ff-input"
    id="connection"
    aria-invalid="true"
    aria-describedby="connection-help connection-error"
  />
  <p class="ff-field-help" id="connection-help">Use a recognizable name.</p>
  <p class="ff-field-error" id="connection-error">Enter a name.</p>
</div>
```

`.ff-field` groups labels, controls, help, and validation text. Your app sets `aria-invalid` and connects visible messages with `aria-describedby`. `.ff-alert` accepts a message and optional dismiss button; your app handles dismissal, the `hidden` attribute, and focus restoration. Use `role="alert"` for an urgent newly inserted error or `role="status"` for a non-urgent update. Static notices need neither live role. `.ff-busy` supplies a static progress marker beside visible loading text; use `role="status"` to announce changes and `aria-busy="true"` on the updating region. For busy buttons, supply progress text, set `aria-busy`, and disable repeat submissions in your app. `.ff-empty-state` groups an explanation and optional next action.

`.ff-sidebar-nav` and `.ff-bottom-nav` style native navigation landmarks containing `.ff-nav-link` anchors. Set `aria-current="page"` on the active link and optionally include a textual `.ff-pill` count. Wrap both navigations in `.ff-responsive-nav` to show the sidebar above 640px and bottom navigation at 640px or below. Use matching destinations and labels; only the visible landmark is exposed to assistive technology. Bottom navigation stays in document flow, wraps long content, and includes safe-area bottom padding. If your app fixes it to the viewport, reserve matching content space and check focused controls remain visible. Safe-area values require a host viewport declaration with `viewport-fit=cover`.

## Seeded geometry

Explore seed, variation, wave strength, and separate edge counts in the playground Shape Lab.
Export CSS, load it after the library, and add `ff-seeded-theme` to your `.ff-theme` boundary.
The exported theme works without runtime JavaScript. Descendant shape/wave presets override inherited tokens.

For runtime or build-time generation:

```js
import { createTheme } from '@cmwen/min-design-system/theme';

const theme = createTheme({
  seed: 'my-company',
  shape: 'organic',
  variation: 0.6,
  waveStrength: 3,
  waveCounts: { top: 4, right: 2, bottom: 4, left: 2 },
});
theme.apply(document.querySelector('.ff-theme'));
// Or save theme.toCSS() as a stylesheet and use .ff-seeded-theme.
```

Seeds are nonempty strings of up to 200 characters. Shapes are `none`, `soft`, `organic`
or `expressive`. Variation is 0–1; wave strength and each edge count are integers 0–12.
Wave strength defaults to 0 (off), and counts default to 4 per edge. One wave is a crest
and a trough; count 0 makes an edge straight. Changing one count keeps other edges stable.
The same seed/settings and generator version produce the same geometry. The generator
version is `theme.version` (currently 1); save it with the seed, or export CSS to freeze the look.
