# Import Workflow

1. Move the previous export from `Raw/ChatGPT/` into `Archive/ChatGPT-YYYY-MM-DD/`.
2. Put the latest full ChatGPT export JSON files in `Raw/ChatGPT/`.
3. From the GafBrain root, run:

```bash
npm run all
```

4. Normalized conversations are written to:

```text
Brain/ChatGPT/normalized/
```

5. AI-facing memory is written to:

```text
Brain/
```

Do not keep weekly export piles inside `Raw/ChatGPT/`. Keep one current export set there and archive older sets.
