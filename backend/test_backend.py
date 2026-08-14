import urllib.request
import json
import time
from datetime import datetime

API_BASE = "http://127.0.0.1:8000"
TEST_IDEA = "Autonomous AI-powered contract compliance auditor for renewable energy power purchase agreements (PPAs)"

print("=" * 80)
print(f"FOUNDry END-TO-END BACKEND SYNCHRONIZATION TEST")
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Test Idea: '{TEST_IDEA}'")
print("=" * 80)

# Step 1: Check Health
print("\n[1] Verifying Backend Health...")
try:
    with urllib.request.urlopen(f"{API_BASE}/health", timeout=10) as res:
        health_data = json.loads(res.read().decode())
        print(f"    Backend Health: {health_data}")
except Exception as e:
    print(f"    ERROR connecting to backend health: {e}")
    exit(1)

# Step 2: Submit Idea
print("\n[2] Submitting Fresh Idea to POST /ideas...")
start_time = time.time()
submit_req = urllib.request.Request(
    f"{API_BASE}/ideas",
    data=json.dumps({"idea": TEST_IDEA}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(submit_req, timeout=10) as res:
        submit_res = json.loads(res.read().decode())
        startup_id = submit_res["id"]
        print(f"    Submitted! Startup ID: {startup_id}")
        print(f"    Initial Status: {submit_res.get('status')}")
        print(f"    Initial Stage:  {submit_res.get('current_stage')}")
except Exception as e:
    print(f"    ERROR submitting idea: {e}")
    exit(1)

# Step 3: Polling Loop (every 1.5 seconds until completed or failed)
print("\n[3] Starting Real-Time Status Polling (GET /ideas/{id}/status every 1.5s)...")
print("-" * 110)
print(f"{'TIMESTAMP':<12} | {'ELAPSED':<8} | {'STATUS':<10} | {'CURRENT STAGE':<22} | {'CURRENT AGENT':<15} | {'PROGRESS':<8} | {'SCORE':<6} | {'COMPLETED AGENTS'}")
print("-" * 110)

poll_count = 0
final_status_data = None
max_polls = 400  # Up to 10 minutes max timeout

while poll_count < max_polls:
    poll_count += 1
    now_str = datetime.now().strftime("%H:%M:%S")
    elapsed_str = f"{time.time() - start_time:.1f}s"
    
    try:
        with urllib.request.urlopen(f"{API_BASE}/ideas/{startup_id}/status", timeout=15) as res:
            status_data = json.loads(res.read().decode())
            final_status_data = status_data
            
            completed_str = ", ".join(status_data.get("completed_agents", [])) or "none"
            score_str = str(status_data.get("build_readiness_score")) if status_data.get("build_readiness_score") is not None else "-"
            
            print(f"{now_str:<12} | {elapsed_str:<8} | {status_data.get('status'):<10} | {status_data.get('current_stage', '-'):<22} | {str(status_data.get('current_agent')):<15} | {status_data.get('progress_percent', 0)}%{'':<4} | {score_str:<6} | [{completed_str}]")
            
            if status_data.get("status") in ("completed", "failed"):
                break
                
    except Exception as e:
        print(f"{now_str:<12} | {elapsed_str:<8} | ERROR      | Network exception: {e}")
        
    time.sleep(1.5)

total_duration = time.time() - start_time
print("-" * 110)
print(f"\n[4] Polling Loop Terminated in {total_duration:.2f}s after {poll_count} polls.")
print(f"    Final Status: {final_status_data.get('status') if final_status_data else 'UNKNOWN'}")
if final_status_data and final_status_data.get("error"):
    print(f"    Workflow Error: {final_status_data.get('error')}")

# Step 4: Fetch Full Startup State (GET /ideas/{id})
print("\n[5] Fetching Full Internal Startup State (GET /ideas/{id})...")
try:
    with urllib.request.urlopen(f"{API_BASE}/ideas/{startup_id}", timeout=15) as res:
        full_state = json.loads(res.read().decode())
        print(f"    State ID:           {full_state.get('id')}")
        print(f"    Startup Idea:       {full_state.get('startup_idea')}")
        print(f"    Current Stage:      {full_state.get('current_stage')}")
        print(f"    Revision Count:     {full_state.get('revision_count')}")
        
        # Verify Research Output
        res_out = full_state.get("research")
        print(f"\n    --- RESEARCH OUTPUT ---")
        if res_out:
            print(f"    Problem Statement:  {res_out.get('problem_statement')[:120]}...")
            print(f"    Target Users:       {res_out.get('target_users')}")
            print(f"    Customer Segments:  {res_out.get('customer_segments')}")
            print(f"    Competitors:        {res_out.get('competitors')}")
            print(f"    Differentiation:    {res_out.get('differentiation')}")
            print(f"    Market Opportunity: {res_out.get('market_opportunity')[:100]}...")
            print(f"    Research Risks:     {res_out.get('research_risks')}")
            print(f"    Validation Qs:      {res_out.get('validation_questions')}")
        else:
            print(f"    [MISSING] Research output is None")

        # Verify Product Output
        prod_out = full_state.get("product")
        print(f"\n    --- PRODUCT OUTPUT ---")
        if prod_out:
            print(f"    Product Summary:    {prod_out.get('product_summary')[:120]}...")
            print(f"    Target User:        {prod_out.get('target_user')}")
            print(f"    Core Problem:       {prod_out.get('core_problem')}")
            print(f"    MVP Features:       {prod_out.get('mvp_features')}")
            print(f"    User Flow:          {prod_out.get('user_flow')}")
            print(f"    Priority Features:  {prod_out.get('priority_features')}")
            print(f"    Success Metrics:    {prod_out.get('success_metrics')}")
        else:
            print(f"    [MISSING] Product output is None")

        # Verify Finance Output
        fin_out = full_state.get("finance")
        print(f"\n    --- FINANCE OUTPUT ---")
        if fin_out:
            print(f"    Business Model:     {fin_out.get('business_model')}")
            print(f"    Revenue Streams:    {fin_out.get('revenue_streams')}")
            print(f"    Pricing Strategy:   {fin_out.get('pricing_strategy')}")
            print(f"    Major Costs:        {fin_out.get('major_costs')}")
            print(f"    Financial Recom:    {fin_out.get('financial_recommendation')[:120]}...")
            print(f"    Financial Assump:   {fin_out.get('financial_assumptions')}")
        else:
            print(f"    [MISSING] Finance output is None")

        # Verify Technical Plan
        tech_out = full_state.get("technical_plan")
        print(f"\n    --- TECHNICAL PLAN (CTO) ---")
        if tech_out:
            print(f"    Technical Summary:  {tech_out.get('technical_summary')[:120]}...")
            print(f"    Architecture:       {tech_out.get('architecture')[:120]}...")
            print(f"    Frontend Stack:     {tech_out.get('frontend_stack')}")
            print(f"    Backend Stack:      {tech_out.get('backend_stack')}")
            print(f"    Database Plan:      {tech_out.get('database_plan')}")
            print(f"    API Plan:           {tech_out.get('api_plan')}")
            print(f"    Implementation:     {tech_out.get('implementation_plan')}")
            print(f"    Technical Risks:    {tech_out.get('technical_risks')}")
        else:
            print(f"    [MISSING] Technical plan is None")

        # Verify QA Output
        qa_out = full_state.get("qa")
        print(f"\n    --- QA & VALIDATION OUTPUT ---")
        if qa_out:
            print(f"    Readiness Score:    {qa_out.get('build_readiness_score')}/100")
            print(f"    Strengths:          {qa_out.get('strengths')}")
            print(f"    Problems:           {qa_out.get('problems')}")
            print(f"    Missing Reqs:       {qa_out.get('missing_requirements')}")
            print(f"    Required Changes:   {qa_out.get('required_changes')}")
        else:
            print(f"    [MISSING] QA output is None")

        # Verify CEO Review
        ceo_out = full_state.get("ceo_review")
        print(f"\n    --- CEO REVIEW ---")
        if ceo_out:
            print(f"    Approved:           {ceo_out.get('approved')}")
            print(f"    Summary:            {ceo_out.get('summary')}")
            print(f"    Revision Required:  {ceo_out.get('revision_required')}")
        else:
            print(f"    [MISSING] CEO review is None")

except Exception as e:
    print(f"    ERROR fetching full state: {e}")

# Step 5: Fetch Final Result (GET /ideas/{id}/result)
print("\n[6] Fetching Final Synthesized Build Plan (GET /ideas/{id}/result)...")
try:
    with urllib.request.urlopen(f"{API_BASE}/ideas/{startup_id}/result", timeout=15) as res:
        result_payload = json.loads(res.read().decode())
        print(f"    Ready:              {result_payload.get('ready')}")
        print(f"    Readiness Score:    {result_payload.get('build_readiness_score')}")
        
        fbp = result_payload.get("final_build_plan")
        if fbp:
            print(f"\n    === FINAL BUILD PLAN DELIVERABLE ===")
            print(f"    Executive Summary:        {fbp.get('executive_summary')}")
            print(f"    Validated Problem:        {fbp.get('validated_problem')}")
            print(f"    Target Customer:          {fbp.get('target_customer')}")
            print(f"    MVP Scope:                {fbp.get('mvp_scope')}")
            print(f"    Business Strategy:        {fbp.get('business_strategy')}")
            print(f"    Technical Strategy:       {fbp.get('technical_strategy')}")
            print(f"    Implementation Sequence:  {fbp.get('implementation_sequence')}")
            print(f"    Major Risks:              {fbp.get('major_risks')}")
            print(f"    Validation Tasks:         {fbp.get('validation_tasks')}")
            print(f"    Launch Readiness:         {fbp.get('launch_readiness')}")
        else:
            print("    [MISSING] final_build_plan is None")
except Exception as e:
    print(f"    ERROR fetching final result: {e}")

print("\n" + "=" * 80)
print("TEST EXECUTION COMPLETED")
print("=" * 80)