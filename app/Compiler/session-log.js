import fs from "fs";
import path from "path";
import { paths, ensureDir } from "./helpers.js";

const p = paths();
const logPath = path.join(p.sessionsDir, "active-session.md");
const note = process.argv.slice(2).join(" ").trim();
if (!note) {
  console.error('Usage: npm run session:log -- "note to remember"');
  process.exit(1);
}
ensureDir(p.sessionsDir);
const stamp = new Date().toISOString();
const entry = `\n## ${stamp}\n\n${note}\n`;
if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, `# Active GafBrain Session\n\nStarted: ${stamp}\n`, "utf8");
fs.appendFileSync(logPath, entry, "utf8");
console.log(`Logged to ${path.relative(p.root, logPath)}`);
