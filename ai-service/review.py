import os
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()


class ReviewRequest(BaseModel):
    code: str
    language: str


SYSTEM_PROMPT = """You are an expert code reviewer. Analyze the given code and return a JSON object.

The JSON must follow this exact structure:
{
  "bugs": [{"line": 1, "issue": "description", "severity": "high"}],
  "style": [{"line": 1, "issue": "description"}],
  "security": [{"line": 1, "issue": "description", "severity": "critical"}],
  "summary": "overall summary",
  "score": 75
}

Rules:
- Return ONLY valid JSON, no markdown, no backticks
- Empty arrays if no issues found
- Score 0-100
"""


def build_prompt(code: str, language: str) -> str:
    return f"Review this {language} code:\n\n```{language}\n{code}\n```"


async def stream_gemini_response(code: str, language: str):
    try:
        prompt = build_prompt(code, language)
        full_text = ""

        for chunk in client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2,
            ),
        ):
            if chunk.text:
                full_text += chunk.text

        # poora JSON ek baar mein bhejo
        yield f"data: {full_text}\n\n"
        yield "data: [DONE]\n\n"

    except Exception as e:
        error_msg = json.dumps({"error": str(e)})
        yield f"data: {error_msg}\n\n"
        yield "data: [DONE]\n\n"


@router.post("/review")
async def review_code(request: ReviewRequest):
    if not request.code.strip():
        return {"error": "Code cannot be empty"}

    return StreamingResponse(
        stream_gemini_response(request.code, request.language),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )