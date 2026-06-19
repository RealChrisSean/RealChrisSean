import type { Mention, SearchContext, Source } from "../types.js";

// GitHub issue/PR search, scoped to the agent-framework repos where the ICP
// actually builds (OpenHands, Cline, crewAI, ...). This catches fly.io / Sprites
// discussion happening *inside* those projects — the highest-signal place a
// "company building an agentic product" would surface infra pain.
//
// Works unauthenticated at low volume (10 search req/min); set GITHUB_TOKEN to
// raise that to 30/min. Note: REST search covers issues + PRs, not Discussions
// (those need GraphQL) — a deliberate simplicity trade-off.
const ENDPOINT = "https://api.github.com/search/issues";

interface IssueItem {
  id: number;
  html_url: string;
  title: string;
  body?: string;
  user?: { login: string };
  created_at: string;
  comments: number;
}

export function makeGithub(repos: string[], token?: string): Source {
  // OR the repo scopes into every query so one request covers all repos.
  const repoScope = repos.map((r) => `repo:${r}`).join(" ");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mention-monitor/1.0 (github.com/RealChrisSean)",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return {
    name: "github",
    async search(ctx: SearchContext): Promise<Mention[]> {
      const out: Mention[] = [];
      for (const keyword of ctx.keywords) {
        const params = new URLSearchParams({
          q: `"${keyword}" ${repoScope}`,
          sort: "created",
          order: "desc",
          per_page: "30",
        });
        const res = await fetch(`${ENDPOINT}?${params}`, { headers });
        if (!res.ok) throw new Error(`GitHub search ${res.status}: ${await res.text()}`);
        const data = (await res.json()) as { items: IssueItem[] };

        for (const item of data.items) {
          out.push({
            id: `github:${item.id}`,
            source: "github",
            title: item.title.slice(0, 200),
            url: item.html_url,
            author: item.user?.login,
            text: (item.body ?? "").slice(0, 280),
            createdAt: item.created_at,
            score: item.comments,
            matchType: "brand",
          });
        }
      }
      return out;
    },
  };
}
