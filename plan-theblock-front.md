# The Block frontend plan

## Goal

Freeze the current interactive mockup as a reference, then wire the production buyer experience to the existing backend in small, testable phases. Production CSS, JavaScript, shared components, and dependency updates must not change the frozen demo.

Phase 0 is complete. Automated/browser checks passed, and the human reviewed the snapshot on October 10, 2026. Keep the frozen demo unchanged. Phases 1a, 1b and 1c (search, sidebar filters, mobile filter drawer) are implemented. Phase 1d details (including Buy Now) are implemented. Phase 1e real bidding is implemented.

## Confirmed decisions

- Phase 0 freezes today's mockup with its own built JavaScript and CSS. Production gets a footer Demo link.
- Keep the interactive `/demo/` available alongside production permanently for comparison in separate browser windows. Frozen means independently built code and assets, not a screenshot or a disabled demo.
- Phase 0 must leave the dashboard untouched. After human approval, production inventory will start from a one-time copy of the demo UI, not an import from the frozen snapshot.
- Demo guest identity, favorites, compare, and bid interactions stay local and mock-only. Demo storage must not read, write, migrate, or clear production identity or tracking state.
- Preserve the demo screens and existing Actions columns. The only intentional snapshot behavior change is replacing backend-dependent user flows with isolated local equivalents.
- Phase 1 includes inventory, search/filter, vehicle details, and real bidding. Bidding comes before favorites and compare.
- Production mobile inventory shows the search bar first, followed by compact vehicle cards. Hide the sidebar behind a Filters button that opens a temporary drawer. Desktop keeps the sidebar and full DataGrid.
- Mobile cards show year/make/model, current bid, mileage, and explicit Details, Favorite and Compare controls. Favorites and Compare stay clearly unavailable until their production phases are wired.
- Use existing MUI components for cards, not the paid DataGrid Pro list view. Desktop and mobile share records, filtering, ordering, pagination and action callbacks.
- Fetch the full inventory and perform search/filtering in React. Do not expand server search or pagination in this phase.
- Hide ended auctions from inventory and default to soonest auction end first.
- Keep upcoming auctions visible, but disable bidding until their start time.
- Put vehicles with no end time after vehicles with a timed end. The backend permits no-end auctions.
- Use stored auction dates exactly. Do not reseed or shift dates to make inventory appear active. An all-closed dataset must show an honest empty state.
- Phase 2 wires favorites and removes only its production Actions column.
- Phase 3 wires comparison and removes only its production Actions column.
- Keep the dedicated heart/compare controls and double-click detail navigation when removing Actions.
- Keep saved closed vehicles visible in Favorites and Compare with a Closed label and bidding disabled. Only Inventory hides closed vehicles.
- Finish with a detailed, step-by-step repository Markdown guide and accurate frontend run instructions.

## Current code and contracts

### React structure

The frontend is under `front-client/src`, not a root-level `src`.

| Area                                           | Current role                                                                         | Production direction                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `main.jsx`, `theme.js`, `index.css`, `App.css` | Shared entry, MUI theme, global CSS                                                  | Production owns these; demo uses frozen copies in its own document        |
| `App.jsx`, `routes/routes.jsx`                 | Wrap every route in UserProvider, DemoProvider, and MainLayout                       | Production routes/providers separate from the static demo                 |
| `layouts/MainLayout.jsx`                       | Shared Navbar/Footer; special sizing for `/demo`                                     | Buyer layout with production navigation and footer                        |
| `layouts/DashboardLayout.jsx`, `pages/*`       | Mostly inherited travel/trip screens                                                 | Add vehicle pages; do not broadly refactor unrelated trip code            |
| `DataGridDemo.jsx`                             | Mock rows, shared VehicleGrid, inventory/favorites/compare/details and local bidding | Frozen reference; seed production components once, then stop importing it |
| `components/inventory/*`                       | Controlled search bar and sidebar filters                                            | Retain their useful interfaces and wire them to production state          |
| `context/DemoContext.jsx`                      | Local favorite/compare ID arrays; max-three compare                                  | Demo-only after separation                                                |
| `context/UserContext.jsx`                      | Stores joined user in `localStorage.user`                                            | Existing production identity mechanism                                    |
| `services/api.jsx`                             | Generic fetch client, localhost base, X-User-Id                                      | Harden only the response/configuration behavior required by wiring        |

