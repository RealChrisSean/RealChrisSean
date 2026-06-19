import type { Mention, SearchContext, Source } from "../types.js";

// Mastodon status search — a free social proxy for the agent/infra crowd that
// the paid X API would otherwise gate. Caveat baked into config.ts: most
// instances require an access token for full-text status search (and the
// instance must have it enabled), so this source is OFF unless MASTODON_TOKEN is
// set. Create a token under Preferences > Development > New application
// (read:search scope is enough).
export function makeMastodon(instance: string, token: string): Source {
  const base = `https://${instance}/api/v2/search`;
  return {
    name: "mastodon",
    async search(ctx: SearchContext): Promise<Mention[]> {
      const out: Mention[] = [];
      for (const keyword of ctx.keywords) {
        const params = new URLSearchParams({
          q: keyword,
          type: "statuses",
          limit: "20",
        });
        const res = await fetch(`${base}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Mastodon search ${res.status}`);
        const data = (await res.json()) as { statuses: MastoStatus[] };

        for (const s of data.statuses) {
          out.push({
            id: `mastodon:${s.id}`,
            source: "mastodon",
            title: stripHtml(s.content).slice(0, 200),
            url: s.url,
            author: `@${s.account.acct}`,
            text: stripHtml(s.content).slice(0, 280),
            createdAt: s.created_at,
            score: s.favourites_count,
            matchType: "brand",
          });
        }
      }
      return out;
    },
  };
}

interface MastoStatus {
  id: string;
  url: string;
  content: string; // HTML
  created_at: string;
  favourites_count: number;
  account: { acct: string };
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}
