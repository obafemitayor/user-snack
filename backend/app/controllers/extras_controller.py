from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.extra import Extra
from app.validation.extras.requests import CreateExtraRequest, UpdateExtraRequest
from app.services.extras_service import ExtrasService
from app.utils.pagination import PaginationParams, PaginatedResponse
from bson import ObjectId

router = APIRouter(prefix="/extras", tags=["extras"])

async def get_extras_service():
    from app.main import app
    return ExtrasService(app.mongodb)

@router.post("/", response_model=Extra)
async def create_extra(
    extra_data: CreateExtraRequest,
    extras_service: ExtrasService = Depends(get_extras_service)
):
    try:
        return await extras_service.create_extra(extra_data.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=PaginatedResponse[Extra])
async def get_all_extras(
    pagination: PaginationParams = Depends(),
    extras_service: ExtrasService = Depends(get_extras_service)
):
    extras, total = await extras_service.get_all_extras(pagination.skip, pagination.limit)
    return PaginatedResponse.create(extras, total, pagination.page, pagination.limit)

@router.get("/{extra_id}", response_model=Extra)
async def get_extra(
    extra_id: str,
    extras_service: ExtrasService = Depends(get_extras_service)
):
    if not ObjectId.is_valid(extra_id):
        raise HTTPException(status_code=400, detail="Invalid Id") 
    extra = await extras_service.get_extra_by_id(extra_id)
    if not extra:
        raise HTTPException(status_code=404, detail="Extra not found")
    return extra

@router.put("/{extra_id}", response_model=Extra)
async def update_extra(
    extra_id: str,
    update_data: UpdateExtraRequest,
    extras_service: ExtrasService = Depends(get_extras_service)
):
    if not ObjectId.is_valid(extra_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    extra = await extras_service.update_extra(extra_id, update_data.model_dump(exclude_unset=True))
    if not extra:
        raise HTTPException(status_code=404, detail="Extra not found")
    return extra

@router.delete("/{extra_id}", status_code=204)
async def delete_extra(
    extra_id: str,
    extras_service: ExtrasService = Depends(get_extras_service)
):
    if not ObjectId.is_valid(extra_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    
    # Check if extra exists first
    existing_extra = await extras_service.get_extra_by_id(extra_id)
    if not existing_extra:
        raise HTTPException(status_code=404, detail="Extra not found")
    
    await extras_service.delete_extra(extra_id)
    return None
