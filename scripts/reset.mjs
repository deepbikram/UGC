#!/usr/bin/env node
// Wipes the database and every upload. There is no undo.
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

if (!process.argv.includes("--yes")) {
  console.log(`
  This deletes data/portico.db and every file in data/uploads.
  Nothing is recoverable afterwards.

  Run it again with --yes if that is what you want:

    npm run reset -- --yes
`);
  process.exit(1);
}

fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });
console.log("→ data/ cleared. Run `npm run setup` to start again.");
