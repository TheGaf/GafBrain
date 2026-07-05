GafBrain Kit

INSTALL GUIDE (READ ONLY THIS FIRST)

This is a 5-minute setup.

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
- Mac or PC
- Terminal
- Node.js installed

If Node is not installed:
https://nodejs.org

------------------------------------------------------------

STEP 1 — CREATE GOOGLE DRIVE FOLDER

Open:

https://drive.google.com

Create folder:

GafBrain

Do NOT rename it.

------------------------------------------------------------

STEP 2 — CREATE FOLDER STRUCTURE

Inside GafBrain, create:

ChatGPT
Brain
Index
Projects
Sessions

Inside ChatGPT create:

export
normalized

STOP HERE. Do nothing else.

------------------------------------------------------------

STEP 3 — EXPORT CHATGPT DATA

In ChatGPT:

Settings → Data Controls → Export Data

Download export file.

Unzip it.

Move files into:

GafBrain/ChatGPT/export

------------------------------------------------------------

STEP 4 — CONNECT CHATGPT TO GOOGLE DRIVE

In ChatGPT:

Settings → Connectors → Google Drive

Connect your account.

Select access to GafBrain folder.

------------------------------------------------------------

STEP 5 — DOWNLOAD THIS PROJECT

Download the GafBrain Kit ZIP.

Unzip it.

Open Terminal.

Go into folder:

cd ~/Desktop/GafBrain-Kit

------------------------------------------------------------

STEP 6 — RUN THE COMPILER

Run exactly this:

node app/Compiler/compile-chatgpt.js

Wait until it finishes.

------------------------------------------------------------

WHAT HAPPENS WHEN YOU RUN IT

The compiler:

1. Reads ChatGPT exports from Google Drive
2. Cleans and organizes text
3. Extracts:
   - decisions
   - topics
   - people
   - projects
   - timeline events
4. Writes structured memory into:

GafBrain/Brain

5. Builds index in:

GafBrain/Index

------------------------------------------------------------

HOW YOU USE IT

After setup, you NEVER touch files manually.

You only ask ChatGPT:

- What did I decide about this?
- What have I said about this before?
- Summarize my past conversations
- Show my history with X

ChatGPT reads your Drive and reconstructs memory.

------------------------------------------------------------

RULES (IMPORTANT)

- The compiler organizes everything
- Do not store personal data in GitHub
- Do not modify folder structure

------------------------------------------------------------

DONE

If you followed steps, system is working.
