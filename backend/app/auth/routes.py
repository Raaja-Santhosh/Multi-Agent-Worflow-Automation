from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.database import get_db
from app.models.db import User
from app.schemas.schemas import UserRegister, UserLogin, Token
from app.auth.utils import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# ---------------------------------------------------------------------------
# Rate Limiting Configuration
# ---------------------------------------------------------------------------
# Auth endpoints are the #1 target for brute-force attacks. We limit:
#   - Login:    5 attempts per minute per IP (prevents credential stuffing)
#   - Register: 3 attempts per minute per IP (prevents mass account creation)
#
# Architecture Decision Record (ADR):
#   Why slowapi instead of middleware-level limiting?
#   - Granular per-route control (login needs stricter limits than register)
#   - FastAPI-native integration via dependency injection
#   - In-memory storage is fine for single-instance; swap to Redis backend
#     for horizontal scaling via `storage_uri=settings.REDIS_URL`
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    """Validate JWT token and return the authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token)
@limiter.limit("3/minute")
async def register(request: Request, user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Register a new user account.
    
    Rate limited to 3 requests/minute per IP to prevent mass account creation.
    """
    # Check for existing user
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password strength
    if len(user_in.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        
    hashed_pwd = get_password_hash(user_in.password)
    user = User(email=user_in.email, password=hashed_pwd)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email, "id": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate and receive a JWT access token.
    
    Rate limited to 5 requests/minute per IP to prevent credential stuffing.
    Uses constant-time password comparison via bcrypt to prevent timing attacks.
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.password):
        # Generic error message prevents user enumeration
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": user.email, "id": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
