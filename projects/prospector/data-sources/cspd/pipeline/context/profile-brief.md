# Profile & Scorecard Brief — CSPD

## Input Files
- `raw/annual-report-extract.json`
- `raw/acara-extract.json`
- `raw/acara-trends.json`
- `raw/web-research.json`

## Output Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/profile.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/scorecard.json`

## Profile

Assemble from extracted data. Prioritise sources: ACARA (authoritative) > Annual Report (published) > Web Research (recent).

Key metrics should use ACARA figures (real numbers, no "Estimates" disclaimer needed).

```json
{
  "entity": "Catholic Schools Parramatta Diocese",
  "profile_date": "2026-03-25",
  "website": "https://www.parra.catholic.edu.au",
  "executive_summary": "...",
  "known_contact": { "name": "...", "role": "..." },
  "leadership_team": [{ "name": "...", "title": "...", "source": "..." }],
  "key_metrics": [
    { "label": "...", "value": "...", "context": "...", "source": "ACARA 2025" }
  ],
  "dimensions": {},
  "gaps": []
}
```

## Scorecard

Framing: **Observed** (from data) vs **Benchmark** (sector norms).

Categories: Enrolment Health, Academic Outcomes, Financial Sustainability, Workforce & Talent, Compliance & Safeguarding, Catholic Mission & Community, Technology & Data.

For benchmarks use:
- NSW Catholic sector averages (from CSNSW report in annual-report-extract)
- National Catholic averages (from ACARA data filtered to sector=Catholic)
- NSW state averages where relevant

Status (strong/on-track/watch/gap/at-risk) must be justified by the benchmark comparison.

```json
{
  "title": "Strategic Scorecard",
  "subtitle": "Outside-in assessment. Observed values from public data; benchmarks from sector norms.",
  "categories": [{ "id": "...", "label": "...", "icon": "...", "metrics": [...] }]
}
```
