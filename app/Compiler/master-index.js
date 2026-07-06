import fs from "fs";

const idx = JSON.parse(fs.readFileSync("../data/Index/search-index.json", "utf8"));
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

AI assistants should read this file first when answering questions about past conversations, prior decisions, project history, preferences, domains, people, tools, or how thinking changed over time.

## How to use this Brain

1. Use this file as the high-level map.
2. Use data/Index/search-index.json for topic search.
3. Use data/Index/verbatims.json for exact dates, first mentions, original wording, and quotes.
4. Use data/ChatGPT/normalized/ for full conversation context.
5. Separate archive evidence from synthesis.
6. If evidence is missing, say so.

Do not rely only on summaries for exact dates, quotes, first mentions, who said what, or timeline order.

Generated: ${new Date().toISOString()}
Conversation count: ${records.length}

## Conversations

`;

for (const r of records.slice().reverse()) {
  const hay = `${r.title}\n${r.first_message}\n${r.text}`;
  out += `### ${r.title || "Untitled"}

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

fs.writeFileSync("../GAFBRAIN_INDEX.md", out);
fs.writeFileSync("../data/Brain/GAFBRAIN_INDEX.md", out);
console.log("Wrote ../GAFBRAIN_INDEX.md");
console.log("Wrote data/Brain/GAFBRAIN_INDEX.md");
