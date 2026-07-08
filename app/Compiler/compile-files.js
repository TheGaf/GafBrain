import fs from "fs";
import path from "path";
import { paths, ensureDir, writeJson, walkFiles } from "./helpers.js";

const p = paths();
const generatedAt = new Date().toISOString();

const defaultFilesRoot = path.join(p.rawDir, "Files");
const outDir = path.join(p.brainDir, "Files");
const configPath = path.join(p.root, "config", "sources.json");

ensureDir(defaultFilesRoot);
ensureDir(outDir);

function loadFileSources() {
  if (!fs.existsSync(configPath)) {
    return [{ name: "Workspace Files", path: defaultFilesRoot }];
  }

  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const sources = Array.isArray(cfg.files) ? cfg.files : [];

  return sources
    .filter(src => src && src.path)
    .map(src => ({
      name: src.name || path.basename(src.path),
      path: path.resolve(src.path),
      exclude: src.exclude || []
    }));
}

const fileSources = loadFileSources();

function kindFor(file) {
  const ext = path.extname(file).toLowerCase().replace(".", "");
  if (["csv"].includes(ext)) return "csv";
  if (["json"].includes(ext)) return "json";
  if (["md", "txt"].includes(ext)) return "text";
  if (["pdf"].includes(ext)) return "pdf";
  if (["docx", "doc"].includes(ext)) return "document";
  if (["pptx", "ppt"].includes(ext)) return "presentation";
  if (["xlsx", "xls"].includes(ext)) return "spreadsheet";
  if (["js","ts","py","html","css","sh","sql","java","c","cpp","cs"].includes(ext)) return "code";
  if (["jpg","jpeg","png","gif","webp","heic"].includes(ext)) return "image";
  return ext || "unknown";
}

function parseCsvRows(raw, maxRows = 60) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cur.trim());
      cur = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cur.trim());
      cur = "";

      if (row.some(v => v !== "")) {
        rows.push(row);
        if (rows.length >= maxRows) break;
      }

      row = [];
      continue;
    }

    cur += ch;
  }

  if (rows.length < maxRows && (cur || row.length)) {
    row.push(cur.trim());
    if (row.some(v => v !== "")) rows.push(row);
  }

  return rows;
}

function detectColumnType(values) {
  const sample = values.filter(Boolean).slice(0, 25);
  if (!sample.length) return "empty";

  const dateCount = sample.filter(v => /^\d{4}-\d{2}-\d{2}/.test(v) || !Number.isNaN(Date.parse(v))).length;
  const urlCount = sample.filter(v => /^https?:\/\//i.test(v)).length;
  const emailCount = sample.filter(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)).length;
  const numberCount = sample.filter(v => /^-?\d+(\.\d+)?$/.test(v)).length;
  const idCount = sample.filter(v => /^[a-z]{1,6}[_-]?[a-z0-9]{3,}$/i.test(v)).length;
  const longTextCount = sample.filter(v => v.length > 120).length;

  const ratio = (n) => n / sample.length;

  if (ratio(urlCount) > 0.6) return "url";
  if (ratio(emailCount) > 0.6) return "email";
  if (ratio(dateCount) > 0.6) return "date";
  if (ratio(numberCount) > 0.8) return "number";
  if (ratio(longTextCount) > 0.3) return "long_text";
  if (ratio(idCount) > 0.6) return "id";

  return "text";
}

function inferDatasetName(file, headers) {
  const base = path.basename(file, path.extname(file)).toLowerCase();
  const h = headers.join(" ").toLowerCase();

  if (base.includes("reddit") || h.includes("subreddit") || h.includes("permalink")) return "reddit_export";
  if (h.includes("from_username") || h.includes("announcement_id")) return "reddit_export";
  if (h.includes("email") && h.includes("subject")) return "email_export";
  if (h.includes("url") && h.includes("title")) return "link_index";
  if (h.includes("created") || h.includes("modified")) return "file_or_activity_export";

  return base || "csv_dataset";
}

