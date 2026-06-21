import pytest
import os
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.database import get_session
from backend.core.env import settings

# Register models
from backend.models import user, itinerary # noqa: F401

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_app.db"

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()
    if os.path.exists("./test_app.db"):
        try:
            os.remove("./test_app.db")
        except PermissionError:
            pass

@pytest.fixture
async def session(engine) -> AsyncGenerator[AsyncSession, None]:
    async_session_maker = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session_maker() as session:
        yield session

@pytest.fixture
def client(session: AsyncSession):
    def override_get_session():
        yield session
    
    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
