import { readIndex } from "./helpers.js";

const index = readIndex();
console.log(`# GafBrain Index Summary`);
console.log(`Generated: ${index.generated_at}`);
console.log(`Conversations: ${index.conversation_count}`);
if (index.source_files) console.log(`Source files: ${index.source_files.length}`);

const sorted = [...(index.records || [])].sort((a,b) => String(b.updated).localeCompare(String(a.updated)));
console.log("\nMost recent:");
for (const rec of sorted.slice(0, 10)) console.log(`- ${rec.updated || "unknown"} — ${rec.title} (${rec.path})`);

const earliest = [...(index.records || [])].filter(r => r.created).sort((a,b)=>String(a.created).localeCompare(String(b.created)))[0];
if (earliest) {
  console.log("\nEarliest:");
  console.log(`- ${earliest.created} — ${earliest.title} (${earliest.path})`);
}
