import { searchRecords, excerptAround } from "./helpers.js";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error('Usage: npm run search -- "search terms"');
  process.exit(1);
}

const results = searchRecords(query, 20);

for (const { score, rec } of results) {
  const snippet = excerptAround(rec.text || "", query, 800).replace(/\s+/g, " ");
  console.log(`\n[${score}] ${rec.title}`);
  console.log(`Path: ${rec.path}`);
  console.log(`Created: ${rec.created || "unknown"}`);
  console.log(`Updated: ${rec.updated || "unknown"}`);
  console.log(`Messages: ${rec.message_count || "unknown"}`);
  console.log(`Snippet: ${snippet}`);
}
if (!results.length) console.log("No matches.");
