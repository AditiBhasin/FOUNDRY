import re
from typing import Optional, List, Dict, Any
from models.mvp_spec import MVPSpec, MVPScreen, MVPUIComponent
from models.agents import ProductOutput, TechnicalOutput, ResearchOutput


def _extract_domain_profile(idea: str, product: Optional[ProductOutput] = None, research: Optional[ResearchOutput] = None) -> Dict[str, Any]:
    """
    Intelligently extracts domain entities, metric labels, action verbs, and items
    tailored specifically to the given startup idea.
    """
    clean_idea = idea.strip()
    lower_idea = clean_idea.lower()

    # Creative App Name Generation
    words = [w for w in re.findall(r'[a-zA-Z0-9]+', clean_idea) if len(w) > 2]
    # Filter common stopwords
    stopwords = {"and", "the", "for", "with", "that", "this", "from", "app", "platform", "system", "tool", "using", "powered", "based"}
    sig_words = [w.capitalize() for w in words if w.lower() not in stopwords]
    
    if len(sig_words) >= 2:
        app_name = f"{sig_words[0]}{sig_words[1]}"
    elif len(sig_words) == 1:
        app_name = f"{sig_words[0]}AI"
    else:
        app_name = "VentureCore AI"

    # Domain Pattern Detection & Customization
    if any(k in lower_idea for k in ["internship", "job", "career", "hiring", "recruit", "talent", "candidate", "resume"]):
        domain = "talent_hiring"
        entity_name = "Opportunity"
        entity_plural = "Opportunities"
        icon = "💼"
        kpi_labels = ["Active Opportunities", "Match Precision", "Avg Response Time", "Placement Rate"]
        kpi_values = ["142", "96.4%", "1.2s", "34.8%"]
        generator_label = "Generate AI-Tailored Application Dossier"
        kanban_cols = ["1. Discovered", "2. AI Tailoring", "3. Submitted", "4. Interview / Offer"]
        sample_entities = [
            {"id": "ent-1", "title": "Autonomous AI Research Engineer", "company": "DeepStream Labs", "location": "Remote / San Francisco", "match_score": 98, "status": "Ready to Apply", "compensation": "$165k / yr", "deadline": "2 days left", "attribute_label": "Salary Range", "badge": "High Match"},
            {"id": "ent-2", "title": "Full-Stack Product Developer Fellowship", "company": "Synthetix Dynamics", "location": "New York, NY", "match_score": 93, "status": "Interview Scheduled", "compensation": "$130k / yr", "deadline": "1 week left", "attribute_label": "Salary Range", "badge": "Fast Track"},
            {"id": "ent-3", "title": "Cloud Distributed Systems Fellow", "company": "Voxel Cloud", "location": "Remote", "match_score": 89, "status": "Tailoring Resume", "compensation": "$145k / yr", "deadline": "4 days left", "attribute_label": "Salary Range", "badge": "Top 5%"},
            {"id": "ent-4", "title": "AI Product Operations Associate", "company": "Hyperion Dynamics", "location": "Austin, TX", "match_score": 85, "status": "Application Submitted", "compensation": "$115k / yr", "deadline": "In Review", "attribute_label": "Salary Range", "badge": "Standard"},
        ]

    elif any(k in lower_idea for k in ["legal", "contract", "law", "compliance", "clause", "nda", "patent"]):
        domain = "legal_tech"
        entity_name = "Contract"
        entity_plural = "Contracts"
        icon = "⚖️"
        kpi_labels = ["Audited Contracts", "Risk Detection Rate", "Clause Review Velocity", "Compliance Index"]
        kpi_values = ["840", "99.1%", "0.8s", "98.7%"]
        generator_label = "Generate Automated Redline & Risk Audit"
        kanban_cols = ["1. Ingested", "2. AI Risk Scan", "3. Redlining", "4. Approved & Signed"]
        sample_entities = [
            {"id": "ent-1", "title": "Master Services Agreement (Enterprise Tier)", "company": "OmniCorp Global", "location": "US Jurisdiction", "match_score": 99, "status": "3 Risk Flags Isolated", "compensation": "$480,000 Deal Value", "deadline": "Review by 5 PM", "attribute_label": "Contract Value", "badge": "Urgent Review"},
            {"id": "ent-2", "title": "Mutual Non-Disclosure & IP Agreement", "company": "Aetheria Robotics", "location": "Delaware Standard", "match_score": 94, "status": "Compliant (0 Flags)", "compensation": "Standard Term", "deadline": "Signed", "attribute_label": "Contract Value", "badge": "Pre-Approved"},
            {"id": "ent-3", "title": "Cross-Border SaaS Data Processing Addendum", "company": "EuroTech Solutions", "location": "GDPR / EU Standard", "match_score": 91, "status": "Indemnity Cap Flagged", "compensation": "$125,000 / yr", "deadline": "2 days left", "attribute_label": "Contract Value", "badge": "Needs Approval"},
            {"id": "ent-4", "title": "Vendor SLA & Cloud Infrastructure Terms", "company": "Voxel Cloud Hosting", "location": "California Law", "match_score": 87, "status": "Uptime Penalty Adjusted", "compensation": "$72,000 / yr", "deadline": "Pending Signatures", "attribute_label": "Contract Value", "badge": "Standard"},
        ]

    elif any(k in lower_idea for k in ["real estate", "property", "tenant", "rent", "mortgage", "housing", "realtor", "home"]):
        domain = "prop_tech"
        entity_name = "Property Listing"
        entity_plural = "Properties"
        icon = "🏢"
        kpi_labels = ["Monitored Assets", "Valuation Precision", "Avg Days on Market", "Projected Cap Rate"]
        kpi_values = ["320", "97.8%", "14 days", "8.6%"]
        generator_label = "Generate AI Property Cashflow & Cap Rate Dossier"
        kanban_cols = ["1. Sourced", "2. Underwriting", "3. Due Diligence", "4. Acquired / Closed"]
        sample_entities = [
            {"id": "ent-1", "title": "Prime Multi-Family Urban Complex (12 Units)", "company": "Highland Capital Partners", "location": "Denver, CO", "match_score": 97, "status": "Cashflow Positive (9.2% Cap)", "compensation": "$3,450,000", "deadline": "Offers close Friday", "attribute_label": "Listing Price", "badge": "High Yield"},
            {"id": "ent-2", "title": "Modern Commercial Retail Hub", "company": "Vanguard Properties", "location": "Austin, TX", "match_score": 93, "status": "Triple-Net Leased (95% Occupancy)", "compensation": "$5,200,000", "deadline": "Under LOI", "attribute_label": "Listing Price", "badge": "Prime Location"},
            {"id": "ent-3", "title": "Suburban Build-to-Rent Community Portfolio", "company": "Sunbelt Assets Group", "location": "Phoenix, AZ", "match_score": 90, "status": "Value-Add Opportunity", "compensation": "$2,850,000", "deadline": "Inspection active", "attribute_label": "Listing Price", "badge": "Value-Add"},
            {"id": "ent-4", "title": "Downtown Mixed-Use Creative Loft Building", "company": "Metropolitan Realty", "location": "Seattle, WA", "match_score": 86, "status": "Cashflow Projected $18k/mo", "compensation": "$1,950,000", "deadline": "Open listing", "attribute_label": "Listing Price", "badge": "Turnkey"},
        ]

    elif any(k in lower_idea for k in ["crop", "drone", "farm", "agriculture", "soil", "harvest", "agri", "irrigation"]):
        domain = "agri_tech"
        entity_name = "Crop Zone"
        entity_plural = "Field Sectors"
        icon = "🌾"
        kpi_labels = ["Monitored Acreage", "Crop Health Index (NDVI)", "Pest Risk Detection", "Yield Forecast Accuracy"]
        kpi_values = ["14,200 Acres", "0.84 NDVI", "Low (4 Alerts)", "+19.2% YoY"]
        generator_label = "Generate Automated Drone Flight Plan & Crop Stress Report"
        kanban_cols = ["1. Flight Scanned", "2. Multispectral Analysis", "3. Treatment Dispatched", "4. Health Restored"]
        sample_entities = [
            {"id": "ent-1", "title": "North Pivot Corn Field (Sector 4B - 320 Acres)", "company": "Valley Agribusiness Co.", "location": "Iowa Midwest Hub", "match_score": 98, "status": "Nitrogen Deficit Identified", "compensation": "92.4% Optimal Yield Target", "deadline": "Flight Scan Today", "attribute_label": "Acreage", "badge": "Action Needed"},
            {"id": "ent-2", "title": "High-Density Almond Orchard Block 12", "company": "Sunland Groves", "location": "Central Valley, CA", "match_score": 95, "status": "Irrigation Efficiency Optimal", "compensation": "98.1% Health Index", "deadline": "Weekly Drone Pass", "attribute_label": "Acreage", "badge": "Optimal"},
            {"id": "ent-3", "title": "Organic Winter Wheat Test Plots", "company": "Prairie BioSystems", "location": "Kansas Plains", "match_score": 91, "status": "Early Fungal Risk Flagged", "compensation": "Target Yield +14%", "deadline": "2 days left", "attribute_label": "Acreage", "badge": "Monitored"},
            {"id": "ent-4", "title": "Soybean Seed Trial Sector Alpha", "company": "AgriTech Seed Labs", "location": "Illinois Basin", "match_score": 87, "status": "Canopy Coverage 94%", "compensation": "Baseline Met", "deadline": "Next Run Friday", "attribute_label": "Acreage", "badge": "Standard"},
        ]

    elif any(k in lower_idea for k in ["patient", "medical", "diet", "nutrition", "workout", "doctor", "clinic", "wellness", "biomarker", "fitness"]):
        domain = "health_tech"
        entity_name = "Patient Protocol"
        entity_plural = "Protocols"
        icon = "🩺"
        kpi_labels = ["Active Protocols", "Biomarker Sync Rate", "Patient Adherence", "Recovery Velocity"]
        kpi_values = ["540", "99.4%", "92.1%", "+24%"]
        generator_label = "Generate Personalized Clinical & Nutrition Blueprint"
        kanban_cols = ["1. Ingested Biometrics", "2. AI Biomarker Analysis", "3. Active Therapy", "4. Target Reached"]
        sample_entities = [
            {"id": "ent-1", "title": "Cardiometabolic & Glucose Optimization Protocol", "company": "Dr. Sarah Jenkins, MD", "location": "Continuous Wearable Sync", "match_score": 99, "status": "Optimal Zone (Day 18/45)", "compensation": "94% Protocol Compliance", "deadline": "Next Lab in 4 days", "attribute_label": "Adherence", "badge": "Optimal"},
            {"id": "ent-2", "title": "Circadian Rhythm & Deep Sleep Restoration", "company": "NeuroHealth Labs", "location": "Sleep Biometrics Tracked", "match_score": 95, "status": "+38m REM Sleep Average", "compensation": "91% Protocol Compliance", "deadline": "Weekly Review", "attribute_label": "Adherence", "badge": "Accelerating"},
            {"id": "ent-3", "title": "Zone-2 Cardio Endurance & VO2 Max Engine", "company": "Apex Performance Institute", "location": "HRV & Heart Rate Monitor", "match_score": 90, "status": "Active 4x/wk Training", "compensation": "88% Protocol Compliance", "deadline": "Check-in Tomorrow", "attribute_label": "Adherence", "badge": "On Track"},
            {"id": "ent-4", "title": "Post-Surgical Musculoskeletal Rehab Cycle", "company": "OrthoCare Therapy Group", "location": "Range-of-Motion Sensors", "match_score": 88, "status": "Phase 2 Mobility", "compensation": "96% Protocol Compliance", "deadline": "Clinic Visit Friday", "attribute_label": "Adherence", "badge": "Supervised"},
        ]

    elif any(k in lower_idea for k in ["crypto", "finance", "invest", "trading", "stock", "wealth", "budget", "bank", "payment"]):
        domain = "fin_tech"
        entity_name = "Vault Position"
        entity_plural = "Portfolio Positions"
        icon = "📈"
        kpi_labels = ["Active Capital Managed", "Net Annual Yield", "Max Drawdown Buffer", "Algorithmic Win Rate"]
        kpi_values = ["$12.4M", "16.8% APY", "-3.2%", "78.4%"]
        generator_label = "Generate Yield Optimization & Risk Rebalancing Strategy"
        kanban_cols = ["1. Capital Allocated", "2. Strategy Executing", "3. Compounding", "4. Harvested Yield"]
        sample_entities = [
            {"id": "ent-1", "title": "Algorithmic Arbitrage & Delta-Neutral Vault", "company": "AlphaStream Automated Yield", "location": "Multi-Chain Execution", "match_score": 98, "status": "Active Compounding (18.4% APY)", "compensation": "$1,250,000 Position", "deadline": "Rebalancing in 2h", "attribute_label": "Asset Allocation", "badge": "High Yield"},
            {"id": "ent-2", "title": "Smart Institutional Index Basket v3", "company": "Vanguard DeFi Fund", "location": "Layer-1 Ethereum", "match_score": 94, "status": "Low Volatility (11.2% APY)", "compensation": "$3,800,000 Position", "deadline": "Weekly Harvest", "attribute_label": "Asset Allocation", "badge": "Conservative"},
            {"id": "ent-3", "title": "Automated Real-World Asset (RWA) Treasury Pool", "company": "Aegis Yield Network", "location": "Tokenized US T-Bills", "match_score": 92, "status": "Government Backed (5.4% APY)", "compensation": "$5,000,000 Position", "deadline": "Daily Liquidity", "attribute_label": "Asset Allocation", "badge": "Ultra Safe"},
            {"id": "ent-4", "title": "Decentralized Liquidity Automated Market Maker", "company": "Nexus Protocol", "location": "Layer-2 Arbitrum", "match_score": 89, "status": "Fee Generation (24.1% APY)", "compensation": "$750,000 Position", "deadline": "Active", "attribute_label": "Asset Allocation", "badge": "Growth"},
        ]

    elif any(k in lower_idea for k in ["e-commerce", "store", "shopify", "product", "retail", "shipping", "logistics", "inventory"]):
        domain = "ecommerce_tech"
        entity_name = "Product SKU"
        entity_plural = "Catalog Products"
        icon = "🛍️"
        kpi_labels = ["Live Catalog SKUs", "Inventory Turnover", "Avg Order Value", "Fulfillment Velocity"]
        kpi_values = ["1,840", "4.2x/mo", "$84.50", "4.2 hrs"]
        generator_label = "Generate AI Product Description & Ad Campaign Bundle"
        kanban_cols = ["1. In Stock", "2. Campaign Active", "3. High Velocity Order", "4. Restock Triggered"]
        sample_entities = [
            {"id": "ent-1", "title": "Next-Gen Ergonomic Pro Wireless Keyboard", "company": "TechGear Direct", "location": "Warehouse Central (US-East)", "match_score": 99, "status": "Viral Trend (320 units sold/day)", "compensation": "$149.00 MSRP", "deadline": "980 in stock", "attribute_label": "Price", "badge": "Best Seller"},
            {"id": "ent-2", "title": "Ultra-Lightweight Aerodynamic Running Pack", "company": "Verve Athletics", "location": "Fulfillment Hub (US-West)", "match_score": 95, "status": "ROAS 4.8x Active Ad", "compensation": "$89.00 MSRP", "deadline": "420 in stock", "attribute_label": "Price", "badge": "High Margin"},
            {"id": "ent-3", "title": "Organic Cold-Pressed Botanical Nectar Serum", "company": "Aura Glow Skincare", "location": "Local Distributor", "match_score": 91, "status": "Subscription Reorder 68%", "compensation": "$64.00 MSRP", "deadline": "1,200 in stock", "attribute_label": "Price", "badge": "Recurring"},
            {"id": "ent-4", "title": "Noise-Cancelling Acoustic Study Pod", "company": "FocusSphere Studio", "location": "Drop-ship Supplier", "match_score": 87, "status": "Custom Freight Assembly", "compensation": "$899.00 MSRP", "deadline": "15 in stock", "attribute_label": "Price", "badge": "High Ticket"},
        ]

    elif any(k in lower_idea for k in ["education", "tutor", "student", "course", "learn", "teach", "school", "exam", "quiz", "math"]):
        domain = "ed_tech"
        entity_name = "Learning Module"
        entity_plural = "Curriculum Modules"
        icon = "🎓"
        kpi_labels = ["Active Students", "Concept Mastery Rate", "Avg Time to Comprehension", "Course Completion"]
        kpi_values = ["2,450", "94.8%", "18 mins", "89.2%"]
        generator_label = "Generate Adaptive Interactive Lesson & Quiz Plan"
        kanban_cols = ["1. In Progress", "2. Interactive Quiz", "3. Mastery Validated", "4. Certified"]
        sample_entities = [
            {"id": "ent-1", "title": "Foundational Linear Algebra & Matrix Eigenvalues", "company": "MathMind AI Academy", "location": "Adaptive Interactive Path", "match_score": 99, "status": "Mastery Index 96% (Completed)", "compensation": "3.5 hrs Coursework", "deadline": "Exam Friday", "attribute_label": "Duration", "badge": "Core Concept"},
            {"id": "ent-2", "title": "Neural Networks & Backpropagation from Scratch", "company": "DeepLearning Accelerator", "location": "Interactive Python Lab", "match_score": 96, "status": "In Progress (Module 4/8)", "compensation": "6.0 hrs Coursework", "deadline": "Project in 3 days", "attribute_label": "Duration", "badge": "Advanced"},
            {"id": "ent-3", "title": "Data Structures & Algorithmic Complexity (Big O)", "company": "CS Masterclass", "location": "Live Code Sandbox", "match_score": 92, "status": "82 Practice Problems Solved", "compensation": "4.5 hrs Coursework", "deadline": "Weekly Review", "attribute_label": "Duration", "badge": "Essential"},
            {"id": "ent-4", "title": "Prompt Engineering & Multi-Agent System Architecture", "company": "Venture AI Institute", "location": "Video + Sandbox Repo", "match_score": 88, "status": "Certificate Issued", "compensation": "2.0 hrs Coursework", "deadline": "Completed", "attribute_label": "Duration", "badge": "Certified"},
        ]

    elif any(k in lower_idea for k in ["crop", "drone", "farm", "agriculture", "soil", "harvest", "agri", "irrigation"]):
        domain = "agri_tech"
        entity_name = "Crop Zone"
        entity_plural = "Field Sectors"
        icon = "🌾"
        kpi_labels = ["Monitored Acreage", "Crop Health Index (NDVI)", "Pest Risk Detection", "Yield Forecast Accuracy"]
        kpi_values = ["14,200 Acres", "0.84 NDVI", "Low (4 Alerts)", "+19.2% YoY"]
        generator_label = "Generate Automated Drone Flight Plan & Crop Stress Report"
        kanban_cols = ["1. Flight Scanned", "2. Multispectral Analysis", "3. Treatment Dispatched", "4. Health Restored"]
        sample_entities = [
            {"id": "ent-1", "title": "North Pivot Corn Field (Sector 4B - 320 Acres)", "company": "Valley Agribusiness Co.", "location": "Iowa Midwest Hub", "match_score": 98, "status": "Nitrogen Deficit Identified", "compensation": "92.4% Optimal Yield Target", "deadline": "Flight Scan Today", "attribute_label": "Acreage", "badge": "Action Needed"},
            {"id": "ent-2", "title": "High-Density Almond Orchard Block 12", "company": "Sunland Groves", "location": "Central Valley, CA", "match_score": 95, "status": "Irrigation Efficiency Optimal", "compensation": "98.1% Health Index", "deadline": "Weekly Drone Pass", "attribute_label": "Acreage", "badge": "Optimal"},
            {"id": "ent-3", "title": "Organic Winter Wheat Test Plots", "company": "Prairie BioSystems", "location": "Kansas Plains", "match_score": 91, "status": "Early Fungal Risk Flagged", "compensation": "Target Yield +14%", "deadline": "2 days left", "attribute_label": "Acreage", "badge": "Monitored"},
            {"id": "ent-4", "title": "Soybean Seed Trial Sector Alpha", "company": "AgriTech Seed Labs", "location": "Illinois Basin", "match_score": 87, "status": "Canopy Coverage 94%", "compensation": "Baseline Met", "deadline": "Next Run Friday", "attribute_label": "Acreage", "badge": "Standard"},
        ]

    elif any(k in lower_idea for k in ["cyber", "security", "threat", "vulnerability", "firewall", "auth", "malware", "phishing", "breach"]):
        domain = "cyber_tech"
        entity_name = "Security Asset"
        entity_plural = "Security Endpoints"
        icon = "🛡️"
        kpi_labels = ["Monitored Endpoints", "Threat Detection Velocity", "Automated Remediation Rate", "Zero-Day Vulnerabilities"]
        kpi_values = ["24,500", "0.04s", "99.2%", "0 Active"]
        generator_label = "Generate Automated Penetration & Patch Strategy"
        kanban_cols = ["1. Anomaly Ingested", "2. Sandboxed Analysis", "3. Patch Dispatched", "4. Remediated & Logged"]
        sample_entities = [
            {"id": "ent-1", "title": "Production Kubernetes Cluster API Gateway", "company": "CloudStack Enterprise", "location": "AWS US-East-1", "match_score": 99, "status": "Brute-Force Rate Limiting Active", "compensation": "99.999% Uptime", "deadline": "Real-time Monitoring", "attribute_label": "Traffic Load", "badge": "Secured"},
            {"id": "ent-2", "title": "Internal SSO & OAuth2 Authorization Service", "company": "Hyperion Identity Systems", "location": "Zero-Trust Mesh", "match_score": 96, "status": "MFA Anomaly Blocked (IP: 185.x.x)", "compensation": "Zero Breaches", "deadline": "Logged", "attribute_label": "Auth Events", "badge": "Blocked"},
            {"id": "ent-3", "title": "Customer Data Encryption Key Vault (HSM)", "company": "VaultGuard Security", "location": "Multi-Region KMS", "match_score": 93, "status": "Key Rotation Completed", "compensation": "AES-256 GCM", "deadline": "Next Rotation 30d", "attribute_label": "Encryption Tier", "badge": "Certified"},
            {"id": "ent-4", "title": "Remote Employee Endpoint Fleet (450 Devices)", "company": "Distributed Workforce Core", "location": "Global Mesh", "match_score": 89, "status": "EDR Agents 100% Updated", "compensation": "Zero Malware Flags", "deadline": "Continuous", "attribute_label": "Device Count", "badge": "Compliant"},
        ]

    elif any(k in lower_idea for k in ["video", "podcast", "creator", "content", "audio", "youtube", "media", "social", "music", "animation"]):
        domain = "creator_tech"
        entity_name = "Media Project"
        entity_plural = "Content Assets"
        icon = "🎬"
        kpi_labels = ["Generated Assets", "Avg Render Time", "Audience Engagement", "Monetization ROI"]
        kpi_values = ["3,840", "4.2s", "+48.6%", "4.4x ROAS"]
        generator_label = "Generate AI Viral Video Clips & Auto-Captions"
        kanban_cols = ["1. Raw Ingested", "2. AI Hook Detection", "3. Auto-Editing", "4. Published"]
        sample_entities = [
            {"id": "ent-1", "title": "Deep Dive Podcast Ep. 48: The Future of Autonomous AI", "company": "Founders Tech Broadcast", "location": "YouTube & Spotify Feed", "match_score": 99, "status": "12 Viral Shorts Rendered", "compensation": "148k Est. Views", "deadline": "Publishing 6 PM", "attribute_label": "Reach", "badge": "Viral Hook"},
            {"id": "ent-2", "title": "High-Converting B2B SaaS Product Demo Video", "company": "SaaSFlow Marketing", "location": "LinkedIn Ad Campaign", "match_score": 95, "status": "AI Voiceover & 4k Captions", "compensation": "4.2x Conversion Lift", "deadline": "Campaign Live", "attribute_label": "Conversion", "badge": "Optimized"},
            {"id": "ent-3", "title": "Interactive Storyboard & 3D Avatar Sequence", "company": "Voxel Story Studio", "location": "TikTok & Reels Multi-Post", "match_score": 91, "status": "Subtitles & Sound Effects Synced", "compensation": "92k Est. Views", "deadline": "Scheduled Tomorrow", "attribute_label": "Reach", "badge": "Scheduled"},
            {"id": "ent-4", "title": "Weekly Market Intelligence Audio Digest", "company": "Finance Pulse Daily", "location": "Subscriber Newsletter", "match_score": 88, "status": "100% Automated Synthesis", "compensation": "32k Listeners", "deadline": "Delivered", "attribute_label": "Reach", "badge": "Delivered"},
        ]

    elif any(k in lower_idea for k in ["energy", "solar", "carbon", "sustainability", "climate", "grid", "clean", "power", "ppa", "emission"]):
        domain = "climate_tech"
        entity_name = "Clean Energy Asset"
        entity_plural = "Energy Assets"
        icon = "🌱"
        kpi_labels = ["Monitored Power Grid Assets", "Carbon Offsets Verified", "PPA Audit Accuracy", "Peak Efficiency Rate"]
        kpi_values = ["4.2 GW", "180k Tons", "99.7%", "96.4%"]
        generator_label = "Generate Automated PPA Tariff & Carbon Audit Dossier"
        kanban_cols = ["1. Meter Ingested", "2. Tariff Audit", "3. Carbon Offset Validated", "4. Settled"]
        sample_entities = [
            {"id": "ent-1", "title": "Utility-Scale Solar Farm Phase IV (150 MW)", "company": "SunGrid Energy Capital", "location": "Mojave Desert, CA", "match_score": 98, "status": "Peak Generation (98.4% Efficiency)", "compensation": "$18,500 Daily Yield", "deadline": "PPA Audit Pending", "attribute_label": "Daily Yield", "badge": "High Yield"},
            {"id": "ent-2", "title": "Offshore Wind Turbine Array Alpha (80 MW)", "company": "OceanPower Dynamics", "location": "Atlantic Coastline", "match_score": 95, "status": "Continuous Generation", "compensation": "$12,200 Daily Yield", "deadline": "Grid Sync Active", "attribute_label": "Daily Yield", "badge": "Baseload"},
            {"id": "ent-3", "title": "Commercial Microgrid Battery Storage BESS (20 MWh)", "company": "VoltVault Infrastructure", "location": "Austin Technology Park", "match_score": 92, "status": "Arbitrage Discharge Mode", "compensation": "$4,800 Daily Yield", "deadline": "Peak Tariff in 1h", "attribute_label": "Daily Yield", "badge": "Smart Grid"},
            {"id": "ent-4", "title": "Industrial Biomass Cogeneration Facility", "company": "EcoGen BioPower", "location": "Pacific Northwest", "match_score": 87, "status": "Renewable Certificate Verified", "compensation": "$6,100 Daily Yield", "deadline": "Inspection Friday", "attribute_label": "Daily Yield", "badge": "Verified"},
        ]

    else:
        # Dynamic Custom Domain Parser for any other unique startup idea!
        domain = "custom_venture"
        entity_name = f"{sig_words[0] if sig_words else 'Item'} Target"
        entity_plural = f"{sig_words[0] if sig_words else 'Item'} Workstreams"
        icon = "⚡"
        kpi_labels = [f"Active {entity_plural}", "AI Optimization Rate", "Throughput Velocity", "Success Conversion"]
        kpi_values = ["380", "96.8%", "0.9s", "41.2%"]
        generator_label = f"Generate Customized AI {entity_name} Intelligence"
        kanban_cols = ["1. Ingested Stream", "2. AI Optimization", "3. Action Executed", "4. Success Verified"]
        
        # Build contextual sample entities using key words from the idea
        sample_entities = [
            {"id": "ent-1", "title": f"Autonomous {clean_idea[:30]} Primary Flow", "company": f"{app_name} Core Network", "location": "Cloud Cluster 01", "match_score": 98, "status": "Active & Processing", "compensation": "99.4% Efficiency", "deadline": "Live Now", "attribute_label": "System Score", "badge": "Optimal"},
            {"id": "ent-2", "title": f"High-Throughput {sig_words[0] if sig_words else 'Data'} Optimization Engine", "company": "Synthetix Operations", "location": "Distributed Edge Hub", "match_score": 94, "status": "Queue Velocity +34%", "compensation": "8.4k ops/sec", "deadline": "Running Cycle", "attribute_label": "System Score", "badge": "Accelerating"},
            {"id": "ent-3", "title": f"Custom {sig_words[-1] if sig_words else 'Pipeline'} Intelligence Stream", "company": "Voxel Cloud Nodes", "location": "Enterprise Secure Pod", "match_score": 90, "status": "Validated by AI Agent", "compensation": "Zero Error Output", "deadline": "Scheduled in 2h", "attribute_label": "System Score", "badge": "Verified"},
            {"id": "ent-4", "title": f"Real-Time Telemetry & Performance Adapter", "company": f"{app_name} Analytics", "location": "Central Ingestion Node", "match_score": 86, "status": "Telemetry Active", "compensation": "99.9% Uptime", "deadline": "Continuous", "attribute_label": "System Score", "badge": "Standard"},
        ]

    return {
        "app_name": app_name,
        "domain": domain,
        "entity_name": entity_name,
        "entity_plural": entity_plural,
        "icon": icon,
        "kpi_labels": kpi_labels,
        "kpi_values": kpi_values,
        "generator_label": generator_label,
        "kanban_cols": kanban_cols,
        "sample_entities": sample_entities,
    }


