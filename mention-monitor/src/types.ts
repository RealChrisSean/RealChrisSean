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
}

// Every platform adapter implements this. Keep it tiny on purpose: a source
// takes the keywords and returns normalized mentions. Dedup, scheduling and
// delivery are all handled by the core, not the source.
export interface Source {
  name: string;
  // `search` should be resilient: a failure in one source must never take the
  // whole run down, so throw freely here — the core catches per-source.
  search(keywords: string[]): Promise<Mention[]>;
}
