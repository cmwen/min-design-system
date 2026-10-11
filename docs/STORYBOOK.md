# Storybook workshop

Run `npm run storybook` and open `http://localhost:6006`. The same workshop is built into `dist/storybook` for the existing GitHub Pages deployment.

## Foundations

**Foundations → Design tokens** contains semantic colors, typography, spacing, geometry/surfaces, and motion. Names come directly from the CSS source. Values are resolved from the mounted theme scope, including toolbar overrides, rather than copied into a second palette. Colors include focus, disabled, selected and feedback states. Typography shows the font metrics; spacing bars use actual token lengths.

**Foundations → Primitives** contains buttons, native inputs, layout and surface shapes. The component recipes compose these same CSS classes. Change theme, wave and motion in the toolbar, or resize the canvas to inspect wrapping and mobile behavior. System reduced motion takes precedence over the motion selection.

## Live Actions

Open the **Actions** panel, click **Clear**, then interact with the canvas. Events come from actual UI handlers: selecting tabs, sorting a table, changing input values, toggling filters/disclosures, creating or cancelling a project, using a popup, and pausing the brand animation. Expand an event to inspect its payload. Rendering a static token or layout does not generate a pretend event.

Callbacks use `fn()` from `storybook/test` as story args. Those same spies feed the Actions panel and the interaction assertions. They belong to the workshop; the CSS package remains independent of Storybook.

## Interaction tests in the UI

Every story has a `play` function with named `step` groups. Open **Interactions** to see assertions and results, use **Rerun** to repeat the test, or step through the interaction rows. The initial automated run also appears in Actions. Tests restore toggles, tabs, sorting and overlays to their starting state so you can try them afterwards.

The tests check user-visible outcomes and emitted payloads: selected/visible tab panels, sorted rows and `aria-sort`, native form validation and submitted values, dialog focus restoration, popup state, disclosure contents, input values, disabled buttons and pause state. Foundation tests check resolved token values and layout/shape styles.

## Browser automation and CI

```sh
npm run lint
npm test
npm run build
npm run build-storybook
npm run test:storybook
```

The site build clears `dist`, so build Storybook afterwards. `test:storybook` uses Playwright against the built workshop, runs all story interaction functions in both themes, fails on a failed or unfinished play function, checks mobile overflow and WCAG accessibility, verifies manager controls and documentation, and checks that a manual canvas click appears in Actions and that Interactions replay works. Trusted browser keyboard input separately verifies tabs and native Escape dismissal; synthetic keyboard events cannot faithfully exercise every browser default action.

The existing GitHub Actions workflow runs this command before Pages deployment. External axe scans use a boolean `a11y.manual` override to avoid colliding with Storybook's scan. The normal workshop keeps its Accessibility panel enabled.

This repository uses Storybook 10.6's HTML/Vite renderer. Its interaction functions and Interactions panel work with this renderer; the Vitest addon requires portable-story support that this HTML renderer does not export. Playwright therefore runs the real Storybook stories in the browser without adding a framework dependency. See the [Storybook testing migration guidance](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/migration-guide).

## Add another story

Keep markup and demo application behavior in `stories/`. Declare event args with `fn().mockName('onEvent')`, call them inside the live event handlers, and assert both the DOM outcome and callback payload in an awaited play step. Wrap the play function with `tested` from `recipe-interactions.js` so browser CI can await its outcome. Add the story ID to `tests/storybook/workshop.spec.js` so it also receives the theme, mobile and accessibility checks. Static stories should assert their relevant CSS or semantics rather than invent callbacks.
