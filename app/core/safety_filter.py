"""
Safety and content filtering module for kids' storytelling.
Provides configurable filters for moral values, educational content, and fun-focused stories.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
import re
import logging

from app.core.config import settings


logger = logging.getLogger(__name__)


class ContentFilter(ABC):
    """Abstract base class for content filters."""
    
    @abstractmethod
    def apply(self, content: str) -> str:
        """Apply the filter to the content and return filtered version."""
        pass
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for this filter to guide LLM generation."""
        pass
    
    @abstractmethod
    def validate(self, content: str) -> tuple[bool, Optional[str]]:
        """Validate if content passes the filter. Returns (is_valid, error_message)."""
        pass


class MoralValuesFilter(ContentFilter):
    """Filter that ensures stories promote positive moral values."""
    
    def __init__(self):
        # Keywords that might indicate problematic content
        self.negative_keywords = [
            "violence", "fight", "hurt", "kill", "death", "scary", 
            "nightmare", "evil", "hate", "steal", "lie", "cheat",
            "bully", "mean", "cruel", "weapon", "blood"
        ]
        
        # Positive themes to encourage
        self.positive_themes = [
            "kindness", "friendship", "helping", "sharing", "honesty",
            "courage", "respect", "love", "teamwork", "gratitude",
            "forgiveness", "patience", "responsibility"
        ]
    
    def apply(self, content: str) -> str:
        """Apply moral values filter to content."""
        # Basic word replacement for any slipped negative content
        filtered_content = content
        
        replacements = {
            "fight": "disagreement",
            "hurt": "upset",
            "scary": "surprising",
            "evil": "unkind",
            "hate": "dislike",
            "steal": "borrow without asking",
            "lie": "not tell the truth",
            "mean": "unkind",
            "cruel": "not nice"
        }
        
        for word, replacement in replacements.items():
            pattern = re.compile(r'\b' + word + r'\b', re.IGNORECASE)
            filtered_content = pattern.sub(replacement, filtered_content)
        
        return filtered_content
    
    def get_system_prompt(self) -> str:
        """Get system prompt for moral values filter."""
        return """You are a children's storyteller who creates stories that promote positive moral values.
        
Your stories should:
- Emphasize kindness, friendship, helping others, and sharing
- Show characters learning from mistakes and growing
- Promote honesty, respect, and responsibility
- Include positive role models and good behavior
- Teach valuable life lessons in a gentle way

Avoid:
- Violence, fighting, or aggressive behavior
- Scary or frightening content
- Negative behaviors being rewarded
- Mean-spirited characters or bullying
- Any content that might upset or frighten young children

Always ensure the story has a positive message and happy, uplifting tone."""
    
    def validate(self, content: str) -> tuple[bool, Optional[str]]:
        """Validate content for moral appropriateness."""
        content_lower = content.lower()
        
        # Check for negative keywords
        found_negative = [word for word in self.negative_keywords if word in content_lower]
        if found_negative:
            return False, f"Content contains inappropriate words: {', '.join(found_negative)}"
        
        # Check if it contains at least one positive theme
        found_positive = [theme for theme in self.positive_themes if theme in content_lower]
        if not found_positive:
            return False, "Story should include positive themes like kindness, friendship, or helping others"
        
        return True, None


class EducationalFilter(ContentFilter):
    """Filter that ensures stories have educational value."""
    
    def __init__(self):
        self.educational_elements = [
            "learn", "discover", "explore", "understand", "practice",
            "count", "spell", "science", "nature", "history",
            "geography", "math", "reading", "writing", "curiosity",
            "question", "answer", "think", "solve", "create"
        ]
        
        self.educational_topics = [
            "numbers", "letters", "colors", "shapes", "animals",
            "plants", "weather", "seasons", "countries", "cultures",
            "space", "ocean", "environment", "recycling", "health"
        ]
    
    def apply(self, content: str) -> str:
        """Apply educational filter to content."""
        # This filter mainly works through the system prompt
        # We could add educational facts or questions here if needed
        return content
    
    def get_system_prompt(self) -> str:
        """Get system prompt for educational filter."""
        return """You are an educational storyteller for children who creates engaging stories that teach valuable lessons.

Your stories should:
- Include educational elements (numbers, letters, colors, shapes, science facts)
- Encourage curiosity and asking questions
- Teach about the world (nature, animals, different cultures, etc.)
- Include problem-solving or critical thinking elements
- Make learning fun and exciting
- Use age-appropriate vocabulary while introducing new words

Incorporate one or more educational topics such as:
- Basic math concepts (counting, simple addition)
- Letters and phonics
- Science and nature facts
- Geography and cultures
- Environmental awareness
- Healthy habits

Always make the educational content natural to the story, not forced or preachy."""
    
    def validate(self, content: str) -> tuple[bool, Optional[str]]:
        """Validate content for educational value."""
        content_lower = content.lower()
        
        # Check for educational elements
        found_elements = [elem for elem in self.educational_elements if elem in content_lower]
        found_topics = [topic for topic in self.educational_topics if topic in content_lower]
        
        if not found_elements and not found_topics:
            return False, "Story should include educational elements or teach something valuable"
        
        return True, None


