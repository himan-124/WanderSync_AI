""""""

from __future__ import annotations

import sys
import time
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic import BaseModel, Field

from app.llm.deepseek import build_structured_deepseek
from app.planning.helpers import invoke_structured
from app.planning.prompts import MEAL_SYSTEM
from app.planning.schemas import SingleDayMealPick


TRIALS = 30
RETRIES = 3
FOOD_PREF = " [TRANSLATED] "


class _OldDayMealPick(BaseModel):
    day: int = Field(description=" [TRANSLATED] ")
    lunch_name: str = Field(description=" [TRANSLATED] ")
    lunch_reason: str = Field(default="", description=" [TRANSLATED] ")
    lunch_fallback_reason: str = Field(default="", description=" [TRANSLATED] ")
    dinner_name: str = Field(description=" [TRANSLATED] ")
    dinner_reason: str = Field(default="", description=" [TRANSLATED] ")
    dinner_fallback_reason: str = Field(default="", description=" [TRANSLATED] ")

class _OldMealRecommendation(BaseModel):
    picks: list[_OldDayMealPick] = Field(description=" [TRANSLATED] / [TRANSLATED] ")


def _make_candidates(n: int) -> list[dict[str, Any]]:
    """"""
    restaurants = [
        (" [TRANSLATED] ", 4.9, "128", " [TRANSLATED] ; [TRANSLATED] "),
        (" [TRANSLATED] ", 4.8, "88",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.7, "25",  " [TRANSLATED] ; [TRANSLATED] "),
        (" [TRANSLATED] ",   4.7, "65",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.6, "75",  " [TRANSLATED] "),
        (" [TRANSLATED] ", 4.6, "55",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.5, "32",  " [TRANSLATED] "),
        (" [TRANSLATED] ", 4.5, "95",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.4, "72",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.4, "60",  " [TRANSLATED] "),
        (" [TRANSLATED] ", 4.3, "150", " [TRANSLATED] ; [TRANSLATED] "),
        (" [TRANSLATED] ",     4.3, "28",  " [TRANSLATED] "),
        (" [TRANSLATED] ",     4.3, "80",  " [TRANSLATED] ; [TRANSLATED] "),
        (" [TRANSLATED] ",     4.2, "110", " [TRANSLATED] "),
        (" [TRANSLATED] ",     4.2, "75",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.1, "180", " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.1, "45",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.0, "68",  " [TRANSLATED] "),
        (" [TRANSLATED] ",   4.0, "35",  " [TRANSLATED] ; [TRANSLATED] "),
        (" [TRANSLATED] ",   3.9, "42",  " [TRANSLATED] "),
    ]
    return [
        {"name": name, "rating": rating, "cost": cost, "keytag": tag}
        for name, rating, cost, tag in restaurants[:n]
    ]

def _fmt(cands: list[dict]) -> str:
    if not cands:
        return " [TRANSLATED] "
    return "\n".join(
        f"  · {c['name']} [TRANSLATED]  {c['rating']} [TRANSLATED]  {c['cost']} [TRANSLATED]  {c['keytag']} [TRANSLATED] "
        for c in cands
    )


def _prompt_old_2days(n: int = 20) -> str:
    """"""
    cands = _make_candidates(n)
    lines = []
    for day in [1, 2]:
        lines.append(
            f"Day {day}\n"
            f"  [TRANSLATED] A  [TRANSLATED] \n{_fmt(cands)}\n"
            f"  [TRANSLATED] B  [TRANSLATED] \n{_fmt(cands)}"
        )
    return (
        f" [TRANSLATED] {FOOD_PREF}\n\n"
        + "\n\n".join(lines)
        + "\n\n [TRANSLATED] "
    )

def _prompt_new_single_day(n: int) -> str:
    """"""
    cands = _make_candidates(n)
    return (
        f" [TRANSLATED]  1  [TRANSLATED]  |  [TRANSLATED] {FOOD_PREF}\n\n"
        f" [TRANSLATED] A  [TRANSLATED] \n{_fmt(cands)}\n\n"
        f" [TRANSLATED] B  [TRANSLATED] \n{_fmt(cands)}\n\n"
        " [TRANSLATED] "
    )


def _run_trials(
    label: str,
    llm: Any,
    prompt_fn,
    trials: int = TRIALS,
) -> dict:
    successes = 0
    failures  = 0
    latencies = []

    print(f"\n{'='*55}")
    print(f"  {label}  ({trials}  [TRANSLATED] )")
    print(f"{'='*55}")

    for i in range(1, trials + 1):
        t0 = time.time()
        try:
            result = invoke_structured(
                llm,
                [("system", MEAL_SYSTEM), ("human", prompt_fn())],
                retries=RETRIES,
            )
            elapsed = time.time() - t0
            if result is not None:
                successes += 1
                latencies.append(elapsed)
                print(f"  [{i:>2}/{trials}] ✅  [TRANSLATED]   {elapsed:.1f}s")
            else:
                failures += 1
                print(f"  [{i:>2}/{trials}] ❌ None  {elapsed:.1f}s")
        except RuntimeError as e:
            elapsed = time.time() - t0
            failures += 1
            print(f"  [{i:>2}/{trials}] 💥  [TRANSLATED]   {elapsed:.1f}s  {str(e)[:40]}")

    success_rate = successes / trials * 100
    avg_lat = sum(latencies) / len(latencies) if latencies else 0

    print(f"\n   [TRANSLATED]  {successes}/{trials}   [TRANSLATED]  {success_rate:.1f}%   [TRANSLATED]  {avg_lat:.1f}s")
    return {"label": label, "success": successes, "fail": failures,
            "rate": success_rate, "avg_latency": avg_lat}


def main():
    print("\n🧪 DeepSeek  [TRANSLATED] ")
    print(f"    [TRANSLATED]  {TRIALS}  [TRANSLATED] invoke_structured retries={RETRIES}\n")

    llm_old = build_structured_deepseek(_OldMealRecommendation, temperature=0)
    llm_new = build_structured_deepseek(SingleDayMealPick,      temperature=0)

    results = []

    results.append(_run_trials(
        " [TRANSLATED]  A [TRANSLATED] 7 [TRANSLATED] schema + 20 [TRANSLATED] ×2 [TRANSLATED] ",
        llm_old,
        lambda: _prompt_old_2days(n=20),
    ))

    results.append(_run_trials(
        " [TRANSLATED]  B [TRANSLATED] 4 [TRANSLATED] schema + 20 [TRANSLATED] × [TRANSLATED] ",
        llm_new,
        lambda: _prompt_new_single_day(n=20),
    ))

    results.append(_run_trials(
        " [TRANSLATED]  C [TRANSLATED] 4 [TRANSLATED] schema + top10× [TRANSLATED] ",
        llm_new,
        lambda: _prompt_new_single_day(n=10),
    ))

    print(f"\n{'='*55}")
    print("  📊  [TRANSLATED] ")
    print(f"{'='*55}")
    print(f"  {' [TRANSLATED] ':<40} {' [TRANSLATED] ':>7}  {' [TRANSLATED] ':>8}")
    print(f"  {'-'*40} {'-'*7}  {'-'*8}")
    for r in results:
        bar = "█" * int(r["rate"] / 5)
        print(f"  {r['label']:<40} {r['rate']:>6.1f}%  {r['avg_latency']:>6.1f}s  {bar}")

    a, b, c = results
    print(f"\n   [TRANSLATED] → [TRANSLATED] {a['rate']:.1f}% → {c['rate']:.1f}%"
          f" [TRANSLATED] +{c['rate']-a['rate']:.1f}pp [TRANSLATED] ")
    print(f"  schema  [TRANSLATED] A→B [TRANSLATED] {b['rate']-a['rate']:+.1f}pp")
    print(f"   [TRANSLATED] B→C [TRANSLATED]    {c['rate']-b['rate']:+.1f}pp")
    print()


if __name__ == "__main__":
    main()
