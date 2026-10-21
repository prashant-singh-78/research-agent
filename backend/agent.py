import os
import time
import re
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Optional
import requests
from tools import search_web, search_arxiv

logger = logging.getLogger("research_agent")

DEFAULT_GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
DEFAULT_MODEL = DEFAULT_GEMINI_MODEL
OLLAMA_CHAT_URL = GEMINI_API_BASE_URL


def _load_env_file():
    """
    Lightweight .env loader using standard library to support local configuration
    without adding extra dependencies.
    """
    candidates = [
        os.path.join(os.getcwd(), ".env"),
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    ]
    for env_path in candidates:
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k and k not in os.environ:
                                os.environ[k] = v
                break
            except Exception:
                pass


_load_env_file()


class AIServiceError(Exception):
    """Raised when the AI provider API returns an error or is unreachable."""
    pass


# Backward compatibility alias for any existing imports
OllamaServiceError = AIServiceError


class ResearchAgent:
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 60
    ):
        self.api_key = (api_key or os.environ.get("GEMINI_API_KEY", "")).strip()
        self.model = (model or os.environ.get("GEMINI_MODEL", DEFAULT_GEMINI_MODEL)).strip()
        self.timeout = timeout
        self.api_base_url = GEMINI_API_BASE_URL

    def check_gemini_status(self) -> Dict[str, Any]:
        """
        Verify Gemini API configuration and network connectivity.
        Never logs or exposes the raw API key.
        """
        # Re-check environment in case key or model was populated dynamically
        if not self.api_key:
            self.api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        env_model = os.environ.get("GEMINI_MODEL", "").strip()
        if env_model:
            self.model = env_model

        if not self.api_key:
            return {
                "provider": "gemini",
                "configured": False,
                "reachable": False,
                "model": self.model,
                "error": "GEMINI_API_KEY environment variable is not configured."
            }

        url = f"{self.api_base_url}/models/{self.model}"
        headers = {
            "x-goog-api-key": self.api_key
        }

        try:
            resp = requests.get(url, headers=headers, timeout=6)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "provider": "gemini",
                    "configured": True,
                    "reachable": True,
                    "model": data.get("name", self.model).replace("models/", ""),
                    "display_name": data.get("displayName", self.model)
                }
            elif resp.status_code in (401, 403):
                return {
                    "provider": "gemini",
                    "configured": True,
                    "reachable": False,
                    "model": self.model,
                    "error": "Invalid or unauthorized GEMINI_API_KEY."
                }
            else:
                return {
                    "provider": "gemini",
                    "configured": True,
                    "reachable": False,
                    "model": self.model,
                    "error": f"Gemini API returned HTTP {resp.status_code}"
                }
        except requests.exceptions.RequestException as e:
            return {
                "provider": "gemini",
                "configured": True,
                "reachable": False,
                "model": self.model,
                "error": f"Cannot connect to Gemini API endpoint ({str(e)})"
            }

    # Backward compatibility alias
    check_ollama_status = check_gemini_status

    @staticmethod
    def classify_intent(query: str, history: Optional[List[Dict[str, str]]] = None) -> tuple:
        """
        Classifies incoming query intent before executing tools.
        Returns: (routed_mode, intent_name)
          - ('chat', 'greeting' | 'general_knowledge' | 'explanation' | 'follow_up')
          - ('web', 'live_web_search')
          - ('deep', 'academic_research')
        """
        q = query.strip().lower()
        has_history = bool(history and len(history) > 0)

        # 1. Casual Greetings & Pleasantries
        greeting_pattern = r"^(hi|hello|hey|namaste|pranam|halo|hola|greetings|howdy|sup|kaise ho|kya hal hai|who are you|tum kaun ho|who made you)(\s+.*)?$"
        if re.match(greeting_pattern, q) or q in {"hi", "hello", "hey", "hi pallu", "hello pallu", "hey pallu", "namaste", "pranam"}:
            return "chat", "greeting"

        # 2. Follow-up indicators (when conversation history exists)
        follow_up_patterns = [
            r"^(tell me more|explain more|elaborate|aur batao|aur samjhao|what about that|why is that|continue|aur kya|what else)",
            r"^(can you give an example|example do|give an example|show an example)",
            r"^(give me code|show code|write code|implement this|how to code this)"
        ]
        if has_history and any(re.search(pat, q) for pat in follow_up_patterns):
            return "chat", "follow_up"

        # 3. Explicit Academic / Paper / arXiv Research
        academic_keywords = [
            "recent medical ai papers", "compare papers", "arxiv", "research papers",
            "academic papers", "scholarly articles", "peer-reviewed", "literature review",
            "compare studies", "scientific preprints", "compare research", "research paper"
        ]
        if any(kw in q for kw in academic_keywords) or (("paper" in q or "papers" in q or "study" in q or "studies" in q) and "research" in q):
            return "deep", "academic_research"
        if any(kw in q for kw in ["deep research", "in-depth research", "literature scan"]):
            return "deep", "academic_research"

        # 4. Explicit Live Web Search / Timely Information
        words = set(re.findall(r"\b\w+\b", q))
        if words.intersection({"today", "yesterday", "now", "weather", "stock", "price", "happened"}):
            return "web", "live_web_search"
        if any(kw in q for kw in ["what happened in ai today", "what happened today", "latest news", "current price", "search web", "search internet", "fact check", "live score"]):
            return "web", "live_web_search"

        # 5. Default Conversational Chat (General knowledge, explanations, definitions, coding, brainstorming)
        return "chat", "general_knowledge"

    def _convert_to_gemini_payload(
        self,
        messages: List[Dict[str, str]],
        depth: str = "concise",
        is_chat: bool = False
    ) -> Dict[str, Any]:
        """
        Converts standard [{"role": "...", "content": "..."}] messages to Gemini REST API format:
        - Separates system messages into systemInstruction.
        - Maps 'assistant' role to 'model'.
        - Merges consecutive turns of identical roles.
        - Configures generationConfig tokens and temperature.
        """
        system_texts: List[str] = []
        contents: List[Dict[str, Any]] = []

        for msg in messages:
            role = msg.get("role", "user")
            content = (msg.get("content") or "").strip()
            if not content:
                continue

            if role == "system":
                system_texts.append(content)
            else:
                gemini_role = "model" if role == "assistant" else "user"
                # Merge consecutive identical roles
                if contents and contents[-1]["role"] == gemini_role:
                    contents[-1]["parts"][0]["text"] += f"\n\n{content}"
                else:
                    contents.append({
                        "role": gemini_role,
                        "parts": [{"text": content}]
                    })

        # Ensure contents is never empty and begins with a user turn
        if not contents:
            contents.append({
                "role": "user",
                "parts": [{"text": "Hello"}]
            })
        elif contents[0]["role"] == "model":
            contents.insert(0, {
                "role": "user",
                "parts": [{"text": "Hello PALLU"}]
            })

        max_tokens = 1500 if is_chat else (1600 if depth == "concise" else 2500)
        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4 if is_chat else 0.3,
                "maxOutputTokens": max_tokens,
                "topP": 0.95
            }
        }

        if system_texts:
            payload["systemInstruction"] = {
                "parts": [{"text": "\n\n".join(system_texts)}]
            }

        return payload

    def _call_gemini(
        self,
        messages: List[Dict[str, str]],
        depth: str = "concise",
        is_chat: bool = False
    ) -> str:
        """
        Calls Gemini generateContent REST API using requests.
        Ensures secure header authentication and safe response parsing.
        """
        if not self.api_key:
            self.api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        env_model = os.environ.get("GEMINI_MODEL", "").strip()
        if env_model:
            self.model = env_model

        if not self.api_key:
            raise AIServiceError(
                "GEMINI_API_KEY environment variable is not configured. "
                "Please set GEMINI_API_KEY in your environment or Render settings."
            )

        url = f"{self.api_base_url}/models/{self.model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }

        payload = self._convert_to_gemini_payload(messages, depth=depth, is_chat=is_chat)

        try:
            resp = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=self.timeout
            )

            if resp.status_code != 200:
                error_msg = f"HTTP {resp.status_code}"
                try:
                    err_json = resp.json()
                    err_detail = err_json.get("error", {}).get("message")
                    if err_detail:
                        error_msg = f"{error_msg}: {err_detail}"
                except Exception:
                    error_msg = f"{error_msg}: {resp.text[:200]}"

                if resp.status_code in (401, 403):
                    raise AIServiceError(
                        f"Gemini API authentication failed ({error_msg}). "
                        "Please verify that your GEMINI_API_KEY is valid."
                    )
                elif resp.status_code == 429:
                    raise AIServiceError(
                        f"Gemini API quota/rate limit exceeded ({error_msg}). "
                        "Please try again in a few moments."
                    )
                else:
                    raise AIServiceError(f"Gemini API request failed: {error_msg}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                prompt_feedback = data.get("promptFeedback", {})
                block_reason = prompt_feedback.get("blockReason")
                if block_reason:
                    raise AIServiceError(f"Gemini response was blocked by safety filters: {block_reason}")
                raise AIServiceError("Gemini returned no response candidates.")

            candidate = candidates[0]
            parts = candidate.get("content", {}).get("parts", [])
            if not parts:
                finish_reason = candidate.get("finishReason", "UNKNOWN")
                raise AIServiceError(f"Gemini returned empty content (finishReason: {finish_reason}).")

            content = "".join(p.get("text", "") for p in parts if isinstance(p, dict)).strip()
            if not content:
                raise AIServiceError("Gemini generated an empty text response.")

            # For research synthesis, cleanly trim any meta-planning markers before the first section
            if not is_chat:
                for header_marker in [
                    "📌 **Overview", 
                    "📌 Overview", 
                    "## 📌", 
                    "## Overview", 
                    "### Overview", 
                    "**Overview", 
                    "Overview (Mukhyamsh)"
                ]:
                    if header_marker in content:
                        marker_pos = content.find(header_marker)
                        if marker_pos > 0:
                            content = content[marker_pos:].strip()
                            break

            return content

        except requests.exceptions.Timeout as e:
            raise AIServiceError(
                f"Gemini API request timed out after {self.timeout}s. Please try again."
            ) from e
        except requests.exceptions.ConnectionError as e:
            raise AIServiceError(
                "Could not connect to Gemini API. Please check your internet connection."
            ) from e
        except AIServiceError:
            raise
        except Exception as e:
            raise AIServiceError(f"Unexpected error communicating with Gemini API: {str(e)}") from e

    # Backward compatibility alias
    _call_ollama = _call_gemini

    def chat(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language_style: str = "hinglish",
        depth: str = "concise",
        intent: str = "general_knowledge"
    ) -> Dict[str, Any]:
        """
        Executes a direct conversational response using Gemini without web or arXiv searches.
        Maintains conversation context from conversation_history.
        """
        start_time = time.time()
        clean_query = query.strip()

        system_prompt = (
            "You are PALLU, a friendly, intelligent, and insightful Personal AI Assistant. "
            "You converse naturally, warmly, and helpfully in clear, accessible Hinglish "
            "(Hindi written in Latin alphabet with standard technical English terms), "
            "or standard English if the user writes in pure English.\n\n"
            "STRICT RULES:\n"
            "1. CONVERSATIONAL & ENGAGING: Answer directly with a warm, helpful persona.\n"
            "2. GREETINGS: For greetings like 'Hi PALLU', give a friendly, warm welcome and ask how you can help.\n"
            "3. EXPLANATIONS & KNOWLEDGE: For questions like 'What is a human?' or 'Explain machine learning with an example', "
            "provide crystal-clear, structured answers with helpful analogies and real-world examples.\n"
            "4. FOLLOW-UP CONTINUITY: When user asks follow-ups (e.g. 'Tell me more about that'), seamlessly maintain context "
            "and expand on the previous discussion without restarting.\n"
            "5. NO FAKE CITATIONS: Since this is direct conversational chat (no external search was performed), "
            "do NOT invent fake links, sources, or URLs.\n"
        )

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

        # Append recent conversation history (last 6 messages) for seamless multi-turn context
        if conversation_history:
            recent_history = conversation_history[-6:]
            for msg in recent_history:
                role = msg.get("role", "user")
                if role in ("user", "assistant"):
                    messages.append({
                        "role": role,
                        "content": msg.get("content", "").strip()
                    })

        # Append current user query
        messages.append({"role": "user", "content": clean_query})

        gen_start = time.time()
        response_text = self._call_gemini(messages, depth=depth, is_chat=True)
        gen_duration = round(time.time() - gen_start, 2)
        total_duration = round(time.time() - start_time, 2)

        return {
            "query": clean_query,
            "status": "success",
            "report_hinglish": response_text,
            "sources": {
                "web_sources": [],
                "academic_papers": [],
                "total_web": 0,
                "total_academic": 0
            },
            "metadata": {
                "model": self.model,
                "ai_provider": "gemini",
                "ollama_endpoint": "https://generativelanguage.googleapis.com",
                "execution_time_seconds": total_duration,
                "search_time_seconds": 0.0,
                "generation_time_seconds": gen_duration,
                "language": language_style,
                "depth": depth,
                "routed_mode": "chat",
                "intent": intent
            }
        }

    def research(
        self,
        query: str,
        max_web_results: int = 5,
        max_paper_results: int = 3,
        mode: str = "chat",
        language_style: str = "hinglish",
        depth: str = "concise",
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Intelligent research router and grounded synthesis powered by Gemini:
        1. Classifies request intent before executing tools.
        2. Routes between Normal Chat (no tools), Web Search (DuckDuckGo), and Deep Research (Web + arXiv).
        3. Honors explicit user-selected modes.
        4. Distinguishes preprints from peer-reviewed research and strictly prevents hallucination.
        """
        start_time = time.time()
        clean_query = query.strip()
        user_mode = (mode or "chat").lower()

        # Step 1: Smart Intent Classification
        detected_mode, detected_intent = self.classify_intent(clean_query, conversation_history)

        # Step 2: Determine Effective Mode
        if user_mode == "web":
            effective_mode = "web"
            intent = "explicit_web_search"
        elif user_mode in ("deep", "papers"):
            effective_mode = "deep"
            intent = "explicit_academic_research"
        elif user_mode == "chat":
            if detected_mode in ("web", "deep"):
                effective_mode = detected_mode
                intent = detected_intent
            else:
                effective_mode = "chat"
                intent = detected_intent
        else: # "auto"
            effective_mode = detected_mode
            intent = detected_intent

        logger.info(
            f"Routing: '{clean_query}' -> user_mode='{user_mode}', effective_mode='{effective_mode}', intent='{intent}'"
        )

        # If routed to chat: answer directly via Gemini without web or arXiv search
        if effective_mode == "chat":
            return self.chat(
                query=clean_query,
                conversation_history=conversation_history,
                language_style=language_style,
                depth=depth,
                intent=intent
            )

        # Step 3: Parallel Search Execution via ThreadPoolExecutor for web/deep modes
        search_start = time.time()
        web_results: List[Dict[str, Any]] = []
        arxiv_results: List[Dict[str, Any]] = []

        with ThreadPoolExecutor(max_workers=2) as executor:
            future_web = None
            future_arxiv = None

            if effective_mode in ("web", "deep") and max_web_results > 0:
                future_web = executor.submit(search_web, clean_query, max_web_results)

            if effective_mode == "deep" and max_paper_results > 0:
                future_arxiv = executor.submit(search_arxiv, clean_query, max_paper_results)

            if future_web:
                try:
                    web_results = future_web.result()
                except Exception as e:
                    logger.error(f"Error retrieving web results: {e}")

            if future_arxiv:
                try:
                    arxiv_results = future_arxiv.result()
                except Exception as e:
                    logger.error(f"Error retrieving arXiv preprints: {e}")

        search_duration = round(time.time() - search_start, 2)

        # Step 4: Format Context for Gemini
        context_parts: List[str] = []

        if web_results:
            context_parts.append("### VERIFIED LIVE WEB SOURCES:")
            for idx, item in enumerate(web_results, 1):
                snippet = item.get("snippet", "").strip()
                if len(snippet) > 280:
                    snippet = snippet[:280] + "..."
                context_parts.append(
                    f"[{idx}] Title: {item['title']}\n"
                    f"URL: {item['url']}\n"
                    f"Snippet: {snippet}\n"
                )

        if arxiv_results:
            context_parts.append("### VERIFIED ACADEMIC PREPRINTS (ARXIV - NON-PEER-REVIEWED):")
            for idx, paper in enumerate(arxiv_results, 1):
                authors = paper.get("authors", [])
                authors_str = ", ".join(authors[:3])
                if len(authors) > 3:
                    authors_str += " et al."
                summary = paper.get("summary", "").strip()
                if len(summary) > 350:
                    summary = summary[:350] + "..."
                context_parts.append(
                    f"[Preprint {idx}] Title: {paper['title']}\n"
                    f"Authors: {authors_str}\n"
                    f"Published: {paper['published']}\n"
                    f"Venue: {paper.get('venue', 'arXiv Preprint')}\n"
                    f"URL: {paper['url']}\n"
                    f"Summary: {summary}\n"
                )

        if not context_parts:
            context_str = "No external live web or arXiv sources found for this query."
        else:
            context_str = "\n".join(context_parts)

        # Step 5: System prompt with PALLU persona and strict grounding
        length_instruction = (
            "Provide a concise, crisp, and high-impact research synthesis (around 250-400 words)."
            if depth == "concise"
            else "Provide an in-depth, thorough research report with comprehensive explanations (around 500-750 words)."
        )

        system_prompt = (
            "You are PALLU, an expert Personal AI Research Assistant. Your mission is to provide an in-depth, "
            "rigorous, objective, and crystal-clear research report on the user's topic.\n\n"
            f"RESPONSE LENGTH: {length_instruction}\n\n"
            "STRICT RULES YOU MUST NEVER BREAK:\n"
            "1. IDENTITY & TONE: You are PALLU. Explain everything in simple, conversational, and natural Hinglish "
            "(Hindi written in Latin alphabet with standard technical English terms) so that complex concepts become easy to grasp.\n"
            "2. ZERO HALLUCINATION & STRICT GROUNDING: Ground all facts, statistics, numbers, and claims strictly in the verified context provided below. "
            "NEVER invent or fabricate facts, statistics, citations, titles, authors, or URLs. Every URL cited must be an exact copy of a URL in the verified context.\n"
            "3. PREPRINT DISTINCTION: Clearly distinguish arXiv academic preprints from peer-reviewed journal publications. "
            "Explicitly clarify that arXiv papers are preprints that have not yet undergone formal peer review.\n"
            "4. INSUFFICIENT EVIDENCE & LIMITATIONS: If external evidence or sources are sparse, limited, or not found, explicitly state this limitation "
            "rather than filling gaps with assumptions or fabricated information.\n"
            "5. CLICKABLE CITATIONS: Support factual claims with direct clickable Markdown links `[Source Title](URL)` wherever relevant.\n"
            "6. STRUCTURE YOUR RESPONSE WITH THESE REQUIRED SECTIONS:\n"
            "   - 📌 **Overview (Mukhyamsh)**: Clear, engaging overview of what the topic is.\n"
            "   - 🔍 **Key Findings & Concepts (Khaas Baatein)**: Deep dive into the verified facts, mechanics, and advancements supported by links.\n"
            "   - 📚 **Academic Preprints & Research (ArXiv Preprints se Seekh)**: Specific insights from the arXiv papers (mention authors and paper titles, and note they are non-peer-reviewed preprints). If no arXiv papers were found, state: 'Is query ke liye koi directly relevant arXiv preprint nahi mila.'\n"
            "   - 🚀 **Practical Impact & Future (Real-life Use & Aage kya hoga)**: Practical real-world applications and outlook.\n"
            "   - 🔗 **Verified Sources & References (Asli Links)**: List all verified URLs formatted as clickable Markdown links `[Title](URL)`.\n"
        )

        user_prompt = (
            f"User Research Query: \"{clean_query}\"\n\n"
            f"Here is the verified research data gathered for this topic:\n"
            f"----------------------------------------\n"
            f"{context_str}\n"
            f"----------------------------------------\n\n"
            "Please generate the complete research report as PALLU in clear Hinglish following the required sections. "
            "Ensure all factual claims are grounded in the verified data, distinguish preprints, and cite all actual URLs directly."
        )

        messages = [
            {"role": "system", "content": system_prompt}
        ]

        if conversation_history:
            for prev in conversation_history[-3:]:
                if prev.get("role") in ("user", "assistant"):
                    messages.append({"role": prev["role"], "content": prev["content"]})

        messages.append({"role": "user", "content": user_prompt})

        # Step 6: Synthesize with Gemini
        gen_start = time.time()
        report = self._call_gemini(messages, depth=depth, is_chat=False)
        gen_duration = round(time.time() - gen_start, 2)
        total_duration = round(time.time() - start_time, 2)

        return {
            "query": clean_query,
            "status": "success",
            "report_hinglish": report,
            "sources": {
                "web_sources": web_results,
                "academic_papers": arxiv_results,
                "total_web": len(web_results),
                "total_academic": len(arxiv_results)
            },
            "metadata": {
                "model": self.model,
                "ai_provider": "gemini",
                "ollama_endpoint": "https://generativelanguage.googleapis.com",
                "execution_time_seconds": total_duration,
                "search_time_seconds": search_duration,
                "generation_time_seconds": gen_duration,
                "language": language_style,
                "depth": depth,
                "routed_mode": effective_mode,
                "intent": intent
            }
        }
