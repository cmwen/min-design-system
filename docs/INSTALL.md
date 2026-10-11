# Install Forest & Fern in another app

The package ships plain CSS and one optional vanilla JavaScript tab helper. It has **no runtime dependencies**. Storybook and its internal UI dependencies are development tooling and are excluded from the package.

## 1. Create a versioned local package

From this repository, with Node 22.12+:

```sh
npm ci
npm run check
npm pack
```

`npm pack` runs the production build through `prepack` and writes `cmwen-min-design-system-0.1.0.tgz`. It includes modular CSS, the standalone bundle, the tab helper, the MIT license, and these instructions. It excludes the playground, Storybook, demo brand icon, fonts, and development dependencies. Nothing is published to npm.

Copy that file to your other app and install it:

```sh
npm install ./vendor/cmwen-min-design-system-0.1.0.tgz
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

Follow [RELEASE.md](RELEASE.md) to configure the repository and npm package name, enable GitHub Pages, publish the first version, and configure OIDC trusted publishing for subsequent GitHub Releases. The package is configured as `@cmwen/min-design-system` in the public repository `cmwen/min-design-system`. Registry publication and remote Pages deployment have not happened in this workspace.

After publication, install your chosen package name from npm and use the same imports shown above. Scoped names work too; replace `@cmwen/min-design-system` with your published name in every import.
