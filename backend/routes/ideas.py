from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from models.finance_model import FinancialInputs
from services.finance_service import calculate_financials
from services.orchestrator import create_startup_state, start_workflow
from store.memory import startup_store


router = APIRouter(
    prefix="/ideas",
    tags=["ideas"],
)


class IdeaCreateRequest(BaseModel):
    idea: str = Field(
        ...,
        min_length=3,
        description="The startup idea FOUNDry should build.",
    )


def execute_workflow(
    startup_id: str,
    startup_idea: str,
) -> None:
    """
    Execute the complete FOUNDry workflow in the background.
    """
    existing_state = startup_store.get(startup_id)

    if existing_state is not None:
        existing_state.status = "running"
        existing_state.current_stage = "starting"
        startup_store.save(existing_state)

    try:
        completed_state = start_workflow(
            startup_idea=startup_idea,
            state=existing_state,
            on_update=startup_store.save,
        )

        completed_state.id = startup_id
        startup_store.save(completed_state)

    except Exception as exc:
        state = startup_store.get(startup_id)
        if state is not None:
            state.status = "failed"
            state.current_stage = "workflow"
            state.metadata["workflow_error"] = str(exc)
            startup_store.save(state)


@router.post("")
def create_idea(
    request: IdeaCreateRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start a FOUNDry startup-building workflow.
    """
    idea = request.idea.strip()
    if not idea:
        raise HTTPException(
            status_code=400,
            detail="Startup idea cannot be empty.",
        )

    state = create_startup_state(idea)
    startup_store.save(state)

    background_tasks.add_task(
        execute_workflow,
        state.id,
        idea,
    )

    return {
        "id": state.id,
        "startup_idea": state.startup_idea,
        "status": state.status,
        "current_stage": state.current_stage,
        "web_research_available": state.web_research_available,
        "message": "FOUNDry startup workflow started. Use the startup ID to retrieve progress.",
    }


@router.get("/{startup_id}")
def get_idea(
    startup_id: str,
):
    """
    Return the complete current StartupState.
    """
    state = startup_store.get(startup_id)
    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup workflow not found.",
        )
    return state


@router.get("/{startup_id}/status")
def get_idea_status(
    startup_id: str,
):
    """
    Return lightweight workflow status for frontend polling.
    """
    state = startup_store.get(startup_id)
    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup workflow not found.",
        )

    agent_order = [
        "ceo",
        "research",
        "product",
        "finance",
        "cto",
        "qa",
    ]

    agents = {}
    completed_count = 0
    current_agent = None
    completed_agents = []

    workflow_error = state.metadata.get("workflow_error")

    for agent_name in agent_order:
        agent_state = state.agents[agent_name]
        status_value = (
            agent_state.status.value
            if hasattr(agent_state.status, "value")
            else str(agent_state.status)
        )

        agents[agent_name] = {
            "agent": agent_state.agent,
            "status": status_value,
            "error": agent_state.error,
        }

        if status_value == "completed":
            completed_count += 1
            completed_agents.append(agent_name)

        if status_value == "running":
            current_agent = agent_name

        if status_value == "failed" and workflow_error is None:
            workflow_error = agent_state.error

    progress_percent = round((completed_count / len(agent_order)) * 100)

    if state.status == "completed":
        progress_percent = 100
        current_agent = None

    build_readiness_score = None
    if state.qa is not None:
        build_readiness_score = state.qa.build_readiness_score

    return {
        "id": state.id,
        "status": state.status,
        "current_stage": state.current_stage,
        "current_agent": current_agent,
        "progress_percent": progress_percent,
        "completed_agents": completed_agents,
        "completed_agent_count": completed_count,
        "total_agent_count": len(agent_order),
        "revision_count": state.revision_count,
        "max_revisions": state.max_revisions,
        "build_readiness_score": build_readiness_score,
        "has_final_plan": (state.final_build_plan is not None),
        "web_research_available": state.web_research_available,
        "evidence_count": len(state.evidence),
        "has_financial_model": (state.financial_model is not None),
        "has_mvp_spec": (state.mvp_spec is not None),
        "error": workflow_error,
        "agents": agents,
    }


@router.post("/{startup_id}/retry")
def retry_idea(
    startup_id: str,
    background_tasks: BackgroundTasks,
):
    """
    Retry a failed FOUNDry workflow.
    """
    state = startup_store.get(startup_id)
    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup workflow not found.",
        )

    if state.status == "running":
        raise HTTPException(
            status_code=409,
            detail="Workflow is already running.",
        )

    state.status = "queued"
    state.current_stage = "created"
    state.revision_count = 0
    state.research = None
    state.product = None
    state.finance = None
    state.technical_plan = None
    state.qa = None
    state.ceo_review = None
    state.final_build_plan = None
    state.evidence = []
    state.financial_model = None
    state.mvp_spec = None

    state.metadata.pop("workflow_error", None)

    for agent_state in state.agents.values():
        agent_state.status = "queued"
        agent_state.error = None

    startup_store.save(state)

    background_tasks.add_task(
        execute_workflow,
        state.id,
        state.startup_idea,
    )

    return {
        "id": state.id,
        "status": state.status,
        "current_stage": state.current_stage,
        "message": "FOUNDry workflow retry started.",
    }


@router.get("/{startup_id}/result")
def get_idea_result(
    startup_id: str,
):
    """
    Return the final FOUNDry startup build plan with evidence, finance, and MVP specs.
    """
    state = startup_store.get(startup_id)
    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup workflow not found.",
        )

    if state.status == "failed":
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Startup workflow failed.",
                "current_stage": state.current_stage,
                "error": state.metadata.get("workflow_error"),
            },
        )

    if state.final_build_plan is None:
        return {
            "id": state.id,
            "status": state.status,
            "current_stage": state.current_stage,
            "ready": False,
            "web_research_available": state.web_research_available,
            "message": "FOUNDry is still building the startup plan.",
        }

    readiness_score = None
    if state.qa is not None:
        readiness_score = state.qa.build_readiness_score

    return {
        "id": state.id,
        "status": state.status,
        "ready": True,
        "startup_idea": state.startup_idea,
        "build_readiness_score": readiness_score,
        "revision_count": state.revision_count,
        "web_research_available": state.web_research_available,
        "ceo_review": state.ceo_review,
        "final_build_plan": state.final_build_plan,
        "financial_model": state.financial_model,
        "mvp_spec": state.mvp_spec,
        "evidence": state.evidence,
    }


@router.get("/{startup_id}/mvp")
def get_idea_mvp(
    startup_id: str,
):
    """
    Return the structured MVPSpec for rendering the interactive prototype playground.
    """
    state = startup_store.get(startup_id)
    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup workflow not found.",
        )
    return {
        "id": state.id,
        "startup_idea": state.startup_idea,
        "mvp_spec": state.mvp_spec,
        "ready": state.mvp_spec is not None,
    }


@router.get("/{startup_id}/evidence")
def get_idea_evidence(
    startup_id: str,
):
    """
    Return the classified truthful evidence items.
    """
    state = startup_store.get(startup_id)
    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup workflow not found.",
        )
    return {
        "id": state.id,
        "web_research_available": state.web_research_available,
        "evidence": state.evidence,
        "total_count": len(state.evidence),
    }


@router.post("/{startup_id}/finance")
def update_financial_model(
    startup_id: str,
    inputs: FinancialInputs,
):
    """
    Recalculate deterministic unit economics with custom founder assumptions.
    """
    state = startup_store.get(startup_id)
    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup workflow not found.",
        )

    updated_model = calculate_financials(inputs)
    state.financial_model = updated_model
    startup_store.save(state)

    return {
        "id": state.id,
        "financial_model": updated_model,
    }