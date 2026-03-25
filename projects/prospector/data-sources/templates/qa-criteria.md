# Pipeline Output QA Criteria

A QA agent should run after the pipeline completes, checking every output file against these criteria. Any failure should be logged with the specific violation and the file/field that failed.

---

## 1. Source Traceability

- [ ] Every factual claim cites a specific source (document name, page number, URL, or dataset)
- [ ] No fact cites only our own generated files as the sole source (e.g. "scorecard.json" alone is not sufficient — it must chain back to an original source)
- [ ] Sources are real and verifiable — document names match files in `raw/` or `assembled/`
- [ ] Page numbers cited actually exist in the source PDF

## 2. No Hallucination

- [ ] Every named person actually holds the stated role (verify against web-research.json or annual report)
- [ ] Every named organisation actually exists
- [ ] Every peer programme/initiative cited actually exists (verify against market-solutions sources)
- [ ] Outcome numbers (e.g. "9.3 hours saved", "75% proficiency") match the cited source
- [ ] ACARA figures match the filtered dataset exactly — no rounding or approximation without noting it

## 3. Honest Uncertainty

- [ ] Every pain point has an "unknowns" field that is non-empty
- [ ] Severity ratings have explicit justification, not just the label
- [ ] Confidence ratings (high/medium/low) follow the defined criteria:
  - High: multiple independent sources + peer validation + timing signal
  - Medium: single source OR unvalidated peer approach OR inferred timing
  - Low: coverage-check derived, limited direct evidence
- [ ] No pain point rated "critical" without at least two independent sources
- [ ] Gaps and limitations are stated, not hidden

## 4. Logical Consistency

- [ ] Every opportunity traces back to a pain point in pain-points.json
- [ ] Market evidence in opportunities matches entries in market-solutions.json
- [ ] Scorecard "observed" values match profile key metrics
- [ ] Scorecard "benchmark" values cite a sector data source
- [ ] Scorecard status (on-track/watch/gap) is justified by the observed-vs-benchmark comparison
- [ ] No circular reasoning (e.g. "this is critical because the scorecard says it's a gap" when the scorecard status was set by the same agent)

## 5. Completeness

- [ ] All pipeline output files exist and contain valid JSON
- [ ] Profile has: entity, executive_summary, leadership_team, key_metrics, dimensions, gaps
- [ ] Scorecard has at least 5 categories with at least 2 metrics each
- [ ] Signals has both external and internal indicators
- [ ] Pain points cover at least 5 distinct domains
- [ ] Opportunities number between 3 and 10
- [ ] Market solutions include at least 3 peer solutions with outcomes
- [ ] Lookalikes include at least 3 organisations with research detail
- [ ] Summary/slides data covers all 5 slide types

## 6. Freshness & Relevance

- [ ] No data older than 3 years is presented without noting the date
- [ ] Web research includes at least some 2025-2026 findings
- [ ] Leadership names reflect the most recent known appointments
- [ ] Regulatory/funding references reflect current policy status

## 7. Persuasion Readiness

- [ ] Opportunities are specific enough to start a conversation (not generic "improve data analytics")
- [ ] "Who cares" names a specific role or person, not a department
- [ ] "Why now" cites a concrete timing signal, not "the market is moving"
- [ ] Implications in market solutions connect to something we could actually offer
- [ ] The executive summary would make sense to someone who hasn't read the full report

---

## QA Output Format

```json
{
  "qa_date": "2026-03-25",
  "org": "cspd",
  "overall_pass": true,
  "checks": [
    { "criterion": "source_traceability", "pass": true, "issues": [] },
    { "criterion": "no_hallucination", "pass": false, "issues": [
      { "file": "opportunities.json", "field": "opp-3.market_evidence", "issue": "CEWA LEADing Lights described as 'real-time' but source says 'aspirational'" }
    ]},
    ...
  ],
  "summary": "19/21 checks passed. 2 issues found in market evidence accuracy."
}
```
