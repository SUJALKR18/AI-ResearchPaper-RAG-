import logging
from langchain_ollama import OllamaLLM
from models import GraphState

logger = logging.getLogger(__name__)


def summarize_papers(state: GraphState) -> GraphState:
    if not state.get("papers") or len(state["papers"]) == 0:
        logger.info("Skipping paper summarization - no papers available")
        return state
    
    logger.info(f"Generating individual summaries for {len(state['papers'])} papers")
    
    try:
        llm = OllamaLLM(
            model="qwen2.5:0.5b",
            temperature=0.5
        )
        
        individual_summaries = []
        
        for i, paper in enumerate(state["papers"], 1):
            logger.info(f"Summarizing paper {i}/{len(state['papers'])}: {paper['title'][:50]}...")
            
            prompt = f"""Provide a detailed 5-7 sentence summary of this research paper that covers:
- Main research question/problem
- Methodology used
- Key findings
- Significance of the work

Title: {paper['title']}
Authors: {paper['authors']}
Abstract: {paper['abstract']}

Provide only the summary, no additional text."""
            
            try:
                response = llm.invoke(prompt)
                summary = response.strip()
                
                individual_summaries.append({
                    "title": paper["title"],
                    "authors": paper["authors"],
                    "summary": summary,
                    "arxiv_id": paper["arxiv_id"],
                    "url": paper["url"]
                })
                
                logger.info(f"Successfully summarized paper {i}")
                
            except Exception as e:
                logger.error(f"Error summarizing paper {i}: {str(e)}")
                individual_summaries.append({
                    "title": paper["title"],
                    "authors": paper["authors"],
                    "summary": paper["abstract"][:500] + "..." if len(paper["abstract"]) > 500 else paper["abstract"],
                    "arxiv_id": paper["arxiv_id"],
                    "url": paper["url"]
                })
        
        state["individual_summaries"] = individual_summaries
        logger.info(f"Successfully generated {len(individual_summaries)} individual summaries")
        
    except Exception as e:
        logger.error(f"Error in paper summarization: {str(e)}")
        state["individual_summaries"] = [
            {
                "title": paper["title"],
                "authors": paper["authors"],
                "summary": paper["abstract"][:500] + "..." if len(paper["abstract"]) > 500 else paper["abstract"],
                "arxiv_id": paper["arxiv_id"],
                "url": paper["url"]
            }
            for paper in state["papers"]
        ]
    
    return state
