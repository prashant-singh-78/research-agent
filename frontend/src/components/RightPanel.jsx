import React from "react";
import { 
  X, 
  Cpu, 
  Globe, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  Activity, 
  Sparkles, 
  ArrowRight,
  Server,
  Layers,
  Clock
} from "lucide-react";

export function RightPanel({
  isOpen,
  onClose,
  backendHealth,
  lastMetadata,
  currentDepth,
  onDepthChange,
  maxWebResults,
  onMaxWebChange,
  maxPaperResults,
  onMaxPaperChange,
  onSelectSuggestion
}) {
  const isHealthy = backendHealth?.online && backendHealth?.status === "healthy";
  const ollama = backendHealth?.ollama || {};

  const quickPrompts = [
    {
      title: "Conversational Question",
      query: "What is a human?",
      mode: "chat"
    },
    {
      title: "ML Analogies & Concepts",
      query: "Explain machine learning with an example",
      mode: "chat"
    },
    {
      title: "Current AI Developments",
      query: "What happened in AI today?",
      mode: "web"
    },
    {
      title: "Medical AI & arXiv Papers",
      query: "Research recent medical AI papers and compare them",
      mode: "deep"
    }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="right-panel-backdrop" 
          onClick={onClose} 
          aria-label="Close intelligence panel" 
        />
      )}
      <aside className={`right-panel-container ${isOpen ? "open" : "collapsed"}`}>
      <div className="right-panel-header">
        <div className="right-panel-title">
          <Sparkles size={16} className="text-cyan-400" />
          <span>Research Intelligence</span>
        </div>
        <button 
          type="button" 
          className="right-panel-close-btn"
          onClick={onClose}
          title="Collapse panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className="right-panel-scroll">
        {/* Section 1: System Telemetry Card */}
        <div className="intel-card telemetry-card">
          <div className="intel-card-header">
            <Activity size={15} className="text-cyan-400" />
            <h4>Real-time Telemetry</h4>
            <span className={`status-pill ${isHealthy ? "online" : "offline"}`}>
              {isHealthy ? "Active" : "Offline"}
            </span>
          </div>

          <div className="telemetry-grid">
            <div className="telemetry-item">
              <span className="telemetry-label">LLM Engine</span>
              <span className="telemetry-value">
                <Cpu size={13} className="text-violet-400" />
                {ollama.target_model || "qwen3:4b"}
              </span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Hardware</span>
              <span className="telemetry-value text-emerald-400">
                RTX 3050 GPU
              </span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Search Speed</span>
              <span className="telemetry-value">
                <Clock size={13} className="text-blue-400" />
                {lastMetadata?.search_time_seconds 
                  ? `${lastMetadata.search_time_seconds}s` 
                  : "3.5s avg"}
              </span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-label">Synthesis</span>
              <span className="telemetry-value">
                <Zap size={13} className="text-cyan-400" />
                {lastMetadata?.generation_time_seconds 
                  ? `${lastMetadata.generation_time_seconds}s` 
                  : "20s avg"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Research Depth Controls */}
        <div className="intel-card">
          <div className="intel-card-header">
            <Sliders size={15} className="text-violet-400" />
            <h4>Synthesis Mode & Depth</h4>
          </div>

          <div className="depth-selector">
            <button
              type="button"
              className={`depth-toggle-btn ${currentDepth === "concise" ? "active" : ""}`}
              onClick={() => onDepthChange("concise")}
            >
              <Zap size={14} className="depth-btn-icon text-cyan-400" />
              <div className="depth-btn-text">
                <span className="depth-btn-title">Concise Report</span>
                <span className="depth-btn-sub">⚡ Fast (~15-25s)</span>
              </div>
            </button>

            <button
              type="button"
              className={`depth-toggle-btn ${currentDepth === "deep" ? "active" : ""}`}
              onClick={() => onDepthChange("deep")}
            >
              <Layers size={14} className="depth-btn-icon text-violet-400" />
              <div className="depth-btn-text">
                <span className="depth-btn-title">Deep Dive</span>
                <span className="depth-btn-sub">🔍 Comprehensive</span>
              </div>
            </button>
          </div>

          <div className="depth-sliders">
            <div className="slider-group">
              <div className="slider-header">
                <span>Max Web Results:</span>
                <span className="slider-val">{maxWebResults}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={maxWebResults}
                onChange={(e) => onMaxWebChange(parseInt(e.target.value, 10))}
                className="neon-range-slider"
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Max arXiv Preprints:</span>
                <span className="slider-val">{maxPaperResults}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={maxPaperResults}
                onChange={(e) => onMaxPaperChange(parseInt(e.target.value, 10))}
                className="neon-range-slider"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Grounded Capabilities */}
        <div className="intel-card">
          <div className="intel-card-header">
            <ShieldCheck size={15} className="text-cyan-400" />
            <h4>Guaranteed Capabilities</h4>
          </div>

          <ul className="capabilities-list">
            <li className="cap-item">
              <Globe size={14} className="text-blue-400" />
              <div className="cap-desc">
                <strong>Grounded Live Web</strong>
                <span>Real-time indexing via DuckDuckGo API</span>
              </div>
            </li>
            <li className="cap-item">
              <BookOpen size={14} className="text-purple-400" />
              <div className="cap-desc">
                <strong>arXiv Academic Preprints</strong>
                <span>Scientific preprints with preprint tags</span>
              </div>
            </li>
            <li className="cap-item">
              <ShieldCheck size={14} className="text-emerald-400" />
              <div className="cap-desc">
                <strong>Zero Hallucination</strong>
                <span>Strict verification against retrieved links</span>
              </div>
            </li>
            <li className="cap-item">
              <Cpu size={14} className="text-cyan-400" />
              <div className="cap-desc">
                <strong>100% Local Inference</strong>
                <span>Private execution with zero cloud telemetry</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Section 4: Quick Investigation Prompts */}
        <div className="intel-card">
          <div className="intel-card-header">
            <Sparkles size={15} className="text-violet-400" />
            <h4>Suggested Investigations</h4>
          </div>

          <div className="quick-prompts-list">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-prompt-btn"
                onClick={() => {
                  onSelectSuggestion(p.query, p.mode);
                  if (window.innerWidth < 1200) onClose();
                }}
              >
                <div className="quick-prompt-info">
                  <span className="prompt-title">{p.title}</span>
                  <span className="prompt-query">{p.query}</span>
                </div>
                <ArrowRight size={14} className="prompt-arrow" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
