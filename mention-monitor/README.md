# Mention Monitor

A small, pluggable agent that watches **Hacker News, Reddit, Bluesky, and the
news** for mentions of your keywords (defaults: `fly.io`, `flydotio`) and pings
you on Slack or Discord. It runs for free on GitHub Actions cron — no server.

## How it works

```
keywords ──> [ sources ] ──> normalize ──> dedup (seen.json) ──> notify
             HN / Reddit       Mention[]      skip already-seen    Slack / Discord
             Bluesky / News                                        + console
```

- **Sources** are independent adapters (`src/sources/*`). Each takes the
  keywords and returns a normalized `Mention[]`. Add a platform by dropping in
  one file — nothing else needs to change.
- **Dedup** is a committed JSON file of seen ids (`state/seen.json`). The Action
  commits it back after each run, so you never get pinged twice. No database.
- **Delivery** goes to Slack and/or Discord webhooks if configured, and always
  to the console (visible in the Actions log).
- **First run** only surfaces items newer than `LOOKBACK_HOURS` so you don't get
  flooded with backlog.

## Platform reality (read this before adding sources)

| Platform        | Status | Notes |
|-----------------|--------|-------|
| **Hacker News** | ✅ free | Algolia search API, no key. |
| **Reddit**      | ✅ free | Public search JSON. Needs a real `User-Agent` (set). For higher limits, switch to the official OAuth API. |
| **Bluesky**     | ✅ free | Public AppView search, no auth. Great X stand-in for the dev crowd. |
| **Google News** | ✅ free | RSS — catches blogs/press the social APIs miss. |
| **X / Twitter** | 💲 paid | Search needs the Basic tier (~$100/mo). Adapter is built (`src/sources/twitter.ts`); set `TWITTER_BEARER_TOKEN` + `SOURCE_TWITTER=true`. There is **no** free read access anymore. |
| **LinkedIn**    | 🚫 no API | LinkedIn has no public search API and scraping breaks their ToS (and gets accounts/IPs banned). Don't build a scraper. Realistic options below. |

**For LinkedIn**, use one of:
- **Google Alerts** on `site:linkedin.com "fly.io"` (free, emails you).
- A paid social-listening tool (Brand24, Mention, Syften) that already has
  licensed LinkedIn access — then forward its webhook into `notify.ts`.

The Google News source above already catches a lot of LinkedIn-adjacent press
indirectly.

## Run it locally

```bash
cp .env.example .env      # edit keywords / webhooks
npm install
npm start
```

## Deploy on GitHub Actions (free, recommended)

The workflow at [`.github/workflows/mention-monitor.yml`](../.github/workflows/mention-monitor.yml)
runs hourly and commits dedup state back to the branch. Configure it under
**Settings → Secrets and variables → Actions**:

- **Variables:** `KEYWORDS` (e.g. `fly.io,flydotio`), optionally `SOURCE_TWITTER`.
- **Secrets:** `SLACK_WEBHOOK_URL` and/or `DISCORD_WEBHOOK_URL`, and
  `TWITTER_BEARER_TOKEN` if you pay for X.

Trigger a first run by hand from the **Actions** tab (`Run workflow`).

## Add a new source

Implement the `Source` interface and register it in `src/index.ts`:

```ts
import type { Mention, Source } from "../types.js";

export const lobsters: Source = {
  name: "lobsters",
  async search(keywords) {
    // fetch, map results to Mention[], return them
    return [];
  },
};
```

Good free candidates to add next: Lobsters, Mastodon (`/api/v2/search`),
YouTube Data API, GitHub code/issue search.
