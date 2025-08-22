from pydantic import BaseModel, Field
from typing import Optional

class CreateExtraRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the extra")
    price: float = Field(..., gt=0, description="Price must be greater than 0")

class UpdateExtraRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Name of the extra")
    price: Optional[float] = Field(None, gt=0, description="Price must be greater than 0")
