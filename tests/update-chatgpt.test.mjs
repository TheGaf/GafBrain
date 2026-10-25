import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const updater = path.join(project, "app/Compiler/update-chatgpt.js");

function scenario(name, content, npmExit, expectSuccess) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "gafbrain-ingest-test-"));
  try {
    const root = path.join(temp, "project");
    const raw = path.join(root, "workspace/Raw/AI/ChatGPT");
    const source = path.join(temp, "export");
    const bin = path.join(temp, "bin");
    fs.mkdirSync(raw, { recursive: true });
    fs.mkdirSync(source, { recursive: true });
    fs.mkdirSync(bin, { recursive: true });
    fs.writeFileSync(path.join(raw, "previous.txt"), "old raw");
    fs.mkdirSync(path.join(raw, "Historical"));
    fs.writeFileSync(path.join(raw, "Historical/saved.txt"), "important older conversations");
    fs.writeFileSync(path.join(source, "conversations-000.json"), content);
    const fakeNpm = path.join(bin, "npm");
    fs.writeFileSync(fakeNpm, `#!/bin/sh\nexit ${npmExit}\n`, { mode: 0o755 });
    const result = spawnSync(process.execPath, [updater, source], {
      encoding: "utf8",
      env: { ...process.env, GAFBRAIN_HOME: root, PATH: bin + path.delimiter + process.env.PATH }
    });
    assert.equal(result.status === 0, expectSuccess, `${name}: ${result.stdout}\n${result.stderr}`);
    assert.equal(fs.readFileSync(path.join(raw, "Historical/saved.txt"), "utf8"), "important older conversations");
    assert.equal(fs.existsSync(path.join(raw, "previous.txt")), !expectSuccess);
    if (expectSuccess) {
      assert.equal(fs.existsSync(path.join(raw, "conversations-000.json")), true);
      assert.equal(fs.existsSync(path.join(root, "workspace/Raw/AI/ChatGPT.__previous")), false);
    } else if (npmExit !== 0 && content.startsWith("[")) {
      assert.equal(fs.existsSync(path.join(root, "workspace/Raw/AI/ChatGPT.__failed")), true);
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

scenario("reject invalid staged JSON", "{not-json", 0, false);
scenario("successful replacement", JSON.stringify([{ id: "new-conversation", title: "Test" }]), 0, true);
scenario("failed build restores old raw", JSON.stringify([{ id: "new-conversation", title: "Test" }]), 1, false);
console.log("ChatGPT update smoke tests passed");
