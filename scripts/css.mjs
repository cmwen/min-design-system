import { readFile } from 'node:fs/promises';
export async function readCss() {
  const { version } = JSON.parse(await readFile('package.json', 'utf8'));
  const entry = await readFile('src/index.css', 'utf8');
  const modules = [...entry.matchAll(/@import '\.\/(.+?)';/g)].map((match) => match[1]);
  const contents = await Promise.all(modules.map((name) => readFile(`src/${name}`, 'utf8')));
  return { modules, code: `/* Forest & Fern v${version} | MIT */\n${contents.join('\n')}` };
}
