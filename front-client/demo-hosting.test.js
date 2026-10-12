import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { demoMiddleware } from './demo-hosting.js';

test('demo routes use the frozen document, never the production fallback', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'block-demo-hosting-'));
  await mkdir(path.join(root, 'assets'));
  await writeFile(path.join(root, 'index.html'), 'frozen reference');
  await writeFile(path.join(root, 'assets', 'demo.js'), 'frozen javascript');
  const middleware = demoMiddleware(root);
  const server = createServer((req, res) => {
    middleware(req, res, (error) => {
      res.writeHead(error ? 500 : 200);
      res.end(error ? error.message : 'production');
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/demo', '/demo/', '/demo/compare', '/demo/favorites', '/demo/welcome', '/demo/vehicles/1', '/demo/vehicles/a.b?test=1']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200, route);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.equal(await response.text(), 'frozen reference');
    }
    const asset = await fetch(base + '/demo/assets/demo.js');
    assert.match(asset.headers.get('content-type'), /text\/javascript/);
    assert.equal(await asset.text(), 'frozen javascript');
    assert.equal((await fetch(base + '/demo/assets/missing.js')).status, 404);
    assert.equal((await fetch(base + '/demo/%ZZ')).status, 400);
    assert.equal((await fetch(base + '/demo/%2e%2e%5csecret')).status, 400);
    assert.equal((await fetch(base + '/demo', { method: 'POST' })).status, 405);
    assert.equal(await (await fetch(base + '/demo/compare', { method: 'HEAD' })).text(), '');
    for (const route of ['/', '/dashboard', '/demonstration']) {
      assert.equal(await (await fetch(base + route)).text(), 'production');
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true });
  }
});
