# Compiler Design

GafBrain's compiler is intentionally simple.

## Input

Latest full ChatGPT export:

```text
workspace/Raw/AI/ChatGPT/
```

Supported conversation files include:

```text
conversations.json
conversations-000.json
conversations-001.json
...
```

## Output

```text
workspace/Brain/ChatGPT/normalized/
workspace/Brain/search-index.json
workspace/Brain/verbatims.json
workspace/Brain/timeline.json
workspace/Brain/months/
workspace/Brain/verbatims/
workspace/Brain/AI_UPLOAD/
```

## Philosophy

Raw is sacred. Brain is reproducible. Framework is replaceable.

Regenerate compiled memory from the latest full export.

## Retrieval rule

Use small structured lookup files first. Open normalized Markdown only when full conversation context is needed.

Non-text file cataloging is optional and separate from the core ChatGPT compiler.
