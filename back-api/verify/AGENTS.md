# Verify scripts

Scripts that build, seed and check the backend live in `back-api/verify/`.
Run them from the `back-api` directory with the venv Python.

## Scripts

| Script               | Purpose                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `import_vehicles.py` | Load `data/vehicles.json` into `the_block`. Use `--random-auction` to randomize `auction_start` within 5 days of now. |
| `seed_validation.py` | Seed GUEST1 to GUEST3 with favorites, comparison trays and bids. Idempotent.                                          |
| `verify_schema.py`   | Schema invariants: comparison position uniqueness, bid tracker composite key.                                         |
| `verify_api.py`      | Phase 2 blueprint checks. Uses the Flask test client and a throwaway database.                                        |

## Rebuild the dev database

From `back-api`:

```
venv\Scripts\python.exe reset_db.py
venv\Scripts\python.exe init_db.py
venv\Scripts\python.exe import_vehicles.py --random-auction
venv\Scripts\python.exe verify\seed_validation.py
venv\Scripts\python.exe verify\verify_schema.py
```

## Run the API checks

```
venv\Scripts\python.exe verify\verify_api.py
```

Every line ends in PASS on success. Any FAIL line names the broken behavior.
The exit code is 0 on success, 1 on any failure.
