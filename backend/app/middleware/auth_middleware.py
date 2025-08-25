from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
import os

# JWT Configuration
ALGORITHM = "HS256"

def get_secret_key():
    """Get JWT secret key from environment variable (allows dynamic updates for testing)."""
    return os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Skip authentication for OPTIONS requests (CORS preflight)
            if request.method == "OPTIONS":
                await self.app(scope, receive, send)
                return
            
            # Skip authentication for public endpoints
            if self._is_public_endpoint(request.method, request.url.path):
                await self.app(scope, receive, send)
                return
            
            # Check for Authorization header
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                response = JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Missing or invalid authorization header"},
                    headers={"WWW-Authenticate": "Bearer"}
                )
                await response(scope, receive, send)
                return
            
            # Extract and verify token
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, get_secret_key(), algorithms=[ALGORITHM])
                user_id = payload.get("sub")
                if not user_id:
                    raise JWTError("Invalid token payload")
                
                # Add user_id to request state without overwriting existing State object
                request.state.user_id = user_id
                
            except JWTError:
                response = JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Could not validate credentials"},
                    headers={"WWW-Authenticate": "Bearer"}
                )
                await response(scope, receive, send)
                return
        
        await self.app(scope, receive, send)
    
    def _is_public_endpoint(self, method: str, path: str) -> bool:
        """Define which endpoints don't require authentication.
        Public routes:
        - GET    /pizzas, /pizzas/{id}
        - GET    /extras, /extras/{id}
        - POST   /orders          (place order)
        - POST   /users           (register user)
        - Existing public: /, /health, docs, redoc, openapi, /auth
        """
        # Always public basics
        if path == "/":
            return True
        if path.startswith("/health") or path.startswith("/docs") or path.startswith("/redoc") or path.startswith("/openapi.json"):
            return True
        # Support both legacy /auth/token and current /auth route
        if path.startswith("/auth"):
            return True

        # Normalize for trailing slash comparisons
        normalized = path.rstrip("/")

        # Public GET endpoints
        if method == "GET":
            if normalized.startswith("/pizzas"):
                return True
            if normalized.startswith("/extras"):
                return True

        # Public POST endpoint for placing orders
        if method == "POST":
            if normalized == "/orders":
                return True
            # Public registration endpoint
            if normalized == "/users":
                return True

        return False
