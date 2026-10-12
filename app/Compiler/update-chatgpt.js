import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { paths, ensureDir } from "./helpers.js";

const p = paths();
const sourceArg = process.argv.slice(2).join(" ").trim();

if (!sourceArg) {
  console.error(`
Usage:

npm run update:chatgpt -- "/path/to/unzipped/ChatGPT export"

This will:
- permanently preserve workspace/Raw/AI/ChatGPT/Historical
- stage and verify the new ChatGPT export
- replace the previous current export
- NOT create redundant rolling archives
- rebuild GafBrain
- rebuild the external file catalog
- run status checks
`);
  process.exit(1);
}

const sourceDir = path.resolve(sourceArg);
const rawDir = path.join(p.rawDir, "AI", "ChatGPT");
const historicalDir = path.join(rawDir, "Historical");
const stagingDir = path.join(p.rawDir, "AI", "ChatGPT.__incoming");

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`Source folder not found: ${sourceDir}`);
  process.exit(1);
}

ensureDir(rawDir);
ensureDir(historicalDir);

/*
 * Stage the new export first.
 *
 * We do NOT touch the current export until the new export has been
 * successfully copied. Historical is never included in this staging area.
 */
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}

fs.cpSync(sourceDir, stagingDir, {
  recursive: true,
  force: true
});

if (!fs.existsSync(stagingDir) || fs.readdirSync(stagingDir).length === 0) {
  console.error("New ChatGPT export could not be staged. Current export was not changed.");
  process.exit(1);
}

/*
 * Remove the previous CURRENT export only.
 * Historical contains rescued conversations no longer available from
 * ChatGPT and must survive every update.
 */
const preservedNames = new Set(["Historical"]);

for (const name of fs.readdirSync(rawDir)) {
  if (preservedNames.has(name)) continue;

  fs.rmSync(path.join(rawDir, name), {
    recursive: true,
    force: true
  });
}

/*
 * Move the staged export into the live Raw/AI/ChatGPT directory.
 */
for (const name of fs.readdirSync(stagingDir)) {
  const from = path.join(stagingDir, name);
  const to = path.join(rawDir, name);

  fs.renameSync(from, to);
}

fs.rmSync(stagingDir, {
  recursive: true,
  force: true
});

function run(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}\n`);

  const result = spawnSync(command, args, {
    cwd: p.root,
    stdio: "inherit",
    shell: false
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log(`Replaced current ChatGPT export with: ${sourceDir}`);
console.log(`Preserved historical conversations in: ${path.relative(p.root, historicalDir)}`);
console.log("Rolling ChatGPT export archives: disabled");

run("npm", ["run", "build"]);
run("npm", ["run", "catalog:files"]);
run("npm", ["run", "brain:status"]);

console.log("\n✓ GafBrain update complete.");
