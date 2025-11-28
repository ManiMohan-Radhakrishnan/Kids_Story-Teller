"""
Main FastAPI application for Kids Storytelling Bot.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import asyncio
from typing import Dict

from app.core.config import settings
from app.utils.logging_config import setup_logging
from app.routers import story_router, health_router, tutor_router, config_router
from app.core.session_manager import SessionManagerFactory, get_session_manager


# Setup logging before anything else
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle.
    """
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"LLM Provider: {settings.llm_provider}")
    logger.info(f"Session Backend: {settings.session_backend}")
    
    # Start background task for session cleanup (if using in-memory sessions)
    cleanup_task = None
    if settings.session_backend == "memory":
        cleanup_task = asyncio.create_task(periodic_session_cleanup())
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    
    # Cancel cleanup task
    if cleanup_task:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass
    
    # Cleanup session manager (close Redis connections if any)
    await SessionManagerFactory.cleanup()


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API for generating safe, engaging stories for children with multiple LLM support",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred"
        }
    )


# Include routers
app.include_router(health_router.router)
app.include_router(story_router.router)
app.include_router(tutor_router.router)
app.include_router(config_router.router)


async def periodic_session_cleanup():
    """
    Periodically clean up expired sessions (for in-memory backend).
    """
    while True:
        try:
            await asyncio.sleep(300)  # Run every 5 minutes
            session_manager = get_session_manager()
            deleted_count = await session_manager.cleanup_expired_sessions()
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} expired sessions")
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error during session cleanup: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
