import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('theme toggles, persists, and nested boundaries retain their palette', async ({ page }) => {
  await page.goto('');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-ff-theme', 'dark');
  const light = page.locator('.theme-mini[data-ff-theme="light"]');
  const dark = page.locator('.theme-mini[data-ff-theme="dark"]');
  await expect(light).toHaveCSS('color', 'rgb(27, 48, 38)');
  await expect(dark).toHaveCSS('color', 'rgb(231, 242, 229)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-ff-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-ff-theme', 'light');
});

test('shape controls alter geometry, masks, border, and width', async ({ page }) => {
  await page.goto('#shape-lab');
  const preview = page.locator('#shape-preview');
  const initialRadius = await preview.evaluate((node) => getComputedStyle(node).borderRadius);
  await page.getByLabel('Corner geometry').selectOption('expressive');
  expect(await preview.evaluate((node) => getComputedStyle(node).borderRadius)).not.toBe(
    initialRadius,
  );
  await page.locator('#wave-strength').fill('8');
  expect(await preview.evaluate((node) => getComputedStyle(node, '::before').maskImage)).toContain(
    'data:image/svg+xml',
  );
  await page.locator('#wave-strength').fill('0');
  expect(await preview.evaluate((node) => getComputedStyle(node, '::before').maskImage)).toBe(
    'none',
  );
  await page.locator('#border-width').fill('4');
  expect(await preview.evaluate((node) => getComputedStyle(node, '::after').top)).toBe('4px');
  await page.locator('#sample-size').fill('200');
  await expect(preview).toHaveCSS('max-width', '200px');
  await expect(page.locator('#shape-code')).toContainText('"shape": "expressive"');
});

test('seeded shapes randomize, persist, and export reusable CSS', async ({ page }) => {
  await page.goto('#shape-lab');
  const preview = page.locator('#shape-preview');
  const geometry = () =>
    preview.evaluate((node) => ({
      radius: getComputedStyle(node).borderRadius,
      mask: getComputedStyle(node, '::before').maskImage,
      control: getComputedStyle(node.querySelector('button')).borderRadius,
    }));
  await page.locator('#shape-seed').fill('my-company');
  await page.locator('#wave-count-top').fill('2');
  await page.locator('#wave-count-right').fill('0');
  await page.locator('#wave-count-bottom').fill('6');
  await page.locator('#wave-count-left').fill('3');
  const first = await geometry();
  await page.getByRole('button', { name: 'Randomize', exact: true }).click();
  expect(await geometry()).not.toEqual(first);
  const seed = await page.locator('#shape-seed').inputValue();
  const randomized = await geometry();
  await page.reload();
  await expect(page.locator('#shape-seed')).toHaveValue(seed);
  for (const [edge, count] of Object.entries({ top: '2', right: '0', bottom: '6', left: '3' })) {
    await expect(page.locator(`#wave-count-${edge}`)).toHaveValue(count);
    await expect(page.locator(`#wave-count-${edge}-output`)).toHaveText(count);
  }
  expect(await geometry()).toEqual(randomized);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  expect(await geometry()).toEqual(randomized);
  await page.locator('#shape-seed').fill('my-company');
  expect(await geometry()).toEqual(first);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSS', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('forest-and-fern-seeded-theme.css');
  const css = await readFile(await download.path(), 'utf8');
  await page.addStyleTag({ content: css });
  await preview.evaluate((node) => {
    node.removeAttribute('style');
    node.removeAttribute('data-ff-shape');
    node.classList.add('ff-seeded-theme');
  });
  expect(await geometry()).toEqual(first);
});

test('palette editing changes only the preview and resets', async ({ page }) => {
  await page.goto('#theme-lab');
  await page.getByText('Edit the palette', { exact: true }).click();
  const input = page.locator('input[data-token="--ff-color-primary"]');
  await input.fill('#336699');
  await expect(page.locator('#palette-preview .ff-button')).toHaveCSS(
    'background-color',
    'rgb(51, 102, 153)',
  );
  await page.locator('#palette-reset').click();
  await expect(page.locator('#palette-preview .ff-button')).toHaveCSS(
    'background-color',
    'rgb(23, 78, 57)',
  );
});

