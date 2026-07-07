import fs from "fs";
import path from "path";
import { paths, ensureDir, searchRecords, readConversationMarkdown, excerptAround } from "./helpers.js";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error('Usage: npm run context -- "question or topic"');
  process.exit(1);
}

const p = paths();
ensureDir(p.reportsDir);

const results = searchRecords(query, 10);
const outPath = path.join(p.reportsDir, "context-pack.md");

const lines = [
  "# GafBrain Context Pack",
  "",
  `Query: ${query}`,
  `Generated: ${new Date().toISOString()}`,
  "",
  "Use this as retrieved context for an AI conversation. It is not the whole archive; it is the most relevant slice.",
  "",
  "## Retrieved Conversations",
  ""
];

for (const { score, rec } of results) {
  const md = readConversationMarkdown(rec);
  const excerpt = excerptAround(md || rec.text || "", query, 1800);
  lines.push(`### ${rec.title}`);
  lines.push("");
  lines.push(`- Score: ${score}`);
  lines.push(`- Created: ${rec.created || "unknown"}`);
  lines.push(`- Updated: ${rec.updated || "unknown"}`);
  lines.push(`- Path: ${rec.path}`);
  lines.push("");
  lines.push("```text");
  lines.push(excerpt);
  lines.push("```");
  lines.push("");
}

fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(p.root, outPath)}`);
