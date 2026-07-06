import fs from "fs";
import path from "path";
import {
  paths,
  ensureDir,
  slugify,
  extractMessagesFromMapping,
  emptyDirectory,
  dateFromUnix,
  stableId,
  loadConversationExportFiles
} from "./helpers.js";

const p = paths();

ensureDir(p.normalizedDir);
ensureDir(p.indexDir);
ensureDir(p.brainDir);
ensureDir(p.reportsDir);

const loaded = loadConversationExportFiles(p.exportDir);

if (!loaded.files.length) {
  console.error("No ChatGPT conversation export files found in ../data/ChatGPT/export/.");
  console.error("Expected one of:");
  console.error("- conversations.json");
  console.error("- conversations-000.json, conversations-001.json, etc.");
  process.exit(1);
}

const conversations = loaded.conversations;

if (!conversations.length) {
  console.error("Conversation files were found, but no conversations could be parsed.");
  process.exit(1);
}

emptyDirectory(p.normalizedDir);

const index = [];
const verbatims = [];

for (const conv of conversations) {
  const id = stableId(conv);
  const title = conv.title || conv.name || "Untitled";
  const createTime = dateFromUnix(conv.create_time || conv.createTime || conv.created_at);
  const updateTime = dateFromUnix(conv.update_time || conv.updateTime || conv.updated_at);
  const messages = extractMessagesFromMapping(conv);

  const fileName = `${id}-${slugify(title)}.md`;
  const outPath = path.join(p.normalizedDir, fileName);

  const body = [
    "---",
    `id: ${id}`,
    `title: ${JSON.stringify(title)}`,
    `created: ${createTime}`,
    `updated: ${updateTime}`,
    "source: ChatGPT",
    "---",
    "",
    `# ${title}`,
    "",
    ...messages.flatMap((m, i) => [
      `## ${i + 1}. ${m.role}`,
      "",
      m.text,
      ""
    ])
  ].join("\n");

  fs.writeFileSync(outPath, body, "utf8");

  const searchableText = `${title}\n${messages.map(m => `${m.role}: ${m.text}`).join("\n")}`;

  messages.forEach((m, i) => {
    verbatims.push({
      conversation_id: id,
      title,
      created: createTime,
      updated: updateTime,
      source: "ChatGPT",
      path: path.relative(p.root, outPath),
      message_number: i + 1,
      role: m.role,
      text: m.text
    });
  });

  index.push({
    id,
    title,
    created: createTime,
    updated: updateTime,
    source: "ChatGPT",
    path: path.relative(p.root, outPath),
    message_count: messages.length,
    first_message: messages[0]?.text?.slice(0, 500) || "",
    last_message: messages[messages.length - 1]?.text?.slice(0, 500) || "",
    text: searchableText.slice(0, 500000)
  });
}

index.sort((a,b) => String(a.created).localeCompare(String(b.created)));

fs.writeFileSync(p.indexPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  source_files: loaded.files.map(f => path.relative(p.root, f)),
  conversation_count: index.length,
  records: index
}, null, 2), "utf8");

fs.writeFileSync(path.join(p.indexDir, "verbatims.json"), JSON.stringify({
  generated_at: new Date().toISOString(),
  message_count: verbatims.length,
  records: verbatims
}, null, 2), "utf8");

console.log(`Found ${loaded.files.length} conversation export file(s).`);
console.log(`Compiled ${index.length} conversations.`);
console.log(`Markdown: ${path.relative(p.root, p.normalizedDir)}`);
console.log(`Index: ${path.relative(p.root, p.indexPath)}`);
console.log(`Verbatims: ${path.relative(p.root, path.join(p.indexDir, "verbatims.json"))}`);
