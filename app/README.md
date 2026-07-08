# GafBrain App v2.0

Persistent Memory compiler for AI-native Personal Archives.

## Run from repository root

```bash
npm run init
npm run all
npm run recall -- "search terms"
npm run context -- "question or topic"
npm run brief -- "topic"
npm run ask -- "when did we first discuss X"
```

## Canonical structure

```text
Raw/       immutable export files
Brain/     generated AI-facing memory
app/       replaceable framework code
```

## Generated retrieval files

```text
Brain/MANIFEST.json
Brain/GAFBRAIN_INDEX.md
Brain/LOOKUP_GUIDE.md
Brain/search-index.json
Brain/verbatims.json
Brain/timeline.json
Brain/timeline-YYYY.json
Brain/months/YYYY-MM.json
Brain/monthly-stats.json
Brain/verbatims/YYYY/YYYY-MM.json
Brain/AI_UPLOAD/
```

## What retrieval means

GafBrain does not load every conversation into an AI.

It compiles a Personal Archive into small, AI-readable lookup files so the assistant can retrieve relevant history and reason over it.
