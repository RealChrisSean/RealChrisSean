import type { Mention, Source } from "../types.js";

// Reddit via the public search JSON endpoint. No OAuth needed for read-only
// search, but Reddit is strict about User-Agent: requests without a descriptive
// one get 429'd, so we always send a real one.
//
// If you outgrow the public endpoint's rate limits, switch to the official API
// with a (free) script-app client id/secret and the OAuth token flow.
const ENDPOINT = "https://www.reddit.com/search.json";
const USER_AGENT = "mention-monitor/1.0 (github.com/RealChrisSean)";

interface RedditChild {
  data: {
    id: string;
    title: string;
    selftext?: string;
    permalink: string;
    author: string;
    score: number;
    created_utc: number;
    subreddit: string;
  };
}

export const reddit: Source = {
  name: "reddit",
  async search(keywords: string[]): Promise<Mention[]> {
    const out: Mention[] = [];
    for (const keyword of keywords) {
      const params = new URLSearchParams({
        q: keyword,
        sort: "new",
        limit: "50",
        t: "week", // newest within the last week; dedup handles repeats
      });
      const res = await fetch(`${ENDPOINT}?${params}`, {
        headers: { "User-Agent": USER_AGENT },
      });
      if (!res.ok) throw new Error(`Reddit search ${res.status}`);
      const data = (await res.json()) as {
        data: { children: RedditChild[] };
      };

      for (const { data: post } of data.data.children) {
        out.push({
          id: `reddit:${post.id}`,
          source: "reddit",
          title: post.title.slice(0, 200),
          url: `https://www.reddit.com${post.permalink}`,
          author: `u/${post.author} in r/${post.subreddit}`,
          text: (post.selftext ?? "").slice(0, 280),
          createdAt: new Date(post.created_utc * 1000).toISOString(),
          score: post.score,
        });
      }
    }
    return out;
  },
};
