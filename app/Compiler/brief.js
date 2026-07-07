import fs from "fs";
import path from "path";
import { paths, ensureDir, searchRecords, readConversationMarkdown, excerptAround } from "./helpers.js";

const topic = process.argv.slice(2).join(" ").trim();
if (!topic) {
  console.error('Usage: npm run brief -- "topic"');
  process.exit(1);
}

const p = paths();
ensureDir(p.reportsDir);

const results = searchRecords(topic, 12);
const outPath = path.join(p.reportsDir, "brief.md");

const lines = [
  `# Brief: ${topic}`,
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## What GafBrain found",
  ""
];

if (!results.length) {
  lines.push("No matching conversations found.");
} else {
  lines.push(`Found ${results.length} relevant conversations.`);
  lines.push("");
}

lines.push("## Timeline");
lines.push("");

for (const { score, rec } of [...results].sort((a,b)=>String(a.rec.created).localeCompare(String(b.rec.created)))) {
  lines.push(`- ${rec.created || rec.updated || "unknown"} — ${rec.title} (${rec.path}) [score ${score}]`);
}

lines.push("");
lines.push("## Key excerpts");
lines.push("");

for (const { score, rec } of results.slice(0, 5)) {
  const md = readConversationMarkdown(rec);
  const excerpt = excerptAround(md || rec.text || "", topic, 1200);
  lines.push(`### ${rec.title}`);
  lines.push("");
  lines.push(`Path: ${rec.path}`);
  lines.push("");
  lines.push("```text");
  lines.push(excerpt);
  lines.push("```");
  lines.push("");
}

fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(p.root, outPath)}`);
