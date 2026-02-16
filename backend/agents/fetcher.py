import logging
import arxiv
from models import GraphState

logger = logging.getLogger(__name__)


def fetch_papers(state: GraphState) -> GraphState:
    if not state.get("is_valid_ai_topic", False):
        logger.info("Skipping paper fetch - invalid topic")
        return state
    
    logger.info(f"Fetching papers for topic: {state['topic']}")
    
    try:
        search = arxiv.Search(
            query=state["topic"],
            max_results=5,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        papers = []
        for result in search.results():
            paper = {
                "title": result.title,
                "authors": ", ".join([author.name for author in result.authors]),
                "abstract": result.summary,
                "arxiv_id": result.entry_id.split("/")[-1],
                "url": result.entry_id,
                "pdf_url": result.pdf_url,
                "published": result.published.isoformat() if result.published else None
            }
            papers.append(paper)
            logger.info(f"Fetched paper: {paper['title'][:50]}...")
        
        state["papers"] = papers
        logger.info(f"Successfully fetched {len(papers)} papers")
        
        if len(papers) == 0:
            state["error"] = "No research papers found for this topic."
            
    except Exception as e:
        logger.error(f"Error fetching papers: {str(e)}")
        state["error"] = f"Error fetching papers: {str(e)}"
        state["papers"] = []
    
    return state
