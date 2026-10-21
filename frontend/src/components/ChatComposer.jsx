import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Sliders, 
  Square, 
  CornerDownLeft,
  Zap,
  Layers,
  MessageSquare
} from "lucide-react";

export function ChatComposer({ 
  onSubmit, 
  isLoading, 
  onCancel, 
  initialQuery = "",
  mode = "chat",
  onModeChange,
  depth = "concise",
  onDepthChange,
  maxWebResults = 5,
  maxPaperResults = 3
}) {
  const [query, setQuery] = useState(initialQuery);
  const textareaRef = useRef(null);

  // Sync if initialQuery changes from outside (e.g. clicked suggestion)
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialQuery]);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [query]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery || isLoading) return;

    onSubmit({
      query: cleanQuery,
      mode,
      depth,
      maxWebResults: mode === "chat" ? 0 : (mode === "web" ? maxWebResults : maxWebResults),
      maxPaperResults: mode === "chat" || mode === "web" ? 0 : maxPaperResults,
      language: "hinglish"
    });
    setQuery("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && query.trim()) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="composer-wrapper">
      <div className="composer-container-card">
        {/* Top Controls Bar: Modes & Depth Switcher */}
        <div className="composer-top-bar">
          {/* Mode Switcher */}
          <div className="composer-mode-pills">
            <button
              type="button"
              className={`mode-tab-btn ${mode === "chat" ? "active" : ""}`}
              onClick={() => onModeChange("chat")}
              title="Normal Chat (Default): Direct conversational answers, explanations & concepts without search tools"
            >
              <MessageSquare size={13} className="tab-icon text-cyan-400" />
              <span>Normal Chat</span>
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${mode === "web" ? "active" : ""}`}
              onClick={() => onModeChange("web")}
              title="Web Search: Live internet search via DuckDuckGo for breaking facts & current news"
            >
              <Globe size={13} className="tab-icon text-blue-400" />
              <span>Web Search</span>
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${mode === "deep" ? "active" : ""}`}
              onClick={() => onModeChange("deep")}
              title="Deep Research: Thorough investigation using web sources & academic arXiv preprints"
            >
              <BookOpen size={13} className="tab-icon text-purple-400" />
              <span>Deep Research</span>
            </button>
          </div>

          {/* Depth Toggle (Concise vs Deep) */}
          <div className="composer-depth-pills">
            <button
              type="button"
              className={`depth-chip ${depth === "concise" ? "active" : ""}`}
              onClick={() => onDepthChange("concise")}
              title="Concise response (~15-25s response, high impact)"
            >
              <Zap size={12} className="text-cyan-400" />
              <span>Concise</span>
            </button>
            <button
              type="button"
              className={`depth-chip ${depth === "deep" ? "active" : ""}`}
              onClick={() => onDepthChange("deep")}
              title="Deep dive response (comprehensive analysis)"
            >
              <Layers size={12} className="text-violet-400" />
              <span>Deep Dive</span>
            </button>
          </div>
        </div>

        {/* Text Input Row */}
        <div className="composer-input-area">
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? "PALLU is answering... Please wait."
                : mode === "chat" 
                ? "Chat with PALLU, ask questions, or request research (e.g. 'Hi PALLU', 'What is a human?')..."
                : mode === "web"
                ? "Ask PALLU to search live web findings on any topic (e.g. 'What happened in AI today?')..."
                : "Ask PALLU for deep grounded research with arXiv preprints..."
            }
            disabled={isLoading}
            className="composer-neon-textarea"
          />

          <div className="composer-submit-col">
            {isLoading ? (
              <button
                type="button"
                className="composer-stop-action-btn"
                onClick={onCancel}
                title="Cancel request"
              >
                <Square size={15} fill="currentColor" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                className="composer-send-action-btn"
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading}
                title="Send to PALLU (Enter)"
              >
                <span>{mode === "chat" ? "Chat" : mode === "web" ? "Search" : "Research"}</span>
                <Send size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Footer Hints */}
        <div className="composer-bottom-hints">
          <span className="hint-keys">
            <CornerDownLeft size={11} className="inline-icon" />
            Press <kbd>Enter</kbd> to submit, <kbd>Shift + Enter</kbd> for newline
          </span>
          <span className="hint-grounded-badge">
            Grounded Citations • DuckDuckGo + arXiv Preprints • Local Qwen3
          </span>
        </div>
      </div>
    </div>
  );
}
