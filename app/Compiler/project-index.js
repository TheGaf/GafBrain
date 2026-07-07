import fs from "fs";
import path from "path";
import { paths, searchRecords, ensureDir } from "./helpers.js";

const p = paths();
ensureDir(p.brainDir);

const projectTerms = (process.argv.slice(2).join(" ") || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const lines = ["# PROJECT_INDEX", "", "Generated from the current ChatGPT export.", ""];

if (!projectTerms.length) {
  lines.push("No project terms were supplied.", "", "Run:", "", "```bash", "npm run projects -- \"Project One, Project Two, Project Three\"", "```", "");
} else {
  for (const project of projectTerms) {
    lines.push(`## ${project}`, "");
    const matches = searchRecords(project, 10).map(r => r.rec);
    if (!matches.length) lines.push("No indexed matches yet.", "");
    else {
      for (const rec of matches) lines.push(`- ${rec.created || rec.updated || "unknown"} — ${rec.title} (${rec.path})`);
      lines.push("");
    }
  }
}

fs.writeFileSync(path.join(p.brainDir, "PROJECT_INDEX.md"), lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(p.root, path.join(p.brainDir, "PROJECT_INDEX.md"))}`);
