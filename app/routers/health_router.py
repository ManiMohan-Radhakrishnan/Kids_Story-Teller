"""
Health check and monitoring endpoints.
"""

from fastapi import APIRouter, status
import logging

from app.models.story_models import HealthResponse
from app.core.config import settings
from app.core.llm_client import get_llm_client
from app.core.session_manager import get_session_manager


logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["health"],
    responses={
        503: {"description": "Service Unavailable"}
    }
)


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns the current status of the application and its dependencies.
    
    Returns:
        HealthResponse with service status
    """
    try:
        # Try to get instances to verify they can be created
        llm_client = get_llm_client()
        session_manager = get_session_manager()
        
        return HealthResponse(
            status="healthy",
            version=settings.app_version,
            llm_provider=settings.llm_provider,
            session_backend=settings.session_backend
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthResponse(
            status="unhealthy",
            version=settings.app_version,
            llm_provider=settings.llm_provider,
            session_backend=settings.session_backend
        )


@router.get("/", status_code=status.HTTP_200_OK)
async def root():
    """
    Root endpoint.
    
    Returns basic information about the API.
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": "Kids Storytelling Bot API - Create engaging, safe stories for children",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "story_start": "/story/start",
            "story_continue": "/story/continue",
            "story_config": "/story/config"
        }
    }
