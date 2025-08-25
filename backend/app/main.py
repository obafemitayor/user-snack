from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from app.controllers.pizza_controller import router as pizza_router
from app.controllers.extras_controller import router as extra_router
from app.controllers.order_controller import router as order_router
from app.controllers.user_controller import router as user_router
from app.controllers.auth_controller import router as auth_router
from app.middleware.auth_middleware import JWTAuthMiddleware
from pymongo.collation import Collation

load_dotenv()

app = FastAPI(title="UserSnack API")

# CORS middleware for cross-site request protection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Authentication middleware
app.add_middleware(JWTAuthMiddleware)

# Include routers
app.include_router(auth_router)
app.include_router(pizza_router)
app.include_router(extra_router)
app.include_router(order_router)
app.include_router(user_router)

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    app.mongodb = app.mongodb_client[os.getenv("MONGODB_DB", "usersnack_db")]
    await create_indexes(app.mongodb)

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

def get_database():
    return app.mongodb

@app.get("/")
async def root():
    return {"message": "Welcome to UserSnack API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


async def create_indexes(db):
    """Create required unique and performance indexes."""
    # Case-insensitive unique index on pizzas.name
    pizzas_collation = Collation(locale="en", strength=2)
    await db.pizzas.create_index(
        "name",
        name="uniq_pizzas_name_ci",
        unique=True,
        collation=pizzas_collation,
    )
    # Perf indexes for pizzas
    await db.pizzas.create_index([("available", 1)], name="idx_pizzas_available")
    await db.pizzas.create_index([("created_at", -1)], name="idx_pizzas_created_at_desc")

    # Unique index on extras.name (case-sensitive acceptable)
    await db.extras.create_index("name", name="uniq_extras_name", unique=True)
    # Perf indexes for extras
    await db.extras.create_index([("available", 1)], name="idx_extras_available")
    await db.extras.create_index([("created_at", -1)], name="idx_extras_created_at_desc")

    # Case-insensitive unique index on users.email
    users_collation = Collation(locale="en", strength=2)
    await db.users.create_index(
        "email",
        name="uniq_users_email_ci",
        unique=True,
        collation=users_collation,
    )
    # Perf indexes for users
    await db.users.create_index([("created_at", -1)], name="idx_users_created_at_desc")
    await db.users.create_index([("active", 1)], name="idx_users_active")

    # Perf indexes for orders
    await db.orders.create_index([("user_id", 1)], name="idx_orders_user_id")
    await db.orders.create_index([("created_at", -1)], name="idx_orders_created_at_desc")
