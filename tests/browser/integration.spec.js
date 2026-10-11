import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('integration recipes select, dismiss, and preserve accessible feedback', async ({ page }) => {
  await page.goto('examples/integration.html');
  const context = page.getByRole('button', { name: 'Engineering workspace' });
  await context.focus();
  await page.keyboard.press('Space');
  await expect(context).toHaveAttribute('aria-pressed', 'true');
  await expect(context).toContainText('Selected');
  await expect(page.getByRole('button', { name: 'Archived workspace' })).toBeDisabled();
  await page.getByRole('button', { name: 'Dismiss expiry notice' }).click();
  await expect(page.locator('.ff-alert')).toBeHidden();
  await expect(page.getByLabel('Connection name (required)')).toBeFocused();
  await expect(page.getByLabel('Connection name (required)')).toHaveAttribute(
    'aria-describedby',
    'integration-help integration-error',
  );
});

test('integration recipes reflow with one navigation and accessible theme tones', async ({
  page,
}) => {
  await page.goto('examples/integration.html');
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.ffTheme = value;
    }, theme);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.getByRole('navigation', { name: 'Workspace' })).toHaveCount(1);
      await expect(page.locator(width <= 640 ? '.ff-bottom-nav' : '.ff-sidebar-nav')).toBeVisible();
    }
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

test('density resets locally and icon and touch sizes remain usable', async ({ page }) => {
  await page.goto('examples/integration.html');
  const measurements = await page.evaluate(() => {
    const host = document.createElement('section');
    host.className = 'ff-native';
    host.dataset.ffDensity = 'compact';
    host.innerHTML =
      '<button>Compact</button><div data-ff-density="comfortable"><button>Comfortable</button></div><button class="ff-button-danger" disabled>Disabled</button><button class="ff-button-icon" aria-label="Refresh">↻</button>';
    document.querySelector('main').append(host);
    const buttons = [...host.querySelectorAll('button')];
    const values = buttons.map((button) => ({
      height: button.getBoundingClientRect().height,
      width: button.getBoundingClientRect().width,
      background: getComputedStyle(button).backgroundColor,
    }));
    const disabled = getComputedStyle(document.documentElement)
      .getPropertyValue('--ff-color-disabled')
      .trim();
    host.remove();
    return { values, disabled, coarse: matchMedia('(any-pointer: coarse)').matches };
  });
  expect(measurements.values[1].height).toBeGreaterThan(measurements.values[0].height);
  expect(measurements.values[3].height).toBe(measurements.values[3].width);
  expect(measurements.values[3].height).toBeGreaterThanOrEqual(44);
  if (measurements.coarse) expect(measurements.values[0].height).toBeGreaterThanOrEqual(44);
  await expect(page.getByRole('button', { name: 'Delete unavailable' })).toHaveCSS(
    'background-color',
    'rgb(226, 231, 222)',
  );
});

test('selectable recipes retain their surface and states inside native opt-in hosts', async ({
  page,
}) => {
  await page.goto('examples/integration.html');
  await page
    .locator('#integration-recipes')
    .evaluate((element) => element.classList.add('ff-native'));
  const button = page.getByRole('button', { name: 'Engineering workspace' });
  await expect(button).toHaveCSS('background-color', 'rgb(253, 253, 248)');
  await button.click();
  await expect(button).toHaveCSS('background-color', 'rgb(217, 233, 217)');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
});
