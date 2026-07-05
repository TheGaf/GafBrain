GafBrain Kit

This system turns Google Drive into long-term memory for ChatGPT.

It is designed to be extremely simple.

If you can create folders and run one terminal command, you can use this system.

------------------------------------------------------------

WHAT THIS IS

GafBrain Kit connects three things:

1. ChatGPT (reasoning)
2. Google Drive (storage)
3. Compiler (organization system)

Together they create persistent memory for AI.

------------------------------------------------------------

WHAT YOU NEED

- Google Drive account
- ChatGPT account
- A computer with Terminal
- Node.js installed

------------------------------------------------------------

STEP 1 - CREATE GOOGLE DRIVE FOLDER

Go to https://drive.google.com

Create a folder named:

GafBrain

------------------------------------------------------------

STEP 2 - CREATE FOLDERS INSIDE GOOGLE DRIVE

Inside GafBrain, create:

ChatGPT
Claude
Gemini
Brain
Index
Projects
Sessions

Inside ChatGPT create:

export
normalized

------------------------------------------------------------

STEP 3 - EXPORT CHATGPT DATA

Go to ChatGPT settings:

Settings → Data Controls → Export Data

Download and unzip the file.

Put exported files into:

GafBrain / ChatGPT / export

------------------------------------------------------------

STEP 4 - CONNECT GOOGLE DRIVE TO CHATGPT

In ChatGPT:

Settings → Connectors → Google Drive → Connect

Allow access to your GafBrain folder.

------------------------------------------------------------

STEP 5 - DOWNLOAD THIS PROJECT

Download the GafBrain Kit ZIP file and unzip it.

Open Terminal and go into the folder:

cd ~/Desktop/GafBrain-Kit

------------------------------------------------------------

STEP 6 - RUN THE COMPILER

Run this command:

node app/Compiler/compile-chatgpt.js

------------------------------------------------------------

WHAT THE COMPILER DOES

The compiler reads your Google Drive data and builds structured memory.

It processes:

- conversations
- notes
- exports
- text files

It outputs structured memory into:

GafBrain / Brain

------------------------------------------------------------

OUTPUT FILES

Brain contains:

CORE.md
WORKING.md
DECISIONS.md
PROJECTS.md
PEOPLE.md
TIMELINE.md
PRINCIPLES.md

Index contains searchable memory structure.

------------------------------------------------------------

HOW YOU USE IT

After setup, you ask ChatGPT:

- What did I decide about this?
- What have I said before about this topic?
- Summarize my past conversations
- Show my history with this project

ChatGPT uses Google Drive to retrieve your memory.

------------------------------------------------------------

IMPORTANT RULES

- Do not store personal data in GitHub
- Google Drive is your memory
- ChatGPT is your reasoning system
- The compiler organizes everything

------------------------------------------------------------

RESULT

You get:

- persistent AI memory
- structured history of your conversations
- cross-session continuity
- searchable personal knowledge system

------------------------------------------------------------

END
