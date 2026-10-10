# The Block — Backend Phases Plan

Planned 2026-10-09. Decisions captured from design interview rounds 1–3.

## Decision log

| #       | Decision                                                                                                                 | Outcome                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1      | Existing models (User, TheBlock, Favorite, ComparisonItem, `MAX_COMPARISON_ITEMS = 3`) already in [models.py](models.py) | Verify + extend, don't rewrite                                                                                                                  |
| Q1a     | New `bid_tracker` table so users know what they bid on and whether they're winning                                       | Added to Phase 1                                                                                                                                |
| Q2      | No `auction_end` in data, only `auction_start`                                                                           | Add `auction_end` column; constant `AUCTION_DURATION_DAYS = 5` computed from `auction_start` at import                                          |
| Q3/Q18  | TheBlock CRUD scope                                                                                                      | Full CRUD except DELETE (never used); bidding is the real feature                                                                               |
| Q4/Q23  | Comparison tray cap mechanics                                                                                            | `409` when full ("remove one first"), auto-compact positions on delete, add takes lowest free position                                          |
| Q5      | Smart search                                                                                                             | Separate phase (Phase 4), basic sort/filter params in Phase 2                                                                                   |
| Q6/Q11  | Rename "Planventure" → "The Block"                                                                                       | backend + frontend text; collection lives at `back-api/collection/` (committed)                                                                 |
| Q7      | Frontend API wiring                                                                                                      | Out of scope (Phase 5)                                                                                                                          |
| Q8      | API places real bids; updates `current_bid` on the_block                                                                 | BidTracker becomes a real bidding system                                                                                                        |
| Q9      | Winning/losing                                                                                                           | Derived at read time: `my_bid >= current_bid`                                                                                                   |
| Q10/Q16 | Bid history vs latest-only                                                                                               | **Latest-only**: composite PK `(user_id, theblock_id)`, re-bid overwrites `my_bid`                                                              |
| Q15     | bid_tracker FK delete behavior                                                                                           | `ondelete="CASCADE"` on both FKs (matches ComparisonItem)                                                                                       |
| Q19     | Bid validation                                                                                                           | (a) must be `> current_bid` (or `>= starting_bid` if no bids) → 422; (c) reserve checked, accepted but flagged `reserve_met: false` in response |
| Q20     | `current_winner_id` on TheBlock                                                                                          | Yes, Int FK → users.id, nullable, `ondelete="SET NULL"`                                                                                         |
| Q21     | Consecutive bids by same user                                                                                            | Allowed                                                                                                                                         |
| Q22     | Blueprint layout                                                                                                         | Three files: `theblock_routes.py`, `tracking_routes.py`, `bid_routes.py`                                                                        |
| Q14     | Bruno collection                                                                                                         | `back-api/collection/`, committed; negative tests included                                                                                      |
| Q24     | Phase 3 scope (2026-10-09)                                                                                               | Optional. `verify_api.py` is the automated gate; Bruno is only a click-through tool for the real DB, happy path plus two negatives              |
| Q25     | Where live tests may run (2026-10-09)                                                                                    | Never against the dev DB or port 5000. Use a copy of `theblock.db` on port 5001, or the Flask test client                                       |

## Phase 1 — SQLAlchemy models

