# GafBrain

> **Your AI can change. Your Brain stays yours.**

GafBrain turns your exported ChatGPT history into portable memory you control.

Projects. Decisions. Ideas. Things you tried. Things you changed your mind about. Instead of starting from zero with every AI, you keep the history and let the AI search it.

The public framework is currently **3.2.0-alpha**.

---

# Two Ways In

## The easy version — no code

You can get most of the idea without running the compiler:

1. In ChatGPT go to **Settings → Data Controls → Export Data**.
2. Download the export when the email arrives.
3. Store it somewhere you control: Google Drive, Dropbox, iCloud, your own server, etc.
4. Remove passwords, API keys, private keys, tokens, recovery codes and other secrets.
5. Put [`MY_AI_BRAIN.md`](MY_AI_BRAIN.md) next to the exported files.
6. Give those files to an AI that supports file or connected-drive search.

That gives you portable memory without tying it to one AI company.

For smaller archives, this may be all you need. Large archives can become awkward for an AI to search directly; that is what the full compiler below is for.

---

# The Full GafBrain

```text
Your Data
    ↓
GafBrain Compiler
    ↓
Your Brain
    ↓
ChatGPT / Claude / Gemini / whatever comes next
```

GafBrain compiles your archive into a private Brain with:

- ChatGPT archive compilation
- normalized conversations
- conversation timeline
- exact quote search
- searchable conversation index
- AI upload bundle
- snapshot archive support
- local storage
- Google Drive-compatible storage

**Important distinction:** Google Drive can hold your GafBrain today. Compiling Google Drive itself as a source is separate work and is not currently the same thing as ChatGPT archive support.

---

# Current Support

### Supported source

- ✅ ChatGPT archives

### Planned / evolving source compilers

- Claude
- Gemini
- Reddit
- Gmail
- Google Drive content
- Photos
- GitHub
- LinkedIn
- Documents
- Presentations
- Code

The public repo is the framework. Your generated private Brain is your data and can evolve separately.

---

# Quick Start

## 1. Install Node.js

https://nodejs.org

## 2. Clone GafBrain

```bash
git clone https://github.com/TheGaf/GafBrain.git
cd GafBrain
```

Or download the ZIP.

## 3. Install

```bash
npm install
```

## 4. Initialize

```bash
npm run init
```

This creates your private workspace and installs the Brain instruction templates.

## 5. Add your ChatGPT export

Copy the exported conversation file(s) into:

```text
workspace/
    Raw/
        AI/
            ChatGPT/
```

Supported formats:

```text
conversations.json
```

or

```text
conversations-000.json
conversations-001.json
...
```

## 6. Build

```bash
npm run build
```

This discovers the export, normalizes conversations, builds indexes and timelines, and creates the Brain.

## 7. Verify

```bash
npm run doctor
```

---

# Connect Your AI

Give your AI access to:

```text
workspace/Brain/
```

Start with:

```text
START HERE - GafBrain.md
LOOKUP_GUIDE.md
```

Suggested prompt:

```text
Read "START HERE - GafBrain.md" and "LOOKUP_GUIDE.md".

Use my GafBrain as the source of truth for my history.
Search structured JSON before Markdown.
If evidence is missing, say so instead of guessing.
```

---

# Example Questions

- What did we decide about this?
- When did I first mention this project?
- Find the idea I had six months ago.
- How has my thinking on this changed?
- Show every conversation from a given month.
- Find my exact wording about something.
- Continue a project from where I left off.

---

# Updating Your Brain

When you receive a new ChatGPT export:

1. Move the previous export into `workspace/Archive/`.
2. Copy the new export into `workspace/Raw/AI/ChatGPT/`.
3. Rebuild:

```bash
npm run build
```

Done.

---

# Optional File Catalog

GafBrain can also build a metadata catalog of folders you explicitly choose.

Copy:

```text
config/sources.example.json
```

to:

```text
config/sources.json
```

and edit the local path. `config/sources.json` is gitignored.

By default the catalog is **metadata-first**: filename, relative path, type, size and dates. It does not copy CSV row values. CSV schema sampling must be explicitly enabled with:

```json
"content_sampling": true
```

Then run:

```bash
npm run catalog:files
```

---

# Commands

```bash
npm run init
npm run build
npm run doctor
npm run search -- "terms"
npm run recall -- "keyword"
npm run brain:status
npm run catalog:files
```

---

# Folder Structure

```text
GafBrain/
    app/
    config/
    workspace/
    README.md
    MY_AI_BRAIN.md
    package.json
    .gitignore
```

### `app/`

The public framework.

### `workspace/`

Your private knowledge and generated Brain.

**Never commit this folder to GitHub.** It is excluded by `.gitignore`.

```text
workspace/
    Raw/
    Brain/
    Archive/
    Releases/
```

---

# Security

Your archive can contain things you forgot you ever typed.

Before making it portable, remove actual secrets such as:

- passwords
- API keys
- private keys
- access tokens
- authentication cookies
- recovery codes

The Brain can remember that a credential exists and where you keep it securely. It should not contain the credential itself.

Local machine paths and source-folder configuration belong in `config/sources.json`, which is intentionally not tracked by Git.

---

# Philosophy

```text
Raw is sacred.
Brain is reproducible.
Framework is replaceable.
Your knowledge is permanent.
```

Your data is the source material.

Your Brain is yours.

The AI is just the interface.

---

# License

MIT

Built by The Gaf.
