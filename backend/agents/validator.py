import logging
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from models import GraphState
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def validate_topic(state: GraphState) -> GraphState:
    logger.info(f"Validating topic: {state['topic']}")
    
    try:

        # state["is_valid_ai_topic"] = True
        # state["error"] = None

        # return state

        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=gemini_api_key,
            temperature=0
        )
        
        prompt = f"""Determine if the following topic is strictly related to AI/Machine Learning/Deep Learning/Natural Language Processing or any AI technology. 
Respond with only 'YES' or 'NO': {state['topic']}"""
        
        response = llm.invoke(prompt)
        answer = response.content.strip().upper()
        
        logger.info(f"Validation response: {answer}")
        
        if answer == "YES":
            state["is_valid_ai_topic"] = True
            state["error"] = None
        else:
            state["is_valid_ai_topic"] = False
            state["error"] = f"The topic '{state['topic']}' is not related to AI/Machine Learning technology. Please enter a topic related to Artificial Intelligence, Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, or similar AI technologies."
            
    except Exception as e:
        logger.error(f"Error validating topic: {str(e)}")
        state["is_valid_ai_topic"] = False
        state["error"] = f"Error validating topic: {str(e)}"
    
    return state
