import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const route = 'examples/components.html';
test('native accordions and enhanced tabs support keyboard navigation', async ({ page }) => {
  await page.goto(route);
  const answer = page.getByText(
    'Yes. Add the CSS and use native HTML. Your app keeps its own behavior.',
  );
  await expect(answer).toBeHidden();
  const summary = page.locator('.ff-accordion summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(answer).toBeVisible();
  await page.keyboard.press('Space');
  await expect(answer).toBeHidden();
  const overview = page.getByRole('tab', { name: 'Overview' });
  await overview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Notes' })).toBeFocused();
  await expect(page.locator('#panel-notes')).toBeVisible();
  await expect(page.locator('#panel-overview')).toBeHidden();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('ArrowRight');
  await expect(overview).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');
  await expect(overview).toHaveAttribute('aria-selected', 'true');
});
test('toggle pills update selection without changing descriptive tags', async ({ page }) => {
  await page.goto(route);
  const development = page.getByRole('button', { name: 'Development', exact: true });
  await development.click();
  await expect(development).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#pill-status')).toContainText('Design, Development');
  await development.click();
  await expect(development).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#pill-status')).toHaveText('Selected: Design.');
});
test('wave edges decorate cards and native overlays while motion can be paused', async ({
  page,
}) => {
  await page.goto(route);
  await page.getByLabel('Wave edges').selectOption('expressive');
  await page.getByLabel('Corners').selectOption('expressive');
  const mask = await page
    .locator('#cards-tags .ff-card')
    .first()
    .evaluate((element) => getComputedStyle(element, '::after').maskImage);
  expect(mask).toContain('data:image/svg+xml');
  await page.getByRole('button', { name: 'New project' }).click();
  expect(
    await page
      .locator('#project-dialog')
      .evaluate((element) => getComputedStyle(element, '::after').maskImage),
  ).toContain('data:image/svg+xml');
  await expect(page.getByLabel('Project name (required)')).toBeFocused();
  await page.keyboard.press('Escape');
  await page.getByLabel('Wave edges').selectOption('off');
  expect(
    await page
      .locator('#cards-tags .ff-card')
      .first()
      .evaluate((element) => getComputedStyle(element, '::after').maskImage),
  ).toBe('none');
  const mark = page.locator('#ambient-brand svg');
  await expect(mark).toHaveCSS('animation-name', 'ff-brand-orbit');
  await expect(page.locator('#ambient-brand')).toHaveCSS('perspective', '320px');
  await expect
    .poll(() => mark.evaluate((element) => getComputedStyle(element).transform))
    .toMatch(/^matrix3d\(/);
  await page.getByRole('button', { name: 'Pause logo animation' }).click();
  await expect(mark).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Resume logo animation' }).click();
  await page.locator('#component-motion').selectOption('none');
  await expect(mark).toHaveCSS('animation-name', 'none');
  await page.locator('#component-motion').selectOption('expressive');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(mark).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'New project' }).click();
  await expect(page.locator('#project-dialog')).toHaveCSS('animation-name', 'none');
});
test('expanded wave collection reflows and passes accessibility in both themes', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(route);
    await page.evaluate((value) => (document.documentElement.dataset.ffTheme = value), theme);
    await page.getByLabel('Wave edges').selectOption('soft');
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.locator('.ff-accordion summary').first().click();
    await page.getByRole('tab', { name: 'Notes' }).click();
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});
test('tab recipe stays readable without enhancement and can be disposed', async ({ page }) => {
  await page.goto(route);
  const result = await page.evaluate(async () => {
    const { initTabs } = await import(new URL('../js/tabs.js', location.href).href);
    const root = document.createElement('div');
    root.innerHTML =
      '<div data-ff-tabs="Temporary"><div class="ff-tab-list"><a class="ff-tab" id="temp-a" href="#temp-panel-a" aria-controls="temp-panel-a">One</a><a class="ff-tab" id="temp-b" href="#temp-panel-b" aria-controls="temp-panel-b">Two</a></div><section class="ff-tab-panel" id="temp-panel-a">First</section><section class="ff-tab-panel" id="temp-panel-b">Second</section></div>';
    document.body.append(root);
    const before = [...root.querySelectorAll('.ff-tab-panel')].every((panel) => !panel.hidden);
    const dispose = initTabs(root);
    const enhanced = root.querySelector('#temp-panel-b').hidden;
    dispose();
    const after = [...root.querySelectorAll('.ff-tab-panel')].every((panel) => !panel.hidden);
    const clean = !root.querySelector('[role="tab"]');
    root.remove();
    return { before, enhanced, after, clean };
  });
  expect(result).toEqual({ before: true, enhanced: true, after: true, clean: true });
});
