from uuid import uuid4

from models.agents import (
    AgentStatus,
    CEOReview,
    FinalBuildPlan,
    StartupState,
)
from services.agent_service import (
    AgentServiceError,
    run_cto_agent,
    run_finance_agent,
    run_product_agent,
    run_qa_agent,
    run_research_agent,
)
from services.live_data_service import live_data_service
from services.evidence_service import extract_evidence_items
from services.finance_service import calculate_financials, generate_baseline_assumptions
from services.mvp_generator import generate_mvp_spec


# QA scores below this threshold trigger the single allowed revision.
REVISION_SCORE_THRESHOLD = 70


def create_startup_state(startup_idea: str) -> StartupState:
    """
    Create the shared state object used by the entire FOUNDry workflow.
    """
    live_status = live_data_service.check_availability()
    return StartupState(
        id=str(uuid4()),
        startup_idea=startup_idea.strip(),
        current_stage="created",
        status="queued",
        web_research_available=live_status.available,
    )


def _fail_agent(
    state: StartupState,
    agent_name: str,
    error: str,
) -> StartupState:
    """
    Put one agent and the overall workflow into a failed state.
    """
    agent = state.agents[agent_name]
    agent.status = AgentStatus.FAILED
    agent.error = error

    state.current_stage = agent_name
    state.status = "failed"

    return state


def run_research_stage(
    state: StartupState,
) -> StartupState:
    """
    Research has no upstream agent dependency.
    """
    state.current_stage = "research"
    state.status = "running"

    agent = state.agents["research"]
    agent.status = AgentStatus.RUNNING
    agent.error = None

    try:
        state.research = run_research_agent(
            state.startup_idea
        )
        # Check live research availability and record
        live_status = live_data_service.check_availability()
        state.web_research_available = live_status.available
        state.research.web_research_available = live_status.available
        if not live_status.available:
            state.research.evidence_notes.append("LIVE WEB RESEARCH UNAVAILABLE: LLM parametric inference used without external web search.")

        # Update evidence
        state.evidence = extract_evidence_items(state)

        agent.status = AgentStatus.COMPLETED
        state.current_stage = "research_completed"

        return state

    except AgentServiceError as exc:
        return _fail_agent(
            state,
            "research",
            str(exc),
        )

    except Exception as exc:
        return _fail_agent(
            state,
            "research",
            f"Unexpected Research Agent error: {exc}",
        )


def run_product_stage(
    state: StartupState,
) -> StartupState:
    """
    Product depends on Research.
    """
    if state.research is None:
        return _fail_agent(
            state,
            "product",
            "Product Agent cannot run because Research output is missing.",
        )

    state.current_stage = "product"
    state.status = "running"

    agent = state.agents["product"]
    agent.status = AgentStatus.RUNNING
    agent.error = None

    try:
        state.product = run_product_agent(
            startup_idea=state.startup_idea,
            research=state.research,
        )

        state.evidence = extract_evidence_items(state)

        agent.status = AgentStatus.COMPLETED
        state.current_stage = "product_completed"

        return state

    except AgentServiceError as exc:
        return _fail_agent(
            state,
            "product",
            str(exc),
        )

    except Exception as exc:
        return _fail_agent(
            state,
            "product",
            f"Unexpected Product Agent error: {exc}",
        )


def run_finance_stage(
    state: StartupState,
) -> StartupState:
    """
    Finance depends on Research + Product.
    """
    if state.research is None:
        return _fail_agent(
            state,
            "finance",
            "Finance Agent cannot run because Research output is missing.",
        )

    if state.product is None:
        return _fail_agent(
            state,
            "finance",
            "Finance Agent cannot run because Product output is missing.",
        )

    state.current_stage = "finance"
    state.status = "running"

    agent = state.agents["finance"]
    agent.status = AgentStatus.RUNNING
    agent.error = None

    try:
        state.finance = run_finance_agent(
            startup_idea=state.startup_idea,
            research=state.research,
            product=state.product,
        )

        # Calculate deterministic unit economics model
        baseline_inputs = generate_baseline_assumptions(state.startup_idea)
        state.financial_model = calculate_financials(baseline_inputs)

        state.evidence = extract_evidence_items(state)

        agent.status = AgentStatus.COMPLETED
        state.current_stage = "finance_completed"

        return state

    except AgentServiceError as exc:
        return _fail_agent(
            state,
            "finance",
            str(exc),
        )

    except Exception as exc:
        return _fail_agent(
            state,
            "finance",
            f"Unexpected Finance Agent error: {exc}",
        )


