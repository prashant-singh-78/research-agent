import React from "react";
import { 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Activity, 
  X,
  Cpu,
  Layers,
  Database,
  Search,
  BookOpen
} from "lucide-react";

import { getBackendUrl } from "../services/api";

export function Sidebar({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSettings,
  backendHealth
}) {
  const isHealthy = backendHealth?.online && backendHealth?.status === "healthy";
  const isDegraded = backendHealth?.online && backendHealth?.status === "degraded";
  const ollama = backendHealth?.ollama || {};
  const currentEndpoint = getBackendUrl();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`futuristic-sidebar ${isOpen ? "open" : ""}`}>
        {/* Sidebar Header with Glowing Emblem */}
        <div className="sidebar-brand-header">
          <div className="brand-logo-group">
            <div className="neon-emblem">
              <Sparkles size={18} className="emblem-sparkle" />
            </div>
            <div className="brand-title-group">
              <div className="brand-name-row">
                <span className="brand-name">PALLU</span>
                <span className="brand-badge">AI v2</span>
              </div>
              <span className="brand-tagline">Research Assistant</span>
            </div>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn mobile-only" 
            onClick={onClose}
            title="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* New Research Button */}
        <div className="sidebar-cta-wrapper">
          <button
            type="button"
            className="neon-cta-btn"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
          >
            <Plus size={16} />
            <span>New Research</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-section">
          <div className="nav-item active">
            <Search size={14} className="text-cyan-400" />
            <span>Research Workspace</span>
          </div>
        </div>

        {/* Recent Investigations List */}
        <div className="sidebar-history-container">
          <div className="history-header-row">
            <span className="history-label">Recent Investigations</span>
            <span className="history-badge">{sessions.length}</span>
          </div>

          <div className="history-scrollable-list">
            {sessions.length === 0 ? (
              <div className="history-empty-state">
                <MessageSquare size={20} className="text-slate-500" />
                <p>No active investigations</p>
                <span>Your grounded research sessions will appear here automatically.</span>
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const messageCount = session.messages?.length || 0;
                return (
                  <div
                    key={session.id}
                    className={`history-session-card ${isActive ? "active" : ""}`}
                    onClick={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                  >
                    <div className="session-icon-col">
                      <MessageSquare size={14} className={isActive ? "text-cyan-400" : "text-slate-400"} />
                    </div>
                    <div className="session-info-col">
                      <span className="session-title-text" title={session.title}>
                        {session.title || "Untitled Research"}
                      </span>
                      <span className="session-meta-text">
                        {messageCount} {messageCount === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="session-delete-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      title="Delete investigation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Footer with Live Hardware & Diagnostics */}
        <div className="sidebar-footer-card">
          <div 
            className="hardware-telemetry-box" 
            onClick={onOpenSettings}
            title="Click for full diagnostics"
          >
            <div className="telemetry-dot-wrap">
              <span className={`pulse-dot ${isHealthy ? "pulse-green" : (isDegraded ? "pulse-amber" : "pulse-red")}`} />
            </div>
            <div className="telemetry-text-wrap">
              <span className="telemetry-status-head">
                {isHealthy 
                  ? "RTX 3050 • qwen3:4b" 
                  : (isDegraded ? "Backend OK • Ollama Offline" : "API Offline")}
              </span>
              <span className="telemetry-endpoint-sub" title={currentEndpoint}>
                {currentEndpoint.replace(/^https?:\/\//, "")}
              </span>
            </div>
            <Activity size={14} className="text-cyan-400" />
          </div>

          <button
            type="button"
            className="sidebar-settings-link"
            onClick={onOpenSettings}
          >
            <Settings size={15} />
            <span>Diagnostics & Preferences</span>
          </button>
        </div>
      </aside>
    </>
  );
}
