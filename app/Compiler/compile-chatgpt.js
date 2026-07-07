import fs from "fs";
import path from "path";
import {
  paths,
  ensureDir,
  slugify,
  extractMessagesFromMapping,
  emptyDirectory,
  removeGeneratedBrainOutputs,
  dateFromUnix,
  stableId,
  loadConversationExportFiles,
  writeJson,
  installTemplates
} from "./helpers.js";

const p = paths();
const generatedAt = new Date().toISOString();

ensureDir(p.rawDir);
ensureDir(p.exportDir);
ensureDir(p.brainDir);
ensureDir(p.archiveDir);
ensureDir(p.releasesDir);

// Safety: clear only generated Brain outputs. Raw is sacred and never deleted.
removeGeneratedBrainOutputs(p);

ensureDir(p.normalizedDir);
ensureDir(p.reportsDir);
ensureDir(p.projectsDir);
ensureDir(p.sessionsDir);
installTemplates();

const loaded = loadConversationExportFiles(p.exportDir);

if (!loaded.files.length) {
  console.error(`No ChatGPT conversation export files found in ${path.relative(p.root, p.exportDir)}.`);
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
let totalMessageCount = 0;

for (const conv of conversations) {
  const id = stableId(conv);
  const title = conv.title || conv.name || "Untitled";
  const createTime = dateFromUnix(conv.create_time || conv.createTime || conv.created_at);
  const updateTime = dateFromUnix(conv.update_time || conv.updateTime || conv.updated_at);
  const messages = extractMessagesFromMapping(conv);
  totalMessageCount += messages.length;

  const fileName = `${id}-${slugify(title)}.md`;
  const outPath = path.join(p.normalizedDir, fileName);
  const archivePath = path.relative(p.root, outPath);

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
      path: archivePath,
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
    path: archivePath,
    message_count: messages.length,
    first_message: messages[0]?.text?.slice(0, 500) || "",
    last_message: messages[messages.length - 1]?.text?.slice(0, 500) || "",
    text: searchableText.slice(0, 500000)
  });
}

const safeDate = (rec) => rec.created || rec.updated || "9999-12-31T23:59:59Z";
index.sort((a, b) => safeDate(a).localeCompare(safeDate(b)));
index.forEach((rec, i) => { rec.ordinal = i + 1; });

const ordinalById = new Map(index.map(rec => [rec.id, rec.ordinal]));
verbatims.forEach(v => { v.conversation_ordinal = ordinalById.get(v.conversation_id) || null; });

const timeline = index.map(rec => {
  const timestamp = rec.created || rec.updated || "";
  const date = timestamp ? timestamp.slice(0, 10) : "";
  const year = date ? Number(date.slice(0, 4)) : null;
  const month = date ? Number(date.slice(5, 7)) : null;
  const day = date ? Number(date.slice(8, 10)) : null;

  return {
    ordinal: rec.ordinal,
    date,
    year,
    month,
    day,
    created: rec.created,
    updated: rec.updated,
    title: rec.title,
    path: rec.path,
    message_count: rec.message_count,
    first_message: rec.first_message
  };
});

const timelineMd = [
  "# CONVERSATION_TIMELINE",
  "",
  `Generated: ${generatedAt}`,
  `Conversation count: ${timeline.length}`,
  "",
  ...timeline.map(rec =>
    `## #${rec.ordinal} — ${rec.title}\n\nDate: ${rec.created || "unknown"}\nUpdated: ${rec.updated || "unknown"}\nPath: ${rec.path}\nMessages: ${rec.message_count || "unknown"}\n\nFirst text:\n${rec.first_message || ""}\n`
  )
].join("\n");

const searchIndexPayload = {
  generated_at: generatedAt,
  source_files: loaded.files.map(f => path.relative(p.root, f)),
  conversation_count: index.length,
  message_count: totalMessageCount,
  records: index
};

const verbatimsPayload = {
  generated_at: generatedAt,
  message_count: verbatims.length,
  records: verbatims
};

const timelinePayload = {
  generated_at: generatedAt,
  conversation_count: timeline.length,
  records: timeline
};

// Canonical AI-facing files live in Brain.
writeJson(path.join(p.brainDir, "search-index.json"), searchIndexPayload);
writeJson(path.join(p.brainDir, "verbatims.json"), verbatimsPayload);
writeJson(path.join(p.brainDir, "timeline.json"), timelinePayload);
fs.writeFileSync(path.join(p.brainDir, "CONVERSATION_TIMELINE.md"), timelineMd, "utf8");

// Split timeline into yearly and monthly files for AI retrieval.
const timelineByYear = {};
const timelineByMonth = {};

