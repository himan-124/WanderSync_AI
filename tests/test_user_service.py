import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.modules.user.service import UserService
from backend.modules.user.repository import UserRepository
from backend.modules.auth.service import AuthService
from backend.modules.auth.repository import AuthRepository

@pytest.mark.asyncio
async def test_get_and_update_profile(session: AsyncSession):
    auth_repo = AuthRepository(session)
    auth_service = AuthService(auth_repo)
    user_repo = UserRepository(session)
    user_service = UserService(user_repo)
    
    username = f"user_{uuid.uuid4().hex[:8]}"
    reg_data = await auth_service.register(username, "pass123")
    user_id = reg_data["user_id"]
    
    # Initial Profile
    profile = await user_service.get_profile_with_stats(user_id)
    assert profile["trip_count"] == 0
    assert profile["attraction_prefs"] == []
    
    # Update Profile
    update_data = {
        "attraction_prefs": ["Museums", "Parks"],
        "food_prefs": ["Vegan"],
        "habit_prefs": ["Early start"],
        "visited_destinations": ["Paris"]
    }
    updated = await user_service.update_profile(user_id, update_data)
    assert updated["attraction_prefs"] == ["Museums", "Parks"]
    assert updated["food_prefs"] == ["Vegan"]
    assert updated["trip_count"] == 0
