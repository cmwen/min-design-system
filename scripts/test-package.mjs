import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'vite';
const packageName = JSON.parse(await readFile('package.json', 'utf8')).name;
const directory = await mkdtemp(join(tmpdir(), 'forest-fern-consumer-'));
try {
  const packOutput = JSON.parse(
    execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', directory], {
      encoding: 'utf8',
    }),
  );
  const packed = Array.isArray(packOutput) ? packOutput[0] : packOutput[packageName];
  assert.ok(packed?.files, `Missing pack metadata for ${packageName}`);
  const paths = packed.files.map((file) => file.path);
  assert.ok(paths.includes('dist/assets/forest-and-fern.css'));
  assert.ok(paths.includes('src/tabs.js'));
  assert.ok(paths.includes('src/theme.js'));
  assert.ok(paths.includes('docs/INSTALL.md'));
  assert.ok(
    !paths.some((path) => /^(stories|playground|public|\.storybook|node_modules)\//.test(path)),
  );
  const consumer = join(directory, 'consumer');
  await mkdir(consumer);
  await writeFile(
    join(consumer, 'package.json'),
    '{"name":"forest-fern-consumer","private":true,"type":"module"}',
  );
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', join(directory, packed.filename)],
    { cwd: consumer, stdio: 'pipe' },
  );
  const pkg = JSON.parse(
    await readFile(join(consumer, 'node_modules', packageName, 'package.json'), 'utf8'),
  );
  assert.equal(pkg.dependencies, undefined);
  await writeFile(
    join(consumer, 'index.html'),
    '<html><head><title>Consumer</title></head><body><div class="ff-theme"><article class="ff-card">Installed</article></div><script type="module" src="./main.js"></script></body></html>',
  );
  await writeFile(
    join(consumer, 'main.js'),
    `import ${JSON.stringify(packageName)};\nimport ${JSON.stringify(`${packageName}/forest-and-fern.css`)};\nimport { initTabs } from ${JSON.stringify(`${packageName}/tabs`)};\nimport { createTheme } from ${JSON.stringify(`${packageName}/theme`)};\ninitTabs(document);\ncreateTheme({ seed: 'consumer' }).apply(document.querySelector('.ff-theme'));\n`,
  );
  await build({
    configFile: false,
    root: consumer,
    logLevel: 'warn',
    build: { outDir: resolve(consumer, 'dist') },
  });
  console.log(
    `Package smoke passed: ${paths.length} files; CSS, optional tabs and seeded themes import in an isolated Vite app; no runtime dependencies.`,
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
