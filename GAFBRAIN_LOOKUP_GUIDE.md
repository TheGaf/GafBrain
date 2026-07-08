# GafBrain Lookup Guide

Use the smallest file that answers the question.

## Chronology questions

For questions about:
- first conversation
- fifth conversation
- nth conversation
- conversations by month
- conversations by date
- conversations between two dates
- conversation counts

Use:
- `timeline.json`
- `timeline-YYYY.json`
- `months/YYYY-MM.json` when available
- `monthly-stats.json` for counts

Do not use `CONVERSATION_TIMELINE.md` for chronology if structured JSON is available.

## Exact quote questions

For questions about:
- first mention
- original wording
- exact quote
- who said what

Use:
- `verbatims.json`
- `verbatims/YYYY/YYYY-MM.json` when available

## Topic questions

For questions about:
- projects
- themes
- tools
- people
- recurring ideas

Use:
- `search-index.json`
- `GAFBRAIN_INDEX.md` as a high-level map

## Full context

After finding the relevant record, open the normalized Markdown file listed in the `path` field.

## Operating rule

Use structured JSON files first. Use Markdown files for full context only after identifying the right record.
Do not summarize or critique GafBrain unless asked. Answer the user's question directly from the smallest available evidence file.
