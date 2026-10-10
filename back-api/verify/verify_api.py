"""API checks for the Phase 2 blueprints (the-block, favorites, comparison, bid-tracker).

Uses the Flask test client against a throwaway SQLite database — no live server.
Run with the project venv:
    venv/Scripts/python.exe verify_api.py
"""

import os
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(
    tempfile.mkdtemp(prefix="theblock_verify_"), "verify_api.db"
).replace("\\", "/")

from app import app, db  # noqa: E402
from models import AUCTION_DURATION_DAYS, User, TheBlock  # noqa: E402

failures = 0


def check(label, ok):
    global failures
    print(f"{label}: {'PASS' if ok else 'FAIL'}")
    if not ok:
        failures += 1


# Bids are only accepted inside the auction window, so fixtures are built around now.
NOW = datetime.now(timezone.utc).replace(microsecond=0)
BASE = NOW - timedelta(days=1)


def make_vehicle(**overrides):
    data = dict(
        vin=uuid4().hex[:17].upper(),
        year=2021,
        make="Ford",
        model="Escape",
        trim="SE",
        body_style="SUV",
        exterior_color="Blue",
        interior_color="Black",
        engine="1.5L I3",
        transmission="8-speed automatic",
        drivetrain="AWD",
        odometer_km=40000,
        fuel_type="Gasoline",
        condition_grade=4.0,
        condition_report="No major issues.",
        damage_notes=[],
        title_status="Clean",
        province="ON",
        city="Toronto",
        auction_start=BASE,
        auction_end=NOW + timedelta(days=5),
        starting_bid=Decimal("10000"),
        reserve_price=None,
        buy_now_price=None,
        images=[],
        selling_dealership="Verify Motors",
        lot="V1",
        current_bid=None,
        bid_count=0,
    )
    data.update(overrides)
    vehicle = TheBlock(**data)
    db.session.add(vehicle)
    return vehicle


