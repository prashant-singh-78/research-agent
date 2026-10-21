import React, { useState } from "react";
import { 
  X, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Server, 
  Terminal,
  Save,
  RotateCcw,
  Activity,
  Zap
} from "lucide-react";
import { getBackendUrl, setBackendUrl, DEFAULT_BACKEND_URL } from "../services/api";

export function SettingsModal({ isOpen, onClose, onRefreshHealth, backendHealth }) {
  const [urlInput, setUrlInput] = useState(getBackendUrl());
  const [isSaved, setIsSaved] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = (e) => {
    e.preventDefault();
    setBackendUrl(urlInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onRefreshHealth();
  };

  const handleResetUrl = () => {
    setUrlInput(DEFAULT_BACKEND_URL);
    setBackendUrl(DEFAULT_BACKEND_URL);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onRefreshHealth();
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    await onRefreshHealth();
    setIsChecking(false);
  };

  const isHealthy = backendHealth?.online && backendHealth?.status === "healthy";
  const ollama = backendHealth?.ollama || {};

  return (
    <div className="futuristic-modal-backdrop" onClick={onClose}>
      <div className="futuristic-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <div className="modal-brand-title">
            <Settings size={18} className="text-cyan-400" />
            <h3>PALLU Settings & System Diagnostics</h3>
          </div>
          <button type="button" className="modal-close-trigger" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-scrollable-body">
          {/* Backend API Configuration */}
          <div className="modal-config-section">
            <label className="config-section-label">Backend API Endpoint</label>
            <form onSubmit={handleSaveUrl} className="neon-url-form">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={DEFAULT_BACKEND_URL}
                className="neon-url-input"
              />
              <button type="submit" className="neon-url-save-btn">
                <Save size={14} />
                <span>Save</span>
              </button>
              <button type="button" className="neon-url-reset-btn" onClick={handleResetUrl} title="Reset to default">
                <RotateCcw size={14} />
              </button>
            </form>
            {isSaved && <span className="neon-save-notice">✓ Saved endpoint settings!</span>}
          </div>

          {/* System & Hardware Diagnostics */}
          <div className="modal-config-section">
            <div className="config-label-row">
              <label className="config-section-label">Live Telemetry & Acceleration</label>
              <button
                type="button"
                className="neon-health-ping-btn"
                onClick={handleManualCheck}
                disabled={isChecking}
              >
                <RefreshCw size={13} className={isChecking ? "spin" : ""} />
                <span>Ping Diagnostics</span>
              </button>
            </div>

            <div className="neon-telemetry-card">
              <div className="telemetry-check-row">
                <div className="check-left">
                  <Server size={15} className="text-blue-400" />
                  <span>FastAPI Backend Server:</span>
                </div>
                <div className="check-right">
                  {backendHealth?.online ? (
                    <span className="badge-online">
                      <CheckCircle size={12} /> Online (HTTP 200)
                    </span>
                  ) : (
                    <span className="badge-offline">
                      <AlertTriangle size={12} /> Disconnected
                    </span>
                  )}
                </div>
              </div>

              <div className="telemetry-check-row">
                <div className="check-left">
                  <Cpu size={15} className="text-violet-400" />
                  <span>Ollama Local Server:</span>
                </div>
                <div className="check-right">
                  {ollama.reachable ? (
                    <span className="badge-online">
                      <CheckCircle size={12} /> Reachable (Port 11434)
                    </span>
                  ) : (
                    <span className="badge-offline">
                      <AlertTriangle size={12} /> Unreachable
                    </span>
                  )}
                </div>
              </div>

              <div className="telemetry-check-row">
                <div className="check-left">
                  <Activity size={15} className="text-cyan-400" />
                  <span>Model (`qwen3:4b`):</span>
                </div>
                <div className="check-right">
                  {ollama.target_model_installed ? (
                    <span className="badge-online">
                      <CheckCircle size={12} /> Ready on RTX 3050 GPU
                    </span>
                  ) : (
                    <span className="badge-warning">
                      <AlertTriangle size={12} /> Model Missing in Ollama
                    </span>
                  )}
                </div>
              </div>

              {backendHealth?.error && (
                <div className="telemetry-error-callout">
                  <strong>Notice:</strong> {backendHealth.error}
                </div>
              )}
            </div>
          </div>

          {/* Quick Windows CLI Guide */}
          <div className="modal-config-section">
            <label className="config-section-label">
              <Terminal size={14} className="inline-icon text-cyan-400" />
              Windows Terminal Run Instructions
            </label>
            <div className="neon-code-block">
              <p className="code-step-label">1. Run Ollama server:</p>
              <code>ollama run qwen3:4b</code>
              <p className="code-step-label">2. Run FastAPI Backend (Port 8000):</p>
              <code>backend\.venv\Scripts\uvicorn.exe main:app --reload --port 8000</code>
              <p className="code-step-label">3. Run Frontend (Vite):</p>
              <code>npm run dev</code>
            </div>
          </div>
        </div>

        <div className="modal-bottom-actions">
          <button type="button" className="modal-primary-action" onClick={onClose}>
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
