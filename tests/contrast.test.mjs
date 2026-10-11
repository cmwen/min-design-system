import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync('src/themes.css', 'utf8');
const declarations = (block) =>
  Object.fromEntries(
    [...block.matchAll(/--ff-([\w-]+):\s*(#[a-f0-9]{6})/g)].map(([, key, value]) => [key, value]),
  );
export const themes = {
  light: declarations(css.split("[data-ff-theme='light']")[1].split('}')[0]),
  dark: declarations(css.split("[data-ff-theme='dark']")[1].split('}')[0]),
};
function luminance(hex) {
  const channels = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
for (const [theme, tokens] of Object.entries(themes)) {
  for (const background of ['color-bg', 'color-surface', 'color-surface-raised']) {
    for (const foreground of [
      'color-text',
      'color-muted',
      'color-primary',
      'color-error',
      'color-success',
      'color-warning',
    ]) {
      test(`${theme}: ${foreground} on ${background} meets 4.5:1`, () => {
        const ratio = contrast(tokens[foreground], tokens[background]);
        assert.ok(ratio >= 4.5, `${ratio.toFixed(2)}:1`);
      });
    }
    for (const foreground of ['focus-ring', 'color-control-border']) {
      test(`${theme}: ${foreground} on ${background} meets 3:1`, () => {
        const ratio = contrast(tokens[foreground], tokens[background]);
        assert.ok(ratio >= 3, `${ratio.toFixed(2)}:1`);
      });
    }
  }
  for (const [fg, bg] of [
    ['color-on-primary', 'color-primary'],
    ['color-on-primary', 'color-primary-hover'],
    ['color-on-selected', 'color-selected'],
    ['color-on-disabled', 'color-disabled'],
  ]) {
    test(`${theme}: ${fg} on ${bg} meets 4.5:1`, () =>
      assert.ok(contrast(tokens[fg], tokens[bg]) >= 4.5));
  }
}
