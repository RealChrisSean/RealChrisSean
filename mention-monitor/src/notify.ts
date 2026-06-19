import type { Mention } from "./types.js";
import type { Config } from "./config.js";

// Delivery layer. Sends a digest of new mentions to Slack and/or Discord if
// their webhook URLs are configured, and always prints to the console (which is
// what shows up in the GitHub Actions run log).

export async function notify(mentions: Mention[], config: Config): Promise<void> {
  if (mentions.length === 0) {
    console.log("No new mentions this run.");
    return;
  }

  // Newest first.
  mentions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  console.log(`\n${mentions.length} new mention(s):\n`);
  for (const m of mentions) {
    console.log(`• [${m.source}] ${m.title}`);
    console.log(`  ${m.url}`);
    if (m.author) console.log(`  by ${m.author}`);
  }

  const tasks: Promise<unknown>[] = [];
  if (config.slackWebhookUrl) {
    tasks.push(postSlack(config.slackWebhookUrl, mentions));
  }
  if (config.discordWebhookUrl) {
    tasks.push(postDiscord(config.discordWebhookUrl, mentions));
  }
  await Promise.allSettled(tasks);
}

async function postSlack(url: string, mentions: Mention[]): Promise<void> {
  const lines = mentions
    .slice(0, 30)
    .map((m) => `• *${m.source}* — <${m.url}|${escape(m.title)}>`)
    .join("\n");
  const text = `:satellite: *${mentions.length} new mention(s)*\n${lines}`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

async function postDiscord(url: string, mentions: Mention[]): Promise<void> {
  const lines = mentions
    .slice(0, 20)
    .map((m) => `• **${m.source}** — [${escape(m.title)}](${m.url})`)
    .join("\n");
  const content = `📡 **${mentions.length} new mention(s)**\n${lines}`.slice(0, 1900);
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

function escape(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}
