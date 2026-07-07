import fs from "fs";
import path from "path";
import { paths, ensureDir } from "./helpers.js";

const p = paths();
const searchIndexPath = path.join(p.brainDir, "search-index.json");

if (!fs.existsSync(searchIndexPath)) {
  console.error("No Brain/search-index.json found. Run npm run compile:chatgpt first.");
  process.exit(1);
}

const idx = JSON.parse(fs.readFileSync(searchIndexPath, "utf8"));
const records = idx.records || [];

const clean = (s, n = 900) =>
  String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

const stop = new Set("the and for that this with from you your are was were have has had but not what when where why how can could would should about into like think really because conversation assistant user".split(" "));

function keywords(s) {
  return [...new Set((String(s || "").toLowerCase().match(/\b[a-z0-9][a-z0-9._-]{2,}\b/g) || []))]
    .filter(w => !stop.has(w))
    .slice(0, 40);
}

function domains(s) {
  return [...new Set((String(s || "").match(/\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+\b/gi) || []))]
    .map(x => x.toLowerCase())
    .slice(0, 25);
}

let out = `# GAFBRAIN_INDEX

This is the master searchable index for GafBrain.

AI assistants should read this file after \`LOOKUP_GUIDE.md\` when answering questions about past conversations, prior decisions, project history, preferences, domains, people, tools, or how thinking changed over time.

## How to use this Brain

1. Use \`LOOKUP_GUIDE.md\` as the routing guide.
2. Use \`timeline.json\`, \`timeline-YYYY.json\`, \`months/YYYY-MM.json\`, and \`monthly-stats.json\` for chronology.
3. Use \`search-index.json\` for topic search.
4. Use \`verbatims.json\` or \`verbatims/YYYY/YYYY-MM.json\` for exact dates, first mentions, original wording, and quotes.
5. Use \`ChatGPT/normalized/\` for full conversation context.
6. Separate archive evidence from synthesis.
7. If evidence is missing, say so.

Do not rely only on summaries for exact dates, quotes, first mentions, who said what, or timeline order.

Generated: ${new Date().toISOString()}
Conversation count: ${records.length}

## Conversations

`;

for (const r of records.slice().reverse()) {
  const hay = `${r.title}\n${r.first_message}\n${r.text}`;
  out += `### ${r.title || "Untitled"}

Ordinal: ${r.ordinal || "unknown"}
Date: ${r.created || r.updated || "unknown"}
Updated: ${r.updated || "unknown"}
Path: ${r.path}
Messages: ${r.message_count || "unknown"}
Domains: ${domains(hay).join(", ")}
Keywords: ${keywords(hay).join(", ")}

Summary / first text:
${clean(r.first_message || r.text, 1000)}

Search preview:
${clean(r.text, 1500)}

---

`;
}

ensureDir(p.brainDir);
fs.writeFileSync(path.join(p.brainDir, "GAFBRAIN_INDEX.md"), out, "utf8");
console.log(`Wrote ${path.relative(p.root, path.join(p.brainDir, "GAFBRAIN_INDEX.md"))}`);
