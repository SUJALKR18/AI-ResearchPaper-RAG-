import uuid
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sessions: Dict[str, Dict] = {}


def get_hf_api_token(user_provided_token: Optional[str], task: str) -> str:
    if user_provided_token and user_provided_token.strip():
        return user_provided_token
    
    task_token_map = {
        "validator": "HF_API_TOKEN_1",
        "comprehensive_summary": "HF_API_TOKEN_2",
        "paper_summaries": "HF_API_TOKEN_3",
        "rag_query": "HF_API_TOKEN_4"
    }
    
    env_token_name = task_token_map.get(task, "HF_API_TOKEN_1")
    api_token = os.getenv(env_token_name)
    
    if not api_token:
        raise ValueError(f"No HuggingFace API token provided by user and {env_token_name} not found in environment variables")
    
    return api_token


def generate_session_id() -> str:
    return str(uuid.uuid4())


def store_session(session_id: str, data: Dict):
    sessions[session_id] = {
        "data": data,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(hours=24)
    }
    logger.info(f"Session {session_id} created")


def get_session(session_id: str) -> Optional[Dict]:
    if session_id in sessions:
        session = sessions[session_id]
        if datetime.now() < session["expires_at"]:
            return session["data"]
        else:
            del sessions[session_id]
            logger.info(f"Session {session_id} expired and removed")
    return None


def cleanup_expired_sessions():
    expired = [sid for sid, session in sessions.items() 
               if datetime.now() >= session["expires_at"]]
    for sid in expired:
        del sessions[sid]
    if expired:
        logger.info(f"Cleaned up {len(expired)} expired sessions")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    
    return chunks


def truncate_text(text: str, max_length: int = 1000) -> str:
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."
