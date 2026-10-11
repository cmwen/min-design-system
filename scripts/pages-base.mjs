import { appendFile } from 'node:fs/promises';
import { githubRepository } from './release.mjs';
const [owner, name] = githubRepository(process.env.GITHUB_REPOSITORY).split('/');
const base =
  process.env.FF_BASE ||
  (name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${name}/`);
if (!/^\/(?:[A-Za-z0-9_.-]+\/)*$/.test(base))
  throw new Error('FF_BASE must be an absolute directory path ending with /.');
if (process.env.GITHUB_ENV) await appendFile(process.env.GITHUB_ENV, `FF_BASE=${base}\n`);
console.log(`Pages base: ${base}`);
