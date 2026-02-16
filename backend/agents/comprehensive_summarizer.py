import logging
import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from models import GraphState

logger = logging.getLogger(__name__)


def generate_comprehensive_summary(state: GraphState) -> GraphState:
    if not state.get("papers") or len(state["papers"]) == 0:
        logger.info("Skipping comprehensive summary - no papers available")
        return state
    
    logger.info(f"Generating comprehensive summary for {len(state['papers'])} papers")

    # dummy_comprehensive_summary = {
    #     "title": state['topic'],
    #     "sections": [
    #         {
    #             "heading": "Comprehensive Summary",
    #             "content": "Your detailed content here...",
    #             "subsections": []
    #         }
    #     ]
    # }

    # state["comprehensive_summary"] = dummy_comprehensive_summary
    # return state

    try:
        papers_content = []
        for i, paper in enumerate(state["papers"], 1):
            papers_content.append(
                f"Paper {i}: {paper['title']}\n"
                f"Authors: {paper['authors']}\n"
                f"Abstract: {paper['abstract']}\n"
            )
        
        paper_abstracts_with_titles = "\n\n".join(papers_content)
        
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=gemini_api_key,
            temperature=0.7
        )
        prompt = f"""You are creating a comprehensive Wikipedia-style summary about '{state['topic']}' based on these 5 research papers.

Create a detailed, well-structured summary with the following sections:

1. **Overview**: A clear introduction explaining what {state['topic']} is (2-3 paragraphs)
2. **Background and History**: Origins and evolution of this technology (1-2 paragraphs)
3. **Key Concepts and Techniques**: Core principles, methodologies, and approaches (3-4 paragraphs)
4. **Technical Architecture/Methods**: How it works technically (2-3 paragraphs)
5. **Applications and Use Cases**: Real-world applications and implementations (2-3 paragraphs)
6. **Current Research Trends**: Latest developments based on the papers (2-3 paragraphs)
7. **Challenges and Limitations**: Known problems and areas needing improvement (1-2 paragraphs)
8. **Future Directions**: Promising areas for future research (1-2 paragraphs)

Make the summary informative enough that someone reading it would gain a complete understanding of {state['topic']}.
Write in a clear, encyclopedic style similar to Wikipedia.
Base your content on the following research papers:

{paper_abstracts_with_titles}

Return the response as a structured JSON with the following format:
{{
  "title": "{state['topic']}",
  "sections": [
    {{
      "heading": "Overview",
      "content": "Your detailed content here...",
      "subsections": []
    }},
    ...
  ]
}}

Make sure each section has substantial content. The JSON should be valid and properly formatted."""
        
        response = llm.invoke(prompt)
        
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
        
        try:
            if content.startswith("```json"):
                content = content[7:]
            elif content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            summary_data = json.loads(content)
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
                "title": summary_data.get("title") or state['topic'],
                "sections": sections
            }
            logger.info(f"Successfully generated comprehensive summary with {len(sections)} sections")
            
        except json.JSONDecodeError as je:
            logger.warning(f"Failed to parse JSON, using fallback structure: {str(je)}")
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
