import pytest
import pytest_asyncio
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient
import os
from app.main import app
from jose import jwt
from datetime import datetime, timedelta

# Test database configuration
TEST_MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:password@localhost:27017")
TEST_MONGODB_DB = os.getenv("MONGODB_DB", "usersnack_test_db")

# JWT test configuration
TEST_SECRET_KEY = "test-secret-key-for-testing-only"
TEST_USER_ID = "test-user-123"

def create_test_token(user_id: str = TEST_USER_ID) -> str:
    """Create a mock JWT token for testing."""
    expires_delta = timedelta(minutes=30)
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, TEST_SECRET_KEY, algorithm="HS256")

@pytest_asyncio.fixture
async def test_db():
    """Create test database connection."""
    client = AsyncIOMotorClient(TEST_MONGODB_URL)
    db = client[TEST_MONGODB_DB]
    yield db, client
    # Clean up after tests
    await client.drop_database(TEST_MONGODB_DB)
    client.close()

@pytest_asyncio.fixture
async def client(test_db):
    """Create test client with test database."""
    db, test_client = test_db
    
    # Clean database before each test
    collections = await db.list_collection_names()
    for collection in collections:
        await db[collection].drop()
    
    # Set test environment variables
    os.environ["JWT_SECRET_KEY"] = TEST_SECRET_KEY
        
    # Set up app with test database - use the same client instance
    app.mongodb_client = test_client
    app.mongodb = db
        
    # Override the database dependency
    def override_get_database():
        return db
    
    # Mock Firebase service for tests
    class MockFirebaseService:
        async def upload_image(self, file):
            return "https://mock-firebase-url.com/test-image.jpg"
    
    def override_get_firebase_service():
        return MockFirebaseService()
    
    from app.main import get_database
    from app.controllers.pizza_controller import get_firebase_service
    
    app.dependency_overrides[get_database] = override_get_database
    app.dependency_overrides[get_firebase_service] = override_get_firebase_service
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    # Clean up
    app.dependency_overrides.clear()
    # Clean up app attributes
    if hasattr(app, 'mongodb_client'):
        delattr(app, 'mongodb_client')
    if hasattr(app, 'mongodb'):
        delattr(app, 'mongodb')

@pytest_asyncio.fixture
async def auth_client(client):
    """Create authenticated test client with JWT token."""
    token = create_test_token()
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client