test('native controls work with keyboard and reset', async ({ page }) => {
  await page.goto('#native-controls');
  await page.getByRole('radio', { name: 'Dashboard', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: 'Kanban board' })).toBeChecked();
  const compact = page.getByRole('checkbox', { name: 'Compact navigation' });
  await compact.focus();
  await page.keyboard.press('Space');
  await expect(compact).toBeChecked();
  expect(await page.locator('#indeterminate').evaluate((node) => node.indeterminate)).toBe(true);
  await page.locator('#density').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#density-output')).toHaveText('47%');
  await page.getByLabel('Priority').selectOption('High');
  await page.getByLabel('Project name', { exact: true }).fill('Fern Studio');
  await page.getByRole('button', { name: 'Apply settings' }).click();
  await expect(page.locator('#status')).toContainText('Fern Studio · Kanban layout · 47%');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('#density-output')).toHaveText('46%');
  await expect(page.getByLabel('Project name', { exact: true })).toHaveValue('Organic Studio');
  await expect(page.getByRole('button', { name: 'Unavailable', exact: true })).toBeDisabled();
});

test('focus is visible and system reduced motion overrides the demo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('#motion-lab');
  await page.getByLabel('Motion intensity').selectOption('expressive');
  const button = page.locator('#press-sample');
  await button.focus();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect(button).toHaveCSS('outline-width', '3px');
  await expect(button).toHaveCSS('transition-duration', '0s');
  await expect(button).toHaveCSS('transform', 'none');
  await page.keyboard.press('Space');
  await expect(page.locator('#status')).toContainText('A gentle press');
});

test('manual reduced motion and static fallback prevent transforms', async ({ page }) => {
  await page.goto('#motion-lab');
  await page.getByRole('switch', { name: 'Preview reduced motion' }).check();
  await expect(page.locator('#motion-preview')).toHaveAttribute('data-ff-reduced-motion', 'true');
  await page.locator('#press-sample').hover();
  await expect(page.locator('#press-sample')).toHaveCSS('transform', 'none');
  await page.getByRole('switch', { name: 'Preview reduced motion' }).uncheck();
  await page.getByLabel('Motion intensity').selectOption('none');
  await expect(page.locator('#press-sample')).toHaveCSS('transform', 'none');
});

test('dashboard navigation, search and customer detail work', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: 'Open dashboard' }).click();
  await expect(page).toHaveURL(/examples\/dashboard.html$/);
  await page.getByLabel('Find a customer').fill('Oliver');
  await expect(page.locator('#customer-count')).toHaveText('1 customer');
  await page.getByRole('button', { name: 'View Oliver Moss' }).click();
  await expect(page.locator('#detail-name')).toHaveText('Oliver Moss');
  await expect(page.locator('#detail-revenue')).toHaveText('$9,450');
  await page.getByLabel('Find a customer').fill('nothing');
  await expect(page.locator('#no-customers')).toBeVisible();
});

test('native form validates, submits locally, and resets', async ({ page }) => {
  await page.goto('examples/forms.html');
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.locator('#project-result')).toBeHidden();
  await page.getByLabel('Project name (required)').fill('Forest Notes');
  await page.getByLabel('Contact email (required)').fill('hello@example.com');
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.locator('#project-result')).toContainText('Forest Notes');
  await expect(page.locator('#form-status')).toContainText('No data was sent');
  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.locator('#project-result')).toBeHidden();
});

