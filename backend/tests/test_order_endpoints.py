import pytest
from httpx import AsyncClient
from bson import ObjectId

@pytest.mark.asyncio
async def test_create_order(auth_client: AsyncClient):
    """Test creating a new order."""
    # First create test pizza and extras (these are public endpoints)
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test pizza for order",
        "price": "15.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    extra_data = {"name": "Extra Cheese", "price": 2.50}
    extra_response = await auth_client.post("/extras/", json=extra_data)
    extra = extra_response.json()
    
    # Create order
    order_data = {
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "customer_phone": "1234567890",
        "customer_address": "123 Main St, City, State 12345",
        "items": [
            {
                "pizza_id": pizza["_id"],
                "quantity": 2,
                "extras": [extra["_id"]]
            }
        ]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["customer_name"] == order_data["customer_name"]
    assert data["customer_email"] == order_data["customer_email"]
    assert len(data["items"]) == 1
    assert data["status"] == "pending"
    assert data["total_amount"] > 0

@pytest.mark.asyncio
async def test_create_order_guest_user(auth_client: AsyncClient):
    """Test creating an order without email (guest user)."""
    pizza_data = {
        "name": "Guest Pizza",
        "description": "Pizza for guest order",
        "price": "12.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    order_data = {
        "customer_name": "Guest User",
        "customer_email": "guest@example.com",
        "customer_address": "456 Guest St, City, State 67890",
        "items": [
            {
                "pizza_id": pizza["_id"],
                "quantity": 1,
                "extras": []
            }
        ]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["customer_name"] == order_data["customer_name"]
    assert data["customer_email"] == order_data["customer_email"]

@pytest.mark.asyncio
async def test_get_all_orders(auth_client: AsyncClient):
    """Test getting all orders."""
    # Create test pizza
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test pizza",
        "price": "10.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create two orders
    order1_data = {
        "customer_name": "Customer 1",
        "customer_email": "customer1@example.com",
        "customer_address": "Address 1",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    order2_data = {
        "customer_name": "Customer 2",
        "customer_email": "customer2@example.com",
        "customer_address": "Address 2",
        "items": [{"pizza_id": pizza["_id"], "quantity": 2, "extras": []}]
    }
    
    await auth_client.post("/orders/", json=order1_data)
    await auth_client.post("/orders/", json=order2_data)
    
    response = await auth_client.get("/orders/")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["items"]) == 2

@pytest.mark.asyncio
async def test_get_order_by_id(auth_client: AsyncClient):
    """Test getting an order by ID."""
    # Create test pizza
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test pizza",
        "price": "10.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create order
    order_data = {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_address": "Test Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    
    create_response = await auth_client.post("/orders/", json=order_data)
    created_order = create_response.json()
    order_id = created_order["_id"]
    
    response = await auth_client.get(f"/orders/{order_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["_id"] == order_id
    assert data["customer_name"] == order_data["customer_name"]

@pytest.mark.asyncio
async def test_get_nonexistent_order(auth_client: AsyncClient):
    """Test getting a non-existent order."""
    fake_id = str(ObjectId())
    response = await auth_client.get(f"/orders/{fake_id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_create_order_existing_user(auth_client: AsyncClient):
    """Test creating an order for an existing user."""
    # Create test pizza
    pizza_data = {
        "name": "Existing User Pizza",
        "description": "Pizza for existing user test",
        "price": "14.99"
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create first order (creates the user)
    first_order_data = {
        "customer_name": "Existing User",
        "customer_email": "existing@example.com",
        "customer_phone": "1234567890",
        "customer_address": "123 Existing St, City, State 12345",
        "items": [
            {
                "pizza_id": pizza["_id"],
                "quantity": 1,
                "extras": []
            }
        ]
    }
    
    first_response = await auth_client.post("/orders/", json=first_order_data)
    assert first_response.status_code == 200
    first_order = first_response.json()
    user_id = first_order["user_id"]
    
    # Create second order with same email (should use existing user)
    second_order_data = {
        "customer_name": "Existing User",
        "customer_email": "existing@example.com",
        "customer_phone": "1234567890",
        "customer_address": "123 Existing St, City, State 12345",
        "items": [
            {
                "pizza_id": pizza["_id"],
                "quantity": 2,
                "extras": []
            }
        ]
    }
    
    second_response = await auth_client.post("/orders/", json=second_order_data)
    assert second_response.status_code == 200
    second_order = second_response.json()
    
    # Verify both orders use the same user_id
    assert second_order["user_id"] == user_id
    assert second_order["customer_email"] == first_order["customer_email"]
    
    # Verify user has two orders
    user_orders_response = await auth_client.get(f"/users/{user_id}/orders")
    assert user_orders_response.status_code == 200
    user_orders = user_orders_response.json()
    assert len(user_orders) == 2

@pytest.mark.asyncio
async def test_order_with_invalid_pizza(auth_client: AsyncClient):
    """Test creating an order with invalid pizza ID."""
    fake_pizza_id = str(ObjectId())
    
    order_data = {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_address": "Test Address",
        "items": [{"pizza_id": fake_pizza_id, "quantity": 1, "extras": []}]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 400  # Should handle gracefully

# Validation Tests
@pytest.mark.asyncio
async def test_create_order_missing_customer_name(auth_client: AsyncClient):
    """Test creating order without customer name fails validation."""
    order_data = {
        "customer_email": "test@example.com",
        "customer_address": "Test Address",
        "items": [{"pizza_id": str(ObjectId()), "quantity": 1, "extras": []}]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail

@pytest.mark.asyncio
async def test_create_order_invalid_email(auth_client: AsyncClient):
    """Test creating order with invalid email fails validation."""
    order_data = {
        "customer_name": "Test Customer",
        "customer_email": "invalid-email",
        "customer_address": "Test Address",
        "items": [{"pizza_id": str(ObjectId()), "quantity": 1, "extras": []}]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail

@pytest.mark.asyncio
async def test_create_order_invalid_pizza_id_format(auth_client: AsyncClient):
    """Test creating order with invalid pizza ObjectId format fails validation."""
    order_data = {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_address": "Test Address",
        "items": [{"pizza_id": "invalid-id", "quantity": 1, "extras": []}]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail

@pytest.mark.asyncio
async def test_create_order_zero_quantity(auth_client: AsyncClient):
    """Test creating order with zero quantity fails validation."""
    order_data = {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_address": "Test Address",
        "items": [{"pizza_id": str(ObjectId()), "quantity": 0, "extras": []}]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail

@pytest.mark.asyncio
async def test_create_order_invalid_extra_id(auth_client: AsyncClient):
    """Test creating order with invalid extra ObjectId format fails validation."""
    order_data = {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_address": "Test Address",
        "items": [{"pizza_id": str(ObjectId()), "quantity": 1, "extras": ["invalid-extra-id"]}]
    }
    
    response = await auth_client.post("/orders/", json=order_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail

@pytest.mark.asyncio
async def test_get_order_invalid_object_id(auth_client: AsyncClient):
    """Test getting order with invalid ObjectId format fails validation."""
    invalid_id = "invalid-object-id"
    
    response = await auth_client.get(f"/orders/{invalid_id}")
    assert response.status_code == 400
    
    error_detail = response.json()
    assert "Invalid Id" in error_detail["detail"]

@pytest.mark.asyncio
async def test_update_order_status_success(auth_client: AsyncClient):
    """Test successfully updating order status."""
    # Create test pizza first
    pizza_data = {
        "name": "Status Test Pizza",
        "description": "Pizza for status update test",
        "price": "12.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create order
    order_data = {
        "customer_name": "Status Test User",
        "customer_email": "statustest@example.com",
        "customer_address": "Status Test Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    order_response = await auth_client.post("/orders/", json=order_data)
    order = order_response.json()
    order_id = order["_id"]
    
    # Update order status
    status_data = {"status": "preparing"}
    response = await auth_client.put(f"/orders/{order_id}/status", json=status_data)
    assert response.status_code == 200
    
    updated_order = response.json()
    assert updated_order["status"] == "preparing"
    assert updated_order["_id"] == order_id

@pytest.mark.asyncio
async def test_update_order_status_validation_errors(auth_client: AsyncClient):
    """Test order status update with validation errors."""
    # Create test pizza first
    pizza_data = {
        "name": "Validation Test Pizza",
        "description": "Pizza for validation test",
        "price": "12.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create order
    order_data = {
        "customer_name": "Validation Test User",
        "customer_email": "validationtest@example.com",
        "customer_address": "Validation Test Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    order_response = await auth_client.post("/orders/", json=order_data)
    order = order_response.json()
    order_id = order["_id"]
    
    # Test invalid status
    invalid_status_data = {"status": "invalid-status"}
    response = await auth_client.put(f"/orders/{order_id}/status", json=invalid_status_data)
    assert response.status_code == 422
    
    # Test missing status field
    response = await auth_client.put(f"/orders/{order_id}/status", json={})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_update_order_status_invalid_object_id(auth_client: AsyncClient):
    """Test updating order status with invalid ObjectId format."""
    invalid_ids = ["invalid", "123", "not-an-objectid"]
    
    for invalid_id in invalid_ids:
        status_data = {"status": "confirmed"}
        response = await auth_client.put(f"/orders/{invalid_id}/status", json=status_data)
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"

@pytest.mark.asyncio
async def test_update_nonexistent_order_status(auth_client: AsyncClient):
    """Test updating status of non-existent order."""
    fake_id = str(ObjectId())
    status_data = {"status": "delivered"}
    response = await auth_client.put(f"/orders/{fake_id}/status", json=status_data)
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_update_order_status_all_valid_statuses(auth_client: AsyncClient):
    """Test updating order to all valid status values."""
    # Create test pizza first
    pizza_data = {
        "name": "All Status Test Pizza",
        "description": "Pizza for all status test",
        "price": "12.99",
    }
    pizza_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza = pizza_response.json()
    
    # Create order
    order_data = {
        "customer_name": "All Status Test User",
        "customer_email": "allstatustest@example.com",
        "customer_address": "All Status Test Address",
        "items": [{"pizza_id": pizza["_id"], "quantity": 1, "extras": []}]
    }
    order_response = await auth_client.post("/orders/", json=order_data)
    order = order_response.json()
    order_id = order["_id"]
    
    # Test all valid statuses
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    
    for status in valid_statuses:
        status_data = {"status": status}
        response = await auth_client.put(f"/orders/{order_id}/status", json=status_data)
        assert response.status_code == 200
        
        updated_order = response.json()
        assert updated_order["status"] == status
