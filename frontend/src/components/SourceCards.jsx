import React, { useState } from "react";
import { ExternalLink, Globe, BookOpen, ChevronDown, ChevronUp, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

export function SourceCards({ sources }) {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedPapers, setExpandedPapers] = useState({});

  if (!sources) return null;

  const webSources = sources.web_sources || [];
  const academicPapers = sources.academic_papers || [];
  const totalWeb = sources.total_web ?? webSources.length;
  const totalAcademic = sources.total_academic ?? academicPapers.length;

  if (totalWeb === 0 && totalAcademic === 0) {
    return (
      <div className="futuristic-sources-empty">
        <p>No verified external sources were retrieved for this research query.</p>
      </div>
    );
  }

  const togglePaperExpand = (index) => {
    setExpandedPapers((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDomain = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "external link";
    }
  };

  return (
    <div className="futuristic-sources-box">
      <div className="sources-top-bar">
        <div className="sources-head-title">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Verified Citations & Grounded References</span>
          <span className="sources-count-tag">{totalWeb + totalAcademic} Citations</span>
        </div>

        {/* Tab Filters */}
        <div className="sources-tab-group">
          <button
            type="button"
            className={`source-chip-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({totalWeb + totalAcademic})
          </button>
          <button
            type="button"
            className={`source-chip-btn ${activeTab === "web" ? "active" : ""}`}
            onClick={() => setActiveTab("web")}
          >
            <Globe size={13} className="text-blue-400" />
            Web ({totalWeb})
          </button>
          <button
            type="button"
            className={`source-chip-btn ${activeTab === "academic" ? "active" : ""}`}
            onClick={() => setActiveTab("academic")}
          >
            <BookOpen size={13} className="text-purple-400" />
            arXiv Preprints ({totalAcademic})
          </button>
        </div>
      </div>

      <div className="sources-layout-grid">
        {/* Web Sources Section */}
        {(activeTab === "all" || activeTab === "web") && webSources.length > 0 && (
          <div className="sources-category-block">
            <div className="category-block-header">
              <Globe size={15} className="text-blue-400" />
              <span>Live Web Sources ({webSources.length})</span>
            </div>
            <div className="cards-cards-grid">
              {webSources.map((item, idx) => (
                <div key={`web-${idx}`} className="neon-source-card web-border">
                  <div className="card-meta-line">
                    <span className="domain-pill">{getDomain(item.url)}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-nav-link"
                      title="Open verified source in new tab"
                    >
                      <span>Visit</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <h4 className="card-item-title">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title || "Web Source"}
                    </a>
                  </h4>
                  {item.snippet && (
                    <p className="card-item-snippet">{item.snippet}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic arXiv Preprints Section */}
        {(activeTab === "all" || activeTab === "academic") && academicPapers.length > 0 && (
          <div className="sources-category-block">
            <div className="category-block-header">
              <BookOpen size={15} className="text-purple-400" />
              <span>Academic Preprints (arXiv • Non-peer-reviewed) ({academicPapers.length})</span>
            </div>
            <div className="cards-cards-grid">
              {academicPapers.map((paper, idx) => {
                const isExpanded = !!expandedPapers[idx];
                const authorsText = Array.isArray(paper.authors) && paper.authors.length > 0
                  ? paper.authors.join(", ")
                  : "Authors Not Specified";

                return (
                  <div key={`paper-${idx}`} className="neon-source-card paper-border">
                    <div className="card-meta-line">
                      <div className="paper-status-badges">
                        <span className="arxiv-tag" title="Academic manuscript posted on arXiv before formal peer review">
                          <FileText size={11} /> arXiv Preprint
                        </span>
                        <span className="non-peer-reviewed-tag">Non-peer-reviewed</span>
                        {paper.published && (
                          <span className="date-tag">{paper.published}</span>
                        )}
                      </div>
                      {paper.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-nav-link preprint-link"
                          title="Open arXiv paper"
                        >
                          <span>Preprint</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <h4 className="card-item-title">
                      {paper.url ? (
                        <a href={paper.url} target="_blank" rel="noopener noreferrer">
                          {paper.title || "Academic Research Paper"}
                        </a>
                      ) : (
                        paper.title || "Academic Research Paper"
                      )}
                    </h4>

                    <div className="paper-authors-line">
                      <span className="authors-lbl">Authors:</span> {authorsText}
                    </div>

                    {paper.summary && (
                      <div className="paper-abstract-container">
                        <div className={`abstract-text ${isExpanded ? "expanded" : "collapsed"}`}>
                          {paper.summary}
                        </div>
                        <button
                          type="button"
                          className="abstract-toggle-btn"
                          onClick={() => togglePaperExpand(idx)}
                        >
                          {isExpanded ? (
                            <>
                              <span>Show Less</span>
                              <ChevronUp size={13} />
                            </>
                          ) : (
                            <>
                              <span>Read Abstract</span>
                              <ChevronDown size={13} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
