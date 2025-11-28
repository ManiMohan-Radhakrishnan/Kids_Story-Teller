"""
FastAPI router for tutor-related endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, status, UploadFile
from typing import Optional
import logging

from app.models.story_models import (
    TutorStartRequest, TutorAskRequest, TutorResponse,
    ConfigRequest, ConfigResponse, SessionInfoResponse,
    ErrorResponse, TranscriptionResponse, TextToSpeechRequest, AudioResponse
)
from app.services.tutor_service import get_tutor_service
from app.core.config import settings
from app.services.asr_service import get_asr_service
from app.services.tts_service import get_tts_service


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tutor",
    tags=["tutor"],
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


@router.post("/start", response_model=TutorResponse, status_code=status.HTTP_201_CREATED)
async def start_tutor_session(
    request: TutorStartRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> TutorResponse:
    """
    Start a new tutor session.
    
    This endpoint creates a new tutor session for interactive Q&A and educational assistance.
    You can optionally specify a subject area and start with an initial question.
    
    Args:
        request: Tutor start request with optional subject and initial question
        
    Returns:
        TutorResponse with session ID and initial response
        
    Raises:
        HTTPException: If tutor session creation fails
    """
    try:
        tutor_service = get_tutor_service()
        response = await tutor_service.start_tutor_session(request)
        
        logger.info(f"Started new tutor session: {response.session_id}")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error starting tutor session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error starting tutor session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start tutor session"
        )


@router.post("/ask", response_model=TutorResponse)
async def ask_question(
    request: TutorAskRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> TutorResponse:
    """
    Ask a question in an existing tutor session.
    
    This endpoint allows you to ask questions and receive educational answers
    within the context of an ongoing tutor session.
    
    Args:
        request: Ask request with session ID and question
        
    Returns:
        TutorResponse with answer and educational guidance
        
    Raises:
        HTTPException: If session not found or question processing fails
    """
    try:
        tutor_service = get_tutor_service()
        response = await tutor_service.ask_question(request)
        
        logger.info(f"Processed question in tutor session: {request.session_id}")
        return response
        
    except ValueError as e:
        logger.error(f"Tutor session error: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tutor session not found or expired"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error processing tutor question: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process question"
        )


@router.put("/config", response_model=ConfigResponse)
async def update_tutor_config(
    request: ConfigRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> ConfigResponse:
    """
    Update tutor session configuration.
    
    This endpoint allows updating the content filter, age group, and other
    configuration settings for an existing tutor session.
    
    Args:
        request: Config request with session ID and new configuration
        
    Returns:
        ConfigResponse with updated configuration
        
    Raises:
        HTTPException: If session not found or update fails
    """
    try:
        tutor_service = get_tutor_service()
        response = await tutor_service.update_config(request)
        
        logger.info(f"Updated tutor config for session: {request.session_id}")
        return response
        
    except ValueError as e:
        logger.error(f"Tutor config update error: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tutor session not found or expired"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating tutor config: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tutor configuration"
        )


@router.get("/session/{session_id}", response_model=SessionInfoResponse)
async def get_tutor_session_info(
    session_id: str,
    api_key_verified: bool = Depends(verify_api_key)
) -> SessionInfoResponse:
    """
    Get information about a tutor session.
    
    This endpoint retrieves metadata about a tutor session including
    creation time, message count, subject areas discussed, and current configuration.
    
    Args:
        session_id: The tutor session ID to query
        
    Returns:
        SessionInfoResponse with session details
        
    Raises:
        HTTPException: If session not found
    """
    try:
        tutor_service = get_tutor_service()
        response = await tutor_service.get_session_info(session_id)
        
        return response
        
    except ValueError as e:
        logger.error(f"Tutor session info error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutor session not found or expired"
        )
    except Exception as e:
        logger.error(f"Error getting tutor session info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tutor session information"
        )


@router.get("/subjects", response_model=dict)
async def get_available_subjects(
    api_key_verified: bool = Depends(verify_api_key)
) -> dict:
    """
    Get available subject areas for tutor sessions.
    
    This endpoint returns information about the subject areas that the tutor
    can help with, along with example questions for each subject.
    
    Returns:
        Dictionary with available subjects and example questions
    """
    subjects_info = {
        "available_subjects": [
            "math",
            "science", 
            "language",
            "social_studies",
            "art",
            "general"
        ],
        "subject_descriptions": {
            "math": "Numbers, counting, basic operations, shapes, and patterns",
            "science": "Nature, animals, experiments, weather, space, and how things work",
            "language": "Reading, writing, spelling, grammar, and vocabulary",
            "social_studies": "Geography, cultures, history, and community helpers",
            "art": "Drawing, painting, music, crafts, and creative expression",
            "general": "Any topic or general questions about the world"
        },
        "example_questions": {
            "math": [
                "How do I add numbers together?",
                "What shapes can I find around me?",
                "How do I count to 100?"
            ],
            "science": [
                "How do plants grow?",
                "Why is the sky blue?",
                "What makes thunder and lightning?"
            ],
            "language": [
                "How do I spell difficult words?",
                "What makes a good story?",
                "How can I write better sentences?"
            ],
            "social_studies": [
                "What are the continents?",
                "How do people live in different countries?",
                "Who helps keep our community safe?"
            ],
            "art": [
                "How do I mix colors?",
                "What are different art techniques?",
                "How can I be more creative?"
            ],
            "general": [
                "How does my body work?",
                "Why do we need to eat healthy food?",
                "How can I be a good friend?"
            ]
        }
    }
    
    return subjects_info


@router.post("/asr/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio_file: UploadFile,
    api_key_verified: bool = Depends(verify_api_key)
) -> TranscriptionResponse:
    """
    Transcribe audio input to text using Faster-Whisper.
    
    Args:
        audio_file: Audio file to transcribe
        
    Returns:
        TranscriptionResponse with transcribed text
    """
    try:
        asr_service = get_asr_service()
        transcription = await asr_service.transcribe(audio_file)
        
        return TranscriptionResponse(
            text=transcription
        )
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to transcribe audio"
        )


@router.post("/tts/speak", response_model=AudioResponse)
async def speak_text(
    request: TextToSpeechRequest,
    api_key_verified: bool = Depends(verify_api_key)
) -> AudioResponse:
    """
    Convert text to speech using Coqui TTS.
    
    Args:
        request: Text to convert to speech
        
    Returns:
        AudioResponse with generated audio
    """
    try:
        tts_service = get_tts_service()
        audio = await tts_service.speak(request.text)
        
        return AudioResponse(
            audio=audio
        )
        
    except Exception as e:
        logger.error(f"Error generating speech: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate speech"
        )
