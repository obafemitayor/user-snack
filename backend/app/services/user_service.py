from typing import List, Optional, Tuple
from bson import ObjectId
from datetime import datetime
from app.models.user import User
import os
import hashlib
import secrets
from pymongo.errors import DuplicateKeyError

class UserService:
    def __init__(self, database, client=None):
        self.database = database
        self.client = client
    
    def get_hashed_password(self, raw_password: str) -> Tuple[str, str]:
        password_salt = secrets.token_hex(16)
        dk = hashlib.pbkdf2_hmac(
            'sha256',
            raw_password.encode('utf-8'),
            bytes.fromhex(password_salt),
            100_000,
            dklen=32,
        )
        return dk.hex(), password_salt
    
    async def create_user(self, user_data: dict) -> User:
        existing_user = await self.get_user_by_email(user_data.get("email"))
        if existing_user:
            raise ValueError("User with this email already exists")
        raw_password = user_data.pop("password", None)
        if raw_password:
            password_hash, password_salt = self.get_hashed_password(raw_password)
            user_data["password_hash"] = password_hash
            user_data["password_salt"] = password_salt
        try:
            result = await self.database.users.insert_one(user_data)
        except DuplicateKeyError:
            raise ValueError("User with this email already exists")
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

    def verify_password(self, raw_password: str, password_hash: str, password_salt: str) -> bool:
        try:
            dk = hashlib.pbkdf2_hmac(
                'sha256',
                raw_password.encode('utf-8'),
                bytes.fromhex(password_salt),
                100_000,
                dklen=32,
            )
            return secrets.compare_digest(dk.hex(), password_hash)
        except Exception:
            return False
    
    async def get_all_users(self, skip: int = 0, limit: int = 10) -> tuple[List[User], int]:
        total = await self.database.users.count_documents({})
        
        users = []
        async for user_data in self.database.users.find().sort("created_at", -1).skip(skip).limit(limit):
            users.append(User(**user_data))
        
        return users, total
    
    async def get_or_create_user(self, order_data: dict, session=None) -> tuple[str, str]:
        email = order_data.get("customer_email")
        existing = await self.get_user_by_email(email)
        if existing:
            return str(existing.id), email
        new_user = await self.create_user({
            "name": order_data["customer_name"],
            "email": email,
            "phone": order_data.get("customer_phone"),
            "address": order_data["customer_address"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "active": True,
        })
        return str(new_user.id), email
    
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
