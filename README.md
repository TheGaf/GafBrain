GafBrain Kit

This system turns Google Drive into long-term memory for ChatGPT.

It is designed to be extremely simple.

If you can create folders and run one terminal command, you can use this system.

------------------------------------------------------------

WHAT THIS IS

GafBrain Kit connects two things:

1. ChatGPT (reasoning)
2. Google Drive (storage)

A third component called the Compiler organizes the data stored in Google Drive so ChatGPT can use it as structured memory.

Together, this creates persistent memory for ChatGPT.

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

- ChatGPT exports
- notes
- text files stored in Google Drive

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

- Google Drive + ChatGPT is the only system tested. 
- The compiler organizes everything
- Do not store personal data in GitHub

------------------------------------------------------------

RESULT

You get:

- persistent memory for ChatGPT
- structured history of your conversations
- cross-session continuity
- searchable knowledge system

------------------------------------------------------------

END
