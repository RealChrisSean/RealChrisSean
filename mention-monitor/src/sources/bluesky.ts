import type { Mention, SearchContext, Source } from "../types.js";

// Bluesky via the public AppView. searchPosts needs no auth and is a great free
// stand-in for "X" since a lot of the dev/infra crowd cross-posts there.
// Docs: https://docs.bsky.app/docs/api/app-bsky-feed-search-posts
const ENDPOINT = "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts";

interface BskyPost {
  uri: string; // at://did/app.bsky.feed.post/rkey
  cid: string;
  author: { handle: string; displayName?: string };
  record: { text: string; createdAt: string };
  likeCount?: number;
}

export const bluesky: Source = {
  name: "bluesky",
  async search(ctx: SearchContext): Promise<Mention[]> {
    const out: Mention[] = [];
    for (const keyword of ctx.keywords) {
      const params = new URLSearchParams({
        q: keyword,
        sort: "latest",
        limit: "50",
      });
      const res = await fetch(`${ENDPOINT}?${params}`);
      if (!res.ok) throw new Error(`Bluesky search ${res.status}`);
      const data = (await res.json()) as { posts: BskyPost[] };

      for (const post of data.posts) {
        // Build a human-clickable URL from the at:// uri.
        const rkey = post.uri.split("/").pop();
        out.push({
          id: `bluesky:${post.cid}`,
          source: "bluesky",
          title: post.record.text.slice(0, 200),
          url: `https://bsky.app/profile/${post.author.handle}/post/${rkey}`,
          author: `@${post.author.handle}`,
          text: post.record.text.slice(0, 280),
          createdAt: post.record.createdAt,
          score: post.likeCount,
        });
      }
    }
    return out;
  },
};
