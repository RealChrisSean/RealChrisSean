import type { Mention, SearchContext, Source } from "../types.js";

// Google News RSS: a free, no-key firehose of news/blog mentions. Not a social
// network, but it reliably catches write-ups, launch posts and press that the
// social APIs miss. We parse the RSS with small regexes to avoid pulling in an
// XML dependency.
const BASE = "https://news.google.com/rss/search";

export const googlenews: Source = {
  name: "googlenews",
  async search(ctx: SearchContext): Promise<Mention[]> {
    const out: Mention[] = [];
    for (const keyword of ctx.keywords) {
      // Quote the term so multi-token keywords match as a phrase.
      const params = new URLSearchParams({
        q: `"${keyword}"`,
        hl: "en-US",
        gl: "US",
        ceid: "US:en",
      });
      const res = await fetch(`${BASE}?${params}`);
      if (!res.ok) throw new Error(`Google News ${res.status}`);
      const xml = await res.text();

      for (const item of xml.split("<item>").slice(1)) {
        const title = unescapeXml(pick(item, "title"));
        const link = pick(item, "link");
        const pubDate = pick(item, "pubDate");
        const source = unescapeXml(pick(item, "source"));
        const guid = pick(item, "guid") || link;
        if (!link) continue;
        out.push({
          id: `googlenews:${hash(guid)}`,
          source: "googlenews",
          title: title.slice(0, 200),
          url: link,
          author: source || undefined,
          createdAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }
    return out;
  },
};

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return "";
  return m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// Tiny stable hash so the same article keeps the same id across runs.
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}
