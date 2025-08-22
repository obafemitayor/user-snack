from typing import List, Optional
from bson import ObjectId
from app.models.extra import Extra

class ExtrasService:
    def __init__(self, database):
        self.database = database
    
    async def create_extra(self, extra_data: dict) -> Extra:
        extra_data["available"] = True
        result = await self.database.extras.insert_one(extra_data)
        extra_data["_id"] = result.inserted_id
        return Extra(**extra_data)
    
    async def get_all_extras(self, skip: int = 0, limit: int = 10) -> tuple[List[Extra], int]:
        total = await self.database.extras.count_documents({"available": True})
        extras = []
        async for extra_data in self.database.extras.find({"available": True}).skip(skip).limit(limit):
            extras.append(Extra(**extra_data))
        return extras, total
    
    async def get_extra_by_id(self, extra_id: str) -> Optional[Extra]:
        extra_data = await self.database.extras.find_one({"_id": ObjectId(extra_id)})
        if extra_data:
            return Extra(**extra_data)
        return None
    
    async def update_extra(self, extra_id: str, update_data: dict) -> Optional[Extra]:
        await self.database.extras.update_one(
            {"_id": ObjectId(extra_id)}, 
            {"$set": update_data}
        )
        return await self.get_extra_by_id(extra_id)
    
    async def delete_extra(self, extra_id: str) -> None:
        await self.database.extras.update_one(
            {"_id": ObjectId(extra_id)}, 
            {"$set": {"available": False}}
        )
