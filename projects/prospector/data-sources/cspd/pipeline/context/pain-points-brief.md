# Pain Points Brief — CSPD

## Input Files
- `assembled/profile.json`
- `assembled/scorecard.json`
- `assembled/signals.json`
- `assembled/lookalikes.json`
- `assembled/competitors.json`
- `assembled/market-solutions.json`

## Output File
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/analysis/pain-points.json`

## Coverage Check Taxonomy
- `P:/Projects2/sg-general-agents/projects/prospector/site/public/data/archetypes/edu-operator/taxonomy.json`

## CSPD-Specific Context

This is a Catholic diocesan school system. Generic "multi-site operator" pain points miss the unique pressures:

- **Mission vs market** — Catholic identity + enrolment competition
- **Parish governance** — schools embedded in parish communities
- **Government funding dependency** — 75% funded, politically exposed (Gonski)
- **Fee sensitivity** — $2-4K/yr, different demographic to independent schools
- **Religious formation** — teacher accreditation requirements beyond standard PD
- **Demographic shifts** — western Sydney growth, multicultural communities, non-Catholic families choosing Catholic schools
- **Regulatory layering** — NESA + Catholic sector + diocesan requirements
- **Safeguarding** — post-Royal Commission heightened scrutiny
- **Squeezed from both sides** — public schools (free) and independent schools (premium)

## Process

1. Read all assembled data
2. Identify gaps: scorecard "watch" or "gap" items, signals showing headwinds, areas where peers have invested but CSPD hasn't
3. Derive pain points from evidence, grouped by domain
4. Run coverage check against edu-operator taxonomy — note any major process areas with no pain points identified
5. For coverage-check additions, mark severity as "low" and note "identified via coverage check, limited direct evidence"

## Output Format
```json
{
  "name": "Catholic Schools Parramatta Diocese",
  "domains": [{
    "domain": "Teaching & Learning",
    "pain_points": [{
      "id": "...", "title": "...", "severity": "critical|significant|moderate|low",
      "evidence": "...", "unknowns": "...", "sources": ["..."]
    }]
  }]
}
```
