""""""

from __future__ import annotations

import urllib.parse
import uuid

import pytest
from fastapi.testclient import TestClient


# ─── search_city_pois ────────────────────────────────────────

class TestSearchCityPois:
    def test_ [TRANSLATED] (self, monkeypatch):
        from app.providers.amap import poi as poi_mod

        captured = {}

        def fake_get(url):
            captured["url"] = url
            return {"status": "1", "pois": [{"name": " [TRANSLATED] ", "location": "118.77,32.06"}]}

        monkeypatch.setattr(poi_mod, "http_get_json", fake_get)
        out = poi_mod.search_city_pois(" [TRANSLATED] ", "k", keywords=" [TRANSLATED] ", types=" [TRANSLATED] ", offset=8)
        assert out == [{"name": " [TRANSLATED] ", "location": "118.77,32.06"}]

        parsed_url = urllib.parse.urlparse(captured["url"])
        query_params = urllib.parse.parse_qs(parsed_url.query)
        assert query_params["keywords"] == [" [TRANSLATED] "]
        assert query_params["types"] == [" [TRANSLATED] "]
        assert query_params["citylimit"] == ["true"]
        assert query_params["offset"] == ["8"]

    def test_ [TRANSLATED] RuntimeError(self, monkeypatch):
        from app.providers.amap import poi as poi_mod

        monkeypatch.setattr(poi_mod, "http_get_json", lambda url: {"status": "0", "info": "INVALID_KEY"})
        with pytest.raises(RuntimeError, match="INVALID_KEY"):
            poi_mod.search_city_pois(" [TRANSLATED] ", "k", keywords="x", types=" [TRANSLATED] ")



@pytest.fixture()
def client(tmp_path, monkeypatch):
    """"""
    import app.core.database as database

    monkeypatch.setattr(database, "_DB_PATH", tmp_path / "test.db")
    database.init_db()

    import app.api.plan_routes as plan_routes
    monkeypatch.setattr(plan_routes, "get_cached", lambda key: None)
    monkeypatch.setattr(plan_routes, "set_cached", lambda key, value, ttl: None)

    from app.main import app
    return TestClient(app)


def make_auth():
    """"""
    from app.core.auth import create_token

    uid = str(uuid.uuid4())
    return uid, {"Authorization": "Bearer " + create_token(uid)}


# ─── GET /api/poi/search ─────────────────────────────────────

