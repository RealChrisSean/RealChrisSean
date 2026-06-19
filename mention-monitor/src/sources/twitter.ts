import type { Mention, Source } from "../types.js";

// X / Twitter recent search. THIS REQUIRES A PAID PLAN.
// As of 2026 the "recent search" endpoint (last 7 days) is on the Basic tier
// (~$100/mo); there is no free read access. Supply TWITTER_BEARER_TOKEN and set
// SOURCE_TWITTER=true to enable. Without a token the source stays off (see
// config.ts) and never gets called.
//
// Docs: https://developer.x.com/en/docs/x-api/tweets/search/api-reference/get-tweets-search-recent
const ENDPOINT = "https://api.x.com/2/tweets/search/recent";

interface TweetData {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: { like_count: number };
}

export function makeTwitter(bearerToken: string): Source {
  return {
    name: "twitter",
    async search(keywords: string[]): Promise<Mention[]> {
      const out: Mention[] = [];
      // X supports OR queries, so one request covers all keywords. -is:retweet
      // cuts noise. Mind the per-tier rate limits.
      const query = `(${keywords.map((k) => `"${k}"`).join(" OR ")}) -is:retweet`;
      const params = new URLSearchParams({
        query,
        max_results: "50",
        "tweet.fields": "created_at,author_id,public_metrics",
      });
      const res = await fetch(`${ENDPOINT}?${params}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      if (!res.ok) throw new Error(`X search ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as { data?: TweetData[] };

      for (const t of data.data ?? []) {
        out.push({
          id: `twitter:${t.id}`,
          source: "twitter",
          title: t.text.slice(0, 200),
          url: `https://x.com/i/web/status/${t.id}`,
          author: t.author_id,
          text: t.text,
          createdAt: t.created_at,
          score: t.public_metrics?.like_count,
        });
      }
      return out;
    },
  };
}
