import { readFile, appendFile } from 'node:fs/promises';
import { validateRelease } from './release.mjs';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const release = validateRelease(pkg, {
  repository: process.env.GITHUB_REPOSITORY,
  tag: process.env.RELEASE_TAG,
});
if (process.env.GITHUB_OUTPUT)
  await appendFile(process.env.GITHUB_OUTPUT, `dist-tag=${release.distTag}\n`);
console.log(
  `Release metadata verified: ${pkg.name}@${pkg.version} from ${release.repository} (${release.distTag}).`,
);