The reference is `/demo/compare`. Before Phase 0, `/demo/*` was a route in the production React application and shared its entry, theme, global CSS, layout, navigation, context, and dependencies. Phase 0 now serves an independent snapshot document. A route rename or lazy import alone would not freeze it.

The current VehicleGrid already supports a `showActions` option. Favorites and Compare currently pass true. Reuse the grid in production rather than building three independent tables.

### Backend

| Operation       | Contract                                                 | Relevant behavior                                                                     |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Join guest/user | `POST /users/join`                                       | Returns `{id, name}`; blank name creates a valid guest                                |
| Inventory       | `GET /api/the-block`                                     | Full vehicle array, no pagination; make/body-style filters and limited sort options   |
| Details         | `GET /api/the-block/:id`                                 | Full vehicle or 404                                                                   |
| Place bid       | `POST /api/bid-tracker`                                  | `{theblock_id, amount}`; returns accepted bid/current bid/count/status/reserve result |
| Favorites       | `GET/POST /api/favorites`, `DELETE /api/favorites/:id`   | Tracking records use `theblock_id`; delete returns 204                                |
| Compare         | `GET/POST /api/comparison`, `DELETE /api/comparison/:id` | Ordered tracking records; backend maximum is three; delete returns 204                |

All vehicle and tracking endpoints require a valid numeric `X-User-Id`. Production should use the existing join flow, not a hard-coded database user.

The API client currently always parses JSON, which breaks successful 204 deletes. Existing trip service assumptions about `response.data` should not be copied into the vehicle services.

Vehicle field mismatches include mock mileage versus `odometer_mi`/`odometer_km`, seller versus `selling_dealership`, and title type versus `title_status`. Use one documented mapping boundary and backend IDs throughout.

Auction serialization may omit timezone offsets because SQLite returns naive datetimes. The backend treats these as UTC. Frontend comparisons must follow that same convention instead of interpreting offset-free timestamps in browser-local time.

## Implementation steps

### Phase 0. Freeze the reference first

Deliver only the independent reference in this phase. Keep `/demo` and `/demo/` accessible, preserve interactive inventory, filters, details, mock bidding, favorites and comparison, and support direct loading and refreshing of demo deep links. Compare it with production in separate browser windows; an embedded comparison screen is not required.

1. Inspect the dirty worktree and record the current files used by the mockup. Many frontend files are untracked. Preserve user changes and include the actual on-disk mockup, not an older Git version.
2. Capture baseline desktop/mobile screenshots and smoke behavior for inventory, filters, details, mock bidding, favorites, compare, and guest switching. Use deterministic local demo selections without touching production storage.
3. Create an independently buildable snapshot source under `front-client/demo-snapshot`. Copy the complete required dependency set: mock page/grid code, inventory controls, shell, providers, theme, CSS, and entry document.
4. Give the snapshot its own package manifest and lockfile. It must not import changing `front-client/src` modules or use runtime CDN JavaScript/CSS. Normal production builds must not rebuild the snapshot.
5. Namespace every snapshot storage key, including user identity. Replace only demo welcome/join/switch-user calls with local mock behavior. Switching demo users must not log out production.
6. Build the snapshot once for base `/demo/` and persist the complete HTML/JS/CSS/assets output under `front-client/public/demo`. Include a manifest recording the snapshot version, source/lockfile provenance, expected files and content hashes. Do not publish secrets or environment files.
7. Serve `/demo/` and deep links such as `/demo/compare` and `/demo/vehicles/:id` from the snapshot document. Add a narrowly scoped Vite dev fallback and document equivalent production hosting rules. Prevent the production SPA fallback from intercepting demo paths.
8. Add a normal full-document `Demo` anchor in the production footer. Do not use client router navigation into the production document. Remove the live production `/demo/*` React import once the static snapshot is serving correctly.
9. Verify that a production JS/CSS/theme change does not change the snapshot hashes or render. Confirm the demo works with the API unavailable and makes no production API calls.
10. Document explicit snapshot refresh commands. Refreshing is an intentional operation, never part of `npm run build`. A Git branch alone is not the isolation mechanism.
11. Stop after the automated/browser checks and report their results. The human must approve desktop/mobile appearance and demo behavior before Phase 1 starts. Do not replace the dashboard, wire production inventory, or change production bidding in Phase 0.