def run_cto_stage(
    state: StartupState,
) -> StartupState:
    """
    CTO depends on Research + Product + Finance.
    """
    if state.research is None:
        return _fail_agent(
            state,
            "cto",
            "CTO Agent cannot run because Research output is missing.",
        )

    if state.product is None:
        return _fail_agent(
            state,
            "cto",
            "CTO Agent cannot run because Product output is missing.",
        )

    if state.finance is None:
        return _fail_agent(
            state,
            "cto",
            "CTO Agent cannot run because Finance output is missing.",
        )

    state.current_stage = "cto"
    state.status = "running"

    agent = state.agents["cto"]
    agent.status = AgentStatus.RUNNING
    agent.error = None

    try:
        state.technical_plan = run_cto_agent(
            startup_idea=state.startup_idea,
            research=state.research,
            product=state.product,
            finance=state.finance,
        )

        # Generate structured MVPSpec for interactive prototype playground
        state.mvp_spec = generate_mvp_spec(
            idea=state.startup_idea,
            research=state.research,
            product=state.product,
            tech=state.technical_plan,
        )

        state.evidence = extract_evidence_items(state)

        agent.status = AgentStatus.COMPLETED
        state.current_stage = "cto_completed"

        return state

    except AgentServiceError as exc:
        return _fail_agent(
            state,
            "cto",
            str(exc),
        )

    except Exception as exc:
        return _fail_agent(
            state,
            "cto",
            f"Unexpected CTO Agent error: {exc}",
        )


def run_qa_stage(
    state: StartupState,
) -> StartupState:
    """
    QA reviews every specialized-agent output.
    """
    if state.research is None:
        return _fail_agent(
            state,
            "qa",
            "QA cannot run because Research output is missing.",
        )

    if state.product is None:
        return _fail_agent(
            state,
            "qa",
            "QA cannot run because Product output is missing.",
        )

    if state.finance is None:
        return _fail_agent(
            state,
            "qa",
            "QA cannot run because Finance output is missing.",
        )

    if state.technical_plan is None:
        return _fail_agent(
            state,
            "qa",
            "QA cannot run because CTO output is missing.",
        )

    state.current_stage = "qa"
    state.status = "running"

    agent = state.agents["qa"]
    agent.status = AgentStatus.RUNNING
    agent.error = None

    try:
        state.qa = run_qa_agent(
            startup_idea=state.startup_idea,
            research=state.research,
            product=state.product,
            finance=state.finance,
            technical_plan=state.technical_plan,
        )

        state.evidence = extract_evidence_items(state)

        agent.status = AgentStatus.COMPLETED
        state.current_stage = "qa_completed"

        return state

    except AgentServiceError as exc:
        return _fail_agent(
            state,
            "qa",
            str(exc),
        )

    except Exception as exc:
        return _fail_agent(
            state,
            "qa",
            f"Unexpected QA Agent error: {exc}",
        )


def run_ceo_review(
    state: StartupState,
) -> StartupState:
    """
    CEO evaluates QA feedback and chooses whether one revision is needed.
    """
    state.current_stage = "ceo_review"

    ceo = state.agents["ceo"]
    ceo.status = AgentStatus.RUNNING
    ceo.error = None

    if state.qa is None:
        return _fail_agent(
            state,
            "ceo",
            "CEO review cannot run because QA output is missing.",
        )

    score = state.qa.build_readiness_score

    if score >= REVISION_SCORE_THRESHOLD:
        state.ceo_review = CEOReview(
            approved=True,
            summary=(
                f"QA produced a build readiness score of {score}/100. "
                "The startup plan is approved for the MVP build phase."
            ),
            revision_required=False,
            revision_agent=None,
            revision_reason=None,
        )

        ceo.status = AgentStatus.COMPLETED
        state.current_stage = "ceo_review_completed"

        return state

    if state.qa.technical_risks:
        revision_agent = "cto"
        revision_reason = (
            "QA identified significant technical risks and the "
            f"readiness score is only {score}/100."
        )
    elif state.qa.product_risks:
        revision_agent = "product"
        revision_reason = (
            "QA identified significant product risks and the "
            f"readiness score is only {score}/100."
        )
    elif state.qa.business_risks:
        revision_agent = "finance"
        revision_reason = (
            "QA identified significant business risks and the "
            f"readiness score is only {score}/100."
        )
    else:
        revision_agent = "product"
        revision_reason = (
            f"QA readiness score is {score}/100 and additional "
            "MVP refinement is required."
        )

    state.ceo_review = CEOReview(
        approved=False,
        summary=(
            "QA found issues significant enough to require one "
            "revision before the final build plan."
        ),
        revision_required=True,
        revision_agent=revision_agent,
        revision_reason=revision_reason,
    )

    ceo.status = AgentStatus.COMPLETED
    state.current_stage = "revision_required"

    return state