class TestPoiSearch:
    def test_ [TRANSLATED] 401(self, client):
        r = client.get("/api/poi/search", params={"city": " [TRANSLATED] ", "kw": " [TRANSLATED] "})
        assert r.status_code == 401

    def test_ [TRANSLATED] kind [TRANSLATED] 400(self, client):
        _, headers = make_auth()
        r = client.get("/api/poi/search", params={"city": " [TRANSLATED] ", "kw": "x", "kind": "hotel"}, headers=headers)
        assert r.status_code == 400

    def test_attraction [TRANSLATED] (self, client, monkeypatch):
        import app.api.plan_routes as plan_routes

        captured = {}

        def fake_search(city, key, *, keywords, types, offset):
            captured.update(city=city, keywords=keywords, types=types)
            return [{
                "name": " [TRANSLATED] ", "location": "118.77,32.06",
                "biz_ext": {"rating": "4.7", "opentime2": " [TRANSLATED] "},
                "address": " [TRANSLATED] ", "photos": [],
            }]

        monkeypatch.setattr(plan_routes, "search_city_pois", fake_search)
        monkeypatch.setattr(plan_routes, "amap_key", lambda: "fake-key")

        _, headers = make_auth()
        r = client.get("/api/poi/search", params={"city": " [TRANSLATED] ", "kw": " [TRANSLATED] "}, headers=headers)
        assert r.status_code == 200
        assert captured["types"] == " [TRANSLATED] "
        results = r.json()["results"]
        assert results[0]["name"] == " [TRANSLATED] "
        assert results[0]["rating"] == 4.7
        assert results[0]["address"] == " [TRANSLATED] "
        assert results[0]["location"] == {"lng": 118.77, "lat": 32.06}

    def test_restaurant [TRANSLATED] (self, client, monkeypatch):
        import app.api.plan_routes as plan_routes

        captured = {}

        def fake_search(city, key, *, keywords, types, offset):
            captured["types"] = types
            return [{
                "name": " [TRANSLATED] ", "location": "118.78,32.04", "type": " [TRANSLATED] ; [TRANSLATED] ",
                "biz_ext": {"rating": "4.6", "cost": "80"}, "address": " [TRANSLATED] ", "photos": [],
            }]

        monkeypatch.setattr(plan_routes, "search_city_pois", fake_search)
        monkeypatch.setattr(plan_routes, "amap_key", lambda: "fake-key")

        _, headers = make_auth()
        r = client.get("/api/poi/search", params={"city": " [TRANSLATED] ", "kw": " [TRANSLATED] ", "kind": "restaurant"}, headers=headers)
        assert r.status_code == 200
        assert captured["types"] == " [TRANSLATED] "
        results = r.json()["results"]
        assert results[0]["cost"] == "80"

    def test_ [TRANSLATED] 502(self, client, monkeypatch):
        import app.api.plan_routes as plan_routes

        def boom(city, key, *, keywords, types, offset):
            raise RuntimeError(" [TRANSLATED] QUOTA")

        monkeypatch.setattr(plan_routes, "search_city_pois", boom)
        monkeypatch.setattr(plan_routes, "amap_key", lambda: "fake-key")

        _, headers = make_auth()
        r = client.get("/api/poi/search", params={"city": " [TRANSLATED] ", "kw": "x"}, headers=headers)
        assert r.status_code == 502

    def test_ [TRANSLATED] (self, client, monkeypatch):
        import app.api.plan_routes as plan_routes

        called = []
        monkeypatch.setattr(plan_routes, "get_cached", lambda key: [{"name": " [TRANSLATED] "}])
        monkeypatch.setattr(plan_routes, "search_city_pois",
                            lambda *a, **k: called.append(1))

        _, headers = make_auth()
        r = client.get("/api/poi/search", params={"city": " [TRANSLATED] ", "kw": "x"}, headers=headers)
        assert r.status_code == 200
        assert r.json()["results"] == [{"name": " [TRANSLATED] "}]
        assert not called

    def test_ [TRANSLATED] kw [TRANSLATED] 400(self, client):
        _, headers = make_auth()
        r = client.get("/api/poi/search", params={"city": " [TRANSLATED] ", "kw": "x" * 101}, headers=headers)
        assert r.status_code == 400


# ─── PUT /api/plan/{plan_id}/timeline ────────────────────────

def make_plan(uid: str) -> str:
    """"""
    from app.core.database import get_conn
    from app.core.memory import save_itinerary

    plan = {
        "destination": " [TRANSLATED] ", "start_date": "2026-06-10", "end_date": "2026-06-10",
        "days_count": 1,
        "days": [{
            "day": 1, "date": "2026-06-10", "theme": " [TRANSLATED] ",
            "timeline": [
                {"type": "attraction", "name": " [TRANSLATED] ", "start_time": "09:00", "end_time": "11:30",
                 "period": "morning", "location": {"lat": 32.058, "lng": 118.848}},
                {"type": "lunch", "name": " [TRANSLATED] ", "location": {"lat": 32.02, "lng": 118.79}},
                {"type": "attraction", "name": " [TRANSLATED] ", "start_time": "14:00", "end_time": "17:00",
                 "period": "afternoon", "location": {"lat": 32.021, "lng": 118.788}},
            ],
        }],
    }
    with get_conn() as conn:
        return save_itinerary(uid, plan, " [TRANSLATED] ", conn)


