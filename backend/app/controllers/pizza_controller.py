from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from bson import ObjectId
from app.models.pizza import Pizza
from app.services.pizza_service import PizzaService
from app.services.firebase_service import FirebaseService
from app.utils.pizza_validation import validate_pizza_request
from app.utils.pagination import PaginationParams, PaginatedResponse

router = APIRouter(prefix="/pizzas", tags=["pizzas"])

async def get_pizza_service():
    from app.main import app
    return PizzaService(app.mongodb)

async def get_firebase_service():
    return FirebaseService()

async def upload_image(image: Optional[UploadFile], firebase_service: FirebaseService, data: dict):
    if image:
        image_url = await firebase_service.upload_image(image)
        if image_url:
            data["image_url"] = image_url
        else:
            raise HTTPException(status_code=500, detail="Image upload failed")

@router.post("/", response_model=Pizza)
async def create_pizza(
    name: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    image: Optional[UploadFile] = File(None),
    pizza_service: PizzaService = Depends(get_pizza_service),
    firebase_service: FirebaseService = Depends(get_firebase_service)
):
    try:
        data = validate_pizza_request(name=name, description=description, price=price, for_create=True)
        await upload_image(image, firebase_service, data)
        return await pizza_service.create_pizza(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=PaginatedResponse[Pizza])
async def get_all_pizzas(
    pagination: PaginationParams = Depends(),
    pizza_service: PizzaService = Depends(get_pizza_service)
):
    pizzas, total = await pizza_service.get_all_pizzas(pagination.skip, pagination.limit)
    return PaginatedResponse.create(pizzas, total, pagination.page, pagination.limit)

@router.get("/{pizza_id}", response_model=Pizza)
async def get_pizza(
    pizza_id: str,
    pizza_service: PizzaService = Depends(get_pizza_service)
):
    if not ObjectId.is_valid(pizza_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    
    pizza = await pizza_service.get_pizza_by_id(pizza_id)
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    return pizza

@router.put("/{pizza_id}", response_model=Pizza)
async def update_pizza(
    pizza_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    pizza_service: PizzaService = Depends(get_pizza_service),
    firebase_service: FirebaseService = Depends(get_firebase_service)
):
    if not ObjectId.is_valid(pizza_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    
    try:
        data = validate_pizza_request(name=name, description=description, price=price, for_create=False)
        if not data:
            return
        await upload_image(image, firebase_service, data)
        updated_pizza = await pizza_service.update_pizza(pizza_id, data)
        if not updated_pizza:
            raise HTTPException(status_code=404, detail="Pizza not found")
        return updated_pizza
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{pizza_id}", status_code=204)
async def delete_pizza(
    pizza_id: str,
    pizza_service: PizzaService = Depends(get_pizza_service)
):
    if not ObjectId.is_valid(pizza_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    existing_pizza = await pizza_service.get_pizza_by_id(pizza_id)
    if not existing_pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    await pizza_service.delete_pizza(pizza_id)
    return None
