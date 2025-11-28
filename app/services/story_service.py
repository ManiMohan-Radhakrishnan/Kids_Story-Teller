"""
Story generation service that coordinates LLM, session management, and safety filtering.
"""

from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

from app.core.llm_client import get_llm_client, Message
from app.core.session_manager import get_session_manager, SessionData
from app.core.safety_filter import get_safety_filter_manager
from app.core.prompt_manager import get_prompt_manager, SessionMode, ContentFilter
from app.core.config import settings
from app.models.story_models import (
    StoryStartRequest, StoryContinueRequest, StoryConfigRequest,
    StoryResponse, StoryConfigResponse, SessionInfoResponse
)


logger = logging.getLogger(__name__)


class StoryService:
    """Service class for story generation and management."""
    
    def __init__(self):
        self.llm_client = get_llm_client()
        self.session_manager = get_session_manager()
        self.safety_manager = get_safety_filter_manager()
        self.prompt_manager = get_prompt_manager()
    
    async def start_story(self, request: StoryStartRequest) -> StoryResponse:
        """Start a new story session."""
        try:
            # Create new session with story mode
            session_id = await self.session_manager.create_session(SessionMode.STORY)
            session = await self.session_manager.get_session(session_id)
            
            if not session:
                raise ValueError("Failed to create session")
            
            # Update session config if custom filter provided
            if request.content_filter:
                session.config["content_filter"] = request.content_filter
            
            # Get the appropriate system prompt based on filter
            filter_type = ContentFilter(session.config["content_filter"])
            system_prompt = self.prompt_manager.get_system_prompt(SessionMode.STORY, filter_type)
            
            # Add age-appropriate instructions to system prompt
            age_prompt = self._get_age_appropriate_prompt(request.age_group)
            system_prompt = f"{system_prompt}\n\n{age_prompt}"
            
            # Add story length instruction
            length_prompt = self._get_length_prompt(request.story_length)
            system_prompt = f"{system_prompt}\n\n{length_prompt}"
            
            # Add system message to session
            session.add_message("system", system_prompt)
            
            # Create user prompt
            user_prompt = self._create_initial_prompt(request)
            session.add_message("user", user_prompt)
            
            # Generate story
            messages = session.get_messages()
            llm_response = await self.llm_client.generate(messages)
            
            # Apply safety filter
            filtered_content = self.safety_manager.apply_filter(
                llm_response.content, 
                filter_type.value
            )
            
            # Validate content
            is_valid, error_msg = self.safety_manager.validate_content(
                filtered_content, 
                filter_type.value
            )
            
            if not is_valid:
                # If content doesn't pass filter, regenerate with stronger prompt
                logger.warning(f"Content failed validation: {error_msg}")
                messages.append(Message("system", f"Please ensure the story follows these guidelines: {error_msg}"))
                llm_response = await self.llm_client.generate(messages)
                filtered_content = self.safety_manager.apply_filter(
                    llm_response.content, 
                    filter_type
                )
            
            # Add assistant response to session
            session.add_message("assistant", filtered_content)
            
            # Update session
            await self.session_manager.update_session(session)
            
            # Create response
            word_count = len(filtered_content.split())
            
            return StoryResponse(
                session_id=session_id,
                story_content=filtered_content,
                choices=None,  # Can be implemented later for branching stories
                is_complete=self._check_story_completion(filtered_content),
                word_count=word_count,
                content_filter_applied=filter_type.value,
                message_count=len(session.messages)
            )
            
        except Exception as e:
            logger.error(f"Error starting story: {str(e)}")
            raise
    
    async def continue_story(self, request: StoryContinueRequest) -> StoryResponse:
        """Continue an existing story."""
        try:
            # Get session
            session = await self.session_manager.get_session(request.session_id)
            if not session:
                raise ValueError("Session not found or expired")
            
            # Add user input to conversation
            session.add_message("user", request.user_input)
            
            # Check if story is getting too long
            total_words = sum(
                len(msg.content.split()) 
                for msg in session.messages 
                if msg.role == "assistant"
            )
            
            if total_words > session.config["max_story_length"]:
                # Add instruction to wrap up the story
                wrap_up_prompt = "Please bring the story to a satisfying conclusion in the next response."
                session.add_message("system", wrap_up_prompt)
            
            # Generate continuation
            messages = session.get_messages()
            llm_response = await self.llm_client.generate(messages)
            
            # Apply safety filter
            filter_type = ContentFilter(session.config["content_filter"])
            filtered_content = self.safety_manager.apply_filter(
                llm_response.content, 
                filter_type.value
            )
            
            # Validate content
            is_valid, error_msg = self.safety_manager.validate_content(
                filtered_content, 
                filter_type.value
            )
            
            if not is_valid:
                logger.warning(f"Continuation failed validation: {error_msg}")
                # Try to fix by regenerating
                messages.append(Message("system", f"Please ensure the continuation follows these guidelines: {error_msg}"))
                llm_response = await self.llm_client.generate(messages)
                filtered_content = self.safety_manager.apply_filter(
                    llm_response.content, 
                    filter_type
                )
            
            # Add to session
            session.add_message("assistant", filtered_content)
            
            # Update session
            await self.session_manager.update_session(session)
            
            # Create response
            word_count = len(filtered_content.split())
            is_complete = self._check_story_completion(filtered_content) or total_words > session.config["max_story_length"]
            
            return StoryResponse(
                session_id=request.session_id,
                story_content=filtered_content,
                choices=None,
                is_complete=is_complete,
                word_count=word_count,
                content_filter_applied=filter_type.value,
                message_count=len(session.messages)
            )
            
        except Exception as e:
            logger.error(f"Error continuing story: {str(e)}")
            raise
    
    async def update_config(self, request: StoryConfigRequest) -> StoryConfigResponse:
        """Update session configuration."""
        try:
            # Get session
            session = await self.session_manager.get_session(request.session_id)
            if not session:
                raise ValueError("Session not found or expired")
            
            # Update configuration
            if request.content_filter:
                session.config["content_filter"] = request.content_filter
            
            if request.max_story_length:
                session.config["max_story_length"] = request.max_story_length
            
            if request.story_style:
                session.config["story_style"] = request.story_style
            
            # Save session
            await self.session_manager.update_session(session)
            
            return StoryConfigResponse(
                session_id=request.session_id,
                config=session.config,
                message="Configuration updated successfully"
            )
            
        except Exception as e:
            logger.error(f"Error updating config: {str(e)}")
            raise
    
    async def get_session_info(self, session_id: str) -> SessionInfoResponse:
        """Get information about a session."""
        try:
            session = await self.session_manager.get_session(session_id)
            if not session:
                raise ValueError("Session not found or expired")
            
            return SessionInfoResponse(
                session_id=session_id,
                created_at=session.created_at,
                last_accessed=session.last_accessed,
                message_count=len(session.messages),
                config=session.config,
                is_expired=False
            )
            
        except Exception as e:
            logger.error(f"Error getting session info: {str(e)}")
            raise
    
    def _create_initial_prompt(self, request: StoryStartRequest) -> str:
        """Create the initial prompt for story generation."""
        prompt_parts = [f"Create a story about: {request.prompt}"]
        
        if request.character_name:
            prompt_parts.append(f"The main character's name is {request.character_name}.")
        
        return " ".join(prompt_parts)
    
    def _get_age_appropriate_prompt(self, age_group: Optional[str]) -> str:
        """Get age-appropriate instructions."""
        age_prompts = {
            "3-5": """Target age group: 3-5 years old.
Use very simple language, short sentences, and basic vocabulary.
Focus on colors, shapes, and simple concepts.
Include repetition and rhyming when possible.""",
            
            "6-8": """Target age group: 6-8 years old.
Use clear, simple language with some new vocabulary words.
Include more complex storylines but keep them easy to follow.
Add descriptive details to spark imagination.""",
            
            "9-12": """Target age group: 9-12 years old.
Use richer vocabulary and more complex sentence structures.
Include deeper themes and character development.
Create more sophisticated plots with subplots if appropriate."""
        }
        
        return age_prompts.get(age_group or "6-8", age_prompts["6-8"])
    
    def _get_length_prompt(self, story_length: Optional[str]) -> str:
        """Get story length instructions."""
        length_prompts = {
            "short": "Keep the story brief (around 200-300 words per response).",
            "medium": "Create a medium-length story (around 400-500 words per response).",
            "long": "Create a longer, more detailed story (around 600-800 words per response)."
        }
        
        return length_prompts.get(story_length or "medium", length_prompts["medium"])
    
    def _check_story_completion(self, content: str) -> bool:
        """Check if the story has reached a natural ending."""
        ending_indicators = [
            "the end", "happily ever after", "and that's how",
            "from that day on", "and they all lived", "the moral of the story",
            "and so it was", "and that was that", "fin", "the end."
        ]
        
        content_lower = content.lower()
        return any(indicator in content_lower for indicator in ending_indicators)


# Module-level function for easy access
def get_story_service() -> StoryService:
    """Get story service instance."""
    return StoryService()
