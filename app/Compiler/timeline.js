import fs from "fs";
import path from "path";
import { readIndex, paths, ensureDir } from "./helpers.js";

const p = paths();
ensureDir(p.brainDir);

const index = readIndex();
const records = [...(index.records || [])].filter(r => r.created || r.updated).sort((a,b) => String(a.created || a.updated).localeCompare(String(b.created || b.updated)));

const lines = ["# TIMELINE", "", "Generated from the current ChatGPT export.", ""];
for (const rec of records) {
  const date = (rec.created || rec.updated || "").slice(0, 10) || "unknown-date";
  lines.push(`- ${date}: ${rec.title} (${rec.path})`);
}
fs.writeFileSync(path.join(p.brainDir, "TIMELINE.md"), lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${path.relative(p.root, path.join(p.brainDir, "TIMELINE.md"))}`);
