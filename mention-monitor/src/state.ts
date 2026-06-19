import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// The dedup store. It is deliberately just a JSON file of seen mention ids:
// no database to run, and on GitHub Actions the workflow commits it back to the
// branch so state survives between scheduled runs.
//
// We keep ids forever-ish but cap the file so it can't grow without bound.
const MAX_IDS = 5000;

export class SeenStore {
  private ids = new Set<string>();

  constructor(private path: string) {}

  async load(): Promise<void> {
    try {
      const raw = await readFile(this.path, "utf8");
      const parsed = JSON.parse(raw) as string[];
      this.ids = new Set(parsed);
    } catch {
      // First run, or file missing/corrupt — start clean.
      this.ids = new Set();
    }
  }

  has(id: string): boolean {
    return this.ids.has(id);
  }

  // Zero known ids means this is a cold start (first run / fresh checkout).
  get size(): number {
    return this.ids.size;
  }

  add(id: string): void {
    this.ids.add(id);
  }

  async save(): Promise<void> {
    // Keep only the most recent ids. Sets preserve insertion order, and we add
    // new mentions last, so slicing from the end keeps the freshest.
    const all = [...this.ids];
    const trimmed = all.slice(Math.max(0, all.length - MAX_IDS));
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(trimmed, null, 0));
  }
}
