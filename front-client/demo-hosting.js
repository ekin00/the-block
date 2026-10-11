import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export function demoMiddleware(root) {
  return async (req, res, next) => {
    const pathname = req.url.split('?')[0];
    if (pathname !== '/demo' && !pathname.startsWith('/demo/')) {
      next();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method not allowed');
      return;
    }
    let relative;
    try {
      relative = decodeURIComponent(pathname.slice('/demo'.length));
    } catch {
      res.writeHead(400);
      res.end('Invalid demo path');
      return;
    }
    if (relative.includes('\\') || relative.split('/').includes('..')) {
      res.writeHead(400);
      res.end('Invalid demo path');
      return;
    }
    const isRoute = /^\/?(?:index\.html|compare\/?|favorites\/?|welcome\/?|vehicles\/[^/]+\/?)?$/.test(relative);
    const filename = path.join(root, isRoute ? 'index.html' : relative);
    try {
      const info = await stat(filename);
      if (!info.isFile()) {
        res.writeHead(404);
        res.end('Demo file not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentTypes[path.extname(filename)] || 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': 'no-cache',
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        createReadStream(filename).on('error', (error) => res.destroy(error)).pipe(res);
      }
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        res.writeHead(404);
        res.end('Demo file not found');
      } else {
        next(error);
      }
    }
  };
}

export default function frozenDemo() {
  let config;
  return {
    name: 'frozen-demo',
    configResolved(resolved) {
      config = resolved;
    },
    configureServer(server) {
      server.middlewares.use(demoMiddleware(path.join(config.publicDir, 'demo')));
    },
    configurePreviewServer(server) {
      server.middlewares.use(demoMiddleware(path.resolve(config.root, config.build.outDir, 'demo')));
    },
  };
}
