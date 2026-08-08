from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import engine
from app.models.db import Base
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Teardown logic
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# Rate Limiting — Global Error Handler
# ---------------------------------------------------------------------------
# When a rate limit is exceeded, return a clean 429 JSON response instead of
# an unhandled exception. This integrates with the per-route limiters defined
# in auth/routes.py.
from app.auth.routes import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
# In production, restrict allow_origins to the actual frontend URL.
# For development, we allow all origins.
allowed_origins = [settings.FRONTEND_URL] if settings.FRONTEND_URL else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from app.auth.routes import router as auth_router
from app.tasks.routes import router as tasks_router
from app.websocket.routes import router as websocket_router
from app.admin.routes import router as admin_router

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router)

@app.get("/")
def root():
    return {"message": "Welcome to OrchestraAI Multi-Agent API Engine (LangGraph + Celery Edition)"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {"status": "healthy", "version": "1.0.0"}
