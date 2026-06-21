r""""""
from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent.parent))


def _rainy_forecast(city: str, api_key: str) -> list[dict]:
    """"""
    today = date.today()
    return [
        {
            "date":          (today + timedelta(i)).isoformat(),
            "day_weather":   " [TRANSLATED] " if i == 1 else " [TRANSLATED] ",
            "night_weather": " [TRANSLATED] " if i == 1 else " [TRANSLATED] ",
            "day_temp":      "24"  if i == 1 else "32",
            "night_temp":    "18"  if i == 1 else "22",
            "is_bad":        i == 1,
        }
        for i in range(4)
    ]


def run_test():
    start = (date.today() + timedelta(1)).isoformat()
    end   = (date.today() + timedelta(3)).isoformat()
    query = f" [TRANSLATED] 3 [TRANSLATED] {start} [TRANSLATED] {end} [TRANSLATED] "

    with patch("app.providers.weather.amap.fetch_forecast", side_effect=_rainy_forecast):
        from app.planning.graph import build_graph
        from app.planning.state import TravelPlanState
        _app = build_graph()
        init = TravelPlanState(query=query)
        config = {"recursion_limit": 2 * (init.max_review_rounds + 1) + 10}
        result = _app.invoke(init, config=config)
        state = TravelPlanState(**result) if isinstance(result, dict) else result

    print("=" * 60)
    print(" [TRANSLATED] ")
    for w in state.weather_forecast:
        flag = " ⚠️  [TRANSLATED] " if w["is_bad"] else ""
        print(f"  {w['date']}: {w['day_weather']}/{w['night_weather']} {w['day_temp']}°C{flag}")

    print("\n [TRANSLATED] ", state.weather_note or " [TRANSLATED] ")
    print("\n [TRANSLATED] ")
    if state.final_plan:
        for d in state.final_plan["days"]:
            spots = [s["name"] for s in d["timeline"] if s["type"] == "attraction"]
            print(f"  Day{d['day']} ({d['date']}): {spots}")
    else:
        print("   [TRANSLATED] missing_fields =", state.missing_fields, " [TRANSLATED] ")

    print("\nroute_issues [TRANSLATED] ", state.final_plan.get("route_issues") if state.final_plan else [])
    print("approved [TRANSLATED] ",     state.final_plan.get("approved")     if state.final_plan else None)
    print("=" * 60)

    assert len(state.weather_forecast) >= 1, " [TRANSLATED] "
    assert state.weather_forecast[0]["is_bad"] is True, " [TRANSLATED]  1  [TRANSLATED] "
    print("✅  [TRANSLATED] ")


if __name__ == "__main__":
    run_test()
