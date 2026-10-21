import logging
import re
from typing import List, Dict, Any
from urllib.parse import urlparse, urlunparse
from ddgs import DDGS
import arxiv

logger = logging.getLogger("research_tools")

# Common stop words to exclude when extracting core query terms for relevance filtering
STOP_WORDS = {
    "what", "is", "the", "in", "and", "for", "with", "about", "how", "why",
    "recent", "latest", "development", "developments", "advancement", "advancements",
    "study", "studies", "research", "paper", "papers", "overview", "impact",
    "can", "are", "does", "that", "this", "from", "into", "over", "more", "most",
    "which", "when", "where", "who", "whom", "whose", "will", "would", "could",
    "should", "have", "has", "had", "been", "being"
}


def _normalize_url(url: str) -> str:
    """
    Normalize URL by lowercasing scheme/host, stripping trailing slashes and fragments
    to ensure effective deduplication.
    """
    try:
        parsed = urlparse(url.strip())
        path = parsed.path.rstrip("/")
        normalized = urlunparse((
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            path,
            parsed.params,
            parsed.query,
            ""  # strip anchor fragment
        ))
        return normalized
    except Exception:
        return url.strip().rstrip("/")


def _extract_keywords(query: str) -> List[str]:
    """
    Extract meaningful alphanumeric keywords (>2 chars, not in STOP_WORDS)
    to check topic relevance.
    """
    tokens = re.findall(r"[a-zA-Z0-9_-]{3,}", query.lower())
    return [t for t in tokens if t not in STOP_WORDS]


def search_web(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search the live web using DuckDuckGo.
    Deduplicates URLs, filters out empty snippets, and limits results strictly
    to high-quality verified findings.
    """
    results: List[Dict[str, Any]] = []
    if not query or not query.strip() or max_results <= 0:
        return results

    clean_query = query.strip()
    seen_urls = set()

    try:
        with DDGS() as ddgs:
            # Fetch a small buffer so deduplication still reaches max_results
            raw_results = ddgs.text(clean_query, max_results=max(max_results * 2, 6))
            for item in raw_results:
                title = item.get("title", "").strip()
                url = item.get("href", "").strip()
                body = item.get("body", "").strip()

                if not url:
                    continue

                norm_url = _normalize_url(url)
                if norm_url in seen_urls:
                    continue
                seen_urls.add(norm_url)

                results.append({
                    "title": title or "Web Source",
                    "url": url,
                    "snippet": body,
                    "source_type": "web"
                })

                if len(results) >= max_results:
                    break

    except Exception as e:
        logger.error(f"Error during DuckDuckGo search: {e}", exc_info=True)

    return results


def search_arxiv(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """
    Search scientific research papers using the arxiv package.
    - Deduplicates papers by entry ID.
    - Filters out unrelated academic papers that do not match the core query keywords.
    - Clearly annotates them as arXiv academic preprints (non-peer-reviewed).
    """
    results: List[Dict[str, Any]] = []
    if not query or not query.strip() or max_results <= 0:
        return results

    clean_query = query.strip()
    keywords = _extract_keywords(clean_query)
    seen_ids = set()

    try:
        client = arxiv.Client(
            page_size=max(max_results * 2, 6),
            delay_seconds=1.0,
            num_retries=2
        )
        search = arxiv.Search(
            query=clean_query,
            max_results=max(max_results * 2, 6),
            sort_by=arxiv.SortCriterion.Relevance
        )

        for paper in client.results(search):
            paper_id = paper.get_short_id() if hasattr(paper, "get_short_id") else paper.entry_id
            if paper_id in seen_ids:
                continue

            title = paper.title.strip().replace("\n", " ")
            summary = paper.summary.strip().replace("\n", " ") if paper.summary else ""
            paper_text = f"{title} {summary}".lower()

            # Relevance check: Ensure paper actually discusses at least one significant query term
            # to avoid including unrelated papers just to fill the quota.
            if keywords and not any(kw in paper_text for kw in keywords):
                logger.info(f"Skipping arXiv paper '{title}' - insufficient keyword match for: {keywords}")
                continue

            seen_ids.add(paper_id)
            authors = [a.name for a in paper.authors]
            pub_date = str(paper.published.date()) if paper.published else "N/A"
            url = paper.entry_id or (paper.pdf_url if hasattr(paper, "pdf_url") else "")

            results.append({
                "title": title,
                "url": url,
                "summary": summary,
                "authors": authors,
                "published": pub_date,
                "source_type": "academic_preprint",
                "is_preprint": True,
                "venue": "arXiv Preprint (Non-peer-reviewed)"
            })

            if len(results) >= max_results:
                break

    except Exception as e:
        logger.error(f"Error during arXiv search: {e}", exc_info=True)

    return results
