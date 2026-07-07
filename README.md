# GafBrain 3.0

> **GafBrain is a personal knowledge compiler that makes your accumulated knowledge available to any AI you choose—without transferring ownership of your data.**

Compile your conversations and personal data into a private Brain that ChatGPT, Claude, Gemini, and future AI assistants can search and reason over.

Your original files stay where you want them.

Your AI can change.

Your Brain stays yours.

---

# Current Status

**Version:** 3.0 Alpha

### Supported

✅ ChatGPT Archives

### In Progress

- Reddit
- Claude
- Google Drive

### Planned

- Gmail
- Photos
- GitHub
- LinkedIn
- Documents
- Presentations
- Code

---

# In 30 Seconds

Most AI assistants only know what you tell them today.

Meanwhile your knowledge is scattered across:

- ChatGPT
- Claude
- Google Drive
- Reddit
- Gmail
- GitHub
- Photos

GafBrain compiles those sources into one portable Brain.

```
Your Data

↓

GafBrain Compiler

↓

Your Brain

↓

ChatGPT
Claude
Gemini
Future AI
```

---

# Current Features

- ✅ ChatGPT archive compiler
- ✅ Conversation timeline
- ✅ Exact quote search
- ✅ Searchable conversation index
- ✅ AI upload bundle
- ✅ Local compiler
- ✅ Google Drive compatible
- ✅ Snapshot archive support

---

# Quick Start

## 1. Install Node.js

https://nodejs.org

---

## 2. Clone or download GafBrain

```
git clone ...
```

or download the ZIP.

---

## 3. Install

```bash
npm install
```

---

## 4. Initialize

```bash
npm run init
```

This creates your private workspace.

---

## 5. Add your ChatGPT export

Copy your exported conversation files into:

```
workspace/
    Raw/
        AI/
            ChatGPT/
```

Supported formats:

```
conversations.json
```

or

```
conversations-000.json
conversations-001.json
...
```

---

## 6. Build

```bash
npm run build
```

This will:

- discover exports
- normalize conversations
- build search indexes
- generate timelines
- create the AI upload bundle

---

## 7. Verify

```bash
npm run doctor
```

Expected:

```
✓ ChatGPT export found

✓ Brain created

✓ Search index

✓ Timeline

Ready for AI.
```

---

# Connect Your AI

Give your AI access to:

```
workspace/Brain/
```

Start with:

```
START HERE - GafBrain.md

LOOKUP_GUIDE.md
```

Suggested prompt:

```
Read START HERE - GafBrain.md and LOOKUP_GUIDE.md.

Use my GafBrain Brain as the source of truth.

Search structured JSON before Markdown.

If evidence is missing, say so instead of guessing.
```

---

# Example Questions

- What was my fifth conversation?
- When did I first mention GafBrain?
- When did I rename Mybrary?
- Show every April 2026 conversation.
- What projects have I worked on most?
- What themes keep appearing?

---

# Updating Your Brain

When you receive a new export:

1. Move the previous export into:

```
workspace/Archive/
```

2. Copy the new export into:

```
workspace/Raw/
```

3. Rebuild:

```bash
npm run build
```

Done.

---

# Commands

Initialize

```bash
npm run init
```

Build

```bash
npm run build
```

Verify

```bash
npm run doctor
```

Search

```bash
npm run search
```

Recall

```bash
npm run recall -- keyword
```

Status

```bash
npm run brain:status
```

---

# Folder Structure

```
GafBrain/

app/
workspace/

README.md
package.json
.gitignore
```

### app/

The public framework.

Replace this folder whenever a new version of GafBrain is released.

---

### workspace/

Your private knowledge.

Never commit this folder to GitHub.

```
workspace/

Raw/
Brain/
Archive/
Reports/
```

---

# Collections

GafBrain is organized around collections.

Current:

```
AI
    ChatGPT
```

Planned:

```
AI
    Claude
    Gemini

Social
    Reddit
    LinkedIn

Email
    Gmail

Files
    Google Drive

Photos

Code

Documents

Presentations
```

Each collection has its own compiler.

Every compiler contributes to the same Brain.

---

# Updating GafBrain

Updating GafBrain should never affect your personal data.

Replace:

```
app/
```

Leave:

```
workspace/
```

Your Brain will continue to work with the new compiler.

---

# Philosophy

```
Raw is sacred.

Brain is reproducible.

Framework is replaceable.

Your knowledge is permanent.
```

---

# License

MIT

Built by The Gaf.