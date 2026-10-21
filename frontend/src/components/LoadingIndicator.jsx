import React, { useState, useEffect } from "react";
import { Sparkles, Globe, BookOpen, Cpu, ShieldCheck, Zap } from "lucide-react";

export function LoadingIndicator({ query, mode = "auto", depth = "concise" }) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      icon: Globe,
      label: "Parallel Search: Querying live web via DuckDuckGo...",
      detail: "Concurrently indexing verified technical developments and real-time sources"
    },
    {
      icon: BookOpen,
      label: "Parallel Search: Scanning arXiv preprints...",
      detail: "Extracting scientific manuscripts, author lists, and paper abstracts"
    },
    {
      icon: ShieldCheck,
      label: "Grounded Anti-Hallucination & Citation Check...",
      detail: "Filtering URLs and ensuring 100% factual grounding against retrieved sources"
    },
    {
      icon: Cpu,
      label: `PALLU Local GPU Synthesis (${depth === "concise" ? "Concise" : "Deep"} Mode)...`,
      detail: "Synthesizing structured Hinglish report with Qwen 3 on RTX 3050 without reasoning delay"
    }
  ];

  // Rotate through steps every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(timer);
  }, [steps.length]);

  const currentStep = steps[stepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="futuristic-loading-panel">
      {/* Animated Glowing Cybernetic Orb */}
      <div className="loading-cyber-orb">
        <div className="cyber-pulse pulse-cyan"></div>
        <div className="cyber-pulse pulse-blue"></div>
        <div className="cyber-pulse pulse-violet"></div>
        <div className="cyber-core-orb">
          <Sparkles size={20} className="animate-spin-slow text-cyan-300" />
        </div>
      </div>

      <div className="loading-info-col">
        <div className="loading-status-strip">
          <span className="live-researching-tag">
            <span className="live-beacon"></span>
            PALLU Investigating
          </span>
          <span className="loading-query-quote">"{query}"</span>
        </div>

        <div className="loading-step-card">
          <div className="step-icon-halo">
            <StepIcon size={16} className="text-cyan-400" />
          </div>
          <div className="step-text-details">
            <h4 className="step-headline">{currentStep.label}</h4>
            <p className="step-sub">{currentStep.detail}</p>
          </div>
        </div>

        {/* Segmented Neon Progress Bar */}
        <div className="neon-progress-track">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`progress-neon-segment ${
                idx < stepIndex ? "done" : idx === stepIndex ? "in-progress" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
