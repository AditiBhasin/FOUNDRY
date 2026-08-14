import json
import re

from models.agents import FinanceOutput, ProductOutput, QAOutput, ResearchOutput, TechnicalOutput
from services.ai_service import AIServiceError, run_agent


class AgentServiceError(Exception):
    """Raised when a FOUNDry agent cannot run because of an AI service failure."""


RESEARCH_SYSTEM_PROMPT = """
You are the Research Agent inside FOUNDry, an AI startup operating system.

Your responsibility is to analyze a startup idea before product,
business, and technical decisions are made.

Analyze:

1. The problem being solved.
2. Target users.
3. Customer segments.
4. Likely competitors or alternatives.
5. Existing solutions.
6. Market opportunity.
7. Differentiation opportunities.
8. Research risks and assumptions.
9. Questions that should be validated.

IMPORTANT RULES:

- You do not have live internet access.
- Never claim that you searched the internet.
- Never invent precise market sizes, revenue numbers, funding data,
  or current statistics.
- Clearly identify assumptions.
- Be practical and concise.
- Focus on information useful for building an MVP.

Return JSON if possible using these fields:

{
  "problem_statement": "string",
  "target_users": ["string"],
  "customer_segments": ["string"],
  "competitors": ["string"],
  "existing_solutions": ["string"],
  "market_opportunity": "string",
  "differentiation": ["string"],
  "research_risks": ["string"],
  "validation_questions": ["string"]
}

If you cannot produce JSON, use these headings:

PROBLEM_STATEMENT:
TARGET_USERS:
CUSTOMER_SEGMENTS:
COMPETITORS:
EXISTING_SOLUTIONS:
MARKET_OPPORTUNITY:
DIFFERENTIATION:
RESEARCH_RISKS:
VALIDATION_QUESTIONS:
"""


FIELD_ALIASES = {
    "problem_statement": [
        "problem_statement",
        "problem statement",
        "problem",
        "core problem",
    ],
    "target_users": [
        "target_users",
        "target users",
        "users",
        "target audience",
    ],
    "customer_segments": [
        "customer_segments",
        "customer segments",
        "segments",
        "customer groups",
    ],
    "competitors": [
        "competitors",
        "competition",
        "competitor analysis",
        "alternatives",
    ],
    "existing_solutions": [
        "existing_solutions",
        "existing solutions",
        "current solutions",
        "existing alternatives",
    ],
    "market_opportunity": [
        "market_opportunity",
        "market opportunity",
        "opportunity",
    ],
    "differentiation": [
        "differentiation",
        "differentiators",
        "competitive advantage",
        "differentiation opportunities",
    ],
    "research_risks": [
        "research_risks",
        "research risks",
        "risks",
        "assumptions",
        "risks and assumptions",
    ],
    "validation_questions": [
        "validation_questions",
        "validation questions",
        "questions to validate",
        "validation",
    ],
}


def _clean_text(value: str) -> str:
    """
    Remove common formatting noise from model output.
    """

    value = value.strip()

    value = value.replace("```json", "")
    value = value.replace("```", "")

    return value.strip()


