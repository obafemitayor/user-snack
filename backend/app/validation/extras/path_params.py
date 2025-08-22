from pydantic import BaseModel, Field, validator
from bson import ObjectId

class ExtraIdParam(BaseModel):
    extra_id: str = Field(..., description="MongoDB ObjectId for the extra")
    
    @validator('extra_id')
    def validate_object_id(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid ObjectId format')
        return v
