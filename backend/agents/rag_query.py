import logging
import os
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from langchain_ollama import OllamaLLM
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_embedder = None
_memory = {}

def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedder


def query_rag(session_id: str, question: str) -> dict:
    logger.info(f"Processing RAG query for session {session_id}: {question[:50]}...")
    
    try:
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        if not pinecone_api_key:
            raise ValueError("PINECONE_API_KEY not found in environment variables")
        
        pc = Pinecone(api_key=pinecone_api_key)
        index_name = os.getenv("PINECONE_INDEX_NAME", "research-papers-rag")
        index = pc.Index(index_name)
        
        embedder = get_embedder()
        question_embedding = embedder.encode(question).tolist()
        
        results = index.query(
            vector=question_embedding,
            top_k=5,
            namespace=session_id,
            include_metadata=True
        )
        
        if not results.matches:
            return {
                "answer": "I don't have enough information in the research papers to answer this question.",
                "sources": []
            }
        
        retrieved_chunks = []
        sources_map = {}
        
        for match in results.matches:
            metadata = match.metadata
            retrieved_chunks.append(metadata.get("text", ""))
            arxiv_id = metadata.get("arxiv_id", "")
            if arxiv_id and arxiv_id not in sources_map:
                sources_map[arxiv_id] = {
                    "arxiv_id": arxiv_id,
                    "title": metadata.get("title", ""),
                    "relevance": f"Relevance score: {match.score:.2f}"
                }
        
        context = "\n\n".join(retrieved_chunks)
        history = "\n".join(_memory.get(session_id, []))
        
        llm = OllamaLLM(model="qwen2.5:0.5b", temperature=0.3)
        
        prompt = f"""You are a careful research assistant.

Use the conversation history only for continuity.
Answer the question using ONLY the information in the context.
Write a single clear paragraph unless explicitly asked otherwise.

Conversation history:
{history}

Question:
{question}

Context:
{context}

If the context is insufficient, clearly say that the answer cannot be determined.

Answer:"""
        
        answer = llm.invoke(prompt).strip()
        # _memory.setdefault(session_id, []).append(f"Q: {question}\nA: {answer}")
        
        return {
            "answer": answer,
            "sources": list(sources_map.values())
        }
        
    except Exception as e:
        logger.error(f"Error in RAG query: {str(e)}")
        return {
            "answer": f"An error occurred while processing your question: {str(e)}",
            "sources": []
        }
