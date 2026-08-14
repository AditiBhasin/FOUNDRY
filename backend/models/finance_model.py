from typing import Optional, List
from pydantic import BaseModel, Field


class FinancialInputs(BaseModel):
    customers: Optional[int] = Field(default=None, description="Active paying customer count")
    arpu: Optional[float] = Field(default=None, description="Average Monthly Revenue Per User / Account ($)")
    marketing_spend: Optional[float] = Field(default=None, description="Monthly Marketing & Sales Spend ($)")
    new_customers: Optional[int] = Field(default=None, description="New customers acquired per month")
    gross_margin: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Gross Margin (0.0 to 1.0, e.g., 0.80 for 80%)")
    average_lifetime_months: Optional[float] = Field(default=None, description="Average customer lifetime in months")
    fixed_costs: Optional[float] = Field(default=None, description="Monthly fixed operating overhead ($)")


class FormulaMetric(BaseModel):
    name: str
    code: str
    formula: str
    inputs: dict
    result: Optional[float] = None
    formatted_result: str
    status: str  # "CALCULATED" | "ASSUMPTION" | "MISSING_INPUTS"
    interpretation: str


class DeterministicFinancialModel(BaseModel):
    inputs: FinancialInputs
    mrr: FormulaMetric
    annual_revenue: FormulaMetric
    cac: FormulaMetric
    ltv: FormulaMetric
    ltv_to_cac: FormulaMetric
    breakeven_customers: FormulaMetric
    breakeven_revenue: FormulaMetric
    summary_analysis: str
    assumptions_count: int
    calculated_metrics_count: int
