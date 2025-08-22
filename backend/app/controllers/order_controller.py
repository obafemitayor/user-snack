from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.order import Order, OrderStatus
from app.services.order_service import OrderService
from app.validation.orders.requests import CreateOrderRequest, UpdateOrderStatusRequest
from app.utils.pagination import PaginationParams, PaginatedResponse
from bson import ObjectId

router = APIRouter(prefix="/orders", tags=["orders"])

async def get_order_service():
    from app.main import app
    return OrderService(app.mongodb, app.mongodb_client)

@router.post("/", response_model=Order)
async def place_order(
    order_data: CreateOrderRequest,
    order_service: OrderService = Depends(get_order_service)
):
    try:
        return await order_service.create_order(order_data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=PaginatedResponse[Order])
async def get_all_orders(
    pagination: PaginationParams = Depends(),
    order_service: OrderService = Depends(get_order_service)
):
    orders, total = await order_service.get_all_orders(pagination.skip, pagination.limit)
    return PaginatedResponse.create(orders, total, pagination.page, pagination.limit)

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    order_service: OrderService = Depends(get_order_service)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    order = await order_service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: str,
    status_data: UpdateOrderStatusRequest,
    order_service: OrderService = Depends(get_order_service)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    try:
        order = await order_service.update_order_status(order_id, status_data.status)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

