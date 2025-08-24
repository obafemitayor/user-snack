import pytest
from httpx import AsyncClient
from bson import ObjectId

@pytest.mark.asyncio
async def test_create_pizza(auth_client: AsyncClient):
    """Test creating a new pizza."""
    pizza_data = {
        "name": "Margherita",
        "description": "Classic pizza with tomato and mozzarella",
        "price": "12.99"
    }
    
    response = await auth_client.post("/pizzas/", data=pizza_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == pizza_data["name"]
    assert data["price"] == 12.99
    assert data["available"] == True
    assert "_id" in data

@pytest.mark.asyncio
async def test_create_pizza_duplicate_name_conflict(auth_client: AsyncClient):
    """Creating a pizza with an existing name should return 409 Conflict."""
    pizza_data = {
        "name": "Duplicate Pie",
        "description": "First instance",
        "price": "9.99",
    }

    # First creation succeeds
    resp1 = await auth_client.post("/pizzas/", data=pizza_data)
    assert resp1.status_code == 200

    # Second creation with same name should fail with 409
    resp2 = await auth_client.post("/pizzas/", data=pizza_data)
    assert resp2.status_code == 409
    body = resp2.json()
    assert "detail" in body
    assert "already exists" in body["detail"].lower()

@pytest.mark.asyncio
async def test_get_all_pizzas(auth_client: AsyncClient):
    """Test getting all pizzas."""
    # Create test pizzas
    pizza1 = {
        "name": "Margherita",
        "description": "Classic pizza",
        "price": "12.99",
    }
    pizza2 = {
        "name": "Pepperoni",
        "description": "Pepperoni pizza",
        "price": "14.99",
    }

    await auth_client.post("/pizzas/", data=pizza1)
    await auth_client.post("/pizzas/", data=pizza2)
    
    response = await auth_client.get("/pizzas/")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["items"]) == 2
    assert data["items"][0]["name"] in ["Margherita", "Pepperoni"]

@pytest.mark.asyncio
async def test_get_pizza_by_id(auth_client: AsyncClient):
    """Test getting a pizza by ID."""
    pizza_data = {
        "name": "Hawaiian",
        "description": "Pizza with ham and pineapple",
        "price": "15.99",
    }

    # Create pizza
    create_response = await auth_client.post("/pizzas/", data=pizza_data)
    created_pizza = create_response.json()
    pizza_id = created_pizza["_id"]
    
    # Get pizza by ID
    response = await auth_client.get(f"/pizzas/{pizza_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == pizza_data["name"]
    assert data["_id"] == pizza_id

@pytest.mark.asyncio
async def test_update_pizza(auth_client: AsyncClient):
    """Test updating a pizza."""
    pizza_data = {
        "name": "Veggie",
        "description": "Vegetarian pizza",
        "price": "13.99",
    }

    # Create pizza
    create_response = await auth_client.post("/pizzas/", data=pizza_data)
    created_pizza = create_response.json()
    pizza_id = created_pizza["_id"]
    
    # Test valid updates
    update_data = {"price": "16.99", "description": "Updated description"}
    response = await auth_client.put(f"/pizzas/{pizza_id}", data=update_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["price"] == 16.99
    assert data["description"] == "Updated description"

@pytest.mark.asyncio
async def test_delete_pizza(auth_client: AsyncClient):
    """Test soft deleting a pizza."""
    pizza_data = {
        "name": "Test Pizza",
        "description": "Pizza to be deleted",
        "price": "10.99",
    }

    # Create pizza
    create_response = await auth_client.post("/pizzas/", data=pizza_data)
    created_pizza = create_response.json()
    pizza_id = created_pizza["_id"]
    
    # Delete pizza
    response = await auth_client.delete(f"/pizzas/{pizza_id}")
    assert response.status_code == 204
    assert response.text == ""

@pytest.mark.asyncio
async def test_get_nonexistent_pizza(auth_client: AsyncClient):
    """Test getting a non-existent pizza."""
    fake_id = str(ObjectId())
    response = await auth_client.get(f"/pizzas/{fake_id}")
    assert response.status_code == 404

# Validation Tests
@pytest.mark.asyncio
async def test_create_pizza_validation_errors(auth_client: AsyncClient):
    """Test pizza creation with validation errors."""
    
    # Test missing required fields
    response = await auth_client.post("/pizzas/", json={})
    assert response.status_code == 422
    
    # Test invalid price (negative)
    invalid_data = {
        "name": "Test Pizza",
        "description": "Test description",
        "price": -5.99,
        "ingredients": ["tomato"]
    }
    response = await auth_client.post("/pizzas/", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid price (zero)
    invalid_data["price"] = 0
    response = await auth_client.post("/pizzas/", json=invalid_data)
    assert response.status_code == 422
    
    # Test empty name
    invalid_data = {
        "name": "",
        "description": "Test description",
        "price": 10.99,
        "ingredients": ["tomato"]
    }
    response = await auth_client.post("/pizzas/", json=invalid_data)
    assert response.status_code == 422
    
    # Test name too long (over 100 characters)
    invalid_data["name"] = "a" * 101
    response = await auth_client.post("/pizzas/", json=invalid_data)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_update_pizza_validation_errors(auth_client: AsyncClient):
    """Test pizza update with validation errors."""
    
    # Create a pizza first
    pizza_data = {
        "name": "Test Pizza",
        "description": "Test description",
        "price": "12.99",
    }
    create_response = await auth_client.post("/pizzas/", data=pizza_data)
    pizza_id = create_response.json()["_id"]
    
    # Test invalid price update
    response = await auth_client.put(f"/pizzas/{pizza_id}", data={"price": "invalid"})
    assert response.status_code == 422
    
    # Test name too long update
    response = await auth_client.put(f"/pizzas/{pizza_id}", data={"name": "a" * 101})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_pizza_invalid_objectid_errors(auth_client: AsyncClient):
    """Test pizza endpoints with invalid ObjectId format."""
    
    invalid_ids = ["invalid", "123", "not-an-objectid"]
    
    for invalid_id in invalid_ids:
        # Test get pizza with invalid ID
        response = await auth_client.get(f"/pizzas/{invalid_id}")
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"
        
        # Test update pizza with invalid ID
        response = await auth_client.put(f"/pizzas/{invalid_id}", data={"price": "15.99"})
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"
        
        # Test delete pizza with invalid ID
        response = await auth_client.delete(f"/pizzas/{invalid_id}")
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Id"

@pytest.mark.asyncio
async def test_update_nonexistent_pizza(auth_client: AsyncClient):
    """Test updating a non-existent pizza."""
    fake_id = str(ObjectId())
    update_data = {"price": "15.99"}
    response = await auth_client.put(f"/pizzas/{fake_id}", data=update_data)
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_delete_nonexistent_pizza(auth_client: AsyncClient):
    """Test deleting a non-existent pizza."""
    fake_id = str(ObjectId())
    response = await auth_client.delete(f"/pizzas/{fake_id}")
    assert response.status_code == 404
