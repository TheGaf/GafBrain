import fs from "fs";
import path from "path";
import { readIndex, paths, ensureDir, searchRecords } from "./helpers.js";

const p = paths();
ensureDir(p.brainDir);

const index = readIndex();
const records = [...(index.records || [])].filter(r => r.created).sort((a,b) => String(a.created).localeCompare(String(b.created)));
const earliest = records[0];
const latest = records[records.length - 1];

const milestoneQueries = (process.argv.slice(2).join(" ") || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const lines = ["# HISTORY", "", "Generated from the current ChatGPT export.", ""];
if (earliest) {
  lines.push("## Earliest indexed conversation", "", `- Date: ${earliest.created}`, `- Title: ${earliest.title}`, `- Path: ${earliest.path}`, "");
}
if (latest) {
  lines.push("## Latest indexed conversation", "", `- Date: ${latest.created}`, `- Title: ${latest.title}`, `- Path: ${latest.path}`, "");
}

if (milestoneQueries.length) {
  lines.push("## Search milestones", "");
  for (const query of milestoneQueries) {
    const first = searchRecords(query, 50).map(r => r.rec).filter(r => r.created).sort((a,b) => String(a.created).localeCompare(String(b.created)))[0];
    if (first) lines.push(`- First ${query}: ${first.created.slice(0,10)} — ${first.title} (${first.path})`);
    else lines.push(`- First ${query}: not found in current index`);
  }
}

fs.writeFileSync(path.join(p.brainDir, "HISTORY.md"), lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${path.relative(p.root, path.join(p.brainDir, "HISTORY.md"))}`);
