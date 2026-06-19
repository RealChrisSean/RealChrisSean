// A single normalized mention, regardless of which platform it came from.
export interface Mention {
  // Stable, globally-unique id. Always prefix with the source name so the same
  // numeric id on two platforms never collides, e.g. "hackernews:38912345".
  id: string;
  source: string;
  title: string;
  url: string;
  author?: string;
  text?: string; // short snippet of the body, if available
  createdAt: string; // ISO-8601
  score?: number; // upvotes / likes, if the platform exposes them
  // "brand" = a tracked keyword (fly.io, sprites.dev, ...) was named.
  // "topic" = an ICP opportunity keyword matched (a thread to go engage in),
  // regardless of any brand mention. Unset is treated as "brand".
  matchType?: "brand" | "topic";
}

// Everything a source might need to run a search. The core builds this once
// from config and hands the same object to every source; each source pulls out
// only the fields it cares about. This keeps sources decoupled from the Config
// shape and makes adding source-specific settings a one-line change here.
export interface SearchContext {
  keywords: string[]; // brand keywords
  topics: string[]; // opportunity keywords (may be empty)
  subreddits: string[]; // subs to scope topic search to
  githubRepos: string[]; // owner/name slugs to scope GitHub search to
  githubToken?: string;
  mastodonInstance: string;
  mastodonToken?: string;
}

// Every platform adapter implements this. Keep it tiny on purpose: a source
// takes the context and returns normalized mentions. Dedup, scheduling and
// delivery are all handled by the core, not the source.
export interface Source {
  name: string;
  // `search` should be resilient: a failure in one source must never take the
  // whole run down, so throw freely here — the core catches per-source.
  search(ctx: SearchContext): Promise<Mention[]>;
}
