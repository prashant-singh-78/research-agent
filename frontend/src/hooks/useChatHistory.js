import { useState, useEffect } from "react";

const STORAGE_KEY = "ai_research_agent_chats_v1";
const ACTIVE_CHAT_KEY = "ai_research_agent_active_id_v1";

export function useChatHistory() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history from localStorage", e);
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_CHAT_KEY) || null;
    } catch {
      return null;
    }
  });

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save chat sessions to localStorage", e);
    }
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_CHAT_KEY, activeSessionId);
      } else {
        localStorage.removeItem(ACTIVE_CHAT_KEY);
      }
    } catch (e) {
      console.error("Failed to save active chat ID to localStorage", e);
    }
  }, [activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const createNewSession = () => {
    const newId = "chat_" + Date.now();
    const newSession = {
      id: newId,
      title: "New Research",
      createdAt: new Date().toISOString(),
      messages: []
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newSession;
  };

  const addMessageToActiveSession = (message) => {
    let currentId = activeSessionId;
    let updatedSessions = [...sessions];

    if (!currentId || !sessions.some((s) => s.id === currentId)) {
      currentId = "chat_" + Date.now();
      const firstTitle = message.role === "user" 
        ? (message.content.length > 36 ? message.content.slice(0, 36) + "..." : message.content)
        : "Research Investigation";
      
      const newSession = {
        id: currentId,
        title: firstTitle,
        createdAt: new Date().toISOString(),
        messages: [message]
      };
      setSessions([newSession, ...updatedSessions]);
      setActiveSessionId(currentId);
      return;
    }

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentId) {
          // If first user message, update the title
          let title = session.title;
          if (session.title === "New Research" && message.role === "user") {
            title = message.content.length > 36 ? message.content.slice(0, 36) + "..." : message.content;
          }
          return {
            ...session,
            title,
            updatedAt: new Date().toISOString(),
            messages: [...session.messages, message]
          };
        }
        return session;
      })
    );
  };

  const deleteSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const clearCurrentChat = () => {
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, messages: [], title: "New Research" } : s
        )
      );
    }
  };

  const clearAllSessions = () => {
    setSessions([]);
    setActiveSessionId(null);
  };

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    addMessageToActiveSession,
    deleteSession,
    clearCurrentChat,
    clearAllSessions
  };
}