Snapshot scope freezes application code and bundled assets. Current vehicle images use external `placehold.co` URLs, so their availability is still an external dependency. Record those URLs in the snapshot notes; do not promise full offline image availability or silently replace the images.

#### Phase 0 completion, October 10, 2026

The human reviewed and accepted the isolated reference. `/demo/` remains interactive and independent of production. Its existing mobile overflow stays frozen; the mobile redesign applies only to production inventory.

- Created independently buildable source in `front-client/demo-snapshot`, exact direct dependency versions and its own lockfile. `originals.json` records the actual on-disk source/package provenance, including pre-existing changes. The copied inventory implementation remains byte-identical.
- Persisted snapshot 1.0.0 in `front-client/public/demo`, with a manifest verifying 31 source inputs and 9 output files. Production builds copy these files without rebuilding them.
- Added `front-client/demo-hosting.js` for narrowly scoped dev/preview routing and `front-client/demo-hosting.test.js` for routes, content types, missing assets, invalid paths, HEAD and method handling. Production hosting rules and refresh commands are documented in the frontend and snapshot READMEs.
- Removed the live production demo route/import. Added a full-document footer Demo link and changed existing navbar demo destinations to full-document links. The dashboard and backend remain untouched.
- Demo storage uses only `theblock:demo-snapshot:v1:user`, `theblock:demo-snapshot:v1:favorites` and `theblock:demo-snapshot:v1:compare`. Prior selections are deliberately not migrated. Local demo join/switch-user flows make no production requests.
- Passed `node --test demo-hosting.test.js`, targeted ESLint and production `npm run build`. Snapshot `npm run verify` passed after production builds, including a temporary production CSS change. Every copied distribution file matched the frozen output; the temporary CSS change was removed and the final build rerun.
- Playwright verified `/demo`, `/demo/`, favorites, compare, welcome and direct vehicle details on dev and built preview. Compare/detail refreshes worked. Missing demo assets returned 404 rather than the production document.
- Browser checks passed for search, title filtering, favorite/compare add/remove, the max-three comparison rejection, accepted mock bidding, named/guest joining and user switching. API requests were blocked during demo checks; none were attempted. A separate disposable browser context confirmed production identity/tracking sentinel keys were unchanged.
- Captured desktop/mobile baseline and snapshot screenshots. The desktop inventory PNGs were byte-identical. Mobile retains the original narrow-screen header overflow and fixed-footer behavior. The human reviewed these limitations and chose to leave the reference unchanged.
- The production footer Demo link successfully loaded only the snapshot scripts.
- Known limitations: external placeholder images remain network-dependent, and Vite reports a large-bundle warning. Mock bids remain UI-only and reset on reload, as before. No Phase 1 work or commits were performed.

### Phase 1a. Establish production structure and API boundaries

1. Add buyer routes for `/inventory` and `/vehicles/:id`, with a consistent entry from the existing home/join flow. Preserve unrelated trip routes unless a direct conflict requires a targeted change.
2. Keep the layouts responsible for navigation, page width, footer, and responsive shell. Keep pages responsible for loading and coordinating screens. Keep HTTP calls in services.
3. Add focused vehicle and bid services using `services/api.jsx`. Use the repository's JavaScript/JSX style and explicit field contracts, not a TypeScript migration.
4. Handle empty 204 responses correctly, preserve status and backend error messages, and make the API base configurable for deployment using the existing client configuration pattern or Vite environment configuration. Support request cancellation where page transitions or user switching can race.
5. Reuse `UserContext` and the existing join endpoint for valid identity. Missing/invalid identity should lead to a clear join/rejoin state. Never fall back to mock rows or a hard-coded guest on API failure.
6. Extract a production `components/inventory/VehicleGrid.jsx` from the current mock implementation. It accepts rows and explicit callbacks/configuration, with no mock dataset, demo context, or HTTP calls.
   Add a mobile card renderer using the same records and callbacks. Keep data fetching, filtering and auction rules outside both renderers.