def run_single_revision(
    state: StartupState,
) -> StartupState:
    """
    Perform at most ONE revision cycle.
    """
    if state.ceo_review is None:
        return state

    if not state.ceo_review.revision_required:
        return state

    if state.revision_count >= state.max_revisions:
        return state

    revision_agent = state.ceo_review.revision_agent
    state.revision_count += 1
    state.current_stage = "revision"

    if revision_agent not in state.agents:
        return state

    state.agents[revision_agent].status = AgentStatus.NEEDS_REVISION

    if revision_agent == "product":
        state = run_product_stage(state)
        if state.status == "failed":
            return state
        state = run_finance_stage(state)
        if state.status == "failed":
            return state
        state = run_cto_stage(state)
        if state.status == "failed":
            return state

    elif revision_agent == "finance":
        state = run_finance_stage(state)
        if state.status == "failed":
            return state
        state = run_cto_stage(state)
        if state.status == "failed":
            return state

    elif revision_agent == "cto":
        state = run_cto_stage(state)
        if state.status == "failed":
            return state

    elif revision_agent == "research":
        state = run_research_stage(state)
        if state.status == "failed":
            return state
        state = run_product_stage(state)
        if state.status == "failed":
            return state
        state = run_finance_stage(state)
        if state.status == "failed":
            return state
        state = run_cto_stage(state)
        if state.status == "failed":
            return state

    state = run_qa_stage(state)
    if state.status == "failed":
        return state

    score = state.qa.build_readiness_score
    state.ceo_review = CEOReview(
        approved=score >= REVISION_SCORE_THRESHOLD,
        summary=(
            f"Final CEO review after revision cycle "
            f"{state.revision_count}. QA readiness score: {score}/100."
        ),
        revision_required=False,
        revision_agent=None,
        revision_reason=(
            None
            if score >= REVISION_SCORE_THRESHOLD
            else (
                "The plan still contains risks, but the maximum "
                "revision limit has been reached."
            )
        ),
    )

    state.agents["ceo"].status = AgentStatus.COMPLETED
    state.current_stage = "ceo_review_completed"

    return state


def build_final_plan(
    state: StartupState,
) -> StartupState:
    """
    Assemble the specialized outputs into the final startup build plan.
    """
    if (
        state.research is None
        or state.product is None
        or state.finance is None
        or state.technical_plan is None
        or state.qa is None
    ):
        state.status = "failed"
        state.current_stage = "final_plan"
        return state

    score = state.qa.build_readiness_score

    if score >= 80:
        launch_readiness = (
            f"High MVP build readiness ({score}/100). "
            "Proceed with implementation while validating remaining risks."
        )
    elif score >= 60:
        launch_readiness = (
            f"Moderate MVP build readiness ({score}/100). "
            "Proceed cautiously and validate the highest-risk assumptions."
        )
    else:
        launch_readiness = (
            f"Low MVP build readiness ({score}/100). "
            "Resolve major risks before committing significant build effort."
        )

    # Ensure MVPSpec and Financial model exist
    if state.mvp_spec is None:
        state.mvp_spec = generate_mvp_spec(
            idea=state.startup_idea,
            research=state.research,
            product=state.product,
            tech=state.technical_plan,
        )

    if state.financial_model is None:
        baseline_inputs = generate_baseline_assumptions(state.startup_idea)
        state.financial_model = calculate_financials(baseline_inputs)

    state.evidence = extract_evidence_items(state)

    state.final_build_plan = FinalBuildPlan(
        executive_summary=state.product.product_summary,
        validated_problem=state.research.problem_statement,
        target_customer=state.product.target_user,
        mvp_scope=state.product.mvp_features,
        business_strategy=state.finance.financial_recommendation,
        technical_strategy=state.technical_plan.technical_summary,
        implementation_sequence=state.technical_plan.implementation_plan,
        major_risks=(
            state.qa.problems
            + state.qa.technical_risks
            + state.qa.business_risks
            + state.qa.product_risks
        ),
        validation_tasks=(
            state.research.validation_questions
            + state.qa.required_changes
        ),
        launch_readiness=launch_readiness,
    )

    state.current_stage = "completed"
    state.status = "completed"

    return state


def start_workflow(
    startup_idea: str,
    state: StartupState | None = None,
    on_update=None,
) -> StartupState:
    """
    Run the complete FOUNDry workflow with live state synchronization.
    """
    if not startup_idea or not startup_idea.strip():
        raise ValueError(
            "Startup idea cannot be empty."
        )

    if state is None:
        state = create_startup_state(
            startup_idea
        )

    def publish():
        if on_update is not None:
            on_update(state)

    # CEO starts the organization.
    state.current_stage = "ceo"
    state.status = "running"
    state.agents["ceo"].status = AgentStatus.RUNNING
    state.agents["ceo"].error = None
    publish()

    state.agents["ceo"].status = AgentStatus.COMPLETED
    publish()

    # Research
    state = run_research_stage(state)
    publish()
    if state.status == "failed":
        return state

    # Product
    state = run_product_stage(state)
    publish()
    if state.status == "failed":
        return state

    # Finance
    state = run_finance_stage(state)
    publish()
    if state.status == "failed":
        return state

    # CTO
    state = run_cto_stage(state)
    publish()
    if state.status == "failed":
        return state

    # QA
    state = run_qa_stage(state)
    publish()
    if state.status == "failed":
        return state

    # CEO reviews QA
    state = run_ceo_review(state)
    publish()
    if state.status == "failed":
        return state

    # Single revision if required
    if (
        state.ceo_review
        and state.ceo_review.revision_required
    ):
        state = run_single_revision(state)
        publish()
        if state.status == "failed":
            return state

    # Final startup build plan
    state = build_final_plan(state)
    publish()

    return state