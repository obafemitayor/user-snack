from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from jose import jwt
from datetime import datetime, timedelta
import os
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["authentication"])

ALGORITHM = "HS256"

def get_secret_key():
    return os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")

class TokenRequest(BaseModel):
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    password: str = Field(..., min_length=6, max_length=128)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes

async def get_user_service():
    from app.main import app
    return UserService(app.mongodb, app.mongodb_client)

@router.post("/", response_model=Token)
async def authenticate_user(token_request: TokenRequest, user_service: UserService = Depends(get_user_service)):
    user = await user_service.get_user_by_email(token_request.email)
    if not user or not user.password_hash or not user.password_salt:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    is_valid = user_service.verify_password(
        token_request.password,
        user.password_hash,
        user.password_salt,
    )
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(user.id)
    expires_delta = timedelta(minutes=30)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_id, "exp": expire}
    access_token = jwt.encode(to_encode, get_secret_key(), algorithm=ALGORITHM)

    return Token(access_token=access_token, token_type="bearer", expires_in=1800)
