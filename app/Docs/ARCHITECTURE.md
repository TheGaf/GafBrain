# Architecture

GafBrain is split into three zones.

## `workspace/Raw/`

Immutable user-owned exports. The compiler reads this folder but does not delete it.

ChatGPT exports live in:

```text
workspace/Raw/AI/ChatGPT/
```

## `workspace/Brain/`

Generated AI-facing memory. This folder is reproducible and can be rebuilt from Raw.

Generated personal status, indexes, timelines and lookup files stay here rather than in the tracked repository root.

## `app/`

Replaceable public framework code, docs and templates.

Templates live in:

```text
app/templates/
```

## Update principle

Framework updates may replace `app/` and public docs.

They should not ship, modify or publish user data from `workspace/Raw/` or `workspace/Brain/`.
