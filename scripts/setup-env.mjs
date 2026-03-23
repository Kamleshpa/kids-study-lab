#!/usr/bin/env node
/**
 * Creates .env.local from .env.example if it doesn't exist yet.
 * Run: npm run setup
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const example = path.join(root, ".env.example");
const local = path.join(root, ".env.local");

if (!fs.existsSync(example)) {
  console.error("Missing .env.example in project root.");
  process.exit(1);
}

if (fs.existsSync(local)) {
  console.log("✓ .env.local already exists — edit it to add your API keys.");
  console.log(`  ${local}`);
  process.exit(0);
}

fs.copyFileSync(example, local);
console.log("✓ Created .env.local from .env.example");
console.log("");
console.log("Next steps:");
console.log("  1. Open .env.local in a text editor.");
console.log("  2. Paste your LLM_API_KEY= (see README → Get an API key).");
console.log("  3. Run: npm install && npm run dev");
console.log("");
