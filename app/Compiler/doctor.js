import fs from "fs";
import path from "path";
import { paths, findConversationFiles } from "./helpers.js";

const p = paths();

function exists(file) {
  return fs.existsSync(file);
}

function sizeKb(file) {
  return Math.round(fs.statSync(file).size / 1024);
}

function ok(label, detail = "") {
  console.log(`✓ ${label}${detail ? " — " + detail : ""}`);
}

function warn(label, detail = "") {
  console.log(`⚠ ${label}${detail ? " — " + detail : ""}`);
}

function fail(label, detail = "") {
  console.log(`✗ ${label}${detail ? " — " + detail : ""}`);
}

console.log("\n# GafBrain Doctor\n");

let problems = 0;
const files = findConversationFiles(p.exportDir);

if (exists(p.rawDir)) ok("Raw archive folder found", path.relative(p.root, p.rawDir));
else { fail("Raw archive folder missing"); problems++; }

if (files.length) ok("ChatGPT export files found", `${files.length} file(s)`);
else { fail("No ChatGPT export files found", "put conversations.json or split conversation files in workspace/Raw/AI/ChatGPT"); problems++; }

if (exists(p.brainDir)) ok("Brain folder found", path.relative(p.root, p.brainDir));
else { fail("Brain folder missing"); problems++; }

const checks = [
  ["Manifest", path.join(p.brainDir, "MANIFEST.json")],
  ["Current status", path.join(p.brainDir, "CURRENT_STATUS.json")],
  ["Lookup guide", path.join(p.brainDir, "LOOKUP_GUIDE.md")],
  ["Start file", path.join(p.brainDir, "START HERE - GafBrain.md")],
  ["Search index", path.join(p.brainDir, "search-index.json")],
  ["Verbatims", path.join(p.brainDir, "verbatims.json")],
  ["Timeline", path.join(p.brainDir, "timeline.json")],
  ["AI upload bundle", path.join(p.brainDir, "AI_UPLOAD")]
];

for (const [label, file] of checks) {
  if (exists(file)) {
    const detail = fs.statSync(file).isFile() ? `${sizeKb(file)} KB` : path.relative(p.root, file);
    ok(label, detail);
  } else {
    fail(label, "not found; run npm run build");
    problems++;
  }
}

console.log("");

if (problems) {
  console.log(`Doctor found ${problems} problem(s). Fix them, then run npm run build again.\n`);
  process.exit(1);
}

console.log("Brain build is healthy.");
console.log("Next: give workspace/Brain to an AI that supports file or connected-drive search.");
console.log('Start with: Read "START HERE - GafBrain.md" and "LOOKUP_GUIDE.md".\n');
