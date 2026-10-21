import React from "react";
import { 
  Sparkles, 
  Brain, 
  Cpu, 
  HeartPulse, 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  BookOpen,
  MessageSquare,
  Layers 
} from "lucide-react";
import { Mascot3D } from "./Mascot3D";

export function WelcomeScreen({ onSelectSuggestion }) {
  const suggestions = [
    {
      category: "Normal Chat",
      icon: MessageSquare,
      themeClass: "theme-ai",
      title: "Conversational & Explanations",
      query: "What is a human?",
      mode: "chat",
      description: "Ask concepts, coding, definitions, and casual conversation directly without web searches."
    },
    {
      category: "Conceptual Learning",
      icon: Brain,
      themeClass: "theme-ml",
      title: "Machine Learning with Examples",
      query: "Explain machine learning with an example",
      mode: "chat",
      description: "Intuitive analogies and real-world examples explained in natural conversational Hinglish."
    },
    {
      category: "Live Web Search",
      icon: Globe,
      themeClass: "theme-health",
      title: "Current Events & Developments",
      query: "What happened in AI today?",
      mode: "web",
      description: "Searches DuckDuckGo live sources for breaking news, updates, and timely factual answers."
    },
    {
      category: "Deep Academic Research",
      icon: GraduationCap,
      themeClass: "theme-papers",
      title: "Medical AI & arXiv Papers",
      query: "Research recent medical AI papers and compare them",
      mode: "deep",
      description: "Gathers verified web data and arXiv preprints into a rigorous, grounded report with real citations."
    }
  ];

  return (
    <div className="futuristic-welcome">
      {/* Center 3D Blue Smiling Mascot */}
      <Mascot3D isThinking={false} size={180} />

      {/* Pill Badge */}
      <div className="welcome-tag-pill">
        <span className="live-pulse-dot"></span>
        <span className="tag-text">PALLU v2.0 • Conversational AI & Grounded Research</span>
      </div>

      {/* Main Title & Tagline */}
      <h1 className="welcome-headline">
        Meet <span className="neon-gradient-text">PALLU</span>
      </h1>
      <h2 className="welcome-tagline-text">
        Your Personal AI Assistant & Grounded Researcher
      </h2>
      <p className="welcome-mission-text">
        Chat casually like ChatGPT or launch fast, grounded investigations with verified sources.
        Powered by your local RTX 3050 GPU and Ollama (qwen3:4b) — 100% private with zero hallucinations.
      </p>

      {/* Futuristic Feature Strips */}
      <div className="futuristic-feature-strip">
        <div className="strip-item">
          <MessageSquare size={15} className="text-cyan-400" />
          <span>Normal Chat (Default)</span>
        </div>
        <div className="strip-separator"></div>
        <div className="strip-item">
          <Globe size={15} className="text-blue-400" />
          <span>Live Web Search</span>
        </div>
        <div className="strip-separator"></div>
        <div className="strip-item">
          <BookOpen size={15} className="text-violet-400" />
          <span>arXiv Preprints</span>
        </div>
        <div className="strip-separator"></div>
        <div className="strip-item">
          <ShieldCheck size={15} className="text-emerald-400" />
          <span>Zero Hallucinations</span>
        </div>
      </div>

      {/* Themed Suggestions Grid */}
      <div className="futuristic-suggestions-section">
        <div className="section-label-row">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Select a Mode or Explore Suggested Prompts</span>
        </div>

        <div className="futuristic-suggestions-grid">
          {suggestions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                className={`futuristic-card ${item.themeClass}`}
                onClick={() => onSelectSuggestion(item.query, item.mode)}
              >
                <div className="card-top-row">
                  <div className="card-icon-halo">
                    <Icon size={18} />
                  </div>
                  <span className="card-category-badge">{item.category}</span>
                </div>

                <h4 className="card-heading">{item.title}</h4>
                <p className="card-summary">{item.description}</p>

                <div className="card-action-footer">
                  <span className="card-query-snippet">"{item.query}"</span>
                  <div className="card-launch-btn">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
