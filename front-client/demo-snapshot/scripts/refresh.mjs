import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'vite';
import {
  root, output, manifestName, schemaVersion, base, hash,
  checkSources, sourceInventory, checkOutput, verify,
} from './integrity.mjs';

const { pkg, originals } = checkSources();
await build({ configFile: join(root, 'vite.config.js'), mode: 'snapshot', envFile: false });
const manifest = {
  schemaVersion,
  snapshotVersion: pkg.version,
  generatedAt: new Date().toISOString(),
  base,
  originalPackage: originals.originalPackage,
  originalLock: originals.originalLock,
  originalProvenanceSha256: hash(readFileSync(join(root, 'originals.json'))),
  snapshotLockSha256: hash(readFileSync(join(root, 'package-lock.json'))),
  sources: sourceInventory(),
  outputs: checkOutput(),
};
writeFileSync(join(output, manifestName), JSON.stringify(manifest, null, 2) + '\n');
verify();
console.log(`Snapshot ${pkg.version}: ${manifest.outputs.length} output files built and SHA256-verified.`);
