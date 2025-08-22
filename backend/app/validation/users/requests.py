from pydantic import BaseModel, Field
from typing import Optional

class CreateUserRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User name")
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$', description="Valid email address")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Phone number")
    address: Optional[str] = Field(None, min_length=1, max_length=500, description="User address")

class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="User name")
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$', description="Valid email address")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Phone number")
    address: Optional[str] = Field(None, min_length=1, max_length=500, description="User address")
