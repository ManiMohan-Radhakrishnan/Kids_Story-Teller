"""
FastAPI router for shared configuration endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
import logging

from app.models.story_models import (
    ConfigRequest, ConfigResponse, ErrorResponse
)
from app.services.story_service import get_story_service
from app.services.tutor_service import get_tutor_service
from app.core.session_manager import get_session_manager, SessionMode
from app.core.prompt_manager import get_prompt_manager
from app.core.config import settings


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/config",
    tags=["configuration"],
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


@router.put("/session", response_model=ConfigResponse)
async def update_session_config(
    request: ConfigRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> ConfigResponse:
    """
    Update configuration for any session (story or tutor).
    
    This endpoint allows updating the content filter, age group, and other
    configuration settings for any active session, regardless of mode.
    
    Args:
        request: Config request with session ID and new configuration
        
    Returns:
        ConfigResponse with updated configuration
        
    Raises:
        HTTPException: If session not found or update fails
    """
    try:
        # Get session to determine mode
        session_manager = get_session_manager()
        session = await session_manager.get_session(request.session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or expired"
            )
        
        # Route to appropriate service based on session mode
        if session.mode == SessionMode.STORY:
            story_service = get_story_service()
            # Convert ConfigRequest to StoryConfigRequest format
            from app.models.story_models import StoryConfigRequest
            story_request = StoryConfigRequest(
                session_id=request.session_id,
                content_filter=request.content_filter,
                max_story_length=request.additional_settings.get("max_story_length") if request.additional_settings else None,
                story_style=request.additional_settings.get("story_style") if request.additional_settings else None
            )
            story_response = await story_service.update_config(story_request)
            return ConfigResponse(
                session_id=story_response.session_id,
                mode="story",
                config=story_response.config,
                message=story_response.message
            )
            
        elif session.mode == SessionMode.TUTOR:
            tutor_service = get_tutor_service()
            return await tutor_service.update_config(request)
        
        else:
            raise ValueError(f"Unknown session mode: {session.mode}")
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Config update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating session config: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update session configuration"
        )


@router.get("/filters", response_model=dict)
async def get_content_filters(
    api_key_verified: bool = Depends(verify_api_key)
) -> dict:
    """
    Get available content filters for both story and tutor modes.
    
    This endpoint returns information about all available content filters
    and their descriptions for both story and tutor sessions.
    
    Returns:
        Dictionary with available filters and their descriptions
    """
    from app.core.safety_filter import get_safety_filter_manager
    
    filter_manager = get_safety_filter_manager()
    filters = filter_manager.get_available_filters()
    
    filter_info = {
        "available_filters": filters,
        "descriptions": {
            "moral_values": "Ensures content promotes positive moral values and appropriate behavior",
            "educational": "Creates content with educational value and learning opportunities",
            "fun_only": "Focuses on pure entertainment with silly, fun, and exciting content"
        },
        "default_filter": settings.default_content_filter,
        "applies_to_modes": ["story", "tutor"],
        "filter_effects": {
            "story": {
                "moral_values": "Stories emphasize kindness, sharing, honesty, and good behavior",
                "educational": "Stories include learning elements like numbers, letters, science facts",
                "fun_only": "Stories are purely entertaining with jokes, magic, and excitement"
            },
            "tutor": {
                "moral_values": "Answers include examples of good behavior and positive values",
                "educational": "Responses focus on learning with detailed explanations and examples",
                "fun_only": "Answers are enthusiastic and make learning feel like games"
            }
        }
    }
    
    return filter_info


@router.get("/prompts", response_model=dict)
async def get_prompt_info(
    api_key_verified: bool = Depends(verify_api_key)
) -> dict:
    """
    Get information about the prompt management system.
    
    This endpoint provides details about available prompt files,
    their status, and the prompt management system configuration.
    
    Returns:
        Dictionary with prompt system information
    """
    try:
        prompt_manager = get_prompt_manager()
        prompt_info = prompt_manager.get_prompt_info()
        
        return {
            "prompt_system": prompt_info,
            "usage": {
                "story_mode": "Uses prompts to generate age-appropriate stories with specific themes",
                "tutor_mode": "Uses prompts to provide educational answers and explanations"
            },
            "customization": {
                "location": str(prompt_info["prompts_directory"]),
                "file_format": "Plain text files with system instructions",
                "naming_convention": "{mode}_mode_{filter}.txt",
                "reload_method": "Prompts are cached and can be reloaded without restart"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting prompt info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get prompt information"
        )


@router.post("/prompts/reload", response_model=dict)
async def reload_prompts(
    api_key_verified: bool = Depends(verify_api_key)
) -> dict:
    """
    Reload all prompt files from disk.
    
    This endpoint clears the prompt cache and forces reloading of all
    prompt files from disk. Useful for updating prompts without restarting the server.
    
    Returns:
        Dictionary with reload status
    """
    try:
        prompt_manager = get_prompt_manager()
        prompt_manager.reload_prompts()
        
        # Validate that files can be loaded
        validation_results = prompt_manager.validate_prompt_files()
        
        return {
            "status": "success",
            "message": "Prompts reloaded successfully",
            "file_validation": validation_results,
            "all_files_valid": all(validation_results.values()),
            "timestamp": settings.app_version
        }
        
    except Exception as e:
        logger.error(f"Error reloading prompts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reload prompts"
        )


@router.get("/system", response_model=dict)
async def get_system_config(
    api_key_verified: bool = Depends(verify_api_key)
) -> dict:
    """
    Get current system configuration.
    
    This endpoint returns information about the current system configuration
    including LLM providers, session backends, and other settings.
    
    Returns:
        Dictionary with system configuration
    """
    return {
        "application": {
            "name": settings.app_name,
            "version": settings.app_version,
            "debug": settings.debug
        },
        "llm_configuration": {
            "provider": settings.llm_provider,
            "openai_model": settings.openai_model if settings.llm_provider == "openai" else None,
            "huggingface_model": settings.huggingface_model if settings.llm_provider == "huggingface" else None,
            "temperature": settings.openai_temperature,
            "max_tokens": settings.openai_max_tokens
        },
        "session_configuration": {
            "backend": settings.session_backend,
            "timeout_minutes": settings.session_timeout_minutes
        },
        "safety_configuration": {
            "filters_enabled": settings.safety_filters_enabled,
            "default_filter": settings.default_content_filter,
            "max_story_length": settings.max_story_length
        },
        "supported_modes": ["story", "tutor"],
        "api_features": {
            "api_key_required": settings.api_key_enabled,
            "cors_enabled": True,
            "rate_limiting": False  # Not implemented yet
        }
    }
