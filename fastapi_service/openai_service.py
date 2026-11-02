
from openai import AsyncOpenAI, OpenAIError
from fastapi import HTTPException

from .config import OPENAI_API_KEY, OPENAI_MODEL
from .prompts import SYSTEM_PROMPT, REPORT_PROMPT


async def _generate(prompt: str) -> str:
    """
    Generate text using the OpenAI Responses API.
    """

    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail=(
                "OPENAI_API_KEY is missing. Add your API key to "
                "D:\\Neurobiz_AI_ERP\\.env and restart FastAPI."
            ),
        )

    try:
        async with AsyncOpenAI(
            api_key=OPENAI_API_KEY,
            timeout=60.0,
            max_retries=1,
        ) as client:
            response = await client.responses.create(
                model=OPENAI_MODEL,
                instructions=SYSTEM_PROMPT,
                input=prompt,
            )

        answer = (response.output_text or "").strip()

        if not answer:
            raise HTTPException(
                status_code=502,
                detail="OpenAI returned an empty response.",
            )

        return answer

    except HTTPException:
        raise

    except OpenAIError as exc:
        # Keep credentials and sensitive provider details private.
        print(f"OpenAI API error: {type(exc).__name__}")

        raise HTTPException(
            status_code=502,
            detail=(
                "OpenAI request failed. Check the API key, model access, "
                "API quota, and billing. See the FastAPI terminal for "
                "the error category."
            ),
        ) from None

    except Exception as exc:
        print(f"Unexpected AI service error: {type(exc).__name__}")

        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while generating the AI response.",
        ) from None


async def generate_report(data, question: str) -> str:
    """
    Generate a business performance report from ERP analytics data.
    """

    prompt = REPORT_PROMPT.format(
        question=question,
        data=data,
    )

    return await _generate(prompt)


async def chat_with_business_ai(message: str, data) -> str:
    """
    Answer a business question using the supplied ERP analytics data.
    """

    prompt = f"""
BUSINESS ANALYTICS DATA:
{data}

USER QUESTION:
{message}

INSTRUCTIONS:
- Answer using only the supplied business analytics data.
- Do not invent numbers, metrics, or company facts.
- If the data does not contain the answer, explain what is missing.
- Highlight relevant trends only when supported by the data.
- Provide practical recommendations when appropriate.
- Use clear, simple, professional business language.
"""

    return await _generate(prompt)
