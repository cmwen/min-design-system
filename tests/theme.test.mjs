import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTheme } from '../src/theme.js';

test('seeded geometry is reproducible and independent of palette and wave settings', () => {
  const first = createTheme({ seed: 'fern 🌿', waveStrength: 3 });
  assert.deepEqual(first.tokens, createTheme({ seed: 'fern 🌿', waveStrength: 3 }).tokens);
  assert.notDeepEqual(first.tokens, createTheme({ seed: 'moss', waveStrength: 3 }).tokens);
  assert.equal(
    first.tokens['--ff-shape-radius'],
    createTheme({ seed: 'fern 🌿' }).tokens['--ff-shape-radius'],
  );
  assert.equal(first.version, 1);
  assert.equal(
    first.tokens['--ff-shape-radius'],
    '29.7px 32.4px 25.4px 47.0px / 30.8px 29.1px 41.6px 29.0px',
  );
  assert.match(first.toCSS(), /^\.ff-seeded-theme \{/);
  assert.doesNotMatch(first.toCSS(), /--ff-color/);
});

test('zero variation matches existing preset geometry and wave silhouette', () => {
  const theme = createTheme({ seed: 'any', variation: 0, waveStrength: 3 });
  assert.equal(
    theme.tokens['--ff-shape-radius'],
    '29.0px 42.0px 23.0px 37.0px / 36.0px 25.0px 40.0px 27.0px',
  );
  assert.deepEqual(
    theme.tokens,
    createTheme({ seed: 'other', variation: 0, waveStrength: 3 }).tokens,
  );
  assert.ok(readFileSync('src/waves.css', 'utf8').includes(theme.tokens['--ff-wave-mask']));
  assert.equal(createTheme().tokens['--ff-wave-mask'], 'none');
  assert.match(createTheme({ shape: 'none' }).tokens['--ff-shape-radius'], /^0\.0px /);
});

test('invalid generator inputs are rejected', () => {
  for (const options of [
    { seed: '' },
    { seed: 123 },
    { seed: 'x'.repeat(201) },
    { shape: '__proto__' },
    { variation: NaN },
    { variation: 2 },
    { waveStrength: 0.5 },
    { waveStrength: 13 },
    { waveCounts: null },
    { waveCounts: [] },
    { waveCounts: { top: 1.5 } },
    { waveCounts: { left: 13 } },
    { waveCounts: { right: -1 } },
    { waveCounts: { center: 2 } },
  ]) {
    assert.throws(() => createTheme(options));
  }
});

test('edge counts control complete waves and leave the other edges unchanged', () => {
  const path = (waveCounts) => {
    const mask = createTheme({ seed: 'edges', waveStrength: 3, waveCounts }).tokens[
      '--ff-wave-mask'
    ];
    return decodeURIComponent(mask).match(/d="([^"]+)"/)[1];
  };
  const original = path({});
  const changed = path({ top: 2 });
  assert.equal((original.match(/C/g) || []).length, 32);
  assert.equal((changed.match(/C/g) || []).length, 28);
  // The final three edges retain their exact path coordinates.
  assert.deepEqual(changed.split('C').slice(-24), original.split('C').slice(-24));
  const mixed = path({ top: 0, right: 1, bottom: 3, left: 2 });
  assert.match(mixed, /^M7 7 L993 7 C/);
  assert.equal((mixed.match(/C/g) || []).length, 12);
  assert.equal(
    createTheme({ waveStrength: 3, waveCounts: { top: 0, right: 0, bottom: 0, left: 0 } }).tokens[
      '--ff-wave-mask'
    ],
    'none',
  );
});
