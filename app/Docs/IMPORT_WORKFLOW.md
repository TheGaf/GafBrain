# Import Workflow

1. Move the previous export from `workspace/Raw/AI/ChatGPT/` into a dated folder under `workspace/Archive/`.
2. Put the latest full ChatGPT export conversation file(s) in:

```text
workspace/Raw/AI/ChatGPT/
```

3. From the GafBrain repository root, run:

```bash
npm run build
```

4. Normalized conversations are written to:

```text
workspace/Brain/ChatGPT/normalized/
```

5. AI-facing indexes, timelines and lookup files are written to:

```text
workspace/Brain/
```

Keep one current export set in Raw and archive older sets. Raw exports and generated Brain files are private and excluded from Git.
