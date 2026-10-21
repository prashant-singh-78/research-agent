import React from "react";
import { AlertTriangle, RefreshCw, X, Zap } from "lucide-react";

export function ErrorBanner({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <div className="futuristic-error-panel">
      <div className="error-icon-halo">
        <AlertTriangle size={18} className="text-red-400" />
      </div>
      <div className="error-content-body">
        <h4 className="error-panel-title">Investigation Execution Notice</h4>
        <p className="error-panel-text">{error}</p>
        <span className="error-panel-hint">
          Tip: Ensure Ollama is running (`ollama run qwen3:4b`). You can also switch to "Concise Report" mode for faster local execution.
        </span>
      </div>
      <div className="error-panel-btns">
        {onRetry && (
          <button type="button" className="error-action-btn retry-btn" onClick={onRetry}>
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button type="button" className="error-action-btn dismiss-btn" onClick={onDismiss} title="Dismiss">
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
