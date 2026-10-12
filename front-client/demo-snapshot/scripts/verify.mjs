import { verify } from './integrity.mjs';

const manifest = verify();
console.log(`Snapshot ${manifest.snapshotVersion}: ${manifest.sources.length} sources and ${manifest.outputs.length} outputs verified.`);
