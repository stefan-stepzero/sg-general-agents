# Web Research Brief — CSPD

## Output File
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/raw/web-research.json`

## Task
Research CSPD from public web sources. Focus on 2024-2026 information not in the 2023 annual report.

## Search Queries
- "Catholic Schools Parramatta Diocese 2025"
- "CSPD Uplift framework"
- "Patrick Ellis Catholic Schools Parramatta"
- "Westmead Catholic primary school 2026"
- "Catholic Schools NSW funding 2025"
- "NESA Catholic schools requirements 2025"
- site:parra.catholic.edu.au

## What to Find
1. **Leadership changes** — especially Patrick Ellis as EGM Learning Outcomes (Dec 2025)
2. **New school announcements** — Westmead primary, others
3. **Uplift framework** — public presentations, media, conference talks
4. **Strategic plan** — 2024 five-year plan details
5. **Regulatory changes** — NESA, NSW education policy
6. **Funding news** — Gonski updates, CSNSW submissions
7. **Technology investments** — systems, platforms, digital strategy
8. **Media coverage** — positive or negative

## Output Format
```json
{
  "leadership": [{ "name": "...", "role": "...", "date": "...", "source_url": "...", "detail": "..." }],
  "new_schools": [{ "name": "...", "location": "...", "status": "...", "date": "...", "source_url": "..." }],
  "initiatives": [{ "name": "...", "detail": "...", "source_url": "..." }],
  "regulatory": [{ "change": "...", "impact": "...", "date": "...", "source_url": "..." }],
  "funding": [{ "detail": "...", "source_url": "..." }],
  "technology": [{ "detail": "...", "source_url": "..." }],
  "media": [{ "headline": "...", "date": "...", "sentiment": "positive|negative|neutral", "source_url": "...", "summary": "..." }]
}
```

## Rules
- Every item must have a source URL
- If a search returns nothing for a category, write an empty array
- Prioritise official sources over commentary
- Date everything
