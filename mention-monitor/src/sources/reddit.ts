import type { Mention, SearchContext, Source } from "../types.js";

// Reddit via the public search JSON endpoint. No OAuth needed for read-only
// search, but Reddit is strict about User-Agent: requests without a descriptive
// one get 429'd, so we always send a real one.
//
// Strategy:
//  - brand keywords are searched across ALL of Reddit (catches every sub).
//  - topic keywords are scoped to the configured ICP subreddits, so we surface
//    "go engage here" threads in the right communities without dragging in the
//    rest of Reddit.
//
// If you outgrow the public endpoint's rate limits, switch to the official API
// with a (free) script-app client id/secret and the OAuth token flow.
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

async function search(
  url: string,
  matchType: "brand" | "topic",
): Promise<Mention[]> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Reddit search ${res.status}`);
  const data = (await res.json()) as { data: { children: RedditChild[] } };

  return data.data.children.map(({ data: post }) => ({
    id: `reddit:${post.id}`,
    source: "reddit",
    title: post.title.slice(0, 200),
    url: `https://www.reddit.com${post.permalink}`,
    author: `u/${post.author} in r/${post.subreddit}`,
    text: (post.selftext ?? "").slice(0, 280),
    createdAt: new Date(post.created_utc * 1000).toISOString(),
    score: post.score,
    matchType,
  }));
}

export const reddit: Source = {
  name: "reddit",
  async search(ctx: SearchContext): Promise<Mention[]> {
    const out: Mention[] = [];

    // Brand mentions, site-wide.
    for (const keyword of ctx.keywords) {
      const params = new URLSearchParams({
        q: keyword,
        sort: "new",
        limit: "50",
        t: "week", // newest within the last week; dedup handles repeats
      });
      out.push(...(await search(`https://www.reddit.com/search.json?${params}`, "brand")));
    }

    // Opportunity threads, scoped to the ICP subreddits. One OR'd query per sub.
    if (ctx.topics.length > 0) {
      const q = ctx.topics.map((t) => `"${t}"`).join(" OR ");
      for (const sub of ctx.subreddits) {
        const params = new URLSearchParams({
          q,
          restrict_sr: "1",
          sort: "new",
          limit: "25",
          t: "week",
        });
        out.push(
          ...(await search(`https://www.reddit.com/r/${sub}/search.json?${params}`, "topic")),
        );
      }
    }

    return out;
  },
};