class TestSaveTimeline:
    def test_ [TRANSLATED] 401(self, client):
        r = client.put("/api/plan/x/timeline", json={"days": []})
        assert r.status_code == 401

    def test_ [TRANSLATED] 404(self, client):
        _, headers = make_auth()
        r = client.put("/api/plan/ [TRANSLATED] /timeline", json={"days": []}, headers=headers)
        assert r.status_code == 404

    def test_ [TRANSLATED] 403(self, client):
        owner, _ = make_auth()
        pid = make_plan(owner)
        _, other_headers = make_auth()
        r = client.put(f"/api/plan/{pid}/timeline", json={"days": []}, headers=other_headers)
        assert r.status_code == 403

    def test_day [TRANSLATED] 400(self, client):
        uid, headers = make_auth()
        pid = make_plan(uid)
        r = client.put(f"/api/plan/{pid}/timeline",
                       json={"days": [{"day": 9, "timeline": []}]}, headers=headers)
        assert r.status_code == 400

    def test_ [TRANSLATED] type [TRANSLATED] 422(self, client):
        uid, headers = make_auth()
        pid = make_plan(uid)
        r = client.put(f"/api/plan/{pid}/timeline",
                       json={"days": [{"day": 1, "timeline": [{"name": " [TRANSLATED] "}]}]}, headers=headers)
        assert r.status_code == 422

    def test_ [TRANSLATED] name422(self, client):
        uid, headers = make_auth()
        pid = make_plan(uid)
        r = client.put(f"/api/plan/{pid}/timeline",
                       json={"days": [{"day": 1, "timeline": [{"type": "attraction"}]}]}, headers=headers)
        assert r.status_code == 422

    def test_ [TRANSLATED] _ [TRANSLATED] _ [TRANSLATED] (self, client):
        from app.core.database import get_conn
        from app.core.memory import load_itinerary
        from app.planning.helpers import haversine_km

        uid, headers = make_auth()
        pid = make_plan(uid)

        new_timeline = [
            {"type": "attraction", "name": " [TRANSLATED] ", "start_time": "09:00", "end_time": "11:30",
             "period": "morning", "location": {"lat": 32.021, "lng": 118.788},
             "dist_from_prev_km": 999},
            {"type": "lunch", "name": " [TRANSLATED] ", "location": {"lat": 32.02, "lng": 118.79},
             "dist_from_prev_km": 999},
            {"type": "attraction", "name": " [TRANSLATED] ", "start_time": "14:00", "end_time": "17:00",
             "period": "afternoon", "location": {"lat": 32.058, "lng": 118.848}},
        ]
        r = client.put(f"/api/plan/{pid}/timeline",
                       json={"days": [{"day": 1, "timeline": new_timeline}]}, headers=headers)
        assert r.status_code == 200

        saved = r.json()["plan"]["days"][0]["timeline"]
        assert [it["name"] for it in saved] == [" [TRANSLATED] ", " [TRANSLATED] ", " [TRANSLATED] "]
        assert "dist_from_prev_km" not in saved[0]
        expect = round(haversine_km({"lat": 32.021, "lng": 118.788}, {"lat": 32.02, "lng": 118.79}), 2)
        assert saved[1]["dist_from_prev_km"] == expect

        with get_conn() as conn:
            reloaded = load_itinerary(pid, conn)["plan"]
        assert reloaded["days"][0]["timeline"] == saved

    def test_ [TRANSLATED] location [TRANSLATED] 500(self, client):
        uid, headers = make_auth()
        pid = make_plan(uid)
        r = client.put(f"/api/plan/{pid}/timeline", json={"days": [{"day": 1, "timeline": [
            {"type": "attraction", "name": "A", "location": {"lng": 118.0}},
            {"type": "attraction", "name": "B", "location": {"lat": 32.0, "lng": 118.8}},
        ]}]}, headers=headers)
        assert r.status_code == 200
        saved = r.json()["plan"]["days"][0]["timeline"]
        assert "dist_from_prev_km" not in saved[1]
