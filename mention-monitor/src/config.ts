// All runtime config comes from environment variables so the same code runs
// locally (.env) and in GitHub Actions (repo secrets/vars) with zero changes.

export interface Config {
  keywords: string[]; // brand keywords
  topics: string[]; // ICP opportunity keywords
  subreddits: string[]; // subs to scope topic search to
  githubRepos: string[]; // owner/name slugs to scope GitHub search to
  mastodonInstance: string;
  sources: {
    hackernews: boolean;
    reddit: boolean;
    bluesky: boolean;
    googlenews: boolean;
    github: boolean;
    twitter: boolean; // off unless you have a paid X API token
    mastodon: boolean; // off unless you supply a Mastodon token
  };
  // How far back to consider a mention "new" on the very first run, in hours.
  // After that, the seen-id store does the real deduplication.
  lookbackHours: number;
  twitterBearerToken?: string;
  githubToken?: string;
  mastodonToken?: string;
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function list(value: string | undefined, fallback: string): string[] {
  return (value ?? fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadConfig(): Config {
  // Brand keywords. Defaults cover the fly.io variants plus the Sprites product
  // surface. We deliberately omit bare "Sprites" — it's far too noisy (game dev).
  const keywords = list(process.env.KEYWORDS, "fly.io,flydotio,sprites.dev,KiloClaw,fly machines");

  // Opportunity keywords: threads worth showing up in even without a brand
  // mention (e.g. the June 2026 Copilot billing migration wave).
  const topics = list(process.env.TOPICS, "copilot alternative,copilot pricing");

  const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
  const mastodonToken = process.env.MASTODON_TOKEN;

  return {
    keywords,
    topics,
    subreddits: list(process.env.SUBREDDITS, "AI_Agents,LLMDevs,LocalLLaMA,SaaS"),
    githubRepos: list(
      process.env.GITHUB_REPOS,
      "All-Hands-AI/OpenHands,cline/cline,crewAIInc/crewAI",
    ),
    mastodonInstance: process.env.MASTODON_INSTANCE ?? "fosstodon.org",
    sources: {
      hackernews: bool(process.env.SOURCE_HACKERNEWS, true),
      reddit: bool(process.env.SOURCE_REDDIT, true),
      bluesky: bool(process.env.SOURCE_BLUESKY, true),
      googlenews: bool(process.env.SOURCE_GOOGLENEWS, true),
      github: bool(process.env.SOURCE_GITHUB, true),
      // Twitter only turns on if you explicitly enable it AND supply a token.
      twitter: bool(process.env.SOURCE_TWITTER, false) && !!twitterBearerToken,
      // Mastodon status search needs an access token (most instances require
      // auth for full-text search), so it's off unless a token is present.
      mastodon: bool(process.env.SOURCE_MASTODON, false) && !!mastodonToken,
    },
    lookbackHours: Number(process.env.LOOKBACK_HOURS ?? "24"),
    twitterBearerToken,
    githubToken: process.env.GITHUB_TOKEN,
    mastodonToken,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  };
}
