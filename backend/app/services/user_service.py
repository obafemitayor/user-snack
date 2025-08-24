from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from app.models.user import User

class UserService:
    def __init__(self, database, client=None):
        self.database = database
        self.client = client
    
    async def create_user(self, user_data: dict) -> User:
        existing_user = await self.get_user_by_email(user_data.get("email"))
        if existing_user:
            raise ValueError("User with this email already exists")
        result = await self.database.users.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return User(**user_data)
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        try:
            user_data = await self.database.users.find_one({"_id": ObjectId(user_id)})
            if user_data:
                return User(**user_data)
            return None
        except Exception:
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        try:
            user_data = await self.database.users.find_one({"email": email})
            if user_data:
                return User(**user_data)
            return None
        except Exception:
            return None
    
    async def get_all_users(self, skip: int = 0, limit: int = 10) -> tuple[List[User], int]:
        total = await self.database.users.count_documents({})
        
        users = []
        async for user_data in self.database.users.find().sort("created_at", -1).skip(skip).limit(limit):
            users.append(User(**user_data))
        
        return users, total
    
    async def get_or_create_user(self, order_data: dict, session=None) -> tuple[str, str]:
        email = order_data.get("customer_email")
        if email:
            user = await self.database.users.find_one({"email": email}, session=session)
            if user:
                return str(user["_id"]), email
        
        generated_email = email or f"guest_{datetime.utcnow().timestamp()}@usersnack.com"
        user_dict = {
            "name": order_data["customer_name"],
            "email": generated_email,
            "phone": order_data.get("customer_phone"),
            "address": order_data["customer_address"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "active": True
        }
        
        result = await self.database.users.insert_one(user_dict, session=session)
        return str(result.inserted_id), generated_email
    
    async def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        await self.database.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": update_data}
        )
        return await self.get_user_by_id(user_id)
    
    async def delete_user(self, user_id: str) -> None:
        await self.database.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": {"active": False}}
        )
