/**
 * FOUNDry API Client Service
 * 
 * Direct interface to the FastAPI multi-agent backend on http://127.0.0.1:8000.
 * Pure real backend integration with zero simulated or fake data generation.
 */

const API_BASE_URL = 'https://foundry-production-3adb.up.railway.app';

/**
 * Check backend health status
 * GET /health
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return { healthy: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { healthy: data.status === 'healthy', data };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

/**
 * Start a new startup workflow by submitting an idea
 * POST /ideas
 */
export async function submitStartupIdea(idea) {
  const trimmed = idea.trim();
  if (!trimmed) {
    throw new Error('Startup idea cannot be empty.');
  }

  const response = await fetch(`${API_BASE_URL}/ideas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ idea: trimmed }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = errorText;
    try {
      const json = JSON.parse(errorText);
      detail = json.detail || json.message || errorText;
    } catch {
      // Keep raw string
    }
    throw new Error(`API Error (${response.status}): ${detail}`);
  }

  return await response.json();
}

/**
 * Get workflow status for real-time polling
 * GET /ideas/{startup_id}/status
 */
export async function fetchStartupStatus(startupId) {
  const response = await fetch(`${API_BASE_URL}/ideas/${startupId}/status`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = errorText;
    try {
      const json = JSON.parse(errorText);
      detail = json.detail || json.message || errorText;
    } catch {
      // Keep raw string
    }
    throw new Error(`Status fetch error (${response.status}): ${detail}`);
  }

  return await response.json();
}

/**
 * Get complete internal StartupState
 * GET /ideas/{startup_id}
 */
export async function fetchStartupFullState(startupId) {
  const response = await fetch(`${API_BASE_URL}/ideas/${startupId}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Full state fetch error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Get final build plan result
 * GET /ideas/{startup_id}/result
 */
export async function fetchStartupResult(startupId) {
  const response = await fetch(`${API_BASE_URL}/ideas/${startupId}/result`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Result fetch error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Update and recalculate financial assumptions
 * POST /ideas/{startup_id}/finance
 */
export async function updateFinancialModelApi(startupId, inputs) {
  const response = await fetch(`${API_BASE_URL}/ideas/${startupId}/finance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(inputs),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Financial recalculation error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch structured MVPSpec
 * GET /ideas/{startup_id}/mvp
 */
export async function fetchStartupMvp(startupId) {
  const response = await fetch(`${API_BASE_URL}/ideas/${startupId}/mvp`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MVP Spec fetch error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Retry a failed workflow
 * POST /ideas/{startup_id}/retry
 */
export async function retryStartupWorkflow(startupId) {
  const response = await fetch(`${API_BASE_URL}/ideas/${startupId}/retry`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Retry error (${response.status}): ${errorText}`);
  }

  return await response.json();
}
