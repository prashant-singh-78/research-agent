import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ChatMessage } from "./components/ChatMessage";
import { ChatComposer } from "./components/ChatComposer";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { SettingsModal } from "./components/SettingsModal";
import { ErrorBanner } from "./components/ErrorBanner";
import { RightPanel } from "./components/RightPanel";
import { useChatHistory } from "./hooks/useChatHistory";
import { submitResearch, checkBackendHealth } from "./services/api";

export default function App() {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    addMessageToActiveSession,
    deleteSession,
    clearCurrentChat
  } = useChatHistory();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(() => {
    // Default open on wide screens, collapsed on smaller screens
    return typeof window !== "undefined" && window.innerWidth >= 1200;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Research configuration state
  const [currentMode, setCurrentMode] = useState("chat"); // "chat" | "web" | "deep"
  const [currentDepth, setCurrentDepth] = useState("concise"); // "concise" | "deep"
  const [maxWebResults, setMaxWebResults] = useState(5);
  const [maxPaperResults, setMaxPaperResults] = useState(3);

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);
  const [lastFailedParams, setLastFailedParams] = useState(null);
  const [lastMetadata, setLastMetadata] = useState(null);

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Poll / Check backend health on mount and periodically
  const fetchHealth = async () => {
    const health = await checkBackendHealth();
    setBackendHealth(health);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 25000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom on message or loading state change
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isLoading]);

  const activeMessages = activeSession?.messages || [];
  const sessionTitle = activeSession?.title || "New Chat";

  // Handle submitting research query
  const handleResearchSubmit = async (params) => {
    if (!params.query.trim() || isLoading) return;

    setErrorMessage(null);
    setLastFailedParams(null);
    setIsLoading(true);
    setLoadingQuery(params.query);

    // Prepare multi-turn history from current session (last 6 messages)
    const conversationHistory = activeMessages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content
    }));

    // Add user message to session
    const userMsg = {
      id: "usr_" + Date.now(),
      role: "user",
      content: params.query,
      mode: params.mode || currentMode,
      depth: params.depth || currentDepth,
      timestamp: new Date().toISOString()
    };
    addMessageToActiveSession(userMsg);

    // Setup abort controller for request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await submitResearch(
        {
          query: params.query,
          maxWebResults: params.maxWebResults ?? maxWebResults,
          maxPaperResults: params.maxPaperResults ?? maxPaperResults,
          mode: params.mode || currentMode,
          depth: params.depth || currentDepth,
          language: params.language || "hinglish",
          conversationHistory
        },
        controller.signal
      );

      // Validate response structure
      const reportText = result.report_hinglish?.trim() 
        || "PALLU could not generate a response for this query. Please try rephrasing your message.";
      
      const meta = result.metadata || {
        model: "qwen3:4b",
        execution_time_seconds: 0,
        language: "hinglish",
        depth: params.depth || currentDepth,
        routed_mode: params.mode || currentMode
      };
      setLastMetadata(meta);

      const assistantMsg = {
        id: "ast_" + Date.now(),
        role: "assistant",
        query: result.query || params.query,
        content: reportText,
        sources: result.sources || { web_sources: [], academic_papers: [] },
        metadata: meta,
        status: result.status || "success",
        timestamp: new Date().toISOString()
      };

      addMessageToActiveSession(assistantMsg);
    } catch (err) {
      if (err.message !== "Research request was cancelled.") {
        const readableError = err.message || "Failed to communicate with PALLU.";
        setErrorMessage(readableError);
        setLastFailedParams(params);
      }
    } finally {
      setIsLoading(false);
      setLoadingQuery("");
      abortControllerRef.current = null;
    }
  };

  const handleCancelResearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setLoadingQuery("");
    }
  };

  const handleRetry = () => {
    if (lastFailedParams) {
      handleResearchSubmit(lastFailedParams);
    }
  };

  const handleSelectSuggestion = (queryText, suggestedMode = "chat") => {
    if (suggestedMode) setCurrentMode(suggestedMode);
    handleResearchSubmit({
      query: queryText,
      mode: suggestedMode || currentMode,
      depth: currentDepth,
      maxWebResults: suggestedMode === "chat" ? 0 : maxWebResults,
      maxPaperResults: suggestedMode === "chat" || suggestedMode === "web" ? 0 : maxPaperResults,
      language: "hinglish"
    });
  };

  return (
    <div className="futuristic-app-layout">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={() => {
          createNewSession();
          setErrorMessage(null);
        }}
        onDeleteSession={deleteSession}
        onOpenSettings={() => setSettingsOpen(true)}
        backendHealth={backendHealth}
      />

      {/* Center Main Workspace */}
      <div className="center-workspace-area">
        {/* Top Header */}
        <Header
          sessionTitle={sessionTitle}
          hasMessages={activeMessages.length > 0}
          onClearChat={clearCurrentChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
          rightPanelOpen={rightPanelOpen}
          onOpenSettings={() => setSettingsOpen(true)}
          mode={currentMode}
          depth={currentDepth}
          backendHealth={backendHealth}
        />

        {/* Chat / Content Scroll Container */}
        <main className="workspace-scroll-viewport">
          <div className="workspace-max-container">
            {/* Error Notification if any */}
            {errorMessage && (
              <ErrorBanner
                error={errorMessage}
                onRetry={lastFailedParams ? handleRetry : null}
                onDismiss={() => setErrorMessage(null)}
              />
            )}

            {/* If no messages in active session, show Futuristic Welcome Screen */}
            {activeMessages.length === 0 && !isLoading ? (
              <WelcomeScreen onSelectSuggestion={handleSelectSuggestion} />
            ) : (
              <div className="conversation-flow">
                {activeMessages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {/* Loading state indicator */}
                {isLoading && (
                  <LoadingIndicator 
                    query={loadingQuery} 
                    mode={currentMode} 
                    depth={currentDepth} 
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Bottom Research Composer */}
        <footer className="workspace-composer-footer">
          <div className="composer-max-container">
            <ChatComposer
              onSubmit={handleResearchSubmit}
              isLoading={isLoading}
              onCancel={handleCancelResearch}
              mode={currentMode}
              onModeChange={setCurrentMode}
              depth={currentDepth}
              onDepthChange={setCurrentDepth}
              maxWebResults={maxWebResults}
              maxPaperResults={maxPaperResults}
            />
          </div>
        </footer>
      </div>

      {/* Right Intelligence & Telemetry Panel */}
      <RightPanel
        isOpen={rightPanelOpen}
        onClose={() => setRightPanelOpen(false)}
        backendHealth={backendHealth}
        lastMetadata={lastMetadata}
        currentDepth={currentDepth}
        onDepthChange={setCurrentDepth}
        maxWebResults={maxWebResults}
        onMaxWebChange={setMaxWebResults}
        maxPaperResults={maxPaperResults}
        onMaxPaperChange={setMaxPaperResults}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* Settings & System Diagnostics Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onRefreshHealth={fetchHealth}
        backendHealth={backendHealth}
      />
    </div>
  );
}
