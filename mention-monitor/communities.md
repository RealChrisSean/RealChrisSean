# Communities to monitor & show up in

Operationalizes the coding-agent / agent-framework research. Priority is by
**ICP fit** (people building agentic products that hit compute + persistence +
multi-tenant pain), not raw volume.

Discord invite links are intentionally left blank — paste the real, verified
invite yourself (I won't guess URLs). Subreddit and repo links are deterministic
and filled in. Discord servers are **not** auto-monitored (no public search API;
a bot would need a server admin to add it) — treat those rows as "show up
manually."

## Tier 1 — highest ICP fit (people building agentic products)

| Community | Type | Link | Auto-monitored? | Notes |
|---|---|---|---|---|
| OpenHands | Discord | _(paste invite)_ | manual | KiloClaw (the ICP archetype) is built on it. |
| OpenHands | GitHub | https://github.com/All-Hands-AI/OpenHands | ✅ github source | Watched for brand mentions. |
| Cline | Discord | _(paste invite)_ | manual | Huge VS Code agent-builder crowd. |
| Cline | GitHub | https://github.com/cline/cline | ✅ github source | |
| Roo Code | Discord | _(paste invite)_ | manual | Cline fork, very active. |
| crewAI | Discord | _(paste invite)_ | manual | Multi-agent framework builders (the Sprites 2.0 coordination story). |
| crewAI | GitHub | https://github.com/crewAIInc/crewAI | ✅ github source | |

## Tier 2 — infra-savvy / CLI crowd (close to the Sprites story)

| Community | Type | Link | Auto-monitored? | Notes |
|---|---|---|---|---|
| Aider | Discord | _(paste invite)_ | manual | Terminal agent crowd. |
| Goose | Discord | _(paste invite)_ | manual | Block's CLI agent. |
| OpenCode | Discord | _(paste invite)_ | manual | |
| AutoGen | Discord | _(paste invite)_ | manual | Agent-framework builders. |
| Pydantic AI | Discord | _(paste invite)_ | manual | |

## Tier 3 — high volume, more hobbyist (reach, lower ICP depth)

| Community | Type | Link | Auto-monitored? | Notes |
|---|---|---|---|---|
| Cursor | Discord | _(paste invite)_ | manual | Massive, app-builder/vibe-coder leaning. |
| Windsurf | Discord | _(paste invite)_ | manual | Same shape as Cursor. |

## Reddit (auto-monitored — see `SUBREDDITS`)

Brand mentions are caught site-wide; `TOPICS` are scoped to these subs.

- r/AI_Agents — https://www.reddit.com/r/AI_Agents
- r/LLMDevs — https://www.reddit.com/r/LLMDevs
- r/LocalLLaMA — https://www.reddit.com/r/LocalLLaMA
- r/SaaS — https://www.reddit.com/r/SaaS

## Hacker News (auto-monitored)

- Brand mentions via the `hackernews` source.
- Opportunity threads via `TOPICS` — e.g. the June 2026 Copilot billing
  migration wave and "Show HN" agent launches.

## Lobsters (manual)

No reliable JSON search API (would require fragile HTML scraping), so it's not
an automated source. Check manually: https://lobste.rs/search

## Not monitored (by design)

- **LinkedIn** — no public search API; scraping breaks ToS. Use a Google Alert
  on `site:linkedin.com "fly.io"` or a paid listening tool instead.
- **X / Twitter** — search is paid (Basic tier ~$100/mo). The adapter exists but
  is off until you supply `TWITTER_BEARER_TOKEN`. Bluesky + Mastodon are the free
  proxies.
