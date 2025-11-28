"""
Session management module for maintaining conversation context.
Supports both in-memory and Redis-based session storage.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
import uuid
import logging
from contextlib import asynccontextmanager

import redis.asyncio as redis

from app.core.config import settings
from app.core.llm_client import Message
from app.core.prompt_manager import SessionMode, ContentFilter


logger = logging.getLogger(__name__)


class SessionData:
    """Represents a user session with conversation history."""
    
    def __init__(self, session_id: str, mode: SessionMode, created_at: Optional[datetime] = None):
        self.session_id = session_id
        self.mode = mode  # Store the session mode (story or tutor)
        self.created_at = created_at or datetime.utcnow()
        self.last_accessed = self.created_at
        self.messages: List[Message] = []
        self.metadata: Dict[str, Any] = {}
        self.config: Dict[str, Any] = {
            "content_filter": settings.default_content_filter,
            "max_story_length": settings.max_story_length
        }
    
    def add_message(self, role: str, content: str):
        """Add a message to the conversation history."""
        self.messages.append(Message(role, content))
        self.last_accessed = datetime.utcnow()
    
    def get_messages(self) -> List[Message]:
        """Get all messages in the conversation."""
        return self.messages
    
    def update_config(self, config: Dict[str, Any]):
        """Update session configuration."""
        self.config.update(config)
        self.last_accessed = datetime.utcnow()
    
    def is_expired(self, timeout_minutes: int) -> bool:
        """Check if the session has expired."""
        expiry_time = self.last_accessed + timedelta(minutes=timeout_minutes)
        return datetime.utcnow() > expiry_time
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert session to dictionary for serialization."""
        return {
            "session_id": self.session_id,
            "mode": self.mode.value,
            "created_at": self.created_at.isoformat(),
            "last_accessed": self.last_accessed.isoformat(),
            "messages": [msg.to_dict() for msg in self.messages],
            "metadata": self.metadata,
            "config": self.config
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SessionData':
        """Create SessionData from dictionary."""
        session = cls(
            session_id=data["session_id"],
            mode=SessionMode(data["mode"]),
            created_at=datetime.fromisoformat(data["created_at"])
        )
        session.last_accessed = datetime.fromisoformat(data["last_accessed"])
        session.messages = [
            Message(msg["role"], msg["content"]) 
            for msg in data["messages"]
        ]
        session.metadata = data.get("metadata", {})
        session.config = data.get("config", session.config)
        return session


class BaseSessionManager(ABC):
    """Abstract base class for session managers."""
    
    @abstractmethod
    async def create_session(self, mode: SessionMode) -> str:
        """Create a new session and return its ID."""
        pass
    
    @abstractmethod
    async def get_session(self, session_id: str) -> Optional[SessionData]:
        """Retrieve a session by ID."""
        pass
    
    @abstractmethod
    async def update_session(self, session_data: SessionData) -> bool:
        """Update an existing session."""
        pass
    
    @abstractmethod
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        pass
    
    @abstractmethod
    async def cleanup_expired_sessions(self) -> int:
        """Remove expired sessions and return count of deleted sessions."""
        pass


class InMemorySessionManager(BaseSessionManager):
    """In-memory session storage implementation."""
    
    def __init__(self):
        self.sessions: Dict[str, SessionData] = {}
        self.timeout_minutes = settings.session_timeout_minutes
    
    async def create_session(self, mode: SessionMode) -> str:
        """Create a new session and return its ID."""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = SessionData(session_id, mode)
        logger.info(f"Created new {mode.value} session: {session_id}")
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[SessionData]:
        """Retrieve a session by ID."""
        session = self.sessions.get(session_id)
        
        if session and session.is_expired(self.timeout_minutes):
            await self.delete_session(session_id)
            return None
        
        if session:
            session.last_accessed = datetime.utcnow()
        
        return session
    
    async def update_session(self, session_data: SessionData) -> bool:
        """Update an existing session."""
        if session_data.session_id in self.sessions:
            self.sessions[session_data.session_id] = session_data
            return True
        return False
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Deleted session: {session_id}")
            return True
        return False
    
    async def cleanup_expired_sessions(self) -> int:
        """Remove expired sessions and return count of deleted sessions."""
        expired_ids = [
            sid for sid, session in self.sessions.items()
            if session.is_expired(self.timeout_minutes)
        ]
        
        for session_id in expired_ids:
            await self.delete_session(session_id)
        
        return len(expired_ids)


class RedisSessionManager(BaseSessionManager):
    """Redis-based session storage implementation."""
    
    def __init__(self):
        self.timeout_minutes = settings.session_timeout_minutes
        self.redis_client = None
        self._pool = None
    
    async def _get_redis(self):
        """Get Redis client, creating it if necessary."""
        if not self.redis_client:
            self._pool = redis.ConnectionPool(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password or None,
                decode_responses=True
            )
            self.redis_client = redis.Redis(connection_pool=self._pool)
        return self.redis_client
    
    async def close(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
            if self._pool:
                await self._pool.disconnect()
    
    def _get_key(self, session_id: str) -> str:
        """Get Redis key for a session."""
        return f"storytelling:session:{session_id}"
    
    async def create_session(self, mode: SessionMode) -> str:
        """Create a new session and return its ID."""
        session_id = str(uuid.uuid4())
        session = SessionData(session_id, mode)
        
        redis_client = await self._get_redis()
        key = self._get_key(session_id)
        
        await redis_client.setex(
            key,
            timedelta(minutes=self.timeout_minutes),
            json.dumps(session.to_dict())
        )
        
        logger.info(f"Created new {mode.value} session in Redis: {session_id}")
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[SessionData]:
        """Retrieve a session by ID."""
        redis_client = await self._get_redis()
        key = self._get_key(session_id)
        
        data = await redis_client.get(key)
        if not data:
            return None
        
        session = SessionData.from_dict(json.loads(data))
        
        # Update last accessed time and reset TTL
        session.last_accessed = datetime.utcnow()
        await self.update_session(session)
        
        return session
    
    async def update_session(self, session_data: SessionData) -> bool:
        """Update an existing session."""
        redis_client = await self._get_redis()
        key = self._get_key(session_data.session_id)
        
        # Check if session exists
        if not await redis_client.exists(key):
            return False
        
        # Update with new TTL
        await redis_client.setex(
            key,
            timedelta(minutes=self.timeout_minutes),
            json.dumps(session_data.to_dict())
        )
        
        return True
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        redis_client = await self._get_redis()
        key = self._get_key(session_id)
        
        result = await redis_client.delete(key)
        if result:
            logger.info(f"Deleted session from Redis: {session_id}")
        
        return bool(result)
    
    async def cleanup_expired_sessions(self) -> int:
        """Redis handles expiration automatically, so this is a no-op."""
        # Redis automatically removes expired keys
        return 0


class SessionManagerFactory:
    """Factory class to create appropriate session manager based on configuration."""
    
    _instance: Optional[BaseSessionManager] = None
    
    @classmethod
    def get_session_manager(cls) -> BaseSessionManager:
        """Get or create the session manager instance."""
        if cls._instance is None:
            backend = settings.session_backend.lower()
            
            if backend == "memory":
                cls._instance = InMemorySessionManager()
            elif backend == "redis":
                cls._instance = RedisSessionManager()
            else:
                raise ValueError(f"Unsupported session backend: {backend}")
            
            logger.info(f"Initialized {backend} session manager")
        
        return cls._instance
    
    @classmethod
    async def cleanup(cls):
        """Cleanup resources (e.g., Redis connections)."""
        if cls._instance and isinstance(cls._instance, RedisSessionManager):
            await cls._instance.close()
            cls._instance = None


# Module-level function for easy access
def get_session_manager() -> BaseSessionManager:
    """Get the configured session manager instance."""
    return SessionManagerFactory.get_session_manager()
