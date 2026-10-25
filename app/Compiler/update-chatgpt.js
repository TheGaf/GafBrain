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
const previousDir = path.join(p.rawDir, "AI", "ChatGPT.__previous");

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`Source folder not found: ${sourceDir}`);
  process.exit(1);
}

// Never allow an export source inside the managed raw directory or staging areas.
const inside = (parent, candidate) => {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};
if (inside(path.join(p.rawDir, "AI"), sourceDir) || inside(sourceDir, rawDir)) {
  console.error("Export source overlaps managed raw data. Choose a separate extracted export folder.");
  process.exit(1);
}
if (fs.existsSync(previousDir) || fs.existsSync(stagingDir)) {
  console.error("A previous/staged update directory exists. Inspect it before retrying; nothing was changed.");
  process.exit(1);
}
ensureDir(path.dirname(rawDir));

/*
 * Stage the new export first.
 *
 * We do NOT touch the current export until the new export has been
 * successfully copied. Historical is never included in this staging area.
 */
fs.cpSync(sourceDir, stagingDir, {
  recursive: true,
  force: true
});

if (!fs.existsSync(stagingDir) || fs.readdirSync(stagingDir).length === 0) {
  console.error("New ChatGPT export could not be staged. Current export was not changed.");
  process.exit(1);
}

// Validate the staged conversation splits BEFORE touching the current export.
// An arbitrary nonempty directory is not a valid ChatGPT export.
const stagedNames = fs.readdirSync(stagingDir);
const conversationFiles = stagedNames.filter(name =>
  name === "conversations.json" || /^conversations-\d+\.json$/.test(name)
);
if (!conversationFiles.length) {
  console.error("No conversation JSON files in staged export. Current export was not changed.");
  process.exit(1);
}
if (conversationFiles.includes("conversations.json") && conversationFiles.length > 1) {
  console.error("Mixed conversations.json and numbered splits. Current export was not changed.");
  process.exit(1);
}
for (const name of conversationFiles) {
  const sourceFile = path.join(sourceDir, name);
  const stagedFile = path.join(stagingDir, name);
  if (!fs.statSync(stagedFile).isFile() ||
      fs.statSync(stagedFile).size !== fs.statSync(sourceFile).size) {
    console.error(`Incomplete staged export file: ${name}. Current export was not changed.`);
    process.exit(1);
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(stagedFile, "utf8"));
    const conversations = Array.isArray(parsed) ? parsed
      : Array.isArray(parsed?.conversations) ? parsed.conversations
      : Array.isArray(parsed?.items) ? parsed.items : null;
    if (!conversations || conversations.length === 0) {
      throw new Error("Expected a non-empty conversation collection");
    }
  } catch (error) {
    console.error(`Invalid staged conversation file ${name}: ${error.message}`);
    console.error("Current export was not changed.");
    process.exit(1);
  }
}
console.log(`Validated ${conversationFiles.length} staged conversation file(s) before replacement.`);

/*
 * Keep the entire previous raw export available for rollback until the build
 * completes. Preserve Historical by copying it into staged raw before switch.
 */
const previousExists = fs.existsSync(rawDir);
const historicalSource = path.join(rawDir, "Historical");
if (fs.existsSync(historicalSource)) {
  fs.cpSync(historicalSource, path.join(stagingDir, "Historical"), {
    recursive: true, force: false, errorOnExist: true
  });
}
if (previousExists) fs.renameSync(rawDir, previousDir);
try {
  fs.renameSync(stagingDir, rawDir);
} catch (error) {
  if (previousExists && fs.existsSync(previousDir)) fs.renameSync(previousDir, rawDir);
  throw error;
}

function run(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}\n`);

  const result = spawnSync(command, args, {
    cwd: p.root,
    stdio: "inherit",
    shell: false
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status ?? "unknown"}`);
  }
}

console.log(`Activated ChatGPT export: ${sourceDir}`);
console.log(`Historical preserved in: ${path.relative(p.root, historicalDir)}`);

try {
  run("npm", ["run", "build"]);
  run("npm", ["run", "catalog:files"]);
  run("npm", ["run", "brain:status"]);
} catch (error) {
  console.error(`Update failed: ${error.message}`);
  const failedDir = path.join(p.rawDir, "AI", "ChatGPT.__failed");
  if (fs.existsSync(failedDir)) {
    console.error("Cannot roll back automatically: ChatGPT.__failed already exists.");
    process.exitCode = 1;
  } else if (previousExists && fs.existsSync(previousDir)) {
    fs.renameSync(rawDir, failedDir);
    fs.renameSync(previousDir, rawDir);
    console.error("Restored previous raw export; failed new export kept in ChatGPT.__failed.");
    try {
      run("npm", ["run", "build"]);
      console.error("Previous Brain rebuilt. Verify with npm run doctor.");
    } catch (restoreError) {
      console.error(`Previous Brain rebuild failed: ${restoreError.message}`);
    }
    process.exitCode = 1;
  } else {
    console.error("No previous raw export available for automatic rollback.");
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  if (previousExists) fs.rmSync(previousDir, { recursive: true, force: true });
  console.log("\\n✓ GafBrain update complete.");
}
