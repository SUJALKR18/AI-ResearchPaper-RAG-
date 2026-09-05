import os
import logging
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()
logger = logging.getLogger(__name__)


def get_llm(temperature: float = 0.5, model: str = "openai/gpt-oss-20b"):
    """Create a ChatGroq instance using the Groq API."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        raise ValueError(
            "GROQ_API_KEY not found in environment variables. "
            "Get a free key at https://console.groq.com/keys"
        )

    llm = ChatGroq(
        model=model,
        temperature=temperature,
        api_key=groq_api_key,
    )

    logger.info(
        f"Initialized Groq LLM with model={model}, temperature={temperature}"
    )
    return llm
