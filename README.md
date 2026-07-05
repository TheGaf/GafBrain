GafBrain Kit

INSTALL GUIDE (READ THIS FIRST)

This is a 5-minute setup if you follow steps exactly.

------------------------------------------------------------

WHAT THIS IS

GafBrain turns:

Google Drive + ChatGPT + a local compiler

into a persistent memory system.

ChatGPT = reads memory
Google Drive = stores memory
Compiler = organizes memory

------------------------------------------------------------

REQUIREMENTS

You need:

- Google Drive account
- ChatGPT account
- Computer (Mac or PC)
- Terminal access
- Node.js installed

If Node.js is not installed:
https://nodejs.org

------------------------------------------------------------

STEP 1 — CREATE GOOGLE DRIVE FOLDER

Open:

https://drive.google.com

Create a folder named:

GafBrain

Do not rename it.

------------------------------------------------------------

STEP 2 — CREATE FOLDER STRUCTURE

Inside GafBrain, create:

- ChatGPT
- Brain
- Index
- Projects
- Sessions

Inside ChatGPT, create:

- export
- normalized

Do not add anything else.

------------------------------------------------------------

STEP 3 — EXPORT CHATGPT DATA

In ChatGPT:

Settings → Data Controls → Export Data

Download export file.

Unzip it.

Move exported files into:

GafBrain/ChatGPT/export

------------------------------------------------------------

STEP 4 — CONNECT CHATGPT TO GOOGLE DRIVE

In ChatGPT:

Settings → Connectors → Google Drive

Connect your account.

Grant access to your GafBrain folder.

------------------------------------------------------------

STEP 5 — DOWNLOAD THIS PROJECT

Download the GafBrain Kit ZIP.

Unzip it.

Open Terminal.

Go into the folder:

cd ~/Desktop/GafBrain-Kit

------------------------------------------------------------

STEP 6 — RUN THE COMPILER

Run exactly:

node app/Compiler/compile-chatgpt.js

Wait for it to complete.

------------------------------------------------------------

WHAT THE COMPILER DOES

The compiler:

1. Reads ChatGPT exports from Google Drive
2. Cleans and normalizes text
3. Extracts:
   - decisions
   - topics
   - people
   - projects
   - timeline events
4. Writes structured memory into:

GafBrain/Brain

5. Builds searchable index in:

GafBrain/Index

------------------------------------------------------------

HOW YOU USE IT

After setup, you only interact with ChatGPT:

- What did I decide about this?
- What have I said about this before?
- Summarize my past conversations
- Show my history with X

ChatGPT reads your Google Drive and reconstructs memory.

------------------------------------------------------------

RULES (IMPORTANT)

- The compiler organizes everything
- Do not store personal data in GitHub
- Do not modify folder structure

------------------------------------------------------------

DONE

If you followed steps correctly, the system is working.
