import { searchRecords, readConversationMarkdown, excerptAround } from "./helpers.js";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error('Usage: npm run recall -- "topic"');
  process.exit(1);
}

const results = searchRecords(query, 8);
console.log(`# Recall: ${query}`);
console.log("");

for (const { score, rec } of results) {
  const md = readConversationMarkdown(rec);
  const excerpt = excerptAround(md || rec.text || "", query, 1200).replace(/\n{3,}/g, "\n\n");
  console.log(`## ${rec.title}`);
  console.log(`Score: ${score}`);
  console.log(`Created: ${rec.created || "unknown"}`);
  console.log(`Updated: ${rec.updated || "unknown"}`);
  console.log(`Path: ${rec.path}`);
  console.log("");
  console.log(excerpt);
  console.log("\n---\n");
}