for (const route of ['', 'examples/dashboard.html', 'examples/forms.html', 'docs/index.html']) {
  for (const theme of ['light', 'dark']) {
    test(`accessibility ${route || 'playground'} ${theme}`, async ({ page }) => {
      await page.goto(route);
      await page.locator('html').evaluate((node, theme) => {
        node.dataset.ffTheme = theme;
      }, theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
  test(`responsive ${route || 'playground'} at 320, 768, 1440 and zoom`, async ({ page }) => {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
    // A 640 CSS-pixel viewport models a 1280px display at 200% browser zoom.
    await page.setViewportSize({ width: 640, height: 450 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('forced colors restores a native switch and removes decorative masks', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium provides forced-colors emulation.');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('#shape-lab');
  await expect(page.locator('#wave-enabled')).toHaveCSS('appearance', 'auto');
  expect(
    await page
      .locator('#shape-preview')
      .evaluate((node) => getComputedStyle(node, '::before').display),
  ).toBe('none');
});

test('CSS can style a host app without changing unstyled native elements', async ({ page }) => {
  await page.goto('');
  await page.evaluate(() => {
    document.body.innerHTML =
      '<button id="plain">Plain</button><section class="ff-theme ff-native" data-ff-theme="dark"><button id="scoped">Scoped</button></section>';
  });
  await expect(page.locator('#scoped')).toHaveCSS('background-color', 'rgb(121, 184, 140)');
  expect(
    await page.locator('#plain').evaluate((node) => getComputedStyle(node).borderRadius),
  ).not.toContain('26px');
});

for (const theme of ['light', 'dark']) {
  test(`visual baseline ${theme}`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Maintain one deterministic desktop visual baseline.',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('');
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`playground-${theme}.png`, { fullPage: true });
    await page.goto('examples/dashboard.html');
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`dashboard-${theme}.png`, { fullPage: true });
  });
}

test('blocked local storage retains a working default and theme toggle', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage unavailable', 'SecurityError');
      },
    });
  });
  await page.goto('');
  await expect(page.locator('html')).toHaveAttribute('data-ff-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-ff-theme', 'dark');
});

test('standalone CSS and modular entry load beneath the repository base', async ({
  page,
  request,
}) => {
  await page.goto('');
  const stylesheet = new URL('assets/forest-and-fern.css', page.url()).href;
  const response = await request.get(stylesheet);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('text/css');
  const css = await response.text();
  expect(css).not.toContain('@import');
  expect(css).not.toContain('site-shell');
  const modular = await request.get(new URL('css/index.css', page.url()).href);
  expect(modular.ok()).toBe(true);
  expect(await modular.text()).toContain("@import './tokens.css'");
  await page.setContent(
    `<link rel="stylesheet" href="${stylesheet}"><button id="plain">Plain</button><section class="ff-theme ff-native" data-ff-theme="dark"><label for="native-select">Choice</label><select id="native-select"><option>First</option><option>Second</option></select><button id="native-button">Scoped</button><input id="native-switch" type="checkbox" class="ff-switch" aria-label="Native switch"></section>`,
  );
  await expect(page.locator('#native-button')).toHaveCSS('background-color', 'rgb(121, 184, 140)');
  expect(
    await page.locator('#plain').evaluate((node) => getComputedStyle(node).borderRadius),
  ).not.toContain('26px');
  const select = page.getByLabel('Choice');
  await select.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(select).toHaveValue('Second');
  await page.getByLabel('Native switch').focus();
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Native switch')).toBeChecked();
});

test('theme colors change together without interpolating contrast', async ({ page }) => {
  await page.goto('');
  const colors = await page.evaluate(() => {
    const root = document.documentElement;
    const primary = document.querySelector('.hero-actions .ff-button');
    const secondary = document.querySelector('#theme-toggle');
    getComputedStyle(primary).backgroundColor;
    getComputedStyle(secondary).backgroundColor;
    root.dataset.ffTheme = 'dark';
    return {
      primaryBackground: getComputedStyle(primary).backgroundColor,
      primaryText: getComputedStyle(primary).color,
      secondaryBackground: getComputedStyle(secondary).backgroundColor,
      secondaryText: getComputedStyle(secondary).color,
    };
  });
  expect(colors).toEqual({
    primaryBackground: 'rgb(121, 184, 140)',
    primaryText: 'rgb(16, 37, 26)',
    secondaryBackground: 'rgb(48, 84, 60)',
    secondaryText: 'rgb(231, 242, 229)',
  });
});