Already exists (verify, don't rewrite): `User`, `TheBlock`, `Favorite`, `ComparisonItem`, `MAX_COMPARISON_ITEMS = 3`.

New/changed in [models.py](models.py):

- `AUCTION_DURATION_DAYS = 5` constant next to `MAX_COMPARISON_ITEMS`
- `TheBlock`: add `auction_end` (tz-aware DateTime, nullable) and `current_winner_id` (Int FK → `users.id`, `ondelete="SET NULL"`, nullable)
- New `BidTracker` model, table `bid_tracker`:
  - Composite PK: `user_id` (FK → users.id, CASCADE), `theblock_id` (FK → the_block.id, CASCADE)
  - `my_bid` Numeric(12,2), required
  - `created_at`, `updated_at`
  - Latest-bid-only: `POST` on existing pair overwrites `my_bid`
  - Add `bid_entries` relationship on `User` (cascade `all, delete-orphan`)

Supporting scripts:

- [import_vehicles.py](import_vehicles.py): compute `auction_end = auction_start + AUCTION_DURATION_DAYS` **after** `--random-auction` randomization
- [seed_validation.py](seed_validation.py): extend so GUEST1/GUEST2 have bids (one winning, one losing) — makes Phase 3 Bruno tests meaningful without manual setup
- [verify_schema.py](verify_schema.py): add check that bid_tracker composite PK rejects duplicate (user, vehicle)

Verify: `reset_db.py` → `init_db.py` → `import_vehicles.py --random-auction` → `seed_validation.py` → `verify_schema.py`.
Stop for Human verify data such as auction_start and auction_end. bid_tracker, column current_winner_id etc.

## Phase 2 — Blueprints

Status: done and reviewed 2026-10-09. `verify_api.py` passes with no FAIL lines.

Behavior that differs from the spec below, all deliberate:

- Missing or bad `X-User-Id` returns 401, not 400. The header must be ASCII digits.
- Bids outside the auction window return 422 ("Auction has not started." or "Auction has ended."). A vehicle with no `auction_end` stays open.
- Bid `amount` must be finite, above 0, below 10 billion, with at most 2 decimals, else 400.
- `current_bid`, `bid_count` and `current_winner_id` are read-only on the vehicle endpoints. Only `POST /api/bid-tracker` changes them. The API ignores them if sent.
- `POST /api/the-block` defaults `auction_end` to `auction_start + AUCTION_DURATION_DAYS`.
- `NULL` `auction_end` sorts last in `ending_soon` and in the bid list.
- `sort=bid_count` is descending.
- Comparison delete renumbers one row at a time, because the `(user_id, position)` unique constraint fails otherwise.

Known and left alone: every `IntegrityError` on a vehicle write returns the duplicate-VIN message, vehicle number fields are not range-checked, an unknown `sort` is ignored, and datetimes serialize without an offset because SQLite drops it.

Follow [trip_routes.py](trip_routes.py) conventions: prefix on blueprint, `g.current_user_id` scoping, `{"error": msg}` + status codes, private `_to_dict` serializers, `IntegrityError` → rollback. Register all three in [app.py](app.py).

### `theblock_routes.py` — `url_prefix="/api/the-block"`

- `GET ""` — list; query params:
  - `?sort=price_asc|price_desc|bid_count|ending_soon` (price sorts on `current_bid` falling back to `starting_bid`; `ending_soon` = `auction_end` ascending)
  - `?make=`, `?body_style=` filters
  - No pagination (200 records); add later if needed
- `GET /<id>` — detail, includes `current_winner_id`
- `POST ""` — create vehicle; `PUT/PATCH /<id>` — update
- No DELETE

### `tracking_routes.py` — favorites + comparison

- `GET/POST /api/favorites`, `DELETE /api/favorites/<theblock_id>`; optional `PATCH` for `comment`
- `GET/POST /api/comparison`, `DELETE /api/comparison/<theblock_id>`
  - POST takes lowest free `position`
  - `409` when tray has `MAX_COMPARISON_ITEMS`: "Comparison tray is full (max 3). Remove an item first."
  - DELETE auto-compacts remaining positions

### `bid_routes.py` — `url_prefix="/api/bid-tracker"`

- `POST ""` `{theblock_id, amount}`:
  - Validate `amount > current_bid` (or `>= starting_bid` when `bid_count == 0`) → else 422
  - One transaction: upsert `BidTracker` row, `TheBlock.current_bid = amount`, `bid_count += 1`, `current_winner_id = g.current_user_id`
  - Response includes `status: "winning"` and `reserve_met` (false when `reserve_price` set and `amount < reserve_price`)
- `GET ""` — list: `[{ vehicle summary, my_bid, current_bid, bid_count, status, reserve_met }]`, ordered by `auction_end` asc
- `DELETE /<theblock_id>` — removes your tracker row only; does NOT roll back `current_bid`/`bid_count`/`current_winner_id` (no bid retraction in v1)

## Phase 3 — Bruno collection at `back-api/collection/` (optional, rescoped 2026-10-09)

Direction change. `verify_api.py` already covers every negative case this phase listed (401, 409, 422, 404), plus ownership checks, bid edge cases and the bid window. A Bruno collection would repeat that by hand. Keep it only as a way for a human to click through the API against the real seeded database, and keep it small.

Scope:

- `bruno.json` (collection name "theblock") and `environments/local.bru` with `baseUrl = http://localhost:5000` and `userId = 1` (GUEST1)
- Folders `users/`, `the-block/`, `favorites/`, `comparison/`, `bid-tracker/`
- Happy path in order: join, list vehicles (each sort), detail, favorite, compare three, bid, raise the bid, my bids list
- Two negatives worth seeing in a UI: 401 on a bad `X-User-Id`, 409 on the fourth comparison
- Use a vehicle whose `auction_start` is in the past. Seeding randomizes it within 5 days either side of now, so about half the vehicles answer a bid with 422 "Auction has not started."
- A bid cannot be retracted, so click-testing bids changes the dev DB. Rebuild with the Phase 1 chain afterwards.

### Rules for live testing

- Automated checks use the Flask test client and a throwaway DB, as `verify_api.py` does.
- Anything that needs a real server runs on port 5001 against a copy of `theblock.db`. Never mutate the dev DB, and never share port 5000.
- Before starting a server, run `netstat -ano | findstr :5000`. Two LISTENING lines means two servers on one port.
- A server reads `.env` once, at startup. After changing `.env` or rebuilding the DB, stop the old server and start a new one.

### How a human reruns the checks

From `back-api`:

1. `venv\Scripts\python.exe verify_api.py`. Success is every line ending in PASS and exit code 0. Any FAIL line names the broken behavior.
2. To rebuild the dev DB: `reset_db.py`, `init_db.py`, `import_vehicles.py --random-auction`, `seed_validation.py`, `verify_schema.py`, in that order.
3. To restart the dev server: find the old terminal and press Ctrl+C, confirm `netstat -ano | findstr :5000` shows nothing, then run `venv\Scripts\python.exe -m flask --app app run --debug --port 5000`.

### What went wrong on the first Phase 3 attempt

The question was whether Phase 3 is needed, with a request for a quick probe and rerun instructions. The agent answered, then also wrote `verify_live.py`, which nobody asked for, and tried to run it.

Root cause. The agent started its own Flask server on port 5000 while the user's `--debug` server, running since 14:59, already held the port. Windows let both bind, so requests reached the older server. That server returned a Werkzeug debugger page with "no such table: users", most likely because it started with an old database setting and opened the empty `instance/bid.db`. The agent never checked who owned the port. It assumed its own server answered, then tried four theories in turn (working directory, `.env`, an environment variable, a stray `instance` folder). None fit. The debugger page was the clue, because the agent's servers ran with debug off.

Damage check. `theblock.db` is unchanged: 3 users, 9 favorites, 6 comparison items, 2 bid rows, 200 vehicles, 88 with bids. The script crashed before it wrote anything. `instance/bid.db` is a harmless 0-byte file, and what created it is unconfirmed.

`verify_live.py` is unsafe and should be deleted or rewritten to follow the rules above. A bid can't be undone, so each run would permanently change a real vehicle. Its cleanup would delete a seeded favorite when the favorite POST returned 409. It also writes to the DB file directly.

Rules for the next agent:

- Answer the question first. Build only what was asked.
- Check the port before starting a server, and confirm the responder is yours.
- A debugger page in a response means debug mode is on. Compare that with how you started the server.
- Do not run scripts that write against the dev DB.
- After two failed theories, stop and gather evidence instead of trying a third.

## Deferred phases

- **Phase 4** — smart search (free text across make/model/trim, ending-soon shortcuts): own design round
- **Phase 5** — frontend wiring: reconcile `MAX_COMPARE` in [DataGridDemo.jsx](../front-client/src/DataGridDemo.jsx) with backend `MAX_COMPARISON_ITEMS`, replace mock state with API calls
