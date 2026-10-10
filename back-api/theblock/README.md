# theblock — Bruno API tests

OpenCollection YAML tests for the Flask API in `../app.py`.

## Run

1. Start the API (from the `back-api` folder):

   ```
   .\venv\Scripts\python.exe app.py
   ```

   It listens on http://localhost:5000 and must be started **from `back-api`** so it uses `back-api/instance/theblock.db` (the seeded DB). If `theblock.db` has no tables/rows:

   ```
   .\venv\Scripts\python.exe init_db.py
   .\venv\Scripts\python.exe import_vehicles.py --random-auction
   ```

2. Run the requests **in order** in Bruno, selecting the `Local` environment:

   | # | Request | What it checks |
   |---|---|---|
   | 1 | Health - database connectivity | `GET /health` → `database: connected` |
   | 2 | Join user (get X-User-Id) | `POST /users/join`, stores `user_id` |
   | 3 | Top 10 auctions ending soon | `GET /api/the-block?sort=ending_soon` — sorted by `auction_end`, each window = `auction_end - auction_start` = 5 days |
   | 4 | Filter listings by make | `GET /api/the-block?make=Ford` — all results match the filter |
   | 5 | Create vehicle - auction window derived | `POST /api/the-block` — server sets `auction_end = auction_start + 5d`; stores `vehicle_id` |
   | 6 | Vehicle detail by id | `GET /api/the-block/{vehicle_id}` |

   Requests 3–6 send `X-User-Id: {{user_id}}` (set by request 2). Without it the API returns 401.

## CLI alternative

```
bru run --env Local
```

(requires `npm i -g @usebruno/cli`).

## Files

- `opencollection.yml` — collection root
- `environments/local.yml` — `host`, `user_id`, `vehicle_id` variables
- `*.yml` — one request per file, tests in `runtime.scripts`
