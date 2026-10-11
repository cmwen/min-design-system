import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const modules = [
  'tokens',
  'themes',
  'typography',
  'shapes',
  'waves',
  'native-controls',
  'motion',
  'components',
];
const css = modules.map((name) => readFileSync(`src/${name}.css`, 'utf8')).join('\n');
test('CSS is self-contained, opt-in, and contains no runtime filters', () => {
  const withoutAmbient = css.replace(
    /\.ff-brand-mark\[data-ff-ambient='true'\] svg\s*\{[^}]+\}/g,
    '',
  );
  assert.doesNotMatch(
    withoutAmbient,
    /https?:\/\/(?!www\.w3\.org)|filter\s*:|animation\s*:.*infinite|nth-child/,
  );
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /forced-colors/);
  assert.ok(gzipSync(css).length < 16000, 'CSS gzip budget is 16 KiB');
});
test('wave masks are reproducible and expose every supported strength', () => {
  for (let i = 1; i <= 12; i++) assert.match(css, new RegExp(`data-ff-wave-strength='${i}'`));
  assert.match(css, /data-ff-wave-strength='0'/);
});
test('the package has no runtime or framework dependencies', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.dependencies, undefined);
  assert.doesNotMatch(JSON.stringify(pkg), /"(?:react|tailwindcss|vue)"/);
});
