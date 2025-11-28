"""
LLM Client abstraction layer for supporting multiple LLM providers.
Supports OpenAI, Hugging Face, and OpenAI-compatible endpoints.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

import openai
import httpx

from app.core.config import settings


logger = logging.getLogger(__name__)


class Message:
    """Represents a conversation message."""
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content
    
    def to_dict(self) -> Dict[str, str]:
        return {"role": self.role, "content": self.content}


class LLMResponse:
    """Standardized response from any LLM provider."""
    def __init__(self, content: str, model: str, usage: Optional[Dict[str, int]] = None):
        self.content = content
        self.model = model
        self.usage = usage or {}


class BaseLLMClient(ABC):
    """Abstract base class for LLM clients."""
    
    @abstractmethod
    async def generate(self, messages: List[Message], **kwargs) -> LLMResponse:
        """Generate a response based on the conversation history."""
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """Get the name of the current model."""
        pass


class OpenAIClient(BaseLLMClient):
    """OpenAI API client implementation."""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.max_tokens = settings.openai_max_tokens
        self.temperature = settings.openai_temperature
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate(self, messages: List[Message], **kwargs) -> LLMResponse:
        """Generate a response using OpenAI API."""
        try:
            # Override with kwargs if provided
            max_tokens = kwargs.get('max_tokens', self.max_tokens)
            temperature = kwargs.get('temperature', self.temperature)
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[msg.to_dict() for msg in messages],
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False
            )
            
            return LLMResponse(
                content=response.choices[0].message.content,
                model=self.model,
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            )
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    def get_model_name(self) -> str:
        return self.model


class HuggingFaceClient(BaseLLMClient):
    """Hugging Face models client implementation."""

    def __init__(self):
        # Import transformers only when HuggingFace provider is used
        from transformers import pipeline, AutoTokenizer

        self.model_name = settings.huggingface_model
        self.api_key = settings.huggingface_api_key

        # For local inference (can be switched to API if needed)
        try:
            self.pipeline = pipeline(
                "text-generation",
                model=self.model_name,
                tokenizer=self.model_name,
                device=-1  # CPU, use 0 for GPU
            )
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.use_local = True
        except Exception as e:
            logger.warning(f"Failed to load local model, will use API: {str(e)}")
            self.use_local = False
    
    async def generate(self, messages: List[Message], **kwargs) -> LLMResponse:
        """Generate a response using Hugging Face models."""
        # Convert messages to a single prompt
        prompt = self._format_messages(messages)
        max_tokens = kwargs.get('max_tokens', settings.openai_max_tokens)
        temperature = kwargs.get('temperature', settings.openai_temperature)
        
        if self.use_local:
            # Local inference
            response = self.pipeline(
                prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            content = response[0]['generated_text'][len(prompt):]
        else:
            # Use Hugging Face API
            content = await self._api_inference(prompt, max_tokens, temperature)
        
        return LLMResponse(
            content=content.strip(),
            model=self.model_name
        )
    
    def _format_messages(self, messages: List[Message]) -> str:
        """Format messages into a single prompt string."""
        prompt_parts = []
        for msg in messages:
            if msg.role == "system":
                prompt_parts.append(f"System: {msg.content}")
            elif msg.role == "user":
                prompt_parts.append(f"Human: {msg.content}")
            elif msg.role == "assistant":
                prompt_parts.append(f"Assistant: {msg.content}")
        
        prompt_parts.append("Assistant:")
        return "\n\n".join(prompt_parts)
    
    async def _api_inference(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """Use Hugging Face Inference API."""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api-inference.huggingface.co/models/{self.model_name}",
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": max_tokens,
                        "temperature": temperature,
                        "do_sample": True
                    }
                }
            )
            response.raise_for_status()
            return response.json()[0]["generated_text"][len(prompt):]
    
    def get_model_name(self) -> str:
        return self.model_name


class OpenAICompatibleClient(BaseLLMClient):
    """Client for OpenAI-compatible endpoints (vLLM, FastChat, etc.)."""
    
    def __init__(self):
        self.base_url = settings.openai_compatible_base_url
        self.model = settings.openai_compatible_model
        self.api_key = settings.openai_compatible_api_key
        self.max_tokens = settings.openai_max_tokens
        self.temperature = settings.openai_temperature
        
        # Use OpenAI client with custom base URL
        self.client = openai.AsyncOpenAI(
            api_key=self.api_key or "dummy-key",  # Some servers don't require API key
            base_url=self.base_url
        )
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate(self, messages: List[Message], **kwargs) -> LLMResponse:
        """Generate a response using OpenAI-compatible API."""
        try:
            max_tokens = kwargs.get('max_tokens', self.max_tokens)
            temperature = kwargs.get('temperature', self.temperature)
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[msg.to_dict() for msg in messages],
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False
            )
            
            return LLMResponse(
                content=response.choices[0].message.content,
                model=self.model,
                usage={
                    "prompt_tokens": getattr(response.usage, 'prompt_tokens', 0),
                    "completion_tokens": getattr(response.usage, 'completion_tokens', 0),
                    "total_tokens": getattr(response.usage, 'total_tokens', 0)
                }
            )
        except Exception as e:
            logger.error(f"OpenAI-compatible API error: {str(e)}")
            raise
    
    def get_model_name(self) -> str:
        return self.model


class OPLClient(BaseLLMClient):
    """Client for OpenLedger OLMo model."""

    def __init__(self):
        self.base_url = settings.opl_base_url
        self.model = settings.opl_model
        self.api_key = settings.opl_api_key
        self.max_tokens = settings.opl_max_tokens
        self.temperature = settings.opl_temperature

        # Use OpenAI client with OPL base URL
        self.client = openai.AsyncOpenAI(
            api_key=self.api_key or "dummy-key",  # OPL doesn't require API key
            base_url=self.base_url
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate(self, messages: List[Message], **kwargs) -> LLMResponse:
        """Generate a response using OPL API."""
        try:
            max_tokens = kwargs.get('max_tokens', self.max_tokens)
            temperature = kwargs.get('temperature', self.temperature)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[msg.to_dict() for msg in messages],
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False
            )

            return LLMResponse(
                content=response.choices[0].message.content,
                model=self.model,
                usage={
                    "prompt_tokens": getattr(response.usage, 'prompt_tokens', 0),
                    "completion_tokens": getattr(response.usage, 'completion_tokens', 0),
                    "total_tokens": getattr(response.usage, 'total_tokens', 0)
                }
            )
        except Exception as e:
            logger.error(f"OPL API error: {str(e)}")
            raise

    def get_model_name(self) -> str:
        return self.model


class OllamaClient(BaseLLMClient):
    """Client for Ollama local models."""

    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model
        self.api_key = settings.ollama_api_key
        self.max_tokens = settings.ollama_max_tokens
        self.temperature = settings.ollama_temperature

        # Use OpenAI client with Ollama base URL
        self.client = openai.AsyncOpenAI(
            api_key=self.api_key or "dummy-key",  # Ollama doesn't require API key
            base_url=self.base_url
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate(self, messages: List[Message], **kwargs) -> LLMResponse:
        """Generate a response using Ollama API."""
        try:
            max_tokens = kwargs.get('max_tokens', self.max_tokens)
            temperature = kwargs.get('temperature', self.temperature)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[msg.to_dict() for msg in messages],
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False
            )

            return LLMResponse(
                content=response.choices[0].message.content,
                model=self.model,
                usage={
                    "prompt_tokens": getattr(response.usage, 'prompt_tokens', 0),
                    "completion_tokens": getattr(response.usage, 'completion_tokens', 0),
                    "total_tokens": getattr(response.usage, 'total_tokens', 0)
                }
            )
        except Exception as e:
            logger.error(f"Ollama API error: {str(e)}")
            raise

    def get_model_name(self) -> str:
        return self.model


class LLMClientFactory:
    """Factory class to create appropriate LLM client based on configuration."""

    @staticmethod
    def create_client() -> BaseLLMClient:
        """Create and return the appropriate LLM client based on settings."""
        provider = settings.llm_provider.lower()

        if provider == "openai":
            if not settings.openai_api_key:
                raise ValueError("OpenAI API key is required for OpenAI provider")
            return OpenAIClient()

        elif provider == "huggingface":
            return HuggingFaceClient()

        elif provider == "openai_compatible":
            return OpenAICompatibleClient()

        elif provider == "opl":
            if not settings.opl_enabled:
                raise ValueError("OPL provider is not enabled in configuration")
            return OPLClient()

        elif provider == "ollama":
            if not settings.ollama_enabled:
                raise ValueError("Ollama provider is not enabled in configuration")
            return OllamaClient()

        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")


# Module-level function for easy access
def get_llm_client() -> BaseLLMClient:
    """Get the configured LLM client instance."""
    return LLMClientFactory.create_client()
