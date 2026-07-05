# GafBrain Kit

A local-first memory engine that turns Google Drive + AI exports into structured long-term memory.

## Core Idea

ChatGPT = intelligence  
Google Drive = memory storage  
Compiler = structure engine  

---

## What this system does

- Ingests AI exports (ChatGPT / Claude / Gemini)
- Normalizes raw text into structured format
- Builds searchable memory index
- Generates timeline of events
- Maintains persistent “Brain” structure

---

## Folder Structure

app/
  Compiler/
    Core memory processing engine
  GafLoop/
    Runtime orchestration layer
  templates/
    Output formatting

config/
  System configuration

---

## How to use

1. Create Google Drive folder named GafBrain
2. Upload AI exports into ChatGPT/export
3. Connect Google Drive to ChatGPT
4. Run compiler locally:

node app/Compiler/compile-chatgpt.js

---

## Output

The compiler generates:

Brain/
- CORE.md
- WORKING.md
- DECISIONS.md
- PROJECTS.md
- TIMELINE.md

Index/
- searchable memory structure

---

## Rule

Never store personal data in GitHub.
Drive = memory.
GitHub = engine only.
