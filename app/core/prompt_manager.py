"""
Prompt management system for dynamic loading of system prompts.
Keeps prompts separate from code for easy updates.
"""

import os
from pathlib import Path
from typing import Dict, Optional
import logging
from enum import Enum

from app.core.config import settings


logger = logging.getLogger(__name__)


class SessionMode(str, Enum):
    """Available session modes."""
    STORY = "story"
    TUTOR = "tutor"


class ContentFilter(str, Enum):
    """Available content filters."""
    MORAL_VALUES = "moral_values"
    EDUCATIONAL = "educational"
    FUN_ONLY = "fun_only"


class PromptManager:
    """Manages loading and caching of system prompts from files."""
    
    def __init__(self):
        self.prompts_dir = Path(__file__).parent.parent.parent / "prompts"
        self._prompt_cache: Dict[str, str] = {}
        
        # Ensure prompts directory exists
        if not self.prompts_dir.exists():
            logger.error(f"Prompts directory not found: {self.prompts_dir}")
            raise FileNotFoundError(f"Prompts directory not found: {self.prompts_dir}")
    
    def _get_prompt_file_path(self, mode: SessionMode, content_filter: ContentFilter) -> Path:
        """Get the file path for a specific prompt."""
        filename = f"{mode.value}_mode_{content_filter.value}.txt"
        return self.prompts_dir / filename
    
    def _load_prompt_from_file(self, file_path: Path) -> str:
        """Load prompt content from a file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if not content:
                logger.warning(f"Empty prompt file: {file_path}")
                return self._get_fallback_prompt()
            
            return content
            
        except FileNotFoundError:
            logger.error(f"Prompt file not found: {file_path}")
            return self._get_fallback_prompt()
        except Exception as e:
            logger.error(f"Error loading prompt from {file_path}: {str(e)}")
            return self._get_fallback_prompt()
    
    def _get_fallback_prompt(self) -> str:
        """Get a basic fallback prompt when file loading fails."""
        return """You are a helpful assistant for children. Provide safe, age-appropriate, 
        and engaging responses that are educational and fun."""
    
    def get_system_prompt(self, mode: SessionMode, content_filter: ContentFilter) -> str:
        """
        Get the system prompt for a specific mode and content filter.
        
        Args:
            mode: The session mode (story or tutor)
            content_filter: The content filter to apply
            
        Returns:
            The system prompt text
        """
        # Create cache key
        cache_key = f"{mode.value}_{content_filter.value}"
        
        # Check cache first
        if cache_key in self._prompt_cache:
            return self._prompt_cache[cache_key]
        
        # Load from file
        file_path = self._get_prompt_file_path(mode, content_filter)
        prompt_content = self._load_prompt_from_file(file_path)
        
        # Add age-appropriate instructions based on global settings
        enhanced_prompt = self._enhance_prompt_with_age_instructions(prompt_content)
        
        # Cache the result
        self._prompt_cache[cache_key] = enhanced_prompt
        
        logger.info(f"Loaded prompt for {mode.value} mode with {content_filter.value} filter")
        return enhanced_prompt
    
    def _enhance_prompt_with_age_instructions(self, base_prompt: str) -> str:
        """Add general age-appropriate instructions to any prompt."""
        age_instructions = """

IMPORTANT AGE-APPROPRIATE GUIDELINES:
- Use simple, clear language appropriate for children
- Keep responses positive and encouraging
- Avoid complex jargon or overly technical terms
- Be patient and supportive with questions
- Make learning fun and engaging
- Ensure all content is safe and appropriate for young minds"""
        
        return base_prompt + age_instructions
    
    def reload_prompts(self) -> None:
        """Clear the prompt cache to force reloading from files."""
        self._prompt_cache.clear()
        logger.info("Prompt cache cleared - prompts will be reloaded on next request")
    
    def get_available_modes(self) -> list[SessionMode]:
        """Get list of available session modes."""
        return list(SessionMode)
    
    def get_available_filters(self) -> list[ContentFilter]:
        """Get list of available content filters."""
        return list(ContentFilter)
    
    def validate_prompt_files(self) -> Dict[str, bool]:
        """
        Validate that all required prompt files exist.
        
        Returns:
            Dictionary mapping prompt file names to existence status
        """
        validation_results = {}
        
        for mode in SessionMode:
            for content_filter in ContentFilter:
                file_path = self._get_prompt_file_path(mode, content_filter)
                validation_results[file_path.name] = file_path.exists()
        
        return validation_results
    
    def get_prompt_info(self) -> Dict[str, any]:
        """Get information about the prompt system."""
        validation_results = self.validate_prompt_files()
        
        return {
            "prompts_directory": str(self.prompts_dir),
            "available_modes": [mode.value for mode in SessionMode],
            "available_filters": [f.value for f in ContentFilter],
            "prompt_files": validation_results,
            "cached_prompts": list(self._prompt_cache.keys()),
            "all_files_exist": all(validation_results.values())
        }


# Create singleton instance
prompt_manager = PromptManager()


def get_prompt_manager() -> PromptManager:
    """Get the prompt manager instance."""
    return prompt_manager
