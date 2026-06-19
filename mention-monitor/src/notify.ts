import type { Mention } from "./types.js";
import type { Config } from "./config.js";

// Delivery layer. Sends a digest of new items to Slack and/or Discord if their
// webhook URLs are configured, and always prints to the console (which is what
// shows up in the GitHub Actions run log).
//
// The digest is split into two sections so the two jobs never blur together:
//   Mentions      — someone named you (brand keywords).
//   Opportunities — ICP threads to go engage in (topic keywords).

export async function notify(items: Mention[], config: Config): Promise<void> {
  if (items.length === 0) {
    console.log("No new items this run.");
    return;
  }

  const brand = items.filter((m) => (m.matchType ?? "brand") === "brand");
  const topics = items.filter((m) => m.matchType === "topic");
  byNewest(brand);
  byNewest(topics);

  // Console output (Actions log).
  if (brand.length) {
    console.log(`\nMentions (${brand.length}):\n`);
    for (const m of brand) printItem(m);
  }
  if (topics.length) {
    console.log(`\nOpportunities (${topics.length}):\n`);
    for (const m of topics) printItem(m);
  }

  const tasks: Promise<unknown>[] = [];
  if (config.slackWebhookUrl) tasks.push(postSlack(config.slackWebhookUrl, brand, topics));
  if (config.discordWebhookUrl) tasks.push(postDiscord(config.discordWebhookUrl, brand, topics));
  await Promise.allSettled(tasks);
}

function byNewest(items: Mention[]): void {
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function printItem(m: Mention): void {
  console.log(`• [${m.source}] ${m.title}`);
  console.log(`  ${m.url}`);
  if (m.author) console.log(`  by ${m.author}`);
}

async function postSlack(url: string, brand: Mention[], topics: Mention[]): Promise<void> {
  const section = (items: Mention[]) =>
    items
      .slice(0, 25)
      .map((m) => `• *${m.source}* — <${m.url}|${escape(m.title)}>`)
      .join("\n");
  const parts: string[] = [];
  if (brand.length) parts.push(`:satellite: *Mentions (${brand.length})*\n${section(brand)}`);
  if (topics.length) parts.push(`:dart: *Opportunities (${topics.length})*\n${section(topics)}`);
  await post(url, { text: parts.join("\n\n") });
}

async function postDiscord(url: string, brand: Mention[], topics: Mention[]): Promise<void> {
  const section = (items: Mention[]) =>
    items
      .slice(0, 15)
      .map((m) => `• **${m.source}** — [${escape(m.title)}](${m.url})`)
      .join("\n");
  const parts: string[] = [];
  if (brand.length) parts.push(`📡 **Mentions (${brand.length})**\n${section(brand)}`);
  if (topics.length) parts.push(`🎯 **Opportunities (${topics.length})**\n${section(topics)}`);
  await post(url, { content: parts.join("\n\n").slice(0, 1900) });
}

async function post(url: string, body: unknown): Promise<void> {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function escape(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}
