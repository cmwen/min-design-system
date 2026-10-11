import { readCss } from './css.mjs';
import { writeFile, mkdir, copyFile } from 'node:fs/promises';

const { modules, code } = await readCss();
await mkdir('dist/assets', { recursive: true });
await writeFile('dist/assets/forest-and-fern.css', code);
await mkdir('dist/css', { recursive: true });
await Promise.all(
  ['index.css', ...modules].map((name) => copyFile(`src/${name}`, `dist/css/${name}`)),
);
await copyFile('LICENSE', 'dist/css/LICENSE');
await mkdir('dist/js', { recursive: true });
await copyFile('src/tabs.js', 'dist/js/tabs.js');
await Promise.all(
  ['README.md', 'CONTRIBUTING.md', 'LICENSE'].map((name) => copyFile(name, `dist/${name}`)),
);
await Promise.all(
  [
    'DECISIONS.md',
    'VALIDATION.md',
    'performance-results.json',
    'INSTALL.md',
    'ASSETS.md',
    'STORYBOOK.md',
    'RELEASE.md',
  ].map((name) => copyFile(`docs/${name}`, `dist/docs/${name}`)),
);
console.log(
  `CSS artifact: ${(Buffer.byteLength(code) / 1024).toFixed(1)} KiB; modular source: dist/css/`,
);
