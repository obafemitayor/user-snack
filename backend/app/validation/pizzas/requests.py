from pydantic import BaseModel, Field
from typing import Optional

class CreatePizzaRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Pizza name")
    description: str = Field(..., min_length=1, max_length=500, description="Pizza description")
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    ingredients: list[str] = Field(..., min_length=1, description="List of ingredients")

class UpdatePizzaRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Pizza name")
    description: Optional[str] = Field(None, min_length=1, max_length=500, description="Pizza description")
    price: Optional[float] = Field(None, gt=0, description="Price must be greater than 0")
    ingredients: Optional[list[str]] = Field(None, min_length=1, description="List of ingredients")
