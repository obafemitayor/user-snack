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

load_dotenv()

app = FastAPI(title="UserSnack API")

# CORS middleware for cross-site request protection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:5173", "http://0.0.0.0:8000", "http://127.0.0.1:61770"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