def main():
    with app.app_context():
        db.create_all()
        alice = User(name="ALICE")
        bob = User(name="BOB")
        carol = User(name="CAROL")
        db.session.add_all([alice, bob, carol])

        v1 = make_vehicle(model="Escape", make="Ford", body_style="SUV",
                          starting_bid=Decimal("10000"),
                          auction_end=NOW + timedelta(days=2))
        v2 = make_vehicle(model="Civic", make="Honda", body_style="Sedan",
                          starting_bid=Decimal("5000"), current_bid=Decimal("8000"),
                          bid_count=3, auction_end=NOW + timedelta(days=1))
        v3 = make_vehicle(model="Explorer", make="Ford", body_style="SUV",
                          starting_bid=Decimal("12000"), current_bid=Decimal("15000"),
                          bid_count=5, auction_end=NOW + timedelta(days=4))
        v4 = make_vehicle(model="3", make="Mazda", body_style="Hatchback",
                          starting_bid=Decimal("7000"), reserve_price=Decimal("9000"),
                          auction_end=NOW + timedelta(days=3))
        db.session.commit()

        client = app.test_client()
        h1 = {"X-User-Id": str(alice.id)}
        h2 = {"X-User-Id": str(bob.id)}
        h3 = {"X-User-Id": str(carol.id)}

        def ids(resp):
            return [v["id"] for v in resp.get_json()]

        # --- auth ---
        for url in ("/api/the-block", "/api/favorites", "/api/comparison",
                    "/api/bid-tracker"):
            r = client.get(url)
            check(f"auth: {url} without X-User-Id -> 401", r.status_code == 401)
        for label, value in (("non-numeric", "abc"), ("unknown user", "999999"),
                             ("non-ASCII digit", "\u00b2")):
            r = client.get("/api/favorites", headers={"X-User-Id": value})
            check(f"auth: {label} X-User-Id -> 401", r.status_code == 401)
        r = client.get("/")
        check("auth: home stays public", r.status_code == 200)

        # --- list: sorts and filters ---
        r = client.get("/api/the-block?sort=price_asc", headers=h1)
        check("list sort=price_asc order",
              r.status_code == 200 and ids(r) == [v4.id, v2.id, v1.id, v3.id])

        r = client.get("/api/the-block?sort=price_desc", headers=h1)
        check("list sort=price_desc order",
              r.status_code == 200 and ids(r) == [v3.id, v1.id, v2.id, v4.id])

        r = client.get("/api/the-block?sort=bid_count", headers=h1)
        counts = [v["bid_count"] for v in r.get_json()]
        check("list sort=bid_count order",
              r.status_code == 200 and ids(r)[:2] == [v3.id, v2.id]
              and counts == sorted(counts, reverse=True))

        r = client.get("/api/the-block?sort=ending_soon", headers=h1)
        check("list sort=ending_soon order",
              r.status_code == 200 and ids(r) == [v2.id, v1.id, v4.id, v3.id])

        r = client.get("/api/the-block?make=Ford", headers=h1)
        check("filter make=Ford",
              r.status_code == 200 and set(ids(r)) == {v1.id, v3.id})

        r = client.get("/api/the-block?body_style=Sedan", headers=h1)
        check("filter body_style=Sedan",
              r.status_code == 200 and ids(r) == [v2.id])

        r = client.get("/api/the-block?make=Ford&sort=price_desc", headers=h1)
        check("filter and sort combine",
              r.status_code == 200 and ids(r) == [v3.id, v1.id])

        r = client.get("/api/the-block?make=Nope", headers=h1)
        check("filter with no match -> empty list",
              r.status_code == 200 and r.get_json() == [])

        # --- detail ---
        r = client.get(f"/api/the-block/{v1.id}", headers=h1)
        body = r.get_json()
        check("detail 200 includes current_winner_id",
              r.status_code == 200 and "current_winner_id" in body
              and body["current_winner_id"] is None)

        r = client.get("/api/the-block/no-such-id", headers=h1)
        check("detail unknown id -> 404",
              r.status_code == 404 and "error" in r.get_json())

        # --- create + update round-trip ---
        new_vehicle = {
            "vin": "TESTVIN123456789", "year": 2022, "make": "Subaru",
            "model": "Outback", "trim": "Limited", "body_style": "Wagon",
            "exterior_color": "Green", "interior_color": "Tan",
            "engine": "2.4L H4", "transmission": "CVT", "drivetrain": "AWD",
            "odometer_km": 30000, "fuel_type": "Gasoline", "condition_grade": 4.5,
            "condition_report": "Excellent", "title_status": "Clean",
            "province": "BC", "city": "Vancouver",
            "auction_start": BASE.isoformat(), "starting_bid": 15000,
            "selling_dealership": "Test Subaru", "lot": "B7",
        }
        r = client.post("/api/the-block", json=new_vehicle, headers=h1)
        check("create vehicle -> 201",
              r.status_code == 201 and r.get_json()["make"] == "Subaru")
        new_id = r.get_json()["id"]

        r = client.get(f"/api/the-block/{new_id}", headers=h1)
        check("created vehicle round-trips",
              r.status_code == 200 and r.get_json()["vin"] == "TESTVIN123456789")

        r = client.post("/api/the-block", json=new_vehicle, headers=h1)
        check("duplicate VIN -> 409", r.status_code == 409)

        r = client.patch(f"/api/the-block/{new_id}",
                         json={"odometer_km": 31000}, headers=h1)
        ok = r.status_code == 200 and r.get_json()["odometer_km"] == 31000
        r2 = client.get(f"/api/the-block/{new_id}", headers=h1)
        check("PATCH update persists", ok and r2.get_json()["odometer_km"] == 31000)

        r = client.patch("/api/the-block/no-such-id", json={"lot": "Z"}, headers=h1)
        check("PATCH unknown id -> 404", r.status_code == 404)

        r = client.get(f"/api/the-block/{new_id}", headers=h1)
        body = r.get_json()
        start = datetime.fromisoformat(body["auction_start"])
        end = body["auction_end"] and datetime.fromisoformat(body["auction_end"])
        check("create defaults auction_end to start + AUCTION_DURATION_DAYS",
              end == start + timedelta(days=AUCTION_DURATION_DAYS))

        extra = dict(new_vehicle, vin="EXTRAVIN123456789", lot="B8",
                     current_bid=999999, bid_count=5,
                     auction_end="2026-10-20T00:00:00+00:00")
        r = client.post("/api/the-block", json=extra, headers=h1)
        body = r.get_json()
        check("create ignores current_bid and bid_count",
              r.status_code == 201 and body.get("current_bid") is None
              and body.get("bid_count") == 0)
        check("create keeps an explicit auction_end",
              str(body.get("auction_end", "")).startswith("2026-10-20T00:00:00"))

        r = client.patch(f"/api/the-block/{v1.id}", headers=h2,
                         json={"current_bid": 1, "bid_count": 999,
                               "current_winner_id": alice.id})
        body = r.get_json()
        check("PATCH ignores current_bid, bid_count, current_winner_id",
              r.status_code == 200 and body["current_bid"] is None
              and body["bid_count"] == 0 and body["current_winner_id"] is None)

        r = client.put(f"/api/the-block/{new_id}",
                       json=dict(new_vehicle, make="Saab"), headers=h1)
        check("PUT full replace",
              r.status_code == 200 and r.get_json()["make"] == "Saab")

        partial = {k: val for k, val in new_vehicle.items() if k != "city"}
        r = client.put(f"/api/the-block/{new_id}", json=partial, headers=h1)
        check("PUT missing required field -> 400", r.status_code == 400)

        for label, bad in (
            ("missing field", {k: val for k, val in new_vehicle.items() if k != "vin"}),
            ("wrong type", dict(new_vehicle, vin="BADTYPE000000001", year="2022")),
            ("bad datetime", dict(new_vehicle, vin="BADDATE000000001",
                                  auction_start="not-a-date")),
        ):
            r = client.post("/api/the-block", json=bad, headers=h1)
            check(f"create with {label} -> 400", r.status_code == 400)

        r = client.patch(f"/api/the-block/{new_id}",
                         json={"auction_end": None}, headers=h1)
        r2 = client.get("/api/the-block?sort=ending_soon", headers=h1)
        check("ending_soon puts NULL auction_end last",
              r.status_code == 200 and ids(r2)[-1] == new_id)

        # --- favorites ---
        r = client.post("/api/favorites", json={"theblock_id": v1.id}, headers=h1)
        check("favorite POST -> 201", r.status_code == 201)

        r = client.get("/api/favorites", headers=h1)
        check("favorite GET lists it",
              r.status_code == 200
              and [f["theblock_id"] for f in r.get_json()] == [v1.id])

        r = client.post("/api/favorites", json={"theblock_id": v1.id}, headers=h1)
        check("duplicate favorite -> 409", r.status_code == 409)

        r = client.patch(f"/api/favorites/{v1.id}",
                         json={"comment": "nice"}, headers=h1)
        check("favorite PATCH comment",
              r.status_code == 200 and r.get_json()["comment"] == "nice")

        r = client.get("/api/favorites", headers=h2)
        check("favorites are per user", r.status_code == 200 and r.get_json() == [])

        r = client.delete(f"/api/favorites/{v1.id}", headers=h2)
        check("other user cannot delete my favorite -> 404", r.status_code == 404)

        r = client.post("/api/favorites", json={"theblock_id": "no-such-id"}, headers=h1)
        check("favorite unknown vehicle -> 404", r.status_code == 404)

        r = client.patch(f"/api/favorites/{v1.id}", json={}, headers=h1)
        check("favorite PATCH without comment -> 400", r.status_code == 400)

        r = client.patch(f"/api/favorites/{v3.id}", json={"comment": "x"}, headers=h1)
        check("favorite PATCH missing row -> 404", r.status_code == 404)

        r = client.delete(f"/api/favorites/{v1.id}", headers=h1)
        check("favorite DELETE -> 204", r.status_code == 204)

        r = client.get("/api/favorites", headers=h1)
        check("favorites empty after delete",
              r.status_code == 200 and r.get_json() == [])

        r = client.delete(f"/api/favorites/{v1.id}", headers=h1)
        check("favorite DELETE missing row -> 404", r.status_code == 404)

        # --- comparison tray ---
        positions = []
        for v in (v1, v2, v3):
            r = client.post("/api/comparison", json={"theblock_id": v.id}, headers=h1)
            positions.append((r.status_code, r.get_json().get("position")))
        check("comparison POST x3 -> positions 1-3",
              positions == [(201, 1), (201, 2), (201, 3)])

        r = client.post("/api/comparison", json={"theblock_id": v4.id}, headers=h1)
        check("4th comparison -> 409 exact message",
              r.status_code == 409 and r.get_json().get("error")
              == "Comparison tray is full (max 3). Remove an item first.")

        r = client.delete(f"/api/comparison/{v2.id}", headers=h1)
        ok = r.status_code == 204
        r2 = client.get("/api/comparison", headers=h1)
        tray = [(i["theblock_id"], i["position"]) for i in r2.get_json()]
        check("comparison delete compacts positions",
              ok and tray == [(v1.id, 1), (v3.id, 2)])

        r = client.post("/api/comparison", json={"theblock_id": v4.id}, headers=h1)
        check("comparison re-add takes lowest free position",
              r.status_code == 201 and r.get_json()["position"] == 3)

        r = client.post("/api/comparison", json={"theblock_id": "no-such-id"}, headers=h2)
        check("comparison unknown vehicle -> 404", r.status_code == 404)

        r = client.post("/api/comparison", json={"theblock_id": v1.id}, headers=h2)
        check("other user's tray is independent",
              r.status_code == 201 and r.get_json()["position"] == 1)

        r = client.post("/api/comparison", json={"theblock_id": v1.id}, headers=h2)
        check("duplicate comparison add -> 409",
              r.status_code == 409 and "already" in r.get_json()["error"])

        r = client.delete(f"/api/comparison/{v3.id}", headers=h2)
        check("other user cannot delete my tray item -> 404", r.status_code == 404)

        r = client.delete(f"/api/comparison/{v2.id}", headers=h1)
        check("comparison delete missing item -> 404", r.status_code == 404)

        # Vehicle ids are fixed so both update orders run: position 2 sorting
        # before and after position 3 by id.
        for n in "abc":
            make_vehicle(id=f"cmp-{n}", lot=f"C{n}")
        db.session.commit()

        def tray_of(headers):
            rows = client.get("/api/comparison", headers=headers).get_json()
            return [(row["theblock_id"], row["position"]) for row in rows]

        for label, order in (("pos2 id after pos3 id", ["cmp-c", "cmp-b", "cmp-a"]),
                             ("pos2 id before pos3 id", ["cmp-c", "cmp-a", "cmp-b"])):
            for tid in order:
                client.post("/api/comparison", json={"theblock_id": tid}, headers=h3)
            r = client.delete(f"/api/comparison/{order[0]}", headers=h3)
            if r.status_code != 204:
                db.session.rollback()
            check(f"comparison delete position 1, {label} -> 204", r.status_code == 204)
            check(f"comparison compacts after deleting position 1, {label}",
                  tray_of(h3) == [(order[1], 1), (order[2], 2)])
            for tid in order[1:]:
                client.delete(f"/api/comparison/{tid}", headers=h3)

        # --- bids ---
        v5 = make_vehicle(lot="V5", starting_bid=Decimal("5000"),
                          reserve_price=Decimal("9000"))
        ended = make_vehicle(lot="V6", auction_start=NOW - timedelta(days=10),
                             auction_end=NOW - timedelta(days=5))
        upcoming = make_vehicle(lot="V7", auction_start=NOW + timedelta(days=1),
                                auction_end=NOW + timedelta(days=6))
        db.session.commit()

        def bid_raw(headers, theblock_id, raw_amount):
            body = '{"theblock_id": "%s", "amount": %s}' % (theblock_id, raw_amount)
            return client.post("/api/bid-tracker", data=body,
                               content_type="application/json", headers=headers)

        for label, raw in (("NaN", "NaN"), ("Infinity", "Infinity"),
                           ("-Infinity", "-Infinity"), ("negative", "-5"),
                           ("zero", "0"), ("boolean", "true"), ("string", '"500"'),
                           ("3 decimal places", "8000.555"),
                           ("above column limit", "1e30")):
            r = bid_raw(h1, v5.id, raw)
            check(f"bid amount {label} -> 400", r.status_code == 400)

        r = client.get(f"/api/the-block/{v5.id}", headers=h1)
        body = r.get_json()
        check("rejected bids leave the vehicle untouched",
              body["current_bid"] is None and body["bid_count"] == 0
              and body["current_winner_id"] is None)

        r = client.post("/api/bid-tracker", json={"amount": 6000}, headers=h1)
        check("bid without theblock_id -> 400", r.status_code == 400)

        r = client.post("/api/bid-tracker", json={"theblock_id": v5.id}, headers=h1)
        check("bid without amount -> 400", r.status_code == 400)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": "no-such-id", "amount": 6000}, headers=h1)
        check("bid on unknown vehicle -> 404", r.status_code == 404)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": ended.id, "amount": 20000}, headers=h1)
        check("bid on ended auction -> 422", r.status_code == 422)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": upcoming.id, "amount": 20000}, headers=h1)
        check("bid on auction not started -> 422", r.status_code == 422)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v4.id, "amount": 6999}, headers=h1)
        check("bid below starting on zero-bid vehicle -> 422", r.status_code == 422)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v4.id, "amount": 8000}, headers=h1)
        body = r.get_json()
        check("first valid bid -> winning, reserve_met False",
              r.status_code == 201 and body["status"] == "winning"
              and body["reserve_met"] is False)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v4.id, "amount": 7000}, headers=h1)
        check("lower subsequent bid -> 422", r.status_code == 422)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v4.id, "amount": 9500}, headers=h2)
        body = r.get_json()
        check("second user outbids -> winning, reserve_met True",
              r.status_code == 201 and body["status"] == "winning"
              and body["reserve_met"] is True)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v2.id, "amount": 9000}, headers=h2)
        check("bob bids on second vehicle -> 201", r.status_code == 201)

        r = client.get("/api/bid-tracker", headers=h1)
        entry = next((e for e in r.get_json() if e["theblock_id"] == v4.id), None)
        check("outbid user's list shows losing",
              entry is not None and entry["status"] == "losing")

        r = client.get(f"/api/the-block/{v4.id}", headers=h1)
        body = r.get_json()
        check("vehicle reflects top bid state",
              body["current_bid"] == 9500 and body["bid_count"] == 2
              and body["current_winner_id"] == bob.id)

        r = client.get("/api/bid-tracker", headers=h2)
        check("bid list ordered by auction_end",
              [e["theblock_id"] for e in r.get_json()] == [v2.id, v4.id])

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": new_id, "amount": 15000}, headers=h2)
        check("open-ended auction accepts a bid", r.status_code == 201)

        r = client.get("/api/bid-tracker", headers=h2)
        check("bid list puts NULL auction_end last",
              [e["theblock_id"] for e in r.get_json()] == [v2.id, v4.id, new_id])

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v4.id, "amount": 10000}, headers=h1)
        check("re-bid raises -> winning",
              r.status_code == 201 and r.get_json()["status"] == "winning")

        r = client.get("/api/bid-tracker", headers=h1)
        entries = r.get_json()
        check("re-bid keeps single tracker row",
              len(entries) == 1 and entries[0]["my_bid"] == 10000
              and entries[0]["status"] == "winning")

        r = client.get(f"/api/the-block/{v4.id}", headers=h1)
        body = r.get_json()
        check("re-bid updates vehicle state",
              body["current_bid"] == 10000 and body["bid_count"] == 3
              and body["current_winner_id"] == alice.id)

        r = client.delete(f"/api/bid-tracker/{v2.id}", headers=h1)
        check("other user cannot delete my tracker row -> 404", r.status_code == 404)

        r = client.get("/api/bid-tracker", headers=h2)
        check("tracker row survives other user's delete",
              v2.id in [e["theblock_id"] for e in r.get_json()])

        r = client.delete(f"/api/bid-tracker/{v4.id}", headers=h1)
        ok = r.status_code == 204
        r2 = client.get("/api/bid-tracker", headers=h1)
        check("delete removes tracker row", ok and r2.get_json() == [])

        r = client.get(f"/api/the-block/{v4.id}", headers=h1)
        body = r.get_json()
        check("vehicle bid state survives tracker delete",
              body["current_bid"] == 10000 and body["bid_count"] == 3
              and body["current_winner_id"] == alice.id)

        r = client.delete(f"/api/bid-tracker/{v4.id}", headers=h1)
        check("delete missing tracker row -> 404", r.status_code == 404)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v1.id, "amount": 10000}, headers=h3)
        check("bid equal to starting_bid on zero-bid vehicle -> 201",
              r.status_code == 201 and r.get_json()["status"] == "winning")

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v1.id, "amount": 10000}, headers=h1)
        check("bid equal to current_bid -> 422", r.status_code == 422)

        r = client.post("/api/bid-tracker",
                        json={"theblock_id": v5.id, "amount": 9000}, headers=h3)
        check("bid equal to reserve_price -> reserve_met True",
              r.status_code == 201 and r.get_json()["reserve_met"] is True)

    return failures


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
