from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from bson import ObjectId

class OrderItemRequest(BaseModel):
    pizza_id: str = Field(..., description="MongoDB ObjectId for the pizza")
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    extras: Optional[List[str]] = Field(default=[], description="List of extra ObjectIds")
    
    @field_validator('pizza_id')
    @classmethod
    def validate_pizza_id(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid pizza ObjectId format')
        return v
    
    @field_validator('extras')
    @classmethod
    def validate_extras(cls, v):
        if v:
            for extra_id in v:
                if not ObjectId.is_valid(extra_id):
                    raise ValueError(f'Invalid extra ObjectId format: {extra_id}')
        return v

class CreateOrderRequest(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100, description="Customer name")
    customer_email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$', description="Customer email")
    customer_phone: Optional[str] = Field(
        None,
        min_length=10,
        max_length=20,
        pattern=r'^\d+$',
        description="Customer phone (digits only)",
    )
    customer_address: str = Field(..., min_length=1, max_length=500, description="Customer address")
    items: List[OrderItemRequest] = Field(..., min_length=1, description="Order items")

class UpdateOrderStatusRequest(BaseModel):
    status: str = Field(..., pattern=r'^(pending|confirmed|preparing|ready|delivered|cancelled)$', description="Order status")
