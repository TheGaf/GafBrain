import fs from "fs";
import path from "path";
import crypto from "crypto";
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
    return [{
      name: "Workspace Files",
      path: defaultFilesRoot,
      exclude: [],
      content_sampling: false
    }];
  }

  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const sources = Array.isArray(cfg.files) ? cfg.files : [];

  return sources
    .filter(src => src && src.path)
    .map(src => ({
      name: src.name || path.basename(src.path),
      path: path.resolve(src.path),
      exclude: src.exclude || [],
      content_sampling: src.content_sampling === true
    }));
}

const fileSources = loadFileSources();

function kindFor(file) {
  const ext = path.extname(file).toLowerCase().replace(".", "");
  if (ext === "csv") return "csv";
  if (ext === "json") return "json";
  if (["md", "txt"].includes(ext)) return "text";
  if (ext === "pdf") return "pdf";
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
  const longTextCount = sample.filter(v => v.length > 120).length;
  const ratio = n => n / sample.length;

  if (ratio(urlCount) > 0.6) return "url";
  if (ratio(emailCount) > 0.6) return "email";
  if (ratio(dateCount) > 0.6) return "date";
  if (ratio(numberCount) > 0.8) return "number";
  if (ratio(longTextCount) > 0.3) return "long_text";
  return "text";
}

function parseCsvProfile(file) {
  const raw = fs.readFileSync(file, "utf8").slice(0, 750000);
  const parsedRows = parseCsvRows(raw, 60);
  const headers = (parsedRows[0] || []).map(x => x.replace(/^"|"$/g, ""));
  const rows = parsedRows.slice(1, 51);

  const columnProfiles = headers.map((h, i) => {
    const values = rows.map(row => row[i] || "");
    return {
      name: h || `column_${i + 1}`,
      type: detectColumnType(values),
      non_empty_sample_count: values.filter(Boolean).length
    };
  });

  return {
    column_count: headers.length,
    columns: headers.slice(0, 100),
    sampled_row_count: Math.max(0, parsedRows.length - 1),
    column_profiles: columnProfiles.slice(0, 100)
  };
}

function shouldExclude(file, source) {
  const rel = path.relative(source.path, file);
  const rules = source.exclude || [];

  for (const rule of rules) {
    if (!rule.includes("*") && rel.split(path.sep).includes(rule)) return true;
    if (rule.startsWith("*.") && file.toLowerCase().endsWith(rule.slice(1).toLowerCase())) return true;
  }
  return false;
}

const candidates = [];
for (const source of fileSources) {
  if (!fs.existsSync(source.path)) {
    console.warn(`Skipped missing source: ${source.name}`);
    continue;
  }
  for (const file of walkFiles(source.path)) {
    if (path.basename(file).startsWith(".")) continue;
    if (shouldExclude(file, source)) continue;
    candidates.push({ file, source });
  }
}

const records = candidates.map(({ file, source }) => {
  const stat = fs.statSync(file);
  const sourceRel = path.relative(source.path, file);
  const kind = kindFor(file);
  const publicIdentity = `${source.name}\n${sourceRel}`;

  const rec = {
    id: crypto.createHash("sha256").update(publicIdentity).digest("hex").slice(0, 24),
    source: "Files",
    source_name: source.name,
    source_relative_path: sourceRel,
    kind,
    name: path.basename(file),
    extension: path.extname(file).toLowerCase(),
    folder: path.dirname(sourceRel) === "." ? "" : path.dirname(sourceRel),
    size_bytes: stat.size,
    created: stat.birthtime?.toISOString?.() || null,
    modified: stat.mtime?.toISOString?.() || null
  };

  // Privacy-first default: never copy row values or file content unless explicitly enabled.
  if (kind === "csv" && source.content_sampling) {
    try {
      rec.csv_profile = parseCsvProfile(file);
    } catch (e) {
      rec.csv_profile_error = String(e.message || e);
    }
  }

  return rec;
});

function tokenizeFileRecord(rec) {
  const text = [rec.name, rec.folder, rec.source_relative_path].join(" ").toLowerCase();
  return [...new Set(
    text
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3)
      .filter(w => ![
        "the","and","for","with","from","this","that","file","files",
        "image","images","copy","final","draft","new","old","src","app"
      ].includes(w))
  )];
}

function buildFileSummary(items) {
  const topics = {};
  const byKind = {};
  const bySource = {};
  const recent = [...items]
    .sort((a,b) => String(b.modified).localeCompare(String(a.modified)))
    .slice(0, 100);

  for (const rec of items) {
    byKind[rec.kind] = (byKind[rec.kind] || 0) + 1;
    bySource[rec.source_name] = (bySource[rec.source_name] || 0) + 1;

    for (const token of tokenizeFileRecord(rec)) {
      if (!topics[token]) topics[token] = [];
      if (topics[token].length < 100) {
        topics[token].push({
          name: rec.name,
          kind: rec.kind,
          source_relative_path: rec.source_relative_path,
          modified: rec.modified,
          size_bytes: rec.size_bytes
        });
      }
    }
  }

  return {
    generated_at: generatedAt,
    privacy_mode: "metadata-first",
    file_count: items.length,
    kind_counts: Object.fromEntries(Object.entries(byKind).sort((a,b) => b[1]-a[1])),
    source_counts: Object.fromEntries(Object.entries(bySource).sort((a,b) => b[1]-a[1])),
    recent_files: recent.map(rec => ({
      name: rec.name,
      kind: rec.kind,
      source_name: rec.source_name,
      source_relative_path: rec.source_relative_path,
      modified: rec.modified,
      size_bytes: rec.size_bytes
    })),
    topics
  };
}

const byKind = {};
for (const rec of records) {
  if (!byKind[rec.kind]) byKind[rec.kind] = [];
  byKind[rec.kind].push(rec);
}

const recent = [...records]
  .sort((a,b) => String(b.modified).localeCompare(String(a.modified)))
  .slice(0, 250);

writeJson(path.join(outDir, "files-catalog.json"), {
  generated_at: generatedAt,
  privacy_mode: "metadata-first",
  sources: fileSources.map(s => ({
    name: s.name,
    content_sampling: s.content_sampling
  })),
  file_count: records.length,
  records
});

writeJson(path.join(outDir, "files-by-kind.json"), {
  generated_at: generatedAt,
  privacy_mode: "metadata-first",
  kinds: Object.fromEntries(Object.entries(byKind).map(([k,v]) => [k, v.length])),
  records_by_kind: byKind
});

writeJson(path.join(outDir, "files-recent.json"), {
  generated_at: generatedAt,
  privacy_mode: "metadata-first",
  file_count: recent.length,
  records: recent
});

writeJson(path.join(outDir, "files-summary.json"), buildFileSummary(records));

console.log("# GafBrain Files Catalog");
console.log("Privacy mode: metadata-first");
for (const source of fileSources) {
  console.log(`- ${source.name}${source.content_sampling ? " (CSV schema sampling enabled)" : ""}`);
}
console.log(`Files: ${records.length}`);
console.log(`Kinds: ${Object.entries(byKind).map(([k,v]) => `${k}:${v.length}`).join(", ") || "none"}`);
console.log(`Output: ${path.relative(p.root, outDir)}`);
