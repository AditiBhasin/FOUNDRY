# FOUNDry Backend

FOUNDry is an AI-powered startup operating system.

A startup idea is processed by a coordinated organization of specialized AI agents:

Idea → CEO → Research → Product → Finance → CTO → QA → CEO Review → Final Build Plan

## Backend Stack

- Python
- FastAPI
- Pydantic
- Ollama
- In-memory startup state
- Multi-agent orchestration

## Agents

1. CEO / Orchestrator
2. Research Agent
3. Product Agent
4. Finance / Business Agent
5. CTO / Builder Agent
6. QA / Tester Agent

The agents share structured startup state and work sequentially based on dependencies.

A maximum of one revision cycle is allowed after QA review.

## Start FOUNDry Backend

Open a terminal:

```powershell
cd C:\Users\hp\Desktop\Foundry\backend
```

Activate the Python virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Start Ollama if it is not already running:

```powershell
ollama serve
```

Make sure the configured Ollama model is installed:

```powershell
ollama list
```

In another terminal, activate the virtual environment again and start FastAPI:

```powershell
cd C:\Users\hp\Desktop\Foundry\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

The backend runs on port 8000 by default.

## Health Check

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/health"
```

Expected result:

```text
status
------
healthy
```

## API Endpoints

### Create Startup

```text
POST /ideas
```

Starts the FOUNDry workflow.

### Get Full Startup State

```text
GET /ideas/{id}
```

Returns the complete internal startup state.

### Get Workflow Status

```text
GET /ideas/{id}/status
```

Designed for frontend polling.

Returns information including:

- workflow status
- current stage
- current agent
- progress percentage
- completed agents
- agent errors
- revision count
- build readiness
- final-plan availability

### Get Final Result

```text
GET /ideas/{id}/result
```

Returns the final startup build plan when available.

### Retry Workflow

```text
POST /ideas/{id}/retry
```

Restarts a failed workflow using the same startup idea.

### Health

```text
GET /health
```

## Workflow

```text
STARTUP IDEA
     |
     v
CEO / ORCHESTRATOR
     |
     v
RESEARCH
     |
     v
PRODUCT
     |
     v
FINANCE
     |
     v
CTO / BUILDER
     |
     v
QA / TESTER
     |
     v
CEO REVIEW
     |
     v
OPTIONAL SINGLE REVISION
     |
     v
FINAL STARTUP BUILD PLAN
```

## Frontend Integration

The recommended frontend flow is:

```text
POST /ideas
     |
     v
Store returned ID
     |
     v
Poll GET /ideas/{id}/status
     |
     v
status == completed?
     |
     +---- No ----> continue polling
     |
     +---- Yes
             |
             v
GET /ideas/{id}/result
             |
             v
Display Final Build Plan
```

If:

```text
status == failed
```

the frontend can display the returned error and optionally call:

```text
POST /ideas/{id}/retry
```

## Important MVP Notes

FOUNDry uses one underlying local LLM with multiple specialized agent roles.

Agents have separate responsibilities, structured outputs, dependencies, shared startup state, QA feedback, and controlled revision.

Ollama integration is isolated in the AI service layer so another model provider can be introduced later without redesigning the entire agent architecture.

For hackathon reliability, slow CTO/QA local inference can fall back to conservative structured planning rather than crashing the entire workflow.

The MVP uses in-memory storage. Restarting the FastAPI process clears existing startup workflows.