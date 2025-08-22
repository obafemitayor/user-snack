from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.services.user_service import UserService
from app.services.order_service import OrderService
from app.models.user import User
from app.models.order import Order
from app.validation.users.requests import CreateUserRequest, UpdateUserRequest
from app.utils.pagination import PaginationParams, PaginatedResponse
from bson import ObjectId
import re

router = APIRouter(prefix="/users", tags=["users"])

async def get_user_service():
    from app.main import app
    return UserService(app.mongodb, app.mongodb_client)

async def get_order_service():
    from app.main import app
    return OrderService(app.mongodb, app.mongodb_client)

@router.get("/{user_id}/orders", response_model=List[Order])
async def get_user_orders(
    user_id: str, 
    user_service: UserService = Depends(get_user_service),
    order_service: OrderService = Depends(get_order_service)
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid Id") 
    try:
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        orders = await order_service.get_orders_by_user(user_id)
        return orders
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, user_service: UserService = Depends(get_user_service)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    try:
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=PaginatedResponse[User])
async def get_all_users(
    pagination: PaginationParams = Depends(),
    user_service: UserService = Depends(get_user_service)
):
    try:
        users, total = await user_service.get_all_users(pagination.skip, pagination.limit)
        return PaginatedResponse.create(users, total, pagination.page, pagination.limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/email/{email}", response_model=User)
async def get_user_by_email(email: str, user_service: UserService = Depends(get_user_service)):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    try:
        user = await user_service.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=User)
async def create_user(
    user_data: CreateUserRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return await user_service.create_user(user_data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    update_data: UpdateUserRequest,
    user_service: UserService = Depends(get_user_service)
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    try:
        user = await user_service.update_user(user_id, update_data.model_dump(exclude_unset=True))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    try:
        existing_user = await user_service.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        await user_service.delete_user(user_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
