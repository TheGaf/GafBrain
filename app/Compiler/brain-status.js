import fs from "fs";
import path from "path";
import { paths, findConversationFiles } from "./helpers.js";

const p = paths();
const checks = [
  ["Raw", p.rawDir],
  ["ChatGPT export", p.exportDir],
  ["ChatGPT conversation files", p.exportDir],
  ["Brain", p.brainDir],
  ["ChatGPT normalized", p.normalizedDir],
  ["Search index", path.join(p.brainDir, "search-index.json")],
  ["Timeline", path.join(p.brainDir, "timeline.json")],
  ["Manifest", path.join(p.brainDir, "MANIFEST.json")],
  ["AI upload", path.join(p.brainDir, "AI_UPLOAD")],
  ["Reports", p.reportsDir],
  ["Sessions", p.sessionsDir],
  ["Archive", p.archiveDir]
];
console.log("# GafBrain Status\n");
for (const [label, target] of checks) {
  const exists = fs.existsSync(target);
  let detail = "";
  if (label === "ChatGPT conversation files") detail = `${findConversationFiles(target).length} file(s)`;
  else if (exists && fs.statSync(target).isDirectory()) detail = `${fs.readdirSync(target).length} items`;
  else if (exists) detail = `${Math.round(fs.statSync(target).size / 1024)} KB`;
  console.log(`${exists ? "✓" : "✗"} ${label}: ${path.relative(p.root, target)} ${detail}`);
}
