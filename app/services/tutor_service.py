"""
Tutor service for interactive Q&A and educational assistance.
"""

from typing import Optional, List, Dict, Any
import logging
import re
from datetime import datetime

from app.core.llm_client import get_llm_client, Message
from app.core.session_manager import get_session_manager, SessionData
from app.core.safety_filter import get_safety_filter_manager
from app.core.prompt_manager import get_prompt_manager, SessionMode, ContentFilter
from app.core.config import settings
from app.models.story_models import (
    TutorStartRequest, TutorAskRequest, TutorResponse,
    ConfigRequest, ConfigResponse, SessionInfoResponse
)


logger = logging.getLogger(__name__)


class TutorService:
    """Service class for tutor functionality and Q&A interactions."""
    
    def __init__(self):
        self.llm_client = get_llm_client()
        self.session_manager = get_session_manager()
        self.safety_manager = get_safety_filter_manager()
        self.prompt_manager = get_prompt_manager()
        
        # Subject areas for classification
        self.subject_keywords = {
            "math": ["number", "count", "add", "subtract", "multiply", "divide", "plus", "minus", "equals", "math", "arithmetic", "geometry", "shapes"],
            "science": ["science", "experiment", "nature", "animal", "plant", "space", "earth", "weather", "body", "health", "chemistry", "physics"],
            "language": ["word", "letter", "read", "write", "spell", "grammar", "sentence", "story", "book", "language", "alphabet"],
            "social_studies": ["history", "geography", "country", "culture", "community", "family", "friend", "society", "world"],
            "art": ["draw", "paint", "color", "art", "music", "dance", "creative", "picture", "craft"],
            "general": ["how", "what", "why", "where", "when", "explain", "tell", "help"]
        }
    
    async def start_tutor_session(self, request: TutorStartRequest) -> TutorResponse:
        """Start a new tutor session."""
        try:
            # Create new session with tutor mode
            session_id = await self.session_manager.create_session(SessionMode.TUTOR)
            session = await self.session_manager.get_session(session_id)
            
            if not session:
                raise ValueError("Failed to create tutor session")
            
            # Update session config if custom filter provided
            if request.content_filter:
                session.config["content_filter"] = request.content_filter
            
            if request.age_group:
                session.config["age_group"] = request.age_group
            
            if request.subject:
                session.config["preferred_subject"] = request.subject
            
            # Get the appropriate system prompt based on filter
            filter_type = ContentFilter(session.config["content_filter"])
            system_prompt = self.prompt_manager.get_system_prompt(SessionMode.TUTOR, filter_type)
            
            # Add age-appropriate instructions
            age_prompt = self._get_age_appropriate_prompt(request.age_group)
            system_prompt = f"{system_prompt}\n\n{age_prompt}"
            
            # Add subject specialization if provided
            if request.subject:
                subject_prompt = f"\n\nYou are particularly knowledgeable about {request.subject}. Focus on this subject area when appropriate."
                system_prompt = f"{system_prompt}{subject_prompt}"
            
            # Add system message to session
            session.add_message("system", system_prompt)
            
            # Handle initial question if provided
            if request.initial_question:
                return await self._process_question(session, request.initial_question, None)
            else:
                # Create a welcome response
                welcome_message = self._create_welcome_message(request.subject, request.age_group)
                session.add_message("assistant", welcome_message)
                
                # Update session
                await self.session_manager.update_session(session)
                
                return TutorResponse(
                    session_id=session_id,
                    answer=welcome_message,
                    subject_detected="general",
                    follow_up_suggestions=self._get_welcome_suggestions(request.age_group),
                    educational_level=request.age_group or "6-8",
                    content_filter_applied=session.config["content_filter"],
                    message_count=len(session.messages),
                    is_appropriate=True
                )
                
        except Exception as e:
            logger.error(f"Error starting tutor session: {str(e)}")
            raise
    
    async def ask_question(self, request: TutorAskRequest) -> TutorResponse:
        """Process a question in an existing tutor session."""
        try:
            # Get session
            session = await self.session_manager.get_session(request.session_id)
            if not session:
                raise ValueError("Session not found or expired")
            
            if session.mode != SessionMode.TUTOR:
                raise ValueError("Session is not in tutor mode")
            
            # Process the question
            return await self._process_question(session, request.question, request.subject_hint)
            
        except Exception as e:
            logger.error(f"Error processing tutor question: {str(e)}")
            raise
    
    async def _process_question(self, session: SessionData, question: str, subject_hint: Optional[str]) -> TutorResponse:
        """Process a question and generate a tutor response."""
        # Detect subject area
        detected_subject = self._detect_subject(question, subject_hint)
        
        # Add user question to conversation
        session.add_message("user", question)
        
        # Generate response
        messages = session.get_messages()
        llm_response = await self.llm_client.generate(messages)
        
        # Apply safety filter
        filter_type = ContentFilter(session.config["content_filter"])
        filtered_content = self.safety_manager.apply_filter(
            llm_response.content, 
            filter_type
        )
        
        # Validate content
        is_valid, error_msg = self.safety_manager.validate_content(
            filtered_content, 
            filter_type
        )
        
        if not is_valid:
            logger.warning(f"Tutor response failed validation: {error_msg}")
            # Try to regenerate with stronger prompt
            safety_prompt = f"Please ensure your answer is appropriate for children and follows these guidelines: {error_msg}"
            messages.append(Message("system", safety_prompt))
            llm_response = await self.llm_client.generate(messages)
            filtered_content = self.safety_manager.apply_filter(
                llm_response.content, 
                filter_type
            )
        
        # Add assistant response to session
        session.add_message("assistant", filtered_content)
        
        # Generate follow-up suggestions
        follow_up_suggestions = self._generate_follow_up_suggestions(question, detected_subject)
        
        # Update session
        await self.session_manager.update_session(session)
        
        return TutorResponse(
            session_id=session.session_id,
            answer=filtered_content,
            subject_detected=detected_subject,
            follow_up_suggestions=follow_up_suggestions,
            educational_level=session.config.get("age_group", "6-8"),
            content_filter_applied=session.config["content_filter"],
            message_count=len(session.messages),
            is_appropriate=is_valid
        )
    
    def _detect_subject(self, question: str, subject_hint: Optional[str]) -> str:
        """Detect the subject area of a question."""
        question_lower = question.lower()
        
        # Use hint if provided
        if subject_hint:
            hint_lower = subject_hint.lower()
            for subject, keywords in self.subject_keywords.items():
                if any(keyword in hint_lower for keyword in keywords):
                    return subject
        
        # Check question content
        subject_scores = {}
        for subject, keywords in self.subject_keywords.items():
            score = sum(1 for keyword in keywords if keyword in question_lower)
            if score > 0:
                subject_scores[subject] = score
        
        if subject_scores:
            return max(subject_scores, key=subject_scores.get)
        
        return "general"
    
    def _create_welcome_message(self, subject: Optional[str], age_group: Optional[str]) -> str:
        """Create a welcome message for the tutor session."""
        if subject:
            return f"Hello! I'm your friendly tutor, and I'm here to help you learn about {subject} and answer any questions you have! What would you like to explore today?"
        else:
            return "Hello! I'm your friendly tutor, and I'm excited to help you learn about anything you're curious about! What questions do you have for me today?"
    
    def _get_welcome_suggestions(self, age_group: Optional[str]) -> List[str]:
        """Get welcome suggestions based on age group."""
        age = age_group or "6-8"
        
        suggestions_by_age = {
            "3-5": [
                "What colors make purple?",
                "How do birds fly?",
                "What shapes can you find at home?",
                "Why do we need to sleep?"
            ],
            "6-8": [
                "How do plants grow?",
                "What makes the rainbow?",
                "How do we count to 100?",
                "Why do seasons change?"
            ],
            "9-12": [
                "How does the human body work?",
                "What are fractions?",
                "How do volcanoes form?",
                "What are the parts of a story?"
            ]
        }
        
        return suggestions_by_age.get(age, suggestions_by_age["6-8"])
    
    def _generate_follow_up_suggestions(self, question: str, subject: str) -> List[str]:
        """Generate follow-up questions based on the current question and subject."""
        base_suggestions = {
            "math": [
                "Can you show me another example?",
                "How can I practice this at home?",
                "What comes next in this pattern?"
            ],
            "science": [
                "What experiment could we try?",
                "How does this work in real life?",
                "What other animals/plants are similar?"
            ],
            "language": [
                "Can you help me with spelling?",
                "What other words are like this?",
                "How do I use this in a sentence?"
            ],
            "social_studies": [
                "What is life like there?",
                "How is this different from where I live?",
                "What traditions do they have?"
            ],
            "art": [
                "What materials do I need?",
                "Can you show me different techniques?",
                "What artists are famous for this?"
            ],
            "general": [
                "Can you explain that differently?",
                "What's another example?",
                "How can I learn more about this?"
            ]
        }
        
        return base_suggestions.get(subject, base_suggestions["general"])
    
    def _get_age_appropriate_prompt(self, age_group: Optional[str]) -> str:
        """Get age-appropriate instructions."""
        age_prompts = {
            "3-5": """Target age: 3-5 years old.
Use very simple words and short sentences.
Focus on basic concepts with lots of encouragement.
Use examples they can see and touch.
Make everything sound fun and exciting!""",
            
            "6-8": """Target age: 6-8 years old.
Use clear, simple language with some new vocabulary.
Explain step-by-step with concrete examples.
Connect learning to their daily experiences.
Encourage questions and curiosity.""",
            
            "9-12": """Target age: 9-12 years old.
Use more complex vocabulary and detailed explanations.
Include interesting facts and deeper concepts.
Connect different subjects together.
Encourage independent thinking and problem-solving."""
        }
        
        return age_prompts.get(age_group or "6-8", age_prompts["6-8"])
    
    async def update_config(self, request: ConfigRequest) -> ConfigResponse:
        """Update tutor session configuration."""
        try:
            # Get session
            session = await self.session_manager.get_session(request.session_id)
            if not session:
                raise ValueError("Session not found or expired")
            
            if session.mode != SessionMode.TUTOR:
                raise ValueError("Session is not in tutor mode")
            
            # Update configuration
            if request.content_filter:
                session.config["content_filter"] = request.content_filter
            
            if request.age_group:
                session.config["age_group"] = request.age_group
            
            if request.additional_settings:
                session.config.update(request.additional_settings)
            
            # Save session
            await self.session_manager.update_session(session)
            
            return ConfigResponse(
                session_id=request.session_id,
                mode="tutor",
                config=session.config,
                message="Tutor session configuration updated successfully"
            )
            
        except Exception as e:
            logger.error(f"Error updating tutor config: {str(e)}")
            raise
    
    async def get_session_info(self, session_id: str) -> SessionInfoResponse:
        """Get information about a tutor session."""
        try:
            session = await self.session_manager.get_session(session_id)
            if not session:
                raise ValueError("Session not found or expired")
            
            if session.mode != SessionMode.TUTOR:
                raise ValueError("Session is not in tutor mode")
            
            return SessionInfoResponse(
                session_id=session_id,
                created_at=session.created_at,
                last_accessed=session.last_accessed,
                message_count=len(session.messages),
                config=session.config,
                is_expired=False
            )
            
        except Exception as e:
            logger.error(f"Error getting tutor session info: {str(e)}")
            raise


# Module-level function for easy access
def get_tutor_service() -> TutorService:
    """Get tutor service instance."""
    return TutorService()
