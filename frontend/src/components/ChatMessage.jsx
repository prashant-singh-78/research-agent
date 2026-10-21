import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  Cpu, 
  Languages, 
  Zap, 
  Search,
  Layers
} from "lucide-react";
import { SourceCards } from "./SourceCards";

export function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <div className="futuristic-msg-row user-row">
        <div className="msg-avatar-box user-avatar-box">
          <User size={16} />
        </div>
        <div className="msg-content-wrapper user-wrapper">
          <div className="user-msg-header">
            <span className="user-name">You</span>
            {message.mode && (
              <span className={`msg-mode-pill mode-${message.mode}`}>
                {message.mode === "chat" && "Normal Chat"}
                {message.mode === "web" && "Web Search"}
                {message.mode === "deep" && "Deep Research"}
                {message.mode === "papers" && "arXiv Preprints"}
                {message.mode === "auto" && "Auto"}
              </span>
            )}
            {message.depth && (
              <span className="msg-depth-pill">
                <Zap size={10} className="inline-icon text-cyan-400" />
                {message.depth === "concise" ? "Concise" : "Deep"}
              </span>
            )}
          </div>
          <div className="user-neon-bubble">
            <p>{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant / PALLU Message
  const metadata = message.metadata || {};
  const sources = message.sources || null;
  const executionTime = metadata.execution_time_seconds 
    ? `${metadata.execution_time_seconds}s` 
    : null;
  const searchTime = metadata.search_time_seconds ? `${metadata.search_time_seconds}s` : null;
  const genTime = metadata.generation_time_seconds ? `${metadata.generation_time_seconds}s` : null;
  const modelName = metadata.model || "qwen3:4b";
  const languageStyle = metadata.language || "Hinglish";
  const depthMode = metadata.depth || "concise";
  const routedMode = metadata.routed_mode || (sources && (sources.total_web > 0 || sources.total_academic > 0) ? "deep" : "chat");
  const intentName = metadata.intent || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([message.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeTitle = (message.query || "pallu-report")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40);
      link.download = `${safeTitle}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download report", err);
    }
  };

  const totalSourcesCount = (sources?.web_sources?.length || 0) + (sources?.academic_papers?.length || 0);

  return (
    <div className="futuristic-msg-row assistant-row">
      <div className="msg-avatar-box assistant-avatar-box">
        <Sparkles size={18} className="neon-sparkle-spin" />
      </div>

      <div className="msg-content-wrapper assistant-wrapper">
        {/* Assistant Header & Latency Breakdown */}
        <div className="assistant-telemetry-header">
          <div className="agent-title-cluster">
            <span className="agent-name">PALLU</span>
            <span className="agent-sub-badge">
              {routedMode === "chat" ? "Conversational AI" : routedMode === "web" ? "Web Searcher" : "Research Assistant"}
            </span>
          </div>

          <div className="latency-pills-cluster">
            {/* Routed Mode Badge */}
            <span className={`neon-meta-chip mode-chip mode-${routedMode}`}>
              {routedMode === "chat" && "💬 Normal Chat"}
              {routedMode === "web" && "🌐 Web Search"}
              {routedMode === "deep" && "📚 Deep Research"}
            </span>

            <span className="neon-meta-chip" title="Synthesized locally on RTX 3050 via Ollama">
              <Cpu size={12} className="text-cyan-400" />
              {modelName}
            </span>

            {executionTime && (
              <span 
                className="neon-meta-chip latency-chip" 
                title={`Total: ${executionTime} | Search: ${searchTime || "0s"} | Generation: ${genTime || "N/A"}`}
              >
                <Clock size={12} className="text-blue-400" />
                <span>{executionTime}</span>
                {searchTime && searchTime !== "0.0s" && searchTime !== "0s" && genTime && (
                  <span className="timing-breakdown">
                    (Search {searchTime} • LLM {genTime})
                  </span>
                )}
              </span>
            )}

            <span className="neon-meta-chip depth-chip">
              <Zap size={11} className="text-yellow-400" />
              {depthMode === "concise" ? "Concise" : "Deep Dive"}
            </span>

            <span className="neon-meta-chip hinglish-chip">
              <Languages size={11} className="text-violet-400" />
              {languageStyle}
            </span>
          </div>

          <div className="msg-action-buttons">
            <button
              type="button"
              className="msg-action-btn"
              onClick={handleCopy}
              title="Copy markdown report"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              type="button"
              className="msg-action-btn"
              onClick={handleDownload}
              title="Export report as .md"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* AI Research Report Body (Formatted Markdown) */}
        <div className="futuristic-report-container">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="futuristic-link"
                />
              ),
              h1: ({ node, ...props }) => <h2 className="report-h1" {...props} />,
              h2: ({ node, ...props }) => <h3 className="report-h2" {...props} />,
              h3: ({ node, ...props }) => <h4 className="report-h3" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="report-blockquote" {...props} />
              ),
              code: ({ node, inline, ...props }) => (
                inline ? <code className="inline-code" {...props} /> : <pre className="code-block"><code {...props} /></pre>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Verified Grounded Sources Component */}
        {sources && totalSourcesCount > 0 && (
          <div className="report-sources-section">
            <SourceCards sources={sources} />
          </div>
        )}
      </div>
    </div>
  );
}
