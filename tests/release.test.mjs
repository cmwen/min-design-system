import test from 'node:test';
import assert from 'node:assert/strict';
import {
  githubRepository,
  packageName,
  releaseMetadata,
  validateRelease,
} from '../scripts/release.mjs';
const pkg = {
  ...releaseMetadata('example/forest-and-fern', '@example/forest-and-fern'),
  version: '0.1.0',
};
test('release metadata supports scoped names and project/user Pages paths', () => {
  assert.equal(packageName(pkg.name), '@example/forest-and-fern');
  assert.equal(
    githubRepository('https://github.com/example/forest-and-fern.git'),
    'example/forest-and-fern',
  );
  assert.equal(pkg.homepage, 'https://example.github.io/forest-and-fern/');
  assert.equal(
    releaseMetadata('example/example.github.io', 'fern').homepage,
    'https://example.github.io/',
  );
});
test('publishing rejects missing identity, wrong repository, wrong tag and runtime dependencies', () => {
  assert.throws(() => validateRelease({ ...pkg, private: true }), /Configure release identity/);
  assert.throws(() => validateRelease(pkg, { repository: 'other/repository' }), /must match/);
  assert.throws(() => validateRelease(pkg, { tag: 'v0.2.0' }), /must be v0.1.0/);
  assert.throws(
    () => validateRelease({ ...pkg, dependencies: { react: '*' } }),
    /no runtime dependencies/,
  );
  assert.throws(() => githubRepository('https://example.com/account/repo'), /GitHub repository/);
  assert.throws(() => packageName('@example/Fern'), /lowercase/);
});
test('stable releases use latest and prereleases use next', () => {
  assert.equal(validateRelease(pkg, { tag: 'v0.1.0' }).distTag, 'latest');
  assert.equal(
    validateRelease({ ...pkg, version: '0.2.0-rc.1' }, { tag: 'v0.2.0-rc.1' }).distTag,
    'next',
  );
});