7. Establish one production inventory data owner/cache for the current user/session. Inventory, details, later favorites, and compare should reuse records and accepted bid updates rather than independently downloading every vehicle.
8. Add the smallest frontend test setup needed for date policy, field mapping, API behavior, and grid assertions. There is currently no frontend test runner. Do not add unrelated tooling.

### Phase 1b. Inventory

1. Fetch the full vehicle array once on inventory entry. Provide loading, retryable failure, empty active inventory, and no-filter-match states.
2. Add one shared auction-time helper. Interpret offset-free API times as UTC; respect explicit offsets; handle null end times deliberately. Invalid dates must surface a data error rather than fabricate an active auction.
3. Compute visible inventory from fetched rows: exclude `auction_end <= now`; retain upcoming/no-end auctions; order finite end times ascending and no-end rows last. Use a deterministic tie-breaker.
4. Keep raw records available for direct details and future tracking screens. Do not delete closed records from the cache just because inventory hides them.
5. Update auction visibility/status when time crosses a start/end boundary and when the tab resumes. Avoid per-row timers and avoid a refetch for every clock tick.
6. Render the shared production VehicleGrid on desktop and compact vehicle cards on mobile. Preserve condition styling and pagination. Cards show year/make/model, current bid, mileage and auction status, with explicit Details, Favorite and Compare controls. Details must work by touch and keyboard, without double-clicking.
7. User column sorting may override the initial soonest-ending order. Reset inventory sorting restores the default end-time order.
8. Use the same filtered and ordered records for both layouts. Keep mobile pages bounded through pagination and provide a compact sort control. Changing viewport size must not reset filters, sorting, pagination or tracking state.
   Fresh desktop views start at 25 rows, fresh mobile views at 10. Both allow
   5/10/25; resizing keeps the current size. The frozen demo is unchanged.
9. Keep production navigation, search controls, cards and footer within the mobile viewport. Do not solve overflow by clipping content or shrinking text and touch controls.

### Phase 1c. Search and sidebar filters

1. Reuse the controlled search bar and sidebar filter components in the production pages.
2. Extract the current search/filter behavior into a testable helper that accepts real vehicle fields. Preserve intended field coverage, matching, clear/reset behavior, and filter combinations.
3. Derive filter choices from fetched real records, not the hard-coded demo options. Make/model selection changes must not leave an impossible hidden model filter.
4. Apply filters to the active-inventory result so closed auctions cannot reappear through search or reset. Keep default auction ordering unless the user chooses another grid sort.
5. Keep filter and result counts consistent; reset grid pagination when the result set changes.
6. Do not add server query parameters that the backend does not support. Do not introduce server pagination in this phase.
7. On mobile, render search before results and omit the inline sidebar. A Filters button opens the same filter controls in a temporary MUI drawer. Show active-filter count and a clear/reset action so hidden filters do not silently limit results.
8. Drawer filters and desktop filters use the same state. Closing the drawer preserves selections. Support keyboard focus, Escape/close, focus return to the Filters button, and scrolling within the drawer.

### Phase 1d. Vehicle details

1. Fetch `GET /api/the-block/:id` for direct navigation and refresh. Reuse cached records where useful, but do not require a prior inventory visit.
2. Render backend specs, condition, damage notes, dealership, photos, lot/VIN, title, location, prices, and auction dates through the documented field mapping.
3. Show real upcoming/open/closed auction state and remaining time. Remove production hard-coded "2 Days" values.
4. Closed and upcoming details remain accessible. Bid controls are disabled with an explicit reason. A 404 is a not-found state; network failures get retry, not a mock vehicle.
5. Preserve existing image fallback/accessibility behavior and responsive detail layout.
6. Buy Now (user-approved rule change): buying now wins the auction. `POST /api/bid-tracker/buy-now` with `{theblock_id}` sets `current_bid = buy_now_price` (the winning bid and final price), increments `bid_count`, makes the buyer `current_winner_id`, sets `auction_end` to server now, and records the buyer's tracker row. It is offered only while the auction is open and `current_bid < buy_now_price`; otherwise it returns 422 with the reason, and later bids get "Auction has ended." The details page confirms in a dialog, shows server errors verbatim, then shows "You won this vehicle for $X (final price)." Implemented in Phase 1d.

