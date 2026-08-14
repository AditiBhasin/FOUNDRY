from typing import List, Dict, Any, Optional
from models.evidence import EvidenceItem, EvidenceType, LiveResearchStatus
from models.agents import (
    ResearchOutput,
    ProductOutput,
    FinanceOutput,
    TechnicalOutput,
    QAOutput,
    StartupState,
)
from services.live_data_service import live_data_service


def extract_evidence_items(state: StartupState) -> List[EvidenceItem]:
    """
    Extract and truthfully classify all claims across agent stages.
    Categories:
    - DATA: Verified empirical data (from live web search if available)
    - AI_INFERENCE: Synthesized by LLM reasoning
    - ASSUMPTION: Unvalidated market/business assumptions
    - RECOMMENDATION: Prescriptive strategic actions
    """
    evidence: List[EvidenceItem] = []
    item_counter = 1

    # 1. Check Live Data Status
    live_status = live_data_service.check_availability()
    if live_status.available:
        # Include live search data items if any exist
        live_items = live_data_service.search(state.startup_idea)
        evidence.extend(live_items)

    # 2. Research Claims
    if state.research:
        # Problem statement (AI Inference)
        evidence.append(
            EvidenceItem(
                id=f"ev-{item_counter}",
                agent="research",
                category=EvidenceType.AI_INFERENCE,
                claim=state.research.problem_statement,
                source="Ollama llama3.2:3b [Research Agent]",
                verification_status="ai_generated",
                notes="Synthesized core problem analysis based on initial venture idea."
            )
        )
        item_counter += 1

        # Competitors (AI Inference / Market knowledge)
        for comp in state.research.competitors[:4]:
            evidence.append(
                EvidenceItem(
                    id=f"ev-{item_counter}",
                    agent="research",
                    category=EvidenceType.AI_INFERENCE,
                    claim=f"Competitor/Alternative: {comp}",
                    source="Ollama llama3.2:3b [Market Knowledge]",
                    verification_status="unverified_competitor",
                    notes="Identified incumbent/alternative from LLM parametric memory. Requires live competitive validation."
                )
            )
            item_counter += 1

        # Research Risks (Assumptions)
        for risk in state.research.research_risks[:3]:
            evidence.append(
                EvidenceItem(
                    id=f"ev-{item_counter}",
                    agent="research",
                    category=EvidenceType.ASSUMPTION,
                    claim=risk,
                    source="Research Risk Assessment",
                    verification_status="hypothesis_to_validate",
                    notes="Identified research risk that must be validated with real target users."
                )
            )
            item_counter += 1

    # 3. Product Claims
    if state.product:
        evidence.append(
            EvidenceItem(
                id=f"ev-{item_counter}",
                agent="product",
                category=EvidenceType.AI_INFERENCE,
                claim=f"Primary Target User: {state.product.target_user}",
                source="Ollama llama3.2:3b [Product Agent]",
                verification_status="ai_generated",
                notes="Derived ICP persona for lean MVP scoping."
            )
        )
        item_counter += 1

        for feat in state.product.mvp_features[:4]:
            evidence.append(
                EvidenceItem(
                    id=f"ev-{item_counter}",
                    agent="product",
                    category=EvidenceType.RECOMMENDATION,
                    claim=f"MVP Feature Scope: {feat}",
                    source="Product MVP Specification",
                    verification_status="recommended_scope",
                    notes="Recommended high-leverage feature for hackathon/initial build."
                )
            )
            item_counter += 1

    # 4. Finance Claims
    if state.finance:
        evidence.append(
            EvidenceItem(
                id=f"ev-{item_counter}",
                agent="finance",
                category=EvidenceType.RECOMMENDATION,
                claim=f"Monetization Strategy: {state.finance.pricing_strategy}",
                source="Ollama llama3.2:3b [Finance Agent]",
                verification_status="recommended_model",
                notes="Recommended pricing and monetization model for initial testing."
            )
        )
        item_counter += 1

        for assump in state.finance.financial_assumptions[:3]:
            evidence.append(
                EvidenceItem(
                    id=f"ev-{item_counter}",
                    agent="finance",
                    category=EvidenceType.ASSUMPTION,
                    claim=assump,
                    source="Financial Model Hypothesis",
                    verification_status="untested_financial_assumption",
                    notes="Key assumption impacting unit economics and margin projections."
                )
            )
            item_counter += 1

    # 5. Technical CTO Claims
    if state.technical_plan:
        evidence.append(
            EvidenceItem(
                id=f"ev-{item_counter}",
                agent="cto",
                category=EvidenceType.RECOMMENDATION,
                claim=f"System Architecture: {state.technical_plan.architecture}",
                source="CTO Engineering Spec",
                verification_status="architecture_plan",
                notes="Selected architecture to optimize build velocity and runtime performance."
            )
        )
        item_counter += 1

    # 6. QA Validation
    if state.qa:
        for req in state.qa.required_changes[:3]:
            evidence.append(
                EvidenceItem(
                    id=f"ev-{item_counter}",
                    agent="qa",
                    category=EvidenceType.RECOMMENDATION,
                    claim=f"QA Audit Requirement: {req}",
                    source="QA & Validation Agent",
                    verification_status="action_required",
                    notes="Audit finding to be satisfied prior to full scale deployment."
                )
            )
            item_counter += 1

    return evidence
