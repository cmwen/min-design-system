export function githubRepository(value) {
  const name = value
    ?.replace(/^https:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '');
  if (
    !/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(name || '') ||
    name.endsWith('/..') ||
    name.endsWith('/.')
  ) {
    throw new Error(
      'Provide a GitHub repository as owner/repository or its https://github.com URL.',
    );
  }
  return name;
}
export function packageName(value) {
  if (
    !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(value || '') ||
    value.length > 214
  ) {
    throw new Error('Provide a lowercase npm package name, optionally scoped as @account/package.');
  }
  return value;
}
export function releaseMetadata(repository, name) {
  const repo = githubRepository(repository);
  const [owner, project] = repo.split('/');
  return {
    name: packageName(name),
    private: false,
    repository: { type: 'git', url: `git+https://github.com/${repo}.git` },
    homepage: `https://${owner}.github.io/${project === `${owner}.github.io` ? '' : `${project}/`}`,
    bugs: { url: `https://github.com/${repo}/issues` },
    publishConfig: { access: 'public', registry: 'https://registry.npmjs.org/' },
  };
}
export function validateRelease(pkg, { repository, tag } = {}) {
  packageName(pkg.name);
  if (pkg.private !== false)
    throw new Error(
      'Configure release identity before publishing: npm run release:configure -- --repo OWNER/REPO --package NAME',
    );
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version))
    throw new Error('A semantic release version is required.');
  const repo = githubRepository(pkg.repository?.url?.replace(/^git\+/, ''));
  if (repository && repo !== githubRepository(repository))
    throw new Error('Package repository must match the publishing GitHub repository.');
  if (tag && tag !== `v${pkg.version}`) throw new Error(`Release tag must be v${pkg.version}.`);
  if (
    pkg.publishConfig?.access !== 'public' ||
    pkg.publishConfig?.registry !== 'https://registry.npmjs.org/'
  )
    throw new Error('Release must target the public npm registry.');
  if (pkg.dependencies && Object.keys(pkg.dependencies).length)
    throw new Error('The CSS package must have no runtime dependencies.');
  return {
    repository: repo,
    tag: `v${pkg.version}`,
    distTag: pkg.version.includes('-') ? 'next' : 'latest',
  };
}