for (const rec of timeline) {
  if (rec.year) {
    if (!timelineByYear[rec.year]) timelineByYear[rec.year] = [];
    timelineByYear[rec.year].push(rec);
  }
  if (rec.year && rec.month) {
    const key = `${rec.year}-${String(rec.month).padStart(2, "0")}`;
    if (!timelineByMonth[key]) timelineByMonth[key] = [];
    timelineByMonth[key].push(rec);
  }
}

const monthsDir = path.join(p.brainDir, "months");
ensureDir(monthsDir);

const monthlyStats = {};

for (const [year, records] of Object.entries(timelineByYear)) {
  writeJson(path.join(p.brainDir, `timeline-${year}.json`), {
    generated_at: generatedAt,
    year: Number(year),
    conversation_count: records.length,
    first_conversation: records[0] || null,
    last_conversation: records[records.length - 1] || null,
    records
  });
}

for (const [key, records] of Object.entries(timelineByMonth)) {
  monthlyStats[key] = records.length;
  writeJson(path.join(monthsDir, `${key}.json`), {
    generated_at: generatedAt,
    month: key,
    conversation_count: records.length,
    first_conversation: records[0] || null,
    last_conversation: records[records.length - 1] || null,
    records
  });
}

writeJson(path.join(p.brainDir, "monthly-stats.json"), {
  generated_at: generatedAt,
  monthly_counts: monthlyStats
});

// Split verbatims by month for exact-quote retrieval without huge-file scanning.
const verbatimsByMonth = {};
for (const rec of verbatims) {
  const timestamp = rec.created || rec.updated || "";
  const key = timestamp ? timestamp.slice(0, 7) : "unknown";
  if (!verbatimsByMonth[key]) verbatimsByMonth[key] = [];
  verbatimsByMonth[key].push(rec);
}

const verbatimsDir = path.join(p.brainDir, "verbatims");
ensureDir(verbatimsDir);

for (const [key, records] of Object.entries(verbatimsByMonth)) {
  const year = key === "unknown" ? "unknown" : key.slice(0, 4);
  const yearDir = path.join(verbatimsDir, year);
  ensureDir(yearDir);
  writeJson(path.join(yearDir, `${key}.json`), {
    generated_at: generatedAt,
    month: key,
    message_count: records.length,
    records
  });
}

const manifest = {
  name: "GafBrain",
  version: "2.0.0",
  generated_at: generatedAt,
  raw_root: path.relative(p.root, p.rawDir),
  canonical_output: path.relative(p.root, p.brainDir),
  source_files: loaded.files.map(f => path.relative(p.root, f)),
  conversation_count: index.length,
  message_count: totalMessageCount,
  outputs: {
    lookup_guide: "Brain/LOOKUP_GUIDE.md",
    bootstrap: "Brain/START HERE - GafBrain.md",
    master_index: "Brain/GAFBRAIN_INDEX.md",
    search_index: "Brain/search-index.json",
    verbatims: "Brain/verbatims.json",
    timeline: "Brain/timeline.json",
    timeline_by_year: Object.keys(timelineByYear).map(y => `Brain/timeline-${y}.json`),
    timeline_by_month_dir: "Brain/months/",
    monthly_stats: "Brain/monthly-stats.json",
    verbatims_by_month_dir: "Brain/verbatims/",
    normalized_markdown_dir: "Brain/ChatGPT/normalized/"
  },
  tested_with: [
    "ChatGPT Google Drive connector",
    "Claude Google Drive connector",
    "Gemini Google Workspace / Google Drive"
  ]
};

writeJson(path.join(p.brainDir, "MANIFEST.json"), manifest);

// Disposable AI upload bundle: small, high-value files only.
const aiUploadDir = path.join(p.brainDir, "AI_UPLOAD");
emptyDirectory(aiUploadDir);
const copyToAiUpload = (rel) => {
  const src = path.join(p.brainDir, rel);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(aiUploadDir, path.basename(rel)));
};
for (const rel of [
  "START HERE - GafBrain.md",
  "LOOKUP_GUIDE.md",
  "MANIFEST.json",
  "GAFBRAIN_INDEX.md",
  "monthly-stats.json",
  "timeline.json"
]) copyToAiUpload(rel);
for (const y of Object.keys(timelineByYear)) copyToAiUpload(`timeline-${y}.json`);

console.log(`Found ${loaded.files.length} conversation export file(s).`);
console.log(`Compiled ${index.length} conversations and ${totalMessageCount} messages.`);
console.log(`Raw: ${path.relative(p.root, p.rawDir)}`);
console.log(`Markdown: ${path.relative(p.root, p.normalizedDir)}`);
console.log(`Brain: ${path.relative(p.root, p.brainDir)}`);
console.log(`Timeline by year: ${Object.keys(timelineByYear).join(", ") || "none"}`);
console.log(`Timeline by month: ${Object.keys(timelineByMonth).length} file(s)`);
console.log(`AI upload bundle: ${path.relative(p.root, aiUploadDir)}`);
