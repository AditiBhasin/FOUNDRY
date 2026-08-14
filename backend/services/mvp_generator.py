import re
from typing import Optional, List, Dict, Any
from models.mvp_spec import MVPSpec, MVPScreen, MVPUIComponent
from models.agents import ProductOutput, TechnicalOutput, ResearchOutput


def generate_mvp_spec(
    idea: str,
    research: Optional[ResearchOutput] = None,
    product: Optional[ProductOutput] = None,
    tech: Optional[TechnicalOutput] = None,
) -> MVPSpec:
    """
    Synthesizes a structured MVPSpec from the multi-agent outputs.
    Produces functional, interactive UI prototype components representing the MVP.
    """
    # Clean app name extraction
    clean_idea = idea.strip()
    words = clean_idea.split()
    app_name = "VentureCore"
    if len(words) >= 2:
        # Create a suitable app name
        w1 = re.sub(r'[^a-zA-Z]', '', words[0]).capitalize()
        w2 = re.sub(r'[^a-zA-Z]', '', words[1]).capitalize()
        if w1 and w2 and len(w1) > 2 and len(w2) > 2:
            app_name = f"{w1}{w2}"
        elif w1:
            app_name = f"{w1}Flow"
    
    tagline = product.product_summary if product else f"Intelligent platform for {clean_idea[:60]}..."
    target_user = product.target_user if product else "Core Target Users & Operators"

    # Derive interactive domain items tailored to the idea
    entity_name = "Item"
    entity_plural = "Items"
    lower_idea = clean_idea.lower()

    if any(k in lower_idea for k in ["internship", "job", "career", "hiring", "talent", "candidate"]):
        entity_name = "Opportunity"
        entity_plural = "Opportunities"
        sample_entities = [
            {"id": "opp-101", "title": "Autonomous AI Research Intern", "company": "DeepStream Labs", "location": "Remote / San Francisco", "match_score": 96, "status": "Ready to Apply", "compensation": "$48/hr", "deadline": "3 days left"},
            {"id": "opp-102", "title": "Full-Stack Product Engineer Intern", "company": "Synthetix Dynamics", "location": "New York, NY", "match_score": 92, "status": "Interview Scheduled", "compensation": "$42/hr", "deadline": "1 week left"},
            {"id": "opp-103", "title": "Data Infrastructure Fellowship", "company": "Voxel Cloud", "location": "Remote", "match_score": 88, "status": "Tailoring Resume", "compensation": "$45/hr", "deadline": "5 days left"},
            {"id": "opp-104", "title": "AI Product Operations Associate", "company": "Hyperion AI", "location": "Austin, TX", "match_score": 84, "status": "Submitted", "compensation": "$38/hr", "deadline": "Closed"},
        ]
    elif any(k in lower_idea for k in ["finance", "invest", "crypto", "trading", "wealth", "budget", "money", "payment"]):
        entity_name = "Portfolio Asset"
        entity_plural = "Assets"
        sample_entities = [
            {"id": "ast-201", "title": "Yield Vault Alpha", "company": "Smart Yield Protocol", "location": "Layer-2 Arbitrum", "match_score": 98, "status": "Active (14.2% APY)", "compensation": "$24,500 TVL", "deadline": "Rebalancing in 4h"},
            {"id": "ast-202", "title": "Automated Index Fund v2", "company": "DeFi Capital", "location": "Multi-chain", "match_score": 91, "status": "Compounding", "compensation": "$18,200 TVL", "deadline": "Weekly cycle"},
            {"id": "ast-203", "title": "Risk-Hedged Stable Pool", "company": "Aegis Finance", "location": "Ethereum Mainnet", "match_score": 89, "status": "Active (7.8% APY)", "compensation": "$50,000 TVL", "deadline": "Continuous"},
        ]
    elif any(k in lower_idea for k in ["health", "fitness", "medical", "doctor", "wellness", "diet", "mental"]):
        entity_name = "Health Protocol"
        entity_plural = "Protocols"
        sample_entities = [
            {"id": "hl-301", "title": "Circadian Recovery & Sleep Optimization", "company": "BioSync AI", "location": "Wearable Biometrics", "match_score": 95, "status": "In Progress (Day 12/30)", "compensation": "92% Adherence", "deadline": "Check-in today"},
            {"id": "hl-302", "title": "Nutritional Biomarker Calibration", "company": "Metabolic Engine", "location": "Continuous Glucose", "match_score": 90, "status": "Calibrated", "compensation": "88% Target Met", "deadline": "2 days left"},
            {"id": "hl-303", "title": "Zone-2 Cardio Endurance Protocol", "company": "Pulse Fitness", "location": "Heart Rate Sync", "match_score": 87, "status": "Active", "compensation": "3 sessions/wk", "deadline": "Scheduled tomorrow"},
        ]
    else:
        entity_name = "Pipeline Project"
        entity_plural = "Projects"
        sample_entities = [
            {"id": "prj-401", "title": "Autonomous Workflow Stream Alpha", "company": "Internal Core", "location": "Cloud Cluster", "match_score": 95, "status": "Active / Processing", "compensation": "12.4k ops/sec", "deadline": "Live"},
            {"id": "prj-402", "title": "Intelligent Data Extraction Engine", "company": "Edge Node 04", "location": "Distributed", "match_score": 91, "status": "Queued", "compensation": "8.1k ops/sec", "deadline": "Est. 12m"},
            {"id": "prj-403", "title": "Real-time Telemetry Classifier", "company": "Neural Sync", "location": "Local Host", "match_score": 88, "status": "Completed", "compensation": "99.4% Accuracy", "deadline": "Archived"},
        ]

    # Screen 1: Dashboard
    screen_dashboard = MVPScreen(
        id="dashboard",
        title="Command Center",
        icon="⚡",
        route="/prototype/dashboard",
        description=f"Real-time operational overview and primary KPI metrics for {app_name}.",
        badge="Live Metrics",
        components=[
            MVPUIComponent(
                id="kpi-metrics",
                type="metric_card",
                title="Real-Time Metrics",
                properties={"columns": 4},
                data=[
                    {"label": f"Active {entity_plural}", "value": "142", "change": "+18.4%", "trend": "up", "color": "#00F0FF"},
                    {"label": "Match Precision", "value": "96.2%", "change": "+4.1%", "trend": "up", "color": "#10B981"},
                    {"label": "Avg Response Time", "value": "1.4s", "change": "-35%", "trend": "up", "color": "#8B5CF6"},
                    {"label": "Pipeline Throughput", "value": "89%", "change": "+12%", "trend": "up", "color": "#F59E0B"},
                ]
            ),
            MVPUIComponent(
                id="active-feed",
                type="data_table",
                title=f"High-Priority {entity_plural}",
                description="Filtered by AI affinity scoring and urgent deadlines.",
                properties={"selectable": True, "actionable": True},
                data=sample_entities
            ),
        ]
    )

    # Screen 2: Discovery / Search / Opportunity Explorer
    screen_discovery = MVPScreen(
        id="discovery",
        title=f"Discover {entity_plural}",
        icon="🔍",
        route="/prototype/discovery",
        description=f"Search, filter, and match relevant {entity_plural.lower()} with intelligent recommendations.",
        badge="AI Matched",
        components=[
            MVPUIComponent(
                id="search-filter-bar",
                type="search_filter",
                title="Intelligent Filter & Semantic Query",
                properties={"placeholder": f"Search {entity_plural.lower()} by role, skills, keywords, or location...", "filters": ["All Matches", "Match > 90%", "Remote Only", "Urgent / Ending Soon"]}
            ),
            MVPUIComponent(
                id="opportunity-grid",
                type="detail_card",
                title=f"Matched {entity_plural}",
                properties={"layout": "grid"},
                data=sample_entities
            )
        ]
    )

    # Screen 3: Workflow / Action Tracker
    screen_tracker = MVPScreen(
        id="tracker",
        title="Execution Tracker",
        icon="📋",
        route="/prototype/tracker",
        description="Track active stages, automated generation steps, and submission lifecycles.",
        badge="Workflow",
        components=[
            MVPUIComponent(
                id="kanban-workflow",
                type="kanban",
                title="Pipeline Status Columns",
                data=[
                    {"column": "Discovered", "count": 14, "items": [sample_entities[0]]},
                    {"column": "AI Tailoring", "count": 6, "items": [sample_entities[2]]},
                    {"column": "Submitted", "count": 9, "items": [sample_entities[1]]},
                    {"column": "Interview / Active", "count": 3, "items": [sample_entities[3] if len(sample_entities) > 3 else sample_entities[0]]},
                ]
            )
        ]
    )

    # Screen 4: Generator / Tailoring Assistant Form
    screen_assistant = MVPScreen(
        id="assistant",
        title="AI Tailor & Generator",
        icon="✨",
        route="/prototype/assistant",
        description=f"Automated intelligence engine customized for {target_user}.",
        badge="Instant Generation",
        components=[
            MVPUIComponent(
                id="tailor-form",
                type="form",
                title=f"Generate Customized {entity_name} Deliverable",
                properties={
                    "fields": [
                        {"name": "target_item", "label": f"Select Target {entity_name}", "type": "select", "options": [e["title"] for e in sample_entities]},
                        {"name": "tone", "label": "Communication Persona", "type": "select", "options": ["Technical & Rigorous", "Executive & Strategic", "Engaging & Direct"]},
                        {"name": "custom_notes", "label": "Key Highlights / Custom Requirements", "type": "textarea", "placeholder": "Enter specific experiences, keywords, or constraints to emphasize..."},
                    ],
                    "submit_label": f"Generate AI-Optimized {entity_name} Package",
                }
            )
        ]
    )

    # Screen 5: Settings & Analytics
    screen_analytics = MVPScreen(
        id="analytics",
        title="Performance Analytics",
        icon="📊",
        route="/prototype/analytics",
        description="Inspect conversion rates, funnel velocity, and algorithmic accuracy.",
        badge="Telemetry",
        components=[
            MVPUIComponent(
                id="analytics-chart-summary",
                type="chart",
                title="Funnel Velocity & Conversion",
                properties={"chart_type": "bar"},
                data=[
                    {"label": "Opportunities Scanned", "value": 480},
                    {"label": "AI Matches Identified", "value": 142},
                    {"label": "Tailored Applications", "value": 38},
                    {"label": "Responses / Interviews", "value": 12},
                    {"label": "Accepted Offers / Success", "value": 4},
                ]
            )
        ]
    )

    return MVPSpec(
        app_name=app_name,
        tagline=tagline,
        target_persona=target_user,
        primary_color="#00F0FF",
        accent_color="#8B5CF6",
        navigation=[
            {"id": "dashboard", "title": "Dashboard", "icon": "⚡"},
            {"id": "discovery", "title": f"Explore {entity_plural}", "icon": "🔍"},
            {"id": "tracker", "title": "Pipeline Tracker", "icon": "📋"},
            {"id": "assistant", "title": "AI Generator", "icon": "✨"},
            {"id": "analytics", "title": "Analytics", "icon": "📊"},
        ],
        screens=[
            screen_dashboard,
            screen_discovery,
            screen_tracker,
            screen_assistant,
            screen_analytics,
        ],
        sample_entities=sample_entities,
        interactive_actions=[
            f"Instant Match {entity_plural}",
            "One-Click AI Tailoring",
            "Export Application Dossier",
            "Automated Submission Trigger",
        ],
        created_at_stage="product_cto"
    )
