# Interactive demo snapshot

This is the Phase 0 frozen, independent copy of the on-disk inventory demo.
Production source and production dependencies are not build inputs. The generated
site is checked into `front-client/public/demo`. A normal production build copies
those files as public assets; it does not rebuild this project.

## Refresh and verify

From the repository root in PowerShell:

```powershell
Set-Location front-client\demo-snapshot
npm ci
npm run refresh
npm run verify
```

`npm run build` is an alias for refresh. `npm run verify` needs only Node.js,
not installed packages. Refresh uses this directory's Vite config, disables env
file loading, builds with `/demo/` as its base, and replaces only
`front-client/public/demo`. Review and commit the source, lockfile, and generated
output together. Do not refresh as part of the production build.

`public/demo/snapshot-manifest.json` records schema version 1, snapshot version
1.0.0, every source file's size and SHA256, the snapshot lock SHA256, original
package/lock provenance, and the exact output file list with sizes and SHA256.
Verification rejects missing, extra, or changed files, unpinned direct
dependencies, missing local imports/assets, production API references,
environment inputs, non-namespaced storage calls, and external HTML/CSS resources.
The manifest does not hash itself. This is an integrity check, not a signed
authenticity guarantee.

`originals.json` preserves original paths and SHA256 hashes captured before any
snapshot edits, including uncommitted source. It also records versions resolved
from the original installed packages. Keep this capture unchanged when refreshing.
The snapshot's own npm lockfile pins the complete transitive dependency graph.
No production source, secrets, or env files need to be present to rebuild.

## Routes and behavior

The browser router has basename `/demo`. Inventory is `/demo` or `/demo/`,
favorites are `/demo/favorites`, compare is `/demo/compare`, and details are
`/demo/vehicles/:id`. Welcome/profile is `/demo/welcome`. Hosting must serve
`public/demo/index.html` for these deep links, not the production SPA document.
The parent project owns that hosting fallback.

The copied inventory, filters, search, details, image viewer, bid dialog,
favorites, compare limit, shell, theme, and CSS retain their mock behavior.
Bids remain UI-only, do not charge money, and are not persisted.
Auction dates/countdowns remain the original mock dates and use the current clock.

Join and switch-user work locally. The same welcome UI accepts a name; Join Demo
uses `GUEST22` when blank and retains the reserved-name rule. Browse Inventory
retains its original guest/named browsing behavior. The joined navbar's My Trips
button is now Demo Profile, and Create New Trip is now Join Demo. There is no
backend identity, trip creation, authentication, or production API request.
Switch User removes only the snapshot user; favorites and compare survive.

All browser storage keys use `theblock:demo-snapshot:v1:` followed by `user`,
`favorites`, or `compare`. The snapshot never reads, clears, or migrates
production keys, including `user`, `demo_favorites`, and `demo_compare`.

## External URLs

There is no runtime CDN JavaScript, CSS, or font fetch. The theme uses available
system fonts. Vehicle images retain the original `https://placehold.co/800x600/`
URLs in `src/DataGridDemo.jsx`, with color and `?text=` variants.
That service receives image requests. All other visual assets, including the
welcome GIF and favicon files, are bundled locally. The original footer's
`https://gh.io/gfb-copilot` link is an ordinary external navigation, not a runtime
dependency. No analytics or telemetry is added.
