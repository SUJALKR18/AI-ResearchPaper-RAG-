import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    ProcessTopicRequest, 
    ProcessTopicResponse,
    QueryRAGRequest,
    QueryRAGResponse
)
from graph import process_topic_workflow
from agents.rag_query import query_rag
from utils import store_session, get_session, cleanup_expired_sessions

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Research Paper Multi-Agent System",
    description="Multi-agent system for researching AI topics using RAG",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting AI Research Paper Multi-Agent System")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down AI Research Paper Multi-Agent System")


@app.get("/")
async def root():
    return {
        "message": "AI Research Paper Multi-Agent System API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/process-topic", response_model=ProcessTopicResponse)
async def process_topic(request: ProcessTopicRequest):
    logger.info(f"Received request to process topic: {request.topic}")
    
    cleanup_expired_sessions()
    
    try:
        result = await process_topic_workflow(topic=request.topic)
        
        if result.get("is_valid_ai_topic") and result.get("session_id"):
            store_session(result["session_id"], {
                "topic": request.topic,
                "papers": result.get("papers", []),
                "rag_ready": result.get("rag_ready", False)
            })
        
        return ProcessTopicResponse(
            is_valid_ai_topic=result.get("is_valid_ai_topic", False),
            comprehensive_summary=result.get("comprehensive_summary"),
            papers=result.get("papers", []),
            session_id=result.get("session_id") if result.get("is_valid_ai_topic") else None,
            rag_ready=result.get("rag_ready", False),
            error=result.get("error"),
            rag_progress=result.get("rag_progress")
        )
        
    except Exception as e:
        logger.error(f"Error processing topic: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing topic: {str(e)}"
        )


@app.post("/api/query-rag", response_model=QueryRAGResponse)
async def query_rag_endpoint(request: QueryRAGRequest):
    logger.info(f"Received RAG query for session {request.session_id}: {request.question[:50]}...")
    
    try:
        session_data = get_session(request.session_id)
        if not session_data:
            raise HTTPException(
                status_code=404,
                detail="Session not found or expired. Please process the topic again."
            )
        
        if not session_data.get("rag_ready", False):
            return QueryRAGResponse(
                answer="The RAG system is not ready yet. Please wait a moment and try again.",
                sources=[],
                error="RAG system not ready"
            )
        
        result = query_rag(
            session_id=request.session_id,
            question=request.question
        )
        
        return QueryRAGResponse(
            answer=result.get("answer", ""),
            sources=result.get("sources", []),
            error=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying RAG: {str(e)}")
        return QueryRAGResponse(
            answer="An error occurred while processing your question.",
            sources=[],
            error=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
