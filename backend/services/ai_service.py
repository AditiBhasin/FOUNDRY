import json
import urllib.error
import urllib.request


OLLAMA_MODEL = "llama3.2:3b"
OLLAMA_BASE_URL = "http://localhost:11434"

# Local generation can be slow once later agents receive more context.
DEFAULT_TIMEOUT_SECONDS = 300

# Prevent agents from producing excessively long responses.
DEFAULT_MAX_OUTPUT_TOKENS = 1200


class AIServiceError(Exception):
    """Raised when the underlying AI provider cannot complete a request."""


def run_ollama(
    prompt: str,
    model: str = OLLAMA_MODEL,
    timeout: int = DEFAULT_TIMEOUT_SECONDS,
    max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
) -> str:
    """
    Send a prompt to the local Ollama HTTP API.

    Ollama-specific behavior stays isolated here so FOUNDry's agent
    architecture can later use a different AI provider.
    """

    url = f"{OLLAMA_BASE_URL}/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,

        # Keep the model in memory between sequential agent calls.
        "keep_alive": "10m",

        # Keep responses bounded so later agents do not run forever.
        "options": {
            "num_predict": max_output_tokens,
            "temperature": 0.3,
        },
    }

    request_body = json.dumps(
        payload
    ).encode("utf-8")

    request = urllib.request.Request(
        url=url,
        data=request_body,
        headers={
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=timeout,
        ) as response:
            response_body = response.read().decode(
                "utf-8"
            )

    except urllib.error.HTTPError as exc:
        try:
            error_body = exc.read().decode(
                "utf-8"
            )

            error_data = json.loads(
                error_body
            )

            error_message = error_data.get(
                "error",
                error_body,
            )

        except Exception:
            error_message = str(exc)

        raise AIServiceError(
            f"Ollama returned HTTP {exc.code}: "
            f"{error_message}"
        ) from exc

    except urllib.error.URLError as exc:
        raise AIServiceError(
            "Could not connect to Ollama at "
            f"{OLLAMA_BASE_URL}. "
            "Make sure Ollama is running. "
            f"Details: {exc.reason}"
        ) from exc

    except TimeoutError as exc:
        raise AIServiceError(
            f"Ollama timed out after {timeout} seconds."
        ) from exc

    except Exception as exc:
        raise AIServiceError(
            f"Unexpected Ollama error: {exc}"
        ) from exc

    try:
        data = json.loads(
            response_body
        )

    except json.JSONDecodeError as exc:
        raise AIServiceError(
            "Ollama returned an invalid API response."
        ) from exc

    if "error" in data:
        raise AIServiceError(
            f"Ollama failed: {data['error']}"
        )

    generated_text = data.get(
        "response",
        "",
    ).strip()

    if not generated_text:
        raise AIServiceError(
            "Ollama returned an empty response."
        )

    return generated_text


def run_agent(
    system_prompt: str,
    user_prompt: str,
    model: str = OLLAMA_MODEL,
    timeout: int = DEFAULT_TIMEOUT_SECONDS,
    max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
) -> str:
    """
    Run one logical FOUNDry agent using the shared underlying LLM.
    """

    prompt = f"""
SYSTEM INSTRUCTIONS:
{system_prompt.strip()}

USER / WORKFLOW INPUT:
{user_prompt.strip()}

Follow the system instructions carefully.
""".strip()

    return run_ollama(
        prompt=prompt,
        model=model,
        timeout=timeout,
        max_output_tokens=max_output_tokens,
    )


def analyze_startup_idea(
    idea: str,
) -> str:
    """
    Compatibility function used by the existing POST /ideas route.
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