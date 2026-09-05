import logging
import re
from agents.llm_config import get_llm
from models import GraphState
logger = logging.getLogger(__name__)


def _strip_think_tags(text: str) -> str:
    """Remove <think>...</think> blocks from thinking model output."""
    return re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()


def validate_topic(state: GraphState) -> GraphState:
    logger.info(f"Validating topic: {state['topic']}")
    
    try:

        # state["is_valid_ai_topic"] = True
        # state["error"] = None

        # return state

        llm = get_llm(temperature=0)
        
        prompt = f"""Determine if the following topic is strictly related to AI/Machine Learning/Deep Learning/Natural Language Processing or any AI technology. 
Respond with ONLY a single word: YES or NO. Do not explain.
/no_think

Topic: {state['topic']}"""
        
        response = llm.invoke(prompt)
        # Strip thinking tags from models like Qwen that output <think> blocks
        content = _strip_think_tags(response.content).strip().upper()
        
        logger.info(f"Validation response: {content}")
        
        # Check the final (non-thinking) answer
        if "YES" in content:
            state["is_valid_ai_topic"] = True
            state["error"] = None
        elif "NO" in content:
            state["is_valid_ai_topic"] = False
            state["error"] = f"The topic '{state['topic']}' is not related to AI/Machine Learning technology. Please enter a topic related to Artificial Intelligence, Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, or similar AI technologies."
        else:
            # Fallback if neither found clearly
            state["is_valid_ai_topic"] = True
            state["error"] = None
            
    except Exception as e:
        logger.error(f"Error validating topic: {str(e)}")
        state["is_valid_ai_topic"] = False
        state["error"] = f"Error validating topic: {str(e)}"
    
    return state
