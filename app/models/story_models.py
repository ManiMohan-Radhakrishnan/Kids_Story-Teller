"""
Pydantic models for story API request and response validation.
"""

from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field, validator


class StoryStartRequest(BaseModel):
    """Request model for starting a new story session."""
    
    prompt: str = Field(
        ..., 
        min_length=1, 
        max_length=500,
        description="Initial prompt or theme for the story"
    )
    character_name: Optional[str] = Field(
        None, 
        max_length=50,
        description="Name of the main character (optional)"
    )
    age_group: Optional[Literal["3-5", "6-8", "9-12"]] = Field(
        "6-8",
        description="Target age group for the story"
    )
    story_length: Optional[Literal["short", "medium", "long"]] = Field(
        "medium",
        description="Desired story length"
    )
    content_filter: Optional[Literal["moral_values", "educational", "fun_only"]] = Field(
        None,
        description="Content filter to apply (uses default if not specified)"
    )
    
    @validator('prompt')
    def validate_prompt(cls, v):
        """Ensure prompt is not just whitespace."""
        if not v.strip():
            raise ValueError("Prompt cannot be empty or just whitespace")
        return v.strip()


class StoryContinueRequest(BaseModel):
    """Request model for continuing an existing story."""
    
    session_id: str = Field(
        ..., 
        description="Session ID from story start"
    )
    user_input: str = Field(
        ..., 
        min_length=1, 
        max_length=500,
        description="User's input to continue the story"
    )
    choice: Optional[str] = Field(
        None,
        description="Selected choice for branching stories (if applicable)"
    )
    
    @validator('user_input')
    def validate_input(cls, v):
        """Ensure input is not just whitespace."""
        if not v.strip():
            raise ValueError("User input cannot be empty or just whitespace")
        return v.strip()


class StoryConfigRequest(BaseModel):
    """Request model for updating story session configuration."""
    
    session_id: str = Field(
        ..., 
        description="Session ID to update"
    )
    content_filter: Optional[Literal["moral_values", "educational", "fun_only"]] = Field(
        None,
        description="New content filter to apply"
    )
    max_story_length: Optional[int] = Field(
        None,
        ge=100,
        le=5000,
        description="Maximum story length in characters"
    )
    story_style: Optional[str] = Field(
        None,
        max_length=100,
        description="Additional style preferences"
    )


class StoryMessage(BaseModel):
    """Model for a single message in the story conversation."""
    
    role: Literal["system", "user", "assistant"] = Field(
        ...,
        description="Role of the message sender"
    )
    content: str = Field(
        ...,
        description="Content of the message"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the message was created"
    )


class StoryResponse(BaseModel):
    """Response model for story generation."""
    
    session_id: str = Field(
        ...,
        description="Session ID for continuing the story"
    )
    story_content: str = Field(
        ...,
        description="Generated story content"
    )
    choices: Optional[List[str]] = Field(
        None,
        description="Available choices for branching stories"
    )
    is_complete: bool = Field(
        False,
        description="Whether the story has reached a natural ending"
    )
    word_count: int = Field(
        ...,
        description="Number of words in the story content"
    )
    content_filter_applied: str = Field(
        ...,
        description="Content filter that was applied"
    )
    message_count: int = Field(
        ...,
        description="Total messages in the conversation"
    )


class StoryConfigResponse(BaseModel):
    """Response model for configuration updates."""
    
    session_id: str = Field(
        ...,
        description="Session ID that was updated"
    )
    config: Dict[str, Any] = Field(
        ...,
        description="Current configuration"
    )
    message: str = Field(
        ...,
        description="Success message"
    )


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    error: str = Field(
        ...,
        description="Error message"
    )
    detail: Optional[str] = Field(
        None,
        description="Additional error details"
    )
    code: Optional[str] = Field(
        None,
        description="Error code for client handling"
    )


