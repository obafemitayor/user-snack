from fastapi import HTTPException


def validate_price(price: str) -> float:
    """Validate and convert price string to float."""
    try:
        price_float = float(price)
        if price_float <= 0:
            raise HTTPException(status_code=422, detail="Price must be greater than 0")
        return price_float
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid price format")


def validate_name(name: str, required: bool = True) -> str:
    """Validate pizza name."""
    if required and (not name or len(name.strip()) == 0):
        raise HTTPException(status_code=422, detail="Name is required")
    if name and len(name) > 100:
        raise HTTPException(status_code=422, detail="Name must be 100 characters or less")
    return name.strip() if name else name


def validate_description(description: str, required: bool = True) -> str:
    """Validate pizza description."""
    if required and (not description or len(description.strip()) == 0):
        raise HTTPException(status_code=422, detail="Description is required")
    if description and len(description) > 500:
        raise HTTPException(status_code=422, detail="Description must be 500 characters or less")
    return description.strip() if description else description


def validate_ingredients(ingredients: str, required: bool = True) -> list[str]:
    """Validate and parse ingredients from comma-separated string."""
    ingredients_list = [ingredient.strip() for ingredient in ingredients.split(",") if ingredient.strip()]
    if required and not ingredients_list:
        raise HTTPException(status_code=422, detail="At least one ingredient is required")
    return ingredients_list


def validate_pizza_request(name: str = None, description: str = None, price: str = None, ingredients: str = None, for_create: bool = True) -> dict:
    """Validate pizza request data and return validated dictionary."""
    data = {}
    
    if name is not None:
        validated_name = validate_name(name, required=for_create)
        if not for_create and len(validated_name) == 0:
            raise HTTPException(status_code=422, detail="Name cannot be empty")
        data["name"] = validated_name
    
    if description is not None:
        validated_description = validate_description(description, required=for_create)
        if not for_create and len(validated_description) == 0:
            raise HTTPException(status_code=422, detail="Description cannot be empty")
        data["description"] = validated_description
    
    if price is not None:
        data["price"] = validate_price(price)
    
    if ingredients is not None:
        validated_ingredients = validate_ingredients(ingredients, required=for_create)
        if not for_create and not validated_ingredients:
            raise HTTPException(status_code=422, detail="At least one ingredient is required")
        data["ingredients"] = validated_ingredients
    
    return data
