from fastapi import APIRouter
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/auth", tags=["authentication"])

# JWT Configuration
ALGORITHM = "HS256"

def get_secret_key():
    """Get JWT secret key from environment variable (allows dynamic updates for testing)."""
    return os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")

class TokenRequest(BaseModel):
    user_id: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes

@router.post("/token", response_model=Token)
async def create_token(token_request: TokenRequest):
    """Generate a JWT token for a user ID."""
    expires_delta = timedelta(minutes=30)
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {"sub": token_request.user_id, "exp": expire}
    access_token = jwt.encode(to_encode, get_secret_key(), algorithm=ALGORITHM)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=1800
    )
