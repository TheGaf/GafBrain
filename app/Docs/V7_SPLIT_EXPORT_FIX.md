# v7 Split Export Fix

OpenAI exports may split conversations into multiple files:

```text
conversations-000.json
conversations-001.json
...
```

GafBrain auto-discovers all of these under:

```text
Raw/ChatGPT/
```

It also supports the older:

```text
conversations.json
```
