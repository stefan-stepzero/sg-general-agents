# Annual Report Extraction Brief — CSPD

## Source Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/cspd-annual-report-2023.pdf` (29MB)
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/csnsw-annual-report-2024.pdf` (19MB)

## Output Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/raw/annual-report-extract.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/raw/school-names.json` (JSON array of school names — other agents depend on this)

## Tools
```bash
python P:/Projects2/sg-general-agents/projects/prospector/data-sources/tools/extract_pdf.py <pdf> --pages <range> --output <output>
python P:/Projects2/sg-general-agents/projects/prospector/data-sources/tools/extract_pdf.py <pdf> --search "keyword" --output <output>
```

Work in batches of 10-15 pages. Don't try to read the full PDF into context.

## What to Extract

### From CSPD Annual Report 2023:
1. **School list** — every school name with suburb and type (primary/secondary/K-12). Write separately to `raw/school-names.json` as a plain JSON array.
2. **System statistics** — total students, schools, staff, any financial figures
3. **Strategic priorities** — what they say they're focused on
4. **Uplift framework** — details on what it is, rollout plan, who leads it
5. **New schools** — openings, closures, planned schools
6. **Leadership** — names and roles
7. **Challenges acknowledged** — anything they admit is hard

### From CSNSW Annual Report 2024:
1. **Sector-wide statistics** — total Catholic schools in NSW, students, staff
2. **Funding information** — government funding, Gonski
3. **Sector challenges** — workforce, regulatory, funding
4. **Any Parramatta-specific references**

## Output Format
```json
{
  "cspd_report": {
    "school_list": [{ "name": "...", "suburb": "...", "type": "..." }],
    "system_stats": {},
    "strategic_priorities": [],
    "uplift_details": "...",
    "new_schools": [],
    "leadership": [{ "name": "...", "role": "..." }],
    "challenges": [],
    "raw_quotes": [{ "page": 1, "quote": "...", "topic": "..." }]
  },
  "csnsw_report": {
    "sector_stats": {},
    "funding": {},
    "challenges": [],
    "parramatta_references": []
  }
}
```
