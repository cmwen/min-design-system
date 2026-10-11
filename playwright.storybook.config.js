import { defineConfig } from '@playwright/test';
const base = process.env.FF_BASE || '/forest-and-fern/';
export default defineConfig({
  testDir: './tests/storybook',
  workers: 2,
  use: {
    baseURL: `http://127.0.0.1:4173${base}storybook/`,
    viewport: { width: 1024, height: 800 },
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: `http://127.0.0.1:4173${base}storybook/`,
    reuseExistingServer: !process.env.CI,
  },
});
