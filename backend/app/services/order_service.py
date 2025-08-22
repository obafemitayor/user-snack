from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User
from app.models.pizza import Pizza
from app.models.extra import Extra
from app.services.user_service import UserService

class OrderService:
    def __init__(self, database, client=None):
        self.database = database
        self.client = client
    
    async def create_order(self, order_data: dict) -> Order:
        try:
            async with await self.client.start_session() as session:
                async with session.start_transaction():
                    return await self._create_order_using_transaction(order_data, session)
        except Exception as e:
            if "Transaction numbers are only allowed" in str(e) or "IllegalOperation" in str(e):
                return await self._create_order_using_transaction(order_data, None)
            else:
                raise e
    
    async def _create_order_using_transaction(self, order_data: dict, session=None) -> Order:
        user_service = UserService(self.database, self.client)
        user_id, customer_email = await user_service.get_or_create_user(order_data, session)
        processed_items = []
        total_amount = 0

        for item_data in order_data["items"]:
            order_item, item_total = await self._process_order_item(item_data, session)
            processed_items.append(order_item.model_dump())
            total_amount += item_total

        order_dict = {
            "user_id": user_id,
            "customer_name": order_data["customer_name"],
            "customer_email": customer_email,
            "customer_address": order_data.get("customer_address"),
            "customer_phone": order_data.get("customer_phone"),
            "items": processed_items,
            "total_amount": total_amount,
            "status": OrderStatus.PENDING,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await self.database.orders.insert_one(order_dict, session=session)
        order_dict["_id"] = result.inserted_id
        return Order(**order_dict)
    
    async def _process_order_item(self, item_data: dict, session=None) -> tuple[OrderItem, float]:
        pizza = await self.database.pizzas.find_one({"_id": ObjectId(item_data["pizza_id"])}, session=session)
        if not pizza:
            raise ValueError(f"Pizza with id {item_data['pizza_id']} not found")
        
        quantity = item_data.get("quantity", 1)
        item_total = pizza["price"] * quantity
        
        extras, extras_cost = await self._process_extras(item_data.get("extras", []), quantity, session)
        item_total += extras_cost
        
        order_item = OrderItem(
            pizza_id=item_data["pizza_id"],
            pizza_name=pizza["name"],
            pizza_price=pizza["price"],
            extras=extras,
            quantity=quantity,
            item_total=item_total
        )
        
        return order_item, item_total
    
    async def _process_extras(self, extras_data: list, quantity: int, session=None) -> tuple[list, float]:
        extras = []
        extras_cost = 0
        for extra_data in extras_data:
            if isinstance(extra_data, str):
                extra_id = extra_data
                extra_quantity = 1
            else:
                extra_id = extra_data.get("extra_id")
                extra_quantity = extra_data.get("quantity", 1)
            
            extra = await self.database.extras.find_one({"_id": ObjectId(extra_id)}, session=session)
            if extra:
                extras.append({
                    "id": str(extra["_id"]),
                    "name": extra["name"],
                    "price": extra["price"]
                })
                extras_cost += extra["price"] * extra_quantity * quantity
        return extras, extras_cost
    
    async def get_all_orders(self, skip: int = 0, limit: int = 10) -> tuple[List[Order], int]:
        total = await self.database.orders.count_documents({})
        orders = []
        async for order_data in self.database.orders.find().sort("created_at", -1).skip(skip).limit(limit):
            orders.append(Order(**order_data))
        return orders, total
    
    async def get_order_by_id(self, order_id: str) -> Optional[Order]:
        order_data = await self.database.orders.find_one({"_id": ObjectId(order_id)})
        if order_data:
            return Order(**order_data)
        return None
    
    async def get_orders_by_user(self, user_id: str) -> List[Order]:
        orders = []
        async for order_data in self.database.orders.find({"user_id": user_id}).sort("created_at", -1):
            orders.append(Order(**order_data))
        return orders
    
    async def update_order_status(self, order_id: str, status: str) -> Optional[Order]:
        result = await self.database.orders.update_one(
            {"_id": ObjectId(order_id)}, 
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        if result.modified_count == 0:
            return None
        return await self.get_order_by_id(order_id)