class FunOnlyFilter(ContentFilter):
    """Filter that ensures stories are purely fun and entertaining."""
    
    def __init__(self):
        self.fun_elements = [
            "laugh", "giggle", "funny", "silly", "play", "game",
            "adventure", "magic", "surprise", "dance", "sing",
            "joke", "tickle", "bounce", "jump", "celebrate",
            "party", "fun", "exciting", "amazing", "wonderful"
        ]
        
        self.serious_topics = [
            "lesson", "moral", "learn", "study", "homework",
            "serious", "important", "consequence", "responsibility"
        ]
    
    def apply(self, content: str) -> str:
        """Apply fun-only filter to content."""
        # Enhance fun elements if they're mentioned
        content = content.replace("!", "!!!")  # Make it more exciting!
        return content
    
    def get_system_prompt(self) -> str:
        """Get system prompt for fun-only filter."""
        return """You are a fun and playful storyteller who creates purely entertaining stories for children!

Your stories should be:
- Super fun, silly, and full of laughter
- Packed with adventures, games, and surprises
- Full of magical and imaginative elements
- Light-hearted with funny characters and situations
- Exciting with lots of action and movement
- Celebratory and joyful

Include elements like:
- Silly jokes and wordplay
- Funny sound effects (Whoosh! Boing! Splat!)
- Magical creatures and fantastical settings
- Games, parties, and celebrations
- Singing, dancing, and playing
- Unexpected twists and surprises

Keep it light and fun - no serious lessons or morals needed! Just pure entertainment and joy!
Use exclamation marks and enthusiastic language! Make every sentence bubble with excitement!"""
    
    def validate(self, content: str) -> tuple[bool, Optional[str]]:
        """Validate content for fun factor."""
        content_lower = content.lower()
        
        # Check for fun elements
        found_fun = [elem for elem in self.fun_elements if elem in content_lower]
        if len(found_fun) < 2:  # Should have multiple fun elements
            return False, "Story needs more fun, silly, or exciting elements!"
        
        # Check it's not too serious
        found_serious = [topic for topic in self.serious_topics if topic in content_lower]
        if len(found_serious) > 2:
            return False, "Story is too serious - make it more fun and playful!"
        
        # Check for exclamation marks (indicator of excitement)
        if content.count('!') < 3:
            return False, "Story needs more excitement and energy!"
        
        return True, None


class SafetyFilterManager:
    """Manages content filtering based on configuration."""
    
    def __init__(self):
        self.filters: Dict[str, ContentFilter] = {
            "moral_values": MoralValuesFilter(),
            "educational": EducationalFilter(),
            "fun_only": FunOnlyFilter()
        }
        self.enabled = settings.safety_filters_enabled
    
    def get_filter(self, filter_type: str) -> Optional[ContentFilter]:
        """Get a specific filter by type."""
        return self.filters.get(filter_type)
    
    def get_system_prompt(self, filter_type: str) -> str:
        """Get the system prompt for a specific filter."""
        filter_obj = self.get_filter(filter_type)
        if filter_obj:
            return filter_obj.get_system_prompt()
        
        # Default prompt if no filter specified
        return """You are a friendly storyteller for children. Create engaging, 
        age-appropriate stories that are fun and entertaining."""
    
    def apply_filter(self, content: str, filter_type: str) -> str:
        """Apply a specific filter to content."""
        if not self.enabled:
            return content
        
        filter_obj = self.get_filter(filter_type)
        if filter_obj:
            return filter_obj.apply(content)
        
        return content
    
    def validate_content(self, content: str, filter_type: str) -> tuple[bool, Optional[str]]:
        """Validate content against a specific filter."""
        if not self.enabled:
            return True, None
        
        filter_obj = self.get_filter(filter_type)
        if filter_obj:
            return filter_obj.validate(content)
        
        return True, None
    
    def get_available_filters(self) -> List[str]:
        """Get list of available filter types."""
        return list(self.filters.keys())


# Module-level instance
safety_filter_manager = SafetyFilterManager()


def get_safety_filter_manager() -> SafetyFilterManager:
    """Get the safety filter manager instance."""
    return safety_filter_manager
