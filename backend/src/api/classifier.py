"""
Prompt classification API using fine-tuned OpenAI model.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from typing import Optional

# Load .env file before initializing OpenAI client
_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_ENV_PATH)

router = APIRouter(prefix="/api/classify", tags=["classifier"])

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Set your fine-tuned model ID here after creating it
FINE_TUNED_MODEL = os.environ.get(
    "FINE_TUNED_MODEL_ID", 
    "gpt-4o-mini-2024-07-18"  # Default to base model if not set
)

SYSTEM_PROMPT = (
    "Classify the student prompt according to this taxonomy: "
    "-3 → Asks LLM to produce new or original work (essay, poem, story, solution only). "
    "-2 → Asks to justify or defend a position or decision. "
    "-1 → Asks to draw connections, compare, synthesize, or relate ideas. "
    "+1 → Asks for explanation, recall, or clarification of concepts. "
    "+2 → Alters LLM behavior to encourage deeper learning (e.g., 'Help me think step by step', 'Ask guiding questions')"
)


class ClassifyRequest(BaseModel):
    prompt: str
    user_id: Optional[int] = None
    platform: Optional[str] = None


class ClassifyResponse(BaseModel):
    value: int
    suggestion: str | None = None
    raw_response: str
    classification_id: Optional[int] = None


@router.post("/", response_model=ClassifyResponse)
async def classify_prompt(request: ClassifyRequest):
    """
    Classify a student prompt using the fine-tuned taxonomy model.
    Returns the classification value (-3 to +2) and an optional suggestion.
    Note: Results are stored in localStorage on the frontend, not in database.
    """
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        import logging
        import json
        import re
        logger = logging.getLogger(__name__)
        logger.info(f"Classifying prompt: {request.prompt[:100]}...")
        
        response = client.chat.completions.create(
            model=FINE_TUNED_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.prompt},
            ],
            temperature=0,
        )

        content = response.choices[0].message.content
        logger.info(f"Got response: {content}")

        # Try to parse JSON response
        value = None
        suggestion = None
        
        try:
            parsed = json.loads(content)
            # Handle case where model returns just a number vs. full JSON object
            if isinstance(parsed, dict):
                value = parsed.get("value", 0)
                suggestion = parsed.get("suggestion")
            elif isinstance(parsed, int):
                # Model returned just the number
                value = parsed
            else:
                logger.error(f"Unexpected parsed type: {type(parsed)}")
                raise HTTPException(status_code=500, detail=f"Unexpected response format: {content}")
        except json.JSONDecodeError:
            # If not JSON, try to extract just the number
            match = re.search(r'[-+]?\d+', content)
            if match:
                value = int(match.group())
            else:
                logger.error(f"Could not parse response: {content}")
                raise HTTPException(status_code=500, detail=f"Could not parse response: {content}")

        # Note: Database saving is disabled - using localStorage on frontend instead
        
        return ClassifyResponse(
            value=value,
            suggestion=suggestion,
            raw_response=content,
            classification_id=None
        )

    except HTTPException:
        raise
    except Exception as e:
        import logging
        import traceback
        logger = logging.getLogger(__name__)
        logger.error(f"Classification failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@router.get("/health")
async def health():
    """Check if the classifier is configured properly."""
    return {
        "model": FINE_TUNED_MODEL,
        "api_key_set": bool(os.environ.get("OPENAI_API_KEY")),
    }
