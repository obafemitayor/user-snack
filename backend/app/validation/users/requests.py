from pydantic import BaseModel, Field
from typing import Optional

class CreateUserRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User name")
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$', description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="User password")
    phone: Optional[str] = Field(
        None,
        min_length=10,
        max_length=20,
        pattern=r'^\d+$',
        description="Phone number (digits only)",
    )
    address: Optional[str] = Field(None, min_length=1, max_length=500, description="User address")

class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="User name")
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$', description="Valid email address")
    phone: Optional[str] = Field(
        None,
        min_length=10,
        max_length=20,
        pattern=r'^\d+$',
        description="Phone number (digits only)",
    )
    address: Optional[str] = Field(None, min_length=1, max_length=500, description="User address")
