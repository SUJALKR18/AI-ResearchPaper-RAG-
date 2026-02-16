import logging
import os
import requests
from io import BytesIO
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from models import GraphState
from utils import chunk_text

load_dotenv()
logger = logging.getLogger(__name__)

_embedder = None

def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def extract_text_from_pdf(url: str) -> str:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    reader = PdfReader(BytesIO(r.content))
    return "\n".join(filter(None, (p.extract_text() for p in reader.pages)))


def build_rag_system(state: GraphState) -> GraphState:
    papers = state.get("papers", [])
    if not papers:
        return state

    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    if not pinecone_api_key:
        raise ValueError("Missing PINECONE_API_KEY")

    pc = Pinecone(api_key=pinecone_api_key)
    index_name = os.getenv("PINECONE_INDEX_NAME", "research-papers-rag")

    if index_name not in [i.name for i in pc.list_indexes()]:
        pc.create_index(
            name=index_name,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region=os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
            )
        )

    index = pc.Index(index_name)
    embedder = get_embedder()

    vectors = []
    session_id = state["session_id"]
    chunk_counter = 0

    for paper in papers:
        try:
            text = extract_text_from_pdf(paper["pdf_url"]) if paper.get("pdf_url") else paper["abstract"]
        except Exception:
            text = paper["abstract"]

        chunks = chunk_text(text, chunk_size=350, overlap=80)

        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) < 50:
                continue

            embedding = embedder.encode(chunk, normalize_embeddings=True).tolist()

            vectors.append({
                "id": f"{session_id}_{chunk_counter}",
                "values": embedding,
                "metadata": {
                    "session_id": session_id,
                    "arxiv_id": paper["arxiv_id"],
                    "title": paper["title"],
                    "chunk_index": i,
                    "text": chunk[:900]
                }
            })
            chunk_counter += 1

    for i in range(0, len(vectors), 100):
        index.upsert(
            vectors=vectors[i:i + 100],
            namespace=session_id
        )

    state["rag_ready"] = True
    state["rag_progress"] = "ready"
    return state
