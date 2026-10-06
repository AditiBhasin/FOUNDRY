import os

from google import genai
from google.genai import types


GEMINI_MODEL = "gemini-3.6-flash"

DEFAULT_MAX_OUTPUT_TOKENS = 1200


class AIServiceError(Exception):
    """Raised when the underlying AI provider cannot complete a request."""


def get_client():
    """Create the Gemini client using the GEMINI_API_KEY environment variable."""

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise AIServiceError(
            "GEMINI_API_KEY environment variable is not configured."
        )

    return genai.Client(api_key=api_key)


def run_gemini(
    prompt: str,
    model: str = GEMINI_MODEL,
    max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
) -> str:
    """
    Send a prompt to Gemini.
    """

    client = get_client()

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=max_output_tokens,
                temperature=0.3,
            ),
        )

    except Exception as exc:
        raise AIServiceError(
            f"Gemini request failed: {exc}"
        ) from exc

    generated_text = (response.text or "").strip()

    if not generated_text:
        raise AIServiceError(
            "Gemini returned an empty response."
        )

    return generated_text


def run_agent(
    system_prompt: str,
    user_prompt: str,
    model: str = GEMINI_MODEL,
    max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
) -> str:
    """
    Run one logical FOUNDry agent using Gemini.
    """

    prompt = f"""
SYSTEM INSTRUCTIONS:
{system_prompt.strip()}

USER / WORKFLOW INPUT:
{user_prompt.strip()}

Follow the system instructions carefully.
""".strip()

    return run_gemini(
        prompt=prompt,
        model=model,
        max_output_tokens=max_output_tokens,
    )


def analyze_startup_idea(
    idea: str,
) -> str:
    """
    Analyze a startup idea.
    """

    system_prompt = """
You are an experienced startup analyst.

Analyze the user's startup idea clearly and practically.

Cover:
- the problem being solved
- likely target users
- value proposition
- possible competitors or alternatives
- MVP features
- business model possibilities
- technical considerations
- major risks
- recommended next steps

Do not claim to have live market or internet data.
Clearly distinguish reasonable assumptions from known facts.
"""

    user_prompt = f"""
Startup idea:

{idea}
"""

    return run_agent(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )
