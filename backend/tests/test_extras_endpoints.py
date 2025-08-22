import pytest
from httpx import AsyncClient
from bson import ObjectId

@pytest.mark.asyncio
async def test_create_extra(auth_client: AsyncClient):
    """Test creating a new extra."""
    extra_data = {
        "name": "Extra Cheese",
        "price": 2.50
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == extra_data["name"]
    assert data["price"] == extra_data["price"]
    assert data["available"] == True
    assert "_id" in data

@pytest.mark.asyncio
async def test_get_all_extras(auth_client: AsyncClient):
    """Test getting all extras."""
    extra1 = {"name": "Pepperoni", "price": 3.00}
    extra2 = {"name": "Mushrooms", "price": 2.00}
    
    await auth_client.post("/extras/", json=extra1)
    await auth_client.post("/extras/", json=extra2)
    
    response = await auth_client.get("/extras/")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["items"]) == 2
    assert data["items"][0]["name"] in ["Pepperoni", "Mushrooms"]

@pytest.mark.asyncio
async def test_get_extra_by_id(auth_client: AsyncClient):
    """Test getting an extra by ID."""
    extra_data = {"name": "Olives", "price": 1.50}
    
    create_response = await auth_client.post("/extras/", json=extra_data)
    created_extra = create_response.json()
    extra_id = created_extra["_id"]
    
    response = await auth_client.get(f"/extras/{extra_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == extra_data["name"]
    assert data["_id"] == extra_id

@pytest.mark.asyncio
async def test_update_extra(auth_client: AsyncClient):
    """Test updating an extra."""
    extra_data = {"name": "Bacon", "price": 3.50}
    
    create_response = await auth_client.post("/extras/", json=extra_data)
    created_extra = create_response.json()
    extra_id = created_extra["_id"]
    
    update_data = {"price": 4.00}
    response = await auth_client.put(f"/extras/{extra_id}", json=update_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["price"] == 4.00
    assert data["name"] == "Bacon"

@pytest.mark.asyncio
async def test_delete_extra(auth_client: AsyncClient):
    """Test soft deleting an extra."""
    extra_data = {"name": "Test Extra", "price": 1.00}
    
    create_response = await auth_client.post("/extras/", json=extra_data)
    created_extra = create_response.json()
    extra_id = created_extra["_id"]
    
    response = await auth_client.delete(f"/extras/{extra_id}")
    assert response.status_code == 204
    
    # Verify the extra is no longer available in get_all
    get_all_response = await auth_client.get("/extras/")
    extras = get_all_response.json()
    assert len(extras["items"]) == 0  # Should not include deleted extras

@pytest.mark.asyncio
async def test_get_nonexistent_extra(auth_client: AsyncClient):
    """Test getting a non-existent extra."""
    fake_id = str(ObjectId())
    response = await auth_client.get(f"/extras/{fake_id}")
    assert response.status_code == 404

# Validation Tests
@pytest.mark.asyncio
async def test_create_extra_invalid_name_empty(auth_client: AsyncClient):
    """Test creating extra with empty name fails validation."""
    extra_data = {
        "name": "",
        "price": 2.50
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail
    assert any("name" in str(error).lower() for error in error_detail["detail"])

@pytest.mark.asyncio
async def test_create_extra_invalid_name_too_long(auth_client: AsyncClient):
    """Test creating extra with name too long fails validation."""
    extra_data = {
        "name": "a" * 101,  # Exceeds 100 character limit
        "price": 2.50
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail

@pytest.mark.asyncio
async def test_create_extra_invalid_price_zero(auth_client: AsyncClient):
    """Test creating extra with zero price fails validation."""
    extra_data = {
        "name": "Test Extra",
        "price": 0
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail
    assert any("price" in str(error).lower() for error in error_detail["detail"])

@pytest.mark.asyncio
async def test_create_extra_invalid_price_negative(auth_client: AsyncClient):
    """Test creating extra with negative price fails validation."""
    extra_data = {
        "name": "Test Extra",
        "price": -1.50
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail
    assert any("price" in str(error).lower() for error in error_detail["detail"])

@pytest.mark.asyncio
async def test_create_extra_missing_name(auth_client: AsyncClient):
    """Test creating extra without name fails validation."""
    extra_data = {
        "price": 2.50
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail
    assert any("name" in str(error).lower() for error in error_detail["detail"])

@pytest.mark.asyncio
async def test_create_extra_missing_price(auth_client: AsyncClient):
    """Test creating extra without price fails validation."""
    extra_data = {
        "name": "Test Extra"
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail
    assert any("price" in str(error).lower() for error in error_detail["detail"])

@pytest.mark.asyncio
async def test_create_extra_invalid_price_type(auth_client: AsyncClient):
    """Test creating extra with non-numeric price fails validation."""
    extra_data = {
        "name": "Test Extra",
        "price": "not_a_number"
    }
    
    response = await auth_client.post("/extras/", json=extra_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail

@pytest.mark.asyncio
async def test_update_extra_invalid_price(auth_client: AsyncClient):
    """Test updating extra with invalid price fails validation."""
    # First create a valid extra
    extra_data = {"name": "Test Extra", "price": 2.50}
    create_response = await auth_client.post("/extras/", json=extra_data)
    created_extra = create_response.json()
    extra_id = created_extra["_id"]
    
    # Try to update with invalid price
    update_data = {"price": -5.00}
    response = await auth_client.put(f"/extras/{extra_id}", json=update_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail
    assert any("price" in str(error).lower() for error in error_detail["detail"])

@pytest.mark.asyncio
async def test_update_extra_invalid_name(auth_client: AsyncClient):
    """Test updating extra with invalid name fails validation."""
    # First create a valid extra
    extra_data = {"name": "Test Extra", "price": 2.50}
    create_response = await auth_client.post("/extras/", json=extra_data)
    created_extra = create_response.json()
    extra_id = created_extra["_id"]
    
    # Try to update with empty name
    update_data = {"name": ""}
    response = await auth_client.put(f"/extras/{extra_id}", json=update_data)
    assert response.status_code == 422
    
    error_detail = response.json()
    assert "detail" in error_detail
    assert any("name" in str(error).lower() for error in error_detail["detail"])

@pytest.mark.asyncio
async def test_update_extra_empty_request(auth_client: AsyncClient):
    """Test updating extra with empty request body succeeds (no-op)."""
    # First create a valid extra
    extra_data = {"name": "Test Extra", "price": 2.50}
    create_response = await auth_client.post("/extras/", json=extra_data)
    created_extra = create_response.json()
    extra_id = created_extra["_id"]
    
    # Update with empty body should succeed (no changes)
    update_data = {}
    response = await auth_client.put(f"/extras/{extra_id}", json=update_data)
    assert response.status_code == 200
    
    # Verify data unchanged
    updated_extra = response.json()
    assert updated_extra["name"] == "Test Extra"
    assert updated_extra["price"] == 2.50

# ObjectId Validation Tests
@pytest.mark.asyncio
async def test_get_extra_invalid_object_id(auth_client: AsyncClient):
    """Test getting extra with invalid ObjectId format fails validation."""
    invalid_id = "invalid-object-id"
    
    response = await auth_client.get(f"/extras/{invalid_id}")
    assert response.status_code == 400
    
    error_detail = response.json()
    assert "Invalid Id" in error_detail["detail"]

@pytest.mark.asyncio
async def test_update_extra_invalid_object_id(auth_client: AsyncClient):
    """Test updating extra with invalid ObjectId format fails validation."""
    invalid_id = "invalid-object-id"
    update_data = {"name": "New Name"}
    
    response = await auth_client.put(f"/extras/{invalid_id}", json=update_data)
    assert response.status_code == 400
    
    error_detail = response.json()
    assert "Invalid Id" in error_detail["detail"]

@pytest.mark.asyncio
async def test_delete_extra_invalid_object_id(auth_client: AsyncClient):
    """Test deleting extra with invalid ObjectId format fails validation."""
    invalid_id = "invalid-object-id"
    
    response = await auth_client.delete(f"/extras/{invalid_id}")
    assert response.status_code == 400
    
    error_detail = response.json()
    assert "Invalid Id" in error_detail["detail"]