function parseCsvProfile(file) {
  const raw = fs.readFileSync(file, "utf8").slice(0, 750000);
  const parsedRows = parseCsvRows(raw, 60);
  const headers = (parsedRows[0] || []).map(x => x.replace(/^"|"$/g, ""));

  const rows = parsedRows.slice(1, 51);
  const sampleRecords = rows.slice(0, 5).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h || `column_${i + 1}`] = row[i] ?? ""; });
    return obj;
  });

  const columnProfiles = headers.map((h, i) => {
    const values = rows.map(row => row[i] || "");
    return {
      name: h || `column_${i + 1}`,
      type: detectColumnType(values),
      non_empty_sample_count: values.filter(Boolean).length,
      examples: [...new Set(values.filter(Boolean).slice(0, 5))].slice(0, 5)
    };
  });

  const types = new Set(columnProfiles.map(c => c.type));

  return {
    likely_dataset: inferDatasetName(file, headers),
    column_count: headers.length,
    columns: headers.slice(0, 100),
    column_profiles: columnProfiles.slice(0, 100),
    sampled_row_count: Math.max(0, parsedRows.length - 1),
    contains_dates: types.has("date"),
    contains_urls: types.has("url"),
    contains_emails: types.has("email"),
    contains_numbers: types.has("number"),
    contains_long_text: types.has("long_text"),
    sample_records: sampleRecords
  };
}

const files = [];

for (const source of fileSources) {
  if (!fs.existsSync(source.path)) {
    console.warn(`Skipped missing source: ${source.name} — ${source.path}`);
    continue;
  }

  for (const file of walkFiles(source.path)) {
    if (path.basename(file).startsWith(".")) continue;
    files.push({ file, source });
  }
}


function shouldExclude(file, source) {
  const rel = path.relative(source.path, file);
  const rules = source.exclude || [];

  for (const rule of rules) {
    if (!rule.includes("*") && rel.split(path.sep).includes(rule))
      return true;

    if (rule.startsWith("*.") &&
        file.toLowerCase().endsWith(rule.slice(1).toLowerCase()))
      return true;
  }

  return false;
}

const records = files.filter(({file, source}) => !shouldExclude(file, source)).map(({ file, source }) => {
  const stat = fs.statSync(file);
  const rel = path.relative(p.root, file);
  const sourceRel = path.relative(source.path, file);
  const kind = kindFor(file);

  const rec = {
    id: Buffer.from(rel).toString("base64url"),
    source: "Files",
    source_name: source.name,
    source_root: source.path,
    source_relative_path: sourceRel,
    kind,
    name: path.basename(file),
    extension: path.extname(file).toLowerCase(),
    path: rel,
    folder: path.relative(p.root, path.dirname(file)),
    size_bytes: stat.size,
    created: stat.birthtime?.toISOString?.() || null,
    modified: stat.mtime?.toISOString?.() || null
  };

  if (kind === "csv") {
    try {
      rec.csv_profile = parseCsvProfile(file);
    } catch (e) {
      rec.csv_profile_error = String(e.message || e);
    }
  }

  return rec;
});

const byKind = {};
for (const rec of records) {
  if (!byKind[rec.kind]) byKind[rec.kind] = [];
  byKind[rec.kind].push(rec);
}

const recent = [...records].sort((a,b) => String(b.modified).localeCompare(String(a.modified))).slice(0, 250);

writeJson(path.join(outDir, "files-catalog.json"), {
  generated_at: generatedAt,
  sources: fileSources.map(s => ({ name: s.name, path: s.path })),
  file_count: records.length,
  records
});

writeJson(path.join(outDir, "files-by-kind.json"), {
  generated_at: generatedAt,
  kinds: Object.fromEntries(Object.entries(byKind).map(([k,v]) => [k, v.length])),
  records_by_kind: byKind
});

writeJson(path.join(outDir, "files-recent.json"), {
  generated_at: generatedAt,
  file_count: recent.length,
  records: recent
});

console.log(`# GafBrain Files Catalog`);
console.log(`Scanned sources:`);
for (const source of fileSources) console.log(`- ${source.name}: ${source.path}`);
console.log(`Files: ${records.length}`);
console.log(`Kinds: ${Object.entries(byKind).map(([k,v]) => `${k}:${v.length}`).join(", ") || "none"}`);
console.log(`Output: ${path.relative(p.root, outDir)}`);