### Phase 1e. Real bidding

1. Submit `{theblock_id, amount}` to `POST /api/bid-tracker` using the current valid user.
2. Match validation rules: positive finite currency with at most two decimal places and below the backend maximum; if `bid_count == 0`, equality with `starting_bid` is valid; otherwise the amount must exceed `current_bid`.
3. A suggested increment is a convenience, not an invented backend rule. Reserve price is not the bid minimum.
4. Disable duplicate submissions. Show success only after server acceptance. Display 401/404/422 and other backend errors explicitly.
5. Apply accepted current bid/count/reserve/status results to the details view and cached inventory. Refetch as needed when a stale bid is rejected, without losing the useful error message.
6. Recheck auction state after rejection or expiry. The backend remains authoritative even if the browser clock disagrees.
7. Bid tracker deletion is not bid withdrawal. Do not add a retract-bid behavior.
8. A bid at or above `buy_now_price` is an ordinary bid (user decision): the auction continues and Buy Now becomes unavailable. Buy Now itself is the "take the Buy Now price and win" action from Phase 1d.
9. Inventory "Time left" abbreviates minutes: "Ends in <1 min" and "Ends in N min" (N ≤ 59). Hours and days are unchanged.

Implemented in Phase 1e. Bidding happens in a dialog on the details page ("Place bid"), and the inventory updates through the shared catalog cache. Quick amounts (+$250, +$500, +$1,000) are shortcuts, not minimums. Commas are accepted only as thousands separators, so "500,50" is rejected with "Use a period for cents" rather than being read as $50,050. A 404 or 422 keeps the server message visible and refetches the vehicle. The backend is unchanged.

### Phase 2. Favorites

1. Add a favorites service and production tracking state scoped to the current joined user. This state must be independent of snapshot storage.
2. Hydrate `GET /api/favorites` and resolve its `theblock_id` records through cached inventory or a targeted detail fetch if absent.
3. Wire heart add/remove controls and navbar count to POST/DELETE. Initially use confirmed server mutations rather than optimistic success; show pending/error states.
4. Handle duplicate/not-found/identity failures without silently presenting success. Clear or replace user-specific state on user switch and discard stale responses.
5. Build the production Favorites page with the same VehicleGrid and `showActions={false}`. Preserve heart/compare controls and double-click details.
6. Keep saved closed vehicles visible with a closed status and disabled bidding. The hide-closed rule applies to inventory, not stored favorites.
7. Until this phase is complete, production favorites controls must be clearly unavailable rather than modifying demo state.

### Phase 3. Compare

1. Add a comparison service and hydrate ordered `GET /api/comparison` records.
2. Resolve full vehicle rows through the same data owner and preserve server position ordering.
3. Wire compare add/remove and count to POST/DELETE. Enforce max-three UX and handle the server tray-full/duplicate conflicts.
4. Build the production Compare page with the same VehicleGrid and `showActions={false}`. Preserve its dedicated remove-from-comparison control and double-click details.
5. Keep selected closed vehicles available for reference with a closed status and disabled bidding. Do not change the frozen demo.
6. Until this phase is complete, production compare controls must be clearly unavailable, not mock-only actions presented as persistent.

## Verification gates

Run focused checks at each phase before moving to the next.

