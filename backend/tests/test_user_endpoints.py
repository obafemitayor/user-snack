import pytest
from httpx import AsyncClient
from bson import ObjectId

@pytest.mark.asyncio
async def test_get_all_users(auth_client: AsyncClient):
    """Test getting all users."""
    # Create test pizza first
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test pizza",
        "price": "10.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create orders which will create users
    order1_data = {
        "customer_name": "User One",
        "customer_email": "user1@example.com",
        "customer_address": "Address 1",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    order2_data = {
        "customer_name": "User Two",
        "customer_email": "user2@example.com",
        "customer_address": "Address 2",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    
    await auth_client.post("/orders/", json=order1_data)
    await auth_client.post("/orders/", json=order2_data)
    
    response = await auth_client.get("/users/")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["items"]) == 2
    assert data["items"][0]["name"] in ["User One", "User Two"]

@pytest.mark.asyncio
async def test_get_user_by_id(auth_client: AsyncClient):
    """Test getting a user by ID."""
    # Create test pizza first
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test pizza",
        "price": "10.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create order which will create user
    order_data = {
        "customer_name": "Test User",
        "customer_email": "testuser@example.com",
        "customer_address": "Test Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    
    order_response = await auth_client.post("/orders/", json=order_data)
    order = order_response.json()
    user_id = order["user_id"]
    
    response = await auth_client.get(f"/users/{user_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["_id"] == user_id
    assert data["name"] == "Test User"
    assert data["email"] == "testuser@example.com"

@pytest.mark.asyncio
async def test_get_user_by_email(auth_client: AsyncClient):
    """Test getting a user by email."""
    # Create test pizza first
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test pizza",
        "price": "10.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create order which will create user
    order_data = {
        "customer_name": "Email Test User",
        "customer_email": "emailtest@example.com",
        "customer_address": "Email Test Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    
    await auth_client.post("/orders/", json=order_data)
    
    response = await auth_client.get("/users/email/emailtest@example.com")
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Email Test User"
    assert data["email"] == "emailtest@example.com"

@pytest.mark.asyncio
async def test_get_user_orders(auth_client: AsyncClient):
    """Test getting all orders for a specific user."""
    # Create test pizza first
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test pizza",
        "price": "10.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create multiple orders for the same user
    order1_data = {
        "customer_name": "Multi Order User",
        "customer_email": "multiorder@example.com",
        "customer_address": "Multi Order Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    order2_data = {
        "customer_name": "Multi Order User",
        "customer_email": "multiorder@example.com",
        "customer_address": "Multi Order Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 2, "extras": []}]
    }
    
    order1_response = await auth_client.post("/orders/", json=order1_data)
    order2_response = await auth_client.post("/orders/", json=order2_data)
    
    order1 = order1_response.json()
    user_id = order1["user_id"]
    
    response = await auth_client.get(f"/users/{user_id}/orders")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 2
    assert all(order["user_id"] == user_id for order in data)

@pytest.mark.asyncio
async def test_get_nonexistent_user(auth_client: AsyncClient):
    """Test getting a non-existent user."""
    fake_id = str(ObjectId())
    response = await auth_client.get(f"/users/{fake_id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_get_nonexistent_user_by_email(auth_client: AsyncClient):
    """Test getting a non-existent user by email."""
    response = await auth_client.get("/users/email/nonexistent@example.com")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_get_orders_for_nonexistent_user(auth_client: AsyncClient):
    """Test getting orders for a non-existent user."""
    fake_id = str(ObjectId())
    response = await auth_client.get(f"/users/{fake_id}/orders")
    assert response.status_code == 404

# Validation Tests
@pytest.mark.asyncio
async def test_create_user_validation_errors(auth_client: AsyncClient):
    """Test user creation with validation errors."""
    
    # Test missing required fields
    response = await auth_client.post("/users/", json={})
    assert response.status_code == 422
    
    # Test invalid email format
    invalid_data = {
        "name": "Test User",
        "email": "invalid-email",
        "address": "Test Address"
    }
    response = await auth_client.post("/users/", json=invalid_data)
    assert response.status_code == 422
    
    # Test empty name
    invalid_data = {
        "name": "",
        "email": "test@example.com",
        "address": "Test Address"
    }
    response = await auth_client.post("/users/", json=invalid_data)
    assert response.status_code == 422
    
    # Test name too long (over 100 characters)
    invalid_data = {
        "name": "a" * 101,
        "email": "test@example.com",
        "address": "Test Address"
    }
    response = await auth_client.post("/users/", json=invalid_data)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_update_user_validation_errors(auth_client: AsyncClient):
    """Test user update with validation errors."""
    
    # Create a user first
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "address": "Test Address"
    }
    create_response = await auth_client.post("/users/", json=user_data)
    user_id = create_response.json()["_id"]
    
    # Test invalid email update
    response = await auth_client.put(f"/users/{user_id}", json={"email": "invalid-email"})
    assert response.status_code == 422
    
    # Test empty name update
    response = await auth_client.put(f"/users/{user_id}", json={"name": ""})
    assert response.status_code == 422
    
    # Test name too long update
    response = await auth_client.put(f"/users/{user_id}", json={"name": "a" * 101})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_get_user_invalid_object_id(auth_client: AsyncClient):
    """Test user endpoints with invalid ObjectId format."""
    
    invalid_ids = ["invalid", "123", "not-an-objectid"]
    
    for invalid_id in invalid_ids:
        # Test get user with invalid ID
        response = await auth_client.get(f"/users/{invalid_id}")
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"
        
        # Test update user with invalid ID
        response = await auth_client.put(f"/users/{invalid_id}", json={"name": "Updated Name"})
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"
        
        # Test delete user with invalid ID
        response = await auth_client.delete(f"/users/{invalid_id}")
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"
        
        # Test get user orders with invalid ID
        response = await auth_client.get(f"/users/{invalid_id}/orders")
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"

@pytest.mark.asyncio
async def test_get_user_by_email_validation_errors(auth_client: AsyncClient):
    """Test get user by email with invalid email format."""
    
    invalid_emails = ["invalid-email", "test@", "@example.com", "test.example.com"]
    
    for invalid_email in invalid_emails:
        response = await auth_client.get(f"/users/email/{invalid_email}")
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid email format"

@pytest.mark.asyncio
async def test_create_user_success(auth_client: AsyncClient):
    """Test successful user creation."""
    user_data = {
        "name": "New User",
        "email": "newuser@example.com",
        "address": "New Address",
        "phone": "1234567890"
    }
    
    response = await auth_client.post("/users/", json=user_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == user_data["name"]
    assert data["email"] == user_data["email"]
    assert data["address"] == user_data["address"]
    assert data["phone"] == user_data["phone"]
    assert "_id" in data

@pytest.mark.asyncio
async def test_create_user_duplicate_email_conflict(auth_client: AsyncClient):
    """Creating a user with an existing email should return 409 Conflict."""
    user = {
        "name": "Dup User",
        "email": "dup@example.com",
        "address": "Some Address"
    }
    # First creation succeeds
    resp1 = await auth_client.post("/users/", json=user)
    assert resp1.status_code == 200
    # Second creation with same email should fail with 409
    resp2 = await auth_client.post("/users/", json=user)
    assert resp2.status_code == 409
    body = resp2.json()
    assert "detail" in body
    assert "already exists" in body["detail"].lower()

@pytest.mark.asyncio
async def test_update_user_success(auth_client: AsyncClient):
    """Test successful user update."""
    # Create user first
    user_data = {
        "name": "Update User",
        "email": "updateuser@example.com",
        "address": "Update Address"
    }
    create_response = await auth_client.post("/users/", json=user_data)
    user_id = create_response.json()["_id"]
    
    # Update user
    update_data = {"name": "Updated User", "phone": "9876543210"}
    response = await auth_client.put(f"/users/{user_id}", json=update_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Updated User"
    assert data["phone"] == "9876543210"
    assert data["email"] == user_data["email"]  # Should remain unchanged

@pytest.mark.asyncio
async def test_delete_user_success(auth_client: AsyncClient):
    """Test successful user deletion."""
    # Create user first
    user_data = {
        "name": "Delete User",
        "email": "deleteuser@example.com",
        "address": "Delete Address"
    }
    create_response = await auth_client.post("/users/", json=user_data)
    user_id = create_response.json()["_id"]
    
    # Delete user
    response = await auth_client.delete(f"/users/{user_id}")
    assert response.status_code == 204
    assert response.text == ""

@pytest.mark.asyncio
async def test_update_nonexistent_user(auth_client: AsyncClient):
    """Test updating a non-existent user."""
    fake_id = str(ObjectId())
    update_data = {"name": "Updated Name"}
    response = await auth_client.put(f"/users/{fake_id}", json=update_data)
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_delete_nonexistent_user(auth_client: AsyncClient):
    """Test deleting a non-existent user."""
    fake_id = str(ObjectId())
    response = await auth_client.delete(f"/users/{fake_id}")
    assert response.status_code == 404
