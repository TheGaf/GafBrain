# GafBrain App

The replaceable compiler/framework code for GafBrain **3.2.0-alpha**.

Run commands from the repository root using the root `package.json`:

```bash
npm run init
npm run build
npm run doctor
npm run recall -- "search terms"
npm run context -- "question or topic"
npm run brief -- "topic"
```

## Canonical structure

```text
workspace/Raw/                 immutable user-owned exports
workspace/Brain/               generated AI-facing memory
workspace/Archive/             older exports
app/                           replaceable framework code + templates
config/sources.example.json    safe example for optional file cataloging
```

The compiler never needs to publish personal Brain state into the tracked repository root.

## Generated retrieval files

Typical outputs include:

```text
workspace/Brain/MANIFEST.json
workspace/Brain/CURRENT_STATUS.json
workspace/Brain/GAFBRAIN_INDEX.md
workspace/Brain/LOOKUP_GUIDE.md
workspace/Brain/search-index.json
workspace/Brain/verbatims.json
workspace/Brain/timeline.json
workspace/Brain/timeline-YYYY.json
workspace/Brain/months/YYYY-MM.json
workspace/Brain/AI_UPLOAD/
```

GafBrain does not require loading every conversation into an AI at once. It builds smaller lookup files so relevant history can be found first and full conversation context opened only when needed.
