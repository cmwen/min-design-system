import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { releaseMetadata } from './release.mjs';
const { values } = parseArgs({
  options: { repo: { type: 'string' }, package: { type: 'string' } },
});
const metadata = releaseMetadata(values.repo, values.package);
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
Object.assign(pkg, metadata);
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
lock.name = pkg.name;
lock.packages[''].name = pkg.name;
await writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n');
await writeFile('package-lock.json', JSON.stringify(lock, null, 2) + '\n');
console.log(
  `Configured ${pkg.name} for ${metadata.repository.url}. Nothing has been pushed or published.`,
);
