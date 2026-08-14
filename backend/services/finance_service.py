from typing import Optional, Dict, Any
from models.finance_model import (
    FinancialInputs,
    FormulaMetric,
    DeterministicFinancialModel,
)


def calculate_financials(inputs: FinancialInputs) -> DeterministicFinancialModel:
    """
    Deterministic unit economics calculation engine for FOUNDry.
    
    Formulas:
    - MRR = Customers × ARPU
    - Annual Revenue = MRR × 12
    - CAC = Marketing Spend / New Customers
    - LTV = ARPU × Gross Margin × Average Lifetime (months)
    - LTV:CAC = LTV / CAC
    - Break-even Customers = Fixed Costs / (ARPU × Gross Margin)
    - Break-even Revenue = Fixed Costs / Gross Margin
    
    Any unknown inputs remain null and are classified as ASSUMPTION.
    """
    c = inputs.customers
    arpu = inputs.arpu
    mkt = inputs.marketing_spend
    new_c = inputs.new_customers
    gm = inputs.gross_margin
    life = inputs.average_lifetime_months
    fc = inputs.fixed_costs

    # 1. MRR = Customers × ARPU
    if c is not None and arpu is not None:
        mrr_val = float(c * arpu)
        mrr_metric = FormulaMetric(
            name="Monthly Recurring Revenue (MRR)",
            code="MRR",
            formula="Customers × ARPU",
            inputs={"customers": c, "arpu": arpu},
            result=mrr_val,
            formatted_result=f"${mrr_val:,.2f}",
            status="CALCULATED",
            interpretation=f"Generates ${mrr_val:,.2f}/mo from {c:,} customers at ${arpu:,.2f}/mo average contract value."
        )
    else:
        mrr_val = None
        mrr_metric = FormulaMetric(
            name="Monthly Recurring Revenue (MRR)",
            code="MRR",
            formula="Customers × ARPU",
            inputs={"customers": c, "arpu": arpu},
            result=None,
            formatted_result="UNSPECIFIED [ASSUMPTION REQUIRED]",
            status="MISSING_INPUTS",
            interpretation="Requires customer volume count and ARPU assumption."
        )

    # 2. Annual Revenue = MRR × 12
    if mrr_val is not None:
        arr_val = mrr_val * 12
        arr_metric = FormulaMetric(
            name="Annual Run Rate (ARR)",
            code="ARR",
            formula="MRR × 12",
            inputs={"mrr": mrr_val},
            result=arr_val,
            formatted_result=f"${arr_val:,.2f}",
            status="CALCULATED",
            interpretation=f"Annualized gross run-rate of ${arr_val:,.2f} based on current monthly pace."
        )
    else:
        arr_val = None
        arr_metric = FormulaMetric(
            name="Annual Run Rate (ARR)",
            code="ARR",
            formula="MRR × 12",
            inputs={"mrr": None},
            result=None,
            formatted_result="UNSPECIFIED",
            status="MISSING_INPUTS",
            interpretation="Requires calculated MRR to project annual revenue run rate."
        )

    # 3. CAC = Marketing Spend / New Customers
    if mkt is not None and new_c is not None and new_c > 0:
        cac_val = float(mkt / new_c)
        cac_metric = FormulaMetric(
            name="Customer Acquisition Cost (CAC)",
            code="CAC",
            formula="Marketing Spend / New Customers",
            inputs={"marketing_spend": mkt, "new_customers": new_c},
            result=cac_val,
            formatted_result=f"${cac_val:,.2f}",
            status="CALCULATED",
            interpretation=f"Costs ${cac_val:,.2f} in blended sales/marketing to acquire each new customer."
        )
    else:
        cac_val = None
        cac_metric = FormulaMetric(
            name="Customer Acquisition Cost (CAC)",
            code="CAC",
            formula="Marketing Spend / New Customers",
            inputs={"marketing_spend": mkt, "new_customers": new_c},
            result=None,
            formatted_result="UNSPECIFIED [ASSUMPTION REQUIRED]",
            status="MISSING_INPUTS",
            interpretation="Requires marketing budget and new customer acquisition velocity."
        )

    # 4. LTV = ARPU × Gross Margin × Average Lifetime
    if arpu is not None and gm is not None and life is not None:
        ltv_val = float(arpu * gm * life)
        ltv_metric = FormulaMetric(
            name="Customer Lifetime Value (LTV)",
            code="LTV",
            formula="ARPU × Gross Margin × Average Lifetime (Months)",
            inputs={"arpu": arpu, "gross_margin": gm, "average_lifetime_months": life},
            result=ltv_val,
            formatted_result=f"${ltv_val:,.2f}",
            status="CALCULATED",
            interpretation=f"Gross profit contribution per customer over a {life:.1f}-month lifetime is ${ltv_val:,.2f} ({gm*100:.0f}% gross margin)."
        )
    else:
        ltv_val = None
        ltv_metric = FormulaMetric(
            name="Customer Lifetime Value (LTV)",
            code="LTV",
            formula="ARPU × Gross Margin × Average Lifetime (Months)",
            inputs={"arpu": arpu, "gross_margin": gm, "average_lifetime_months": life},
            result=None,
            formatted_result="UNSPECIFIED [ASSUMPTION REQUIRED]",
            status="MISSING_INPUTS",
            interpretation="Requires ARPU, gross margin percentage, and expected retention lifespan."
        )

    # 5. LTV:CAC Ratio = LTV / CAC
    if ltv_val is not None and cac_val is not None and cac_val > 0:
        ratio_val = float(ltv_val / cac_val)
        if ratio_val >= 3.0:
            interp = f"Excellent unit economics ({ratio_val:.2f}x). Standard healthy SaaS benchmark is ≥ 3.0x."
        elif ratio_val >= 1.0:
            interp = f"Marginal unit economics ({ratio_val:.2f}x). Payback period may be strained."
        else:
            interp = f"Unsustainable unit economics ({ratio_val:.2f}x). Acquiring customers costs more than their lifetime value."

        ratio_metric = FormulaMetric(
            name="LTV:CAC Ratio",
            code="LTV:CAC",
            formula="LTV / CAC",
            inputs={"ltv": ltv_val, "cac": cac_val},
            result=ratio_val,
            formatted_result=f"{ratio_val:.2f}x",
            status="CALCULATED",
            interpretation=interp
        )
    else:
        ratio_metric = FormulaMetric(
            name="LTV:CAC Ratio",
            code="LTV:CAC",
            formula="LTV / CAC",
            inputs={"ltv": ltv_val, "cac": cac_val},
            result=None,
            formatted_result="UNSPECIFIED",
            status="MISSING_INPUTS",
            interpretation="Requires both LTV and CAC to determine capital efficiency."
        )

    # 6. Break-even Customers = Fixed Costs / (ARPU × Gross Margin)
    if fc is not None and arpu is not None and gm is not None and (arpu * gm) > 0:
        be_cust_val = float(fc / (arpu * gm))
        be_cust_metric = FormulaMetric(
            name="Break-even Customer Count",
            code="BE_CUSTOMERS",
            formula="Fixed Costs / (ARPU × Gross Margin)",
            inputs={"fixed_costs": fc, "arpu": arpu, "gross_margin": gm},
            result=be_cust_val,
            formatted_result=f"{int(be_cust_val + 0.9999):,} customers",
            status="CALCULATED",
            interpretation=f"Requires {int(be_cust_val + 0.9999):,} active customers generating ${arpu*gm:,.2f}/mo gross profit to cover ${fc:,.2f}/mo fixed overhead."
        )
    else:
        be_cust_metric = FormulaMetric(
            name="Break-even Customer Count",
            code="BE_CUSTOMERS",
            formula="Fixed Costs / (ARPU × Gross Margin)",
            inputs={"fixed_costs": fc, "arpu": arpu, "gross_margin": gm},
            result=None,
            formatted_result="UNSPECIFIED [ASSUMPTION REQUIRED]",
            status="MISSING_INPUTS",
            interpretation="Requires fixed overhead costs and gross margin per customer."
        )

    # 7. Break-even Revenue = Fixed Costs / Gross Margin
    if fc is not None and gm is not None and gm > 0:
        be_rev_val = float(fc / gm)
        be_rev_metric = FormulaMetric(
            name="Break-even Monthly Revenue",
            code="BE_REVENUE",
            formula="Fixed Costs / Gross Margin",
            inputs={"fixed_costs": fc, "gross_margin": gm},
            result=be_rev_val,
            formatted_result=f"${be_rev_val:,.2f}/mo",
            status="CALCULATED",
            interpretation=f"Venture must produce ${be_rev_val:,.2f}/month in gross revenue to reach operating break-even."
        )
    else:
        be_rev_metric = FormulaMetric(
            name="Break-even Monthly Revenue",
            code="BE_REVENUE",
            formula="Fixed Costs / Gross Margin",
            inputs={"fixed_costs": fc, "gross_margin": gm},
            result=None,
            formatted_result="UNSPECIFIED [ASSUMPTION REQUIRED]",
            status="MISSING_INPUTS",
            interpretation="Requires fixed operating costs and gross margin percentage."
        )

    metrics = [mrr_metric, arr_metric, cac_metric, ltv_metric, ratio_metric, be_cust_metric, be_rev_metric]
    calc_count = sum(1 for m in metrics if m.status == "CALCULATED")
    assump_count = len(metrics) - calc_count

    summary = (
        f"Unit economics model computed with {calc_count} verified calculations and {assump_count} assumptions requiring validation. "
        + ("Unit economics are viable." if ratio_metric.result and ratio_metric.result >= 3.0 else "Validate CAC and pricing assumptions prior to scaling.")
    )

    return DeterministicFinancialModel(
        inputs=inputs,
        mrr=mrr_metric,
        annual_revenue=arr_metric,
        cac=cac_metric,
        ltv=ltv_metric,
        ltv_to_cac=ratio_metric,
        breakeven_customers=be_cust_metric,
        breakeven_revenue=be_rev_metric,
        summary_analysis=summary,
        assumptions_count=assump_count,
        calculated_metrics_count=calc_count,
    )


def generate_baseline_assumptions(idea: str) -> FinancialInputs:
    """
    Generate transparent, reasonable starting baseline assumptions for an early stage SaaS/AI startup.
    Clearly marked as assumptions in the model.
    """
    return FinancialInputs(
        customers=50,
        arpu=79.0,
        marketing_spend=1500.0,
        new_customers=15,
        gross_margin=0.80,
        average_lifetime_months=18.0,
        fixed_costs=2500.0,
    )
