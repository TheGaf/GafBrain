# Updating ChatGPT History in GafBrain 3.2

This is the **repeatable ingestion workflow** for GafBrain 3.2.0-alpha. It uses the existing `npm run update:chatgpt` command. **Do not follow older instructions to manually rotate `workspace/Archive/` and then run `npm run build` for a normal update.**

## What the updater expects

- An **extracted directory** containing a ChatGPT export, not the original ZIP.
- At least one `conversations.json` or `conversations-NNN.json` file.
- Node.js and npm available on the machine holding your GafBrain project.
- Enough free space for extraction, a full staging copy, and a separate backup of the old current export.
- The current GafBrain workspace backed up independently before using the updater.

The command uses the local project directory: run it from the directory containing `package.json`.

## Each new export: step by step

### 1. Download and preserve the original ZIP

In ChatGPT, use **Settings → Data Controls → Export Data**. Download the export ZIP and keep it somewhere outside `workspace/`. The original ZIP is your independently recoverable new source.

### 2. Extract to a separate directory

The following is an example using a `~/Downloads` location on macOS. Replace the paths with your actual names; quote paths containing spaces.

```bash
mkdir -p "$HOME/Downloads/gafbrain-new-export"
unzip -q "/path/to/chatgpt-export.zip" -d "$HOME/Downloads/gafbrain-new-export"
```

Make sure the conversation JSON files are directly inside the folder you will pass to the updater. If the ZIP creates an extra enclosing directory, use that inner folder instead.

```bash
find "$HOME/Downloads/gafbrain-new-export" -maxdepth 2 \
  \( -name 'conversations.json' -o -name 'conversations-*.json' \) -print
```

### 3. Check free space

```bash
df -h "$HOME/Downloads" .
```

A multi-gigabyte export requires substantially more than its compressed ZIP size because the updater stages an additional copy.

### 4. Back up the current raw export BEFORE updating

From the GafBrain project root:

```bash
mkdir -p "$HOME/Downloads/gafbrain-previous-raw-backup"
rsync -av --progress \
  "workspace/Raw/AI/ChatGPT/" \
  "$HOME/Downloads/gafbrain-previous-raw-backup/"
```

**macOS compatibility:** Apple's built-in `rsync` may not support `--info=progress2`; use `--progress` as shown.

Verify using a checksum-based dry run:

```bash
rsync -an --checksum --stats \
  "workspace/Raw/AI/ChatGPT/" \
  "$HOME/Downloads/gafbrain-previous-raw-backup/"
```

The reported **Number of files transferred** should be **0**. Keep the backup and new ZIP until the update is validated.

**Privacy:** Store backups securely. They contain the original conversation history and potentially sensitive attachments. Do not add them to Git.

### 5. Run the built-in updater

From the GafBrain root:

```bash
npm run update:chatgpt -- "$HOME/Downloads/gafbrain-new-export"
```

The updater copies the extracted source to a temporary staging area, replaces the *current* contents of `workspace/Raw/AI/ChatGPT/` while retaining its `Historical/` folder, and then runs:

```text
npm run build
npm run catalog:files
npm run brain:status
```

`npm run build` already includes `npm run doctor`. **The external file catalog step uses your local catalog configuration, if configured.**

**Recovery behavior (updated importer):** The updater retains the previous raw export during rebuild. If build/catalog/status fails, it attempts to restore the previous raw directory and rebuild the previous Brain, keeping the failed new export in `workspace/Raw/AI/ChatGPT.__failed/` for inspection. This is not a substitute for an independently verified backup: interruption, permissions, and disk failure can defeat automatic recovery. Stop and inspect any failure before retrying.

### 6. Validate the result

Check output for `Compiled ... conversations and ... messages`, `GafBrain Doctor`, and the final successful update message.

You can also run:

```bash
npm run doctor
npm run brain:status
```

For a quick index metadata check (no full index parsing), from the project root:

```bash
node -e 'const s=require("./workspace/Brain/CURRENT_STATUS.json"); console.log(s.generated_at, s.conversation_count, s.message_count)'
```

Compare counts and the most recent conversation's **updated** date against the new export. Counts need not always increase (deletions, merges, or exclusions may be real), so investigate unexpected drops instead of blindly declaring success.

### 7. Make AI tools aware of the new index

A tool that reads `workspace/Brain/search-index.json` on every request will see new data after rebuild. An app that keeps an in-memory copy or cached index must refresh its cache.

Each search record has **`created`** and **`updated`** timestamps. Search by `updated` when asking about the *latest work in an existing conversation*; search by `created` when asking when a conversation began. A discussion opened in an earlier year may have recent updates.

The index is retrieval evidence, not permission for an AI to invent titles, dates, or quotes. For full context, follow a result's `path` into the normalized Markdown conversation; use `verbatims.json` for exact quotes.

## If the update fails

1. **Stop.** Do not automatically rerun the importer.
2. Preserve logs, the new ZIP, extracted folder, and the verified previous backup. Check for `ChatGPT.__incoming`, `ChatGPT.__previous`, or `ChatGPT.__failed` alongside the live raw directory. Do not delete them automatically.
3. Inspect `workspace/Raw/AI/ChatGPT/` and run `npm run doctor` to understand the current state.
4. If the raw export needs restoration, **make an additional copy of the current failed state before restoring**. Carefully restore the backed-up current export; do not overwrite a valuable `Historical/` folder with older contents.
5. Rebuild from the restored source using `npm run build`, then verify with `npm run doctor`. If a local external file catalog is enabled, run `npm run catalog:files`.

Do not delete or overwrite the current data until the backup is confirmed. Avoid automated destructive recovery steps.

## What stays private

- `workspace/` and the generated Brain
- Export ZIPs, extracted files, previous raw backups
- `config/sources.json` and any machine-specific paths or credentials

Only framework source code and generic documentation belong in this public repository.

## Notes for maintainers

The update uses a staged directory and keeps the old raw directory until the new build succeeds; on an ordinary child-process failure it attempts raw-data rollback and rebuild. It is still **not crash-safe** or transactional across all outputs, and does not replace an independent backup. Existing `ChatGPT.__incoming`, `ChatGPT.__previous`, and `ChatGPT.__failed` directories must be inspected manually before retrying.
