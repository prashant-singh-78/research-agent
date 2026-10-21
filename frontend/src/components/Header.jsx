import React from "react";
import { 
  Menu, 
  Trash2, 
  Sparkles, 
  Settings, 
  RotateCcw, 
  ShieldCheck,
  PanelRight,
  Activity,
  Zap
} from "lucide-react";

export function Header({
  sessionTitle,
  hasMessages,
  onClearChat,
  onToggleSidebar,
  onToggleRightPanel,
  rightPanelOpen,
  onOpenSettings,
  mode,
  depth = "concise",
  backendHealth
}) {
  const isHealthy = backendHealth?.online && backendHealth?.status === "healthy";
  const isDegraded = backendHealth?.online && backendHealth?.status === "degraded";

  return (
    <header className="futuristic-header">
      <div className="header-left">
        <button
          type="button"
          className="header-nav-toggle-btn"
          onClick={onToggleSidebar}
          title="Toggle Navigation Sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="header-title-container">
          <h2 className="header-current-title">
            {sessionTitle || "New Investigation"}
          </h2>
          <div className="header-status-pills">
            <span className={`mode-badge mode-${mode}`}>
              {mode === "chat" && "Mode: Normal Chat"}
              {mode === "web" && "Mode: Web Search"}
              {mode === "deep" && "Mode: Deep Research"}
              {mode === "papers" && "Mode: arXiv Preprints"}
              {mode === "auto" && "Mode: Auto"}
            </span>

            <span className={`depth-badge depth-${depth} desktop-only-pill`}>
              <Zap size={11} className="inline-icon text-cyan-400" />
              {depth === "concise" ? "Concise (Fast)" : "Deep Dive"}
            </span>

            <span className="grounding-badge desktop-only-pill">
              <ShieldCheck size={12} className="inline-icon text-emerald-400" />
              Zero Hallucinations
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Backend Connectivity Status */}
        <div 
          className="header-telemetry-pill"
          onClick={onOpenSettings}
          title={
            isHealthy 
              ? "Ollama Online (qwen3:4b)" 
              : (isDegraded ? "Backend Connected • Ollama Disconnected" : "API Disconnected")
          }
        >
          <span className={`telemetry-dot ${isHealthy ? "live" : (isDegraded ? "degraded" : "dead")}`} />
          <span className="telemetry-label telemetry-label-desktop">
            {isHealthy 
              ? "Ollama Online (qwen3:4b)" 
              : (isDegraded ? "Backend OK • Ollama Disconnected" : "API Disconnected")}
          </span>
        </div>

        {/* Clear Chat Action */}
        {hasMessages && (
          <button
            type="button"
            className="header-action-btn clear-btn"
            onClick={onClearChat}
            title="Clear active conversation"
          >
            <RotateCcw size={14} />
            <span className="btn-text-desktop">Clear</span>
          </button>
        )}

        {/* Toggle Right Intelligence Panel */}
        <button
          type="button"
          className={`header-action-btn panel-btn ${rightPanelOpen ? "active" : ""}`}
          onClick={onToggleRightPanel}
          title="Toggle Research Intelligence Panel"
        >
          <PanelRight size={16} />
          <span className="btn-text-desktop">Intelligence</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          className="header-action-btn settings-btn"
          onClick={onOpenSettings}
          title="Settings & System Diagnostics"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