- Phase 0: original and snapshot visual/interaction checks; direct demo deep-link refresh; API-unavailable behavior; isolated storage; no production runtime imports/assets; identical frozen hashes after production builds and styling changes.
- API: real endpoint paths, X-User-Id, cancellation, preserved errors, successful empty DELETE responses, configurable base URL.
- Inventory/time: nearest end first, exact end boundary hidden, past dates empty, upcoming retained, null ends last, invalid dates surfaced, UTC/no-offset and explicit-offset equivalence, clock boundary/tab-resume updates.
- Search: text matches, each existing filter category, combined filters, make/model dependency, reset, no results, closed auctions never reappearing.
- Grid: one shared production component across screens; backend UUID navigation; expected field formatting; Actions absent only from production Favorites/Compare; accessible non-mouse detail navigation retained.
- Mobile inventory: search precedes paginated cards; sidebar is hidden; Filters drawer opens/closes with correct focus and preserves selections; active-filter count/reset matches results. Verify touch/keyboard Details navigation and no page-level horizontal overflow at 320px and 390px. Desktop retains the full grid/sidebar. Resizing preserves filters, sorting and pagination, and never changes the frozen demo.
- Details/bids: refresh/direct links; loading/error/404; real field output; closed/upcoming disabled bids; equal starting bid accepted; equal current bid rejected; decimal validation; pending duplicate prevention; server errors; accepted bid updates visible across screens.
- Favorites/compare: hydration, add/remove, counts, missing vehicles, 204 deletes, max-three, ordered comparison, user switch isolation, failed mutations retaining honest state.
- Run targeted frontend tests and `npm run build`. Run the relevant lint checks and distinguish pre-existing lint failures from changes introduced by this work.
- Run backend `verify/verify_api.py` only with its throwaway database/test-client setup. Do not reset/reseed the shared dev database or run mutating live verification on port 5000.
- Before executing Python verification, configure the existing backend Python environment and obtain its executable through the environment tools.
- Finish with browser checks on desktop and mobile for both production and the untouched frozen demo.

## Final documentation

Write `docs/frontend-freeze-and-wiring.md` after implementation, with:

1. The snapshot boundary, source/output locations, full-page Demo link, local/deployed deep-link rules, storage keys, dependency provenance, refresh procedure, and asset limitations.
2. A concrete React folder map and responsibilities for layouts, pages, services, contexts/hooks, and the shared grid.
3. Each phase's actual file changes, request/response contracts, state flow, and step-by-step implementation order.
4. Search/filter coverage and auction ordering/visibility/timezone rules, including the honest all-closed state.
5. Bid validation/error handling and the Buy Now flow: Buy Now ends the auction immediately, the buyer wins, and the Buy Now price becomes the winning bid (final price).
6. Favorites/compare persistence, max-three behavior, and exact Actions-column changes.
7. Validation commands, tested scenarios/results, known limitations, and any unresolved backend/deployment requirements.

Phase 0 updated `front-client/README.md` with The Block, run commands, snapshot refresh and hosting rules. Keep it current as production routes and mobile behavior change. Leave the challenge brief intact and link the implementation guide from an appropriate project documentation entry.

## Todos and dependencies

| ID                    | Todo                                                                                    | Prerequisites                             |
| --------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------- |
| freeze-demo           | Completed and human-reviewed on October 10, 2026                                        | None                                      |
| production-foundation | Establishing buyer routes, API handling, data contracts, shared grid, and focused tests | freeze-demo                               |
| wire-inventory        | Wiring inventory with stored-date visibility and default end-time ordering              | production-foundation                     |
| wire-search           | Wiring existing search and sidebar filters to real inventory                            | wire-inventory                            |
| wire-details          | Wiring direct vehicle details and real auction state                                    | production-foundation                     |
| wire-bidding          | Wiring server-confirmed bidding and shared vehicle updates                              | wire-inventory, wire-search, wire-details |
| wire-favorites        | Wiring favorites and removing its production Actions column                             | wire-bidding                              |
| wire-compare          | Wiring comparison and removing its production Actions column                            | wire-favorites                            |
| verify-document       | Verifying the complete experience and writing the detailed guide                        | wire-compare                              |

## Limits and implementation considerations

- This is a buyer prototype, not a production marketplace launch. No seller workflows, payments, checkout, authentication redesign, server-side search expansion, or broad trip-code cleanup.
- Snapshot isolation deliberately duplicates the reference implementation once. Production reuse happens within production, never by sharing mutable source with the frozen demo.
- Freeze before extracting or wiring components so the original reference remains intact.
- Favorites/compare remain lower priority; do not pull their persistence work into Phase 1 merely because the mock grid currently has controls.
- Default phase order is sequential. Search and details can proceed independently after their prerequisites, but the shared grid/data boundary should have one owner to avoid conflicting edits.
- Phase 0 is complete and human-reviewed. No commits or database reset/reseed have been performed; later phases have not started.
