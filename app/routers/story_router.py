"""
FastAPI router for story-related endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
import logging

from app.models.story_models import (
    StoryStartRequest, StoryContinueRequest, StoryConfigRequest,
    StoryResponse, StoryConfigResponse, SessionInfoResponse,
    ErrorResponse
)
from app.services.story_service import get_story_service
from app.core.config import settings


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/story",tags=["story"],
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    }
)


async def verify_api_key(api_key: Optional[str] = None) -> bool:
    """Verify API key if enabled in settings."""
    if not settings.api_key_enabled:
        return True
    
    if not api_key or api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key"
        )
    
    return True


@router.post("/start", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def start_story(
    request: StoryStartRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> StoryResponse:
    """
    Start a new story session.
    
    This endpoint creates a new story session and generates the initial story content
    based on the provided prompt and configuration.
    
    Args:
        request: Story start request with prompt and optional configuration
        
    Returns:
        StoryResponse with session ID and generated story content
        
    Raises:
        HTTPException: If story generation fails
    """
    try:
        story_service = get_story_service()
        response = await story_service.start_story(request)
        
        logger.info(f"Started new story session: {response.session_id}")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error starting story: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error starting story: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start story"
        )


@router.post("/continue", response_model=StoryResponse)
async def continue_story(
    request: StoryContinueRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> StoryResponse:
    """
    Continue an existing story.
    
    This endpoint continues a story session with user input, maintaining
    conversation context and applying the configured content filters.
    
    Args:
        request: Continue request with session ID and user input
        
    Returns:
        StoryResponse with continued story content
        
    Raises:
        HTTPException: If session not found or continuation fails
    """
    try:
        story_service = get_story_service()
        response = await story_service.continue_story(request)
        
        logger.info(f"Continued story session: {request.session_id}")
        return response
        
    except ValueError as e:
        logger.error(f"Session error: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or expired"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error continuing story: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to continue story"
        )


@router.put("/config", response_model=StoryConfigResponse)
async def update_config(
    request: StoryConfigRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> StoryConfigResponse:
    """
    Update story session configuration.
    
    This endpoint allows updating the content filter and other configuration
    for an existing story session.
    
    Args:
        request: Config request with session ID and new configuration
        
    Returns:
        StoryConfigResponse with updated configuration
        
    Raises:
        HTTPException: If session not found or update fails
    """
    try:
        story_service = get_story_service()
        response = await story_service.update_config(request)
        
        logger.info(f"Updated config for session: {request.session_id}")
        return response
        
    except ValueError as e:
        logger.error(f"Config update error: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or expired"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating config: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update configuration"
        )


@router.get("/session/{session_id}", response_model=SessionInfoResponse)
async def get_session_info(
    session_id: str,
    api_key_verified: bool = Depends(verify_api_key)
) -> SessionInfoResponse:
    """
    Get information about a story session.
    
    This endpoint retrieves metadata about a story session including
    creation time, message count, and current configuration.
    
    Args:
        session_id: The session ID to query
        
    Returns:
        SessionInfoResponse with session details
        
    Raises:
        HTTPException: If session not found
    """
    try:
        story_service = get_story_service()
        response = await story_service.get_session_info(session_id)
        
        return response
        
    except ValueError as e:
        logger.error(f"Session info error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired"
        )
    except Exception as e:
        logger.error(f"Error getting session info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session information"
        )


@router.get("/filters", response_model=dict)
async def get_available_filters(
    api_key_verified: bool = Depends(verify_api_key)
) -> dict:
    """
    Get available content filters.
    
    This endpoint returns a list of available content filters that can be
    used when starting or configuring a story session.
    
    Returns:
        Dictionary with available filters and their descriptions
    """
    from app.core.safety_filter import get_safety_filter_manager
    
    filter_manager = get_safety_filter_manager()
    filters = filter_manager.get_available_filters()
    
    filter_info = {
        "available_filters": filters,
        "descriptions": {
            "moral_values": "Ensures stories promote positive moral values and appropriate behavior",
            "educational": "Creates stories with educational content and learning opportunities",
            "fun_only": "Focuses on pure entertainment with silly, fun, and exciting content"
        },
        "default_filter": settings.default_content_filter
    }
    
    return filter_info
