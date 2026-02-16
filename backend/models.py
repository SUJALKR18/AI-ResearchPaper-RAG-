from typing import TypedDict, List, Dict, Optional, Annotated
from typing_extensions import TypedDict
from pydantic import BaseModel, Field
from operator import add


def last_value(x, y):
    return y if y is not None else x


def prefer_summary_with_sections(x, y):
    if isinstance(y, dict) and y.get("sections"):
        return y
    return x


class GraphState(TypedDict):
    topic: Annotated[str, last_value]
    is_valid_ai_topic: Annotated[bool, last_value]
    papers: Annotated[List[Dict], last_value]
    comprehensive_summary: Annotated[Optional[Dict], prefer_summary_with_sections]
    session_id: Annotated[str, last_value]
    rag_ready: Annotated[bool, last_value]
    error: Annotated[Optional[str], lambda x, y: y if y else x]
    rag_progress: Annotated[Optional[str], lambda x, y: y if y else x]

class ProcessTopicRequest(BaseModel):
    topic: str = Field(..., min_length=1, description="AI technology topic to research")


class SubSection(BaseModel):
    heading: str
    content: str


class Section(BaseModel):
    heading: str
    content: str
    subsections: Optional[List[SubSection]] = []


class ComprehensiveSummary(BaseModel):
    title: str
    sections: List[Section]


class Paper(BaseModel):
    title: str
    authors: str
    abstract: str
    arxiv_id: str
    url: str
    pdf_url: Optional[str] = None


class ProcessTopicResponse(BaseModel):
    is_valid_ai_topic: bool
    comprehensive_summary: Optional[ComprehensiveSummary] = None
    papers: Optional[List[Paper]] = []
    session_id: Optional[str] = None
    rag_ready: Optional[bool] = False
    error: Optional[str] = None
    rag_progress: Optional[str] = None


class QueryRAGRequest(BaseModel):
    session_id: str = Field(..., description="Session ID from process-topic")
    question: str = Field(..., min_length=1, description="Question to ask about the papers")


class Source(BaseModel):
    arxiv_id: str
    title: str
    relevance: str


class QueryRAGResponse(BaseModel):
    answer: str
    sources: List[Source] = []
    error: Optional[str] = None
