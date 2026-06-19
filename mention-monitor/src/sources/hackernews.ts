import type { Mention, SearchContext, Source } from "../types.js";

// Hacker News via the free Algolia search API. No key, generous limits.
// Docs: https://hn.algolia.com/api
// We use search_by_date so we get a chronological feed of fresh hits and let
// the seen-store handle dedup, rather than relying on relevance ranking.
const ENDPOINT = "https://hn.algolia.com/api/v1/search_by_date";

interface HnHit {
  objectID: string;
  title?: string;
  story_title?: string;
  comment_text?: string;
  story_text?: string;
  url?: string;
  author?: string;
  points?: number;
  created_at: string;
}

async function query(term: string, matchType: "brand" | "topic"): Promise<Mention[]> {
  const params = new URLSearchParams({
    query: term,
    tags: "(story,comment)",
    hitsPerPage: "50",
  });
  const res = await fetch(`${ENDPOINT}?${params}`);
  if (!res.ok) throw new Error(`HN search ${res.status}`);
  const data = (await res.json()) as { hits: HnHit[] };

  return data.hits.map((hit) => {
    const title = hit.title ?? hit.story_title ?? hit.comment_text ?? "(comment)";
    return {
      id: `hackernews:${hit.objectID}`,
      source: "hackernews",
      title: stripHtml(title).slice(0, 200),
      // Link to the item on HN so comments are reachable too.
      url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      author: hit.author,
      text: stripHtml(hit.comment_text ?? hit.story_text ?? ""),
      createdAt: hit.created_at,
      score: hit.points,
      matchType,
    };
  });
}

export const hackernews: Source = {
  name: "hackernews",
  async search(ctx: SearchContext): Promise<Mention[]> {
    const out: Mention[] = [];
    for (const keyword of ctx.keywords) out.push(...(await query(keyword, "brand")));
    // Opportunity threads (e.g. "Show HN" agent launches, Copilot migration).
    for (const topic of ctx.topics) out.push(...(await query(topic, "topic")));
    return out;
  },
};

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").trim();
}