def _normalize_heading(value: str) -> str:
    """
    Normalize headings so formatting differences do not matter.
    """

    value = value.strip().lower()

    value = value.replace("_", " ")
    value = value.replace("-", " ")

    value = re.sub(r"[*#]", "", value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def _canonical_field(heading: str) -> str | None:
    """
    Map a model-generated heading to a ResearchOutput field.
    """

    normalized = _normalize_heading(heading)

    for field_name, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            if normalized == _normalize_heading(alias):
                return field_name

    return None


def _to_list(value) -> list[str]:
    """
    Convert model output into a clean list of strings.
    """

    if value is None:
        return []

    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    if not isinstance(value, str):
        return [str(value).strip()]

    text = value.strip()

    if not text:
        return []

    lines = text.splitlines()

    items = []

    for line in lines:
        cleaned = line.strip()

        cleaned = re.sub(
            r"^[-*•]\s*",
            "",
            cleaned,
        )

        cleaned = re.sub(
            r"^\d+[.)]\s*",
            "",
            cleaned,
        )

        cleaned = cleaned.strip()

        if cleaned:
            items.append(cleaned)

    if items:
        return items

    return [text]


def _try_json(raw_response: str) -> dict | None:
    """
    First attempt to interpret the response as JSON.
    """

    cleaned = _clean_text(raw_response)

    candidates = [cleaned]

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:
        candidates.append(
            cleaned[start:end + 1]
        )

    for candidate in candidates:
        try:
            data = json.loads(
                candidate,
                strict=False,
            )

            if isinstance(data, dict):
                return data

        except (json.JSONDecodeError, TypeError):
            continue

    return None


def _parse_sections(raw_response: str) -> dict:
    """
    Parse labeled sections from a non-JSON response.

    This accepts headings such as:

    PROBLEM_STATEMENT:
    Problem Statement:
    **Problem Statement:**
    ## Problem:
    """

    text = _clean_text(raw_response)

    result = {}

    current_field = None
    current_lines = []

    def save_current():
        nonlocal current_field
        nonlocal current_lines

        if current_field:
            content = "\n".join(
                current_lines
            ).strip()

            if content:
                result[current_field] = content

        current_lines = []

    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line:
            if current_field:
                current_lines.append("")
            continue

        heading_candidate = line

        heading_candidate = re.sub(
            r"^[#*\s]+",
            "",
            heading_candidate,
        )

        heading_candidate = re.sub(
            r"[*\s]+$",
            "",
            heading_candidate,
        )

        if ":" in heading_candidate:
            possible_heading, inline_content = (
                heading_candidate.split(":", 1)
            )

            field = _canonical_field(
                possible_heading
            )

            if field:
                save_current()

                current_field = field

                if inline_content.strip():
                    current_lines.append(
                        inline_content.strip()
                    )

                continue

        heading_without_colon = (
            heading_candidate.rstrip(":").strip()
        )

        field = _canonical_field(
            heading_without_colon
        )

        if field:
            save_current()
            current_field = field
            continue

        if current_field:
            current_lines.append(raw_line)

    save_current()

    return result


def _normalize_json_fields(data: dict) -> dict:
    """
    Normalize JSON keys if the model used slightly different field names.
    """

    normalized = {}

    for key, value in data.items():
        field = _canonical_field(
            str(key)
        )

        if field:
            normalized[field] = value

    return normalized


def _build_research_output(
    data: dict,
    startup_idea: str,
    raw_response: str,
) -> ResearchOutput:
    """
    Always construct a valid ResearchOutput from whatever usable structured
    information the model returned.

    Missing fields receive explicit validation placeholders rather than
    invented facts.
    """

    problem_statement = str(
        data.get(
            "problem_statement",
            (
                "The Research Agent did not clearly isolate the problem "
                f"statement. The original startup idea is: {startup_idea}"
            ),
        )
    ).strip()

    target_users = _to_list(
        data.get("target_users")
    )

    if not target_users:
        target_users = [
            "Target users require validation."
        ]

    customer_segments = _to_list(
        data.get("customer_segments")
    )

    if not customer_segments:
        customer_segments = [
            "Customer segments require validation."
        ]

    competitors = _to_list(
        data.get("competitors")
    )

    if not competitors:
        competitors = [
            "Competitor research requires validation; "
            "no live web research was performed."
        ]

    existing_solutions = _to_list(
        data.get("existing_solutions")
    )

    if not existing_solutions:
        existing_solutions = [
            "Existing solutions require validation."
        ]

    market_opportunity = str(
        data.get(
            "market_opportunity",
            (
                "Market opportunity requires validation. "
                "No live market data was available to the Research Agent."
            ),
        )
    ).strip()

    differentiation = _to_list(
        data.get("differentiation")
    )

    if not differentiation:
        differentiation = [
            "Differentiation opportunities require validation."
        ]

    research_risks = _to_list(
        data.get("research_risks")
    )

    if not research_risks:
        research_risks = [
            "Research conclusions may rely on unvalidated assumptions.",
            "No live internet or market-data research was performed.",
        ]

    validation_questions = _to_list(
        data.get("validation_questions")
    )

    if not validation_questions:
        validation_questions = [
            "Does the target user experience this problem frequently?",
            "How are target users currently solving this problem?",
            "Would users adopt the proposed solution?",
            "Which assumptions should be tested before building the MVP?",
        ]

    return ResearchOutput(
        problem_statement=problem_statement,
        target_users=target_users,
        customer_segments=customer_segments,
        competitors=competitors,
        existing_solutions=existing_solutions,
        market_opportunity=market_opportunity,
        differentiation=differentiation,
        research_risks=research_risks,
        validation_questions=validation_questions,
    )


def _parse_research_response(
    raw_response: str,
    startup_idea: str,
) -> ResearchOutput:
    """
    Convert the model response into ResearchOutput.

    Strategy:
    1. Try JSON.
    2. Try labeled sections.
    3. Preserve useful raw output if formatting was unexpected.
    4. Fill genuinely missing fields with transparent validation notes.
    """

    json_data = _try_json(
        raw_response
    )

    if json_data:
        data = _normalize_json_fields(
            json_data
        )

    else:
        data = _parse_sections(
            raw_response
        )

    if not data:
        # The LLM responded, but ignored our formatting instructions.
        # Preserve that response instead of throwing away useful work.
        data = {
            "problem_statement": (
                "The Research Agent returned an unstructured analysis. "
                "Its analysis is preserved below:\n\n"
                + _clean_text(raw_response)
            ),
            "research_risks": [
                (
                    "The Research Agent did not follow the requested "
                    "structured response format."
                ),
                (
                    "Research output should be reviewed before being "
                    "used for downstream product decisions."
                ),
            ],
        }

    return _build_research_output(
        data=data,
        startup_idea=startup_idea,
        raw_response=raw_response,
    )


def run_research_agent(
    startup_idea: str,
) -> ResearchOutput:
    """
    Run FOUNDry's Research Agent.

    Formatting problems from the local LLM are handled locally.
    Genuine Ollama/service failures are still exposed as errors.
    """

    if not startup_idea or not startup_idea.strip():
        raise AgentServiceError(
            "Startup idea cannot be empty."
        )

    user_prompt = f"""
STARTUP IDEA:

{startup_idea.strip()}

Perform the startup research analysis.

Prefer the JSON schema from your instructions.
If you cannot reliably return JSON, use the specified section headings.

Remember:
- no fake internet research
- no invented precise market statistics
- identify assumptions requiring validation
"""

    try:
        raw_response = run_agent(
            system_prompt=RESEARCH_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

    except AIServiceError as exc:
        raise AgentServiceError(
            "Research Agent could not contact the AI service. "
            f"Details: {exc}"
        ) from exc

    if not raw_response or not raw_response.strip():
        raise AgentServiceError(
            "Research Agent received an empty response from the AI service."
        )

    return _parse_research_response(
        raw_response=raw_response,
        startup_idea=startup_idea,
    )
PRODUCT_SYSTEM_PROMPT = """
You are the Product Agent inside FOUNDry, an AI startup operating system.

You receive:
1. The original startup idea.
2. Structured research produced by FOUNDry's Research Agent.

Your job is to turn that research into a concrete and BUILDABLE MVP.

Responsibilities:
- Define the product clearly.
- Identify the primary target user.
- State the core problem.
- Define the smallest useful MVP.
- Prioritize features.
- Define the main user journey.
- Define practical product requirements.
- Suggest a future roadmap.
- Define measurable success metrics.

HACKATHON RULE:
The MVP must be small enough for a small team to actually build.
Do not turn every possible idea into an MVP feature.

Return your response using these headings:

PRODUCT_SUMMARY:
TARGET_USER:
CORE_PROBLEM:
MVP_FEATURES:
USER_FLOW:
PRODUCT_REQUIREMENTS:
PRIORITY_FEATURES:
FUTURE_ROADMAP:
SUCCESS_METRICS:

For list sections, use one item per line beginning with "- ".
"""


PRODUCT_FIELD_ALIASES = {
    "product_summary": [
        "product_summary",
        "product summary",
        "summary",
    ],
    "target_user": [
        "target_user",
        "target user",
        "primary user",
    ],
    "core_problem": [
        "core_problem",
        "core problem",
        "problem",
    ],
    "mvp_features": [
        "mvp_features",
        "mvp features",
        "features",
    ],
    "user_flow": [
        "user_flow",
        "user flow",
        "user journey",
    ],
    "product_requirements": [
        "product_requirements",
        "product requirements",
        "requirements",
    ],
    "priority_features": [
        "priority_features",
        "priority features",
        "priorities",
    ],
    "future_roadmap": [
        "future_roadmap",
        "future roadmap",
        "roadmap",
    ],
    "success_metrics": [
        "success_metrics",
        "success metrics",
        "metrics",
    ],
}


def _canonical_product_field(
    heading: str,
) -> str | None:
    normalized = _normalize_heading(heading)

    for field_name, aliases in PRODUCT_FIELD_ALIASES.items():
        for alias in aliases:
            if normalized == _normalize_heading(alias):
                return field_name

    return None


def _parse_product_sections(
    raw_response: str,
) -> dict:
    """
    Parse Product Agent headings into canonical fields.
    """

    text = _clean_text(raw_response)

    result = {}

    current_field = None
    current_lines = []

    def save_current():
        nonlocal current_field
        nonlocal current_lines

        if current_field:
            content = "\n".join(
                current_lines
            ).strip()

            if content:
                result[current_field] = content

        current_lines = []

    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line:
            if current_field:
                current_lines.append("")
            continue

        heading_candidate = re.sub(
            r"^[#*\s]+",
            "",
            line,
        )

        heading_candidate = re.sub(
            r"[*\s]+$",
            "",
            heading_candidate,
        )

        if ":" in heading_candidate:
            possible_heading, inline_content = (
                heading_candidate.split(":", 1)
            )

            field = _canonical_product_field(
                possible_heading
            )

            if field:
                save_current()
                current_field = field

                if inline_content.strip():
                    current_lines.append(
                        inline_content.strip()
                    )

                continue

        field = _canonical_product_field(
            heading_candidate.rstrip(":")
        )

        if field:
            save_current()
            current_field = field
            continue

        if current_field:
            current_lines.append(raw_line)

    save_current()

    return result


def _build_product_output(
    data: dict,
    startup_idea: str,
) -> ProductOutput:
    """
    Build a valid ProductOutput while clearly marking missing information.
    """

    return ProductOutput(
        product_summary=str(
            data.get(
                "product_summary",
                f"MVP product based on the startup idea: {startup_idea}",
            )
        ).strip(),

        target_user=str(
            data.get(
                "target_user",
                "Primary target user requires validation.",
            )
        ).strip(),

        core_problem=str(
            data.get(
                "core_problem",
                "Core product problem requires validation.",
            )
        ).strip(),

        mvp_features=(
            _to_list(data.get("mvp_features"))
            or ["MVP feature scope requires validation."]
        ),

        user_flow=(
            _to_list(data.get("user_flow"))
            or ["Primary user flow requires validation."]
        ),

        product_requirements=(
            _to_list(data.get("product_requirements"))
            or ["Product requirements require validation."]
        ),

        priority_features=(
            _to_list(data.get("priority_features"))
            or ["Feature priorities require validation."]
        ),

        future_roadmap=(
            _to_list(data.get("future_roadmap"))
            or ["Future roadmap requires validation after MVP testing."]
        ),

        success_metrics=(
            _to_list(data.get("success_metrics"))
            or ["MVP success metrics require validation."]
        ),
    )


def run_product_agent(
    startup_idea: str,
    research: ResearchOutput,
) -> ProductOutput:
    """
    Run FOUNDry's Product Agent using the original idea plus Research output.
    """

    research_context = research.model_dump_json(
        indent=2
    )

    user_prompt = f"""
ORIGINAL STARTUP IDEA:

{startup_idea}

RESEARCH AGENT OUTPUT:

{research_context}

Using the research above, design the smallest useful MVP.

Do not repeat the research report.
Make concrete product decisions.
Use exactly the requested section headings.
"""

    try:
        raw_response = run_agent(
            system_prompt=PRODUCT_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

    except AIServiceError as exc:
        raise AgentServiceError(
            "Product Agent could not contact the AI service. "
            f"Details: {exc}"
        ) from exc

    if not raw_response or not raw_response.strip():
        raise AgentServiceError(
            "Product Agent received an empty response from the AI service."
        )

    data = _parse_product_sections(
        raw_response
    )

    if not data:
        data = {
            "product_summary": (
                "The Product Agent returned an unstructured response. "
                "Its analysis is preserved below:\n\n"
                + _clean_text(raw_response)
            )
        }

    return _build_product_output(
        data=data,
        startup_idea=startup_idea,
    )
FINANCE_SYSTEM_PROMPT = """
You are the Finance and Business Agent inside FOUNDry,
an AI startup operating system.

You receive:
1. The original startup idea.
2. Structured Research Agent output.
3. Structured Product Agent output.

Your job is to determine how the proposed MVP could become
a viable business.

Responsibilities:
- Define a practical business model.
- Identify possible revenue streams.
- Recommend pricing logic.
- Identify major cost categories.
- State important financial assumptions.
- Identify business and financial risks.
- Recommend the strongest business model for the MVP.

IMPORTANT:
Do not invent precise financial data.
Do not invent market size numbers.
Do not present estimates as known facts.

Clearly label assumptions.

For a hackathon MVP, prioritize a simple business model
that could realistically be tested.

Return your response using exactly these headings:

BUSINESS_MODEL:
REVENUE_STREAMS:
PRICING_STRATEGY:
MAJOR_COSTS:
FINANCIAL_ASSUMPTIONS:
BUSINESS_RISKS:
FINANCIAL_RECOMMENDATION:

For list sections, use one item per line beginning with "- ".
"""


FINANCE_FIELD_ALIASES = {
    "business_model": [
        "business_model",
        "business model",
        "model",
    ],
    "revenue_streams": [
        "revenue_streams",
        "revenue streams",
        "revenue",
    ],
    "pricing_strategy": [
        "pricing_strategy",
        "pricing strategy",
        "pricing",
    ],
    "major_costs": [
        "major_costs",
        "major costs",
        "costs",
        "cost structure",
    ],
    "financial_assumptions": [
        "financial_assumptions",
        "financial assumptions",
        "assumptions",
    ],
    "business_risks": [
        "business_risks",
        "business risks",
        "financial risks",
        "risks",
    ],
    "financial_recommendation": [
        "financial_recommendation",
        "financial recommendation",
        "recommendation",
        "recommended model",
    ],
}


def _canonical_finance_field(
    heading: str,
) -> str | None:
    normalized = _normalize_heading(heading)

    for field_name, aliases in FINANCE_FIELD_ALIASES.items():
        for alias in aliases:
            if normalized == _normalize_heading(alias):
                return field_name

    return None


def _parse_finance_sections(
    raw_response: str,
) -> dict:
    """
    Parse Finance Agent headings into canonical fields.
    """

    text = _clean_text(raw_response)

    result = {}

    current_field = None
    current_lines = []

    def save_current():
        nonlocal current_field
        nonlocal current_lines

        if current_field:
            content = "\n".join(
                current_lines
            ).strip()

            if content:
                result[current_field] = content

        current_lines = []

    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line:
            if current_field:
                current_lines.append("")
            continue

        heading_candidate = re.sub(
            r"^[#*\s]+",
            "",
            line,
        )

        heading_candidate = re.sub(
            r"[*\s]+$",
            "",
            heading_candidate,
        )

        if ":" in heading_candidate:
            possible_heading, inline_content = (
                heading_candidate.split(":", 1)
            )

            field = _canonical_finance_field(
                possible_heading
            )

            if field:
                save_current()

                current_field = field

                if inline_content.strip():
                    current_lines.append(
                        inline_content.strip()
                    )

                continue

        field = _canonical_finance_field(
            heading_candidate.rstrip(":")
        )

        if field:
            save_current()
            current_field = field
            continue

        if current_field:
            current_lines.append(raw_line)

    save_current()

    return result


def _build_finance_output(
    data: dict,
) -> FinanceOutput:
    """
    Construct a valid FinanceOutput.

    Missing information is marked as an assumption or validation need
    rather than replaced with invented financial facts.
    """

    return FinanceOutput(
        business_model=str(
            data.get(
                "business_model",
                "Business model requires validation.",
            )
        ).strip(),

        revenue_streams=(
            _to_list(data.get("revenue_streams"))
            or [
                "Revenue streams require validation."
            ]
        ),

        pricing_strategy=str(
            data.get(
                "pricing_strategy",
                (
                    "Pricing should be tested with target customers "
                    "before committing to specific price points."
                ),
            )
        ).strip(),

        major_costs=(
            _to_list(data.get("major_costs"))
            or [
                "Major operating and technology costs require validation."
            ]
        ),

        financial_assumptions=(
            _to_list(
                data.get("financial_assumptions")
            )
            or [
                (
                    "Customer willingness to pay has not yet "
                    "been validated."
                )
            ]
        ),

        business_risks=(
            _to_list(data.get("business_risks"))
            or [
                "Business viability depends on unvalidated assumptions."
            ]
        ),

        financial_recommendation=str(
            data.get(
                "financial_recommendation",
                (
                    "Validate willingness to pay and customer acquisition "
                    "before scaling the business model."
                ),
            )
        ).strip(),
    )


def run_finance_agent(
    startup_idea: str,
    research: ResearchOutput,
    product: ProductOutput,
) -> FinanceOutput:
    """
    Run FOUNDry's Finance Agent.

    Finance depends on both Research and Product outputs.
    """

    research_context = research.model_dump_json(
        indent=2
    )

    product_context = product.model_dump_json(
        indent=2
    )

    user_prompt = f"""
ORIGINAL STARTUP IDEA:

{startup_idea}

RESEARCH AGENT OUTPUT:

{research_context}

PRODUCT AGENT OUTPUT:

{product_context}

Using the research and product plan above,
design a practical business model for the MVP.

Do not invent precise financial figures.
Clearly identify assumptions.

Use exactly the requested section headings.
"""

    try:
        raw_response = run_agent(
            system_prompt=FINANCE_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

    except AIServiceError as exc:
        raise AgentServiceError(
            "Finance Agent could not contact the AI service. "
            f"Details: {exc}"
        ) from exc

    if not raw_response or not raw_response.strip():
        raise AgentServiceError(
            "Finance Agent received an empty response from the AI service."
        )

    data = _parse_finance_sections(
        raw_response
    )

    if not data:
        data = {
            "business_model": (
                "The Finance Agent returned an unstructured response. "
                "Its analysis is preserved below:\n\n"
                + _clean_text(raw_response)
            ),
            "business_risks": [
                (
                    "Finance output was not returned in the requested "
                    "structured format."
                )
            ],
        }

    return _build_finance_output(
        data=data
    )
CTO_SYSTEM_PROMPT = """
You are the CTO / Builder Agent inside FOUNDry,
an AI startup operating system.

You receive:
1. The original startup idea.
2. Research Agent output.
3. Product Agent output.
4. Finance Agent output.

Your job is to convert those decisions into a concrete technical
implementation plan.

Responsibilities:
- Summarize the technical solution.
- Recommend the system architecture.
- Define frontend requirements.
- Define backend requirements.
- Define database requirements where applicable.
- Define API requirements.
- Define AI architecture where applicable.
- Define the implementation sequence.
- Identify technical risks.
- Define concrete build requirements.

IMPORTANT:
You are producing a BUILD SPECIFICATION.

Do not pretend that code has already been written.
Do not pretend that infrastructure has already been deployed.
Do not over-engineer the MVP.
Prefer the smallest architecture capable of delivering the Product
Agent's MVP.

The technical plan must remain consistent with the Product Agent's
requirements.

Return your response using exactly these headings:

TECHNICAL_SUMMARY:
ARCHITECTURE:
FRONTEND_STACK:
BACKEND_STACK:
DATABASE_PLAN:
API_PLAN:
AI_ARCHITECTURE:
IMPLEMENTATION_PLAN:
TECHNICAL_RISKS:
BUILD_REQUIREMENTS:

For list sections, use one item per line beginning with "- ".
"""


CTO_FIELD_ALIASES = {
    "technical_summary": [
        "technical_summary",
        "technical summary",
        "summary",
    ],
    "architecture": [
        "architecture",
        "system architecture",
        "technical architecture",
    ],
    "frontend_stack": [
        "frontend_stack",
        "frontend stack",
        "frontend",
    ],
    "backend_stack": [
        "backend_stack",
        "backend stack",
        "backend",
    ],
    "database_plan": [
        "database_plan",
        "database plan",
        "database",
        "data storage",
    ],
    "api_plan": [
        "api_plan",
        "api plan",
        "apis",
        "api requirements",
    ],
    "ai_architecture": [
        "ai_architecture",
        "ai architecture",
        "ai",
        "llm architecture",
    ],
    "implementation_plan": [
        "implementation_plan",
        "implementation plan",
        "implementation sequence",
        "build sequence",
    ],
    "technical_risks": [
        "technical_risks",
        "technical risks",
        "risks",
    ],
    "build_requirements": [
        "build_requirements",
        "build requirements",
        "requirements",
    ],
}


def _canonical_cto_field(
    heading: str,
) -> str | None:
    normalized = _normalize_heading(heading)

    for field_name, aliases in CTO_FIELD_ALIASES.items():
        for alias in aliases:
            if normalized == _normalize_heading(alias):
                return field_name

    return None


def _parse_cto_sections(
    raw_response: str,
) -> dict:
    """
    Parse CTO Agent headings into canonical TechnicalOutput fields.
    """

    text = _clean_text(raw_response)

    result = {}

    current_field = None
    current_lines = []

    def save_current():
        nonlocal current_field
        nonlocal current_lines

        if current_field:
            content = "\n".join(
                current_lines
            ).strip()

            if content:
                result[current_field] = content

        current_lines = []

    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line:
            if current_field:
                current_lines.append("")
            continue

        heading_candidate = re.sub(
            r"^[#*\s]+",
            "",
            line,
        )

        heading_candidate = re.sub(
            r"[*\s]+$",
            "",
            heading_candidate,
        )

        if ":" in heading_candidate:
            possible_heading, inline_content = (
                heading_candidate.split(":", 1)
            )

            field = _canonical_cto_field(
                possible_heading
            )

            if field:
                save_current()
                current_field = field

                if inline_content.strip():
                    current_lines.append(
                        inline_content.strip()
                    )

                continue

        field = _canonical_cto_field(
            heading_candidate.rstrip(":")
        )

        if field:
            save_current()
            current_field = field
            continue

        if current_field:
            current_lines.append(raw_line)

    save_current()

    return result


def _build_cto_output(
    data: dict,
) -> TechnicalOutput:
    """
    Construct a validated TechnicalOutput.

    Missing technical decisions are marked for validation rather than
    invented silently.
    """

    return TechnicalOutput(
        technical_summary=str(
            data.get(
                "technical_summary",
                "Technical implementation requires further definition.",
            )
        ).strip(),

        architecture=str(
            data.get(
                "architecture",
                "MVP architecture requires validation.",
            )
        ).strip(),

        frontend_stack=(
            _to_list(data.get("frontend_stack"))
            or ["Frontend technology choice requires validation."]
        ),

        backend_stack=(
            _to_list(data.get("backend_stack"))
            or ["Backend technology choice requires validation."]
        ),

        database_plan=str(
            data.get(
                "database_plan",
                (
                    "Database requirements should be determined from "
                    "the MVP's persistence needs."
                ),
            )
        ).strip(),

        api_plan=(
            _to_list(data.get("api_plan"))
            or ["API requirements require validation."]
        ),

        ai_architecture=str(
            data.get(
                "ai_architecture",
                (
                    "AI architecture should be included only where "
                    "required by the MVP."
                ),
            )
        ).strip(),

        implementation_plan=(
            _to_list(data.get("implementation_plan"))
            or ["Implementation sequence requires validation."]
        ),

        technical_risks=(
            _to_list(data.get("technical_risks"))
            or ["Technical risks require validation."]
        ),

        build_requirements=(
            _to_list(data.get("build_requirements"))
            or ["Build requirements require validation."]
        ),
    )


def run_cto_agent(
    startup_idea: str,
    research: ResearchOutput,
    product: ProductOutput,
    finance: FinanceOutput,
) -> TechnicalOutput:
    """
    Run FOUNDry's CTO / Builder Agent.

    Ollama is attempted first.

    For the hackathon MVP, if the local model times out, FOUNDry produces
    a conservative deterministic technical build specification instead
    of failing the entire startup workflow.
    """

    research_context = f"""
Problem:
{research.problem_statement}

Target users:
{", ".join(research.target_users[:3])}

Differentiation:
{", ".join(research.differentiation[:3])}
""".strip()

    product_context = f"""
Product summary:
{product.product_summary}

Target user:
{product.target_user}

Core problem:
{product.core_problem}

MVP features:
{chr(10).join(f"- {item}" for item in product.mvp_features[:5])}

Priority features:
{chr(10).join(f"- {item}" for item in product.priority_features[:4])}
""".strip()

    finance_context = f"""
Business model:
{finance.business_model}

Pricing strategy:
{finance.pricing_strategy}

Financial recommendation:
{finance.financial_recommendation}
""".strip()

    user_prompt = f"""
STARTUP IDEA:

{startup_idea}

RESEARCH:
{research_context}

PRODUCT:
{product_context}

BUSINESS:
{finance_context}

Create a SHORT technical build specification for the MVP only.

Do not repeat upstream analysis.
Do not propose production-scale infrastructure.
Keep your answer concise.

Use exactly these headings:

TECHNICAL_SUMMARY:
ARCHITECTURE:
FRONTEND_STACK:
BACKEND_STACK:
DATABASE_PLAN:
API_PLAN:
AI_ARCHITECTURE:
IMPLEMENTATION_PLAN:
TECHNICAL_RISKS:
BUILD_REQUIREMENTS:
"""

    try:
        raw_response = run_agent(
            system_prompt=CTO_SYSTEM_PROMPT,
            user_prompt=user_prompt,

            # Fail fast instead of blocking the whole workflow.
            timeout=90,

            # CTO does not need an essay.
            max_output_tokens=450,
        )

        if raw_response and raw_response.strip():
            data = _parse_cto_sections(
                raw_response
            )

            if data:
                return _build_cto_output(
                    data=data
                )

    except AIServiceError:
        # Intentional fallback below.
        pass

    except Exception:
        # Formatting failure should not kill the hackathon workflow.
        pass

    # ---------------------------------------------------------
    # HACKATHON FALLBACK
    # ---------------------------------------------------------
    #
    # This is NOT pretending that Ollama completed successfully.
    # It is a conservative technical specification assembled from
    # already-approved Product decisions.
    #
    # It keeps the workflow operational when local generation is slow.

    mvp_features = (
        product.mvp_features[:5]
        if product.mvp_features
        else ["Implement the smallest usable version of the core product."]
    )

    implementation_plan = [
        "Confirm the MVP scope and primary user flow.",
        "Implement the core frontend screens required for the MVP.",
        "Implement backend API endpoints for the core product actions.",
        "Add the minimum persistence required for MVP data.",
        "Integrate AI functionality only where required by the product.",
        "Test the primary end-to-end user journey.",
        "Fix critical QA issues before demo or launch.",
    ]

    api_plan = [
        "Provide API endpoints for the MVP's primary user actions.",
        "Validate incoming requests using structured schemas.",
        "Return structured error responses for failed operations.",
        "Expose health/status endpoints for debugging where appropriate.",
    ]

    return TechnicalOutput(
        technical_summary=(
            "Build a small web-based MVP focused only on the Product "
            "Agent's highest-priority features. Use a simple client/server "
            "architecture and avoid production-scale infrastructure."
        ),

        architecture=(
            "Single web frontend communicating with a single backend API. "
            "Keep business logic in the backend and use external or local AI "
            "services behind an isolated service layer where AI is required."
        ),

        frontend_stack=[
            "React or another lightweight component-based web frontend",
            "Simple API client for backend communication",
        ],

        backend_stack=[
            "Python",
            "FastAPI",
            "Pydantic for request and response validation",
        ],

        database_plan=(
            "Use in-memory storage for a demo if persistence is not essential. "
            "If the MVP requires persistent user or product data, use a small "
            "SQLite database before introducing production database infrastructure."
        ),

        api_plan=api_plan,

        ai_architecture=(
            "Keep AI integration behind a dedicated service layer. "
            "Send only task-relevant context to the model and validate "
            "AI-generated outputs before using them downstream."
        ),

        implementation_plan=implementation_plan,

        technical_risks=[
            "Local AI inference may be too slow for interactive workflows.",
            "AI responses may be malformed or inconsistent.",
            "The MVP scope may grow beyond what can be reliably demonstrated.",
            "Technical decisions generated by the CTO fallback require review.",
        ],

        build_requirements=[
            f"MVP feature: {feature}"
            for feature in mvp_features
        ] + [
            (
                "CTO LLM generation exceeded the allowed hackathon response "
                "time, so FOUNDry used its deterministic fallback build planner."
            )
        ],
    )
def _canonical_qa_field(
    heading: str,
) -> str | None:
    normalized = _normalize_heading(heading)

    for field_name, aliases in QA_FIELD_ALIASES.items():
        for alias in aliases:
            if normalized == _normalize_heading(alias):
                return field_name

    return None


def _parse_qa_sections(
    raw_response: str,
) -> dict:
    text = _clean_text(raw_response)

    result = {}
    current_field = None
    current_lines = []

    def save_current():
        nonlocal current_field
        nonlocal current_lines

        if current_field:
            content = "\n".join(current_lines).strip()

            if content:
                result[current_field] = content

        current_lines = []

    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line:
            if current_field:
                current_lines.append("")
            continue

        heading_candidate = re.sub(
            r"^[#*\s]+",
            "",
            line,
        )

        heading_candidate = re.sub(
            r"[*\s]+$",
            "",
            heading_candidate,
        )

        if ":" in heading_candidate:
            possible_heading, inline_content = (
                heading_candidate.split(":", 1)
            )

            field = _canonical_qa_field(
                possible_heading
            )

            if field:
                save_current()
                current_field = field

                if inline_content.strip():
                    current_lines.append(
                        inline_content.strip()
                    )

                continue

        field = _canonical_qa_field(
            heading_candidate.rstrip(":")
        )

        if field:
            save_current()
            current_field = field
            continue

        if current_field:
            current_lines.append(raw_line)

    save_current()

    return result


def _parse_readiness_score(value) -> int:
    """
    Extract a safe 0-100 readiness score from model output.
    """

    if isinstance(value, int):
        return max(0, min(100, value))

    text = str(value or "")

    match = re.search(
        r"\b(100|[1-9]?[0-9])\b",
        text,
    )

    if not match:
        return 50

    return max(
        0,
        min(100, int(match.group(1))),
    )


def _build_qa_output(
    data: dict,
) -> QAOutput:
    return QAOutput(
        strengths=(
            _to_list(data.get("strengths"))
            or ["No clear strengths were identified."]
        ),

        problems=(
            _to_list(data.get("problems"))
            or ["Plan requires further QA validation."]
        ),

        missing_requirements=(
            _to_list(data.get("missing_requirements"))
            or ["Missing requirements require validation."]
        ),

        technical_risks=(
            _to_list(data.get("technical_risks"))
            or ["Technical risks require further validation."]
        ),

        business_risks=(
            _to_list(data.get("business_risks"))
            or ["Business risks require further validation."]
        ),

        product_risks=(
            _to_list(data.get("product_risks"))
            or ["Product risks require further validation."]
        ),

        required_changes=(
            _to_list(data.get("required_changes"))
            or ["Review unresolved assumptions before building."]
        ),

        build_readiness_score=_parse_readiness_score(
            data.get("build_readiness_score")
        ),
    )


def run_qa_agent(
    startup_idea: str,
    research: ResearchOutput,
    product: ProductOutput,
    finance: FinanceOutput,
    technical_plan: TechnicalOutput,
) -> QAOutput:
    """
    Run FOUNDry's QA Agent.

    Ollama is attempted first. If local inference is too slow,
    FOUNDry falls back to deterministic critical checks so the
    overall workflow can still complete.
    """

    product_context = f"""
Product:
{product.product_summary}

Core problem:
{product.core_problem}

MVP features:
{chr(10).join(f"- {item}" for item in product.mvp_features[:5])}
""".strip()

    finance_context = f"""
Business model:
{finance.business_model}

Business risks:
{chr(10).join(f"- {item}" for item in finance.business_risks[:4])}
""".strip()

    technical_context = f"""
Technical summary:
{technical_plan.technical_summary}

Technical risks:
{chr(10).join(f"- {item}" for item in technical_plan.technical_risks[:4])}
""".strip()

    user_prompt = f"""
STARTUP IDEA:

{startup_idea}

PRODUCT:
{product_context}

BUSINESS:
{finance_context}

TECHNICAL:
{technical_context}

Critically review this MVP.

Keep the answer concise.
Find only important problems and build blockers.

Use exactly these headings:

STRENGTHS:
PROBLEMS:
MISSING_REQUIREMENTS:
TECHNICAL_RISKS:
BUSINESS_RISKS:
PRODUCT_RISKS:
REQUIRED_CHANGES:
BUILD_READINESS_SCORE:
"""

    try:
        raw_response = run_agent(
            system_prompt=QA_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            timeout=90,
            max_output_tokens=400,
        )

        if raw_response and raw_response.strip():
            data = _parse_qa_sections(
                raw_response
            )

            if data:
                return _build_qa_output(
                    data=data
                )

    except AIServiceError:
        pass

    except Exception:
        pass

    # ---------------------------------------------------------
    # HACKATHON QA FALLBACK
    # ---------------------------------------------------------

    problems = []

    missing_requirements = []

    product_risks = list(
        research.research_risks[:3]
    )

    technical_risks = list(
        technical_plan.technical_risks[:4]
    )

    business_risks = list(
        finance.business_risks[:4]
    )

    if not product.mvp_features:
        problems.append(
            "The MVP does not contain clearly defined features."
        )

    if not product.success_metrics:
        missing_requirements.append(
            "The MVP needs measurable success metrics."
        )

    if not technical_plan.implementation_plan:
        missing_requirements.append(
            "The technical plan needs an implementation sequence."
        )

    if not research.validation_questions:
        missing_requirements.append(
            "Critical startup assumptions need validation questions."
        )

    if not problems:
        problems.append(
            "Major assumptions still require real user validation before "
            "the MVP can be considered proven."
        )

    if not missing_requirements:
        missing_requirements.append(
            "No blocking structural requirement was detected, but the "
            "plan still requires real-world validation."
        )

    required_changes = [
        "Validate the highest-risk assumptions with target users.",
        "Build only the priority MVP features.",
        "Test the primary user journey end-to-end.",
        "Review technical risks before demo or launch.",
    ]

    # Conservative score because this is a hackathon fallback rather
    # than a complete AI-generated QA review.
    readiness_score = 72

    return QAOutput(
        strengths=[
            "The workflow contains Research, Product, Business, and Technical plans.",
            "The MVP has a defined scope and implementation direction.",
            "The architecture is intentionally limited for hackathon delivery.",
        ],

        problems=problems,

        missing_requirements=missing_requirements,

        technical_risks=(
            technical_risks
            or ["Technical assumptions require implementation testing."]
        ),

        business_risks=(
            business_risks
            or ["Customer willingness to pay remains unvalidated."]
        ),

        product_risks=(
            product_risks
            or ["User demand and retention remain unvalidated."]
        ),

        required_changes=required_changes,

        build_readiness_score=readiness_score,
    )