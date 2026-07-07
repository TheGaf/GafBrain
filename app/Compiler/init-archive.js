import path from "path";
import { paths, ensureDir, installTemplates } from "./helpers.js";

const p = paths();

for (const dir of [
  p.rawDir,
  p.exportDir,
  p.brainDir,
  p.archiveDir,
  p.releasesDir,
  p.normalizedDir,
  p.projectsDir,
  p.sessionsDir,
  p.reportsDir
]) ensureDir(dir);

const installed = installTemplates();

console.log("GafBrain initialized.");
console.log(`Root: ${p.root}`);
console.log(`Raw ChatGPT export folder: ${path.relative(p.root, p.exportDir)}`);
console.log(`Brain output folder: ${path.relative(p.root, p.brainDir)}`);
console.log(`Archive folder: ${path.relative(p.root, p.archiveDir)}`);
if (installed.length) {
  console.log("Installed templates:");
  for (const file of installed) console.log(`- ${file}`);
} else {
  console.log("Templates already exist; no personal files were overwritten.");
}
