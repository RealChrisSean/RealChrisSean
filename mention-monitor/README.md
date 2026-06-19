# Mention Monitor

A small, pluggable agent that watches **Hacker News, Reddit, Bluesky, GitHub, and
the news** for mentions of your keywords (defaults: `fly.io`, `flydotio`,
`sprites.dev`, `KiloClaw`, `fly machines`) and pings you on Slack or Discord. It
runs for free on GitHub Actions cron — no server.

It tracks two things at once:
- **Mentions** — someone named you (brand keywords).
- **Opportunities** — ICP threads worth showing up in even without a brand
  mention (topic keywords, scoped to the right communities). See
  [`communities.md`](./communities.md) for the prioritized target list.

## How it works

```
keywords + topics ──> [ sources ] ──> normalize ──> dedup (seen.json) ──> notify
                      HN / Reddit       Mention[]     skip already-seen   Slack / Discord
                      Bluesky / News                  (brand vs topic)    + console
                      GitHub
```

- **Sources** are independent adapters (`src/sources/*`). Each takes a
  `SearchContext` and returns a normalized `Mention[]`. Add a platform by
  dropping in one file — nothing else needs to change.
- **Match types** — every mention is tagged `brand` or `topic`, and the digest
  splits into **Mentions** vs **Opportunities** so the two never blur.
- **Dedup** is a committed JSON file of seen ids (`state/seen.json`). The Action
  commits it back after each run, so you never get pinged twice. No database.
- **Delivery** goes to Slack and/or Discord webhooks if configured, and always
  to the console (visible in the Actions log).
- **First run** only surfaces items newer than `LOOKBACK_HOURS` so you don't get
  flooded with backlog.

## Platform reality (read this before adding sources)

| Platform        | Status | Notes |
|-----------------|--------|-------|
| **Hacker News** | ✅ free | Algolia search API, no key. Runs brand + topic queries. |
| **Reddit**      | ✅ free | Brand keywords site-wide; topics scoped to `SUBREDDITS`. Needs a real `User-Agent` (set). |
| **Bluesky**     | ✅ free | Public AppView search, no auth. Great X stand-in for the dev crowd. |
| **GitHub**      | ✅ free | Issue/PR search scoped to `GITHUB_REPOS` (OpenHands/Cline/crewAI). The highest-ICP source. `GITHUB_TOKEN` raises the rate limit. |
| **Google News** | ✅ free | RSS — catches blogs/press the social APIs miss. |
| **Mastodon**    | 🔑 token | Free, but status search needs an access token (`read:search`). Off until `MASTODON_TOKEN` is set. |
| **X / Twitter** | 💲 paid | Search needs the Basic tier (~$100/mo). Adapter built (`src/sources/twitter.ts`); set `TWITTER_BEARER_TOKEN` + `SOURCE_TWITTER=true`. No free read access. |
| **Discord**     | 🚫 no API | No public search API; a bot must be added to each server by an admin and run as a long-lived listener (doesn't fit cron). Treat the Tier-1/2 servers in `communities.md` as "show up manually." |
| **LinkedIn**    | 🚫 no API | No public search API; scraping breaks ToS. Use a Google Alert or paid listening tool instead. |

**For LinkedIn**, use a **Google Alert** on `site:linkedin.com "fly.io"` (free,
emails you) or a paid social-listening tool (Brand24, Mention, Syften) — then
forward its webhook into `notify.ts`. The Google News source already catches a
lot of press indirectly.

## Run it locally

```bash
cp .env.example .env      # edit keywords / topics / webhooks
npm install
npm start
```

## Deploy on GitHub Actions (free, recommended)

The workflow at [`../.github/workflows/mention-monitor.yml`](../.github/workflows/mention-monitor.yml)
runs hourly and commits dedup state back to the branch. Configure it under
**Settings → Secrets and variables → Actions**:

- **Variables:** `KEYWORDS`, `TOPICS`, `SUBREDDITS`, `GITHUB_REPOS`, optionally
  `SOURCE_TWITTER` / `SOURCE_MASTODON` / `MASTODON_INSTANCE`.
- **Secrets:** `SLACK_WEBHOOK_URL` and/or `DISCORD_WEBHOOK_URL`; plus
  `TWITTER_BEARER_TOKEN` (paid X) and `MASTODON_TOKEN` if you enable those.
  (`GITHUB_TOKEN` is provided automatically by Actions.)

Trigger a first run by hand from the **Actions** tab (`Run workflow`).

## Add a new source

Implement the `Source` interface and register it in `src/index.ts`:

```ts
import type { Mention, SearchContext, Source } from "../types.js";

export const example: Source = {
  name: "example",
  async search(ctx: SearchContext): Promise<Mention[]> {
    // use ctx.keywords / ctx.topics, fetch, map to Mention[] (set matchType)
    return [];
  },
};
```

Good free candidates to add next: YouTube Data API, GitHub Discussions (GraphQL),
additional Mastodon instances.
