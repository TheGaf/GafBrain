import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function paths() {
  const root = process.env.GAFBRAIN_HOME
    ? path.resolve(process.env.GAFBRAIN_HOME)
    : path.resolve(__dirname, "../..");

  const rawDir = process.env.GAFBRAIN_RAW_DIR
    ? path.resolve(process.env.GAFBRAIN_RAW_DIR)
    : path.join(root, "workspace", "Raw");

  const brainDir = process.env.GAFBRAIN_BRAIN_DIR
    ? path.resolve(process.env.GAFBRAIN_BRAIN_DIR)
    : path.join(root, "workspace", "Brain");

  const archiveDir = process.env.GAFBRAIN_ARCHIVE_DIR
    ? path.resolve(process.env.GAFBRAIN_ARCHIVE_DIR)
    : path.join(root, "workspace", "Archive");

  const releasesDir = path.join(root, "workspace", "Releases");
  const chatgptRawDir = path.join(rawDir, "AI", "ChatGPT");
  const normalizedDir = path.join(brainDir, "ChatGPT", "normalized");
  const reportsDir = path.join(brainDir, "Reports");
  const projectsDir = path.join(brainDir, "Projects");
  const sessionsDir = path.join(brainDir, "Sessions");

  return {
    root,
    appRoot: root,
    rawDir,
    brainDir,
    archiveDir,
    releasesDir,
    exportDir: chatgptRawDir,
    normalizedDir,
    reportsDir,
    projectsDir,
    sessionsDir,
    templatesDir: path.join(root, "templates"),
    // Compatibility aliases for older scripts. Brain is canonical.
    dataRoot: root,
    indexDir: brainDir,
    indexPath: path.join(brainDir, "search-index.json"),
    brainSearchIndexPath: path.join(brainDir, "search-index.json"),
    brainVerbatimsPath: path.join(brainDir, "verbatims.json"),
    brainTimelinePath: path.join(brainDir, "timeline.json")
  };
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function slugify(s) {
  return String(s || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "untitled";
}

export function cleanText(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return x.map(cleanText).join("\n");
  if (typeof x === "object") {
    if (x.text) return cleanText(x.text);
    if (x.parts) return cleanText(x.parts);
    if (x.content) return cleanText(x.content);
    if (x.result) return cleanText(x.result);
    return "";
  }
  return String(x);
}

export function getMessageText(content) {
  if (!content) return "";
  if (content.content_type === "text") return cleanText(content.parts || content.text || content);
  if (content.parts) return cleanText(content.parts);
  if (content.text) return cleanText(content.text);
  return cleanText(content);
}

export function extractMessagesFromMapping(conv) {
  const nodes = conv.mapping || {};
  const messages = [];
  for (const node of Object.values(nodes)) {
    const msg = node.message;
    if (!msg || !msg.content) continue;
    const role = msg.author?.role || "unknown";
    const text = getMessageText(msg.content);
    if (!text.trim()) continue;
    messages.push({
      role,
      text: text.trim(),
      create_time: msg.create_time || null
    });
  }
  messages.sort((a, b) => (a.create_time || 0) - (b.create_time || 0));
  return messages;
}

export function walkFiles(dir) {
  const files = [];
  function walk(p) {
    if (!fs.existsSync(p)) return;
    for (const item of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, item.name);
      if (item.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  walk(dir);
  return files;
}

export function findConversationFiles(dir) {
  const files = walkFiles(dir);
  const exact = files.filter(f => path.basename(f) === "conversations.json");
  const split = files.filter(f => /^conversations-\d+\.json$/i.test(path.basename(f)));
  return [...exact, ...split].sort((a, b) => a.localeCompare(b));
}

export function loadConversationExportFiles(dir) {
  const files = findConversationFiles(dir);
  if (!files.length) return { files: [], conversations: [] };

  const conversations = [];
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (Array.isArray(raw)) conversations.push(...raw);
    else if (Array.isArray(raw.conversations)) conversations.push(...raw.conversations);
    else if (raw.items && Array.isArray(raw.items)) conversations.push(...raw.items);
    else console.warn(`Skipped ${file}: unrecognized conversation export shape.`);
  }

  const seen = new Set();
  const deduped = [];
  for (const conv of conversations) {
    const id = stableId(conv);
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(conv);
  }

  return { files, conversations: deduped };
}

export function emptyDirectory(dir) {
  ensureDir(dir);
  for (const item of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, item), { recursive: true, force: true });
  }
}

export function removeGeneratedBrainOutputs(p) {
  // Safety rule: only delete generated outputs inside Brain. Never touch Raw.
  ensureDir(p.brainDir);
  const targets = [
    "AI_UPLOAD",
    "ChatGPT/normalized",
    "months",
    "verbatims",
    "GAFBRAIN_INDEX.md",
    "CONVERSATION_TIMELINE.md",
    "TIMELINE.md",
    "HISTORY.md",
    "PROJECT_INDEX.md",
    "MANIFEST.json",
    "search-index.json",
    "verbatims.json",
    "timeline.json",
    "monthly-stats.json"
  ];
  for (const rel of targets) {
    const full = path.join(p.brainDir, rel);
    if (!full.startsWith(p.brainDir)) throw new Error(`Unsafe generated-output path: ${full}`);
    fs.rmSync(full, { recursive: true, force: true });
  }
  for (const file of fs.existsSync(p.brainDir) ? fs.readdirSync(p.brainDir) : []) {
    if (/^timeline-\d{4}\.json$/.test(file)) fs.rmSync(path.join(p.brainDir, file), { force: true });
  }
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

export function copyIfMissing(src, dest) {
  if (!fs.existsSync(src) || fs.existsSync(dest)) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

export function installTemplates({ overwrite = false } = {}) {
  const p = paths();
  ensureDir(p.brainDir);
  const templateMap = [
    ["BOOTSTRAP.md", "START HERE - GafBrain.md"],
    ["LOOKUP_GUIDE.md", "LOOKUP_GUIDE.md"],
    ["PROFILE.md", "PROFILE.md"],
    ["CUSTOM_INSTRUCTIONS.md", "CUSTOM_INSTRUCTIONS.md"]
  ];

  const installed = [];
  for (const [templateName, outputName] of templateMap) {
    const src = path.join(p.templatesDir, templateName);
    const dest = path.join(p.brainDir, outputName);
    if (!fs.existsSync(src)) continue;
    if (!overwrite && fs.existsSync(dest)) continue;
    fs.copyFileSync(src, dest);
    installed.push(path.relative(p.root, dest));
  }
  return installed;
}

export function readIndex() {
  const p = paths();
  const file = p.brainSearchIndexPath;
  if (!fs.existsSync(file)) throw new Error("No search index found. Run npm run compile:chatgpt first.");
  return readJson(file);
}

export function scoreRecord(rec, terms) {
  const hay = `${rec.title}\n${rec.text}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    const titleBoost = rec.title.toLowerCase().includes(term) ? 20 : 0;
    const exactPhraseBoost = hay.includes(terms.join(" ")) ? 25 : 0;
    const count = hay.split(term).length - 1;
    score += count + titleBoost + exactPhraseBoost;
  }
  return score;
}

export function searchRecords(query, limit=20) {
  const index = readIndex();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = [];
  for (const rec of index.records || []) {
    const score = scoreRecord(rec, terms);
    if (score > 0) results.push({ score, rec });
  }
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(b.rec.updated).localeCompare(String(a.rec.updated));
  });
  return results.slice(0, limit);
}

export function readConversationMarkdown(rec) {
  const p = paths();
  const full = path.join(p.root, rec.path);
  if (fs.existsSync(full)) return fs.readFileSync(full, "utf8");
  return "";
}

export function excerptAround(text, query, size=1400) {
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let idx = -1;
  for (const term of terms) {
    idx = lower.indexOf(term);
    if (idx >= 0) break;
  }
  if (idx < 0) idx = 0;
  const start = Math.max(0, idx - Math.floor(size/3));
  return text.slice(start, start + size).trim();
}

export function dateFromUnix(ts) {
  return ts ? new Date(ts * 1000).toISOString() : "";
}

export function stableId(conv) {
  return conv.id || conv.conversation_id || crypto.createHash("sha1").update(JSON.stringify(conv).slice(0, 5000)).digest("hex");
}