def generate_mvp_spec(
    idea: str,
    research: Optional[ResearchOutput] = None,
    product: Optional[ProductOutput] = None,
    tech: Optional[TechnicalOutput] = None,
) -> MVPSpec:
    """
    Synthesizes a structured MVPSpec from the multi-agent outputs.
    Produces functional, interactive UI prototype components personalized to any startup idea.
    """
    clean_idea = idea.strip()
    profile = _extract_domain_profile(clean_idea, product, research)

    app_name = profile["app_name"]
    entity_name = profile["entity_name"]
    entity_plural = profile["entity_plural"]
    sample_entities = profile["sample_entities"]
    kpi_labels = profile["kpi_labels"]
    kpi_values = profile["kpi_values"]
    kanban_cols = profile["kanban_cols"]

    tagline = product.product_summary if product else f"Autonomous intelligence operating system for {clean_idea[:75]}"
    target_user = product.target_user if product else "Core Target Users & Operators"

    # Screen 1: Command Center / Dashboard
    screen_dashboard = MVPScreen(
        id="dashboard",
        title="Command Center",
        icon="⚡",
        route="/prototype/dashboard",
        description=f"Real-time operational dashboard and telemetry tracking for {app_name}.",
        badge="Live Metrics",
        components=[
            MVPUIComponent(
                id="kpi-metrics",
                type="metric_card",
                title="Real-Time Performance Metrics",
                properties={"columns": 4},
                data=[
                    {"label": kpi_labels[0], "value": kpi_values[0], "change": "+18.4%", "trend": "up", "color": "#00F0FF"},
                    {"label": kpi_labels[1], "value": kpi_values[1], "change": "+4.2%", "trend": "up", "color": "#10B981"},
                    {"label": kpi_labels[2], "value": kpi_values[2], "change": "-32%", "trend": "up", "color": "#8B5CF6"},
                    {"label": kpi_labels[3], "value": kpi_values[3], "change": "+14.6%", "trend": "up", "color": "#FB923C"},
                ]
            ),
            MVPUIComponent(
                id="active-feed",
                type="data_table",
                title=f"Priority {entity_plural} Awaiting Action",
                description="Filtered by algorithmic match scoring and urgent timelines.",
                properties={"selectable": True, "actionable": True},
                data=sample_entities
            ),
        ]
    )

    # Screen 2: Discovery / Search Explorer
    screen_discovery = MVPScreen(
        id="discovery",
        title=f"Explore {entity_plural}",
        icon="🔍",
        route="/prototype/discovery",
        description=f"Search, filter, and inspect {entity_plural.lower()} with intelligent recommendations.",
        badge="AI Matched",
        components=[
            MVPUIComponent(
                id="search-filter-bar",
                type="search_filter",
                title="Semantic Filter & Query",
                properties={"placeholder": f"Search {entity_plural.lower()} by keywords, parameters, or specifications...", "filters": ["All Matches", "Score > 90%", "High Priority"]}
            ),
            MVPUIComponent(
                id="opportunity-grid",
                type="detail_card",
                title=f"Discovered {entity_plural}",
                properties={"layout": "grid"},
                data=sample_entities
            )
        ]
    )

    # Screen 3: Execution Tracker / Kanban
    screen_tracker = MVPScreen(
        id="tracker",
        title="Execution Tracker",
        icon="📋",
        route="/prototype/tracker",
        description="Track active stages, algorithmic optimizations, and completion lifecycles.",
        badge="Workflow",
        components=[
            MVPUIComponent(
                id="kanban-workflow",
                type="kanban",
                title="Workflow Status Pipeline",
                data=[
                    {"column": kanban_cols[0], "count": 18, "items": [sample_entities[0]]},
                    {"column": kanban_cols[1], "count": 7, "items": [sample_entities[2]]},
                    {"column": kanban_cols[2], "count": 12, "items": [sample_entities[1]]},
                    {"column": kanban_cols[3], "count": 5, "items": [sample_entities[3] if len(sample_entities) > 3 else sample_entities[0]]},
                ]
            )
        ]
    )

    # Screen 4: Generator / AI Tailor Form
    screen_assistant = MVPScreen(
        id="assistant",
        title="AI Intelligence Generator",
        icon="✨",
        route="/prototype/assistant",
        description=f"Autonomous generation tool customized for {target_user}.",
        badge="One-Click AI",
        components=[
            MVPUIComponent(
                id="tailor-form",
                type="form",
                title=profile["generator_label"],
                properties={
                    "fields": [
                        {"name": "target_item", "label": f"Select Target {entity_name}", "type": "select", "options": [e["title"] for e in sample_entities]},
                        {"name": "tone", "label": "Generation Persona & Style", "type": "select", "options": ["Technical & Rigorous", "Strategic & Executive", "Rapid & Automated"]},
                        {"name": "custom_notes", "label": "Specific Instructions / Key Constraints", "type": "textarea", "placeholder": f"Enter specific parameters, required outputs, or constraints for this {entity_name.lower()}..."},
                    ],
                    "submit_label": f"Execute AI Generation for {entity_name}",
                }
            )
        ]
    )

    # Screen 5: Analytics & Telemetry
    screen_analytics = MVPScreen(
        id="analytics",
        title="Performance Analytics",
        icon="📊",
        route="/prototype/analytics",
        description="Inspect conversion rates, processing throughput, and algorithmic accuracy.",
        badge="Telemetry",
        components=[
            MVPUIComponent(
                id="analytics-chart-summary",
                type="chart",
                title="Pipeline Funnel & Conversion Rates",
                properties={"chart_type": "bar"},
                data=[
                    {"label": f"1. Total {entity_plural} Ingested", "value": 520},
                    {"label": "2. High-Confidence AI Matches", "value": 168},
                    {"label": "3. Automated Packages Synthesized", "value": 48},
                    {"label": "4. Active Conversions & Approvals", "value": 16},
                    {"label": "5. Completed Successful Transactions", "value": 6},
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
            {"id": "dashboard", "title": "Command Center", "icon": "⚡"},
            {"id": "discovery", "title": f"Explore {entity_plural}", "icon": "🔍"},
            {"id": "tracker", "title": "Execution Tracker", "icon": "📋"},
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
            f"One-Click AI Optimization",
            f"Export {entity_name} Dossier",
            "Trigger Automated Workflow",
        ],
        created_at_stage="product_cto"
    )
