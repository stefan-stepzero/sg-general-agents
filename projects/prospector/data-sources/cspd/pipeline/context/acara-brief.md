# ACARA Data Extraction Brief — CSPD

## Source Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/school-profile-2025.xlsx`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/enrolments-by-grade-2025.xlsx`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/acara-school-profile-2008-2025.xlsx`

## Dependency
Wait for `raw/school-names.json` to exist (from annual report agent).

## Output Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/raw/acara-extract.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/raw/acara-trends.json`

## Tools
```bash
python P:/Projects2/sg-general-agents/projects/prospector/data-sources/tools/filter_acara.py \
  .../school-profile-2025.xlsx --schools .../raw/school-names.json --output .../raw/acara-extract.json

python P:/Projects2/sg-general-agents/projects/prospector/data-sources/tools/acara_trends.py \
  .../acara-school-profile-2008-2025.xlsx --schools .../raw/school-names.json --output .../raw/acara-trends.json
```

## Task
1. Run the filter tool to extract CSPD schools from 2025 profile data
2. Run the trends tool for historical enrolment data
3. Verify: should match ~80 schools. If < 60, try alternative matching (state=NSW, sector=Catholic, western Sydney postcodes 2140-2200, 2745-2780, 2150-2180)
4. Review output for data quality issues

## Important
- ACARA data is authoritative — these are real numbers
- Do not modify the data, only filter and aggregate
- Document any schools that couldn't be matched
