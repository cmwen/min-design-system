import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const base = process.env.FF_BASE || '/forest-and-fern/';
const server = await preview({ preview: { host: '127.0.0.1', port: 4180, strictPort: true } });
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  await page.goto(`http://127.0.0.1:4180${base}examples/performance.html`);
  await page.evaluate(() => document.fonts.ready);
  const session = await page.context().newCDPSession(page);
  await session.send('Performance.enable');
  const samples = [];
  // Alternate ordering to reduce warm-up/cache bias. Five samples per condition.
  for (const enabled of [false, true, true, false, false, true, true, false, false, true]) {
    const before = await session.send('Performance.getMetrics');
    await page.evaluate(async (enabled) => {
      document.querySelector('#perf-surfaces').dataset.ffWave = enabled ? 'soft' : 'off';
      for (let i = 0; i < 20; i++) {
        window.scrollTo(0, i * 70);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }, enabled);
    const after = await session.send('Performance.getMetrics');
    const values = Object.fromEntries(after.metrics.map((metric) => [metric.name, metric.value]));
    const prior = Object.fromEntries(before.metrics.map((metric) => [metric.name, metric.value]));
    samples.push({
      enabled,
      taskMs: +(1000 * (values.TaskDuration - prior.TaskDuration)).toFixed(2),
      layoutMs: +(1000 * (values.LayoutDuration - prior.LayoutDuration)).toFixed(2),
      styleMs: +(1000 * (values.RecalcStyleDuration - prior.RecalcStyleDuration)).toFixed(2),
    });
  }
  const css = await readFile('dist/assets/forest-and-fern.css');
  const result = {
    generatedAt: new Date().toISOString(),
    browser: browser.version(),
    surfaces: 50,
    viewport: '1440×1000',
    cssBytes: css.length,
    cssGzipBytes: gzipSync(css).length,
    samples,
    means: [false, true].map((enabled) => {
      const rows = samples.filter((sample) => sample.enabled === enabled);
      return {
        waves: enabled ? 'soft' : 'off',
        taskMs: +(rows.reduce((sum, row) => sum + row.taskMs, 0) / rows.length).toFixed(2),
        layoutMs: +(rows.reduce((sum, row) => sum + row.layoutMs, 0) / rows.length).toFixed(2),
        styleMs: +(rows.reduce((sum, row) => sum + row.styleMs, 0) / rows.length).toFixed(2),
      };
    }),
    limitations:
      'Headless Chromium main-thread metrics, one environment, 20 scripted scroll frames per sample. GPU raster/paint cost, real-device battery use, and Core Web Vitals are not measured. Profile real devices before broad wave use. Waves stay off by default.',
  };
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/performance.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (result.cssGzipBytes > 16000) throw new Error('CSS exceeds the 16 KiB gzip guardrail.');
} finally {
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
