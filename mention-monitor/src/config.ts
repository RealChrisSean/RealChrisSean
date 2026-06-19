// All runtime config comes from environment variables so the same code runs
// locally (.env) and in GitHub Actions (repo secrets) with zero changes.

export interface Config {
  keywords: string[];
  sources: {
    hackernews: boolean;
    reddit: boolean;
    bluesky: boolean;
    googlenews: boolean;
    twitter: boolean; // off unless you have a paid X API token
  };
  // How far back to consider a mention "new" on the very first run, in hours.
  // After that, the seen-id store does the real deduplication.
  lookbackHours: number;
  twitterBearerToken?: string;
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function loadConfig(): Config {
  // Comma-separated. Defaults to the fly.io variants the task asked for.
  const keywords = (process.env.KEYWORDS ?? "fly.io,flydotio")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;

  return {
    keywords,
    sources: {
      hackernews: bool(process.env.SOURCE_HACKERNEWS, true),
      reddit: bool(process.env.SOURCE_REDDIT, true),
      bluesky: bool(process.env.SOURCE_BLUESKY, true),
      googlenews: bool(process.env.SOURCE_GOOGLENEWS, true),
      // Twitter only turns on if you explicitly enable it AND supply a token.
      twitter: bool(process.env.SOURCE_TWITTER, false) && !!twitterBearerToken,
    },
    lookbackHours: Number(process.env.LOOKBACK_HOURS ?? "24"),
    twitterBearerToken,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  };
}
