# Synthesis Brief — CSPD

## Input Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/profile.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/scorecard.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/signals.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/lookalikes.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/competitors.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/market-solutions.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/analysis/pain-points.json`

## Output Files
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/analysis/opportunities.json`
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/analysis/summary.json`

## Opportunities

For each significant pain point (critical or significant severity), check:
1. Did any peer/competitor address this? (read market-solutions.json)
2. What was the outcome?
3. What could we help this org do — informed by the pain AND the market evidence?

Each opportunity must link: pain → market evidence → what we could do → why now → who cares.

### Output Format
```json
{
  "name": "Catholic Schools Parramatta Diocese",
  "opportunities": [{
    "id": "...",
    "title": "...",
    "pain_point": "description of the pain, citing evidence",
    "market_evidence": "what peers/competitors tried and what happened",
    "opportunity": "what we could help them do",
    "why_now": "timing signal from signals or profile data",
    "who_cares": { "buyer": "specific role/name", "user": "who'd use it day to day" },
    "confidence": "high|medium|low",
    "confidence_reasoning": "why this confidence level — what we know, what we don't",
    "sources": ["all cited sources cascaded from upstream"]
  }]
}
```

### Confidence Guide
- **High**: Pain confirmed by multiple sources + peer has validated the approach + timing signal exists
- **Medium**: Pain has evidence but from single source, OR peer tried but outcome unclear, OR timing is inferred not confirmed
- **Low**: Pain identified via coverage check, limited direct evidence, no peer validation

## Executive Summary

Produce data for a 5-slide deck. Read the profile and scorecard for slides 1-2, opportunities for slides 3-5.

### Output Format
```json
{
  "name": "Catholic Schools Parramatta Diocese",
  "slides": [
    {
      "id": "overview",
      "label": "Overview",
      "title": "org name",
      "subtitle": "executive summary from profile",
      "metrics": [{ "label": "...", "value": "...", "source": "..." }]
    },
    {
      "id": "competitive",
      "label": "Competitive Position",
      "position": "...",
      "position_detail": "...",
      "advantages": [{ "label": "...", "detail": "..." }],
      "vulnerabilities": [{ "label": "...", "detail": "..." }]
    },
    {
      "id": "opportunities",
      "label": "Top Opportunities",
      "items": [{ "title": "...", "pain": "...", "confidence": "..." }]
    },
    {
      "id": "why-now",
      "label": "Why Now",
      "items": [{ "title": "...", "signal": "..." }]
    },
    {
      "id": "stakeholders",
      "label": "Stakeholders",
      "buyers": [{ "name": "...", "opportunities": ["..."] }]
    }
  ]
}
```

## Rules
- Every opportunity must trace back to a pain point in pain-points.json
- Sources cascade — if the pain cites ACARA and the market solution cites a peer's annual report, the opportunity lists both
- Rank opportunities by confidence (high first)
- Maximum 8 opportunities — quality over quantity
