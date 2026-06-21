import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.modules.trip.service import TripService
from backend.modules.trip.repository import TripRepository

@pytest.mark.asyncio
async def test_save_and_load_itinerary(session: AsyncSession):
    repo = TripRepository(session)
    service = TripService(repo)
    
    user_id = str(uuid.uuid4())
    plan = {
        "destination": "Paris",
        "days": [
            {
                "day": 1,
                "timeline": [
                    {"type": "attraction", "name": "Eiffel Tower", "location": {"lat": 48.8584, "lng": 2.2945}}
                ]
            }
        ]
    }
    query = "Plan a 1 day trip to Paris"
    
    plan_id = await repo.save(user_id, plan, query)
    assert plan_id is not None
    
    loaded = await repo.get_by_id(plan_id)
    assert loaded["plan"]["destination"] == "Paris"
    assert loaded["plan"]["days"][0]["timeline"][0]["name"] == "Eiffel Tower"

@pytest.mark.asyncio
async def test_optimize_day(session: AsyncSession):
    repo = TripRepository(session)
    service = TripService(repo)
    
    user_id = str(uuid.uuid4())
    # Sub-optimal order: A -> C -> B
    plan = {
        "destination": "Test City",
        "days": [
            {
                "day": 1,
                "timeline": [
                    {"type": "attraction", "name": "Spot A", "location": {"lat": 0, "lng": 0}, "period": "morning"},
                    {"type": "attraction", "name": "Spot C", "location": {"lat": 2, "lng": 2}, "period": "morning"},
                    {"type": "attraction", "name": "Spot B", "location": {"lat": 1, "lng": 1}, "period": "morning"}
                ]
            }
        ]
    }
    
    plan_id = await repo.save(user_id, plan, "test")
    
    result = await service.optimize_day(user_id, plan_id, 1)
    
    # Check if improved (best sequence should be A -> B -> C)
    assert result["improved"] is True
    optimized_spots = [s["name"] for s in result["optimized_day"]["timeline"]]
    assert optimized_spots == ["Spot A", "Spot B", "Spot C"]
