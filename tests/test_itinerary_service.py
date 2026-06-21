import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.modules.itinerary.service import ItineraryService
from backend.modules.itinerary.repository import ItineraryRepository
from backend.modules.trip.repository import TripRepository
from backend.modules.auth.service import AuthService
from backend.modules.auth.repository import AuthRepository

@pytest.mark.asyncio
async def test_list_history_and_get_itinerary(session: AsyncSession):
    auth_repo = AuthRepository(session)
    auth_service = AuthService(auth_repo)
    trip_repo = TripRepository(session)
    itinerary_repo = ItineraryRepository(session)
    itinerary_service = ItineraryService(itinerary_repo)
    
    username = f"user_{uuid.uuid4().hex[:8]}"
    reg_data = await auth_service.register(username, "pass123")
    user_id = reg_data["user_id"]
    
    # Save a trip
    plan = {"destination": "Tokyo", "days": []}
    plan_id = await trip_repo.save(user_id, plan, "Trip to Tokyo")
    
    # List History
    history = await itinerary_service.get_history(user_id)
    assert len(history) == 1
    assert history[0]["destination"] == "Tokyo"
    
    # Get Detail
    detail = await itinerary_service.get_itinerary(user_id, plan_id)
    assert detail["plan"]["destination"] == "Tokyo"
    
    # Unauthorized Access
    other_uid = str(uuid.uuid4())
    with pytest.raises(PermissionError, match="Access denied"):
        await itinerary_service.get_itinerary(other_uid, plan_id)
