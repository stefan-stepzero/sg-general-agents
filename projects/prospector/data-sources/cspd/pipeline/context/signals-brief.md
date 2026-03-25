# Signals Brief — CSPD

## Input Files
- `raw/web-research.json`
- `raw/annual-report-extract.json`
- `raw/acara-trends.json`

## Output File
- `P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/assembled/signals.json`

## Task

Assemble indicators, risks, and news from the extracted data.

Group indicators by: market, regulatory, workforce, technology, funding, demographic.

Each indicator: what it is, observed value, tailwind/headwind/watch/neutral, reasoning, source.

Risks (external and internal): label, severity 0-1 justified by evidence, reasoning with citations.

News: headline, date, summary, source URL.

## CSPD-Specific Context

Key signal areas to look for:
- Western Sydney population growth (demographic tailwind)
- NSW teacher shortage (workforce headwind)
- Gonski 2.0 funding certainty to 2029 (funding tailwind, but political risk)
- Post-Royal Commission safeguarding requirements (regulatory)
- NAPLAN reforms (curriculum/assessment)
- Patrick Ellis hire (leadership signal)
- Westmead primary opening (growth signal)
- NSW public school building program (competitive headwind)

## Output Format
```json
{
  "name": "Catholic Schools Parramatta Diocese",
  "external_indicators": [{ "category": "...", "indicator": "...", "value": "...", "signal": "positive|negative|watch|neutral", "detail": "...", "source": "..." }],
  "internal_indicators": [...],
  "external_risks": [{ "id": "...", "label": "...", "score": 0.7, "level": "high", "reasoning": "...", "domain": "...", "sub": "..." }],
  "internal_risks": [...],
  "news_items": [{ "headline": "...", "date": "...", "summary": "...", "source": "..." }]
}
```
