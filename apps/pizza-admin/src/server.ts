import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

/** Совпадает с production baseHref в project.json; nginx должен проксировать /admin/* без обрезки префикса. */
const adminPublicPath = '/admin';

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Манифест SSR содержит маршрут `/admin` без завершающего `/`; при запросе `/admin/` Angular
 * отдаёт 301 на `/admin/` → цикл. Приводим только корень префикса к `/admin`.
 * Редирект `/admin` → `/admin/` делайте в nginx (`location = /admin`).
 */
app.use((req, _res, next) => {
  const q = req.originalUrl.indexOf('?');
  const pathOnly = q === -1 ? req.originalUrl : req.originalUrl.slice(0, q);
  const query = q === -1 ? '' : req.originalUrl.slice(q);
  if (pathOnly === `${adminPublicPath}/`) {
    req.originalUrl = `${adminPublicPath}${query}`;
    req.url = `${adminPublicPath}${query}`;
  }
  next();
});

/**
 * Статика из /browser под /admin/*. Для путей без расширения (корень /admin/, SSR-маршруты)
 * express.static не вызываем: иначе внутренний GET «/» даёт 301 Location /admin/ и цикл редиректов.
 */
const adminStatic = express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
});
app.use(adminPublicPath, (req, res, next) => {
  const relative = req.path === '' ? '/' : req.path;
  if (relative === '/' || !/\.[^/]+$/.test(relative)) {
    next();
    return;
  }
  adminStatic(req, res, next);
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
