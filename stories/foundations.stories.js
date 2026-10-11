import { useEffect } from 'storybook/preview-api';
import { expect, waitFor } from 'storybook/test';
import tokens from '../src/tokens.css?raw';
import themes from '../src/themes.css?raw';
import { tested } from './recipe-interactions.js';

const names = (css) => [...new Set(css.match(/--ff-[\w-]+(?=\s*:)/g))];
const tokenNames = names(tokens);
const colorNames = names(themes).filter((name) => name !== '--ff-shadow');
function node(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}
function catalog(title, description, list, sample) {
  const root = node(
    `<section class="ff-stack"><h1 class="ff-heading">${title}</h1><p>${description}</p><div class="ff-grid token-grid"></div></section>`,
  );
  const grid = root.querySelector('.token-grid');
  for (const name of list) {
    const item = node(
      `<article class="ff-card ff-stack"><div class="token-sample" aria-hidden="true"></div><code></code><output data-token="${name}"></output></article>`,
    ).firstChild;
    item.querySelector('code').textContent = name;
    sample(item.querySelector('.token-sample'), name);
    grid.append(item);
  }
  const refresh = () => {
    if (!root.isConnected) return;
    const style = getComputedStyle(root);
    root.querySelectorAll('[data-token]').forEach((output) => {
      output.textContent = style.getPropertyValue(output.dataset.token).trim();
    });
  };
  const frame = requestAnimationFrame(refresh);
  useEffect(() => {
    refresh();
    return () => cancelAnimationFrame(frame);
  }, [root]);
  return root;
}
const tokenPlay = tested(async ({ canvasElement, step }) => {
  await step('Display resolved CSS tokens from the active theme', async () => {
    const outputs = canvasElement.querySelectorAll('[data-token]');
    await expect(outputs.length).toBeGreaterThan(0);
    await waitFor(() => {
      const style = getComputedStyle(canvasElement.querySelector('section'));
      outputs.forEach((output) => {
        expect(output.textContent).toBe(style.getPropertyValue(output.dataset.token).trim());
        expect(output.textContent.length).toBeGreaterThan(0);
      });
    });
  });
});
export default {
  title: 'Foundations/Design tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Public CSS custom properties read directly from the installed styles. Change the toolbar to inspect theme, wave and motion overrides. Override these properties inside your own .ff-theme scope.',
      },
    },
  },
};
export const Colors = {
  play: tokenPlay,
  render: () =>
    catalog(
      'Semantic colors',
      'Each swatch follows the active theme. The token name expresses its purpose.',
      colorNames,
      (sample, name) => {
        sample.classList.add('token-color');
        sample.style.backgroundColor = `var(${name})`;
      },
    ),
};
export const Typography = {
  play: tokenPlay,
  render: () =>
    catalog(
      'Typography',
      'Font family, sizes, weights and text rhythm. The consumer supplies its own font asset or uses the system fallback.',
      tokenNames.filter((name) => /font|line-height|letter-spacing/.test(name)),
      (sample, name) => {
        sample.textContent = 'Fern Aa';
        const property = name.replace('--ff-', '').replace(/-(sm|body|title|label|heading)$/, '');
        sample.style.setProperty(property, `var(${name})`);
      },
    ),
};
export const Spacing = {
  play: tokenPlay,
  render: () =>
    catalog(
      'Spacing scale',
      'A shared rhythm for padding, gaps and layout. Bars show actual token lengths.',
      tokenNames.filter((name) => name.includes('space-')),
      (sample, name) => {
        sample.classList.add('token-space');
        sample.style.width = `var(${name})`;
      },
    ),
};
export const Geometry = {
  play: tokenPlay,
  render: () =>
    catalog(
      'Geometry & surfaces',
      'Use the wave toolbar to inspect the decorative mask. Wave edges never clip content or focus rings.',
      [
        '--ff-border-width',
        '--ff-control-radius',
        '--ff-shape-radius',
        '--ff-wave-mask',
        '--ff-shadow',
      ],
      (sample, name) => {
        sample.classList.add('ff-wave-surface', 'token-geometry');
        if (name.includes('radius')) sample.style.borderRadius = `var(${name})`;
      },
    ),
};
export const Motion = {
  play: tokenPlay,
  render: () =>
    catalog(
      'Motion',
      'Hover or press a button to try the active motion setting. System reduced motion takes priority.',
      tokenNames.filter((name) => /duration|ease|hover-lift/.test(name)),
      (sample) => {
        sample.innerHTML = '<button class="ff-button" type="button">Try motion</button>';
        sample.removeAttribute('aria-hidden');
      },
    ),
};
