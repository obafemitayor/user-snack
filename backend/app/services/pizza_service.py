from typing import List, Optional
from bson import ObjectId
from app.models.pizza import Pizza

class PizzaService:
    def __init__(self, database):
        self.database = database
    
    async def create_pizza(self, pizza_data: dict) -> Pizza:
        pizza_data["available"] = pizza_data.get("available", True)
        result = await self.database.pizzas.insert_one(pizza_data)
        pizza_data["_id"] = result.inserted_id
        return Pizza(**pizza_data)
    
    async def get_all_pizzas(self, skip: int = 0, limit: int = 10) -> tuple[List[Pizza], int]:
        total = await self.database.pizzas.count_documents({"available": True})
        
        pizzas = []
        async for pizza_data in self.database.pizzas.find({"available": True}).skip(skip).limit(limit):
            pizzas.append(Pizza(**pizza_data))
        
        return pizzas, total
    
    async def get_pizza_by_id(self, pizza_id: str) -> Optional[Pizza]:
        pizza_data = await self.database.pizzas.find_one({"_id": ObjectId(pizza_id)})
        if pizza_data:
            return Pizza(**pizza_data)
        return None
    
    async def update_pizza(self, pizza_id: str, update_data: dict) -> Optional[Pizza]:
        await self.database.pizzas.update_one(
            {"_id": ObjectId(pizza_id)}, 
            {"$set": update_data}
        )
        return await self.get_pizza_by_id(pizza_id)
    
    async def delete_pizza(self, pizza_id: str) -> None:
        await self.database.pizzas.update_one(
            {"_id": ObjectId(pizza_id)}, 
            {"$set": {"available": False}}
        )
