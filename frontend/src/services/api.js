/**
 * API Service for AI Research Agent
 * Configured via Vite environment variable VITE_API_URL, with fallback to deployed/local endpoints.
 */

const envApiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, "") 
  : "";

export const DEFAULT_BACKEND_URL = envApiUrl || (
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? "https://research-agent-fv0t.onrender.com"
    : "http://127.0.0.1:8000"
);

export function getBackendUrl() {
  const customUrl = localStorage.getItem("research_agent_backend_url");
  if (customUrl) {
    // If the frontend is served over HTTPS but localStorage has an old insecure http:// URL (e.g. localhost),
    // clear it and use DEFAULT_BACKEND_URL to prevent browser Mixed Content errors.
    if (typeof window !== "undefined" && window.location.protocol === "https:" && customUrl.startsWith("http://")) {
      localStorage.removeItem("research_agent_backend_url");
      return DEFAULT_BACKEND_URL;
    }
    return customUrl.trim().replace(/\/+$/, "");
  }
  return DEFAULT_BACKEND_URL;
}

export function setBackendUrl(url) {
  if (!url || url.trim() === DEFAULT_BACKEND_URL) {
    localStorage.removeItem("research_agent_backend_url");
  } else {
    localStorage.setItem("research_agent_backend_url", url.trim().replace(/\/+$/, ""));
  }
}

/**
 * Checks the health of the FastAPI backend and local Ollama model.
 * Endpoint: GET /health
 */
export async function checkBackendHealth() {
  const baseUrl = getBackendUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        online: false,
        status: "degraded",
        error: `Server responded with HTTP ${response.status}`,
        details: null
      };
    }

    const data = await response.json();
    return {
      online: true,
      status: data.status || "healthy",
      backend: data.backend || "ok",
      ollama: data.ollama || {},
      error: data.error || null
    };
  } catch (err) {
    return {
      online: false,
      status: "offline",
      error: err.name === "AbortError" 
        ? "Health check timed out after 8s" 
        : (err.message || "Cannot connect to backend server"),
      details: null
    };
  }
}

/**
 * Submits a query to PALLU (Normal Chat, Web Search, or Deep Research).
 * Endpoint: POST /research
 * 
 * @param {Object} params
 * @param {string} params.query - Message or topic
 * @param {number} [params.maxWebResults=5] - 0 to 10
 * @param {number} [params.maxPaperResults=3] - 0 to 10
 * @param {string} [params.mode="chat"] - "chat" | "web" | "deep" | "auto"
 * @param {string} [params.language="hinglish"] - Target language
 * @param {Array} [params.conversationHistory] - Multi-turn conversation messages
 * @param {AbortSignal} [signal] - Optional abort signal
 */
export async function submitResearch(params, signal) {
  const baseUrl = getBackendUrl();
  const payload = {
    query: params.query.trim(),
    max_web_results: typeof params.maxWebResults === "number" ? params.maxWebResults : 5,
    max_paper_results: typeof params.maxPaperResults === "number" ? params.maxPaperResults : 3,
    mode: params.mode || "chat",
    language: params.language || "hinglish",
    depth: params.depth || "concise",
    conversation_history: params.conversationHistory || params.conversation_history || null
  };

  try {
    const response = await fetch(`${baseUrl}/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === "string" 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Failed to parse JSON error, keep generic HTTP error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Research request was cancelled.");
    }
    throw err;
  }
}
