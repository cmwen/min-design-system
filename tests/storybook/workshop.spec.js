import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const stories = [
  'card',
  'accordion',
  'tabs',
  'pills-and-tags',
  'layout',
  'table',
  'chart',
  'modal',
  'popup',
  'ambient-brand',
  'native-controls',
];
const foundations = ['colors', 'typography', 'spacing', 'geometry', 'motion'];
const ids = [
  ...stories.map((story) => `components-recipes--${story}`),
  ...foundations.map((story) => `foundations-design-tokens--${story}`),
  ...['buttons', 'layout-primitives', 'native-inputs', 'surfaces'].map(
    (story) => `foundations-primitives--${story}`,
  ),
];
async function completed(page) {
  const canvas = page.locator('#storybook-root');
  await expect(canvas).toHaveAttribute('data-ff-test-state', /passed|failed/);
  expect(await canvas.getAttribute('data-ff-test-error')).toBeNull();
  await expect(canvas).toHaveAttribute('data-ff-test-state', 'passed');
}
for (const story of ids) {
  test(`isolated ${story} story renders in both themes`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 320, height: 800 });
    for (const theme of ['light', 'dark']) {
      await page.goto(
        `iframe.html?id=${story}&viewMode=story&globals=theme:${theme};wave:soft;motion:none;a11y.manual:!true`,
      );
      await completed(page);
      await expect(page.locator('.workshop')).toBeVisible();
      await expect(page.locator('.workshop')).toHaveAttribute('data-ff-theme', theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}
test('Storybook tabs and native overlays are interactive', async ({ page }) => {
  await page.goto('iframe.html?id=components-recipes--tabs&viewMode=story');
  await completed(page);
  const tab = page.getByRole('tab', { name: 'Overview' });
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Notes' })).toHaveAttribute('aria-selected', 'true');
  await page.goto('iframe.html?id=components-recipes--modal&viewMode=story');
  await completed(page);
  await page.getByRole('button', { name: 'New project' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Project name (required)')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.goto('iframe.html?id=components-recipes--popup&viewMode=story');
  await completed(page);
  await page.getByRole('button', { name: 'Project actions' }).click();
  await expect(page.locator('#story-popup')).toBeVisible();
  await page.getByRole('button', { name: 'Duplicate project' }).click();
  await expect(page.getByRole('status')).toContainText('Duplicated');
  await page.getByRole('button', { name: 'Project actions' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#story-popup')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Project actions' })).toBeFocused();
});

test('workshop controls, global toolbar, and generated guide work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('?path=/story/components-recipes--card');
  const preview = page.frameLocator('#storybook-preview-iframe');
  await expect(preview.getByRole('heading', { name: 'Organic Studio' })).toBeVisible();
  await page.locator('#control-label').fill('A new workspace');
  await expect(preview.getByRole('heading', { name: 'A new workspace' })).toBeVisible();
  await page.locator('#control-shape').selectOption('expressive');
  await expect(preview.locator('.ff-card')).toHaveAttribute('data-ff-shape', 'expressive');
  await page.getByRole('button', { name: 'Forest theme light' }).click();
  await page.getByText('dark', { exact: true }).click();
  await expect(preview.locator('.workshop')).toHaveAttribute('data-ff-theme', 'dark');
  await page.getByRole('button', { name: 'Surface edges off' }).click();
  await page
    .getByRole('listbox', { name: 'Surface edges' })
    .getByText('soft', { exact: true })
    .click();
  await expect(preview.locator('.workshop')).toHaveAttribute('data-ff-wave', 'soft');
  await page.goto('?path=/docs/components-recipes--guide');
  await expect(preview.locator('.sbdocs-wrapper')).toBeVisible();
  await expect(preview.getByRole('heading', { name: 'Recipes', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('live clicks appear in Actions and interaction tests can be replayed', async ({ page }) => {
  await page.goto('?path=/story/components-recipes--card');
  const preview = page.frameLocator('#storybook-preview-iframe');
  await expect(preview.locator('#storybook-root')).toHaveAttribute('data-ff-test-state', 'passed');
  await page.getByRole('tab', { name: /^Actions/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await preview.getByRole('button', { name: 'Explore project' }).click();
  await expect(preview.getByRole('button', { name: 'Ready to explore' })).toBeVisible();
  const actions = page.getByRole('tabpanel', { name: /^Actions/ });
  await expect(actions.getByText('onExplore', { exact: true })).toBeVisible();
  await actions.getByText('0: Object', { exact: true }).click();
  await expect(actions.getByText('Organic Studio', { exact: false })).toBeVisible();
  await page.getByRole('tab', { name: /^Interactions/ }).click();
  await expect(
    page.getByRole('button', { name: /Go to interaction row: Explore.*Status: passed/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Rerun', exact: true }).click();
  await expect(preview.getByRole('button', { name: 'Explore project' })).toBeVisible();
  await expect(preview.locator('#storybook-root')).toHaveAttribute('data-ff-test-state', 'passed');
  await expect(
    page.getByRole('button', { name: /Go to interaction row: Explore.*Status: passed/ }),
  ).toBeVisible();
});
