import { readIndex, searchRecords } from "./helpers.js";

const question = process.argv.slice(2).join(" ").trim();
if (!question) {
  console.error('Usage: npm run ask -- "question"');
  process.exit(1);
}

const q = question.toLowerCase();
const index = readIndex();
const records = index.records || [];

if (q.includes("when") && (q.includes("meet") || q.includes("first"))) {
  const earliest = [...records].filter(r => r.created).sort((a,b) => String(a.created).localeCompare(String(b.created)))[0];
  if (earliest) {
    console.log(`Earliest indexed conversation:`);
    console.log(`Date: ${earliest.created}`);
    console.log(`Title: ${earliest.title}`);
    console.log(`Path: ${earliest.path}`);
    console.log(`First text: ${earliest.first_message || "(no preview)"}`);
    process.exit(0);
  }
}

const results = searchRecords(question, 5);
console.log(`# Best matches for: ${question}`);
for (const { score, rec } of results) {
  console.log(`\n[${score}] ${rec.title}`);
  console.log(`Created: ${rec.created || "unknown"}`);
  console.log(`Updated: ${rec.updated || "unknown"}`);
  console.log(`Path: ${rec.path}`);
}
