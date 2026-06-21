import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.modules.auth.service import AuthService
from backend.modules.auth.repository import AuthRepository
from backend.core.auth import verify_password

@pytest.mark.asyncio
async def test_register_and_login(session: AsyncSession):
    repo = AuthRepository(session)
    service = AuthService(repo)
    
    username = f"user_{uuid.uuid4().hex[:8]}"
    password = "testpassword123"
    
    # Test Registration
    reg_data = await service.register(username, password)
    assert reg_data["username"] == username
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    
    # Test Login
    login_data = await service.login(username, password)
    assert login_data["username"] == username
    assert "access_token" in login_data
    assert "refresh_token" in login_data
    
    # Test Login with wrong password
    with pytest.raises(ValueError, match="Invalid username or password"):
        await service.login(username, "wrongpassword")

@pytest.mark.asyncio
async def test_duplicate_registration(session: AsyncSession):
    repo = AuthRepository(session)
    service = AuthService(repo)
    
    username = "duplicate_user"
    password = "testpassword123"
    
    await service.register(username, password)
    
    with pytest.raises(ValueError, match="Username already taken"):
        await service.register(username, password)
