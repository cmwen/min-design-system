import { defineConfig } from 'vite';
import { resolve, extname, sep } from 'node:path';
import { readFile } from 'node:fs/promises';
import { readCss } from './scripts/css.mjs';

const base = process.env.FF_BASE || '/forest-and-fern/';

export default defineConfig({
  base,
  plugins: [
    {
      name: 'forest-and-fern-dev-css',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const pathname = request.url?.split('?')[0];
          if (pathname?.startsWith(`${base}storybook/`)) {
            const root = resolve('dist/storybook');
            try {
              const relative =
                decodeURIComponent(pathname.slice(`${base}storybook/`.length)) || 'index.html';
              const file = resolve(root, relative);
              if (!file.startsWith(`${root}${sep}`)) {
                response.statusCode = 403;
                return response.end('Invalid workshop path.');
              }
              const types = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.svg': 'image/svg+xml',
                '.woff2': 'font/woff2',
                '.png': 'image/png',
              };
              response.setHeader(
                'Content-Type',
                types[extname(file)] || 'application/octet-stream',
              );
              return response.end(await readFile(file));
            } catch {
              response.statusCode = 404;
              return response.end(
                'Build the workshop with npm run build-storybook, or start npm run storybook on port 6006.',
              );
            }
          }
          if (pathname !== `${base}assets/forest-and-fern.css`) return next();
          try {
            const { code } = await readCss();
            response.setHeader('Content-Type', 'text/css; charset=utf-8');
            response.end(code);
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        playground: resolve('index.html'),
        dashboard: resolve('examples/dashboard.html'),
        forms: resolve('examples/forms.html'),
        components: resolve('examples/components.html'),
        integration: resolve('examples/integration.html'),
        documentation: resolve('docs/index.html'),
        performance: resolve('examples/performance.html'),
      },
    },
  },
});
