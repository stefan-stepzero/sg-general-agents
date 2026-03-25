# Peers Research Brief — CSPD

## Input Files
- `assembled/profile.json`

## Output Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/lookalikes.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/competitors.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/market-solutions.json`

## CSPD Context

CSPD is a Catholic diocesan school system operating 80 schools in western Sydney. Key properties for peer matching:
- Catholic systemic school system (not independent)
- Government-funded (~75%), low-fee ($2-4K/yr)
- K-12, multi-site
- High-growth demographic corridor
- Launched evidence-based teaching reform (Uplift)
- Multicultural student population (high LBOTE)

## Likely Lookalikes (research these)
- Melbourne Archdiocese Catholic Schools (MACS) — largest Catholic system in Victoria
- Sydney Catholic Schools (Archdiocese) — neighbouring diocese
- Brisbane Catholic Education (BCE) — comparable scale
- Catholic Education Canberra-Goulburn (CECG) — recent strategic investments
- Catholic Education Western Australia (CEWA) — digital strategy leader

## Likely Competitors (research these)
- NSW Department of Education — free alternative, massive building program
- Independent schools in western Sydney — premium alternative
- Sydney Catholic Schools — overlapping catchment for some families

## For each peer, find:
- Annual reports or strategic plans (search: "[org name] annual report 2024")
- What they've invested in recently
- What worked and what didn't
- Anything relevant to CSPD's challenges (Uplift-like programs, SIS rollouts, workforce strategies, parent engagement tools)

## Market Solutions Format
```json
{
  "name": "Catholic Schools Parramatta Diocese",
  "solutions": [{
    "org_name": "...", "relationship": "lookalike|competitor",
    "pain_addressed": "...", "solution": "...", "detail": "...",
    "outcome": "successful|mixed|failed|unknown", "source": "...",
    "implication": "..."
  }],
  "patterns": [{ "label": "...", "detail": "...", "count": 3 }],
  "gaps": ["pain points no peer has addressed"]
}
```
