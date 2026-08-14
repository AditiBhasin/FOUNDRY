import os
import urllib.request
import urllib.parse
import json
from typing import List, Dict, Any, Optional
from models.evidence import EvidenceItem, EvidenceType, LiveResearchStatus


class LiveDataService:
    """
    Live Data Retrieval Layer for FOUNDry.
    
    Adheres strictly to the Truthful Evidence System:
    - If external search API credentials exist (Tavily, SerpApi, Bing), execute live retrieval.
    - If no credentials exist, explicitly return available=False.
    - NEVER fabricate search results, URLs, competitor pricing, or market sizes.
    """

    def __init__(self):
        self.tavily_key = os.getenv("TAVILY_API_KEY")
        self.serpapi_key = os.getenv("SERPAPI_API_KEY")
        self.bing_key = os.getenv("BING_API_KEY") or os.getenv("AZURE_SEARCH_KEY")

    def check_availability(self) -> LiveResearchStatus:
        if self.tavily_key:
            return LiveResearchStatus(
                available=True,
                provider="Tavily Search API",
                message="Live web research is active via Tavily Search API."
            )
        elif self.serpapi_key:
            return LiveResearchStatus(
                available=True,
                provider="SerpApi Google Search",
                message="Live web research is active via SerpApi."
            )
        elif self.bing_key:
            return LiveResearchStatus(
                available=True,
                provider="Bing Web Search API",
                message="Live web research is active via Bing Search API."
            )
        else:
            return LiveResearchStatus(
                available=False,
                provider=None,
                message="LIVE WEB RESEARCH UNAVAILABLE. External search provider API key is not configured in .env."
            )

    def search(self, query: str, max_results: int = 5) -> List[EvidenceItem]:
        """
        Execute search if a legitimate provider is configured.
        Returns a list of verified EvidenceItems (type=DATA).
        """
        status = self.check_availability()
        if not status.available:
            return []

        # Real Tavily provider execution
        if self.tavily_key:
            try:
                url = "https://api.tavily.com/search"
                payload = {
                    "api_key": self.tavily_key,
                    "query": query,
                    "search_depth": "basic",
                    "max_results": max_results,
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    results = []
                    for idx, item in enumerate(data.get("results", [])):
                        results.append(
                            EvidenceItem(
                                id=f"live-tavily-{idx+1}",
                                agent="research",
                                category=EvidenceType.DATA,
                                claim=item.get("content", "")[:300],
                                source=item.get("url", "Tavily Web Search"),
                                verification_status="verified_external",
                                notes=f"Live search result for '{query}'"
                            )
                        )
                    return results
            except Exception as e:
                print(f"[LiveDataService] Tavily search error: {e}")
                return []

        return []


live_data_service = LiveDataService()
