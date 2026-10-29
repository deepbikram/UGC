#!/usr/bin/env node
// Wipes every table and every upload. There is no undo.
import fs from "node:fs";
import path from "node:path";
import { q, close } from "./pg.mjs";

const dataDir = path.join(process.cwd(), "data");

if (!process.argv.includes("--yes")) {
  console.log(`
  This deletes every row in the Supabase database and every file in data/uploads.
  Nothing is recoverable afterwards.

  Run it again with --yes if that is what you want:

    npm run reset -- --yes
`);
  process.exit(1);
}

await q("TRUNCATE users, settings RESTART IDENTITY CASCADE");
await close();

fs.rmSync(path.join(dataDir, "uploads"), { recursive: true, force: true });
fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });
console.log("→ Database truncated and data/uploads cleared. Run `npm run setup` to start again.");
