from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class MVPUIComponent(BaseModel):
    id: str
    type: str  # "metric_card", "data_table", "form", "action_bar", "search_filter", "detail_card", "chart", "kanban", "timeline"
    title: str
    description: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    data: Optional[Any] = None


class MVPScreen(BaseModel):
    id: str
    title: str
    icon: str
    route: str
    description: str
    badge: Optional[str] = None
    components: List[MVPUIComponent] = Field(default_factory=list)


class MVPSpec(BaseModel):
    app_name: str
    tagline: str
    target_persona: str
    primary_color: str = "#00F0FF"
    accent_color: str = "#8B5CF6"
    navigation: List[Dict[str, str]] = Field(default_factory=list)
    screens: List[MVPScreen] = Field(default_factory=list)
    sample_entities: List[Dict[str, Any]] = Field(default_factory=list)
    interactive_actions: List[str] = Field(default_factory=list)
    created_at_stage: str = "product_cto"
