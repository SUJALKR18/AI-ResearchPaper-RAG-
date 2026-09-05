import logging
import json
import re
from langchain_core.messages import SystemMessage, HumanMessage
from agents.llm_config import get_llm
from models import GraphState

logger = logging.getLogger(__name__)

def _strip_think_tags(text: str) -> str:
    """Remove <think>...</think> blocks from thinking model output."""
    return re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()


def generate_comprehensive_summary(state: GraphState) -> GraphState:
    if not state.get("papers") or len(state["papers"]) == 0:
        logger.info("Skipping comprehensive summary - no papers available")
        return state
    
    logger.info(f"Generating comprehensive summary for {len(state['papers'])} papers")

    try:
        papers_content = []
        for i, paper in enumerate(state["papers"], 1):
            papers_content.append(
                f"Paper {i}: {paper['title']}\n"
                f"Authors: {paper['authors']}\n"
                f"Abstract: {paper['abstract']}\n"
            )
        
        paper_abstracts_with_titles = "\n\n".join(papers_content)
        
        llm = get_llm(temperature=0.7)
        
        system_prompt = f"""You are an expert AI research assistant. Your task is to create a comprehensive Wikipedia-style summary based on provided research papers.
CRITICAL INSTRUCTIONS:
1. You MUST return ONLY a raw, valid JSON object. Do not include any conversational text, thinking blocks, or markdown formatting outside the JSON.
2. The JSON must exactly match the schema provided below.
3. Use Markdown formatting INSIDE the "content" strings (e.g., **bold**, bullet points, `code`) to make the text structured and readable.

JSON SCHEMA:
{{
  "title": "{state['topic']}",
  "sections": [
    {{
      "heading": "Overview",
      "content": "Your detailed Markdown-formatted content here...",
      "subsections": []
    }},
    {{
      "heading": "Background and History",
      "content": "Your detailed Markdown-formatted content here...",
      "subsections": []
    }}
  ]
}}"""

        human_prompt = f"""Create a detailed, well-structured summary about '{state['topic']}' with the following sections:
1. **Overview**: A clear introduction explaining what it is.
2. **Background and History**: Origins and evolution.
3. **Key Concepts and Techniques**: Core principles and methodologies.
4. **Technical Architecture/Methods**: How it works technically.
5. **Applications and Use Cases**: Real-world applications.
6. **Current Research Trends**: Latest developments based on the papers.
7. **Challenges and Limitations**: Known problems.
8. **Future Directions**: Promising areas for future research.

Base your content STRICTLY on the following research papers:
{paper_abstracts_with_titles}"""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ]
        
        response = llm.invoke(messages)
        
        def extract_text(resp):
            raw = getattr(resp, "content", resp)
            if isinstance(raw, list):
                parts = []
                for part in raw:
                    if hasattr(part, "text"):
                        parts.append(str(part.text))
                    else:
                        parts.append(str(part))
                return "\n".join(parts)
            return str(raw)

        content = extract_text(response).strip()
        content = _strip_think_tags(content)
        
        try:
            # More robust JSON extraction
            json_start = content.find('{')
            json_end = content.rfind('}')
            
            if json_start != -1 and json_end != -1:
                json_str = content[json_start:json_end + 1]
            else:
                json_str = content

            summary_data = json.loads(json_str)
            sections = summary_data.get("sections") if isinstance(summary_data, dict) else None
            
            if not sections or not isinstance(sections, list) or len(sections) == 0:
                sections = [
                    {
                        "heading": "Comprehensive Summary",
                        "content": content,
                        "subsections": []
                    }
                ]
            state["comprehensive_summary"] = {
                "title": summary_data.get("title") or state['topic'] if isinstance(summary_data, dict) else state['topic'],
                "sections": sections
            }
            logger.info(f"Successfully generated comprehensive summary with {len(sections)} sections")
            
        except json.JSONDecodeError as je:
            logger.warning(f"Failed to parse JSON, using fallback structure: {str(je)}")
            logger.warning(f"RAW LLM CONTENT:\n{content}\n")
            state["comprehensive_summary"] = {
                "title": state['topic'],
                "sections": [
                    {
                        "heading": "Comprehensive Summary",
                        "content": content,
                        "subsections": []
                    }
                ]
            }
            
    except Exception as e:
        logger.error(f"Error generating comprehensive summary: {str(e)}")
        state["error"] = f"Error generating summary: {str(e)}"
        state["comprehensive_summary"] = {
            "title": state['topic'],
            "sections": []
        }
    
    return state
