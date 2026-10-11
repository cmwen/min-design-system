# Changelog

## 0.3.0 — 2026-10-12

- Add the optional `@cmwen/min-design-system/theme` helper for repeatable seeded corners and static SVG wave masks, with no runtime dependencies.
- Add independent top, right, bottom, and left wave counts, including straight edges at count 0.
- Add Seed, Variation, Randomize, per-edge count, and Export CSS controls to the Shape Lab, with browser preference persistence and consumption examples.
- Support static CSS export for use without runtime JavaScript; keep light/dark palettes independent of generated geometry.
- Validate deterministic geometry, edge independence, exported CSS, persisted settings, package imports, accessibility, and responsive layouts.

## 0.2.0 — 2026-10-11

- Add inherited compact/comfortable density, configurable spacing, and small/large controls with 44px minimum touch targets on coarse-pointer devices.
- Add light/dark neutral, info, success, warning, and danger tokens for badges and alerts.
- Add square icon buttons and destructive buttons with interaction and disabled states.
- Add native selectable card/list-row styling with selected, focus, hover, disabled, and metadata states.
- Add form fields, validation feedback, busy indicators, empty states, and dismissible alert recipes.
- Add sidebar and mobile bottom navigation with active states, badges, and safe-area spacing.
- Add integration examples, documentation, a Storybook recipe, and contrast, accessibility, responsive, and interaction checks.

Existing default spacing and visual baselines are preserved. The runtime package remains CSS-only, with application behavior owned by consumers.
