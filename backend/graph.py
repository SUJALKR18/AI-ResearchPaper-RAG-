import logging
from langgraph.graph import StateGraph, END
from models import GraphState
from agents.validator import validate_topic
from agents.fetcher import fetch_papers
from agents.comprehensive_summarizer import generate_comprehensive_summary
from agents.rag_builder import build_rag_system
from utils import generate_session_id

logger = logging.getLogger(__name__)


def should_continue_after_validation(state: GraphState) -> str:
    return "fetch_papers" if state.get("is_valid_ai_topic", False) else "end"


def should_continue_after_fetch(state: GraphState) -> str:
    return "process_results" if state.get("papers") else "end"


def create_research_graph():
    workflow = StateGraph(GraphState)
    
    workflow.add_node("validate_topic", validate_topic)
    workflow.add_node("fetch_papers", fetch_papers)
    workflow.add_node("comprehensive_summary", generate_comprehensive_summary)
    workflow.add_node("rag_build", build_rag_system)
    
    workflow.set_entry_point("validate_topic")
    
    workflow.add_conditional_edges(
        "validate_topic",
        should_continue_after_validation,
        {
            "fetch_papers": "fetch_papers",
            "end": END
        }
    )
    
    workflow.add_conditional_edges(
        "fetch_papers",
        should_continue_after_fetch,
        {
            "process_results": "comprehensive_summary",
            "end": END
        }
    )
    
    workflow.add_edge("fetch_papers", "rag_build")
    workflow.add_edge("comprehensive_summary", END)
    workflow.add_edge("rag_build", END)
    
    return workflow.compile()


async def process_topic_workflow(topic: str) -> dict:
    logger.info(f"Starting workflow for topic: {topic}")
    
    session_id = generate_session_id()
    initial_state: GraphState = {
        "topic": topic,
        "is_valid_ai_topic": False,
        "papers": [],
        "comprehensive_summary": None,
        "session_id": session_id,
        "rag_ready": False,
        "error": None,
        "rag_progress": None
    }
    
    graph = create_research_graph()
    
    try:
        final_state = await graph.ainvoke(initial_state)
        
        if not final_state.get("is_valid_ai_topic", False):
            return {
                "is_valid_ai_topic": False,
                "comprehensive_summary": None,
                "papers": [],
                "session_id": None,
                "rag_ready": False,
                "rag_progress": None,
                "error": final_state.get("error")
            }
        
        return {
            "is_valid_ai_topic": True,
            "comprehensive_summary": final_state.get("comprehensive_summary"),
            "papers": final_state.get("papers", []),
            "session_id": final_state.get("session_id"),
            "rag_ready": final_state.get("rag_ready", False),
            "rag_progress": final_state.get("rag_progress"),
            "error": None
        }
        
    except Exception as e:
        return {
            "is_valid_ai_topic": False,
            "comprehensive_summary": None,
            "papers": [],
            "session_id": None,
            "rag_ready": False,
            "rag_progress": None,
            "error": f"Workflow error: {str(e)}"
        }
