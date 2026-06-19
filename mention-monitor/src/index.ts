import { loadConfig } from "./config.js";
import { SeenStore } from "./state.js";
import { notify } from "./notify.js";
import type { Mention, Source } from "./types.js";

import { hackernews } from "./sources/hackernews.js";
import { reddit } from "./sources/reddit.js";
import { bluesky } from "./sources/bluesky.js";
import { googlenews } from "./sources/googlenews.js";
import { makeTwitter } from "./sources/twitter.js";

const STATE_PATH = process.env.STATE_PATH ?? "state/seen.json";

async function main(): Promise<void> {
  const config = loadConfig();
  console.log(`Keywords: ${config.keywords.join(", ")}`);

  // Assemble the enabled sources.
  const sources: Source[] = [];
  if (config.sources.hackernews) sources.push(hackernews);
  if (config.sources.reddit) sources.push(reddit);
  if (config.sources.bluesky) sources.push(bluesky);
  if (config.sources.googlenews) sources.push(googlenews);
  if (config.sources.twitter && config.twitterBearerToken) {
    sources.push(makeTwitter(config.twitterBearerToken));
  }
  console.log(`Sources: ${sources.map((s) => s.name).join(", ") || "(none)"}`);

  const seen = new SeenStore(STATE_PATH);
  await seen.load();
  const firstRun = seen.size === 0;
  const cutoff = Date.now() - config.lookbackHours * 3600_000;

  // Run sources concurrently; one failing source must not sink the run.
  const results = await Promise.allSettled(
    sources.map((s) => s.search(config.keywords)),
  );

  const fresh: Mention[] = [];
  results.forEach((result, i) => {
    const name = sources[i].name;
    if (result.status === "rejected") {
      console.error(`! ${name} failed: ${result.reason}`);
      return;
    }
    for (const m of result.value) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      // On the very first run there's no history, so only surface recent items
      // to avoid dumping months of backlog into your channel.
      if (firstRun && new Date(m.createdAt).getTime() < cutoff) continue;
      fresh.push(m);
    }
  });

  await notify(fresh, config);
  await seen.save();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