class SessionInfoResponse(BaseModel):
    """Response model for session information."""
    
    session_id: str = Field(
        ...,
        description="Session ID"
    )
    created_at: datetime = Field(
        ...,
        description="When the session was created"
    )
    last_accessed: datetime = Field(
        ...,
        description="When the session was last accessed"
    )
    message_count: int = Field(
        ...,
        description="Number of messages in the session"
    )
    config: Dict[str, Any] = Field(
        ...,
        description="Current session configuration"
    )
    is_expired: bool = Field(
        False,
        description="Whether the session has expired"
    )


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    
    status: Literal["healthy", "unhealthy"] = Field(
        ...,
        description="Health status"
    )
    version: str = Field(
        ...,
        description="API version"
    )
    llm_provider: str = Field(
        ...,
        description="Current LLM provider"
    )
    session_backend: str = Field(
        ...,
        description="Current session backend"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Current server time"
    )


# Tutor Mode Models

class TutorStartRequest(BaseModel):
    """Request model for starting a new tutor session."""
    
    subject: Optional[str] = Field(
        None,
        max_length=100,
        description="Subject area (math, science, language, etc.)"
    )
    age_group: Optional[Literal["3-5", "6-8", "9-12"]] = Field(
        "6-8",
        description="Target age group for explanations"
    )
    content_filter: Optional[Literal["moral_values", "educational", "fun_only"]] = Field(
        None,
        description="Content filter to apply (uses default if not specified)"
    )
    initial_question: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional initial question to start the session"
    )


class TutorAskRequest(BaseModel):
    """Request model for asking a question in tutor mode."""
    
    session_id: str = Field(
        ..., 
        description="Session ID from tutor start"
    )
    question: str = Field(
        ..., 
        min_length=1, 
        max_length=500,
        description="Question to ask the tutor"
    )
    subject_hint: Optional[str] = Field(
        None,
        max_length=50,
        description="Optional hint about the subject area"
    )
    
    @validator('question')
    def validate_question(cls, v):
        """Ensure question is not just whitespace."""
        if not v.strip():
            raise ValueError("Question cannot be empty or just whitespace")
        return v.strip()


class TutorResponse(BaseModel):
    """Response model for tutor interactions."""
    
    session_id: str = Field(
        ...,
        description="Session ID for continuing the conversation"
    )
    answer: str = Field(
        ...,
        description="Tutor's answer to the question"
    )
    subject_detected: Optional[str] = Field(
        None,
        description="Subject area that was detected from the question"
    )
    follow_up_suggestions: Optional[List[str]] = Field(
        None,
        description="Suggested follow-up questions"
    )
    educational_level: str = Field(
        ...,
        description="Educational level of the response"
    )
    content_filter_applied: str = Field(
        ...,
        description="Content filter that was applied"
    )
    message_count: int = Field(
        ...,
        description="Total messages in the conversation"
    )
    is_appropriate: bool = Field(
        True,
        description="Whether the content passed safety filters"
    )


class ConfigRequest(BaseModel):
    """Request model for updating session configuration (shared across modes)."""
    
    session_id: str = Field(
        ..., 
        description="Session ID to update"
    )
    content_filter: Optional[Literal["moral_values", "educational", "fun_only"]] = Field(
        None,
        description="New content filter to apply"
    )
    age_group: Optional[Literal["3-5", "6-8", "9-12"]] = Field(
        None,
        description="New age group setting"
    )
    additional_settings: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional mode-specific settings"
    )


class ConfigResponse(BaseModel):
    """Response model for configuration updates (shared across modes)."""
    
    session_id: str = Field(
        ...,
        description="Session ID that was updated"
    )
    mode: Literal["story", "tutor"] = Field(
        ...,
        description="Session mode"
    )
    config: Dict[str, Any] = Field(
        ...,
        description="Current configuration"
    )
    message: str = Field(
        ...,
        description="Success message"
    )


class TranscriptionResponse(BaseModel):
    """Response model for audio transcription."""

    text: str = Field(
        ...,
        description="Transcribed text from audio"
    )


class TextToSpeechRequest(BaseModel):
    """Request model for text-to-speech conversion."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Text to convert to speech"
    )

    @validator('text')
    def validate_text(cls, v):
        """Ensure text is not just whitespace."""
        if not v.strip():
            raise ValueError("Text cannot be empty or just whitespace")
        return v.strip()


class AudioResponse(BaseModel):
    """Response model for text-to-speech conversion."""

    audio: bytes = Field(
        ...,
        description="Generated audio data"
    )
