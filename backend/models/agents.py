from enum import Enum
from typing import Any, Optional, List, Dict

from pydantic import BaseModel, Field
from models.evidence import EvidenceItem
from models.finance_model import DeterministicFinancialModel
from models.mvp_spec import MVPSpec


class AgentStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    NEEDS_REVISION = "needs_revision"


class ResearchOutput(BaseModel):
    problem_statement: str
    target_users: list[str]
    customer_segments: list[str]
    competitors: list[str]
    existing_solutions: list[str]
    market_opportunity: str
    differentiation: list[str]
    research_risks: list[str]
    validation_questions: list[str]
    web_research_available: bool = False
    evidence_notes: list[str] = Field(default_factory=list)


class ProductOutput(BaseModel):
    product_summary: str
    target_user: str
    core_problem: str
    mvp_features: list[str]
    user_flow: list[str]
    product_requirements: list[str]
    priority_features: list[str]
    future_roadmap: list[str]
    success_metrics: list[str]


class FinanceOutput(BaseModel):
    business_model: str
    revenue_streams: list[str]
    pricing_strategy: str
    major_costs: list[str]
    financial_assumptions: list[str]
    business_risks: list[str]
    financial_recommendation: str


class TechnicalOutput(BaseModel):
    technical_summary: str
    architecture: str
    frontend_stack: list[str]
    backend_stack: list[str]
    database_plan: str
    api_plan: list[str]
    ai_architecture: str
    implementation_plan: list[str]
    technical_risks: list[str]
    build_requirements: list[str]


class QAOutput(BaseModel):
    strengths: list[str]
    problems: list[str]
    missing_requirements: list[str]
    technical_risks: list[str]
    business_risks: list[str]
    product_risks: list[str]
    required_changes: list[str]

    build_readiness_score: int = Field(
        ge=0,
        le=100,
        description="Build readiness score from 0 to 100.",
    )


class AgentState(BaseModel):
    agent: str
    status: AgentStatus = AgentStatus.QUEUED
    error: str | None = None


class CEOReview(BaseModel):
    approved: bool
    summary: str
    revision_required: bool = False
    revision_agent: str | None = None
    revision_reason: str | None = None


class FinalBuildPlan(BaseModel):
    executive_summary: str
    validated_problem: str
    target_customer: str
    mvp_scope: list[str]
    business_strategy: str
    technical_strategy: str
    implementation_sequence: list[str]
    major_risks: list[str]
    validation_tasks: list[str]
    launch_readiness: str


class StartupState(BaseModel):
    id: str
    startup_idea: str

    research: ResearchOutput | None = None
    product: ProductOutput | None = None
    finance: FinanceOutput | None = None
    technical_plan: TechnicalOutput | None = None
    qa: QAOutput | None = None
    ceo_review: CEOReview | None = None
    final_build_plan: FinalBuildPlan | None = None

    # Truthful Evidence & Advanced Features
    web_research_available: bool = False
    evidence: list[EvidenceItem] = Field(default_factory=list)
    financial_model: DeterministicFinancialModel | None = None
    mvp_spec: MVPSpec | None = None

    current_stage: str = "created"
    status: str = "queued"

    revision_count: int = 0
    max_revisions: int = 1

    agents: dict[str, AgentState] = Field(
        default_factory=lambda: {
            "ceo": AgentState(agent="ceo"),
            "research": AgentState(agent="research"),
            "product": AgentState(agent="product"),
            "finance": AgentState(agent="finance"),
            "cto": AgentState(agent="cto"),
            "qa": AgentState(agent="qa"),
        }
    )

    metadata: dict[str, Any] = Field(default_factory=dict)