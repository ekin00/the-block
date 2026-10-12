import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

export const root = dirname(dirname(fileURLToPath(import.meta.url)));
export const output = join(root, '..', 'public', 'demo');
export const manifestName = 'snapshot-manifest.json';
export const schemaVersion = 1;
export const base = '/demo/';
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const slash = (path) => path.replaceAll('\\', '/');

export function filesIn(directory, excluded = []) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !excluded.includes(entry.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      assert(!entry.isSymbolicLink(), `Symlinks are not snapshot inputs: ${path}`);
      return entry.isDirectory() ? filesIn(path, excluded) : [path];
    })
    .sort();
}

export function inventory(directory, excluded = []) {
  return filesIn(directory, excluded).map((path) => ({
    path: slash(relative(directory, path)),
    bytes: statSync(path).size,
    sha256: hash(readFileSync(path)),
  })).sort((a, b) => a.path.localeCompare(b.path));
}

export function sourceInventory() {
  return inventory(root, ['node_modules', '.vite', '.git']);
}

export function checkSources() {
  const pkg = readJson(join(root, 'package.json'));
  const lock = readJson(join(root, 'package-lock.json'));
  const originals = readJson(join(root, 'originals.json'));
  assert.equal(originals.schemaVersion, schemaVersion);
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.lockfileVersion, 3);
  for (const kind of ['dependencies', 'devDependencies']) {
    assert.deepEqual(lock.packages[''][kind], pkg[kind]);
    for (const [name, version] of Object.entries(pkg[kind])) {
      assert.match(version, /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/, `Dependency must be pinned: ${name}`);
      assert.equal(lock.packages[`node_modules/${name}`].version, version);
      assert.equal(originals.resolvedDependencies[name], version, `Resolved original changed: ${name}`);
    }
  }
  for (const entry of originals.files) {
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert(statSync(join(root, entry.snapshot)).isFile(), `Missing copied input: ${entry.snapshot}`);
  }
  for (const path of filesIn(root, ['node_modules', '.vite', '.git'])) {
    assert(!/(?:^|[\\/])\.env(?:\.|$)/.test(path), 'Environment files must not enter the snapshot');
    if (!/\.(?:jsx?|css|html)$/.test(path)) continue;
    const text = readFileSync(path, 'utf8');
    assert(!/import\.meta\.env|process\.env|\bfetch\s*\(|\bXMLHttpRequest\b|axios|services\/api/.test(text),
      `Production API or environment reference: ${path}`);
    assert(!/\b(?:localStorage|sessionStorage)\.clear\s*\(/.test(text), `Storage clear: ${path}`);
    const storageCalls = [...text.matchAll(/\b(?:localStorage|sessionStorage)\.(getItem|setItem|removeItem)\s*\(\s*([^,\n)]+)/g)];
    for (const call of storageCalls) {
      assert.match(call[2], /^['"]theblock:demo-snapshot:v1:[a-z]+['"]$/,
        `Storage key is not a literal snapshot key: ${path}`);
    }
    for (const match of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
      const target = join(dirname(path), match[1]);
      assert(!relative(root, target).startsWith('..'), `Import leaves snapshot: ${path}`);
      assert(['', '.js', '.jsx', '.css', '.svg', '.gif'].some((ext) => {
        try { return statSync(target + ext).isFile(); } catch { return false; }
      }), `Missing local import ${match[1]} in ${path}`);
    }
  }
  return { pkg, originals };
}

export function checkOutput() {
  const files = inventory(output, [manifestName]);
  const names = files.map((entry) => entry.path);
  for (const name of ['index.html', 'apple-touch-icon.png', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon.ico', 'site.webmanifest']) {
    assert(names.includes(name), `Missing output: ${name}`);
  }
  for (const extension of ['js', 'css', 'gif']) {
    assert(names.some((name) => name.startsWith('assets/') && name.endsWith(`.${extension}`)),
      `Missing bundled ${extension}`);
  }
  const html = readFileSync(join(output, 'index.html'), 'utf8');
  const resources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  assert(resources.some((url) => /^\/demo\/assets\/.*\.js$/.test(url)), 'Missing entry script');
  for (const url of resources) {
    assert(url.startsWith(base), `HTML resource is not snapshot-local: ${url}`);
    assert(names.includes(url.slice(base.length)), `HTML resource is missing: ${url}`);
  }
  const webmanifest = readJson(join(output, 'site.webmanifest'));
  for (const icon of webmanifest.icons) {
    assert(icon.src.startsWith(base) && names.includes(icon.src.slice(base.length)), `Missing manifest icon: ${icon.src}`);
  }
  for (const name of names.filter((name) => name.endsWith('.css'))) {
    const css = readFileSync(join(output, name), 'utf8');
    assert(!/@import|https?:\/\//.test(css), `Runtime external CSS: ${name}`);
  }
  return files;
}

export function verify() {
  const { pkg, originals } = checkSources();
  const manifest = readJson(join(output, manifestName));
  assert.equal(manifest.schemaVersion, schemaVersion);
  assert.equal(manifest.snapshotVersion, pkg.version);
  assert.equal(manifest.base, base);
  assert.deepEqual(manifest.sources, sourceInventory(), 'Source/lock provenance mismatch. Refresh intentionally after edits.');
  assert.deepEqual(manifest.outputs, checkOutput(), 'Output file list or SHA256 mismatch');
  assert.equal(manifest.originalProvenanceSha256, hash(readFileSync(join(root, 'originals.json'))));
  assert.deepEqual(manifest.originalPackage, originals.originalPackage);
  assert.deepEqual(manifest.originalLock, originals.originalLock);
  assert.equal(manifest.snapshotLockSha256, hash(readFileSync(join(root, 'package-lock.json'))));
  return manifest;
}
