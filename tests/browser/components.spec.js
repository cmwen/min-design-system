import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const route = 'examples/components.html';

test('component collection navigation, sorting, search, and density work', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: 'Components', exact: true }).click();
  await expect(page).toHaveURL(/examples\/components.html$/);
  await page.getByRole('button', { name: 'Budget', exact: true }).click();
  await expect(page.locator('[data-column="budget"]')).toHaveAttribute('aria-sort', 'ascending');
  await expect(page.locator('#project-rows tr').first()).toContainText('$2,400');
  await page.getByRole('button', { name: 'Budget', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-column="budget"]')).toHaveAttribute('aria-sort', 'descending');
  await expect(page.locator('#project-rows tr').first()).toContainText('$14,200');
  await expect(page.locator('[data-column="name"]')).not.toHaveAttribute('aria-sort');
  await page.getByLabel('Search projects').fill('Ava');
  await expect(page.locator('#project-rows tr')).toHaveCount(2);
  await expect(page.locator('#table-count')).toHaveText('2 projects');
  await page.getByRole('switch', { name: 'Compact rows' }).check();
  await expect(page.locator('#project-table')).toHaveAttribute('data-ff-density', 'compact');
  await page.getByLabel('Search projects').fill('not a project');
  await expect(page.locator('#table-empty')).toBeVisible();
});

test('chart style updates the marks and leaves exact data available', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('.ff-chart-line')).toHaveCount(1);
  await page.getByLabel('Chart style').selectOption('bar');
  await expect(page.locator('.ff-chart-bar')).toHaveCount(6);
  await expect(page.getByRole('img', { name: 'Monthly revenue, bar chart' })).toBeVisible();
  await expect(page.locator('.ff-chart-line')).toHaveCount(0);
  await page.getByText('View revenue data', { exact: true }).click();
  await expect(page.getByRole('table', { name: 'Monthly revenue in US dollars' })).toContainText(
    '$128,400',
  );
});

test('native modal traps focus, cancels with Escape, and restores focus', async ({ page }) => {
  await page.goto(route);
  const trigger = page.getByRole('button', { name: 'New project' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'A new beginning' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('#dialog-project-name')).toBeFocused();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(
      await page
        .locator('#project-dialog')
        .evaluate(
          (node) =>
            node.contains(document.activeElement) || document.activeElement === document.body,
        ),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('modal validates and saves a local result without navigation', async ({ page }) => {
  await page.goto(route);
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.locator('#project-dialog')).toBeVisible();
  expect(
    await page.locator('#dialog-project-name').evaluate((node) => node.validity.valueMissing),
  ).toBe(true);
  await page.getByLabel('Project name (required)').fill('Fern Journal');
  await page.getByLabel('Project type').selectOption('Dashboard');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.locator('#project-dialog')).not.toBeVisible();
  await expect(page.locator('#component-status')).toContainText('Fern Journal');
  await expect(page.locator('#component-status')).toContainText('no data was sent');
  await page.getByRole('button', { name: 'New project' }).click();
  await expect(page.locator('#dialog-project-name')).toHaveValue('');
});

test('popup supports keyboard Escape, outside dismissal, and actions', async ({ page }) => {
  await page.goto(route);
  const trigger = page.getByRole('button', { name: 'Project actions', exact: true });
  const popup = page.locator('#project-actions');
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(popup).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popup).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: 'Duplicate project', exact: true }).click();
  await expect(popup).not.toBeVisible();
  await expect(page.locator('#project-rows tr')).toHaveCount(7);
  await expect(page.locator('#component-status')).toContainText('Duplicated Organic Studio');
  await trigger.click();
  await page.getByRole('heading', { name: '03 · Modals & popups' }).click();
  await expect(popup).not.toBeVisible();
});

test('unsupported overlays stay usable inline without a request', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto(route);
  await expect(page.locator('#project-actions-trigger')).toBeHidden();
  await expect(page.locator('#popup-fallback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Duplicate project', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Duplicate project', exact: true }).click();
  await expect(page.locator('#project-rows tr')).toHaveCount(7);
  await expect(page.locator('#open-project-dialog')).toBeHidden();
  await expect(page.locator('#project-dialog')).toHaveCSS('position', 'static');
  await page.getByLabel('Project name (required)').fill('Inline project');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.locator('#component-status')).toContainText('Inline project');
  await expect(page).toHaveURL(/components.html$/);
});

test('component table and overlays fit mobile widths and resize', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'New project' }).click();
    const dialog = await page.locator('#project-dialog').boundingBox();
    expect(dialog.x).toBeGreaterThanOrEqual(0);
    expect(dialog.x + dialog.width).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Project actions', exact: true }).click();
    await page.waitForFunction(() => {
      const rect = document.querySelector('#project-actions').getBoundingClientRect();
      return rect.x >= 0 && rect.right <= innerWidth && rect.y >= 0 && rect.bottom <= innerHeight;
    });
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 320, height: 500 });
  await page.getByRole('button', { name: 'Project actions', exact: true }).click();
  await expect(page.locator('#project-actions')).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector('#project-actions').getBoundingClientRect().right <= innerWidth,
  );
});

for (const theme of ['light', 'dark']) {
  for (const state of ['page', 'dialog', 'popup']) {
    test(`component accessibility ${theme} ${state}`, async ({ page }) => {
      await page.goto(route);
      if (theme === 'dark')
        await page.getByRole('button', { name: 'Switch to dark theme' }).click();
      if (state === 'dialog') await page.getByRole('button', { name: 'New project' }).click();
      if (state === 'popup')
        await page.getByRole('button', { name: 'Project actions', exact: true }).click();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    });
  }
  test(`component visual ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'One deterministic desktop baseline.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`components-${theme}.png`, { fullPage: true });
    await page.getByRole('button', { name: 'New project' }).click();
    await expect(page).toHaveScreenshot(`modal-${theme}.png`);
  });
}
